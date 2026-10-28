// Reiter 1: Plus und Minus als Bewegung einer Figur.
import { t } from '../core/i18n.js';
import { fmt, MINUS } from '../core/zahl.js';
import { anzeigen } from '../core/term.js';
import { h, s as svg } from '../ui/dom.js';
import { zahlenfeld } from '../ui/zahlenfeld.js';
import { musterBlock } from '../ui/muster.js';
import { uebungsrahmen, ansichtNachTyp } from '../ui/uebungsrahmen.js';
import { rechnenAnsicht } from '../aufgaben/rechnen.js';
import { termElement, schritteAusTerm, strahl, legende, knopf } from '../aufgaben/gemeinsam.js';
import { gruppe, roving } from '../ui/aria-gruppen.js';

const REITER = 'zahlenstrahl';
// Regeln, die nach der Beobachtungsaufgabe dieses Reiters erscheinen
const REGELN = ['regel.subtrahieren_negativ', 'regel.addieren_negativ'];
const GRENZE = 10;

export function rendern(el, modus, daten) {
  if (modus === 'entdecken') return entdecken(el, daten);
  uebungsrahmen({
    el, reiter: REITER, modus, daten,
    pool: daten.aufgaben.filter((a) => a.reiter === REITER),
    ansicht: ansichtNachTyp({ rechnen: rechnenAnsicht }),
  });
}

function asciiZahl(n) {
  return n < 0 ? '(' + n + ')' : String(n);
}

// Pfeil-Symbol für die Tasten «eins mehr» und «eins weniger»
function pfeil(richtung) {
  return svg('svg', { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
    svg('path', { d: richtung > 0 ? 'M3,10 L8,5 L13,10' : 'M3,6 L8,11 L13,6', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
}

// Zahlenfeld mit den Tasten «eins weniger» und «eins mehr». Sie laufen über die Null (0 → −1).
function zahlBaustein(label, startwert, onAenderung, onEnter) {
  const feld = zahlenfeld({ label, onInput: () => onAenderung(), onEnter: () => onEnter() });
  feld.setzen(startwert);
  const stufe = (d) => {
    const neu = Math.max(-GRENZE, Math.min(GRENZE, (feld.wert() ?? 0) + d));
    feld.setzen(neu);
    onAenderung();
  };
  feld.el.querySelector('.zahlenfeld__zeile').append(
    h('button', { type: 'button', class: 'btn btn--secondary zahlenfeld__taste', 'aria-label': t('a11y.eins_weniger') + ': ' + t(label), onclick: () => stufe(-1) }, pfeil(-1)),
    h('button', { type: 'button', class: 'btn btn--secondary zahlenfeld__taste', 'aria-label': t('a11y.eins_mehr') + ': ' + t(label), onclick: () => stufe(1) }, pfeil(1)));
  return feld;
}

// Freies Probieren: Startzahl, Rechenzeichen, Zahl. Keine Wertung.
function entdecken(el, daten) {
  const zs = strahl({ bereich: 2 * GRENZE, start: 0, interaktiv: false });
  const erklaerung = h('ol', { class: 'zs-erklaerung', 'aria-live': 'polite' });
  const gegenAusgabe = h('p', { class: 'ui gegenzahl-ausgabe', 'aria-live': 'polite' });
  const bereichHinweis = h('p', { class: 'meta', hidden: true }, t('zs.bereich', { min: fmt(-GRENZE), max: fmt(GRENZE) }));
  const liveTerm = h('div', { class: 'live-term', 'aria-live': 'polite' });
  let op = '+';

  const startBtn = knopf('btn.starten', {}, false);
  const gegenBtn = knopf('btn.gegenzahl');
  const resetBtn = knopf('btn.zuruecksetzen');

  const a = zahlBaustein('label.start', 5, () => aktualisieren(), () => b.fokus());
  const b = zahlBaustein('label.zahl', 3, () => aktualisieren(), () => { if (!startBtn.disabled) los(false); });

  // Rechenzeichen: genau eine Taste ist immer aktiv, Vorgabe «+»
  const opLabelId = 'op-label-entdecken';
  const opGruppe = h('div', { class: 'segmented', role: 'radiogroup', 'aria-labelledby': opLabelId },
    h('button', { type: 'button', class: 'btn btn--secondary vz-btn', role: 'radio', 'aria-checked': 'true', 'data-op': '+', 'aria-label': t('a11y.op.plus') }, '+'),
    h('button', { type: 'button', class: 'btn btn--secondary vz-btn', role: 'radio', 'aria-checked': 'false', 'data-op': '-', 'aria-label': t('a11y.op.minus') }, MINUS));
  const opSetzen = (neu) => {
    op = neu;
    opGruppe.querySelectorAll('[role="radio"]').forEach((r) => r.setAttribute('aria-checked', String(r.dataset.op === neu)));
    roving(opGruppe, '[role="radio"]', opGruppe.querySelector(`[data-op="${neu}"]`));
    aktualisieren();
  };
  gruppe(opGruppe, '[role="radio"]', (r) => opSetzen(r.dataset.op));

  function werte() {
    const x = a.wert();
    const y = b.wert();
    if (x === null || y === null || Math.abs(x) > GRENZE || Math.abs(y) > GRENZE) return null;
    return [x, y];
  }

  // Live-Term: passt sich bei jeder Änderung an. Negative zweite Zahl in Klammern, erste Zahl ohne.
  function aktualisieren() {
    const x = a.wert();
    const y = b.wert();
    if (x !== null && y !== null) {
      liveTerm.replaceChildren(termElement(String(x) + ' ' + op + ' ' + asciiZahl(y), 'term term--gross'));
    } else {
      const teil = (n, klammer) => (n === null ? '?' : klammer && n < 0 ? '(' + fmt(n) + ')' : fmt(n));
      liveTerm.replaceChildren(h('p', { class: 'term term--gross' }, teil(x, false) + ' ' + (op === '-' ? MINUS : '+') + ' ' + teil(y, true)));
    }
    const ausserhalb = (x !== null && Math.abs(x) > GRENZE) || (y !== null && Math.abs(y) > GRENZE);
    bereichHinweis.hidden = !ausserhalb;
    // «Starten» erst, wenn beide Felder gefüllt sind
    startBtn.disabled = !werte();
    gegenBtn.disabled = !werte() || op !== '-';
  }

  function los(mitGegenzahl) {
    const w = werte();
    if (!w) return;
    const [x, y] = w;
    const term = String(x) + ' ' + op + ' ' + asciiZahl(y);
    const gezeigt = mitGegenzahl ? String(x) + ' + ' + asciiZahl(-y) : term;
    const bahn = schritteAusTerm(gezeigt);
    const sp = bahn.schritte[0];
    const punkte = [
      t('zs.steht_auf', { n: fmt(bahn.start) }),
      t(sp.blick > 0 ? 'zs.blick_rechts' : 'zs.blick_links'),
      t(sp.gang > 0 ? 'zs.vorwaerts' : 'zs.rueckwaerts'),
      t('label.ergebnis') + ': ' + fmt(bahn.ziel),
    ];
    gegenAusgabe.textContent = mitGegenzahl ? t('zs.gegenzahl_term', { term: anzeigen(gezeigt) }) : '';
    if (mitGegenzahl) punkte.push(t('zs.gegenzahl_erklaerung', { b: fmt(y), gegenzahl: fmt(-y), ergebnis: fmt(bahn.ziel) }));
    erklaerung.replaceChildren(...punkte.map((p) => h('li', {}, p)));
    zs.zuruecksetzen(bahn.start, sp.blick);
    zs.gehen(bahn.schritte);
  }

  startBtn.addEventListener('click', () => los(false));
  gegenBtn.addEventListener('click', () => los(true));
  resetBtn.addEventListener('click', () => {
    zs.zuruecksetzen(0, 1);
    erklaerung.replaceChildren();
    gegenAusgabe.textContent = '';
  });
  roving(opGruppe, '[role="radio"]', opGruppe.querySelector('[data-op="+"]'));
  aktualisieren();

  const muster = daten.muster.filter((m) => m.reiter === REITER);
  el.replaceChildren(
    liveTerm,
    h('div', { class: 'eingabe-zeile baukasten' },
      a.el,
      h('div', { class: 'zahl-eingabe', role: 'group', 'aria-labelledby': opLabelId },
        h('span', { id: opLabelId, class: 'ui ui-label' }, t('label.rechenzeichen')), opGruppe),
      b.el),
    bereichHinweis,
    h('div', { class: 'btn-row' }, startBtn, gegenBtn, resetBtn),
    gegenAusgabe,
    h('div', { class: 'scene zs-scene' }, zs.el),
    legende(),
    erklaerung,
    ...muster.map((m) => musterBlock(m, REGELN)),
  );
}
