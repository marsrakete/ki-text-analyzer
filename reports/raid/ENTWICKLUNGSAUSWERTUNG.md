# Erste Auswertung der RAID-Entwicklungsgruppe

Ausgeführt am 14. Oktober 2026 mit den unveränderten Analysefunktionen der Website. 250 menschliche, 250 ChatGPT- und 250 GPT-4-Texte wurden untersucht. Die 750 Texte der unabhängigen Prüfgruppe wurden nicht analysiert.

## Ergebnis

Die vorhandenen Regeln unterscheiden die ausgewählten historischen deutschen Nachrichtentexte deutlich. Die Grenze von 60 Punkten erzeugt allerdings viele Fehlalarme. Eine höhere Grenze reduziert die Fehlalarme in dieser Auswahl, übersieht dafür zahlreiche KI-Ausgaben. Daraus folgt noch keine Empfehlung, die Website-Schwellen zu ändern.

| Herkunft   | Texte | Minimum | Unteres Quartil | Median | Oberes Quartil | Maximum |
| ---------- | ----: | ------: | --------------: | -----: | -------------: | ------: |
| Menschlich |   250 |      36 |              50 |     53 |             58 |      77 |
| ChatGPT    |   250 |      54 |              72 |     76 |             80 |      93 |
| GPT-4      |   250 |      54 |              66 |     72 |             76 |      95 |

Quartile und Median verwenden jeweils den beobachteten Wert an Index `floor((n-1) × Anteil)` in der sortierten Reihe. Alle Scores liegen auf der bestehenden Skala von 5 bis 95.

## Vorhandene Score-Grenzen

Für diesen Vergleich wird ein Score ab der jeweiligen Grenze als auffälliger KI-Indikator gezählt. Bei menschlichen Texten heißt das Fehlalarm; bei KI-Texten wird die Überschreitung als erkannt gezählt. Diese Testdefinition macht aus dem Score keinen Herkunftsnachweis.

| Grenze |       Menschliche Fehlalarme | ChatGPT oberhalb der Grenze | GPT-4 oberhalb der Grenze |
| ------ | ---------------------------: | --------------------------: | ------------------------: |
| Ab 60  |        54 / 250 = **21,6 %** |      245 / 250 = **98,0 %** |    239 / 250 = **95,6 %** |
| Ab 78  | 0 / 250 = **0 % beobachtet** |       87 / 250 = **34,8 %** |     48 / 250 = **19,2 %** |

Die 0 beobachteten Fehlalarme bei 78 bedeuten nicht, dass diese Grenze allgemein fehlerfrei ist. An dieser Grenze bleiben 65,2 % der ChatGPT- und 80,8 % der GPT-4-Texte unterhalb der Auffälligkeitsstufe.

## Trennleistung ohne feste Grenze

Der AUROC-Wert beschreibt, wie gut höhere Scores zur KI-Klasse passen: 0,5 entspricht zufälliger Rangfolge, 1 vollständiger Trennung. Er ist keine Wahrscheinlichkeit für einen einzelnen Text.

- ChatGPT gegenüber menschlichen Texten: **0,9725**.
- GPT-4 gegenüber menschlichen Texten: **0,9532**.
- Beim direkten Vergleich zum menschlichen Text desselben Themas hat ChatGPT in 240 von 250 Fällen einen höheren Score, in 10 einen niedrigeren.
- GPT-4 hat in 238 Fällen einen höheren, in 3 denselben und in 9 einen niedrigeren Score.

Diese Werte gelten ausschließlich für diese Entwicklungsgruppe und ihre Text-/Modell-Auswahl.

## Einfluss der Textlänge

| Wörter    | Menschlich | ChatGPT | GPT-4 |
| --------- | ---------: | ------: | ----: |
| Unter 150 |         53 |       1 |     0 |
| 150–199   |        148 |       0 |     0 |
| 200–249   |         49 |      62 |   111 |
| Ab 250    |          0 |     187 |   139 |

Die Wortzahlgruppen sind stark ungleich besetzt. Bei weniger als 150 Wörtern schwächt unser vorhandener Algorithmus Scores Richtung 50 ab. Auch andere Merkmale, etwa Wortschatzvielfalt, verändern sich mit der Länge. Die Gesamtwerte dürfen deshalb nicht als vollständig längenbereinigte Trennleistung dargestellt werden.

Im einzigen groben gemeinsamen Bereich von 200–249 Wörtern bleibt ein Unterschied sichtbar: Mediane 57 / 73 / 73 für Mensch / ChatGPT / GPT-4. Dort ergeben sich AUROC 0,9541 für ChatGPT und 0,9342 für GPT-4. Allerdings sind selbst innerhalb dieses Bereichs die Längen nicht exakt angeglichen und die Beispiele nicht als thematisch gepaarte Teilmenge ausgewählt. Die Werte sind beschreibend, keine kontrollierte Bestätigung.

Bei menschlichen Texten steigt die Quote ab 60 von 3,8 % unter 150 Wörtern auf 21,6 % bei 150–199 und 40,8 % bei 200–249 Wörtern. Das zeigt, warum eine gemeinsame Trefferquote ohne Längenangaben zu kurz greift.

## Welche Merkmale tragen zum Unterschied bei?

Mittlerer Beitrag pro Text, einschließlich null bei nicht ausgelöstem Merkmal, vor abschließender Rundung und Begrenzung:

| Merkmal                      | Menschlich | ChatGPT | GPT-4 |
| ---------------------------- | ---------: | ------: | ----: |
| Sehr gleichmäßige Satzlängen |      +0,05 |   +9,15 | +7,44 |
| Hohe lexikalische Vielfalt   |      −3,56 |   −0,04 | −0,60 |
| Sehr glatte Interpunktion    |      +1,39 |   +3,63 | +3,81 |
| Wiederholte Satzanfänge      |      +0,37 |   +2,53 | +1,89 |
| Konstante lokale Burstiness  |      +0,24 |   +1,39 | +1,38 |

In dieser Auswahl sind Regelmäßigkeit und Satzanfänge auffälliger als typische KI-Phrasen. Das ist eine Beobachtung, keine unabhängige Wirksamkeitsprüfung der einzelnen Merkmale: Mehrere Regeln hängen zusammen und können von Textlänge oder Nachrichtenstil beeinflusst werden.

## Konsequenz und nächster Schritt

Gewichte und Schwellen vorerst beibehalten. Der wichtigste Befund ist die hohe Fehlalarmquote ab 60 bei menschlichen Nachrichtentexten; einfach Scores zu erhöhen oder die Grenze abzusenken würde das verschärfen.

Vor Anpassungen ist eine gezieltere Untersuchung in der Entwicklungsgruppe sinnvoll: menschliche Fehlalarme nach den auslösenden Regeln und Wortzahlen betrachten und zusätzliche Vergleiche mit möglichst ähnlichen Wortzahlen bilden. Erst eine konkret begründete Änderung entwickeln; danach genau einmal an der zurückgehaltenen Prüfgruppe prüfen. Alternativ kann der unveränderte Stand unabhängig bestätigt werden.

Diese Untersuchung ist inzwischen in [FEHLALARME.md](FEHLALARME.md) dokumentiert. Ein konkreter Kandidat schwächt den Beitrag wiederholter Drei-Wort-Folgen von +8 auf +3 ab; er wurde nur simuliert und noch nicht unabhängig geprüft oder in die Website übernommen.

Die Auswahl enthält kein Gemini. Diese Auswertung klärt daher nicht die ursprüngliche Beobachtung über niedrige Gemini-Scores. Sie prüft auch keine SynthID-Wasserzeichen und keine aktuelle Modellgeneration.

## Aufbewahrte Ergebnisse

Die RAID-Rohtexte und das Auswertungsskript wurden auf Wunsch entfernt. Die folgenden textfreien Dateien dokumentieren den damaligen Vergleich; es gibt keinen aktiven RAID-Testlauf mehr.

- [development-scores.jsonl](development-scores.jsonl): Einzelwerte, numerische Merkmale und Score-Beiträge ohne Rohtexte.
- [development-summary.json](development-summary.json): Verteilungen, Grenzwerte, Paarvergleiche, Längengruppen, Beiträge und Prüfsummen des Analysecodes.
- [TESTAUSWAHL.md](TESTAUSWAHL.md): Festgelegte Auswahl und Gruppentrennung.

Es wurden weder Sprachmodelle installiert noch Texte an Analysedienste übertragen. Die Berechnung lief lokal unter Node.js.

Die AUROC-Werte wurden unabhängig über mittlere Ränge bei gleichen Scores nachgerechnet. Grenzüberschreitungen und der Ausschluss sämtlicher Prüfgruppen-IDs wurden ebenfalls überprüft. Codeprüfung und alle 54 bestehenden Tests bestanden.
