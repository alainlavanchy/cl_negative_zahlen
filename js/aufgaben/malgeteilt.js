// Rechnen im Reiter «Mal und geteilt»: zuerst das Vorzeichen des Ergebnisses entscheiden,
// dann den Betrag. Bei der Division folgt die Umkehrprobe.
import { t } from '../core/i18n.js';
import { fmt, MINUS } from '../core/zahl.js';
import { faktoren } from '../core/term.js';
import * as diagnose from '../core/diagnose.js';
import { h, id } from '../ui/dom.js';
import { beispielAufnehmen } from '../ui/regeltabelle.js';
import { termElement } from './gemeinsam.js';

const klammer = (n) => (n < 0 ? '(' + fmt(n) + ')' : fmt(n));

export function malAnsicht(aufgabe, ctx) {
  const uebt = ctx.modus === 'ueben';
  let vorzeichen = 0; // noch nicht entschieden
  const feldId = id('betrag');

  const plus = h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'aria-label': t('a11y.op.plus') }, '+');
  const minus = h('button', { type: 'button', class: 'btn btn--secondary vz-btn', 'aria-pressed': 'false', 'aria-label': t('a11y.op.minus') }, MINUS);
  const feld = h('input', { id: feldId, type: 'text', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off', maxlength: '3', class: 'betrag-feld' });
  const betragTeil = h('div', { class: 'zahl-eingabe', hidden: true },
    h('label', { class: 'ui ui-label', for: feldId }, t('mal.betrag')), feld);
  const probe = h('p', { class: 'ui umkehrprobe' });

  function vzSetzen(v) {
    vorzeichen = v;
    plus.setAttribute('aria-pressed', String(v > 0));
    minus.setAttribute('aria-pressed', String(v < 0));
    const neu = betragTeil.hidden;
    betragTeil.hidden = false;
    if (neu) feld.focus();
  }
  plus.addEventListener('click', () => vzSetzen(1));
  minus.addEventListener('click', () => vzSetzen(-1));
  feld.addEventListener('input', () => { feld.value = feld.value.replace(/[^0-9]/g, ''); });
  feld.addEventListener('keydown', (e) => {
    if (e.key === '-') { e.preventDefault(); vzSetzen(-1); }
    else if (e.key === '+') { e.preventDefault(); vzSetzen(1); }
    else if (e.key === 'Enter') { e.preventDefault(); ctx.pruefen(); }
  });

  const vzLabel = id('vz-label');
  const el = h('div', { class: 'aufgabe stack' },
    h('p', { class: 'ui ui-label' }, t('task.rechnen')),
    termElement(aufgabe.term),
    h('div', { class: 'zahl-eingabe' },
      h('span', { id: vzLabel, class: 'ui ui-label' }, t('mal.vz_entscheid')),
      h('div', { class: 'segmented', role: 'group', 'aria-labelledby': vzLabel }, plus, minus)),
    betragTeil,
    probe);

  return {
    el,
    antwort() {
      if (!vorzeichen || feld.value === '') return null;
      return vorzeichen * Number(feld.value);
    },
    bewerten: (a) => ({ richtig: diagnose.istRichtig(aufgabe, a), fehlertyp: diagnose.fehlertyp(aufgabe, a) }),
    loesungText: () => fmt(aufgabe.loesung),
    fokus: () => (vorzeichen ? feld.focus() : plus.focus()),
    sperren() { [plus, minus, feld].forEach((x) => { x.disabled = true; }); },
    abschliessen({ zeigeLoesung } = {}) {
      if (!zeigeLoesung) beispielAufnehmen(aufgabe.term, aufgabe.loesung);
      // Umkehrprobe: Dividend : Divisor = Ergebnis  ⇔  Ergebnis · Divisor = Dividend
      const f = faktoren(aufgabe.term);
      if (uebt && aufgabe.umkehrprobe && f && f.werte.length === 2) {
        probe.textContent = t('mal.umkehrprobe', { antwort: fmt(aufgabe.loesung), divisor: klammer(f.werte[1]), dividend: fmt(f.werte[0]) });
      }
    },
  };
}
