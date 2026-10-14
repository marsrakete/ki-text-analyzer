# Festgelegte RAID-Testauswahl

Erstellt am 14. Oktober 2026. Die Auswahl ist abgeschlossen. Die Entwicklungsgruppe wurde unverändert analysiert; siehe [ENTWICKLUNGSAUSWERTUNG.md](ENTWICKLUNGSAUSWERTUNG.md). Der festgelegte Kandidat wurde anschließend einmal an der unabhängigen Prüfgruppe untersucht; siehe [UNABHAENGIGE_PRUEFUNG.md](UNABHAENGIGE_PRUEFUNG.md). Die bestätigte Anpassung der Drei-Wort-Wiederholungen auf +3 wurde inzwischen übernommen.

## Umfang

| Gruppe              | Menschlich | ChatGPT |   GPT-4 |  Themen |
| ------------------- | ---------: | ------: | ------: | ------: |
| Entwicklung         |        250 |     250 |     250 |     250 |
| Unabhängige Prüfung |        250 |     250 |     250 |     250 |
| **Gesamt**          |    **500** | **500** | **500** | **500** |

Jedes Thema enthält genau drei Texte: das menschliche Original sowie eine ChatGPT- und eine GPT-4-Ausgabe. Die Auswahl enthält 1.500 unterschiedliche Text-IDs und 1.500 unterschiedliche Textprüfsummen. Zwischen Entwicklung und Prüfung überschneiden sich weder Themen noch identische Texte.

## Auswahlverfahren

- Quelle: [offizielle RAID-extra-Ausgabe ohne bearbeitete Varianten](https://dataset.raid-bench.xyz/extra_none.csv).
- Filter: `domain=german`, `attack=none`; Herkunft `human`, `chatgpt` oder `gpt4`.
- Für beide KI-Modelle: `decoding=sampling`, `repetition_penalty=no`. Pro Modell wird damit dieselbe Generierungseinstellung verwendet.
- 1.970 vollständige Themen standen zur Verfügung; kein Thema musste wegen fehlender Partner oder leerer Texte ausgeschlossen werden.
- Seed: `ki-text-analyzer-raid-v1-2026-10-14`.
- Für jedes Thema wird SHA-256 über die UTF-8-Zeichenfolge `Seed + ":select:" + source_id` berechnet. Nach aufsteigend sortierten Hashwerten werden die ersten 500 Themen genommen. Dies ergibt eine reproduzierbare, pseudozufällige Auswahl, unabhängig von Scores und Dateireihenfolge.
- Die ausgewählten Themen werden erneut nach SHA-256 über `Seed + ":split:" + source_id` sortiert. Die ersten 250 bilden die Entwicklungsgruppe, die übrigen 250 die unabhängige Prüfgruppe.

Die IDs und Gruppenzuordnung sind im [Auswahlmanifest](selection-manifest.json) festgeschrieben. Neue Zufallsauswahlen nach Betrachtung der Ergebnisse sollen vermieden werden.

## Dateien

- Die vollständigen Texte und lokalen Datenproben wurden auf Wunsch gelöscht. Die ursprüngliche lokale Textdatei ist nicht mehr vorhanden.
- [selection-manifest.json](selection-manifest.json): Herkunfts-URL, Seed, Auswahlverfahren und Metadaten aller 1.500 Texte; enthält keine Rohtexte.
- [selection-validation.json](selection-validation.json): geprüfte Anzahlen, Überschneidungen und Wortzahlverteilungen.

Die textfreien Metadaten und Ergebnisse bleiben im Repository. Die ursprüngliche Textdatei wurde nie mit der Website ausgeliefert. Der RAID-Prüfstand wurde entfernt.

## Prüfung und Grenzen

Wortzahlen wurden mit der vorhandenen Funktion `words()` aus `src/shared/text.js` berechnet. Dateiprüfsumme, einzelne Textprüfsummen, eindeutige IDs, vollständige Themen, Herkunftsfelder, Generierungseinstellungen und Gruppentrennung wurden unabhängig nachgeprüft. Alle 1.000 KI-Prompts beginnen mit dem deutschen Nachrichten-Schreibauftrag. Die Sprachzuordnung folgt dennoch dem Datensatz; eine vollständige unabhängige Spracherkennung wurde nicht durchgeführt.

| Herkunft   | Minimum Wörter | Median Wörter | Maximum Wörter | Unter 150 Wörtern |
| ---------- | -------------: | ------------: | -------------: | ----------------: |
| Menschlich |            117 |           175 |            230 |                91 |
| ChatGPT    |             88 |           259 |            398 |                 1 |
| GPT-4      |            183 |           252 |            316 |                 0 |

Kein ausgewählter Text hat weniger als 80 Wörter. Es wurden keine Texte gekürzt und keine Längenfilter angewendet. Die unterschiedlichen Wortzahlen sind relevant, weil unser Score bei weniger als 150 Wörtern Richtung 50 abgeschwächt wird. Ergebnisse müssen deshalb auch nach Wortzahlbereichen betrachtet werden; ein höherer KI-Score allein wäre kein Nachweis einer verbesserten Unterscheidung.

Die Auswahl umfasst historische deutsche Nachrichtentexte und ältere ChatGPT-/GPT-4-Ausgaben. Sie enthält kein Gemini und erlaubt keine Aussage über alle Textarten. Sie ist keine SynthID-Testauswahl und enthält keine zugesicherten Wasserzeichen.

## Nächster Schritt

Die Entwicklungsanalyse und die unabhängige Kandidatenprüfung sind abgeschlossen. Die [unabhängige Prüfung](UNABHAENGIGE_PRUEFUNG.md) empfiehlt eine einzelne Gewichtsanpassung. Die ausgewertete Prüfgruppe ist künftig kein neuer unangetasteter Prüfsatz für weitere Kandidatensuche.
