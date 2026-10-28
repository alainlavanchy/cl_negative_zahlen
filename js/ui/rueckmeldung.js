// Rückmeldungen im Layout, nie als alert(). Fehler beginnen mit «Fehler:», nie nur über Farbe.
import { t } from '../core/i18n.js';
import { h } from './dom.js';

export function richtig(text = t('feedback.richtig')) {
  return h('div', { class: 'callout callout--success', role: 'status' }, h('p', {}, text));
}

// Falsch: «Fehler:» + Fehlertyp in einem Satz + Hinweis. Die Lösung erst nach dem zweiten Versuch.
export function falsch({ fehlertyp, fehlertypen, versuch, loesungText }) {
  const info = fehlertypen.find((f) => f.key === fehlertyp);
  const kinder = [
    h('p', {}, h('strong', {}, t('feedback.fehler_prefix')), ' ', info ? t(info.beschreibung_key) : ''),
  ];
  if (info) kinder.push(h('p', {}, t(info.hinweis_key)));
  if (versuch < 2) kinder.push(h('p', {}, t('feedback.nochmal')));
  else if (loesungText) kinder.push(h('p', {}, t('feedback.loesung_ist', { loesung: loesungText })));
  return h('div', { class: 'callout callout--error', role: 'alert' }, ...kinder);
}

// Fehler ohne Fehlertyp (z. B. keine Antwort, Zeichen falsch zugeordnet)
export function fehlerText(text, mitPrefix = true) {
  return h('div', { class: 'callout callout--error', role: 'alert' },
    h('p', {}, mitPrefix ? h('strong', {}, t('feedback.fehler_prefix')) : null, mitPrefix ? ' ' : null, text));
}

export function hinweis(text) {
  return h('div', { class: 'callout', role: 'status' }, h('p', {}, text));
}
