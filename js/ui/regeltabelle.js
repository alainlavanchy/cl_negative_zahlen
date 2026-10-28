// Regeltabelle (+/+, +/−, −/+, −/−). Sie füllt sich mit Beispielen, die die Lernenden selbst gelöst haben,
// und ist erst nach der Beobachtungsaufgabe sichtbar. Beispiele bleiben nur in dieser Sitzung.
import { t } from '../core/i18n.js';
import { MINUS } from '../core/zahl.js';
import { faktoren, anzeigen } from '../core/term.js';
import * as store from '../core/store.js';
import { h, id } from './dom.js';

const MAX_BEISPIELE = 3;
const beispiele = new Map(); // "+|-" → [Anzeigetext]
let beobachtet = store.lesen('malgeteilt:beobachtet') === '1';
let regeln = [];

const vz = (n) => (n < 0 ? '-' : '+');

export function istBeobachtet() {
  return beobachtet;
}

export function beobachtungAbgeschlossen() {
  beobachtet = true;
  store.schreiben('malgeteilt:beobachtet', '1');
  aktualisieren();
}

// Nimmt einen gelösten Term mit genau zwei Faktoren auf (Mal oder geteilt). Null zählt nicht.
export function beispielAufnehmen(term, ergebnis) {
  const f = faktoren(term);
  if (!f || f.werte.length !== 2 || f.werte.includes(0) || ergebnis === 0) return;
  const key = vz(f.werte[0]) + '|' + vz(f.werte[1]);
  const liste = beispiele.get(key) || [];
  const text = anzeigen(term) + ' = ' + anzeigen(String(ergebnis));
  if (!liste.includes(text)) liste.push(text);
  beispiele.set(key, liste.slice(-MAX_BEISPIELE));
  aktualisieren();
}

function zeichenZelle(z) {
  return [h('span', { 'aria-hidden': 'true' }, z === '-' ? MINUS : '+'), h('span', { class: 'visually-hidden' }, t(z === '-' ? 'a11y.op.minus' : 'a11y.op.plus'))];
}

// Sichtbar nach der Beobachtung, sonst nur über den Knopf (Modus gesperrt auf üben oder check).
function fuellen(el) {
  const knopf = el.parentElement?.querySelector('.regeltabelle-knopf');
  if (knopf) knopf.hidden = beobachtet;
  el.hidden = !beobachtet && el.dataset.offen !== '1';
  if (el.hidden) return;
  const zeilen = regeln.map((r) => {
    const liste = beispiele.get(r.faktor_a + '|' + r.faktor_b) || [];
    // Das Ergebnis-Vorzeichen erscheint erst, wenn es ein eigenes Beispiel dafür gibt.
    return h('tr', {},
      h('td', {}, zeichenZelle(r.faktor_a)),
      h('td', {}, zeichenZelle(r.faktor_b)),
      h('td', {}, liste.length ? zeichenZelle(r.ergebnis) : ''),
      h('td', { class: 'beispiele' }, liste.map((b) => h('span', { class: 'beispiel' }, b))));
  });
  const leer = [...beispiele.values()].some((l) => l.length) ? null : h('p', { class: 'meta' }, t('mal.tabelle_leer'));
  el.replaceChildren(
    h('h4', {}, t('mal.tabelle_titel')),
    h('table', { class: 'regeltabelle-tab' },
      h('thead', {}, h('tr', {},
        h('th', { scope: 'col' }, t('mal.tabelle_a')),
        h('th', { scope: 'col' }, t('mal.tabelle_b')),
        h('th', { scope: 'col' }, t('mal.tabelle_ergebnis')),
        h('th', { scope: 'col' }, t('mal.tabelle_beispiele')))),
      h('tbody', {}, zeilen)),
    leer || '');
}

function aktualisieren() {
  document.querySelectorAll('.regeltabelle').forEach(fuellen);
}

// mitKnopf: Vor der Beobachtung lässt sich die Tabelle mit einem Knopf öffnen und schliessen.
export function regeltabelle(datenRegeln, { mitKnopf = false } = {}) {
  regeln = datenRegeln;
  const el = h('section', { class: 'card stack regeltabelle', id: id('regeltabelle'), 'aria-live': 'polite' });
  const rahmen = h('div', { class: 'stack' });
  if (mitKnopf) {
    const knopf = h('button', { type: 'button', class: 'btn btn--secondary regeltabelle-knopf', 'aria-expanded': 'false', 'aria-controls': el.id }, t('mal.tabelle_zeigen'));
    knopf.addEventListener('click', () => {
      const offen = el.dataset.offen !== '1';
      el.dataset.offen = offen ? '1' : '0';
      knopf.setAttribute('aria-expanded', String(offen));
      knopf.textContent = t(offen ? 'mal.tabelle_schliessen' : 'mal.tabelle_zeigen');
      fuellen(el);
    });
    rahmen.append(h('div', { class: 'btn-row' }, knopf));
  }
  rahmen.append(el);
  fuellen(el);
  return rahmen;
}
