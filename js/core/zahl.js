// Zahlen anzeigen und vorlesen. Das Minus ist immer U+2212.
import { t, aktuelleSprache } from './i18n.js';

export const MINUS = String.fromCharCode(0x2212);
export const MAL = String.fromCharCode(0x00b7); // Mal-Punkt
export const GETEILT = ':';

// Bindestrich und typografische Striche (U+2010 bis U+2015) werden zum Minus.
const STRICHE = new RegExp("[-" + String.fromCharCode(0x2010) + "-" + String.fromCharCode(0x2015) + "]", "g");

const formate = new Map();
function format() {
  const lang = aktuelleSprache();
  if (!formate.has(lang)) formate.set(lang, new Intl.NumberFormat(lang === 'de' ? 'de-CH' : lang, { useGrouping: false }));
  return formate.get(lang);
}

// fmt(-3) → "−3"; mitPlus: fmt(3, true) → "+3"
export function fmt(n, mitPlus = false) {
  const text = format()
    .formatToParts(n)
    .map((p) => (p.type === 'minusSign' ? MINUS : p.value))
    .join('')
    .replace(STRICHE, MINUS);
  return mitPlus && n > 0 ? '+' + text : text;
}

// Für aria-label und aria-valuetext: Screenreader lesen U+2212 nicht zuverlässig.
export function sprich(n) {
  if (n < 0) return t('a11y.minus') + ' ' + fmt(-n);
  return fmt(n);
}

// Koordinatenpaar wie im Unterricht: (−3 | 4)
export function fmtPunkt([x, y]) {
  return '(' + fmt(x) + ' | ' + fmt(y) + ')';
}
