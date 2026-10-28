// Aufgabentyp «rechnen»: Term anzeigen, optional Klammer auflösen, Ergebnis eingeben,
// optional Zahlenstrahl (Eingabe durch Ziehen) und Kontrolle am Zahlenstrahl.
import { t } from '../core/i18n.js';
import { fmt, MINUS } from '../core/zahl.js';
import { anzeigen, aufloesen, gegenzahlForm, zeichenAnzeige, sprechen } from '../core/term.js';
import * as diagnose from '../core/diagnose.js';
import { h, s as svg, autoFokus } from '../ui/dom.js';
import { zahlenfeld } from '../ui/zahlenfeld.js';
import * as rm from '../ui/rueckmeldung.js';
import { termElement, schritteAusTerm, strahl, legende, knopf, woerter } from './gemeinsam.js';

export function rechnenAnsicht(aufgabe, ctx) {
  const uebt = ctx.modus === 'ueben';
  const mitStrahl = aufgabe.zahlenstrahl === true;
  const bereich = aufgabe.stufe === 1 ? 10 : 20;
  const bahn = schritteAusTerm(aufgabe.term);
  const el = h('div', { class: 'aufgabe stack' });

  el.append(h('p', { class: 'ui ui-label' }, t('task.rechnen')), termElement(aufgabe.term));

  // Gegenzahl: jede Subtraktion als Addition der Gegenzahl zeigen (nicht im Check)
  let zs = null;
  let schrittTasten = [];
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
  const eingabe = zahlenfeld({
    label: 'label.ergebnis',
    ariaLabel: t('label.ergebnis') + ': ' + sprechen(aufgabe.term, woerter()),
    onEnter: () => ctx.pruefen(),
    onInput: (n) => { if (zs && n !== null) zs.setzen(n); },
  });
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
            eingabe.fokusAuto();
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
    // Antwort am Zahlenstrahl: ziehen, antippen, Pfeiltasten oder Schritt-Tasten.
    // Auf schmalen Bildschirmen sind 41 Teilstriche zu eng, darum sind die Schritt-Tasten Pflicht.
    const pfeil = (d) => svg('svg', { width: 18, height: 18, viewBox: '0 0 18 18', 'aria-hidden': 'true' },
      svg('path', { d: d < 0 ? 'M11,3 L5,9 L11,15' : 'M7,3 L13,9 L7,15', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    schrittTasten = [-1, 1].map((d) => h('button', {
      type: 'button', class: 'btn btn--secondary zs-schritt',
      'aria-label': t(d < 0 ? 'a11y.schritt_links' : 'a11y.schritt_rechts'),
      onclick: () => zs.schritt(d),
    }, pfeil(d)));
    rechnenTeil.append(
      h('p', { class: 'meta' }, t('zs.ziehen')),
      h('div', { class: 'zs-mit-tasten' }, schrittTasten[0], h('div', { class: 'scene zs-scene' }, zs.el), schrittTasten[1]),
      legende());
  }
  // Mit Zahlenstrahl ist das Zahlenfeld eine Alternative, ohne Autofokus
  rechnenTeil.append(eingabe.el);
  el.append(rechnenTeil);

  // Kontrolle am Zahlenstrahl nach Abschluss (Reiter Klammern)
  const kontrolle = h('div', { class: 'stack' });
  el.append(kontrolle);

  return {
    el,
    // Mit Zahlenstrahl zählt die Zahl, auf der die Figur steht (Feld und Figur sind gekoppelt)
    antwort: () => (zs ? zs.wert() : eingabe.wert()),
    bewerten: (a) => ({ richtig: diagnose.istRichtig(aufgabe, a), fehlertyp: diagnose.fehlertyp(aufgabe, a) }),
    loesungText: () => fmt(aufgabe.loesung),
    fokus() {
      if (rechnenTeil.hidden) el.querySelector('.aufloesen button')?.focus();
      else if (zs) { if (autoFokus()) zs.fokus(); }
      else eingabe.fokusAuto();
    },
    leeren() {
      eingabe.leeren();
      // Die Figur startet wieder auf der Startzahl
      if (zs) { zs.zuruecksetzen(bahn.start, bahn.schritte[0].blick); }
    },
    sperren() {
      eingabe.sperren(true);
      zs?.interaktiv(false);
      schrittTasten.forEach((b) => { b.disabled = true; });
      if (gegenRow) gegenRow.hidden = true;
    },
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
