// Aufgabentyp «rechnen»: Term anzeigen, optional Klammer auflösen, Ergebnis eingeben,
// optional Zahlenstrahl (Eingabe durch Ziehen) und Kontrolle am Zahlenstrahl.
import { t } from '../core/i18n.js';
import { fmt, MINUS } from '../core/zahl.js';
import { anzeigen, aufloesen, gegenzahlForm, zeichenAnzeige } from '../core/term.js';
import * as diagnose from '../core/diagnose.js';
import { h } from '../ui/dom.js';
import { zahlEingabe } from '../ui/zahl-eingabe.js';
import * as rm from '../ui/rueckmeldung.js';
import { termElement, schritteAusTerm, strahl, legende, knopf } from './gemeinsam.js';

export function rechnenAnsicht(aufgabe, ctx) {
  const uebt = ctx.modus === 'ueben';
  const mitStrahl = aufgabe.zahlenstrahl === true;
  const bereich = aufgabe.stufe === 1 ? 10 : 20;
  const bahn = schritteAusTerm(aufgabe.term);
  const el = h('div', { class: 'aufgabe stack' });

  el.append(h('p', { class: 'ui ui-label' }, t('task.rechnen')), termElement(aufgabe.term));

  // Gegenzahl: jede Subtraktion als Addition der Gegenzahl zeigen (nicht im Check)
  let zs = null;
  let gegenRow = null;
  const gegen = gegenzahlForm(aufgabe.term);
  if (uebt && gegen) {
    const ausgabe = h('p', { class: 'ui gegenzahl-ausgabe', 'aria-live': 'polite' });
    const btn = knopf('btn.gegenzahl', { 'aria-pressed': 'false' });
    btn.addEventListener('click', () => {
      const an = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(an));
      ausgabe.textContent = an ? t('zs.gegenzahl_term', { term: anzeigen(gegen) }) : '';
      // Mit der Gegenzahl schaut die Figur in die Richtung des neuen Summanden
      const neueBahn = schritteAusTerm(an ? gegen : aufgabe.term);
      if (zs && neueBahn && neueBahn.schritte.length) zs.blick(neueBahn.schritte[0].blick);
    });
    gegenRow = h('div', { class: 'btn-row' }, btn);
    el.append(gegenRow, ausgabe);
  }

  // Schritt 2: Klammer auflösen (Reiter Klammern, nur beim Üben)
  const aufl = ctx.reiter === 'klammern' && uebt ? aufloesen(aufgabe.term) : null;
  const eingabe = zahlEingabe({ label: 'label.ergebnis', onEnter: () => ctx.pruefen(), onInput: (n) => { if (zs && n !== null) zs.setzen(n); } });
  const rechnenTeil = h('div', { class: 'stack' });

  if (aufl && aufl.paare.length) {
    const auflTeil = h('div', { class: 'stack aufloesen' }, h('h4', {}, t('kl.schritt2')));
    const ergebnisZeile = h('p', { class: 'ui', 'aria-live': 'polite' });
    let offen = aufl.paare.length;
    aufl.paare.forEach((paar) => {
      const paarText = zeichenAnzeige(paar.links) + ' (' + zeichenAnzeige(paar.rechts) + paar.betrag + ')';
      const meldung = h('div');
      const wahl = (zeichen) => {
        const btns = gruppe.querySelectorAll('button');
        btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zeichen === zeichen)));
        const regel = paar.links === paar.rechts ? 'kl.zeichen_gleich' : 'kl.zeichen_verschieden';
        if (zeichen === paar.ergebnis) {
          meldung.replaceChildren(rm.richtig(t(regel)));
          btns.forEach((b) => { b.disabled = true; });
          offen -= 1;
          if (offen === 0) {
            ergebnisZeile.textContent = t('kl.aufgeloest', { term: anzeigen(aufl.term) });
            rechnenTeil.hidden = false;
            eingabe.fokus();
          }
        } else {
          meldung.replaceChildren(rm.fehlerText(t(regel)));
        }
      };
      const gruppe = h('div', { class: 'segmented', role: 'group', 'aria-label': t('kl.paar_frage', { paar: paarText }) },
        h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'data-zeichen': '+', 'aria-label': t('a11y.op.plus'), onclick: () => wahl('+') }, '+'),
        h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'data-zeichen': '-', 'aria-label': t('a11y.op.minus'), onclick: () => wahl('-') }, MINUS));
      auflTeil.append(h('div', { class: 'paar' }, h('p', { class: 'ui' }, t('kl.paar_frage', { paar: paarText })), gruppe, meldung));
    });
    auflTeil.append(ergebnisZeile);
    el.append(auflTeil);
    rechnenTeil.hidden = true;
    rechnenTeil.append(h('h4', {}, t('kl.schritt3')));
  }

  if (mitStrahl && bahn) {
    zs = strahl({
      bereich, start: bahn.start,
      onChange: (n) => eingabe.setzen(n),
      onConfirm: () => ctx.pruefen(),
    });
    zs.blick(bahn.schritte[0].blick);
    rechnenTeil.append(h('p', { class: 'meta' }, t('zs.ziehen')), h('div', { class: 'scene zs-scene' }, zs.el), legende());
  }
  rechnenTeil.append(eingabe.el);
  el.append(rechnenTeil);

  // Kontrolle am Zahlenstrahl nach Abschluss (Reiter Klammern)
  const kontrolle = h('div', { class: 'stack' });
  el.append(kontrolle);

  return {
    el,
    antwort: () => eingabe.wert(),
    bewerten: (a) => ({ richtig: diagnose.istRichtig(aufgabe, a), fehlertyp: diagnose.fehlertyp(aufgabe, a) }),
    loesungText: () => fmt(aufgabe.loesung),
    fokus: () => (rechnenTeil.hidden ? el.querySelector('.aufloesen button')?.focus() : eingabe.fokus()),
    sperren() { eingabe.sperren(true); zs?.interaktiv(false); if (gegenRow) gegenRow.hidden = true; },
    async abschliessen() {
      if (!bahn || !uebt) return;
      if (zs) {
        zs.interaktiv(false);
        await zs.gehen(bahn.schritte);
        return;
      }
      const kontrollStrahl = strahl({ bereich: 20, start: bahn.start, interaktiv: false });
      kontrolle.append(h('p', { class: 'ui' }, t('kl.kontrolle')), h('div', { class: 'scene zs-scene' }, kontrollStrahl.el), legende());
      await kontrollStrahl.gehen(bahn.schritte);
    },
  };
}
