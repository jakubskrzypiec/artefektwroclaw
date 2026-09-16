(function(){
  const host = document.querySelector('[data-blog-list]');
  if (!host) return;
  const posts = window.ARTEFEKT_BLOG || [];
  host.innerHTML = posts.map((post, index) => `
    <a class="nb-card" href="${post.href}">
      <span class="nb-card-no">${post.number || String(index + 1).padStart(2,'0')}</span>
      <h2>${post.title}</h2>
      <p>${post.excerpt}</p>
      <span class="nb-card-foot"><span>${post.meta || 'Blog Artefekt'}</span><b>Czytaj ↗</b></span>
    </a>`).join('');
})();
