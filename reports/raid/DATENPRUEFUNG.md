# RAID: Eignungsprüfung für KI-Text-Analyzer

Geprüft am 14. Oktober 2026. Diese erste Etappe prüft die Datenbasis; sie misst noch nicht die Erkennungsleistung unserer Anwendung und verändert keine Gewichte oder Schwellen.

## Ergebnis

RAID-extra ist für einen begrenzten Vergleich deutscher Nachrichtentexte geeignet. Es enthält beschriftete menschliche Texte und KI-Ausgaben zu denselben Ausgangsthemen. Es ist kein Test für aktuelle Gemini-Versionen und keine repräsentative Sammlung aller deutschen Textarten.

Die [offizielle Ausgabe ohne bearbeitete Varianten](https://dataset.raid-bench.xyz/extra_none.csv) wurde vollständig mit einem CSV-Reader gestreamt. Die Gesamtsammlung wurde nicht gespeichert. Das Ergebnis der Zählung steht in [data-audit.json](data-audit.json). Die damaligen lokalen Originalbeispiele und später ausgewählten Testtexte wurden auf Wunsch gelöscht; es bleiben textfreie Metadaten und Ergebnisse.

## Tatsächlich gezählte deutsche Daten

| Herkunft (`model`) | Unbearbeitete Texte |
| ------------------ | ------------------: |
| human              |               1.970 |
| chatgpt            |               3.940 |
| gpt4               |               3.940 |
| gpt3               |               3.940 |
| cohere             |               3.940 |
| cohere-chat        |               3.940 |
| gpt2               |               7.880 |
| llama-chat         |               7.880 |
| mistral            |               7.880 |
| mistral-chat       |               7.880 |
| mpt                |               7.880 |
| mpt-chat           |               7.880 |
| **Gesamt**         |          **68.950** |

Die gesamte gestreamte Datei enthält 169.925 Zeilen über drei Bereiche: Deutsch, Tschechisch und Code. Alle 68.950 deutschen Zeilen haben `attack=none`; keine enthält einen leeren Text. Sie beziehen sich auf 1.970 unterschiedliche `source_id`-Werte. Für jeden dieser Werte sind ein menschlicher Text sowie ChatGPT- und GPT-4-Ausgaben vorhanden. Die zusätzlichen KI-Zeilen entstehen durch unterschiedliche Generierungseinstellungen, nicht durch ebenso viele unabhängige Themen.

Gemini ist unter den Modellen dieser Ausgabe nicht vorhanden. Die offizielle Studie beschreibt den deutschen Bereich als Nachrichten von DER STANDARD und nennt die historischen Modellversionen. Siehe [RAID-Paper, Anhang A und E](https://aclanthology.org/2024.acl-long.674.pdf).

## Herkunft und Vergleichbarkeit

- `generation` enthält den auszuwertenden Text; `model=human` kennzeichnet menschliche Herkunft. Die Modellnamen sind Herkunftsangaben des Datensatzes, kein Ergebnis eines Detektors.
- `source_id` verbindet Ausgaben zum gleichen ursprünglichen Thema. `id` identifiziert eine konkrete Zeile; `adv_source_id` verbindet bearbeitete Varianten mit ihrem Ausgangstext.
- `decoding` und `repetition_penalty` kennzeichnen die Generierungseinstellungen. Ergebnisse sollten je Modell und Einstellung getrennt betrachtet werden.
- Ein zusammengehöriges Beispiel mit menschlicher, ChatGPT- und GPT-4-Ausgabe wurde auf Inhalt und deutschen Prompt geprüft. Die KI erhält den Titel als Schreibauftrag; die Ausgaben sind keine bloßen Übersetzungen oder identischen Kopien des menschlichen Artikels.
- `domain=german` bezeichnet den Zielbereich. Es ersetzt keine Sprachprüfung jeder einzelnen KI-Ausgabe. Die Stichprobe bestätigt nicht die Sprache sämtlicher Zeilen.

## Wichtiger Unterschied: Textlänge

Die vollständige Zählung zeigt systematische Längenunterschiede:

| Herkunft   | Minimum Zeichen | Median Zeichen | Maximum Zeichen |
| ---------- | --------------: | -------------: | --------------: |
| Menschlich |           1.000 |          1.311 |           1.599 |
| ChatGPT    |             609 |          1.909 |           2.919 |
| GPT-4      |           1.141 |          1.870 |           2.249 |

Das sind Zeichenlängen, keine Wortzahlen. Unsere Auswertung schwächt kurze Texte anhand ihrer Wortzahl Richtung 50 ab. Ein unkontrollierter Vergleich könnte deshalb Unterschiede der Textlänge mit Unterschieden der Herkunft verwechseln. Für die nächste Etappe müssen die Wortzahlen mit unserer bestehenden Textzerlegung berechnet werden. Texte sollten nach Wortzahlbereichen ausgewertet und gegebenenfalls passend ausgewählt werden; Ausschlüsse sind mitzuzählen. Texte nicht stillschweigend kürzen.

Die KI-Klasse ist erheblich größer als die menschliche Klasse. Eine gemeinsame Trefferquote über alle 68.950 Zeilen wäre dadurch irreführend. Fehlalarme bei menschlichen Texten und erkannte KI-Texte müssen getrennt gemessen werden.

## Vorschlag für die nächste Etappe

1. Zunächst nur deutsche, unbearbeitete menschliche Texte sowie ChatGPT und GPT-4 verwenden. Andere Modelle und bearbeitete Varianten später separat prüfen.
2. Zufällig 500 unterschiedliche Ausgangsthemen auswählen. Dazu je einen menschlichen, einen ChatGPT- und einen GPT-4-Text verwenden: insgesamt 500 menschliche und 1.000 KI-Texte. Die Zufallsauswahl mit einem festen Seed reproduzierbar machen. Vollständig nach `source_id` in 250 Entwicklungs- und 250 Prüfthemen teilen. Varianten desselben Themas dürfen niemals in beiden Gruppen liegen. Sprach- und Längenausschlüsse protokollieren.
3. Pro Modell eine Generierungseinstellung festlegen; die andere als getrennte Robustheitsprüfung verwenden. Jeden Modellvergleich gegen gleich viele menschliche Beispiele auswerten.
4. Bestehenden Score und Merkmale unverändert erfassen. Verteilungen, Fehlalarmrate und Erkennungsrate an den vorhandenen Score-Grenzen sowie Unterschiede nach Wortzahl zeigen. Es ist kein Modelltraining erforderlich.
5. Erst nach dieser Bestandsaufnahme über Gewichte oder Ergebnisformulierungen entscheiden. Die Prüfauswahl bis dahin unangetastet lassen.

Diese Empfehlung ist aus der Datenprüfung abgeleitet. Die Auswahl wurde inzwischen mit 500 Themen und 1.500 Texten festgeschrieben; siehe [TESTAUSWAHL.md](TESTAUSWAHL.md). Die [erste Entwicklungs-Auswertung](ENTWICKLUNGSAUSWERTUNG.md) untersucht den unveränderten Stand; Verbesserungen wurden noch nicht umgesetzt oder unabhängig belegt.

## Quellen und Zugriff

- [Originalprojekt der Autoren](https://github.com/liamdugan/raid)
- [Hugging-Face-Datensatz](https://huggingface.co/datasets/liamdugan/raid)
- [RAID-extra im Dataset Viewer](https://huggingface.co/datasets/liamdugan/raid/viewer/raid/extra)
- [Unbearbeitete CSV-Ausgabe](https://dataset.raid-bench.xyz/extra_none.csv)
- [Studie: Dugan et al., ACL 2024](https://aclanthology.org/2024.acl-long.674/)

Die Hugging-Face-Statistik war mit `partial=true` markiert. Gefilterte API-Abfragen liefen in einen Timeout. Deshalb beruhen die Zahlen dieses Berichts auf der vollständig gelesenen offiziellen CSV-Ausgabe, nicht auf einer unvollständigen Viewer-Statistik. Die lokalen API-Proben wurden zusammen mit den Testtexten entfernt. Es wurden keine Sprachmodelle oder zusätzlichen Python-Pakete installiert.

Die Dataset-Karte kennzeichnet RAID als MIT; die [Projektlizenz](https://github.com/liamdugan/raid/blob/main/LICENSE) nennt Liam Dugan. Rohtexte werden hier nicht mit der Website ausgeliefert. Vor einer Veröffentlichung von Textauszügen sind auch die jeweiligen Herkunftsbedingungen der menschlichen Quellen zu prüfen.
