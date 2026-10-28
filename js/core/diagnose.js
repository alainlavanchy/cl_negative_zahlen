// Ordnet eine falsche Antwort einem Fehlertyp zu.
// Zuerst die Distraktoren der Aufgabe, dann die Auffangtypen.
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function istRichtig(aufgabe, antwort) {
  return gleich(aufgabe.loesung, antwort);
}

// Gibt null zurück, wenn die Antwort richtig ist, sonst den Schlüssel des Fehlertyps.
export function fehlertyp(aufgabe, antwort) {
  if (istRichtig(aufgabe, antwort)) return null;
  const treffer = (aufgabe.distraktoren || []).find((d) => gleich(d.wert, antwort));
  if (treffer) return treffer.fehlertyp;
  return auffang(aufgabe.loesung, antwort);
}

function auffang(loesung, antwort) {
  if (typeof loesung === 'number') {
    return Math.abs(antwort) === Math.abs(loesung) ? 'vorzeichen_falsch' : 'rechenfehler';
  }
  if (Array.isArray(loesung) && loesung.length === 2 && typeof loesung[0] === 'number') {
    // Koordinaten: vertauscht, nur Vorzeichen falsch oder anderes
    if (gleich([loesung[1], loesung[0]], antwort)) return 'koord_vertauscht';
    const betraegeGleich = antwort.every((v, i) => Math.abs(v) === Math.abs(loesung[i]));
    return betraegeGleich ? 'koord_vz' : 'koord_falsch';
  }
  if (typeof loesung === 'string') return 'koord_vz';
  return 'rechenfehler';
}
