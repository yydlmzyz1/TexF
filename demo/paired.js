/* Two pre-rendered panels, one shared angle and normalized crop. */
'use strict';
(async () => {
  const $ = id => document.getElementById(id), root = document.body.dataset.root;
  const sides = ['left', 'right'], mobile = window.matchMedia('(max-width: 700px)');
  let single = mobile.matches, manualLayout = false, ready = false;
  let manifest, resolution = '2048', frame = 0, count = 96;
  let zoom = 1, x = 0, y = 0, gesture = null, owner = null;
  let playing = false, raf = 0, lastTick = 0, request = 0, busy = false, generation = 0;
  const pointers = new Map(), cache = new Map(), urls = [], loaded = new Set();
  const methods = { left: 'gt', right: 'texf' };
  let details = [], detail = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = () => single ? ['right'] : sides;
  const pathFor = (method, index, size = resolution) => detail ? detail.files[method].path : `${size}/${method}/${String(manifest.frame_indices?.[index] ?? index).padStart(3, '0')}.webp`;
  function transform() {
    const limit = (zoom - 1) / 2;
    x = Math.max(-limit, Math.min(limit, x)); y = Math.max(-limit, Math.min(limit, y));
    sides.forEach(side => { $(side + '-image').style.transform = `translate(${x * 100}%, ${y * 100}%) scale(${zoom})`; });
    $('zoom-label').value = `${Number(zoom.toFixed(1))}×`;
    $('zoom-out').disabled = !ready || zoom <= 1; $('zoom-in').disabled = !ready || zoom >= 4;
    $('hint').textContent = zoom > 1 ? 'Drag to pan · Slider / ← → to rotate · Views stay synchronized' : 'Drag to rotate · Scroll / pinch to zoom';
    if (detail) $('hint').textContent = 'Fixed-view HD detail · Scroll / pinch to zoom';
  }
  function setZoom(value, anchor = { x: 0, y: 0 }) {
    const next = Math.max(1, Math.min(4, value)), ratio = next / zoom;
    x = anchor.x - (anchor.x - x) * ratio; y = anchor.y - (anchor.y - y) * ratio;
    zoom = next; transform();
  }
  function status() {
    if (!manifest) return;
    if (detail) {
      $('status').textContent = `${detail.box[2]-detail.box[0]} × ${detail.box[3]-detail.box[1]} crop from 2048 · lossless WebP`;
      return;
    }
    const prefixes = [...new Set(visible().map(side => `${resolution}/${methods[side]}/`))];
    const files = manifest.frames.filter(item => prefixes.some(prefix => item.path.startsWith(prefix)));
    const done = files.filter(item => loaded.has(item.path)).length;
    const bytes = files.reduce((sum, item) => sum + item.bytes, 0);
    $('status').textContent = `${resolution} × ${resolution} · ${done}/${files.length} frames loaded · ${(bytes / 1048576).toFixed(1)} MiB for selected views · lossless WebP`;
  }
  function load(key) {
    if (!cache.has(key)) cache.set(key, fetch(root + key).then(response => {
      if (!response.ok) throw new Error(key); return response.blob();
    }).then(blob => {
      const url = URL.createObjectURL(blob); urls.push(url); loaded.add(key); status(); return url;
    }).catch(error => { cache.delete(key); throw error; }));
    return cache.get(key);
  }
  async function show(index) {
    if (!ready) return;
    frame = detail ? detail.frame : (index % count + count) % count; $('angle').value = frame;
    const token = ++request, current = frame, size = resolution;
    const selected = visible().map(side => ({ side, method: methods[side] }));
    busy = true; $('panels').setAttribute('aria-busy', 'true');
    try {
      // Decode both before swapping either panel, avoiding mismatched angles.
      const images = await Promise.all(selected.map(async item => {
        const src = await load(pathFor(item.method, current, size));
        const image = new Image(); image.src = src; await image.decode();
        return { ...item, src };
      }));
      if (token !== request) return;
      for (const item of images) {
        const info = manifest.methods[item.method];
        $(item.side + '-image').src = item.src;
        $(item.side + '-image').alt = `${info.label} · ${detail ? detail.label + ' · ' : ''}view ${current + 1}`;
        $(item.side + '-label').textContent = info.label;
        $(item.side + '-rate').textContent = item.method === 'gt' ? 'Original uncompressed texture' :
          manifest.compression === 'memory' ? `${info.memory_MiB.toFixed(2)} MiB GPU-resident payload` :
          `${info.texture_KiB.toFixed(1)} KiB texture-related bitstream`;
        const quality = $(item.side + '-quality'), q = info.quality;
        quality.hidden = !q;
        quality.textContent = q ? `PSNR ${q.psnr.toFixed(2)} dB · SSIM ${q.ssim.toFixed(4)} · LPIPS ${q.lpips.toFixed(4)}` : '';
        quality.title = manifest.quality_protocol || '';
      }
      $('angle-label').value = `${Math.round(current / count * 360)}°`;
    } catch (error) {
      if (token === request) { stop(); $('status').textContent = 'Could not load a view. Change angle or method to retry.'; }
    } finally {
      if (token === request) { busy = false; $('panels').setAttribute('aria-busy', 'false'); }
    }
  }
  async function preload() {
    const version = ++generation, size = resolution;
    if (detail) return; // Only load the two visible crops, never full HD frames.
    const selected = [...new Set(visible().map(side => methods[side]))], queue = [];
    for (let i = 0; i < count; i++) for (const method of selected) queue.push(pathFor(method, (frame + i) % count, size));
    let next = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (version === generation && next < queue.length) {
        try { await load(queue[next++]); } catch (_) { /* Visible queries can retry. */ }
      }
    }));
  }
  function stop() {
    playing = false; cancelAnimationFrame(raf); $('play').textContent = '▶ Auto-rotate'; $('play').setAttribute('aria-pressed', 'false');
  }
  function start() {
    if (!ready || detail || document.hidden) return;
    stop(); playing = true; lastTick = performance.now();
    $('play').textContent = 'Ⅱ Pause'; $('play').setAttribute('aria-pressed', 'true');
    raf = requestAnimationFrame(tick);
  }
  async function setDetail(id) {
    stop(); clearGesture(); ++generation;
    detail = details.find(item => item.id === id) || null;
    $('detail').value = detail?.id || '';
    $('detail-context').hidden = !detail;
    $('angle').disabled = $('play').disabled = !!detail;
    $('resolution').disabled = !!detail || details.length > 0;
    zoom = 1; x = y = 0;
    if (detail) {
      const [l,t,r,b] = detail.box, n = detail.source_size;
      $('detail-overview').src = root + `1024/gt/${String(detail.frame).padStart(3,'0')}.webp`;
      Object.assign($('detail-box').style, { left: `${l/n*100}%`, top: `${t/n*100}%`, width: `${(r-l)/n*100}%`, height: `${(b-t)/n*100}%` });
      $('detail-caption').textContent = `${detail.label} · fixed view`;
    }
    transform(); await show(frame); status(); preload();
    if (!detail && !reducedMotion.matches) start();
  }
  $('detail').addEventListener('change', () => setDetail($('detail').value));
  $('detail-back').addEventListener('click', () => setDetail(''));
  function tick(now) {
    if (!playing) return;
    if (!busy && now - lastTick >= 8000 / count) { show(frame + 1); lastTick = now; }
    raf = requestAnimationFrame(tick);
  }
  function clearGesture() { pointers.clear(); gesture = null; owner = null; sides.forEach(side => $(side + '-stage').classList.remove('dragging')); }
  function layout() {
    clearGesture(); $('left-panel').hidden = single; $('panels').classList.toggle('single', single);
    $('layout').textContent = single ? 'Side by side' : 'Single image'; $('layout').setAttribute('aria-pressed', String(single));
    $('right-title').textContent = single ? 'Method' : 'Right';
    transform(); if (ready) { show(frame); status(); preload(); }
  }
  function startGesture() {
    const points = [...pointers.values()];
    if (!points.length) { clearGesture(); return; }
    gesture = { x, y, zoom, frame, first: points[0], type: zoom > 1 ? 'pan' : 'rotate' };
    if (points.length === 2) {
      const [a, b] = points; gesture.type = 'pinch';
      gesture.distance = Math.max(.001, Math.hypot(b.x - a.x, b.y - a.y));
      gesture.mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
  }
  for (const side of sides) {
    const stage = $(side + '-stage');
    const point = event => { const rect = stage.getBoundingClientRect(); return { x: (event.clientX - rect.left) / rect.width - .5, y: (event.clientY - rect.top) / rect.height - .5 }; };
    stage.addEventListener('wheel', event => {
      if (!ready) return; event.preventDefault(); stop();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
      setZoom(zoom * Math.exp(-event.deltaY * unit / 600), point(event)); startGesture();
    }, { passive: false });
    stage.addEventListener('pointerdown', event => {
      if (!ready || event.button !== 0 || pointers.size >= 2 || (owner && owner !== side)) return;
      stop(); owner = side; pointers.set(event.pointerId, point(event)); stage.setPointerCapture(event.pointerId); stage.focus({ preventScroll: true });
      startGesture(); stage.classList.add('dragging');
    });
    stage.addEventListener('pointermove', event => {
      if (owner !== side || !pointers.has(event.pointerId)) return;
      const p = point(event); pointers.set(event.pointerId, p);
      if (gesture.type === 'pinch') {
        const [a, b] = [...pointers.values()];
        zoom = Math.max(1, Math.min(4, gesture.zoom * Math.hypot(b.x - a.x, b.y - a.y) / gesture.distance));
        x = (a.x + b.x) / 2 - (gesture.mid.x - gesture.x) * zoom / gesture.zoom;
        y = (a.y + b.y) / 2 - (gesture.mid.y - gesture.y) * zoom / gesture.zoom; transform();
      } else if (gesture.type === 'pan') { x = gesture.x + p.x - gesture.first.x; y = gesture.y + p.y - gesture.first.y; transform(); }
      else if (!detail) show(gesture.frame - Math.round((p.x - gesture.first.x) * count));
    });
    const end = event => { if (owner === side && pointers.delete(event.pointerId)) startGesture(); };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stage.addEventListener(type, end);
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stop(); show(frame + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    $(side + '-method').addEventListener('change', () => { stop(); methods[side] = $(side + '-method').value; show(frame); status(); preload(); });
  }
  $('layout').addEventListener('click', () => { stop(); manualLayout = true; single = !single; layout(); });
  mobile.addEventListener('change', event => { if (!manualLayout) { single = event.matches; layout(); } });
  $('resolution').addEventListener('change', () => { stop(); resolution = $('resolution').value; show(frame); status(); preload(); });
  $('angle').addEventListener('input', () => { stop(); show(Number($('angle').value)); });
  $('zoom-in').addEventListener('click', () => { stop(); setZoom(zoom * 1.25); clearGesture(); });
  $('zoom-out').addEventListener('click', () => { stop(); setZoom(zoom / 1.25); clearGesture(); });
  $('reset').addEventListener('click', () => { stop(); clearGesture(); setZoom(1); show(0); });
  $('play').addEventListener('click', () => { if (playing) stop(); else start(); });
  window.addEventListener('resize', () => { clearGesture(); transform(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); clearGesture(); } });
  window.addEventListener('pagehide', event => { stop(); if (!event.persisted) urls.forEach(URL.revokeObjectURL); });
  layout();
  try {
    const response = await fetch(root + 'manifest.json'); if (!response.ok) throw new Error('manifest');
    manifest = await response.json(); count = manifest.frame_count; resolution = String(manifest.default_resolution);
    for (const side of sides) {
      for (const [value, info] of Object.entries(manifest.methods)) {
        const option = document.createElement('option'); option.value = value; option.textContent = info.label;
        $(side + '-method').appendChild(option);
      }
      $(side + '-method').value = methods[side]; $(side + '-method').disabled = false;
    }
    $('resolution').value = resolution; $('angle').max = count - 1;
    for (const id of ['resolution', 'angle', 'play', 'reset']) $(id).disabled = false;
    // The retired memory Basket remains accessible with its original images.
    if (root !== 'data/memory-basket/') {
      const response = await fetch(root + 'details.json');
      if (response.ok) {
        details = await response.json();
        $('detail-control').hidden = false;
        for (const item of details) {
          const option = document.createElement('option'); option.value = item.id; option.textContent = 'HD · ' + item.label;
          $('detail').appendChild(option);
        }
        resolution = '1024'; $('resolution').value = resolution; $('resolution').disabled = true;
        $('resolution-control').hidden = true;
      }
    }
    ready = true; transform(); await show(0); preload();
    if (!reducedMotion.matches && loaded.has(pathFor(methods.right, 0))) start();
  } catch (_) { $('status').textContent = 'Preview unavailable. Serve this folder over HTTP.'; }
})();
