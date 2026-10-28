// Rahmen für «ueben» (Stufe wählen, Runde) und «check» (gemischte Runde) eines Reiters.
import { t } from '../core/i18n.js';
import * as store from '../core/store.js';
import { h } from './dom.js';
import { gruppe, roving } from './aria-gruppen.js';
import { runde, ziehen } from './runde.js';

// opts: { el, reiter, modus, daten, pool(modus) → Aufgaben, ansicht }
export function uebungsrahmen({ el, reiter, modus, daten, pool, ansicht }) {
  const flaeche = h('div', { class: 'stack runde' });

  if (modus === 'check') {
    const start = () => runde({
      container: flaeche, aufgaben: ziehen(pool.filter((a) => a.modi.includes('check'))),
      modus, reiter, stufe: null, daten, ansicht, onNeu: start,
    });
    el.replaceChildren(flaeche);
    start();
    return;
  }

  // Üben: Stufen dieses Reiters, frei wählbar
  const uebPool = pool.filter((a) => a.modi.includes('ueben'));
  const stufen = [...new Set(uebPool.map((a) => String(a.stufe)))]
    .sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));
  const labelId = 'stufen-label-' + reiter;
  const wahl = h('div', { class: 'segmented stufenwahl', role: 'radiogroup', 'aria-labelledby': labelId },
    stufen.map((st) => h('button', {
      type: 'button', class: 'btn btn--secondary', role: 'radio', 'aria-checked': 'false', 'data-stufe': st,
      title: t('stufe.' + st),
    }, t('stufe.label', { n: st }))));
  const beschreibung = h('p', { class: 'meta' });

  function starten(st) {
    wahl.querySelectorAll('[role="radio"]').forEach((r) => r.setAttribute('aria-checked', String(r.dataset.stufe === st)));
    roving(wahl, '[role="radio"]', wahl.querySelector(`[data-stufe="${st}"]`));
    beschreibung.textContent = t('stufe.' + st);
    store.schreiben('stufe:' + reiter, st);
    const naechste = stufen[stufen.indexOf(st) + 1] ?? null;
    runde({
      container: flaeche,
      aufgaben: ziehen(uebPool.filter((a) => String(a.stufe) === st)),
      modus, reiter, stufe: isNaN(Number(st)) ? st : Number(st), daten, ansicht,
      naechsteStufe: naechste,
      onNeu: () => starten(st),
      onNaechsteStufe: () => starten(naechste),
    });
  }

  gruppe(wahl, '[role="radio"]', (r) => starten(r.dataset.stufe));
  const gemerkt = store.lesen('stufe:' + reiter);
  el.replaceChildren(
    h('div', { class: 'steuerung' }, h('span', { id: labelId, class: 'ui ui-label' }, t('stufe.waehlen')), wahl),
    beschreibung,
    flaeche);
  starten(stufen.includes(gemerkt) ? gemerkt : stufen[0]);
}

// Wählt die Ansicht je Aufgabentyp
export function ansichtNachTyp(ansichten) {
  return (aufgabe, ctx) => {
    const fabrik = ansichten[aufgabe.typ];
    if (!fabrik) throw new Error('Keine Ansicht für Typ ' + aufgabe.typ);
    return fabrik(aufgabe, ctx);
  };
}
