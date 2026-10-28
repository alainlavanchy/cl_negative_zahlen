// LP-Engine: lädt lp-content.md (YAML-Frontmatter + Markdown) und rendert die Lehrpersonen-Seite.
// Übernommen aus assets/lehrperson.html (Frontmatter-Parser, Lernziele, Abschnitte je h2),
// umgestellt auf die gemeinsame CSS und t(). Markdown über das lokale marked (/assets/js/marked.umd.js).
import { params } from './core/params.js';
import * as i18n from './core/i18n.js';
import { t } from './core/i18n.js';
import { themeInit, themeAnzeigen, legalInit } from './ui/rahmen.js';
import { h } from './ui/dom.js';

const $ = (sel) => document.querySelector(sel);

// Frontmatter wie in der Vorlage: einfache «key: wert»-Zeilen und Listen mit «  - eintrag»
function parseFrontmatter(raw) {
  const match = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  let currentKey = null;
  match[1].split('\n').forEach((line) => {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    const keyVal = line.match(/^([a-z0-9_]+):\s*(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(listItem[1].trim());
    } else if (keyVal) {
      currentKey = keyVal[1];
      meta[currentKey] = keyVal[2].trim() || [];
    }
  });
  return { meta, body: match[2] };
}

const META_KEYS = ['fach', 'stufe', 'dauer', 'voraussetzungen', 'lp21'];

function metaKarten(meta) {
  const keys = META_KEYS.filter((k) => meta[k] && meta[k].length);
  if (!keys.length) return null;
  return h('dl', { class: 'lp-meta' }, keys.map((k) => h('div', { class: 'lp-meta__karte' },
    h('dt', { class: 'meta' }, t('lp.meta.' + k)),
    h('dd', { class: 'ui' }, Array.isArray(meta[k]) ? meta[k].join(', ') : meta[k]))));
}

// Jeden h2-Block in eine Karte setzen
function abschnitte(html) {
  return html.split(/(?=<h2[\s>])/).map((teil, i) => {
    if (!teil.trim()) return '';
    if (i === 0 && !teil.startsWith('<h2')) return teil;
    return `<section class="card lp-abschnitt">${teil}</section>`;
  }).join('');
}

async function inhaltLaden() {
  const status = $('#lpStatus');
  try {
    if (typeof window.marked === 'undefined') throw new Error('marked fehlt');
    const res = await fetch('lp-content.md', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { meta, body } = parseFrontmatter(await res.text());

    if (meta.title) {
      document.title = meta.title + ' | ' + t('lp.titel') + ' | ' + $('[data-marke]').dataset.marke;
      $('#lpTitel').textContent = meta.title;
    }
    if (meta.fach) $('#lpMeta').textContent = meta.fach + ' · ' + t('lp.titel');
    const karten = metaKarten(meta);
    if (karten) $('#lpKarten').replaceChildren(karten);

    const inhalt = $('#lpInhalt');
    inhalt.replaceChildren();
    if (Array.isArray(meta.lernziele) && meta.lernziele.length) {
      inhalt.append(h('section', { class: 'card lp-abschnitt' },
        h('h2', {}, t('lp.lernziele_titel')),
        h('ul', { class: 'lp-lernziele' }, meta.lernziele.map((z) => h('li', {}, z)))));
    }
    // Ein «## Lernziele»-Abschnitt im Markdown wird übersprungen (kommt aus dem Frontmatter)
    const ohneLernziele = body.replace(/^## Lernziele[\s\S]*?(?=^## |$(?![\s\S]))/m, '');
    window.marked.setOptions({ breaks: false, gfm: true });
    const block = document.createElement('div');
    block.innerHTML = abschnitte(window.marked.parse(ohneLernziele));
    inhalt.append(...block.childNodes);
    status.hidden = true;
    inhalt.hidden = false;
  } catch (err) {
    console.error('[lehrperson]', err);
    status.className = 'callout callout--error';
    status.setAttribute('role', 'alert');
    status.textContent = t('feedback.fehler_prefix') + ' ' + t('lp.fehler_laden');
  }
}

async function start() {
  document.body.classList.toggle('is-embed', params.embed);
  themeInit();
  try {
    await i18n.laden(i18n.spracheWaehlen(params.lang));
  } catch (err) {
    console.error('[lehrperson] Sprachdateien nicht geladen.', err);
    return;
  }
  i18n.anwenden();
  const marke = $('[data-marke]');
  marke.textContent = t('footer.powered_by', { marke: marke.dataset.marke });
  themeAnzeigen();
  legalInit();
  await inhaltLaden();
}

start();
