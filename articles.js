/* Efekt otwierania notatnika — postęp scrolla steruje obrotem okładki. */
(function () {
  var stage = document.querySelector('[data-notebook]');
  if (!stage) return;

  var staticCover = window.matchMedia('(max-width: 860px), (max-height: 650px), (prefers-reduced-motion: reduce)');
  var frame = 0;

  var last = -1;

  function update() {
    frame = 0;
    if (staticCover.matches) return;
    var rect = stage.getBoundingClientRect();
    var travel = rect.height - window.innerHeight;
    var progress;

    if (travel <= 0) {
      progress = rect.top <= 0 ? 1 : 0;
    } else {
      progress = Math.min(1, Math.max(0, -rect.top / travel));
      // lekkie wyhamowanie, żeby okładka nie "trzaskała" na końcu
      progress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    }

    // zapisujemy tylko przy realnej zmianie
    var rounded = Math.round(progress * 1000) / 1000;
    if (rounded === last) return;
    last = rounded;
    stage.style.setProperty('--nb-progress', String(rounded));
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  update();
})();
