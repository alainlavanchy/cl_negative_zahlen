// Gemeinsame Bausteine für Aufgaben-Ansichten.
import { t } from '../core/i18n.js';
import { fmt, sprich } from '../core/zahl.js';
import { anzeigen, sprechen, bewegungen, zeichenAnzeige } from '../core/term.js';
import { h } from '../ui/dom.js';
import { zahlenstrahl, legendenSymbol } from '../komponenten/zahlenstrahl.js';

export function woerter() {
  return {
    plus: t('a11y.op.plus'), minus: t('a11y.op.minus'), mal: t('a11y.op.mal'),
    geteilt: t('a11y.op.geteilt'), auf: t('a11y.klammer_auf'), zu: t('a11y.klammer_zu'),
  };
}

// Term gross anzeigen; Screenreader bekommen die ausgeschriebene Fassung.
export function termElement(term, klasse = 'term') {
  return h('p', { class: klasse },
    h('span', { class: 'visually-hidden' }, sprechen(term, woerter())),
    h('span', { 'aria-hidden': 'true' }, anzeigen(term)));
}

// Schritte für den Zahlenstrahl aus einem Strich-Term, mit Beschriftung je Schritt («− (−3)»).
export function schritteAusTerm(term) {
  const b = bewegungen(term);
  if (!b) return null;
  return {
    start: b.start,
    ziel: b.ziel,
    schritte: b.schritte.map((sp) => ({
      von: sp.von, nach: sp.nach, blick: sp.blick, gang: sp.gang, wert: sp.wert,
      label: zeichenAnzeige(sp.op) + ' ' + anzeigen(sp.glied),
    })),
  };
}

// Zahlenstrahl mit den Texten des Labs
export function strahl({ bereich = 10, start = 0, interaktiv = true, onChange, onConfirm } = {}) {
  return zahlenstrahl({
    min: -bereich, max: bereich, start, interaktiv,
    fmt: (n) => fmt(n, true),
    ariaName: t('a11y.zahlenstrahl', { min: sprich(-bereich), max: sprich(bereich) }),
    ariaWert: (n) => t('a11y.figur_steht', { n: sprich(n) }),
    onChange, onConfirm,
  });
}

export function legende() {
  return h('ul', { class: 'zs-legende ui' },
    h('li', {}, legendenSymbol('positiv'), ' ', t('legend.positiv')),
    h('li', {}, legendenSymbol('negativ'), ' ', t('legend.negativ')));
}

export function knopf(key, attrs = {}, sekundaer = true) {
  return h('button', { type: 'button', class: sekundaer ? 'btn btn--secondary' : 'btn', ...attrs }, t(key));
}
