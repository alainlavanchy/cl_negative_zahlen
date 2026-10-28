// Rundenablauf für «ueben» und «check».
// ueben: sofortige Rückmeldung mit Fehlertyp, Lösung erst nach dem zweiten Versuch.
// check: keine Rückmeldung während der Runde, Auswertung nach Fehlertyp am Schluss.
import { t } from '../core/i18n.js';
import { labEvent } from '../core/events.js';
import { h } from './dom.js';
import * as rm from './rueckmeldung.js';

export const RUNDE_LAENGE = 10;
let strategieNr = 0; // reihum über alle Runden

// 10 Aufgaben zufällig aus der Datei (Reihenfolge und Auswahl, keine neuen Aufgaben)
export function ziehen(pool, anzahl = RUNDE_LAENGE) {
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, anzahl);
}

// opts: { container, aufgaben, modus, reiter, stufe, daten, ansicht(aufgabe, ctx), naechsteStufe, onNeu, onNaechsteStufe }
export function runde(opts) {
  const { container, aufgaben, modus, reiter, stufe, daten } = opts;
  const ergebnisse = [];
  let index = 0;

  function aufgabeZeigen() {
    const aufgabe = aufgaben[index];
    let versuch = 0;
    let ersterFehler = null;
    let fertig = false;

    const meldung = h('div', { class: 'meldung' });
    const pruefenBtn = h('button', { type: 'button', class: 'btn' }, t('btn.pruefen'));
    const weiterBtn = h('button', { type: 'button', class: 'btn', hidden: true }, t('btn.weiter'));
    const hinweisBtn = modus === 'ueben' && aufgabe.hinweis_key
      ? h('button', { type: 'button', class: 'btn btn--secondary' }, t('btn.hinweis')) : null;
    const hinweisBox = h('div');

    const ctx = { modus, reiter, daten, pruefen: () => pruefen() };
    const ansicht = opts.ansicht(aufgabe, ctx);

    function abschluss(richtig) {
      fertig = true;
      ansicht.sperren();
      pruefenBtn.hidden = true;
      if (hinweisBtn) hinweisBtn.hidden = true;
      weiterBtn.hidden = false;
      const eintrag = { aufgabe_id: aufgabe.id, stufe: aufgabe.stufe, richtig, fehlertyp: ersterFehler, versuche: versuch };
      ergebnisse.push(eintrag);
      labEvent('progress', { reiter, stufe: aufgabe.stufe, aufgabe_id: aufgabe.id, richtig, fehlertyp: ersterFehler, versuche: versuch });
    }

    function pruefen() {
      if (fertig) return;
      const antwort = ansicht.antwort();
      if (antwort === null) {
        meldung.replaceChildren(rm.hinweis(t('feedback.keine_antwort')));
        ansicht.fokus();
        return;
      }
      versuch += 1;
      const { richtig, fehlertyp } = ansicht.bewerten(antwort);
      if (!richtig && ersterFehler === null) ersterFehler = fehlertyp;

      if (modus === 'check') {
        abschluss(richtig);
        weiter();
        return;
      }
      if (richtig) {
        meldung.replaceChildren(rm.richtig());
        abschluss(true);
        ansicht.abschliessen({ zeigeLoesung: false });
        weiterBtn.focus();
        return;
      }
      const box = ansicht.fehlerMeldung
        ? ansicht.fehlerMeldung(fehlertyp, versuch)
        : rm.falsch({ fehlertyp, fehlertypen: daten.fehlertypen, versuch, loesungText: ansicht.loesungText() });
      meldung.replaceChildren(box);
      if (versuch >= 2) {
        const loesung = ansicht.loesungText();
        if (ansicht.fehlerMeldung && loesung) box.append(h('p', {}, t('feedback.loesung_ist', { loesung })));
        abschluss(false);
        ansicht.abschliessen({ zeigeLoesung: true });
        weiterBtn.focus();
      } else {
        ansicht.fokus();
      }
    }

    pruefenBtn.addEventListener('click', pruefen);
    weiterBtn.addEventListener('click', weiter);
    hinweisBtn?.addEventListener('click', () => {
      hinweisBox.replaceChildren(rm.hinweis(t(aufgabe.hinweis_key)));
    });

    container.replaceChildren(
      modus === 'check' && index === 0 ? rm.hinweis(t('feedback.check_hinweis')) : '',
      h('p', { class: 'meta', 'aria-live': 'polite' }, t('task.nummer', { n: index + 1, gesamt: aufgaben.length })),
      ansicht.el,
      h('div', { class: 'btn-row' }, pruefenBtn, hinweisBtn, weiterBtn),
      hinweisBox,
      meldung,
    );
    ansicht.fokus();
  }

  function weiter() {
    index += 1;
    if (index < aufgaben.length) aufgabeZeigen();
    else auswertung();
  }

  function auswertung() {
    const anzahl = ergebnisse.length;
    const richtig = ergebnisse.filter((e) => e.richtig).length;
    const fehlertypen = {};
    ergebnisse.forEach((e) => { if (e.fehlertyp) fehlertypen[e.fehlertyp] = (fehlertypen[e.fehlertyp] || 0) + 1; });
    labEvent('result', { reiter, modus, stufe: stufe ?? null, anzahl, richtig, fehlertypen });

    const liste = Object.entries(fehlertypen).sort((a, b) => b[1] - a[1]);
    const fehlerInfo = (key) => daten.fehlertypen.find((f) => f.key === key);
    const teile = [
      h('h3', {}, t('result.titel')),
      h('p', { class: 'ui ergebnis-zahl' }, t('result.richtig_von', { richtig, anzahl })),
    ];
    if (liste.length) {
      teile.push(h('h4', {}, t('result.fehlertypen_titel')),
        h('ul', {}, liste.map(([key, n]) => h('li', {}, t('result.fehlertyp_zeile', { fehler: t(fehlerInfo(key)?.beschreibung_key || key), anzahl: n })))),
        h('p', {}, t('result.tipp')));
    } else if (richtig === anzahl) {
      teile.push(h('p', {}, t('result.keine_fehler')));
    }

    const knoepfe = h('div', { class: 'btn-row' });
    if (modus === 'ueben' && opts.naechsteStufe != null && richtig / anzahl >= 0.8) {
      teile.push(rm.richtig(t('feedback.stufe_geschafft', { n: stufe }) + ' ' + t('feedback.weiter_mit', { n: opts.naechsteStufe })));
      knoepfe.append(h('button', { type: 'button', class: 'btn', onclick: () => opts.onNaechsteStufe?.() }, t('btn.naechste_stufe')));
    }
    knoepfe.append(h('button', { type: 'button', class: modus === 'ueben' && knoepfe.childElementCount ? 'btn btn--secondary' : 'btn', onclick: () => opts.onNeu?.() }, t('btn.neue_runde')));

    // Strategie-Frage reihum. Die Antwort bleibt im Feld: nicht gespeichert, nicht gesendet, nicht bewertet.
    strategieNr = (strategieNr % 4) + 1;
    const feldId = 'strategie-' + reiter;
    const strategie = h('div', { class: 'card stack strategie' },
      h('h4', {}, t('strategie.titel')),
      h('label', { for: feldId }, t('strategie.' + strategieNr)),
      h('textarea', { id: feldId, rows: '3', placeholder: t('strategie.platzhalter') }),
      h('p', { class: 'meta' }, t('strategie.hinweis')));

    container.replaceChildren(h('div', { class: 'stack auswertung' }, ...teile, strategie, knoepfe));
    container.querySelector('h3').setAttribute('tabindex', '-1');
    container.querySelector('h3').focus();
    labEvent('complete', { reiter, modus });
  }

  aufgabeZeigen();
}
