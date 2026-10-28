// labEvent: minimaler Hook ohne Netzwerkzugriff. Keine Namen, keine E-Mail, nur der Schülercode.
import { params } from './params.js';

const SLUG = 'negative-zahlen';
const TYPEN = ['start', 'progress', 'result', 'complete'];

function zielOrigin() {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

export function labEvent(type, payload = {}) {
  if (!TYPEN.includes(type)) {
    console.warn('[labEvent] Unbekannter Typ:', type);
    return;
  }
  const detail = { slug: SLUG, type, payload, code: params.code, zeit: new Date().toISOString() };
  document.dispatchEvent(new CustomEvent('cognivio:labevent', { detail }));

  if (params.embed && window.parent !== window) {
    const origin = zielOrigin();
    if (origin) window.parent.postMessage({ source: 'cognivio:labevent', ...detail }, origin);
  }
}
