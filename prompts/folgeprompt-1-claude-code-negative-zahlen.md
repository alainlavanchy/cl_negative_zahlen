# Folge-Prompt 1 für Claude Code: Lab «Negative Zahlen»

Das Lab läuft lokal und unter `https://cogniviolabs.com/lab/math/negative-zahlen/index.html`. Die gemeinsame CSS in Version 1.1 ist hochgeladen. Alain hat das Lab getestet und drei Dinge gefunden. Setze sie in dieser Reihenfolge um. Arbeite wie im Startprompt: nach jedem Punkt anhalten, zeigen, Freigabe abwarten.

Es gelten weiterhin Spezifikation, `Design-Skills.md` (Version 1.1) und die Regeln des Startprompts. Ändere nichts an `data/aufgaben.json`, `data/figuren.json` und den bestehenden Schlüsseln in `i18n/de.json`.

---

## 1. Pfad: `math` statt `mathe`

Der Fach-Slug in der URL ist **`math`** (Entscheid Alain, international verständlicher). Der Eintrag `mathe` in SKILL-labs Abschnitt 6 ist damit überholt.

- Pfad: `lab/math/negative-zahlen/`. Alain hat den Ordner lokal schon umbenannt. Prüfe, dass **alle** Verweise stimmen: Breadcrumb (Fach-Link `/lab/math`), Canonical, Link auf die Lehrpersonen-Seite, Favicon-Links, Einbettungs-Hinweise.
- Anzeigename des Fachs im Breadcrumb: «Mathematik» (en: «Mathematics»). Fehlt dafür ein Schlüssel in `i18n/de.json`, ergänze ihn in `de.json` und `en.json` und melde ihn.
- **Bleibt unverändert:** `data-lab="mathe"` (so steht es in der gemeinsamen CSS, wie bei den anderen Leittönen mit deutschem Namen) und der Ereignis-Slug `negative-zahlen`.
- Suche im gesamten Lab nach dem String `lab/mathe` und `/mathe/`, und nach hart codierten Pfaden.

## 2. Zahleneingabe: ein Feld statt Vorzeichen plus Betrag

**Problem:** Im Üben und im Check ist die Zweiteilung in Vorzeichen und Betrag mühsam und langsam. Ausserdem sieht man nach einem Klick auf die Vorzeichen-Buttons keinen Zustand. Die alte Vorgabe «Vorzeichen-Schalter plus Betragsfeld» in der Spezifikation und in den Design-Skills ist ersetzt.

**Neue Komponente `Zahlenfeld`** (wiederverwendbar, eigene Funktion oder eigenes Modul):

- **Ein Feld** zeigt immer die **ganze Zahl** mit Vorzeichen, das Minus als U+2212 (zum Beispiel «−7»). `type="text"`, `inputmode="numeric"`, `autocomplete="off"`, Schriftgrösse wie die Aufgabe, Raleway mit `tnum`.
- Daneben eine **±-Taste** (`.btn--secondary`, mindestens 44 × 44 px, `aria-pressed="true"` bei negativem Vorzeichen, gefüllter Zustand durch die CSS). Sie schaltet das Vorzeichen um, **vor und nach** der Eingabe der Ziffern. Sie ist auf dem Handy immer sichtbar, weil die iOS-Zahlentastatur kein Minus hat.
- **Zustand sichtbar:** Ist das Vorzeichen negativ und noch keine Ziffer eingegeben, zeigt das Feld trotzdem «−» an. Das Feld darf dafür ein Präfix-Element haben, der Eingabewert bleibt eine Zahl.
- **Eingabe-Regeln:** Ziffern, höchstens drei Stellen. Am Anfang werden `-`, `−`, `–` und `+` angenommen (am Desktop tippt man einfach «-») und als U+2212 beziehungsweise ohne Zeichen angezeigt. Alles andere wird still verworfen. Gültig ist `^[−+]?\d+$` nach der Normalisierung. Das Feld ist nach einer falschen Antwort geleert und fokussiert (nicht auf Touch-Geräten, dort kein automatischer Fokus).
- **Enter** prüft. Leeres Feld beim Prüfen: Meldung `feedback.keine_antwort`.
- **Barrierefreiheit:** `aria-label` mit Aufgabe, der Wert wird für Screenreader mit ausgeschriebenem «minus» vorgelesen (`aria-valuetext` nicht nötig, aber das Label der ±-Taste muss den Zustand nennen). Neue Schlüssel in `de.json` und `en.json`: `btn.vorzeichen` («Vorzeichen wechseln» / «Change sign»), `a11y.minus` («minus» / «minus»), `a11y.plus` («plus» / «plus»).

**Wo das Zahlenfeld verwendet wird:**

- Alle `rechnen`-Aufgaben der Stufen 3 bis 5 in `ueben` und `check`.
- `punkt_ablesen`, `spiegeln`, `verschieben`: zwei Felder (x und y), jedes mit eigener ±-Taste. Enter in x springt nach y, Enter in y prüft.
- `punkt_setzen` und `figur_zeichnen` bleiben Antippen im Koordinatensystem. `quadrant` bleibt Auswahl I bis IV.

**Mal und geteilt:** Der Vorzeichen-Entscheid vor dem Rechnen (`mal.vz_entscheid`, `mal.betrag`) bleibt **nur im Modus `entdecken`** Teil der Musteraufgabe. Im Üben und im Check gibt es ein Zahlenfeld, die Hilfe liegt im Hinweis (`hint.mal.vorzeichen_zuerst`).

## 3. Stufe 1 und 2: Antwort am Zahlenstrahl

Aufgaben mit `zahlenstrahl: true` werden **am Zahlenstrahl beantwortet**, ohne Tastatur:

- Die Figur lässt sich ziehen oder antippen. Sie rastet auf der nächsten ganzen Zahl ein, die Zahl steht live über der Figur. Tastatur: Pfeiltasten, Enter bestätigt (`role="slider"`).
- **Schritt-Tasten** links und rechts neben dem Zahlenstrahl (je 44 × 44 px, Beschriftung «eins nach links» und «eins nach rechts» als `aria-label`). Auf schmalen Bildschirmen sind 41 Teilstriche zu eng zum genauen Antippen, darum sind die Tasten Pflicht, nicht Zugabe.
- «Prüfen» prüft die Zahl, auf der die Figur steht. Das Zahlenfeld aus Punkt 2 steht als **Alternative** darunter, ohne Autofokus.
- Die Figur startet in jeder Aufgabe auf der Startzahl. Der Zahlenstrahl-Bereich bleibt −20 bis 20.

## 4. Entdecken-Baukasten (Reiter Zahlenstrahl): Zustand sichtbar machen

Heute gibt es Start, Rechenzeichen und Zahl mit je zwei Buttons «+» und «−» ohne erkennbaren Zustand. Umbauen:

- **Start** und **Zahl:** je ein Zahlenfeld mit ±-Taste (wie in Punkt 2), dazu zwei kleine Tasten für «eins mehr» und «eins weniger» (`aria-label`, 44 px). Sie ändern die ganze Zahl um 1 und laufen dabei über die Null (von 0 «eins weniger» ergibt −1). Das übt die Reihenfolge der Zahlen.
- **Rechenzeichen:** `.segmented` mit den Tasten «+» und «−» (`role="radiogroup"`, Tasten mit `role="radio"` und `aria-checked`). **Genau eine** Taste ist immer aktiv, Vorgabe «+».
- **Live-Term:** Über dem Baukasten steht gross der aktuelle Term, der sich bei jeder Änderung sofort anpasst, mit Klammern um negative zweite Zahlen: «5 − (−3)». Erste Zahl ohne Klammer («−4 + 6»).
- «Starten» ist deaktiviert, solange ein Feld leer ist. «Gegenzahl» und «Zurücksetzen» bleiben.

## 5. Modus und Reiter: aktiver Zustand immer sichtbar

Auf dem Screenshot hat kein Modus-Button und kein Reiter einen erkennbaren aktiven Zustand.

- **Modus:** `.segmented` mit `role="radiogroup"`, Tasten `role="radio"` und `aria-checked`. Der Standardmodus ohne `?mode=` ist `entdecken` (der Beschreibungstext dazu erscheint bereits) und wird **sichtbar markiert**. Pfeiltasten wechseln innerhalb der Gruppe.
- **Reiter:** `.tabs` mit `role="tablist"` und `role="tab"`, aktiver Reiter mit `aria-selected="true"`. Die Reiter auf dem Screenshot sehen wie kleine Rahmen-Buttons aus, nicht wie `.tabs`.
- **Prüfe in den Entwicklertools, ob die live ausgelieferte CSS die Klassen `.tabs` und `.segmented` und die Regeln für `[aria-pressed="true"]` und `[aria-checked="true"]` enthält** (Datei `cognivio-common.v1.css`, Stand Version 1.1, Cache bis zu einer Stunde). Fehlen sie, melde es Alain, schreibe **keine** eigenen Regeln dafür ins Lab.

---

## Abnahme dieser Runde

- [ ] Alle Pfade, Links und Breadcrumb zeigen auf `lab/math/negative-zahlen/`, kein `lab/mathe` mehr
- [ ] `data-lab="mathe"` und Ereignis-Slug `negative-zahlen` unverändert
- [ ] Ein Zahlenfeld mit ±-Taste in `ueben` und `check`, Zustand im Feld und an der Taste sichtbar
- [ ] Zahleneingabe getestet: «-7», «−7», «7», nur «−», Löschen, Enter, falsche Zeichen
- [ ] x/y-Eingabe bei Koordinatenaufgaben mit Sprung von x nach y
- [ ] Stufe 1 und 2: Antwort am Zahlenstrahl (ziehen, antippen, Pfeiltasten, Schritt-Tasten), ohne Tastatur auf Touch-Geräten
- [ ] Entdecken-Baukasten mit Live-Term und genau einem aktiven Rechenzeichen
- [ ] Modus und Reiter zeigen ihren aktiven Zustand, auch ohne Farbe (Füllung, Unterstrich)
- [ ] Neue Schlüssel in `de.json` und `en.json` ergänzt und gemeldet
- [ ] Getestet in Hell und Dunkel, bei 375 px Breite (iPhone) und mit Tastatur allein
- [ ] Keine Hex-Farben, keine eigenen Regeln für Zustände im Lab

Zeige am Ende eine Liste aller geänderten Dateien und aller neuen Schlüssel.
