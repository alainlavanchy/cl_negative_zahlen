// Reiter 4: Koordinatensystem mit vier Quadranten, Spiegeln, Verschieben, Figuren.
import { t } from '../core/i18n.js';
import { fmtPunkt, MINUS } from '../core/zahl.js';
import { h } from '../ui/dom.js';
import { uebungsrahmen, ansichtNachTyp } from '../ui/uebungsrahmen.js';
import { knopf } from '../aufgaben/gemeinsam.js';
import * as k from '../aufgaben/koordinaten.js';

const REITER = 'koordinaten';
const STRICH = String.fromCharCode(0x2032);
const QUADRANTEN = ['I', 'II', 'III', 'IV'];

export function rendern(el, modus, daten) {
  if (modus === 'entdecken') return entdecken(el);
  uebungsrahmen({
    el, reiter: REITER, modus, daten,
    pool: daten.aufgaben.filter((a) => a.reiter === REITER),
    ansicht: ansichtNachTyp({
      punkt_ablesen: k.punktAblesen,
      punkt_setzen: k.punktSetzen,
      quadrant: k.quadrant,
      spiegeln: k.spiegeln,
      verschieben: k.verschieben,
      figur_zeichnen: k.figurZeichnen,
      figur_verschieben: k.figurVerschieben,
    }),
  });
}

function quadrantVon([x, y]) {
  if (x === 0 || y === 0) return null;
  if (x > 0) return y > 0 ? 'I' : 'IV';
  return y > 0 ? 'II' : 'III';
}

// Freies Probieren: Punkt setzen, spiegeln. Die Quadrantentabelle füllt sich mit den eigenen Punkten.
function entdecken(el) {
  const beispiele = new Map(); // Quadrant → [Punkt]
  let p = null;
  let spiegelpunkt = null;
  const anzeige = h('div', { class: 'ui stack', 'aria-live': 'polite' });
  const tabelle = h('section', { class: 'card stack' });

  const zeichen = (n) => [h('span', { 'aria-hidden': 'true' }, n < 0 ? MINUS : '+'), h('span', { class: 'visually-hidden' }, t(n < 0 ? 'a11y.op.minus' : 'a11y.op.plus'))];

  function aufnehmen(punkt) {
    const q = quadrantVon(punkt);
    if (!q) return;
    const liste = beispiele.get(q) || [];
    const text = fmtPunkt(punkt);
    if (!liste.includes(text)) liste.push(text);
    beispiele.set(q, liste.slice(-3));
  }

  function tabelleFuellen() {
    // Vorzeichen eines Quadranten erst, wenn dort ein eigener Punkt liegt
    tabelle.replaceChildren(
      h('h4', {}, t('koord.tabelle_titel')),
      h('table', { class: 'regeltabelle-tab' },
        h('thead', {}, h('tr', {},
          h('th', { scope: 'col' }, t('koord.tabelle_quadrant')),
          h('th', { scope: 'col' }, t('label.x')),
          h('th', { scope: 'col' }, t('label.y')),
          h('th', { scope: 'col' }, t('mal.tabelle_beispiele')))),
        h('tbody', {}, QUADRANTEN.map((q) => {
          const liste = beispiele.get(q) || [];
          const muster = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] }[q];
          return h('tr', {},
            h('th', { scope: 'row' }, t('koord.quadrant.' + q)),
            h('td', {}, liste.length ? zeichen(muster[0]) : ''),
            h('td', {}, liste.length ? zeichen(muster[1]) : ''),
            h('td', { class: 'beispiele' }, liste.map((b) => h('span', { class: 'beispiel' }, b))));
        }))));
  }

  function beschreiben(punkt, label) {
    const q = quadrantVon(punkt);
    return h('p', {}, label + ' ' + fmtPunkt(punkt) + ': ' + (q ? t('koord.quadrant.' + q) : t('koord.auf_achse')));
  }

  function aktualisieren() {
    const fest = [];
    if (spiegelpunkt) fest.push({ x: spiegelpunkt[0], y: spiegelpunkt[1], art: 'gegeben', label: 'P' + STRICH });
    ks.punkte(fest);
    anzeige.replaceChildren(
      p ? beschreiben(p, 'P') : '',
      spiegelpunkt ? beschreiben(spiegelpunkt, 'P' + STRICH) : '');
    spiegelX.disabled = !p;
    spiegelY.disabled = !p;
    tabelleFuellen();
  }

  const ks = k.ks({
    modus: 'einzel',
    labelGesetzt: () => 'P',
    onSetzen: (punkt, bestaetigt) => {
      p = punkt;
      spiegelpunkt = null;
      if (p && bestaetigt) aufnehmen(p);
      aktualisieren();
    },
  });
  const spiegeln = (achse) => {
    if (!p) return;
    spiegelpunkt = achse === 'x' ? [p[0], -p[1]] : [-p[0], p[1]];
    aufnehmen(spiegelpunkt);
    aktualisieren();
  };
  const spiegelX = knopf('koord.btn_spiegeln_x', { onclick: () => spiegeln('x') });
  const spiegelY = knopf('koord.btn_spiegeln_y', { onclick: () => spiegeln('y') });
  const neu = knopf('btn.zuruecksetzen', { onclick: () => { spiegelpunkt = null; ks.zuruecksetzen(); } });

  el.replaceChildren(
    h('p', { class: 'meta' }, t('koord.reihenfolge') + ' ' + t('a11y.pfeiltasten')),
    h('div', { class: 'scene ks-scene' }, ks.el),
    anzeige,
    h('div', { class: 'btn-row' }, spiegelX, spiegelY, neu),
    tabelle);
  aktualisieren();
}
