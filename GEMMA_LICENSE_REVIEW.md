# Lizenzprüfung der Gemma-Tokenizer-Datei

Prüfdatum: 13. Oktober 2026.

## Ergebnis

Die Herkunft ist eindeutig belegt. Das Herkunftsrepository veröffentlicht Apache-2.0 als Repository-Lizenz. Das ist ein konkreter Anhaltspunkt für eine Apache-Veröffentlichung des dort enthaltenen Tokenizers. In den geprüften öffentlichen Primärquellen fehlt jedoch eine ausdrückliche Aussage, ob für diese separat verwendete Binärdatei zusätzlich die Gemma Terms of Use gelten. Eine abschließende Apache-only-Freigabe wird deshalb nicht behauptet.

Die Beilage behält den offenen Status bei. Das bedeutet nicht, dass Google die Weitergabe verboten hat, sondern kennzeichnet die verbleibende Abgrenzung zweier Veröffentlichungsbedingungen. Unser eigener Anwendungscode bleibt Apache-2.0.

## Verifizierte Herkunft

| Merkmal                 | Wert                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| Lokale Datei            | `assets/tokenizers/gemma.model`                                    |
| Größe                   | 4.241.003 Bytes                                                    |
| SHA-256                 | `61a7b147390c64585d6c3543dd6fc636906c9af3865a5548f27f31aee1d4c8e2` |
| Herkunftscommit         | `google/gemma_pytorch`, `33b652c465537c6158f9a472ea5700e5e770ad3f` |
| Originalpfad            | `tokenizer/tokenizer.model`                                        |
| Repository-Lizenztext   | `vendor/licenses/gemma-model.txt`                                  |
| SHA-256 des Lizenztexts | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |

Der lokale Lizenztext stimmt bytegenau mit der [LICENSE dieses Commits](https://github.com/google/gemma_pytorch/blob/33b652c465537c6158f9a472ea5700e5e770ad3f/LICENSE) überein. Die [Dateiliste des Commits](https://api.github.com/repos/google/gemma_pytorch/git/trees/33b652c465537c6158f9a472ea5700e5e770ad3f?recursive=1) enthält keine zusätzliche Lizenzdatei im Tokenizer-Verzeichnis und keine NOTICE-Datei. Das Fehlen einer solchen Datei beweist keinen Ausschluss anderweitiger Bedingungen.

[Googles Vertex-AI-SDK](https://github.com/googleapis/python-aiplatform/blob/44766a094f50d03093197027327d0ac2ec641829/vertexai/tokenization/_tokenizer_loading.py) lädt exakt unsere Herkunfts-URL und prüft denselben SHA-256-Wert. Der Apache-Header dieser Python-Datei lizenziert den SDK-Code; für sich genommen ist er keine zusätzliche Lizenzfreigabe der geladenen Daten.

## Abgrenzung zu Modellbedingungen

Die [offizielle Gemma-Modellkarte](https://ai.google.dev/gemma/docs/core/model_card) verweist auf die [Gemma Terms of Use](https://ai.google.dev/gemma/terms), Stand 1. April 2026. Deren Definition umfasst die aufgeführten Sprachmodelle, trainierten Modellgewichte und Parameter unabhängig von ihrer Bezugsquelle. Ein separat verwendeter Tokenizer wird nicht ausdrücklich eingeordnet. Hier liegt die verbleibende Auslegungsfrage.

Falls die Bedingungen diese Datei erfassen, verlangt Abschnitt 3.1 bei Weitergabe unter anderem eine Kopie der Bedingungen, Hinweise auf Nutzungsbeschränkungen, deren verbindliche Einbeziehung in die geltende Vereinbarung und bei Weitergabe außerhalb eines Hosted Service eine Notice-Datei. Ein Lizenzlink allein ersetzt diese Anforderungen nicht. Auch eine Notice-Datei allein würde die verbindliche Einbeziehung der Nutzungsbedingungen nicht lösen.

Die [Apache-2.0-Veröffentlichung von Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4) belegt keine rückwirkende Neulizenzierung unserer alten Datei. Ein Austausch des Tokenizers wäre zudem eine fachliche Änderung: Andere Token-IDs können die SynthID-Ergebnisse verändern.

## Benötigte Bestätigung

Eine ausdrückliche Bestätigung des Rechteinhabers für diese konkrete Datei würde die Abgrenzung auflösen. Anfrageentwurf; nicht versendet:

> Could you confirm the redistribution license for the standalone SentencePiece tokenizer at google/gemma_pytorch commit 33b652c465537c6158f9a472ea5700e5e770ad3f, path tokenizer/tokenizer.model, SHA-256 61a7b147390c64585d6c3543dd6fc636906c9af3865a5548f27f31aee1d4c8e2? We use only this unchanged tokenizer vocabulary in a static browser text-analysis tool, without Gemma language-model weights or inference. Is redistribution of this exact file covered solely by the repository's Apache-2.0 license, or do the Gemma Terms of Use also apply? If the latter, which redistribution and end-user agreement requirements apply to this tokenizer-only use?

Diese Recherche dokumentiert die Belege und die verbleibende Frage; sie ersetzt keine verbindliche Auskunft des Rechteinhabers.
