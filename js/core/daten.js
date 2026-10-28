// Lädt die Fachdaten und prüft sie. Aufgaben stehen nur in data/*.json.
import { auswerten, zerlegen } from './term.js';

export class DatenFehler extends Error {
  constructor(key, params, detail) {
    super(detail || key);
    this.key = key;
    this.params = params || {};
  }
}

async function json(url) {
  let res;
  try {
    res = await fetch(url, { cache: 'no-cache' });
  } catch (err) {
    throw new DatenFehler('error.daten_laden', {}, url + ': ' + err.message);
  }
  if (!res.ok) throw new DatenFehler('error.daten_laden', {}, url + ': HTTP ' + res.status);
  const daten = await res.json();
  if (daten.schema !== 1) throw new DatenFehler('error.schema', { version: daten.schema }, url);
  return daten;
}

const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function quadrantVon([x, y]) {
  if (x > 0 && y > 0) return 'I';
  if (x < 0 && y > 0) return 'II';
  if (x < 0 && y < 0) return 'III';
  if (x > 0 && y < 0) return 'IV';
  return null;
}

// Erwartete Lösung je Aufgabentyp, unabhängig von der Datei berechnet.
function erwartet(a, figuren) {
  const fig = a.figur_id ? figuren.get(a.figur_id) : null;
  switch (a.typ) {
    case 'rechnen': return auswerten(a.term);
    case 'punkt_ablesen': return a.punkt;
    case 'punkt_setzen': return a.koordinaten;
    case 'quadrant': return quadrantVon(a.punkt);
    case 'spiegeln': return a.achse === 'x' ? [a.punkt[0], -a.punkt[1]] : [-a.punkt[0], a.punkt[1]];
    case 'verschieben': return [a.punkt[0] + a.vektor[0], a.punkt[1] + a.vektor[1]];
    case 'figur_zeichnen': return fig && fig.punkte;
    case 'figur_verschieben': return fig && fig.punkte.map(([x, y]) => [x + a.vektor[0], y + a.vektor[1]]);
    case 'zeichen_markieren': return undefined;
    default: throw new Error('Unbekannter Aufgabentyp «' + a.typ + '» in ' + a.id);
  }
}

function pruefen(aufgaben, figuren) {
  for (const a of aufgaben.aufgaben) {
    if (a.typ === 'zeichen_markieren') {
      // Die Rollen in der Datei müssen zur Zerlegung des Terms passen.
      const tokens = zerlegen(a.term);
      const ok = tokens.length === a.zeichen.length &&
        tokens.every((tok, i) => tok.t === a.zeichen[i].t && (tok.art !== 'op' || tok.rolle === a.zeichen[i].rolle));
      if (!ok) throw new DatenFehler('error.loesung_pruefung', { id: a.id }, 'Zeichenrollen passen nicht zu «' + a.term + '»');
      continue;
    }
    let soll;
    try {
      soll = erwartet(a, figuren);
    } catch (err) {
      throw new DatenFehler('error.loesung_pruefung', { id: a.id }, err.message);
    }
    if (!gleich(soll, a.loesung)) {
      throw new DatenFehler('error.loesung_pruefung', { id: a.id },
        a.id + ': erwartet ' + JSON.stringify(soll) + ', in der Datei ' + JSON.stringify(a.loesung));
    }
  }
  for (const m of aufgaben.muster) {
    for (const r of m.reihe) {
      if (auswerten(r.term) !== r.loesung) {
        throw new DatenFehler('error.loesung_pruefung', { id: m.id }, m.id + ': «' + r.term + '» ergibt nicht ' + r.loesung);
      }
    }
  }
}

export async function laden(basis = 'data/') {
  const [aufgaben, figurDaten] = await Promise.all([json(basis + 'aufgaben.json'), json(basis + 'figuren.json')]);
  const figuren = new Map(figurDaten.figuren.map((f) => [f.id, f]));
  pruefen(aufgaben, figuren);
  return { ...aufgaben, figuren };
}
