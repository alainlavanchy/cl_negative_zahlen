# Projektstatus: Lab «Negative Zahlen»

Festgehalten wird nur, was belegt ist: ein Test, ein Entscheid von Alain oder eine Prüfung im Browser.

| | |
| --- | --- |
| Stand | 2026-10-28 |
| Grundlage | `prompts/startprompt-claude-code-negative-zahlen.md`, `docs/Spezifikation Lab «Negative Zahlen».md`, `docs/Design-Skills.md` 1.1 |
| Ablage | Repo-Wurzel, Ziel-URL `https://www.cogniviolabs.com/lab/math/negative-zahlen/` |
| Letzter erfasster Commit | 93aad27 (Branch `lab-negative-zahlen`) |
| Nächster Schritt | Abnahme durch Alain, offene Punkte unten |

## Bauphasen

- [x] 1. Gerüst: Seite, Leitton, i18n und `t()`, Datenprüfung, `labEvent()`, `?embed=1`, `?mode=`, Reiter und Modus-Umschalter
- [x] 2. Reiter Zahlenstrahl und Klammern
- [x] 3. Reiter Mal und geteilt (Musterfolgen, Vorzeichen-Entscheid, Umkehrprobe, Regeltabelle)
- [x] 4. Reiter Koordinatensystem (alle sieben Aufgabentypen, Entdecken mit Spiegeln und Quadrantentabelle)
- [x] 5. Lehrpersonen-Seite (`lehrperson.html`, `js/lehrperson.js`) und `lp-content.md` (Inhalt teilweise Entwurf, siehe unten)

## Entscheide von Alain

| Datum | Entscheid |
| --- | --- |
| 2026-10-28 | Ablage in der Repo-Wurzel, Fach-URL `/lab/math/` |
| 2026-10-28 | Fehlende Klassen für Kopf, Fuss und Dialog in einem kleinen `<style>` pro Seite, nur Tokens |
| 2026-10-28 | Beobachtungsaufgabe Zahlenstrahl als `muster`-Eintrag `m-zahlenstrahl-1` in `data/aufgaben.json` |
| 2026-10-28 | Üben und Check: je 10 Aufgaben zufällig aus der Datei (keine erzeugten Aufgaben) |
| 2026-10-28 | Neue Fehlertypen `zeichen_rolle` und `koord_falsch` in `data/aufgaben.json` |
| 2026-10-28 | «Stufe geschafft» ab 8 von 10 richtig |
| 2026-10-28 | Zahlenstrahl: Stufe 1 von −10 bis 10, sonst von −20 bis 20; Entdecken nimmt Eingaben von −10 bis 10 |
| 2026-10-28 | Figuren: Der erste falsche Punkt bestimmt den Fehlertyp |
| 2026-10-28 | Regeltabelle vor der Beobachtung nur über den Knopf «Tabelle zeigen» / «Tabelle schliessen» |
| 2026-10-28 | `kl.zeichen_falsch` bleibt in `de.json`, auch wenn er nicht mehr verwendet wird |

## Offene Punkte

### Daten: Distraktoren in `verschieben` (korrigiert Alain manuell)

Bei k3-001 bis k3-010 ist der Distraktor mit Fehlertyp `koord_vertauscht` nicht die vertauschte Lösung. Die Diagnose ordnet eine wirklich vertauschte Antwort trotzdem richtig zu (Auffangtyp), aber die Distraktoren in der Datei treffen nie.

| Aufgabe | Lösung | Distraktor in der Datei | vertauscht wäre |
| --- | --- | --- | --- |
| k3-001 | (4 \| −9) | (−4 \| −1) | (−9 \| 4) |
| k3-002 | (0 \| −6) | (7 \| −13) | (−6 \| 0) |
| k3-003 | (−1 \| −5) | (−6 \| 0) | (−5 \| −1) |
| k3-004 | (−4 \| 0) | (−2 \| −2) | (0 \| −4) |
| k3-005 | (10 \| −7) | (2 \| 1) | (−7 \| 10) |
| k3-006 | (2 \| 1) | (4 \| −1) | (1 \| 2) |
| k3-007 | (−9 \| −10) | (−12 \| −7) | (−10 \| −9) |
| k3-008 | (5 \| −2) | (3 \| 0) | (−2 \| 5) |
| k3-009 | (6 \| 7) | (2 \| 11) | (7 \| 6) |
| k3-010 | (−7 \| 8) | (−4 \| 5) | (8 \| −7) |

Die Quadranten-Aufgaben mit `koord_vertauscht` (k2-002, k2-004, k2-006, k2-008: II ↔ IV) sind folgerichtig und brauchen keine Korrektur.

### Gemeinsame CSS auf der Assets-Domain

`https://assets.cogniviolabs.com/css/cognivio-common.v1.css` liefert am 2026-10-28 noch die frühere Fassung (20 904 Bytes, `last-modified` 00:23 UTC) ohne `.tabs`, `.segmented` und ohne die gefüllten aktiven Zustände (`aria-pressed`, `aria-checked`). Die lokale Fassung `assets_server/css/cognivio-common.v1.css` (22 464 Bytes) hat sie. Ohne Upload sind aktiver Reiter, gewählter Modus und gewähltes Vorzeichen live nicht erkennbar.

### Zu prüfen durch Alain

- `i18n/en.json`: Entwurf, fachlich prüfen.
- Neu ergänzte Schlüssel (de und en): Kopf und Fuss (`lab.meta`, `nav.*`, `theme.*`, `footer.*`, `legal.*`), Barrierefreiheit (`a11y.minus`, `a11y.op.*`, `a11y.klammer_*`, `a11y.zeichen*`), Lab (`muster.zahlenstrahl.frage1`, `label.zahl`, `label.rechenzeichen_waehlen`, `kl.paar_frage`, `kl.aufgeloest`, `zs.gegenzahl_term`, `mal.tabelle_beispiele`, `mal.tabelle_zeigen`, `mal.tabelle_schliessen`, `koord.naechster_punkt`, `koord.btn_spiegeln_x`, `koord.btn_spiegeln_y`, `koord.auf_achse`, `koord.tabelle_quadrant`, `btn.letzter_weg`), Fehlertypen (`err.`/`hint.zeichen_rolle`, `err.`/`hint.koord_falsch`), Lehrpersonen-Seite (`lp.zum_lab`, `lp.laden`, `lp.fehler_laden`, `lp.lernziele_titel`, `lp.meta.*`).
- `lp-content.md`: Die Lernziele sind ein Entwurf aus der Spezifikation. Es fehlen Dauer, Voraussetzungen, Lehrplan-21-Bezug, «Einsatz im Unterricht» und Literatur. Diese Inhalte schreibe ich nicht ohne Rückfrage.
- Leitton Lindengrün: in Hell und Dunkel geprüft, wirkt in beiden Modi klar. Der Vergleich neben Matcha (Biologie) in einer Übersicht steht aus.
- Arbeitstitel für `.lab-title`: zurzeit «Rechnen mit negativen Zahlen» (`lab.title`).
- Mathe-Icon: `favicon.svg`, `favicon-32.png` und `apple-touch-icon.png` sind Platzhalter (Lindengrün mit Minus).
- Copyright-Zeile im Footer steht wie in der SKILL-labs-Vorlage als Text im HTML.
- Auswertung der Ereignisse (`labEvent`): nicht Teil dieser Version.
- Zahlenstrahl-Komponente (`js/komponenten/zahlenstrahl.js`) und Koordinatensystem (`js/komponenten/koordinatensystem.js`) sind eigenständig (ohne i18n und Fachdaten) und lassen sich für das Grundwissen-Heft herauslösen. Ob gemeinsam oder getrennt: offen.

## Geprüft

- Alle Aufgaben (144) und Musterfolgen bestehen die Prüfung der `loesung` beim Laden. Eine absichtlich falsche Lösung bricht mit `error.loesung_pruefung` ab.
- `de.json` und `en.json` haben dieselben Schlüssel. Kein Hex, kein `rgb()`, kein CDN, keine Emojis im Lab-Code.
- Schriften laden von der Assets-Domain mit Status 200. Raleway, Patrick Hand und Source Serif 4 enthalten U+2212 und U+00B7.
- Browser (Chrome, localhost): Hell und Dunkel, `?embed=1`, `?mode=…`, `?lang=en`, Betrieb ohne `localStorage`, Tastatur an Reitern, Modus, Figur und Koordinatensystem, reduzierte Bewegung (Zahlenstrahl), Runden in Üben und Check in allen vier Reitern mit `progress`, `result` und `complete`.
