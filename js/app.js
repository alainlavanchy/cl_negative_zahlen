// Einstieg: Sprache, Daten, Seitenrahmen, Reiter und Modus.
import { params } from './core/params.js';
import * as i18n from './core/i18n.js';
import { t } from './core/i18n.js';
import * as daten from './core/daten.js';
import { labEvent } from './core/events.js';
import { themeInit, themeAnzeigen, legalInit } from './ui/rahmen.js';
import { gruppe, roving } from './ui/aria-gruppen.js';
import * as reiterZahlenstrahl from './reiter/zahlenstrahl.js';
import * as reiterKlammern from './reiter/klammern.js';
import * as reiterMalgeteilt from './reiter/malgeteilt.js';
import * as reiterKoordinaten from './reiter/koordinaten.js';

const REITER = ['zahlenstrahl', 'klammern', 'malgeteilt', 'koordinaten'];
const MODULE = { zahlenstrahl: reiterZahlenstrahl, klammern: reiterKlammern, malgeteilt: reiterMalgeteilt, koordinaten: reiterKoordinaten };

const zustand = {
  reiter: REITER[0],
  modus: params.mode || 'entdecken',
  daten: null,
};

const $ = (sel, root = document) => root.querySelector(sel);

// Inhalt des aktiven Reiters aufbauen, sobald Reiter oder Modus wechseln
function inhaltRendern() {
  const modul = MODULE[zustand.reiter];
  const panel = document.getElementById('panel-' + zustand.reiter);
  if (!modul || !zustand.daten || panel.dataset.gerendert === zustand.modus) return;
  panel.dataset.gerendert = zustand.modus;
  modul.rendern(panel, zustand.modus, zustand.daten);
}

// ── Reiter ────────────────────────────────────────────────────────────────
function reiterWaehlen(name) {
  zustand.reiter = name;
  const liste = $('#reiterListe');
  liste.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.setAttribute('aria-selected', String(tab.dataset.reiter === name));
  });
  roving(liste, '[role="tab"]', liste.querySelector(`[data-reiter="${name}"]`));
  document.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = p.dataset.reiter !== name; });
  inhaltRendern();
}

// ── Modus ─────────────────────────────────────────────────────────────────
function modusWaehlen(name) {
  zustand.modus = name;
  const gruppeEl = $('#modusGruppe');
  gruppeEl.querySelectorAll('[role="radio"]').forEach((r) => r.setAttribute('aria-checked', String(r.dataset.modus === name)));
  roving(gruppeEl, '[role="radio"]', gruppeEl.querySelector(`[data-modus="${name}"]`));
  $('#modusText').textContent = t('mode.' + name + '_text');
  document.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.dataset.modus = name; });
  inhaltRendern();
}

function steuerungInit() {
  const liste = $('#reiterListe');
  gruppe(liste, '[role="tab"]', (tab) => {
    if (tab.dataset.reiter === zustand.reiter) return;
    reiterWaehlen(tab.dataset.reiter);
    labEvent('start', { reiter: zustand.reiter, modus: zustand.modus });
  });

  const gruppeEl = $('#modusGruppe');
  if (params.mode) {
    // Die Lehrperson hat den Modus gesperrt: nur Anzeige, kein Umschalter.
    gruppeEl.hidden = true;
    const badge = $('#modusFest');
    badge.textContent = t('mode.label') + ': ' + t('mode.' + params.mode);
    badge.hidden = false;
  } else {
    gruppe(gruppeEl, '[role="radio"]', (radio) => {
      if (radio.dataset.modus === zustand.modus) return;
      modusWaehlen(radio.dataset.modus);
      labEvent('start', { reiter: zustand.reiter, modus: zustand.modus });
    });
  }
  reiterWaehlen(zustand.reiter);
  modusWaehlen(zustand.modus);
}

// ── Fehler beim Laden: klare Meldung, das Lab bricht ab ───────────────────
function abbrechen(err) {
  console.error('[negative-zahlen]', err);
  const box = $('#ladeFehler');
  const istDatenFehler = err instanceof daten.DatenFehler;
  box.textContent = t('feedback.fehler_prefix') + ' ' + t(istDatenFehler ? err.key : 'error.daten_laden', istDatenFehler ? err.params : {});
  box.hidden = false;
  $('#labInhalt').hidden = true;
}

async function start() {
  document.body.classList.toggle('is-embed', params.embed);
  themeInit();
  try {
    await i18n.laden(i18n.spracheWaehlen(params.lang));
  } catch (err) {
    // Ohne Sprachdatei gibt es keine Texte, deshalb nur die Konsole.
    console.error('[negative-zahlen] Sprachdateien nicht geladen.', err);
    return;
  }
  i18n.anwenden();
  const marke = $('[data-marke]');
  document.title = t('lab.title') + ' | ' + marke.dataset.marke;
  marke.textContent = t('footer.powered_by', { marke: marke.dataset.marke });
  themeAnzeigen();
  legalInit();

  try {
    zustand.daten = await daten.laden();
  } catch (err) {
    abbrechen(err);
    return;
  }
  steuerungInit();
  $('#labInhalt').hidden = false;
  labEvent('start', { reiter: zustand.reiter, modus: zustand.modus });
}

start();
