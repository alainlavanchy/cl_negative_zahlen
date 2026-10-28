// Kleiner DOM-Helfer: h('p', { class: 'meta' }, 'Text', kind)
const SVG_NS = 'http://www.w3.org/2000/svg';

function fuellen(el, attrs, kinder) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kind of kinder.flat()) {
    if (kind === null || kind === undefined || kind === false) continue;
    el.append(kind instanceof Node ? kind : String(kind));
  }
  return el;
}

export function h(tag, attrs, ...kinder) {
  return fuellen(document.createElement(tag), attrs, kinder);
}

export function s(tag, attrs, ...kinder) {
  return fuellen(document.createElementNS(SVG_NS, tag), attrs, kinder);
}

let zaehler = 0;
export function id(prefix) {
  zaehler += 1;
  return prefix + '-' + zaehler;
}

export function bewegungReduziert() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Automatischer Fokus nur bei feinem Zeiger (Maus, Trackpad), nicht auf Touch-Geräten.
export function autoFokus() {
  return !window.matchMedia('(pointer: coarse)').matches;
}
