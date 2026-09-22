/* Lightweight homepage motion; clicking still opens the lossless comparison. */
'use strict';
(() => {
  if (!('IntersectionObserver' in window)) return;
  const base = document.currentScript.dataset.assetsUrl;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = new Map();
  function update(item) {
    if (!item.visible || document.hidden || motion.matches) {
      item.video.pause();
      if (motion.matches) { item.video.hidden = true; item.image.hidden = false; }
      return;
    }
    if (!item.video.getAttribute('src')) item.video.src = item.src;
    item.video.play().catch(() => { item.video.hidden = true; item.image.hidden = false; });
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const item = items.get(entry.target);
      item.visible = entry.isIntersecting;
      update(item);
    }
  }, { threshold: 0.1 });
  document.querySelectorAll('.interactive-preview').forEach(card => {
    const image = card.querySelector('img');
    if (!image) return;
    const asset = new URL(card.href, location.href).searchParams.get('asset');
    if (!['promo-ashtray','basket','police-station','hussar','memory-wooden-gramophone',
          'memory-grey-knight','memory-police-station','memory-butterflies-collection'].includes(asset)) return;
    const video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true;
    video.preload = 'none'; video.width = 512; video.height = 288;
    video.poster = image.src; video.hidden = true;
    video.setAttribute('aria-hidden', 'true');
    const item = { video, image, visible: false, src: base + asset + '-preview.mp4' };
    video.addEventListener('playing', () => {
      if (!item.visible || document.hidden || motion.matches) { update(item); return; }
      image.hidden = true; video.hidden = false;
    });
    video.addEventListener('error', () => { video.hidden = true; image.hidden = false; });
    image.before(video);
    items.set(card, item); observer.observe(card);
  });
  document.addEventListener('visibilitychange', () => items.forEach(update));
  motion.addEventListener('change', () => items.forEach(update));
  window.addEventListener('pagehide', () => items.forEach(item => item.video.pause()));
})();
