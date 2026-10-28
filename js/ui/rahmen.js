// Seitenrahmen für Lab und Lehrpersonen-Seite: Theme-Schalter und Legal-Dialog.
import { t } from '../core/i18n.js';
import * as store from '../core/store.js';

const $ = (sel, root = document) => root.querySelector(sel);

// ── Theme: folgt dem System, der Schalter erzwingt hell oder dunkel ────────
function systemDunkel() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function themeAktuell() {
  return document.documentElement.getAttribute('data-theme') || (systemDunkel() ? 'dark' : 'light');
}
export function themeAnzeigen() {
  const btn = $('#themeToggle');
  const ziel = themeAktuell() === 'dark' ? 'light' : 'dark';
  btn.textContent = t(ziel === 'light' ? 'theme.hell' : 'theme.dunkel');
}
export function themeInit() {
  const gespeichert = store.lesen('theme');
  if (gespeichert === 'light' || gespeichert === 'dark') document.documentElement.setAttribute('data-theme', gespeichert);
  $('#themeToggle').addEventListener('click', () => {
    const neu = themeAktuell() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', neu);
    store.schreiben('theme', neu);
    themeAnzeigen();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeAnzeigen);
}

// ── Legal-Overlay (Inhalt aus /data/legal.json der Hauptseite) ────────────
const LEGAL_JSON_URL = '/data/legal.json';
let legalCache = null;

function legalAbschnitt(s) {
  const item = document.createElement('div');
  item.className = 'legal-item';
  const label = document.createElement('p');
  label.className = 'ui-label';
  label.textContent = s.label || '';
  item.append(label);
  if (s.content) {
    const p = document.createElement('p');
    s.content.split('\n').forEach((zeile, i) => {
      if (i) p.append(document.createElement('br'));
      if (s.highlight && zeile.includes(s.highlight)) {
        const [vor, ...rest] = zeile.split(s.highlight);
        const strong = document.createElement('strong');
        strong.textContent = s.highlight;
        p.append(vor, strong, rest.join(s.highlight));
      } else {
        p.append(zeile);
      }
    });
    item.append(p);
  }
  if (s.link && s.link.href) {
    const a = document.createElement('a');
    a.href = s.link.href;
    a.textContent = s.link.text || s.link.href;
    if (/^https?:/.test(s.link.href)) { a.target = '_blank'; a.rel = 'noopener'; }
    item.append(a);
  }
  return item;
}

async function legalOeffnen(welche) {
  const dlg = $('#legalDialog');
  const inhalt = $('#legalContent');
  const status = $('#legalStatus');
  inhalt.replaceChildren();
  $('#legalTitle').textContent = t('footer.' + welche);
  status.className = 'meta';
  status.removeAttribute('role');
  status.textContent = t('legal.laden');
  status.hidden = false;
  if (!dlg.open) dlg.showModal();
  try {
    if (!legalCache) {
      const res = await fetch(LEGAL_JSON_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      legalCache = await res.json();
    }
    const d = legalCache[welche];
    if (d.title) $('#legalTitle').textContent = d.title;
    inhalt.append(...d.sections.map(legalAbschnitt));
    status.hidden = true;
  } catch (err) {
    console.warn('[legal]', err);
    status.className = 'callout callout--error';
    status.setAttribute('role', 'alert');
    status.textContent = t('feedback.fehler_prefix') + ' ' + t('legal.fehler');
  }
}

export function legalInit() {
  document.querySelectorAll('[data-legal]').forEach((btn) => btn.addEventListener('click', () => legalOeffnen(btn.dataset.legal)));
  const dlg = $('#legalDialog');
  $('#legalClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}
