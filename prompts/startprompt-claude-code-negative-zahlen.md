# Startprompt für Claude Code: Lab «Negative Zahlen»

Kopiere den Inhalt dieser Datei als erste Nachricht in Claude Code. Lege vorher die unten genannten Dateien im Repo ab.

---

## Auftrag

Baue das Lab **«Negative Zahlen»** (Arbeitstitel: «Rechnen mit negativen Zahlen») für Cogniviolabs. Lernende der Sekundarstufe I üben das Rechnen mit negativen Zahlen: alle vier Grundoperationen, jeweils mit und ohne Klammern, dazu negative Zahlen im Koordinatensystem.

Die Leitidee: **Vorzeichen und Rechenzeichen werden konsequent getrennt.** Die meisten Fehler entstehen, weil beides als dasselbe Zeichen gelesen wird. Das Lab macht den Unterschied sichtbar, bevor es Regeln nennt.

Ziel-Pfad: `lab/mathe/negative-zahlen/` (zuerst prüfen, wie das Repo aufgebaut ist und wo die anderen Labs liegen).

## Zuerst lesen (vollständig, bevor du Code schreibst)

Diese Dateien liegen im Repo (Alain hat sie geliefert). Bei Widersprüchen gilt diese Reihenfolge, oben vor unten:

1. `spec-negative-zahlen.md`: die Spezifikation dieses Labs (Reiter, Modi, Aufgabentypen, Technik, Abnahme).
2. `Design-Skills.md` (Version 1.1): verbindlich für alles Visuelle, besonders Abschnitt 6.4 «Szene Mathematik».
3. `SKILL-labs.md` (Version 1.0): nur als Referenz für die Seitenstruktur (Abschnitt 2: Topbar, Breadcrumb, Footer, Legal-Overlay) und die URL-Konventionen (Abschnitt 6). **Es gibt keinen Abschnitt 9.** Die Plattform-Regeln (i18n, URL-Parameter, Einbettung, Ereignisse) stehen in der Spezifikation und in diesem Prompt. Aus Version 1.0 gilt **nicht**: `lab.css`, der Parallax-Verlauf, `cogniTheme` mit Standard dunkel, die `--c-*`-Variablen. Bei Widerspruch gelten Spezifikation und Design-Skills.
4. `cognivio-common.v1.css` (Version 1.1): enthält den Leitton `mathe` (Lindengrün), `.tabs` und `.segmented`.

Fachdaten und Texte, die du **verwendest, nicht erfindest**:

- `data/aufgaben.json` (schema 1): alle Aufgaben, Musterfolgen, Regeltabelle, Fehlertypen, Stufen.
- `data/figuren.json` (schema 1): Punktlisten für Figuren in Reiter 4.
- `i18n/de.json`: alle deutschen Texte (flache Schlüssel mit Punkten, Platzhalter in `{geschweiften Klammern}`).
- `i18n/en.json`: englischer Entwurf mit denselben Schlüsseln, von Alain noch fachlich zu prüfen.

Abweichungen von Spezifikation oder Design-Skills nur nach ausdrücklicher Rückfrage bei Alain.

## Voraussetzungen und Stand

- Die CSS wird von Alain auf `https://assets.cogniviolabs.com/css/` hochgeladen (überschreibt `v1`). Binde sie wie in Design-Skills 2.3 ein. Solange der Upload fehlt, frage Alain, ob du lokal eine Kopie zum Testen verwenden sollst. Nicht kopieren und im Lab ablegen, ohne zu fragen.
- Die Schriften liegen auf der Assets-Domain. Prüfe beim Test, dass alle mit Status 200 laden und dass Beschriftungen nicht schräg erscheinen.
- Favicons sind **lokal pro Lab** (Design-Skills 8). Das Mathe-Icon fehlt noch: lege einen Platzhalter an und melde es, erfinde kein endgültiges Icon.
- `i18n/en.json` liegt als Entwurf vor. Ergänzt du Schlüssel in `de.json`, ergänze sie auch in `en.json` und melde sie Alain. Fehlt ein Schlüssel in einer Sprache, fällt `t()` auf Deutsch zurück und warnt in der Konsole.
- Der Leitton `mathe` (hell `#5b931a`, dunkel `#84bf40`) ist ein Vorschlag. Prüfe ihn in beiden Modi und melde, wie er wirkt (Kontrast im Hellmodus knapp über 3:1, Abstand zu Matcha der Biologie).

## Was das Lab tut

**Vier Reiter, drei Modi.** Reiter: `zahlenstrahl`, `klammern`, `malgeteilt`, `koordinaten`. Modi über `?mode=`: `entdecken`, `ueben`, `check`. Ohne Parameter wechseln Lernende frei.

| Reiter | Inhalt |
|---|---|
| Zahlenstrahl | Plus und Minus als Bewegung einer Figur. Vorzeichen = Blickrichtung, Rechenzeichen = vorwärts oder rückwärts. Gegenzahl-Schalter. |
| Klammern | 1. Zeichen markieren (Rechenzeichen oder Vorzeichen), 2. Klammer schrittweise auflösen, 3. rechnen, Kontrolle am Zahlenstrahl. |
| Mal und geteilt | Regel aus Musterfolgen entdecken, Vorzeichen-Entscheid vor dem Rechnen, Umkehrprobe bei der Division, Regeltabelle. |
| Koordinatensystem | Gitter −10 bis 10, vier Quadranten, ablesen, setzen, Quadrant bestimmen, spiegeln, verschieben, Figuren. |

**Modi:**

- `entdecken`: freies Probieren ohne Wertung. Die Regel erscheint erst nach der Beobachtungsaufgabe (Musterfolgen aus `muster`, `regel.*` aus `de.json`). Gestaltung im Detail ist dein Vorschlag, aber halte dich an: keine Wertung, Regel erst nach der Beobachtung. Frage bei Unsicherheit nach.
- `ueben`: Aufgaben nach Stufe, sofortige Rückmeldung mit Fehlertyp. Stufe frei wählbar.
- `check`: gemischte Aufgaben aus allen Stufen, Rückmeldung erst am Schluss, Auswertung nach Fehlertyp.

## Aufgaben, Fehlerdiagnose, Rückmeldung

**Aufgaben kommen nur aus `data/aufgaben.json`.** Erzeuge keine Aufgaben im Code und keine Zufallsvarianten (das Wort in der Spezifikation zu Stufe 5 ist überholt, die Datei enthält feste Aufgaben).

- `term_syntax` steht in der Datei: Operatoren `+ - * /` und runde Klammern in ASCII. Die Engine wertet `term` selbst aus und **prüft die `loesung` beim Laden**. Stimmt sie nicht, bricht das Lab mit einer klaren Meldung ab (`error.loesung_pruefung`). Angezeigt wird `-` als echtes Minus U+2212, `*` als Mal-Punkt, `/` als Doppelpunkt.
- Aufgabentypen (`typ`): `rechnen`, `zeichen_markieren`, `punkt_ablesen`, `punkt_setzen`, `quadrant`, `spiegeln`, `verschieben`, `figur_zeichnen`, `figur_verschieben`. Die Felder je Typ liest du aus der Datei. Figuren stehen in `figuren.json`.
- Stufen 1 bis 5 (Rechnen) und K1 bis K3 (Koordinaten) stehen in `stufen`. Stufe 1 und 2 haben `zahlenstrahl: true`.

**Fehlerdiagnose:**

- Jede falsche Antwort wird mit `distraktoren` verglichen (`wert` und `fehlertyp`). Trifft ein Distraktor zu, gilt dessen Fehlertyp.
- Trifft keiner zu, greifen die Auffangtypen: gleicher Betrag, falsches Vorzeichen → `vorzeichen_falsch`, sonst `rechenfehler`. Bei Koordinaten und Quadranten entsprechend.
- Die Fehlertypen mit Texten stehen in `fehlertypen` (Schlüssel `err.<typ>` für die Benennung, `hint.<typ>` für den Anstoss).

**Rückmeldung (Spezifikation, Abschnitt «Rückmeldung»):**

- Richtig: kurze Bestätigung (`.callout--success`, `role="status"`).
- Falsch: `.callout--error` mit `role="alert"`, beginnt mit «Fehler:» (`feedback.fehler_prefix`), dann Fehlertyp in einem Satz (`err.*`), dann der Hinweis (`hint.*`). **Die Lösung wird erst nach einem zweiten Versuch gezeigt.** Nie nur über Farbe. Keine `alert()`-Dialoge.
- Am Ende jeder Runde eine Strategie-Frage (`strategie.1` bis `.4`, reihum). Die Antwort bleibt im Lab, wird weder gespeichert noch gesendet noch bewertet.

## Eingabe und Bedienung

- **Zahleneingabe:** Die Zahlentastaturen auf iOS haben kein Minus. Darum **Vorzeichen-Schalter** (`.btn--secondary`, «+» und «−», `aria-pressed`) plus Feld für den Betrag (`inputmode="numeric"`). Das trennt zugleich Vorzeichen und Betrag.
- **Zahlenstrahl:** Figur ziehen oder Zahl eintippen. Die Figur ist mit Tastatur bedienbar (`role="slider"`, Pfeiltasten, Enter bestätigt).
- **Koordinatensystem:** Punkte per Antippen setzen, per Tastatur verschieben.
- **Barrierefreiheit:** Screenreader lesen U+2212 nicht zuverlässig als «minus». Schreibe in `aria-valuetext` und `aria-label` das Wort aus. Das Wort «minus» fehlt in `de.json`: ergänze die nötigen Schlüssel in `de.json` und `en.json` und melde sie Alain.
- **Reiter und Modus-Umschalter:** `.tabs` und `.segmented` aus der gemeinsamen CSS. Die Pfeiltasten zwischen Optionen einer Gruppe (`role="tablist"` und `role="radiogroup"`) musst du im JS umsetzen.
- Touch-Ziele mindestens 44 px, `prefers-reduced-motion` respektieren (Figur springt dann direkt zum Ergebnis oder es gibt einen Schrittmodus).

## Design (Kurzfassung, verbindlich ist `Design-Skills.md`)

- **Keine Hex-Farben** im Lab-Code, nur `var(--...)`. Keine Verläufe, keine Schatten zur Gliederung, kein Tailwind, kein CDN.
- **SVG statt Canvas** für Zahlenstrahl, Koordinatensystem und Figur.
- **Positiv und negativ ohne zweite Farbe:** positiv = gefüllte Fläche in `--lab-accent` mit Tuschelinie, negativ = Umriss mit Rasterton (SVG-`<pattern>`, Snippet in Design-Skills 6.4). Immer Zahl mit Vorzeichen beschriften, Richtung als Pfeilspitze (rechts und oben positiv). Zinnober und Statusfarben bedeuten nie ein Vorzeichen.
- **Minuszeichen** immer U+2212. Zahlen in Raleway mit `lnum`, in Tabellen `tnum`.
- **Achsen** im Koordinatensystem als Tuschelinie (2 px), Raster als Haarlinie.
- **Titel:** ein grosser handschriftlicher Titel pro Bildschirm (`.lab-title`, Patrick Hand). Höchstens eine Sprechblase oder ein Soundwort pro Szene, nie für Rückmeldungen.
- Zinnober nur für Bedienbares. Sätze in Satzschreibweise, keine Emojis.
- Seitenkopf nach Design-Skills 2.3 mit `data-lab="mathe"`. Seitenstruktur (Topbar mit Breadcrumb und Theme-Schalter, Titel mit LP-Link, Footer mit Legal-Links, Legal-Overlay) wie in SKILL-labs Abschnitt 2, aber mit den Klassen der gemeinsamen CSS. Fehlt dort eine Klasse, frage Alain, statt sie ins Lab zu schreiben (Design-Skills 5.2). Das Theme folgt dem System.
- **Lehrpersonen-Seite** mit `data-audience="teacher"`. Engine und Format von `lp-content.md` (YAML-Frontmatter mit `lernziele`, Abschnitte mit `##`) übernimmst du aus einem bestehenden Lab im Repo, du erfindest sie nicht neu. Prüfe, dass die Seite kein CDN lädt (zum Beispiel `marked` nur lokal unter `/assets/js/`), sonst melde es Alain.

## Technik

- Standalone-HTML, Vanilla JS, kein Framework, keine Build-Pipeline.
- Engine ohne Fachinhalt und ohne sichtbare Texte. Texte nur über `t('schluessel')`. Sprache: `?lang=` → `<html lang>` → Fallback `de`.
- Zahlen über `Intl.NumberFormat`, das Minus als U+2212.
- URL-Parameter nur `lang`, `mode`, `code`, `embed`.
- `?embed=1` blendet Topbar, Breadcrumb, Footer-Links und LP-Link aus, «powered by Cogniviolabs» bleibt. `localStorage` darf fehlen, jeder Zugriff in `try/catch`.
- Das Lab läuft vollständig ohne Konto und hat in dieser Version keine Zusatzfunktionen. Baue kein `hasFeature()`, kein `license.js` und keine `features.json`.
- Name und Logo nur in Kopf und Fuss, nie in Szenen, Sprachdateien oder Fachdaten.
- **Ereignisse** nur über `labEvent(type, payload)`, Slug `negative-zahlen`, kein Name, keine E-Mail, nur der Schülercode (`?code=`). Falls `labEvent` im Repo noch nicht existiert, baue es als **minimalen Hook ohne Netzwerkzugriff**: Er löst im Dokument ein `CustomEvent` namens `cognivio:labevent` aus (`detail` mit Slug, Typ, Payload und Zeit). Bei `?embed=1` sendet er zusätzlich eine `postMessage` an die einbettende Seite, mit dem Origin aus `document.referrer` als Ziel. Ohne Referrer sendest du nichts. Speicherung und Auswertung gehören nicht in diese Version. Existiert `labEvent` bereits, verwende es unverändert.

| `type` | `payload` |
|---|---|
| `start` | `{ reiter, modus }` |
| `progress` | `{ reiter, stufe, aufgabe_id, richtig, fehlertyp, versuche }` |
| `result` | `{ reiter, modus, stufe, anzahl, richtig, fehlertypen: { schluessel: anzahl } }` |
| `complete` | `{ reiter, modus }` |

Die Strategie-Antwort ist kein Teil des Payloads.

## Nicht bauen

White-Label, Partner-Verwaltung, LTI, Französisch, Punkt-vor-Strich-Aufgaben, Zufallsgenerator für Aufgaben, Konto, Login und Freischaltung (`hasFeature`, `license.js`, `features.json`).

## Dateien, die du erzeugst

```
lab/mathe/negative-zahlen/
  index.html
  lehrperson.html
  lp-content.md          (labEvent-Payloads, Lernziele, Einsatzhinweise)
  data/aufgaben.json     (geliefert, nicht ändern)
  data/figuren.json      (geliefert, nicht ändern)
  i18n/de.json           (geliefert, nur fehlende Schlüssel ergänzen)
  i18n/en.json           (geliefert, Entwurf, nur fehlende Schlüssel ergänzen)
  favicon.svg, favicon-32.png, apple-touch-icon.png   (Platzhalter, lokal)
```

Die Texte der Lehrpersonen-Seite sind in `de.json` nur als Gerüst vorhanden (`lp.*`). Ergänze nichts Inhaltliches ohne Rückfrage.

## Vorgehen

Arbeite in dieser Reihenfolge und **halte nach jeder Phase an**, zeige das Ergebnis und warte auf Alains Freigabe:

1. **Gerüst:** Seite nach Vorlage, Leitton, i18n-Loader und `t()`, Aufgaben-Loader mit Prüfung der `loesung`, `labEvent()`, `?embed=1`, `?mode=`, Reiter und Modus-Umschalter.
2. **Reiter 1 und 2:** Zahlenstrahl und Klammern. Das ist der schwerste Teil und die Basis für die anderen.
3. **Reiter 3:** Mal und geteilt, mit Musterfolgen und Regeltabelle.
4. **Reiter 4:** Koordinatensystem mit den Aufgabentypen.
5. **Lehrpersonen-Seite** und `lp-content.md`.

Wenn etwas unklar ist, ein Wert fehlt oder Dateien sich widersprechen: **frage nach, statt zu raten**. Das gilt besonders für Farben, Schriften, Abstände, Texte und Aufgabendaten.

## Abnahme

- [ ] Kein CDN, kein Tailwind, keine Hex-Farben im Lab-Code
- [ ] Keine Texte im HTML oder JS, alles über `t()` (de und en vollständig)
- [ ] Aufgaben nur aus `data/*.json`, `"schema": 1`
- [ ] Alle `loesung`-Werte stimmen mit dem ausgewerteten `term` überein
- [ ] Nur zentrale URL-Parameter (`lang`, `mode`, `code`, `embed`)
- [ ] `?embed=1` getestet, läuft ohne `localStorage`
- [ ] Ergebnisse nur über `labEvent()`, Payloads in `lp-content.md`, keine Personendaten
- [ ] Läuft vollständig ohne Login, ohne Zusatzfunktionen und ohne Freischaltung
- [ ] Keine Markennamen in Szenen, Grafiken, Sprach- oder Fachdaten
- [ ] Hell und Dunkel geprüft, Leitton Lindengrün in beiden Modi
- [ ] Positiv und negativ sind ohne Farbe unterscheidbar
- [ ] Minus durchgehend U+2212, auch in `aria-label` und `aria-valuetext` ausgeschrieben
- [ ] Tastaturbedienung und sichtbarer Fokus in allen Reitern, Touch-Ziele ab 44 px
- [ ] `prefers-reduced-motion` berücksichtigt
- [ ] Alle Schriften laden mit Status 200 (Entwicklertools, Filter «Font»)
- [ ] Favicon-Set lokal im Lab-Ordner

## Offene Punkte (an Alain melden, nicht selbst entscheiden)

- Leitton-Werte `mathe` visuell prüfen
- Arbeitstitel des Labs für `.lab-title`
- Mathe-Icon (Favicon)
- Auswertung der Ereignisse (`labEvent`): nicht Teil dieser Version, Alain entscheidet später, wohin sie gehen
- Verhältnis zum geplanten Zahlenstrahl-Lab fürs Grundwissen-Heft: gemeinsame Zahlenstrahl-Komponente oder getrennt (baue die Zahlenstrahl-Komponente so, dass sie sich später herauslösen lässt)
