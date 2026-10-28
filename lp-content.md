---
title: Rechnen mit negativen Zahlen
fach: Mathematik
stufe: Sek I
slug: negative-zahlen
breadcrumb_fach_label: Mathematik
breadcrumb_fach_url: https://www.cogniviolabs.com/lab/math
breadcrumb_lab_label: Negative Zahlen
breadcrumb_lab_url: https://www.cogniviolabs.com/lab/math/negative-zahlen
lernziele:
  - SuS unterscheiden in einem Term Vorzeichen und Rechenzeichen
  - SuS addieren und subtrahieren ganze Zahlen, mit und ohne Klammern, und kontrollieren das Ergebnis am Zahlenstrahl
  - SuS bestimmen beim Multiplizieren und Dividieren zuerst das Vorzeichen des Ergebnisses und leiten die Regel aus einer Musterfolge ab
  - SuS lesen und setzen Punkte in allen vier Quadranten, spiegeln Punkte an den Achsen und verschieben Punkte und Figuren
---

## Didaktische Einbettung

Das Lab trennt Vorzeichen und Rechenzeichen konsequent. Die meisten Fehler beim Rechnen mit negativen Zahlen entstehen, weil beides als dasselbe Zeichen gelesen wird. Das Lab macht den Unterschied sichtbar, bevor es Regeln nennt.

Es führt von der Bewegung am Zahlenstrahl über Klammern und Malnehmen bis zum Koordinatensystem.

---

## Aufbau: Reiter und Modi

Vier Reiter, drei Modi. Jeder Reiter läuft in jedem Modus.

| Reiter | Inhalt |
|---|---|
| Zahlenstrahl | Plus und Minus als Bewegung einer Figur. Das Vorzeichen bestimmt die Blickrichtung, das Rechenzeichen, ob die Figur vorwärts oder rückwärts geht. Ein Knopf wandelt jede Subtraktion in die Addition der Gegenzahl um. |
| Klammern | Zuerst jedes Zeichen als Rechenzeichen oder Vorzeichen markieren, dann die Klammer Schritt für Schritt auflösen, dann rechnen und am Zahlenstrahl kontrollieren. |
| Mal und geteilt | Die Vorzeichenregel aus Musterfolgen finden. Beim Rechnen zuerst das Vorzeichen des Ergebnisses wählen, dann den Betrag. Bei der Division folgt die Umkehrprobe. Eine Regeltabelle füllt sich mit eigenen Beispielen. |
| Koordinatensystem | Gitter von −10 bis 10. Punkte ablesen und setzen, Quadranten bestimmen, an den Achsen spiegeln, Punkte und Figuren verschieben. |

| Modus | Verhalten |
|---|---|
| Entdecken | Freies Probieren ohne Wertung. Die Regel erscheint erst nach der Beobachtungsaufgabe. |
| Üben | Stufe frei wählbar, 10 zufällig gewählte Aufgaben pro Runde, sofortige Rückmeldung mit Fehlertyp. |
| Check | 10 zufällig gewählte Aufgaben aus allen Stufen des Reiters. Rückmeldung erst am Schluss, mit Auswertung nach Fehlertyp. |

Bedienung per Touch, Maus oder Tastatur. Zahlen werden mit einem Vorzeichen-Schalter (+ oder −) und einem Feld für den Betrag eingegeben. So trennen die Lernenden auch bei der Eingabe Vorzeichen und Betrag.

---

## Stufen

| Stufe | Inhalt | Reiter | Aufgaben |
|---|---|---|---|
| 1 | Plus und Minus am Zahlenstrahl, Bereich −10 bis 10 | Zahlenstrahl | 12 |
| 2 | Plus und Minus ohne Klammern | Zahlenstrahl, Klammern | 16 und 3 |
| 3 | Plus und Minus mit Klammern | Klammern | 27 |
| 4 | Mal und geteilt, eine Operation | Mal und geteilt | 20 |
| 5 | gemischt, mehrere Glieder | Klammern, Mal und geteilt | 10 und 6 |
| K1 | Koordinaten ablesen und setzen | Koordinatensystem | 16 |
| K2 | Quadranten und Spiegeln | Koordinatensystem | 18 |
| K3 | Verschieben und Figuren | Koordinatensystem | 16 |

Hat eine Stufe weniger als 10 Aufgaben, enthält die Runde alle. Ab 8 von 10 richtig schlägt das Lab im Modus Üben die nächste Stufe vor.

---

## Rückmeldung und Fehlertypen

Eine falsche Antwort ordnet das Lab einem Fehlertyp zu. Die Meldung beginnt mit «Fehler:», nennt den Fehlertyp in einem Satz und gibt einen Hinweis. Die Lösung erscheint erst nach dem zweiten Versuch.

| Fehlertyp | Bedeutung |
|---|---|
| `betrag_statt_vz` | Die kleinere Zahl wurde von der grösseren abgezogen, dabei ging das Vorzeichen des Ergebnisses verloren. |
| `minus_minus_minus` | Minus vor einer negativen Zahl wurde wie ein einfaches Minus gerechnet. |
| `plus_klammer_betrag` | Das Vorzeichen in der Klammer wurde nicht beachtet. |
| `erstes_vz_ignoriert` | Das Vorzeichen der ersten Zahl wurde nicht beachtet. |
| `zeichen_rolle` | Ein Vorzeichen und ein Rechenzeichen wurden verwechselt. |
| `mal_vz` | Minus mal Minus wurde als Minus gerechnet. |
| `div_vz` | Das Vorzeichen beim Teilen stimmt nicht. |
| `koord_vertauscht` | x und y sind vertauscht. |
| `koord_vz` | Bei einer Koordinate stimmt das Vorzeichen nicht. |
| `koord_falsch` | Der Punkt liegt an einer anderen Stelle: Mindestens eine Koordinate stimmt auch ohne Vorzeichen nicht. |
| `spiegel_achse_vertauscht` | Der Punkt wurde an der anderen Achse gespiegelt. |
| `verschiebung_vz` | Bei einem Verschiebungsschritt stimmt die Richtung nicht. |
| `vorzeichen_falsch` | Der Betrag stimmt, das Vorzeichen nicht (Auffangtyp). |
| `rechenfehler` | Das Vorzeichen ist nicht das Problem, aber der Betrag stimmt nicht (Auffangtyp). |

Am Ende jeder Runde stellt das Lab eine Strategie-Frage, zum Beispiel «Woran hast du erkannt, welches Vorzeichen das Ergebnis hat?». Die Antwort bleibt auf dem Gerät. Sie wird weder gespeichert noch gesendet noch bewertet.

---

## Modus festlegen und Links

Ohne Parameter wechseln die Lernenden Reiter und Modus frei. Mit `mode` legen Sie einen Modus fest:

- Entdecken: `https://www.cogniviolabs.com/lab/math/negative-zahlen/?mode=entdecken`
- Üben: `https://www.cogniviolabs.com/lab/math/negative-zahlen/?mode=ueben`
- Check: `https://www.cogniviolabs.com/lab/math/negative-zahlen/?mode=check`

Weitere Parameter:

| Parameter | Wirkung |
|---|---|
| `lang=en` | Englische Oberfläche (Entwurf) |
| `code=…` | Schülercode, wird in den Ereignissen mitgegeben (Buchstaben, Ziffern, Binde- und Unterstrich, höchstens 32 Zeichen) |
| `embed=1` | Einbettung: Kopfzeile, Navigation, Links im Fuss und der Link zu dieser Seite sind ausgeblendet |

---

## Ereignisse (labEvent)

Das Lab meldet seinen Verlauf über `labEvent(type, payload)`. Diese Version speichert und sendet nichts über das Netz. Die Ereignisse erscheinen im Dokument als `CustomEvent` mit dem Namen `cognivio:labevent`. Ist das Lab mit `embed=1` eingebettet, erhält die einbettende Seite zusätzlich eine `postMessage`, aber nur an die Adresse, von der das Lab aufgerufen wurde.

Jedes Ereignis enthält `slug` (`negative-zahlen`), `type`, `payload`, `code` (Schülercode oder `null`) und `zeit` (ISO-Zeitstempel). Es enthält keine Namen und keine E-Mail-Adressen.

| `type` | `payload` | Wann |
|---|---|---|
| `start` | `{ reiter, modus }` | beim Laden und bei jedem Wechsel von Reiter oder Modus |
| `progress` | `{ reiter, stufe, aufgabe_id, richtig, fehlertyp, versuche }` | nach jeder abgeschlossenen Aufgabe |
| `result` | `{ reiter, modus, stufe, anzahl, richtig, fehlertypen: { schluessel: anzahl } }` | am Ende einer Runde |
| `complete` | `{ reiter, modus }` | nach der Auswertung einer Runde |

- `fehlertyp` ist der Fehlertyp des ersten falschen Versuchs, sonst `null`.
- `stufe` ist im Modus Check `null`, weil die Runde alle Stufen mischt.
- Die Antwort auf die Strategie-Frage ist nie Teil eines Ereignisses.

---

## Datenschutz

Das Lab verlangt keine Anmeldung und keine Namen. Es enthält kein Tracking und sendet keine Ergebnisse über das Netz. Lokal im Browser speichert es nur die Einstellung hell oder dunkel, die zuletzt gewählte Stufe je Reiter und ob die Beobachtungsaufgabe im Reiter «Mal und geteilt» abgeschlossen ist. Ist der Speicher gesperrt, läuft das Lab ohne diese Angaben weiter.
