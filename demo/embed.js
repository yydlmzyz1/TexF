'use strict';
if (new URLSearchParams(location.search).has('embed') && parent !== window) {
  document.body.classList.add('embedded');
  const reportHeight = () => parent.postMessage({
    type: 'texf-demo-height', height: Math.ceil(document.body.getBoundingClientRect().height)
  }, location.origin);
  new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
}
