// Koordinatensystem als SVG, −10 bis 10. Eigenständig: keine i18n, Texte und Zahlformat über Optionen.
// Achsen als Tuschelinie (2 px), Raster als Haarlinie, Quadrantennummern ruhig (Design-Skills 6.4).
// Punktarten unterscheiden sich in der Form, nicht nur in der Farbe:
//   gegeben  = gefüllter Kreis im Leitton     gesetzt = Raute (Umriss)
//   loesung  = Quadrat gestrichelt            Setzmarke = Fadenkreuz (bedienbar, Zinnober)
import { s, id } from '../ui/dom.js';

const RAND = 30;
const QUADRANTEN = [['I', 1, 1], ['II', -1, 1], ['III', -1, -1], ['IV', 1, -1]];

export function koordinatensystem(opts) {
  const o = {
    min: -10, max: 10,
    fmt: (n) => String(n),
    achseX: 'x', achseY: 'y',
    ariaName: '', ariaPunkt: (x, y) => `(${x} | ${y})`,
    modus: 'anzeige', // 'anzeige' | 'einzel' | 'mehrere'
    onSetzen: null, // (punkt, bestaetigt): bestaetigt bei Antippen oder Enter, nicht bei Pfeiltasten
    onConfirm: null,
    ...opts,
  };
  const musterId = id('raster');
  const pfeilId = id('pfeil');
  let groesse = 480;
  let marke = null; // Setzmarke [x, y] oder null
  let gesetzt = []; // gesetzte Punkte (Modus «mehrere») bzw. [Antwort] (Modus «einzel»)
  let punkte = []; // feste Punkte: { x, y, art, label }
  let figuren = []; // { punkte, art: 'original' | 'gezeichnet', geschlossen }
  let pfeile = []; // { von, nach }
  let fokussiert = false;

  const svg = s('svg', { class: 'koordinatensystem', xmlns: 'http://www.w3.org/2000/svg' });
  const griff = s('g', { class: 'ks-griff', role: 'slider' });
  const wrapper = document.createElement('div');
  wrapper.className = 'koordinaten-wrap';
  wrapper.append(svg);

  const zelle = () => (groesse - 2 * RAND) / (o.max - o.min);
  const X = (x) => RAND + (x - o.min) * zelle();
  const Y = (y) => RAND + (o.max - y) * zelle();
  const klemmen = (n) => Math.max(o.min, Math.min(o.max, Math.round(n)));
  const interaktiv = () => o.modus !== 'anzeige';

  function aria() {
    const p = marke || [0, 0];
    griff.setAttribute('tabindex', interaktiv() ? '0' : '-1');
    griff.setAttribute('aria-label', o.ariaName);
    griff.setAttribute('aria-valuemin', String(o.min));
    griff.setAttribute('aria-valuemax', String(o.max));
    griff.setAttribute('aria-valuenow', String(p[0]));
    griff.setAttribute('aria-valuetext', o.ariaPunkt(p[0], p[1]));
    griff.setAttribute('aria-disabled', String(!interaktiv()));
  }

  function textEl(x, y, inhalt, klasse, anker = 'middle') {
    return s('text', { x, y, 'text-anchor': anker, class: 'ks-text ' + (klasse || '') }, inhalt);
  }

  function punktForm(p) {
    const x = X(p.x);
    const y = Y(p.y);
    const g = s('g', { class: 'ks-punkt ks-punkt--' + p.art });
    if (p.art === 'gegeben') {
      g.append(s('circle', { cx: x, cy: y, r: 7, fill: 'var(--lab-accent)', stroke: 'var(--color-line)', 'stroke-width': 2 }));
    } else if (p.art === 'loesung') {
      g.append(s('rect', { x: x - 7, y: y - 7, width: 14, height: 14, fill: 'none', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-dasharray': '3 2' }));
    } else {
      g.append(s('path', { d: `M${x},${y - 9} L${x + 9},${y} L${x},${y + 9} L${x - 9},${y} Z`, fill: 'var(--color-surface)', stroke: 'var(--color-line)', 'stroke-width': 2 }));
    }
    if (p.label) g.append(textEl(x + 11, y - 10, p.label, 'ks-text--label', 'start'));
    return g;
  }

  function figurForm(f) {
    const pts = f.punkte.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ');
    const g = s('g', { class: 'ks-figur ks-figur--' + f.art });
    if (f.art === 'original') {
      const form = f.geschlossen ? 'polygon' : 'polyline';
      g.append(
        s(form, { points: pts, fill: f.geschlossen ? 'var(--color-surface)' : 'none', stroke: 'none' }),
        s(form, { points: pts, fill: f.geschlossen ? `url(#${musterId})` : 'none', stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      );
    } else {
      g.append(s(f.geschlossen ? 'polygon' : 'polyline', { points: pts, fill: 'none', stroke: 'var(--color-line)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
    }
    return g;
  }

  function zeichnen() {
    groesse = Math.max(260, Math.min(560, Math.round(wrapper.clientWidth || 480)));
    svg.setAttribute('viewBox', `0 0 ${groesse} ${groesse}`);
    svg.setAttribute('width', String(groesse));
    svg.setAttribute('height', String(groesse));
    svg.replaceChildren();
    svg.append(s('defs', {},
      s('pattern', { id: musterId, width: 8, height: 8, patternUnits: 'userSpaceOnUse' },
        s('circle', { cx: 4, cy: 4, r: 1.3, fill: 'var(--lab-accent)' })),
      s('marker', { id: pfeilId, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' },
        s('path', { d: 'M0,0 L10,5 L0,10 Z', fill: 'var(--color-line)' }))));

    // Raster als Haarlinie
    const raster = s('g', { class: 'ks-raster' });
    for (let n = o.min; n <= o.max; n++) {
      if (n === 0) continue;
      raster.append(
        s('line', { x1: X(n), y1: Y(o.min), x2: X(n), y2: Y(o.max), stroke: 'var(--color-border)', 'stroke-width': 1 }),
        s('line', { x1: X(o.min), y1: Y(n), x2: X(o.max), y2: Y(n), stroke: 'var(--color-border)', 'stroke-width': 1 }),
      );
    }
    svg.append(raster);

    // Quadrantennummern ruhig in der Ecke
    QUADRANTEN.forEach(([name, sx, sy]) => {
      svg.append(textEl(X(sx * 8.5), Y(sy * 8.5) + 6, name, 'ks-text--quadrant'));
    });

    // Achsen als Tuschelinie mit Pfeilspitzen in positiver Richtung
    const ende = 0.6;
    svg.append(
      s('line', { x1: X(o.min) - 6, y1: Y(0), x2: X(o.max + ende), y2: Y(0), stroke: 'var(--color-line)', 'stroke-width': 2, 'marker-end': `url(#${pfeilId})` }),
      s('line', { x1: X(0), y1: Y(o.min) + 6, x2: X(0), y2: Y(o.max + ende), stroke: 'var(--color-line)', 'stroke-width': 2, 'marker-end': `url(#${pfeilId})` }),
      textEl(X(o.max + ende) - 2, Y(0) - 10, o.achseX, 'ks-text--achse', 'end'),
      textEl(X(0) + 10, Y(o.max + ende) + 6, o.achseY, 'ks-text--achse', 'start'),
    );
    const schritt = zelle() >= 26 ? 1 : 2;
    for (let n = o.min; n <= o.max; n++) {
      if (n === 0 || n % schritt) continue;
      svg.append(
        s('line', { x1: X(n), y1: Y(0) - 4, x2: X(n), y2: Y(0) + 4, stroke: 'var(--color-line)', 'stroke-width': 1.5 }),
        s('line', { x1: X(0) - 4, y1: Y(n), x2: X(0) + 4, y2: Y(n), stroke: 'var(--color-line)', 'stroke-width': 1.5 }),
        textEl(X(n), Y(0) + 17, o.fmt(n)),
        textEl(X(0) - 7, Y(n) + 4, o.fmt(n), '', 'end'),
      );
    }
    svg.append(textEl(X(0) - 7, Y(0) + 17, o.fmt(0), '', 'end'));

    figuren.forEach((f) => svg.append(figurForm(f)));
    pfeile.forEach((p) => svg.append(s('line', {
      x1: X(p.von[0]), y1: Y(p.von[1]), x2: X(p.nach[0]), y2: Y(p.nach[1]),
      stroke: 'var(--color-line)', 'stroke-width': 2, 'stroke-dasharray': '6 4', 'marker-end': `url(#${pfeilId})`,
    })));
    punkte.forEach((p) => svg.append(punktForm(p)));
    if (o.modus === 'mehrere' && gesetzt.length > 1) {
      svg.append(figurForm({ punkte: gesetzt, art: 'gezeichnet', geschlossen: false }));
    }
    gesetzt.forEach((p, i) => svg.append(punktForm({ x: p[0], y: p[1], art: 'gesetzt', label: o.labelGesetzt?.(i) })));

    // Setzmarke (Fadenkreuz) und Fokusring
    griff.replaceChildren();
    if (interaktiv() && marke) {
      const x = X(marke[0]);
      const y = Y(marke[1]);
      griff.append(
        s('circle', { cx: x, cy: y, r: 12, fill: 'none', stroke: 'var(--color-signal)', 'stroke-width': 2 }),
        s('path', { d: `M${x - 17},${y} H${x - 6} M${x + 6},${y} H${x + 17} M${x},${y - 17} V${y - 6} M${x},${y + 6} V${y + 17}`, stroke: 'var(--color-signal)', 'stroke-width': 2 }),
      );
    }
    if (fokussiert) {
      griff.append(s('rect', { x: 2, y: 2, width: groesse - 4, height: groesse - 4, rx: 8, fill: 'none', stroke: 'var(--color-signal)', 'stroke-width': 3 }));
    }
    svg.append(griff);
    aria();
  }

  function markeSetzen(x, y, { bestaetigen = false } = {}) {
    marke = [klemmen(x), klemmen(y)];
    if (o.modus === 'einzel') {
      gesetzt = [marke.slice()];
      o.onSetzen?.(gesetzt[0], bestaetigen);
    } else if (o.modus === 'mehrere' && bestaetigen) {
      gesetzt.push(marke.slice());
      o.onSetzen?.(gesetzt.slice());
    }
    zeichnen();
  }

  svg.addEventListener('pointerdown', (e) => {
    if (!interaktiv()) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * groesse;
    const py = ((e.clientY - r.top) / r.height) * groesse;
    const x = o.min + (px - RAND) / zelle();
    const y = o.max - (py - RAND) / zelle();
    if (x < o.min - 0.5 || x > o.max + 0.5 || y < o.min - 0.5 || y > o.max + 0.5) return;
    markeSetzen(x, y, { bestaetigen: true });
    griff.focus({ preventScroll: true });
  });

  griff.addEventListener('keydown', (e) => {
    if (!interaktiv()) return;
    const p = marke || [0, 0];
    const wege = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (e.key in wege) {
      e.preventDefault();
      const [dx, dy] = wege[e.key];
      // Im Modus «mehrere» bewegt sich nur die Marke; gesetzt wird mit Enter.
      if (o.modus === 'mehrere') { marke = [klemmen(p[0] + dx), klemmen(p[1] + dy)]; zeichnen(); }
      else markeSetzen(p[0] + dx, p[1] + dy);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      markeSetzen(p[0], p[1], { bestaetigen: true });
      if (o.modus === 'einzel') o.onConfirm?.(gesetzt[0]);
    }
  });
  griff.addEventListener('focus', () => {
    fokussiert = true;
    if (!marke && interaktiv()) marke = [0, 0];
    zeichnen();
  });
  griff.addEventListener('blur', () => { fokussiert = false; zeichnen(); });

  new ResizeObserver(() => zeichnen()).observe(wrapper);
  zeichnen();

  return {
    el: wrapper,
    gesetzt: () => gesetzt.map((p) => p.slice()),
    punkte(liste) { punkte = liste; zeichnen(); },
    figuren(liste) { figuren = liste; zeichnen(); },
    pfeile(liste) { pfeile = liste; zeichnen(); },
    gesetztSetzen(liste) { gesetzt = liste.map((p) => p.slice()); zeichnen(); },
    letzterWeg() { gesetzt.pop(); o.onSetzen?.(gesetzt.slice()); zeichnen(); },
    zuruecksetzen() { gesetzt = []; marke = null; o.onSetzen?.(o.modus === 'einzel' ? null : []); zeichnen(); },
    modus(m) { o.modus = m; zeichnen(); },
    fokus() { griff.focus(); },
  };
}
