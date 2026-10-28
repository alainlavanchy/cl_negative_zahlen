// Zentrale URL-Parameter. Erlaubt sind nur lang, mode, code und embed.
const MODI = ['entdecken', 'ueben', 'check'];

function lesen() {
  const q = new URLSearchParams(window.location.search);
  const mode = q.get('mode');
  const code = q.get('code');
  return {
    lang: (q.get('lang') || '').toLowerCase().slice(0, 5) || null,
    mode: MODI.includes(mode) ? mode : null,
    // Schülercode: nur einfache Zeichen, damit nichts anderes mitgeschickt wird.
    code: code && /^[A-Za-z0-9_-]{1,32}$/.test(code) ? code : null,
    embed: q.get('embed') === '1',
  };
}

export const params = lesen();
export { MODI };
