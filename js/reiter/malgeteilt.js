// Reiter 3: Vorzeichenregeln für Mal und geteilt aus Mustern entdecken, dann anwenden.
import { h } from '../ui/dom.js';
import { musterBlock } from '../ui/muster.js';
import { uebungsrahmen, ansichtNachTyp } from '../ui/uebungsrahmen.js';
import { regeltabelle, beobachtungAbgeschlossen, beispielAufnehmen } from '../ui/regeltabelle.js';
import { malAnsicht } from '../aufgaben/malgeteilt.js';

const REITER = 'malgeteilt';
// Regeln, die nach der Musterfolge erscheinen
const REGELN = ['regel.mal_gleich', 'regel.mal_verschieden', 'regel.geteilt'];

// Die Musterfolge zählt als von den Lernenden gelöst: ihre Zeilen füllen die Regeltabelle.
function musterGeloest(muster) {
  muster.reihe.forEach((r) => beispielAufnehmen(r.term, r.loesung));
  beobachtungAbgeschlossen();
}

export function rendern(el, modus, daten) {
  const tabelle = regeltabelle(daten.regeltabelle, { mitKnopf: modus !== 'entdecken' });
  if (modus === 'entdecken') {
    el.replaceChildren(
      ...daten.muster.filter((m) => m.reiter === REITER).map((m) => musterBlock(m, REGELN, musterGeloest)),
      tabelle);
    return;
  }
  const flaeche = h('div');
  el.replaceChildren(flaeche, tabelle);
  uebungsrahmen({
    el: flaeche, reiter: REITER, modus, daten,
    pool: daten.aufgaben.filter((a) => a.reiter === REITER),
    ansicht: ansichtNachTyp({ rechnen: malAnsicht }),
  });
}
