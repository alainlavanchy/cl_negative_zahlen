// Zahlenstrahl mit Figur als SVG. Eigenständig: keine i18n und keine Fachdaten,
// Texte und Zahlformat kommen über die Optionen. Farben nur als var(--...).
//
// Bildsprache (Design-Skills 6.4):
//   Vorzeichen   = Blickrichtung der Figur (positiv rechts, negativ links)
//   Rechenzeichen = Gangart (plus vorwärts, minus rückwärts)
//   Bewegung nach rechts: gefülltes Band in --lab-accent; nach links: Umriss mit Rasterton.
import { s, id, bewegungReduziert } from '../ui/dom.js';

const RAND = 28;
const ACHSE_Y = 118;
const GROESSE = 1.35; // Massstab der Figur
const ZEILE = 34;

export function zahlenstrahl(opts) {
  const o = {
    min: -10, max: 10, start: 0,
    fmt: (n) => String(n),
    ariaName: '', ariaWert: (n) => String(n),
    onChange: null, onConfirm: null,
    interaktiv: true,
    ...opts,
  };
  const musterId = id('raster');
  let wert = o.start;
  let pos = o.start; // Position während der Animation (auch Zwischenwerte)
  let blick = 1;
  let spruenge = []; // { von, nach, label }
  let interaktiv = o.interaktiv;
  let anim = null;
  let breite = 600;
  let fokussiert = false;

  const svg = s('svg', { class: 'zahlenstrahl', role: 'group', 'aria-label': o.ariaName, xmlns: 'http://www.w3.org/2000/svg' });
  const figur = s('g', { class: 'zs-figur', role: 'slider', tabindex: interaktiv ? '0' : '-1' });
  const wrapper = document.createElement('div');
  wrapper.className = 'zahlenstrahl-wrap';
  wrapper.append(svg);

  const einheit = () => (breite - 2 * RAND - 16) / (o.max - o.min);
  const xVon = (n) => RAND + (n - o.min) * einheit();
  const nVon = (x) => Math.round(o.min + (x - RAND) / einheit());
  const klemmen = (n) => Math.max(o.min, Math.min(o.max, n));

  function beschriftungsSchritt() {
    for (const schritt of [1, 2, 5, 10]) if (schritt * einheit() >= 30) return schritt;
    return 10;
  }

  function aria() {
    figur.setAttribute('aria-valuemin', String(o.min));
    figur.setAttribute('aria-valuemax', String(o.max));
    figur.setAttribute('aria-valuenow', String(wert));
    figur.setAttribute('aria-valuetext', o.ariaWert(wert));
    figur.setAttribute('aria-label', o.ariaName);
    figur.setAttribute('aria-disabled', String(!interaktiv));
    figur.setAttribute('tabindex', interaktiv ? '0' : '-1');
  }

  function band(sprung, zeile) {
    const y = ACHSE_Y + 44 + zeile * ZEILE;
    const x1 = xVon(sprung.von);
    const x2 = xVon(sprung.nach);
    const rechts = x2 >= x1;
    const links = Math.min(x1, x2);
    const w = Math.abs(x2 - x1);
    const spitze = rechts
      ? `M${x2},${y - 9} L${x2 + 12},${y} L${x2},${y + 9} Z`
      : `M${x2},${y - 9} L${x2 - 12},${y} L${x2},${y + 9} Z`;
    const g = s('g', { class: 'zs-sprung' });
    if (rechts) {
      g.append(
        s('rect', { x: links, y: y - 5, width: w, height: 10, fill: 'var(--lab-accent)', stroke: 'var(--color-line)', 'stroke-width': 2 }),
        s('path', { d: spitze, fill: 'var(--lab-accent)', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      );
    } else {
      g.append(
        s('rect', { x: links, y: y - 5, width: w, height: 10, fill: 'var(--color-surface)', stroke: 'var(--color-line)', 'stroke-width': 2 }),
        s('rect', { x: links, y: y - 5, width: w, height: 10, fill: `url(#${musterId})` }),
        s('path', { d: spitze, fill: 'var(--color-surface)', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      );
    }
    // Startmarke
    g.append(s('line', { x1, y1: y - 9, x2: x1, y2: y + 9, stroke: 'var(--color-line)', 'stroke-width': 2 }));
    if (sprung.label) {
      g.append(s('text', { x: links + w / 2, y: y + 24, 'text-anchor': 'middle', class: 'zs-text zs-text--sprung' }, sprung.label));
    }
    return g;
  }

  function figurZeichnen() {
    figur.replaceChildren();
    const x = xVon(pos);
    const huepf = anim ? Math.abs(Math.sin((pos - Math.floor(pos)) * Math.PI)) * 4 : 0;
    const koerper = s('g', { transform: `translate(${x},${ACHSE_Y - huepf}) scale(${blick * GROESSE},${GROESSE})` },
      // Beine
      s('path', { d: 'M-6,0 L-3,-14 M6,0 L3,-14', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }),
      // Rumpf
      s('rect', { x: -10, y: -38, width: 20, height: 26, rx: 7, fill: 'var(--skin)', stroke: 'var(--color-line)', 'stroke-width': 2 }),
      // Kopf mit Auge und Nase zeigt die Blickrichtung
      s('circle', { cx: 0, cy: -50, r: 11, fill: 'var(--skin)', stroke: 'var(--color-line)', 'stroke-width': 2 }),
      s('circle', { cx: 5, cy: -52, r: 1.8, fill: 'var(--color-line)' }),
      s('path', { d: 'M10,-50 L16,-47 L10,-45', fill: 'var(--skin)', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    );
    // Trefferfläche ab 44 px für Touch
    const treffer = s('rect', { x: x - 24, y: ACHSE_Y - 92, width: 48, height: 98, fill: 'transparent' });
    figur.append(treffer, koerper);
    if (fokussiert) {
      figur.append(s('rect', { x: x - 24, y: ACHSE_Y - 92, width: 48, height: 98, rx: 6, fill: 'none', stroke: 'var(--color-signal)', 'stroke-width': 3 }));
    }
    const anzeige = anim ? Math.round(pos) : wert;
    figur.append(s('text', { x, y: ACHSE_Y - 98, 'text-anchor': 'middle', class: 'zs-text zs-text--wert' }, o.fmt(anzeige)));
  }

  function zeichnen() {
    breite = Math.max(280, Math.round(wrapper.clientWidth || 600));
    const hoehe = ACHSE_Y + 40 + Math.max(1, spruenge.length) * ZEILE + 8;
    svg.setAttribute('viewBox', `0 0 ${breite} ${hoehe}`);
    svg.setAttribute('width', String(breite));
    svg.setAttribute('height', String(hoehe));
    svg.replaceChildren();

    svg.append(s('defs', {},
      s('pattern', { id: musterId, width: 8, height: 8, patternUnits: 'userSpaceOnUse' },
        s('circle', { cx: 4, cy: 4, r: 1.3, fill: 'var(--lab-accent)' }))));

    // Achse als Tuschelinie mit Pfeilspitze nach rechts (positive Richtung)
    const xEnde = breite - RAND + 8;
    svg.append(
      s('line', { x1: RAND - 10, y1: ACHSE_Y, x2: xEnde, y2: ACHSE_Y, stroke: 'var(--color-line)', 'stroke-width': 2 }),
      s('path', { d: `M${xEnde - 2},${ACHSE_Y - 6} L${xEnde + 8},${ACHSE_Y} L${xEnde - 2},${ACHSE_Y + 6}`, fill: 'none', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    );
    const schritt = beschriftungsSchritt();
    for (let n = o.min; n <= o.max; n++) {
      const x = xVon(n);
      const beschriftet = n % schritt === 0;
      const lang = n === 0 ? 10 : beschriftet ? 6 : 3;
      svg.append(s('line', { x1: x, y1: ACHSE_Y - lang, x2: x, y2: ACHSE_Y + lang, stroke: n === 0 ? 'var(--color-line)' : 'var(--color-text-soft)', 'stroke-width': n === 0 ? 2 : 1 }));
      if (beschriftet) {
        svg.append(s('text', { x, y: ACHSE_Y + 26, 'text-anchor': 'middle', class: n === 0 ? 'zs-text zs-text--null' : 'zs-text' }, o.fmt(n)));
      }
    }
    spruenge.forEach((sp, i) => svg.append(band(sp, i)));
    figurZeichnen();
    svg.append(figur);
    aria();
  }

  function setzen(n, { melden = true } = {}) {
    const neu = klemmen(Math.round(n));
    wert = neu;
    pos = neu;
    zeichnen();
    if (melden) o.onChange?.(wert);
  }

  // Ziehen und Antippen
  let zieht = false;
  function ausEreignis(e) {
    const r = svg.getBoundingClientRect();
    return nVon(((e.clientX - r.left) / r.width) * breite);
  }
  svg.addEventListener('pointerdown', (e) => {
    if (!interaktiv || anim) return;
    zieht = true;
    svg.setPointerCapture(e.pointerId);
    setzen(ausEreignis(e));
    figur.focus({ preventScroll: true });
  });
  svg.addEventListener('pointermove', (e) => {
    if (!zieht) return;
    const n = klemmen(ausEreignis(e));
    if (n !== wert) setzen(n);
  });
  const loslassen = () => { zieht = false; };
  svg.addEventListener('pointerup', loslassen);
  svg.addEventListener('pointercancel', loslassen);

  figur.addEventListener('keydown', (e) => {
    if (!interaktiv || anim) return;
    const schritte = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 };
    if (e.key in schritte) { e.preventDefault(); setzen(wert + schritte[e.key]); }
    else if (e.key === 'Home') { e.preventDefault(); setzen(o.min); }
    else if (e.key === 'End') { e.preventDefault(); setzen(o.max); }
    else if (e.key === 'Enter') { e.preventDefault(); o.onConfirm?.(wert); }
  });
  figur.addEventListener('focus', () => { fokussiert = true; figurZeichnen(); });
  figur.addEventListener('blur', () => { fokussiert = false; figurZeichnen(); });

  new ResizeObserver(() => zeichnen()).observe(wrapper);

  function warten(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function laufen(von, nach, token) {
    return new Promise((fertig) => {
      const dauer = Math.min(1800, Math.abs(nach - von) * 260);
      const t0 = performance.now();
      function bild(jetzt) {
        if (anim !== token) return fertig();
        const p = Math.min(1, (jetzt - t0) / dauer);
        pos = von + (nach - von) * p;
        figurZeichnen();
        if (p < 1) requestAnimationFrame(bild);
        else fertig();
      }
      requestAnimationFrame(bild);
    });
  }

  // Schritte nacheinander gehen: { von, nach, blick, label }
  async function gehen(schritte) {
    const token = {};
    anim = token;
    spruenge = [];
    if (!schritte.length) { anim = null; return; }
    pos = schritte[0].von;
    wert = pos;
    if (bewegungReduziert()) {
      // Ohne Animation: direkt zum Endzustand
      spruenge = schritte.map((sp) => ({ von: sp.von, nach: sp.nach, label: sp.label }));
      blick = schritte[schritte.length - 1].blick;
      pos = wert = schritte[schritte.length - 1].nach;
      anim = null;
      zeichnen();
      o.onChange?.(wert);
      return;
    }
    zeichnen();
    for (const sp of schritte) {
      if (anim !== token) return;
      blick = sp.blick;
      figurZeichnen();
      await warten(450);
      if (anim !== token) return;
      await laufen(sp.von, sp.nach, token);
      if (anim !== token) return;
      spruenge.push({ von: sp.von, nach: sp.nach, label: sp.label });
      pos = wert = sp.nach;
      zeichnen();
      await warten(200);
    }
    anim = null;
    zeichnen();
    o.onChange?.(wert);
  }

  zeichnen();

  return {
    el: wrapper,
    wert: () => wert,
    setzen: (n) => setzen(n, { melden: false }),
    // Schritt um d (z. B. Schritt-Tasten neben dem Strahl); meldet den neuen Wert wie Ziehen
    schritt(d) { if (interaktiv && !anim) setzen(wert + d); },
    blick(richtung) { blick = richtung < 0 ? -1 : 1; figurZeichnen(); },
    gehen,
    zuruecksetzen(start = o.start, richtung = 1) {
      anim = null;
      spruenge = [];
      blick = richtung < 0 ? -1 : 1;
      setzen(start, { melden: false });
    },
    bereich(min, max) { o.min = min; o.max = max; zeichnen(); },
    interaktiv(an) { interaktiv = an; aria(); },
    fokus() { figur.focus(); },
    neuZeichnen: zeichnen,
  };
}

// Kleines Legendensymbol: positiv (gefüllt) oder negativ (Umriss mit Raster).
export function legendenSymbol(art) {
  const mid = id('raster');
  const svg = s('svg', { width: 36, height: 16, viewBox: '0 0 36 16', 'aria-hidden': 'true', class: 'zs-legende-symbol' },
    s('defs', {}, s('pattern', { id: mid, width: 8, height: 8, patternUnits: 'userSpaceOnUse' },
      s('circle', { cx: 4, cy: 4, r: 1.3, fill: 'var(--lab-accent)' }))));
  if (art === 'positiv') {
    svg.append(
      s('rect', { x: 2, y: 4, width: 22, height: 8, fill: 'var(--lab-accent)', stroke: 'var(--color-line)', 'stroke-width': 1.5 }),
      s('path', { d: 'M24,1 L34,8 L24,15 Z', fill: 'var(--lab-accent)', stroke: 'var(--color-line)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
    );
  } else {
    svg.append(
      s('rect', { x: 12, y: 4, width: 22, height: 8, fill: 'var(--color-surface)', stroke: 'var(--color-line)', 'stroke-width': 1.5 }),
      s('rect', { x: 12, y: 4, width: 22, height: 8, fill: `url(#${mid})` }),
      s('path', { d: 'M12,1 L2,8 L12,15 Z', fill: 'var(--color-surface)', stroke: 'var(--color-line)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
    );
  }
  return svg;
}
