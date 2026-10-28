// Aufgabentypen im Koordinatensystem: punkt_ablesen, punkt_setzen, quadrant, spiegeln,
// verschieben, figur_zeichnen, figur_verschieben.
import { t } from '../core/i18n.js';
import { fmt, fmtPunkt, sprich } from '../core/zahl.js';
import * as diagnose from '../core/diagnose.js';
import { h, id } from '../ui/dom.js';
import { zahlEingabe } from '../ui/zahl-eingabe.js';
import { gruppe, roving } from '../ui/aria-gruppen.js';
import { koordinatensystem } from '../komponenten/koordinatensystem.js';
import { knopf } from './gemeinsam.js';

const STRICH = String.fromCharCode(0x2032); // A′
const name = (i, strich = false) => String.fromCharCode(65 + i) + (strich ? STRICH : '');
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Koordinatensystem mit den Texten des Labs
export function ks(opts = {}) {
  return koordinatensystem({
    fmt: (n) => fmt(n),
    achseX: t('label.x'), achseY: t('label.y'),
    ariaName: t('a11y.koordinatensystem', { min: sprich(-10), max: sprich(10) }) + '. ' + t('a11y.pfeiltasten'),
    ariaPunkt: (x, y) => t('a11y.punkt', { x: sprich(x), y: sprich(y) }),
    ...opts,
  });
}

function szene(k) {
  return h('div', { class: 'scene ks-scene' }, k.el);
}

function bewertenPunkt(aufgabe) {
  return (a) => ({ richtig: diagnose.istRichtig(aufgabe, a), fehlertyp: diagnose.fehlertyp(aufgabe, a) });
}

// Gemeinsamer Rahmen: Auftrag, Inhalt, Standardfunktionen
function ansicht(aufgabe, auftrag, inhalt, extra) {
  const el = h('div', { class: 'aufgabe stack' }, h('p', { class: 'ui ui-label' }, auftrag), ...inhalt);
  return {
    el,
    bewerten: bewertenPunkt(aufgabe),
    loesungText: () => fmtPunkt(aufgabe.loesung),
    abschliessen() {},
    ...extra,
  };
}

// ── Punkt ablesen: Punkt ist markiert, Lernende geben (x | y) ein ─────────────
export function punktAblesen(aufgabe, ctx) {
  const k = ks();
  k.punkte([{ x: aufgabe.punkt[0], y: aufgabe.punkt[1], art: 'gegeben', label: 'P' }]);
  const ex = zahlEingabe({ label: 'label.x' });
  const ey = zahlEingabe({ label: 'label.y', onEnter: () => ctx.pruefen() });
  return ansicht(aufgabe, t('task.punkt_ablesen'), [
    szene(k),
    h('p', { class: 'meta' }, t('koord.reihenfolge')),
    h('div', { class: 'eingabe-zeile' }, ex.el, ey.el),
  ], {
    antwort: () => (ex.wert() === null || ey.wert() === null ? null : [ex.wert(), ey.wert()]),
    fokus: () => ex.fokus(),
    sperren() { ex.sperren(true); ey.sperren(true); },
  });
}

// Einzelnen Punkt setzen (für punkt_setzen, spiegeln, verschieben)
function punktSetzenAnsicht(aufgabe, ctx, auftrag, gegeben, nachAbschluss) {
  const anzeige = h('p', { class: 'ui', 'aria-live': 'polite' });
  const k = ks({
    modus: 'einzel',
    labelGesetzt: () => (gegeben ? 'P' + STRICH : null),
    onSetzen: (p) => { anzeige.textContent = p ? t('koord.punkt_gesetzt', { x: fmt(p[0]), y: fmt(p[1]) }) : ''; },
    onConfirm: () => ctx.pruefen(),
  });
  const fest = gegeben ? [{ x: gegeben[0], y: gegeben[1], art: 'gegeben', label: 'P ' + fmtPunkt(gegeben) }] : [];
  k.punkte(fest);
  return ansicht(aufgabe, auftrag, [szene(k), anzeige], {
    antwort: () => k.gesetzt()[0] || null,
    fokus: () => k.fokus(),
    sperren: () => k.modus('anzeige'),
    abschliessen({ zeigeLoesung } = {}) {
      const loesung = aufgabe.loesung;
      if (zeigeLoesung) k.punkte([...fest, { x: loesung[0], y: loesung[1], art: 'loesung', label: fmtPunkt(loesung) }]);
      nachAbschluss?.(k);
    },
  });
}

export function punktSetzen(aufgabe, ctx) {
  const [x, y] = aufgabe.koordinaten;
  return punktSetzenAnsicht(aufgabe, ctx, t('task.punkt_setzen', { x: fmt(x), y: fmt(y) }), null);
}

export function spiegeln(aufgabe, ctx) {
  return punktSetzenAnsicht(aufgabe, ctx, t(aufgabe.achse === 'x' ? 'task.spiegeln_x' : 'task.spiegeln_y'), aufgabe.punkt);
}

export function verschieben(aufgabe, ctx) {
  const [dx, dy] = aufgabe.vektor;
  return punktSetzenAnsicht(aufgabe, ctx, t('task.verschieben', { dx: fmt(dx, true), dy: fmt(dy, true) }), aufgabe.punkt,
    (k) => k.pfeile([{ von: aufgabe.punkt, nach: aufgabe.loesung }]));
}

// ── Quadrant: aus den Vorzeichen schliessen, das Bild kommt erst danach ─────────
export function quadrant(aufgabe, ctx) {
  const labelId = id('quadrant');
  let wahl = null;
  const gruppeEl = h('div', { class: 'segmented quadrant-wahl', role: 'radiogroup', 'aria-labelledby': labelId },
    ['I', 'II', 'III', 'IV'].map((q) => h('button', { type: 'button', class: 'btn btn--secondary', role: 'radio', 'aria-checked': 'false', 'data-q': q }, t('koord.quadrant.' + q))));
  gruppe(gruppeEl, '[role="radio"]', (r) => {
    wahl = r.dataset.q;
    gruppeEl.querySelectorAll('[role="radio"]').forEach((b) => b.setAttribute('aria-checked', String(b === r)));
    roving(gruppeEl, '[role="radio"]', r);
  });
  roving(gruppeEl, '[role="radio"]', gruppeEl.querySelector('[role="radio"]'));
  const bild = h('div');
  return ansicht(aufgabe, t('task.quadrant'), [
    h('p', { id: labelId, class: 'term' }, 'P ' + fmtPunkt(aufgabe.punkt)),
    gruppeEl,
    bild,
  ], {
    antwort: () => wahl,
    loesungText: () => t('koord.quadrant.' + aufgabe.loesung),
    fokus: () => gruppeEl.querySelector('[tabindex="0"]')?.focus(),
    sperren() { gruppeEl.querySelectorAll('button').forEach((b) => { b.disabled = true; }); },
    abschliessen() {
      const k = ks();
      k.punkte([{ x: aufgabe.punkt[0], y: aufgabe.punkt[1], art: 'gegeben', label: 'P' }]);
      bild.replaceChildren(szene(k));
    },
  });
}

// ── Figuren: Punkte der Reihe nach setzen ──────────────────────────────────────
function figurAnsicht(aufgabe, ctx, { auftrag, figur, original }) {
  const soll = aufgabe.loesung;
  const anzahl = soll.length;
  const strich = Boolean(original);
  const status = h('p', { class: 'ui', 'aria-live': 'polite' });
  const ergebnis = h('div');

  const k = ks({
    modus: 'mehrere',
    labelGesetzt: (i) => name(i, strich),
    onSetzen: (liste) => {
      if (liste.length > anzahl) { k.gesetztSetzen(liste.slice(0, anzahl)); return; }
      melden(liste.length);
    },
  });
  function melden(n) {
    status.textContent = n < anzahl ? t('koord.naechster_punkt', { name: name(n, strich) }) : t('koord.figur_fertig');
  }
  if (original) {
    k.figuren([{ punkte: original, art: 'original', geschlossen: figur.geschlossen }]);
    k.punkte(original.map(([x, y], i) => ({ x, y, art: 'gegeben', label: name(i) })));
  }
  melden(0);

  const liste = h('ol', { class: 'punkt-liste ui' },
    (original || soll).map((p, i) => h('li', {}, h('span', { 'aria-hidden': 'true' }, name(i) + ' ' + fmtPunkt(p)),
      h('span', { class: 'visually-hidden' }, name(i) + ' ' + t('a11y.punkt', { x: sprich(p[0]), y: sprich(p[1]) })))));

  const weg = knopf('btn.letzter_weg', { onclick: () => k.letzterWeg() });
  const neu = knopf('btn.zuruecksetzen', { onclick: () => k.zuruecksetzen() });
  const knoepfe = h('div', { class: 'btn-row' }, weg, neu);

  return ansicht(aufgabe, auftrag, [liste, szene(k), status, knoepfe, ergebnis], {
    antwort: () => {
      const g = k.gesetzt();
      return g.length === anzahl ? g : null;
    },
    bewerten(g) {
      if (gleich(g, soll)) return { richtig: true, fehlertyp: null };
      // Erster falscher Punkt bestimmt den Fehlertyp (vertauscht, Vorzeichen, sonst Rechenfehler)
      const i = g.findIndex((p, j) => !gleich(p, soll[j]));
      return { richtig: false, fehlertyp: diagnose.fehlertyp({ loesung: soll[i], distraktoren: [] }, g[i]) };
    },
    loesungText: () => soll.map((p, i) => name(i, strich) + ' ' + fmtPunkt(p)).join(', '),
    fokus: () => k.fokus(),
    sperren() { k.modus('anzeige'); knoepfe.hidden = true; },
    abschliessen({ zeigeLoesung } = {}) {
      const fig = { punkte: soll, art: 'gezeichnet', geschlossen: figur.geschlossen };
      k.figuren([...(original ? [{ punkte: original, art: 'original', geschlossen: figur.geschlossen }] : []), fig]);
      if (zeigeLoesung) k.gesetztSetzen(soll);
      ergebnis.replaceChildren(h('p', { class: 'ui' }, t('label.figur') + ': ' + t(figur.name_key)));
    },
  });
}

export function figurZeichnen(aufgabe, ctx) {
  const figur = ctx.daten.figuren.get(aufgabe.figur_id);
  return figurAnsicht(aufgabe, ctx, { auftrag: t('task.figur_zeichnen'), figur });
}

export function figurVerschieben(aufgabe, ctx) {
  const figur = ctx.daten.figuren.get(aufgabe.figur_id);
  const [dx, dy] = aufgabe.vektor;
  return figurAnsicht(aufgabe, ctx, {
    auftrag: t('task.figur_verschieben', { dx: fmt(dx, true), dy: fmt(dy, true) }),
    figur, original: figur.punkte,
  });
}
