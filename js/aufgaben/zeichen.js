// Aufgabentyp «zeichen_markieren»: Jedes Plus- und Minuszeichen antippen und zuordnen.
// Markierung mit Form (Kreis = Rechenzeichen, Dreieck = Vorzeichen), nicht nur mit Farbe.
import { t } from '../core/i18n.js';
import { zeichenAnzeige } from '../core/term.js';
import { h } from '../ui/dom.js';
import { woerter } from './gemeinsam.js';

const FOLGE = [null, 'rechenzeichen', 'vorzeichen'];

export function zeichenAnsicht(aufgabe, ctx) {
  const el = h('div', { class: 'aufgabe stack' });
  const knoepfe = [];
  const w = woerter();
  const wortFuer = { '+': w.plus, '-': w.minus, '*': w.mal, '/': w.geteilt };

  function beschriften(btn) {
    const rolle = btn.dataset.rolle;
    btn.setAttribute('aria-label', t('a11y.zeichen', {
      zeichen: wortFuer[btn.dataset.t],
      rolle: rolle ? t('label.' + rolle) : t('a11y.zeichen_leer'),
    }));
  }

  const zeile = h('p', { class: 'term zeichen-term' });
  aufgabe.zeichen.forEach((z) => {
    if (!z.rolle) {
      zeile.append(h('span', { class: 'zeichen-fest' }, z.t));
      return;
    }
    const btn = h('button', { type: 'button', class: 'zeichen-btn', 'data-t': z.t }, zeichenAnzeige(z.t));
    btn.addEventListener('click', () => {
      const i = FOLGE.indexOf(btn.dataset.rolle || null);
      const neu = FOLGE[(i + 1) % FOLGE.length];
      if (neu) btn.dataset.rolle = neu; else delete btn.dataset.rolle;
      beschriften(btn);
      ctx.geaendert?.();
    });
    beschriften(btn);
    knoepfe.push(btn);
    zeile.append(btn);
  });

  el.append(
    h('p', { class: 'ui ui-label' }, t('task.zeichen_markieren')),
    h('h4', {}, t('kl.schritt1')),
    zeile,
    h('ul', { class: 'zeichen-legende ui' },
      h('li', {}, h('span', { class: 'zeichen-muster', 'data-rolle': 'rechenzeichen', 'aria-hidden': 'true' }), ' ', t('label.rechenzeichen')),
      h('li', {}, h('span', { class: 'zeichen-muster', 'data-rolle': 'vorzeichen', 'aria-hidden': 'true' }), ' ', t('label.vorzeichen'))),
  );

  const soll = aufgabe.zeichen.filter((z) => z.rolle).map((z) => z.rolle);

  return {
    el,
    antwort: () => {
      const rollen = knoepfe.map((b) => b.dataset.rolle || null);
      return rollen.includes(null) ? null : rollen;
    },
    bewerten: (rollen) => {
      const richtig = rollen.every((r, i) => r === soll[i]);
      return { richtig, fehlertyp: richtig ? null : 'zeichen_rolle' };
    },
    loesungText: () => null,
    fokus: () => knoepfe[0]?.focus(),
    sperren() { knoepfe.forEach((b) => { b.disabled = true; }); },
    abschliessen({ zeigeLoesung } = {}) {
      if (!zeigeLoesung) return;
      knoepfe.forEach((b, i) => { b.dataset.rolle = soll[i]; beschriften(b); });
    },
  };
}
