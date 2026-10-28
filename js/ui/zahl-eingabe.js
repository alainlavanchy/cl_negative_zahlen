// Vorzeichen-Entscheid: zuerst das Vorzeichen wählen (+ oder −, aria-pressed), dann den Betrag.
// Nur dort, wo die Zweiteilung didaktisch gebraucht wird (Musterfolge «Mal und geteilt» im Modus
// «entdecken»). Für alle anderen Eingaben gilt das Zahlenfeld (zahlenfeld.js).
import { t } from '../core/i18n.js';
import { MINUS } from '../core/zahl.js';
import { h, id } from './dom.js';

// opts: { vzLabel, betragLabel, onEnter, onInput }. Ohne Vorauswahl: Erst nach dem Vorzeichen erscheint das Betragsfeld.
export function vorzeichenEntscheid({ vzLabel = 'mal.vz_entscheid', betragLabel = 'mal.betrag', onEnter, onInput } = {}) {
  const feldId = id('betrag');
  const vzId = id('vz-label');
  let vorzeichen = 0; // noch nicht entschieden

  const plus = h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'aria-label': t('a11y.op.plus') }, '+');
  const minus = h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'aria-label': t('a11y.op.minus') }, MINUS);
  const feld = h('input', { id: feldId, type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: '3', class: 'betrag-feld' });
  const betragTeil = h('div', { class: 'zahl-eingabe', hidden: true },
    h('label', { class: 'ui ui-label', for: feldId }, t(betragLabel)), feld);

  function wert() {
    if (!vorzeichen || feld.value === '') return null;
    const n = Number(feld.value);
    return n === 0 ? 0 : vorzeichen * n;
  }
  function vzSetzen(v) {
    vorzeichen = v;
    plus.setAttribute('aria-pressed', String(v > 0));
    minus.setAttribute('aria-pressed', String(v < 0));
    betragTeil.hidden = false;
    onInput?.(wert());
  }
  plus.addEventListener('click', () => vzSetzen(1));
  minus.addEventListener('click', () => vzSetzen(-1));
  feld.addEventListener('input', () => {
    feld.value = feld.value.replace(/[^0-9]/g, '');
    onInput?.(wert());
  });
  feld.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onEnter?.(); }
  });

  const el = h('div', { class: 'stack vz-entscheid' },
    h('div', { class: 'zahl-eingabe' },
      h('span', { id: vzId, class: 'ui ui-label' }, t(vzLabel)),
      h('div', { class: 'segmented', role: 'group', 'aria-labelledby': vzId }, plus, minus)),
    betragTeil);

  return {
    el,
    wert,
    fokus() { (vorzeichen ? feld : plus).focus(); },
    sperren(an) { [plus, minus, feld].forEach((x) => { x.disabled = an; }); },
  };
}
