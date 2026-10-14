# Untersuchung der menschlichen Fehlalarme

Stand: 14. Oktober 2026. Untersucht wurden ausschließlich die 750 Texte der Entwicklungsgruppe. Die Website wurde nicht verändert; die unabhängige Prüfgruppe bleibt unangetastet.

## Befund

54 von 250 menschlichen Nachrichtentexten erhalten mindestens 60 Punkte. Die Fehlalarme entstehen meist aus mehreren üblichen Eigenschaften journalistischer Texte: ähnlichen Satzlängen, wiederholten Wortfolgen und dem Fehlen von Fragen oder Ausrufen.

| Positive Regel                     | Bei 54 Fehlalarmen | Bei 196 anderen menschlichen Texten | Bei 250 ChatGPT-Texten | Bei 250 GPT-4-Texten |
| ---------------------------------- | -----------------: | ----------------------------------: | ---------------------: | -------------------: |
| Erhöhte Zeichenfolgen-Wiederholung |                 52 |                                 144 |                    249 |                  250 |
| Sehr glatte Interpunktion          |                 40 |                                  47 |                    227 |                  238 |
| Relativ gleichmäßige Satzlängen    |                 34 |                                  56 |                     68 |                   98 |
| Wiederholte 3-Wort-Folgen          |                 28 |                                  23 |                     87 |                   32 |
| Konstanter Entropieverlauf         |                 19 |                                  47 |                     92 |                   79 |
| Wiederholte Satzanfänge            |                 17 |                                   6 |                    158 |                  118 |

Die Gruppen sind unterschiedlich groß; absolute Häufigkeiten sind deshalb nicht direkt als Erkennungsraten vergleichbar. Diese Regeln sind außerdem nicht unabhängig voneinander.

Besonders auffällig sind die Drei-Wort-Wiederholungen: Sie treten insgesamt bei 51/250 menschlichen Texten, aber nur bei 32/250 GPT-4-Texten auf. Trotzdem erhöhen sie den Score jeweils um acht Punkte. Die Wiederholung ist in diesem Bereich kein verlässlicher Hinweis auf KI-Herkunft.

Vier menschliche Fehlalarme mit dieser Regel wurden zusätzlich in ihren vollständigen Texten betrachtet. Darunter waren wiederholte Einleitungsformulierungen und normale Nachrichten-Wortfolgen. Die ersten zehn Wörter wiederholen sich wortgleich bei vier menschlichen Texten der gesamten Entwicklungsgruppe, darunter zwei Fehlalarme, und bei keinem der KI-Texte. Das erklärt einen kleinen Teil der Wiederholungen; es ist keine Erklärung für alle Fehlalarme und kein allgemeiner Nachweis eines Datenfehlers.

## Was passiert rechnerisch ohne einzelne Regeln?

Die bestehenden Score-Beiträge wurden rekonstruiert, jeweils eine positive Regel entfernt und danach dieselbe Längenkorrektur, Rundung und Begrenzung angewandt. Die Rekonstruktion des unveränderten Scores stimmt für alle 750 Texte mit dem gespeicherten Ergebnis überein. Die folgenden Varianten wurden nur simuliert:

| Entfernte Regel                    | Menschliche Fehlalarme ab 60 | ChatGPT ab 60 | GPT-4 ab 60 |
| ---------------------------------- | ---------------------------: | ------------: | ----------: |
| Keine: ursprünglicher Stand        |                           54 |           245 |         239 |
| Wiederholte 3-Wort-Folgen          |                           39 |           244 |         239 |
| Relativ gleichmäßige Satzlängen    |                           29 |           230 |         204 |
| Sehr glatte Interpunktion          |                           34 |           233 |         218 |
| Erhöhte Zeichenfolgen-Wiederholung |                           40 |           243 |         232 |

Je Herkunft wurden 250 Texte untersucht. Die Änderungen dürfen nicht addiert werden: Andere Regeln können dieselben Texte über die Grenze heben. Das starke Absenken der Fehlalarme durch Satzlängen oder Interpunktion geht außerdem mit erheblichen Verlusten bei den KI-Ausgaben einher.

## Konkreter Änderungskandidat

Das Gewicht der Drei-Wort-Wiederholungen lässt sich abschwächen, statt alle Wiederholungsmerkmale zu entfernen. Die Varianten +4 und +3 statt bisher +8 wurden ausschließlich in der Entwicklungsgruppe simuliert:

| Gewicht      | Menschliche Fehlalarme ab 60 | ChatGPT ab 60 |  GPT-4 ab 60 | ChatGPT AUROC | GPT-4 AUROC |
| ------------ | ---------------------------: | ------------: | -----------: | ------------: | ----------: |
| Bisher +8    |                  54 = 21,6 % |  245 = 98,0 % | 239 = 95,6 % |        0,9725 |      0,9532 |
| Simuliert +4 |                  46 = 18,4 % |  245 = 98,0 % | 239 = 95,6 % |        0,9814 |      0,9675 |
| Simuliert +3 |                  40 = 16,0 % |  244 = 97,6 % | 239 = 95,6 % |        0,9829 |      0,9702 |

**Empfohlener Kandidat: +3 statt +8 für wiederholte Drei-Wort-Folgen.** Alle anderen Regeln und Grenzen bleiben für diesen Kandidaten unverändert. Das ist eine aus Entwicklungsdaten abgeleitete Hypothese, keine bereits bestätigte Verbesserung.

Auch der Zielkonflikt bei der strengeren Grenze ist zu beachten: Ab 78 sinkt die Zahl auffälliger ChatGPT-Texte von 87 auf 70, bei GPT-4 von 48 auf 44. Menschliche Texte bleiben dort in beiden Varianten bei null beobachteten Überschreitungen. Weniger Fehlalarme bei 60 bedeutet somit nicht automatisch mehr Treffer bei jeder anderen Grenze.

## Zusätzlicher Vergleich ähnlicher Wortzahlen

Für jedes KI-Modell wurden menschliche und KI-Texte nach Wortzahl sortiert und einmalig so gepaart, dass der Unterschied höchstens zehn Wörter beträgt. Kein Text wird innerhalb eines Modellvergleichs mehrfach verwendet. Die Themen dieser zusätzlichen Paare können unterschiedlich sein; beide Texte bleiben in derselben Nachrichten-Domäne und der Entwicklungsgruppe.

| Vergleich | Verfügbare Längenpaare | Menschlich ab 60 | KI ab 60 | KI-Score höher als menschlicher Score |
| --------- | ---------------------: | ---------------: | -------: | ------------------------------------: |
| ChatGPT   |                     14 |                4 |       14 |                                    14 |
| GPT-4     |                     17 |                8 |       16 |                                    15 |

Der Unterschied ist auch in diesen engeren Längenpaaren sichtbar. Die Teilmengen sind jedoch sehr klein und selektiv. Sie reichen weder zur allgemeinen Absicherung der Erkennung noch zur Bewertung der vorgeschlagenen Gewichtsanpassung aus. Die geringe Überlappung bestätigt, dass RAID hier keinen breit angeglichenen Längenvergleich ermöglicht.

## Nächster Schritt

Den einzelnen Kandidaten +3 festlegen und gegen den unveränderten Stand auf den zurückgehaltenen 750 Prüftexten vergleichen. Dazu Fehlalarme, Erkennung je Modell, AUROC und Längengruppen berichten. Nur bei überzeugender unabhängiger Bestätigung in die Website übernehmen. Die Prüfgruppe nicht mehrfach zum Nachjustieren verwenden.

Die anschließende [unabhängige Prüfung](UNABHAENGIGE_PRUEFUNG.md) ist inzwischen abgeschlossen. Sie bestätigt weniger Fehlalarme und unveränderte KI-Treffer ab 60; die stärkeren Einstufungen ab 78 werden seltener.

Diese Untersuchung enthält weiterhin keine Gemini-Ausgaben. Eine bestätigte Verbesserung auf dieser Auswahl wäre keine zugesicherte bessere Gemini-Erkennung.

## Daten und Nachprüfung

Die Einzelbefunde, Häufigkeiten, Simulationen und IDs der Längenpaare stehen in [development-false-positive-analysis.json](development-false-positive-analysis.json). Die Ausgangswerte stammen aus [development-scores.jsonl](development-scores.jsonl); die zugehörigen Rohtexte wurden auf Wunsch gelöscht. Es wurden keine Rohtextauszüge in den Bericht übernommen.

Simulationsformel: neutraler Wert 50 plus vorhandene Regelbeiträge ohne den gespeicherten Beitrag „Längenkorrektur“; den ausgewählten Beitrag entfernen oder ersetzen; anschließend bei weniger als 80 Wörtern mit Faktor 0,45 beziehungsweise bei weniger als 150 mit 0,7 um 50 abschwächen, mit JavaScript `Math.round()` runden und auf 5 bis 95 begrenzen. Ohne Ersetzung muss das Originalergebnis herauskommen.
