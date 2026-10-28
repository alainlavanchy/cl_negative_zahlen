// Zahlenfeld: ein Feld zeigt die ganze Zahl mit Vorzeichen (Minus als U+2212), daneben eine ±-Taste.
// Die iOS-Zahlentastatur hat kein Minus, darum ist die ±-Taste immer sichtbar.
// Das Eingabefeld enthält nur die Ziffern; das Vorzeichen steht als Präfix davor.
import { t } from '../core/i18n.js';
import { MINUS, sprich } from '../core/zahl.js';
import { h, id, autoFokus } from './dom.js';

const MAX_STELLEN = 3;
// Am Anfang angenommen: Bindestrich, Minus (U+2212), Halbgeviertstrich (U+2013) und Plus
const MINUSZEICHEN = ['-', MINUS, String.fromCharCode(0x2013)];

// opts: { label, ariaLabel, onEnter, onInput }
export function zahlenfeld({ label = 'label.ergebnis', ariaLabel, onEnter, onInput } = {}) {
  const feldId = id('zahl');
  const labelId = id('zahl-label');
  const wertId = id('zahl-wert');
  let negativ = false;

  const praefix = h('span', { class: 'zahlenfeld__vz', 'aria-hidden': 'true' });
  const feld = h('input', {
    id: feldId, type: 'text', inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false',
    class: 'zahlenfeld__eingabe', 'aria-describedby': wertId,
  });
  if (ariaLabel) feld.setAttribute('aria-label', ariaLabel);
  else feld.setAttribute('aria-labelledby', labelId);
  const vorgelesen = h('span', { id: wertId, class: 'visually-hidden' });
  const taste = h('button', { type: 'button', class: 'btn btn--secondary zahlenfeld__taste', 'aria-pressed': 'false' }, '±');

  function anzeigen() {
    praefix.textContent = negativ ? MINUS : '';
    taste.setAttribute('aria-pressed', String(negativ));
    taste.setAttribute('aria-label', t('btn.vorzeichen') + ': ' + t(negativ ? 'a11y.minus' : 'a11y.plus'));
    const w = wert();
    vorgelesen.textContent = w === null ? (negativ ? t('a11y.minus') : '') : sprich(w);
  }

  // Normalisiert die Eingabe: Vorzeichen nur am Anfang, sonst nur Ziffern, höchstens drei Stellen.
  function normalisieren() {
    let roh = feld.value;
    const erstes = roh.charAt(0);
    if (MINUSZEICHEN.includes(erstes)) { negativ = true; roh = roh.slice(1); }
    else if (erstes === '+') { negativ = false; roh = roh.slice(1); }
    const ziffern = roh.replace(/[^0-9]/g, '').slice(0, MAX_STELLEN);
    if (ziffern !== feld.value) feld.value = ziffern;
    anzeigen();
    onInput?.(wert());
  }

  function wert() {
    if (!/^[0-9]+$/.test(feld.value)) return null;
    const n = Number(feld.value);
    return negativ && n !== 0 ? -n : n;
  }

  feld.addEventListener('input', normalisieren);
  feld.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onEnter?.(); }
    // Löschen im leeren Feld entfernt das Minus
    else if (e.key === 'Backspace' && feld.value === '' && negativ) { e.preventDefault(); negativ = false; anzeigen(); onInput?.(wert()); }
  });
  taste.addEventListener('click', () => {
    negativ = !negativ;
    anzeigen();
    onInput?.(wert());
  });

  const el = h('div', { class: 'zahlenfeld' },
    h('label', { id: labelId, class: 'ui ui-label', for: feldId }, t(label)),
    h('div', { class: 'zahlenfeld__zeile' },
      h('div', { class: 'zahlenfeld__rahmen', onclick: () => feld.focus() }, praefix, feld),
      taste),
    vorgelesen);
  anzeigen();

  return {
    el,
    wert,
    setzen(n) {
      if (n === null || n === undefined) { feld.value = ''; negativ = false; }
      else { feld.value = String(Math.abs(n)); negativ = n < 0; }
      anzeigen();
    },
    leeren() { feld.value = ''; negativ = false; anzeigen(); },
    fokus() { feld.focus(); },
    // Automatischer Fokus nur ohne Touch, sonst öffnet sich ungefragt die Tastatur
    fokusAuto() { if (autoFokus()) feld.focus(); },
    sperren(an) { feld.disabled = an; taste.disabled = an; },
  };
}
