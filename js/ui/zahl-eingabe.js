// Zahleneingabe: Vorzeichen-Schalter (+ und −, aria-pressed) plus Feld für den Betrag.
// iOS-Zahlentastaturen haben kein Minus; das trennt zugleich Vorzeichen und Betrag.
import { t } from '../core/i18n.js';
import { MINUS } from '../core/zahl.js';
import { h, id } from './dom.js';

export function zahlEingabe({ label = 'label.antwort', onEnter, onInput } = {}) {
  const feldId = id('betrag');
  const labelId = id('zahl-label');
  let vorzeichen = 1;

  const plus = h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'true', 'aria-label': t('a11y.op.plus') }, '+');
  const minus = h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'aria-label': t('a11y.op.minus') }, MINUS);
  const feld = h('input', {
    id: feldId, type: 'text', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off',
    maxlength: '3', class: 'betrag-feld', 'aria-describedby': labelId,
  });

  function vzSetzen(v) {
    vorzeichen = v;
    plus.setAttribute('aria-pressed', String(v > 0));
    minus.setAttribute('aria-pressed', String(v < 0));
    onInput?.(wert());
  }
  plus.addEventListener('click', () => vzSetzen(1));
  minus.addEventListener('click', () => vzSetzen(-1));
  feld.addEventListener('input', () => {
    const nurZiffern = feld.value.replace(/[^0-9]/g, '');
    if (nurZiffern !== feld.value) feld.value = nurZiffern;
    onInput?.(wert());
  });
  feld.addEventListener('keydown', (e) => {
    // Auf Tastaturen mit Minus: «-» und «+» schalten das Vorzeichen
    if (e.key === '-') { e.preventDefault(); vzSetzen(-1); }
    else if (e.key === '+') { e.preventDefault(); vzSetzen(1); }
    else if (e.key === 'Enter') { e.preventDefault(); onEnter?.(); }
  });

  const el = h('div', { class: 'zahl-eingabe', role: 'group', 'aria-labelledby': labelId },
    h('span', { id: labelId, class: 'ui ui-label' }, t(label)),
    h('div', { class: 'segmented', role: 'group', 'aria-label': t('label.vorzeichen') }, plus, minus),
    h('label', { class: 'visually-hidden', for: feldId }, t('label.betrag')),
    feld,
  );

  function wert() {
    if (feld.value === '') return null;
    const n = Number(feld.value);
    return n === 0 ? 0 : vorzeichen * n;
  }

  return {
    el,
    wert,
    setzen(n) {
      if (n === null) { feld.value = ''; vzSetzen(1); return; }
      feld.value = String(Math.abs(n));
      vzSetzen(n < 0 ? -1 : 1);
    },
    fokus() { feld.focus(); },
    sperren(an) { [plus, minus, feld].forEach((x) => { x.disabled = an; }); },
  };
}
