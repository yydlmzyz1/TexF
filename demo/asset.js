/* Separate image sets, one shared viewer. Switching models unloads the old set. */
'use strict';
(() => {
  const assets = {
    'promo-ashtray': { label: 'Promo Ashtray', root: 'data/' },
    basket: { label: 'Basket', root: 'data/basket/' },
    'police-station': { label: 'Police Station', root: 'data/police-station/' },
    hussar: { label: 'Hussar', root: 'data/hussar/' },
    'memory-wooden-gramophone': { label: 'Wooden Gramophone · GPU Memory', root: 'data/memory-wooden-gramophone/' },
    'memory-grey-knight': { label: 'Grey Knight · GPU Memory', root: 'data/memory-grey-knight/' },
    'memory-police-station': { label: 'Police Station · GPU Memory', root: 'data/memory-police-station/' },
    'memory-butterflies-collection': { label: 'Butterflies Collection · GPU Memory', root: 'data/memory-butterflies-collection/' }
  };
  const params = new URLSearchParams(location.search);
  const selected = Object.prototype.hasOwnProperty.call(assets, params.get('asset')) ? params.get('asset') : 'promo-ashtray';
  const info = assets[selected];
  document.body.dataset.root = info.root;
  document.getElementById('asset-title').textContent = info.label;
  document.title = `${info.label} · TexF Comparison`;
  document.getElementById('comparison-note').textContent = 'Quality metrics follow the paper’s evaluation protocol.';
  const select = document.getElementById('asset');
  select.value = selected;
  if (parent !== window) parent.postMessage({ type: 'texf-demo-asset', asset: selected }, location.origin);
  select.addEventListener('change', () => {
    params.set('asset', select.value);
    location.search = params.toString();
  });
})();
