/* Enhance the README preview only on Pages; GitHub keeps a regular link. */
'use strict';
(() => {
  let activeClose;
  const url = document.currentScript.dataset.demoUrl;
  function setup(cards) {
  if (!cards.length) return;
  const viewerId = 'texf-viewer-' + (new URL(cards[0].href).searchParams.get('asset') || 'promo-ashtray');
  const panel = document.createElement('section');
  panel.className = 'interactive-demo';
  const actions = document.createElement('div');
  actions.className = 'demo-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'Explore interactive comparison';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', viewerId);
  const full = document.createElement('a');
  full.href = url;
  full.textContent = 'Open full page ↗';
  actions.append(toggle, full);
  panel.append(actions);
  cards[0].closest('p').after(panel);
  cards.forEach(card => {
    const asset = new URL(card.href).searchParams.get('asset') || 'promo-ashtray';
    card.href = url + '?asset=' + encodeURIComponent(asset);
  });
  let frame;
  function close() {
    frame.remove(); frame = null;
    activeClose = null;
    toggle.textContent = 'Explore interactive comparison';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
  function open(href = cards[0].href) {
    if (activeClose) activeClose();
    frame = document.createElement('iframe');
    frame.id = viewerId;
    frame.title = 'Synchronized TexF texture comparison';
    frame.src = href + '&embed=1';
    panel.append(frame);
    full.href = href;
    toggle.textContent = 'Close comparison';
    toggle.setAttribute('aria-expanded', 'true');
    activeClose = close;
  }
  toggle.addEventListener('click', () => frame ? close() : open());
  cards.forEach(card => card.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); open(card.href);
  }));
  window.addEventListener('message', event => {
    if (!frame || event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'texf-demo-asset' && ['promo-ashtray', 'basket', 'police-station', 'hussar', 'memory-wooden-gramophone', 'memory-grey-knight', 'memory-police-station', 'memory-butterflies-collection'].includes(event.data.asset)) {
      full.href = url + '?asset=' + encodeURIComponent(event.data.asset);
    }
    if (event.data?.type === 'texf-demo-height' && Number.isFinite(event.data.height)) {
      frame.style.height = `${Math.max(300, Math.min(2400, event.data.height + 4))}px`;
    }
  });
  }
  document.querySelectorAll('.demo-gallery').forEach(gallery => setup([...gallery.querySelectorAll('.interactive-preview')]));
})();
