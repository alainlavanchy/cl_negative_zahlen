// Texte nur über t('schluessel'). Fehlt ein Schlüssel, gilt Deutsch, mit Warnung.
const FALLBACK = 'de';
const SPRACHEN = ['de', 'en'];

let aktiv = {};
let rueckfall = {};
let sprache = FALLBACK;

export function spracheWaehlen(paramLang) {
  const html = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
  const wunsch = (paramLang || '').slice(0, 2);
  if (SPRACHEN.includes(wunsch)) return wunsch;
  if (SPRACHEN.includes(html)) return html;
  return FALLBACK;
}

async function json(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
  return res.json();
}

export async function laden(lang, basis = 'i18n/') {
  sprache = lang;
  rueckfall = await json(basis + FALLBACK + '.json');
  aktiv = lang === FALLBACK ? rueckfall : await json(basis + lang + '.json').catch((err) => {
    console.warn('[i18n] Sprache nicht geladen, Deutsch wird verwendet.', err);
    return rueckfall;
  });
  document.documentElement.setAttribute('lang', lang);
  return lang;
}

export function aktuelleSprache() {
  return sprache;
}

export function t(key, params) {
  let text = aktiv[key];
  if (text === undefined) {
    text = rueckfall[key];
    if (text === undefined) {
      console.warn('[i18n] Schlüssel fehlt:', key);
      return key;
    }
    if (aktiv !== rueckfall) console.warn('[i18n] Schlüssel fehlt in «' + sprache + '», Deutsch verwendet:', key);
  }
  if (params) {
    text = text.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
  }
  return text;
}

// Füllt Elemente mit data-i18n (Text) und data-i18n-<attr> (Attribute, z. B. aria-label).
export function anwenden(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, el.dataset.i18nParams ? JSON.parse(el.dataset.i18nParams) : undefined);
  });
  root.querySelectorAll('*').forEach((el) => {
    for (const { name, value } of [...el.attributes]) {
      if (name.startsWith('data-i18n-') && name !== 'data-i18n-params') {
        el.setAttribute(name.slice('data-i18n-'.length), t(value));
      }
    }
  });
}
