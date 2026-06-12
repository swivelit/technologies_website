/* Terminal-style scramble/decode text reveal.
   Works on elements containing text nodes and <br> — markup is preserved,
   only the text nodes are animated. */

const GLYPHS = '!<>-_\\/[]{}—=+*^?#@$%&0123456789ABCDEFGHIKLMNOPQRSTUVWXYZ';

function randGlyph() {
  return GLYPHS[(Math.random() * GLYPHS.length) | 0];
}

export function scramble(el, { duration = 1100, holdEmpty = false } = {}) {
  if (el.__scrambling) return;
  el.__scrambling = true;

  // keep assistive tech reading the real text while glyphs cycle
  if (!el.getAttribute('aria-label')) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let total = 0;
  let n;
  while ((n = walker.nextNode())) {
    nodes.push({ node: n, original: n.nodeValue, offset: total });
    total += n.nodeValue.length;
  }
  if (!total) { el.__scrambling = false; return; }

  // per-character reveal times, staggered left → right with jitter
  const reveal = new Array(total);
  for (let i = 0; i < total; i++) {
    reveal[i] = (i / total) * duration * 0.7 + Math.random() * duration * 0.3;
  }

  const t0 = performance.now();
  let last = 0;

  function frame(now) {
    const t = now - t0;
    // ~30fps is enough for the flicker and halves the layout work
    if (now - last < 33 && t < duration) { requestAnimationFrame(frame); return; }
    last = now;

    let done = true;
    for (const { node, original, offset } of nodes) {
      let out = '';
      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        if (ch === ' ' || ch === '\n') { out += ch; continue; }
        const r = reveal[offset + i];
        if (t >= r) {
          out += ch;
        } else {
          done = false;
          out += (holdEmpty && t < r * 0.25) ? ' ' : randGlyph();
        }
      }
      node.nodeValue = out;
    }

    if (!done) requestAnimationFrame(frame);
    else {
      for (const { node, original } of nodes) node.nodeValue = original;
      el.__scrambling = false;
    }
  }

  requestAnimationFrame(frame);
}
