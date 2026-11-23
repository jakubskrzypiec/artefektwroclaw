const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const source = readFileSync(resolve(__dirname, '../site-updates.js'), 'utf8');

function harness(fetchImpl, values = {}) {
  let handler;
  const classes = new Set();
  const status = { textContent: '', classList: { add: x => classes.add(x), remove: x => classes.delete(x) }, focus() {} };
  const submit = { disabled: false };
  const fields = new Map(Object.entries({ name: 'Test lokalny', email: 'test@example.com', message: 'Test bez wysyłki', ...values }));
  const form = {
    dataset: {}, valid: true, resetCount: 0,
    reportValidity() { return this.valid; },
    setAttribute() {}, removeAttribute() {},
    addEventListener(_, fn) { handler = fn; },
    querySelector: selector => selector === '.form-status' ? status : submit,
    reset() { this.resetCount++; fields.clear(); }
  };
  const document = { getElementById: () => form, querySelectorAll: () => [], addEventListener() {} };
  let calls = 0;
  vm.runInNewContext(source, {
    document, localStorage: { getItem: () => null }, AbortController,
    FormData: class { constructor() { this.data = new Map(fields); } get(k) { return this.data.get(k); } set(k,v) { this.data.set(k,v); } },
    fetch: async (...args) => { calls++; return fetchImpl(...args); },
    setTimeout: () => 1, clearTimeout() {}
  });
  return { form, status, submit, classes, fields, calls: () => calls, send: () => handler({ preventDefault() {} }) };
}

test('accepted request resets form only after positive API acknowledgement', async () => {
  const h = harness(async (url, options) => {
    assert.equal(url, 'https://formsubmit.co/ajax/studio@artefekt.pl');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('email'), 'test@example.com');
    return { ok: true, json: async () => ({ success: 'true' }) };
  });
  await h.send();
  assert.equal(h.form.resetCount, 1);
  assert.match(h.status.textContent, /przyjęta do wysyłki/);
  assert.equal(h.submit.disabled, false);
});

for (const [name, fetchImpl] of [
  ['service rejection', async () => ({ ok: true, json: async () => ({ success: 'false' }) })],
  ['HTTP error', async () => ({ ok: false, json: async () => ({ success: true }) })],
  ['network failure', async () => { throw new Error('offline'); }],
  ['invalid response', async () => ({ ok: true, json: async () => { throw new Error('not JSON'); } })]
]) test(`${name} keeps message and permits retry`, async () => {
  const h = harness(fetchImpl);
  await h.send();
  assert.equal(h.form.resetCount, 0);
  assert.equal(h.fields.get('message'), 'Test bez wysyłki');
  assert.ok(h.classes.has('is-error'));
  assert.equal(h.submit.disabled, false);
  assert.equal(h.form.dataset.sending, 'false');
});

test('pending request prevents duplicate submission', async () => {
  let finish;
  const h = harness(() => new Promise(resolve => { finish = resolve; }));
  const pending = h.send();
  assert.equal(h.submit.disabled, true);
  await h.send();
  assert.equal(h.calls(), 1);
  finish({ ok: true, json: async () => ({ success: true }) });
  await pending;
});

test('invalid fields and honeypot do not contact the service', async () => {
  const h = harness(() => { throw new Error('unexpected network'); });
  h.form.valid = false;
  await h.send();
  assert.equal(h.calls(), 0);
  const spam = harness(() => { throw new Error('unexpected network'); }, { _honey: 'bot' });
  await spam.send();
  assert.equal(spam.calls(), 0);
});
