# Spezifikation: Lab «Negative Zahlen»

Oct 27, 2026 · @Alain Lavanchy

## Ziel und Rahmen

Das Lab lässt Lernende der Sekundarstufe I das Rechnen mit negativen Zahlen üben: alle vier Grundoperationen, jeweils mit und ohne Klammern, dazu negative Zahlen im Koordinatensystem. Erster Einsatz ist die stärkste Mathe-Klasse (14-Jährige, heterogen), deshalb braucht es mehrere Stufen.

Die Leitidee: **Vorzeichen und Rechenzeichen werden konsequent getrennt.** Die meisten Fehler entstehen, weil beides als dasselbe Zeichen gelesen wird. Das Lab macht den Unterschied sichtbar, bevor es Regeln nennt.

| Punkt | Festlegung |
| --- | --- |
| Pfad | `cogniviolabs.com/lab/math/negative-zahlen/` |
| Lehrpersonen-Seite | `.../negative-zahlen/lehrperson` |
| `data-lab` | `mathe` (neu) |
| Leitton | Lindengrün, hell `#5b931a`, dunkel `#84bf40` (Vorschlag, visuell noch zu prüfen) |
| Sprachen | Deutsch und Englisch über `i18n/` |
| Einbettung | `?embed=1` muss laufen |
| Verbindlich | `SKILL-labs.md` (inkl. Abschnitt 9) und `Design-Skills.md` |

Abweichungen von diesen beiden Dokumenten nur auf ausdrückliche Anweisung von Alain.

## Aufbau: Reiter und Modi

Vier Reiter, drei Modi. Die Reiter sind der Inhalt, die Modi die Arbeitsweise. Jeder Reiter läuft in jedem Modus.

| Reiter | Inhalt |
| --- | --- |
| 1. Zahlenstrahl | Addition und Subtraktion als Bewegung |
| 2. Klammern | Vorzeichen und Rechenzeichen trennen, Klammern auflösen |
| 3. Mal und geteilt | Vorzeichenregeln aus Mustern entdecken, dann anwenden |
| 4. Koordinatensystem | vier Quadranten, Spiegeln, Verschieben |

| Modus (`?mode=`) | Zweck | Verhalten |
| --- | --- | --- |
| `entdecken` | Regel selbst finden | freies Probieren, keine Wertung, Regel erscheint erst nach Beobachtungsaufgabe |
| `ueben` | Fertigkeit festigen | Aufgaben nach Stufen, sofortige Rückmeldung mit Fehlertyp |
| `check` | Stand prüfen | gemischte Aufgaben, Rückmeldung erst am Schluss, Auswertung nach Fehlertyp |

Ohne Parameter ist das Lab frei: Lernende wechseln Reiter und Modus selbst. Mit `?mode=` sperrt die Lehrperson auf einen Modus. Die Reiter folgen ARIA (`role="tablist"`, `aria-selected`) und nutzen `.tabs`, der Modus-Umschalter nutzt `.segmented`, beides aus der gemeinsamen CSS. Der Fokus ist sichtbar.

## Reiter 1: Zahlenstrahl

Addition und Subtraktion werden als Bewegung auf einem horizontalen Zahlenstrahl gezeigt. Eine Figur (Hautton `--skin`, Tuschelinie) steht auf der Startzahl.

- **Vorzeichen = Blickrichtung.** Positiv: Figur schaut nach rechts. Negativ: nach links.
- **Rechenzeichen = Schrittart.** Plus: vorwärts gehen. Minus: rückwärts gehen.
- Beispiel: 5 − (−3). Figur steht auf 5, schaut nach links (wegen −3), geht rückwärts und landet auf 8.
- **Gegenzahl-Schalter:** Ein Knopf wandelt jede Subtraktion in die Addition der Gegenzahl um und zeigt, dass beide Wege dasselbe Ergebnis haben.
- Eingabe: Lernende ziehen die Figur auf das Ergebnis oder geben die Zahl ein. Weil die Zahlentastaturen auf iOS kein Minus haben, besteht die Eingabe aus einem Vorzeichen-Schalter («+» und «−», `aria-pressed`) und einem Feld für den Betrag. Das trennt zugleich Vorzeichen und Betrag. Zahlenbereich in der ersten Stufe −10 bis 10, später −20 bis 20.
- Die Darstellung nutzt Form und Beschriftung (Pfeilspitze, Zahl am Pfeil), nie nur Farbe (Regel 4.3 im Design-Skill).

Im Modus `entdecken` gibt es eine Beobachtungsaufgabe: «Setze 5 − 3, 5 − (−3) und 5 + (−3) ein. Was fällt dir auf?» Erst danach erscheint die Regel als Zusammenfassung.

## Reiter 2: Klammern

Ziel ist, dass Lernende in jeder Aufgabe erkennen, welches Zeichen ein Rechenzeichen und welches ein Vorzeichen ist. Erst danach wird gerechnet.

1. **Zeichen markieren.** Die Aufgabe wird angezeigt, Lernende tippen jedes Zeichen an und ordnen es zu: Rechenzeichen oder Vorzeichen. Die Zeichen werden dabei mit Form markiert (Kreis um Rechenzeichen, Dreieck am Vorzeichen), nicht nur mit Farbe.
2. **Klammer auflösen.** Schrittweise Umformung, die Lernende selbst ausführen: 4 − (−7) wird zu 4 + 7. Jeder Schritt zeigt die Zeichenkombination (zwei gleiche Zeichen werden Plus, zwei verschiedene Minus).
3. **Rechnen.** Ergebnis eingeben, anschliessend Kontrolle am Zahlenstrahl aus Reiter 1.

Aufgabentypen (Stufen siehe Abschnitt «Aufgabenstufen»):

- Ohne Klammern: −3 + 8, 5 − 9, −4 − 6
- Mit Klammern: 4 + (−7), −2 − (−5), −(−3) + 6
- Mehrere Glieder: 8 + (−3) − (−2) − 5

Im Modus `entdecken` entsteht die Regel aus einer Musterfolge (4 − 2, 4 − 1, 4 − 0, 4 − (−1), …): Lernende ergänzen die Ergebnisse und formulieren, was beim Subtrahieren einer negativen Zahl passiert.

## Reiter 3: Multiplikation und Division

Die Vorzeichenregeln werden nicht vorgegeben, sondern aus Mustern gefunden. Multiplikation und Division teilen sich denselben Reiter, weil die Regel dieselbe ist.

1. **Musterfolge (`entdecken`).** Lernende ergänzen: −3 · 3, −3 · 2, −3 · 1, −3 · 0, −3 · (−1), −3 · (−2). Das Ergebnis wächst jeweils um 3, daraus folgt das Vorzeichen für Minus mal Minus.
2. **Vorzeichen-Entscheid.** Vor dem Rechnen wählen Lernende das Vorzeichen des Ergebnisses (+ oder −), danach den Betrag. Das trennt die zwei Denkschritte, die oft vermischt werden.
3. **Umkehrprobe bei der Division.** Zu 12 : (−4) = ? gehört die Probe (−4) · ? = 12. So wird die Divisionsregel auf die Multiplikationsregel zurückgeführt.
4. **Regeltabelle.** Eine kleine Tabelle (+/+, +/−, −/+, −/−) füllt sich mit den Beispielen, die die Lernenden selbst gelöst haben. Sie ist erst nach der Beobachtungsaufgabe sichtbar.

Aufgabenmix in der Stufe «gemischt»: Mal, geteilt, plus und minus durcheinander. Punkt-vor-Strich-Aufgaben gehören nicht in v1. Wenn sie später dazukommen, wird das als eigene Stufe mit eigenem Fehlertyp ergänzt.

## Reiter 4: Koordinatensystem

Negative Zahlen werden zweidimensional. Das Gitter geht von −10 bis 10 auf beiden Achsen. Achsen sind Tuschelinie, Raster Haarlinie, Zahlen in Raleway mit normalen Ziffern.

| Quadrant | Vorzeichen (x, y) |
| --- | --- |
| I (oben rechts) | (+, +) |
| II (oben links) | (−, +) |
| III (unten links) | (−, −) |
| IV (unten rechts) | (+, −) |

Aufgabentypen:

1. **Punkt ablesen.** Ein Punkt ist markiert, Lernende geben (x, y) ein. Hinweis auf die Reihenfolge: erst x (waagrecht), dann y (senkrecht).
2. **Punkt setzen.** Koordinaten sind vorgegeben, Lernende setzen den Punkt durch Antippen.
3. **Quadrant bestimmen.** Aus den Vorzeichen auf den Quadranten schliessen und umgekehrt.
4. **Spiegeln.** Punkt an der x- oder y-Achse spiegeln. Lernende erkennen, welches Vorzeichen kippt.
5. **Verschieben.** Ein Punkt oder eine Figur wird um (+3 | −2) verschoben. Verbindung zu Reiter 1: Verschieben ist Addieren mit Vorzeichen.
6. **Figur zeichnen.** Eine Liste von Punkten ergibt, in der Reihenfolge verbunden, eine Figur. Die Figur ist Daten in `data/` und ohne Markennamen oder geschützte Motive.

Punkte und Quadranten werden mit Form und Beschriftung unterschieden, nicht nur über Farbe.

## Aufgabenstufen, Fehlertypen und Rückmeldung

Alle Aufgaben stehen in `data/aufgaben.json`, nicht im Code. Falsche Antworten werden einem **Fehlertyp** zugeordnet, und die Rückmeldung benennt diesen Typ, statt nur «falsch» zu melden.

| Stufe | Inhalt | Beispiel |
| --- | --- | --- |
| 1 | Plus und Minus am Zahlenstrahl, Bereich −10 bis 10 | 5 − 8 |
| 2 | Plus und Minus ohne Klammern, Ergebnis oft negativ | −3 + 8, −4 − 6 |
| 3 | Plus und Minus mit Klammern | 4 − (−7), −2 + (−5) |
| 4 | Mal und geteilt, eine Operation | −6 · 7, −24 : (−4) |
| 5 | gemischt, mehrere Glieder, alle Operationen | 8 + (−3) − (−2) |
| K1 | Koordinaten ablesen und setzen | Punkt (−3 \| 4) |
| K2 | Quadranten bestimmen und spiegeln | Spiegelung an der y-Achse |
| K3 | Verschieben und Figuren | Verschiebung um (+3 \| −2) |

Stufen 1 bis 5 sind aufsteigend und im Modus `ueben` einzeln wählbar. Im Modus `check` mischt das Lab alle Stufen.

### Fehlertypen (Startliste)

| Schlüssel | Typischer Fehler | Beispiel |
| --- | --- | --- |
| `betrag_statt_vz` | Kleinere Zahl von grösserer abgezogen, Vorzeichen des Ergebnisses verloren | 5 − 8 = 3 |
| `minus_minus_minus` | Minus vor negativer Zahl wie ein einfaches Minus gerechnet | 5 − (−3) = 2 |
| `plus_klammer_betrag` | Vorzeichen in der Klammer ignoriert | 4 + (−7) = 11 |
| `erstes_vz_ignoriert` | Vorzeichen der ersten Zahl ignoriert | −3 + 8 = 11 |
| `mal_vz` | Minus mal Minus als Minus | −3 · (−4) = −12 |
| `div_vz` | Falsches Vorzeichen beim Teilen | −12 : 4 = 3 |
| `koord_vertauscht` | x und y vertauscht | (−3 \| 4) als (4 \| −3) |
| `koord_vz` | Vorzeichen einer Koordinate falsch | (−3 \| 4) als (3 \| 4) |
| `spiegel_achse_vertauscht` | Punkt an der falschen Achse gespiegelt | Spiegelung an der x-Achse statt an der y-Achse |
| `verschiebung_vz` | Richtung eines Verschiebungsschritts falsch | (+3 \| −2) als (−3 \| −2) |
| `vorzeichen_falsch` | Betrag stimmt, Vorzeichen falsch (Auffangtyp) |  |
| `rechenfehler` | Betrag falsch, kein Vorzeichenproblem (Auffangtyp) |  |

Jede Aufgabe in der JSON nennt ihre erwartbaren Fehlantworten mit Typ (`distraktoren`). Trifft keine zu, greifen die zwei Auffangtypen.

### Rückmeldung

- Richtig: kurze Bestätigung (`.callout--success`, `role="status"`), bei Stufenwechsel ein Hinweis auf die nächste Stufe.
- Falsch: `.callout--error` mit `role="alert"`. Es beginnt mit «Fehler:», nennt den Fehlertyp in einem Satz und gibt dann einen Hinweis, der zu Reiter 1 oder 2 zurückführt (z. B. «Schau, in welche Richtung die Figur blickt»). Das Ergebnis wird nicht verraten, bevor ein zweiter Versuch gemacht wurde.
- Sprache ruhig und ohne Wertung. Meldungen für Fehler beginnen mit «Fehler:» oder einem Icon, nie nur über Farbe (Regel im Design-Skill).
- Am Ende jeder Runde eine Strategie-Frage, z. B. «Woran hast du erkannt, welches Vorzeichen das Ergebnis hat?» Die Antwort bleibt im Lab, wird nicht gespeichert und nicht bewertet.

## Technik nach SKILL-labs

Standalone-HTML, Vanilla JS, kein Framework, kein CDN, kein Tailwind, keine Build-Pipeline. Engine und Inhalt sind getrennt (Abschnitt 9.1), Texte kommen aus Sprachdateien (9.2).

| Datei | Inhalt |
| --- | --- |
| `index.html` | Lab-Seite nach Vorlage aus SKILL-labs Abschnitt 2 |
| `lehrperson.html` | Lehrpersonen-Seite (`data-audience="teacher"`) |
| `lp-content.md` | Beschreibung der `labEvent`-Payloads, Lernziele, Einsatzhinweise |
| `data/aufgaben.json` | alle Aufgaben, `"schema": 1` |
| `data/figuren.json` | Punktlisten für Figuren in Reiter 4, `"schema": 1` |
| `data/features.json` | Zuordnung Funktion zu Stufe (frei, E-Mail, Lizenz), `"schema": 1` |
| `i18n/de.json`, `i18n/en.json` | alle sichtbaren Texte, Zugriff über `t('schluessel')` |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | lokal im Lab-Ordner, Leitton Lindengrün |

### Aufgabenformat (Stand der Datei `data/aufgaben.json`)

```json
{
  "schema": 1,
  "term_syntax": "Operatoren + - * / und runde Klammern, ASCII",
  "stufen": { "1": "Plus und Minus am Zahlenstrahl", "K1": "Punkte ablesen und setzen" },
  "fehlertypen": [
    { "key": "minus_minus_minus", "beispiel": "5 - (-3) = 2", "beschreibung_key": "err.minus_minus_minus", "hinweis_key": "hint.minus_minus_minus" }
  ],
  "regeltabelle": [ { "faktor_a": "-", "faktor_b": "-", "ergebnis": "+" } ],
  "muster": [
    { "id": "m-mal-1", "reiter": "malgeteilt", "operation": "mal", "frage_key": "muster.mal.frage1", "luecken": [4, 5, 6],
      "reihe": [ { "term": "-3 * 3", "loesung": -9 } ] }
  ],
  "aufgaben": [
    { "id": "s3-001", "stufe": 3, "reiter": "klammern", "typ": "rechnen", "term": "5 - (-3)", "loesung": 8,
      "distraktoren": [
        { "wert": 2, "fehlertyp": "minus_minus_minus" },
        { "wert": -8, "fehlertyp": "vorzeichen_falsch" }
      ],
      "hinweis_key": "hint.klammer.gegenzahl", "modi": ["ueben", "check"] },
    { "id": "k1-001", "stufe": "K1", "reiter": "koordinaten", "typ": "punkt_ablesen", "punkt": [-3, 4], "loesung": [-3, 4],
      "distraktoren": [ { "wert": [4, -3], "fehlertyp": "koord_vertauscht" } ],
      "hinweis_key": "hint.koord.x_zuerst", "modi": ["ueben", "check"] }
  ]
}
```

Aufgabentypen (`typ`) und ihre Felder:

- `rechnen`: `term`, `loesung`, `distraktoren`, optional `zahlenstrahl`, `operation`, `umkehrprobe`
- `zeichen_markieren`: `term`, `zeichen` (Liste mit `t` und `rolle`)
- `punkt_ablesen`: `punkt`, `loesung`
- `punkt_setzen`: `koordinaten`, `loesung`
- `quadrant`: `punkt`, `loesung` (I bis IV)
- `spiegeln`: `punkt`, `achse` (x oder y), `loesung`
- `verschieben`: `punkt`, `vektor`, `loesung`
- `figur_zeichnen`: `figur_id`, `loesung` (Punktliste)
- `figur_verschieben`: `figur_id`, `vektor`, `loesung`

Die Engine wertet `term` selbst aus und prüft die `loesung` beim Laden. Stimmt sie nicht, bricht das Lab mit einer klaren Meldung in der Konsole ab. Aufgaben werden nie im Code erzeugt, und diese Version hat keine Zufallsvarianten: Alle Aufgaben stehen fest in der JSON.

### Ereignisse (`labEvent`)

Ergebnisse laufen nur über `labEvent(type, payload)` (Abschnitt 9.5). Slug: `negative-zahlen`. Kein Name, keine E-Mail, nur der Schülercode.

| `type` | `payload` |
| --- | --- |
| `start` | `{ reiter, modus }` |
| `progress` | `{ reiter, stufe, aufgabe_id, richtig, fehlertyp, versuche }` |
| `result` | `{ reiter, modus, stufe, anzahl, richtig, fehlertypen: { schluessel: anzahl } }` |
| `complete` | `{ reiter, modus }` |

Die Strategie-Antwort der Lernenden ist kein Teil des Payloads.

### Weitere Vorgaben

- **URL-Parameter:** nur `lang`, `mode` (`entdecken`, `ueben`, `check`), `code`, `embed`. Neue Parameter zuerst in SKILL-labs 9.3 eintragen.
- **Einbettung:** `?embed=1` blendet Topbar, Breadcrumb, Footer-Links und LP-Link aus. Sichtbar bleibt «powered by Cogniviolabs». `localStorage` darf fehlen, jeder Zugriff steht in `try/catch`.
- **Freischaltung:** Das Lab läuft vollständig ohne Konto. Zusatzfunktionen nur über `hasFeature()`, die Prüfung liegt in `license.js`. Fehlt sie, gilt die Gratisstufe.
- **Marke:** Name und Logo nur in Kopf und Fuss, nie in Szenen, Sprachdateien oder Fachdaten (9.7).
- **Nicht bauen:** White-Label, Partner-Verwaltung, LTI, Französisch (9.8).
- **Zahlen:** Formatierung über `Intl.NumberFormat`. Das Minuszeichen wird als echtes Minus (U+2212) dargestellt, nicht als Bindestrich, damit Vorzeichen und Rechenzeichen im Text gleich aussehen wie in der Grafik.

## Design

Grundlage ist `Design-Skills.md`. Hier nur, was für dieses Lab neu oder besonders wichtig ist.

**Leitton Mathe (neu):** Lindengrün als `--lab-accent` über `data-lab="mathe"`. Die Werte sind ein Vorschlag und müssen in beiden Modi visuell geprüft werden. Kontrast gegen das Papier: ca. 3.3:1 (hell) und 8.1:1 (dunkel), im Hellmodus also nur knapp über der Grenze von 3:1.

```css
[data-lab="mathe"] { --lab-accent: #5b931a; }
:root[data-theme="dark"] [data-lab="mathe"] { --lab-accent: #84bf40; }
/* plus Variante für prefers-color-scheme: dark, wie bei den anderen Leittönen */
```

Der Eintrag steht in `cognivio-common.v1.css` (Version 1.1). Tabelle 4.2 und Abschnitt 2.3 im Design-Skill sind nachgeführt.

**Positiv und negativ unterscheiden, ohne zwei Farben zu brauchen.** Die Regel «nie nur über Farbe» gilt. Vorschlag:

- Positive Zahlen und Richtungen: **gefüllte** Form in `--lab-accent` mit Tuschelinie, Pfeil nach rechts oder oben.
- Negative Zahlen und Richtungen: **Umriss** mit Rasterton (`.screentone`) in `--lab-accent`, Pfeil nach links oder unten.
- Zusätzlich immer die Zahl mit Vorzeichen beschriftet.

**Weitere Vorgaben:**

- **Zinnober nur für Bedienbares:** Buttons, Regler, aktiver Reiter, Fokusring. Nie für negative Zahlen oder falsche Antworten. Falsche Antworten werden mit «Fehler:» eingeleitet.
- **Szene:** Tuschelinie 2 px, auch bei den Koordinatenachsen, Raster als Haarlinie. Figur mit `--skin`. Höchstens eine Sprechblase oder ein Soundwort pro Szene, nie für Rückmeldungen (Hinweise laufen über Callouts), höchstens im Modus `entdecken` für den Beobachtungsimpuls.
- **Titel:** ein grosser handschriftlicher Titel pro Bildschirm (Patrick Hand, `.lab-title`), alles andere ruhig. Titel und Texte in Satzschreibweise, keine Emojis.
- **SVG statt Canvas:** Zahlenstrahl, Koordinatensystem und Figur werden als SVG gebaut. Farben nie als Hex im Code, sondern als `var(--...)` in `fill` und `stroke`. So braucht ein Theme-Wechsel kein Neuzeichnen. Zahlen in Raleway mit normalen Ziffern.
- **Bewegung:** Die Figur im Zahlenstrahl bewegt sich nur als Folge einer Handlung der Lernenden. Mit `prefers-reduced-motion` springt sie direkt zum Ergebnis, oder es gibt einen Schrittmodus.
- **Bedienung:** Tastaturbedienung für Zahlenstrahl und Koordinatensystem (Pfeiltasten verschieben, Enter bestätigt, `role="slider"` mit `aria-valuenow` und `aria-valuetext`). Das Minus wird dort als Wort ausgeschrieben («minus drei»), weil Screenreader U+2212 nicht zuverlässig lesen. Touch-Ziele mindestens 44 px, Hell und Dunkel testen.

## Bauphasen und Abnahme

Das Lab erscheint als eine Version mit allen vier Reitern. Gebaut wird in dieser Reihenfolge, weil die Reiter aufeinander aufbauen:

1. **Gerüst:** Seite nach Vorlage, Leitton `mathe` in der gemeinsamen CSS, i18n-Loader, `t()`, Aufgaben-Loader mit Prüfung der `loesung`, `labEvent()`, `?embed=1`, `?mode=`.
2. **Reiter 1 und 2:** Zahlenstrahl und Klammern. Das ist der schwerste Teil und die Basis für die anderen.
3. **Reiter 3:** Mal und geteilt, mit Musterfolgen und Regeltabelle.
4. **Reiter 4:** Koordinatensystem mit den sechs Aufgabentypen.
5. **Lehrpersonen-Seite** und `lp-content.md`.

Claude Code erfindet keine Aufgaben. Es verwendet die gelieferte `data/aufgaben.json` und meldet, wenn eine Aufgabe die Prüfung der `loesung` nicht besteht.

### Abnahme

- [ ] Kein CDN, kein Tailwind, keine Hex-Farben im Lab-Code
- [ ] Keine Texte im HTML oder JS, alles über `t()` (de und en vollständig)
- [ ] Aufgaben nur aus `data/*.json`, `"schema": 1`
- [ ] Nur zentrale URL-Parameter (`lang`, `mode`, `code`, `embed`)
- [ ] `?embed=1` getestet, läuft ohne `localStorage`
- [ ] Ergebnisse nur über `labEvent()`, Payloads in `lp-content.md` dokumentiert, keine Personendaten
- [ ] Läuft vollständig ohne Login, Zusatzfunktionen nur über `hasFeature()`
- [ ] Keine Markennamen in Szenen, Grafiken, Sprach- oder Fachdaten
- [ ] Hell und Dunkel geprüft, Leitton Lindengrün in beiden Modi
- [ ] Positiv und negativ sind ohne Farbe unterscheidbar
- [ ] Tastaturbedienung und sichtbarer Fokus in allen Reitern
- [ ] `prefers-reduced-motion` berücksichtigt
- [ ] Schriften laden mit Status 200 (Entwicklertools, Filter «Font»)
- [ ] Favicon-Set lokal im Lab-Ordner
- [ ] Alle `loesung`-Werte in der JSON stimmen mit dem ausgewerteten `term` überein

### Offene Punkte

- Lindengrün-Werte visuell prüfen (Kontrast im Hellmodus, Abstand zu Matcha der Biologie)
- Welche CSS-Datei im Repo aktuell gilt (`lab.css` oder `cognivio-common.v1.css`), siehe offener Punkt in `Design-Skills.md`, Abschnitt 13
- Arbeitstitel des Labs für `.lab-title`
- Punkt-vor-Strich-Aufgaben: bewusst nicht in dieser Version
- Verhältnis zum geplanten Zahlenstrahl-Lab fürs Grundwissen-Heft: gemeinsame Zahlenstrahl-Komponente oder getrennt
