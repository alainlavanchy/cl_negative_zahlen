// Musterfolge im Modus «entdecken»: Lücken ergänzen, ohne Wertung.
// Die Regel erscheint erst, wenn alle Lücken ausgefüllt sind und die Lernenden sie aufrufen.
import { t } from '../core/i18n.js';
import { fmt } from '../core/zahl.js';
import { h } from './dom.js';
import { zahlEingabe } from './zahl-eingabe.js';
import { termElement } from '../aufgaben/gemeinsam.js';

// onRegel(muster) wird aufgerufen, sobald die Regel erscheint (Beobachtung abgeschlossen).
export function musterBlock(muster, regelKeys, onRegel) {
  const eingaben = new Map();
  const vergleich = new Map();
  const regelBox = h('div');
  const zeigenBtn = h('button', { type: 'button', class: 'btn', disabled: true }, t('muster.regel_zeigen'));

  const pruefeVollstaendig = () => {
    zeigenBtn.disabled = [...eingaben.values()].some((e) => e.wert() === null);
  };

  const zeilen = muster.reihe.map((r, i) => {
    const istLuecke = muster.luecken.includes(i);
    let zelle;
    if (istLuecke) {
      const e = zahlEingabe({ label: 'muster.luecke', onInput: pruefeVollstaendig });
      eingaben.set(i, e);
      zelle = e.el;
    } else {
      zelle = h('span', { class: 'term-wert' }, fmt(r.loesung));
    }
    const vgl = h('td', { class: 'muster-vergleich' });
    vergleich.set(i, vgl);
    return h('tr', {}, h('td', {}, termElement(r.term, 'term term--klein')), h('td', {}, zelle), vgl);
  });

  zeigenBtn.addEventListener('click', () => {
    // Neben die eigenen Einträge kommt das Ergebnis, ohne Markierung richtig oder falsch.
    muster.luecken.forEach((i) => {
      vergleich.get(i).textContent = t('label.ergebnis') + ': ' + fmt(muster.reihe[i].loesung);
    });
    regelBox.replaceChildren(h('div', { class: 'callout stack', role: 'status' },
      h('h4', {}, t('regel.titel')),
      ...regelKeys.map((k) => h('p', {}, t(k)))));
    zeigenBtn.hidden = true;
    onRegel?.(muster);
  });

  return h('section', { class: 'card stack muster' },
    h('h3', {}, t('muster.titel')),
    h('p', {}, t(muster.frage_key)),
    h('table', { class: 'muster-tabelle' }, h('tbody', {}, zeilen)),
    zeigenBtn,
    regelBox);
}
