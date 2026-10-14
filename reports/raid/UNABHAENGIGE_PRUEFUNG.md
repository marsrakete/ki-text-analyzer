# Unabhängige Prüfung des festgelegten Änderungskandidaten

Archivhinweis: Die Testtexte, lokalen Datenproben und das RAID-Auswertungsskript wurden auf Wunsch entfernt. Die folgenden Ergebnisse und textfreien Nachweise bleiben als historischer Vergleich erhalten.

Durchgeführt am 14. Oktober 2026. Untersucht wurden einmalig die zurückgehaltenen 250 Themen mit 250 menschlichen, 250 ChatGPT- und 250 GPT-4-Texten. Die Kandidatenwahl erfolgte zuvor ausschließlich anhand der Entwicklungsgruppe.

## Geprüfte Änderung

Nur der positive Beitrag „Wiederholte 3-Wort-Folgen“ wurde rechnerisch von +8 auf +3 reduziert. Auslöseschwelle, alle anderen Regeln, Längenkorrektur, Rundung, Begrenzung und Anzeigegrenzen blieben unverändert. Der ursprüngliche Score wurde für alle 750 Texte mit `analyze()` berechnet; die Kandidatenwerte wurden aus seinen Beiträgen rekonstruiert. Die Rekonstruktion des Originalwerts wurde für jeden Text geprüft.

Vor der Auswertung wurden alle gespeicherten Prüfsummen des ursprünglichen Analysecodes sowie die ausgewählte Textdatei überprüft. Die Prüfgruppe überschneidet sich nicht mit den Entwicklungsthemen. Es wurden keine zusätzlichen Varianten auf den Prüftexten gesucht oder Schwellen nachjustiert.

## Ergebnis bei 60 Punkten

| Herkunft                          | Texte | Bisher ab 60 | Kandidat ab 60 |    Veränderung |
| --------------------------------- | ----: | -----------: | -------------: | -------------: |
| Menschlich: Fehlalarme            |   250 |  52 = 20,8 % |    38 = 15,2 % | **14 weniger** |
| ChatGPT: auffälliger KI-Indikator |   250 | 249 = 99,6 % |   249 = 99,6 % |    unverändert |
| GPT-4: auffälliger KI-Indikator   |   250 | 235 = 94,0 % |   235 = 94,0 % |    unverändert |

Die Fehlalarmquote sinkt um 5,6 Prozentpunkte beziehungsweise um etwa 26,9 % relativ zum bisherigen Stand. Bei keinem menschlichen Text entsteht ein neuer Fehlalarm. Bei der Grenze von 60 geht kein KI-Treffer verloren.

## Zielkonflikt bei 78 Punkten

| Herkunft   |      Bisher ab 78 |    Kandidat ab 78 |
| ---------- | ----------------: | ----------------: |
| Menschlich |           0 / 250 |           0 / 250 |
| ChatGPT    | 84 / 250 = 33,6 % | 74 / 250 = 29,6 % |
| GPT-4      | 55 / 250 = 22,0 % | 50 / 250 = 20,0 % |

Zehn ChatGPT- und fünf GPT-4-Texte wechseln aus der stärkeren Einstufung ab 78 in die Stufe von 60 bis 77. Sie bleiben bei 60 auffällig. Die Änderung ist deshalb kein Gewinn an jeder Anzeigegrenze, sondern eine zurückhaltendere Bewertung wiederholter Wortfolgen.

Null beobachtete menschliche Überschreitungen bei 78 beweisen keine generell fehlerfreie Grenze.

## Trennleistung und Score-Mediane

| Maß                 | Bisher | Kandidat |
| ------------------- | -----: | -------: |
| ChatGPT AUROC       | 0,9842 |   0,9906 |
| GPT-4 AUROC         | 0,9563 |   0,9689 |
| Menschlicher Median |     54 |       52 |
| ChatGPT-Median      |     76 |       75 |
| GPT-4-Median        |     72 |       72 |

AUROC beschreibt die Rangfolge der Scores, keine Wahrscheinlichkeit für einzelne Texte. Die verbesserten Rangfolgen stimmen mit der Fehlalarmreduktion überein, gelten aber nur für diese Testauswahl.

## Textlänge

Die Prüfgruppe weist dieselbe grundlegende Längenverzerrung wie die Entwicklungsgruppe auf. Die Änderung reduziert die menschlichen Fehlalarme auch innerhalb der vorhandenen Wortzahlbereiche:

| Wörter    | Menschliche Texte | Bisher ab 60 | Kandidat ab 60 |
| --------- | ----------------: | -----------: | -------------: |
| Unter 150 |                38 |            0 |              0 |
| 150–199   |               161 |           39 |             30 |
| 200–249   |                51 |           13 |              8 |

Kein menschlicher Prüftext liegt bei 250 oder mehr Wörtern. Für ChatGPT und GPT-4 bleibt die Zahl ab 60 in jeder Wortzahlgruppe unverändert. Das beseitigt nicht die Ungleichverteilung der Textlängen und ersetzt keinen umfassenden kontrollierten Vergleich.

## Empfehlung

**Den einzelnen Kandidaten +3 statt +8 übernehmen.** Die unabhängige Prüfung bestätigt auf dieser Auswahl weniger menschliche Fehlalarme und unveränderte KI-Treffer ab 60. Der Verlust stärkerer Einstufungen ab 78 ist offengelegt und passt zur vorsichtigeren Gewichtung eines unspezifischen Wiederholungsmerkmals.

Die Website wurde während der unabhängigen Prüfung nicht verändert. Die Anpassung wurde anschließend übernommen: `src/analysis/scoring.js` zählt die betreffende Regel nun mit +3. Die Originalfixtures bleiben erhalten; die gezielten Score-Werte stehen separat in `tests/fixtures/analysis-scoring-v2.json`. Der tatsächliche Anwendungscode stimmt für alle 1.500 ausgewählten Texte exakt mit den zuvor festgeschriebenen Kandidatenwerten überein; siehe [implementation-check.json](implementation-check.json). Originalmetriken, Teilbewertungen, andere Regelbeiträge und Grenzen bleiben geschützt.

Diese Prüfgruppe ist nun ausgewertet. Sie darf künftig nicht als neuer, unangetasteter Prüfsatz für weitere Kandidatensuche bezeichnet werden. Weitere Nachjustierungen benötigen eine zusätzliche unabhängige Datenbasis.

Das Ergebnis bestätigt keine zuverlässige allgemeine KI-Erkennung: Auch mit dem Kandidaten bleiben 38 von 250 menschlichen Texten auffällig. Die Auswahl enthält historische deutsche Nachrichten und keine Gemini-Ausgaben.

## Nachprüfung und Dateien

- [validation-scores.jsonl](validation-scores.jsonl): festgeschriebene bisherige und vorgeschlagene Einzelwerte ohne Rohtexte.
- [validation-summary.json](validation-summary.json): Grenzüberschreitungen, Veränderungen je Textgruppe, Mediane, AUROC, Längengruppen und Herkunftsprüfsummen.
- [FEHLALARME.md](FEHLALARME.md): vorgelagerte Kandidatenentwicklung.
- [TESTAUSWAHL.md](TESTAUSWAHL.md): Auswahlverfahren und Gruppentrennung.

Die IDs aller 750 Prüftexte, Gruppengrößen, Grenzüberschreitungen und Kandidatenbedingungen wurden unabhängig nachgeprüft. AUROC wurde zusätzlich über mittlere Ränge bei Score-Gleichständen nachgerechnet. Kandidatenwerte steigen gegenüber dem Original niemals; ohne ausgelöste Wiederholungsregel bleibt der Score identisch.
