// Pfeiltasten für role="tablist" und role="radiogroup" (Roving tabindex).
// onWahl(element) wird bei Klick und bei Pfeiltasten aufgerufen.
export function gruppe(container, auswahl, onWahl) {
  const items = () => [...container.querySelectorAll(auswahl)].filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true');

  container.addEventListener('click', (e) => {
    const el = e.target.closest(auswahl);
    if (el && items().includes(el)) onWahl(el);
  });

  container.addEventListener('keydown', (e) => {
    const liste = items();
    const i = liste.indexOf(document.activeElement);
    if (i < 0) return;
    let ziel = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ziel = liste[(i + 1) % liste.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ziel = liste[(i - 1 + liste.length) % liste.length];
    else if (e.key === 'Home') ziel = liste[0];
    else if (e.key === 'End') ziel = liste[liste.length - 1];
    if (!ziel) return;
    e.preventDefault();
    ziel.focus();
    onWahl(ziel);
  });
}

// Setzt tabindex: nur das gewählte Element ist per Tab erreichbar.
export function roving(container, auswahl, aktiv) {
  container.querySelectorAll(auswahl).forEach((el) => {
    el.tabIndex = el === aktiv ? 0 : -1;
  });
}
