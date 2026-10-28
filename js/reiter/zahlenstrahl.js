// Reiter 1: Plus und Minus als Bewegung einer Figur.
import { t } from '../core/i18n.js';
import { fmt, MINUS } from '../core/zahl.js';
import { anzeigen } from '../core/term.js';
import { h } from '../ui/dom.js';
import { zahlEingabe } from '../ui/zahl-eingabe.js';
import { musterBlock } from '../ui/muster.js';
import * as rm from '../ui/rueckmeldung.js';
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

// Freies Probieren: Startzahl, Rechenzeichen, Zahl. Keine Wertung.
function entdecken(el, daten) {
  const zs = strahl({ bereich: 2 * GRENZE, start: 0, interaktiv: false });
  const erklaerung = h('ol', { class: 'zs-erklaerung', 'aria-live': 'polite' });
  const meldung = h('div');
  let op = '-';

  const a = zahlEingabe({ label: 'label.start' });
  const b = zahlEingabe({ label: 'label.zahl', onEnter: () => los(false) });
  a.setzen(5);
  b.setzen(-3);

  const opLabelId = 'op-label-entdecken';
  const opGruppe = h('div', { class: 'segmented', role: 'radiogroup', 'aria-labelledby': opLabelId },
    h('button', { type: 'button', class: 'btn btn--secondary vz-btn', role: 'radio', 'aria-checked': 'false', 'data-op': '+', 'aria-label': t('a11y.op.plus') }, '+'),
    h('button', { type: 'button', class: 'btn btn--secondary vz-btn', role: 'radio', 'aria-checked': 'true', 'data-op': '-', 'aria-label': t('a11y.op.minus') }, MINUS));
  const opSetzen = (neu) => {
    op = neu;
    opGruppe.querySelectorAll('[role="radio"]').forEach((r) => r.setAttribute('aria-checked', String(r.dataset.op === neu)));
    roving(opGruppe, '[role="radio"]', opGruppe.querySelector(`[data-op="${neu}"]`));
    gegenBtn.disabled = neu !== '-';
  };
  gruppe(opGruppe, '[role="radio"]', (r) => opSetzen(r.dataset.op));

  const startBtn = knopf('btn.starten', {}, false);
  const gegenBtn = knopf('btn.gegenzahl');
  const resetBtn = knopf('btn.zuruecksetzen');
  const termAnzeige = h('div', { class: 'term-anzeige', 'aria-live': 'polite' });

  function werte() {
    const x = a.wert();
    const y = b.wert();
    if (x === null || y === null || Math.abs(x) > GRENZE || Math.abs(y) > GRENZE) return null;
    return [x, y];
  }

  function los(mitGegenzahl) {
    const w = werte();
    if (!w) {
      meldung.replaceChildren(rm.hinweis(t('feedback.keine_antwort')));
      return;
    }
    meldung.replaceChildren();
    const [x, y] = w;
    const term = asciiZahl(x) + ' ' + op + ' ' + asciiZahl(y);
    const gezeigt = mitGegenzahl ? asciiZahl(x) + ' + ' + asciiZahl(-y) : term;
    const bahn = schritteAusTerm(gezeigt);
    const sp = bahn.schritte[0];
    termAnzeige.replaceChildren(termElement(term));
    const punkte = [
      t('zs.steht_auf', { n: fmt(bahn.start) }),
      t(sp.blick > 0 ? 'zs.blick_rechts' : 'zs.blick_links'),
      t(sp.gang > 0 ? 'zs.vorwaerts' : 'zs.rueckwaerts'),
      t('label.ergebnis') + ': ' + fmt(bahn.ziel),
    ];
    if (mitGegenzahl) {
      termAnzeige.append(h('p', { class: 'ui' }, t('zs.gegenzahl_term', { term: anzeigen(gezeigt) })));
      punkte.push(t('zs.gegenzahl_erklaerung', { b: fmt(y), gegenzahl: fmt(-y), ergebnis: fmt(bahn.ziel) }));
    }
    erklaerung.replaceChildren(...punkte.map((p) => h('li', {}, p)));
    zs.zuruecksetzen(bahn.start, sp.blick);
    zs.gehen(bahn.schritte);
  }

  startBtn.addEventListener('click', () => los(false));
  gegenBtn.addEventListener('click', () => los(true));
  resetBtn.addEventListener('click', () => {
    zs.zuruecksetzen(0, 1);
    erklaerung.replaceChildren();
    termAnzeige.replaceChildren();
    meldung.replaceChildren();
  });
  opSetzen('-');

  const muster = daten.muster.filter((m) => m.reiter === REITER);
  el.replaceChildren(
    h('div', { class: 'eingabe-zeile' },
      a.el,
      h('div', { class: 'zahl-eingabe', role: 'group', 'aria-labelledby': opLabelId },
        h('span', { id: opLabelId, class: 'ui ui-label' }, t('label.rechenzeichen')), opGruppe),
      b.el),
    h('div', { class: 'btn-row' }, startBtn, gegenBtn, resetBtn),
    meldung,
    termAnzeige,
    h('div', { class: 'scene zs-scene' }, zs.el),
    legende(),
    erklaerung,
    ...muster.map((m) => musterBlock(m, REGELN)),
  );
}
