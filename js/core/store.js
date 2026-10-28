// localStorage darf fehlen (Einbettung, private Fenster). Jeder Zugriff in try/catch.
const PREFIX = 'negative-zahlen:';

export function lesen(key, fallback = null) {
  try {
    const v = window.localStorage.getItem(PREFIX + key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function schreiben(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* ohne Speicher läuft das Lab weiter */
  }
}
