// Terme aus aufgaben.json (term_syntax: + - * / und runde Klammern, ASCII).
// Ohne Fachinhalt: zerlegt, wertet aus, bestimmt Zeichenrollen und zeigt an.
import { MINUS, MAL, GETEILT } from './zahl.js';

const OPS = '+-*/';

// Zerlegt in Tokens: { t: '5' | '-' | '(' ..., art: 'zahl' | 'op' | 'klammer', rolle? }
export function zerlegen(term) {
  const tokens = [];
  let i = 0;
  while (i < term.length) {
    const c = term[i];
    if (c === ' ') { i++; continue; }
    if (/\d/.test(c)) {
      let j = i;
      while (j < term.length && /\d/.test(term[j])) j++;
      tokens.push({ t: term.slice(i, j), art: 'zahl' });
      i = j;
    } else if (OPS.includes(c)) {
      tokens.push({ t: c, art: 'op' });
      i++;
    } else if (c === '(' || c === ')') {
      tokens.push({ t: c, art: 'klammer' });
      i++;
    } else {
      throw new Error('Unbekanntes Zeichen «' + c + '» in «' + term + '»');
    }
  }
  // Rolle: Ein + oder − am Anfang, nach «(» oder nach einem Rechenzeichen ist ein Vorzeichen.
  tokens.forEach((tok, k) => {
    if (tok.art !== 'op') return;
    const vor = tokens[k - 1];
    const istVorzeichen = (tok.t === '+' || tok.t === '-') && (!vor || vor.t === '(' || vor.art === 'op');
    tok.rolle = istVorzeichen ? 'vorzeichen' : 'rechenzeichen';
  });
  return tokens;
}

// Rekursiver Abstieg: ausdruck = glied (± glied)*, glied = faktor (*/ faktor)*, faktor = ±faktor | zahl | (ausdruck)
export function auswerten(term) {
  const tokens = zerlegen(term);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function ausdruck() {
    let wert = glied();
    while (peek() && peek().rolle === 'rechenzeichen' && (peek().t === '+' || peek().t === '-')) {
      const op = next().t;
      const rechts = glied();
      wert = op === '+' ? wert + rechts : wert - rechts;
    }
    return wert;
  }
  function glied() {
    let wert = faktor();
    while (peek() && (peek().t === '*' || peek().t === '/')) {
      const op = next().t;
      const rechts = faktor();
      if (op === '/' && rechts === 0) throw new Error('Division durch null in «' + term + '»');
      wert = op === '*' ? wert * rechts : wert / rechts;
    }
    return wert;
  }
  function faktor() {
    const tok = next();
    if (!tok) throw new Error('Term endet zu früh: «' + term + '»');
    if (tok.rolle === 'vorzeichen') return tok.t === '-' ? -faktor() : faktor();
    if (tok.art === 'zahl') return Number(tok.t);
    if (tok.t === '(') {
      const wert = ausdruck();
      if (!next() || tokens[pos - 1].t !== ')') throw new Error('Klammer nicht geschlossen in «' + term + '»');
      return wert;
    }
    throw new Error('Unerwartetes «' + tok.t + '» in «' + term + '»');
  }

  const wert = ausdruck();
  if (pos !== tokens.length) throw new Error('Rest nach dem Term: «' + term + '»');
  return wert;
}

// Anzeigezeichen: − (U+2212), Mal-Punkt, Doppelpunkt.
export function zeichenAnzeige(t) {
  if (t === '-') return MINUS;
  if (t === '*') return MAL;
  if (t === '/') return GETEILT;
  return t;
}

// Anzeige als Text: Rechenzeichen mit Abstand, Vorzeichen direkt an der Zahl.
export function anzeigen(termOderTokens) {
  const tokens = typeof termOderTokens === 'string' ? zerlegen(termOderTokens) : termOderTokens;
  let out = '';
  tokens.forEach((tok) => {
    const z = zeichenAnzeige(tok.t);
    if (tok.rolle === 'rechenzeichen') out += ' ' + z + ' ';
    else out += z;
  });
  return out;
}

// Vorgelesene Fassung für aria-label. woerter: { plus, minus, mal, geteilt, auf, zu }
export function sprechen(term, woerter) {
  const tokens = typeof term === 'string' ? zerlegen(term) : term;
  const wort = { '+': woerter.plus, '-': woerter.minus, '*': woerter.mal, '/': woerter.geteilt, '(': woerter.auf, ')': woerter.zu };
  return tokens.map((tok) => wort[tok.t] || tok.t).join(' ');
}

// Teilt einen Term auf oberster Ebene an + und − (Rechenzeichen).
// Ergebnis: [{ op: null | '+' | '-', text: 'ASCII-Glied', wert }]
export function glieder(term) {
  const tokens = zerlegen(term);
  const teile = [];
  let aktuell = { op: null, tokens: [] };
  let tiefe = 0;
  for (const tok of tokens) {
    if (tok.t === '(') tiefe++;
    if (tok.t === ')') tiefe--;
    if (tiefe === 0 && tok.rolle === 'rechenzeichen' && (tok.t === '+' || tok.t === '-')) {
      teile.push(aktuell);
      aktuell = { op: tok.t, tokens: [] };
    } else {
      aktuell.tokens.push(tok);
    }
  }
  teile.push(aktuell);
  return teile.map((g) => {
    const text = g.tokens.map((tok) => tok.t).join('');
    return { op: g.op, text, wert: auswerten(text) };
  });
}

// Nur Strichrechnung: Startzahl und Schritte für den Zahlenstrahl.
// Schritt: { op, wert, blick: +1 | -1 (Vorzeichen), gang: +1 vorwärts | -1 rückwärts, von, nach }
export function bewegungen(term) {
  if (/[*/]/.test(term)) return null;
  const [erstes, ...rest] = glieder(term);
  let pos = erstes.wert;
  const schritte = rest.map((g) => {
    const von = pos;
    pos = g.op === '+' ? pos + g.wert : pos - g.wert;
    return { op: g.op, glied: g.text, wert: g.wert, blick: g.wert < 0 ? -1 : 1, gang: g.op === '+' ? 1 : -1, von, nach: pos };
  });
  return { start: erstes.wert, schritte, ziel: pos };
}

// Ist das Glied eine Zahl in Klammern mit Vorzeichen, z. B. "(-7)"? Gibt das Vorzeichen zurück.
function klammerVorzeichen(text) {
  const m = /^\(([+-])(\d+)\)$/.exec(text);
  return m ? { vz: m[1], betrag: m[2] } : null;
}

// Klammern auflösen: zwei Zeichen nebeneinander werden zu einem.
// paare: [{ index, links, rechts, ergebnis, betrag }], term: ASCII ohne Klammern
export function aufloesen(term) {
  if (/[*/]/.test(term)) return null;
  const teile = glieder(term);
  const paare = [];
  const out = teile.map((g, i) => {
    if (i === 0) {
      const m = /^-\(([+-])(\d+)\)$/.exec(g.text);
      if (!m) return g.text;
      const ergebnis = m[1] === '-' ? '+' : '-';
      paare.push({ index: i, links: '-', rechts: m[1], ergebnis, betrag: m[2] });
      return ergebnis === '+' ? m[2] : '-' + m[2];
    }
    const k = klammerVorzeichen(g.text);
    if (!k) return g.op + ' ' + g.text;
    const ergebnis = g.op === k.vz ? '+' : '-';
    paare.push({ index: i, links: g.op, rechts: k.vz, ergebnis, betrag: k.betrag });
    return ergebnis + ' ' + k.betrag;
  });
  return { paare, term: out.join(' ') };
}

// Jede Subtraktion wird zur Addition der Gegenzahl: a - b = a + (-b)
export function gegenzahlForm(term) {
  if (/[*/]/.test(term)) return null;
  const teile = glieder(term);
  if (!teile.some((g) => g.op === '-')) return null;
  return teile.map((g, i) => {
    if (i === 0) return g.text;
    if (g.op === '+') return '+ ' + g.text;
    const gegen = -g.wert;
    return '+ ' + (gegen < 0 ? '(' + gegen + ')' : String(gegen));
  }).join(' ');
}

// Nur Punktrechnung: Faktoren auf oberster Ebene, z. B. "(-40) / (-8)" → { ops: ['/'], werte: [-40, -8] }
export function faktoren(term) {
  const tokens = zerlegen(term);
  const teile = [[]];
  const ops = [];
  let tiefe = 0;
  for (const tok of tokens) {
    if (tok.t === '(') tiefe++;
    if (tok.t === ')') tiefe--;
    if (tiefe === 0 && tok.rolle === 'rechenzeichen') {
      if (tok.t !== '*' && tok.t !== '/') return null;
      ops.push(tok.t);
      teile.push([]);
    } else {
      teile[teile.length - 1].push(tok.t);
    }
  }
  if (!ops.length) return null;
  return { ops, werte: teile.map((t) => auswerten(t.join(''))) };
}
