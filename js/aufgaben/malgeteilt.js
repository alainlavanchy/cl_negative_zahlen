// Rechnen im Reiter «Mal und geteilt» (Üben und Check): ein Zahlenfeld wie bei den anderen
// Rechenaufgaben. Der Vorzeichen-Entscheid gehört nur zur Musterfolge im Modus «entdecken»,
// beim Üben hilft der Hinweis hint.mal.vorzeichen_zuerst. Bei der Division folgt die Umkehrprobe.
import { t } from '../core/i18n.js';
import { fmt } from '../core/zahl.js';
import { faktoren } from '../core/term.js';
import { h } from '../ui/dom.js';
import { beispielAufnehmen } from '../ui/regeltabelle.js';
import { rechnenAnsicht } from './rechnen.js';

const klammer = (n) => (n < 0 ? '(' + fmt(n) + ')' : fmt(n));

export function malAnsicht(aufgabe, ctx) {
  const ansicht = rechnenAnsicht(aufgabe, ctx);
  const probe = h('p', { class: 'ui umkehrprobe' });
  ansicht.el.append(probe);
  const abschliessen = ansicht.abschliessen;

  return {
    ...ansicht,
    abschliessen(opts = {}) {
      abschliessen(opts);
      if (!opts.zeigeLoesung) beispielAufnehmen(aufgabe.term, aufgabe.loesung);
      // Umkehrprobe: Dividend : Divisor = Ergebnis  ⇔  Ergebnis · Divisor = Dividend
      const f = faktoren(aufgabe.term);
      if (ctx.modus === 'ueben' && aufgabe.umkehrprobe && f && f.werte.length === 2) {
        probe.textContent = t('mal.umkehrprobe', { antwort: fmt(aufgabe.loesung), divisor: klammer(f.werte[1]), dividend: fmt(f.werte[0]) });
      }
    },
  };
}
