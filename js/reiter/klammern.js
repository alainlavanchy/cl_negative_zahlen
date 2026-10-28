// Reiter 2: Vorzeichen und Rechenzeichen trennen, Klammern auflösen, rechnen.
import { uebungsrahmen, ansichtNachTyp } from '../ui/uebungsrahmen.js';
import { musterBlock } from '../ui/muster.js';
import { rechnenAnsicht } from '../aufgaben/rechnen.js';
import { zeichenAnsicht } from '../aufgaben/zeichen.js';

const REITER = 'klammern';
// Regel je Musterfolge dieses Reiters (Subtrahieren bzw. Addieren einer negativen Zahl)
const REGELN = {
  minus: ['regel.subtrahieren_negativ'],
  plus: ['regel.addieren_negativ'],
};

export function rendern(el, modus, daten) {
  if (modus === 'entdecken') {
    el.replaceChildren(...daten.muster
      .filter((m) => m.reiter === REITER)
      .map((m) => musterBlock(m, REGELN[m.operation] || [])));
    return;
  }
  uebungsrahmen({
    el, reiter: REITER, modus, daten,
    pool: daten.aufgaben.filter((a) => a.reiter === REITER),
    ansicht: ansichtNachTyp({ rechnen: rechnenAnsicht, zeichen_markieren: zeichenAnsicht }),
  });
}
