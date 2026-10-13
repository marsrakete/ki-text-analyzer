# Drittanbieter und Lizenzbeilage

Der eigene Anwendungscode steht unter Apache-2.0 (siehe LICENSE). Fremdkomponenten behalten ihre ursprünglichen Lizenzbedingungen. Diese Datei und vendor/licenses/ gehören zur Auslieferung. Die statische Browseransicht ist licenses.html.

## gpt-tokenizer

- Version: 4.0.0
- Lizenz: MIT
- Rechteinhaber / Mitwirkende: Copyright (c) 2023-2024 Bazyli Brzoska
- Verwendung: GPT-2-Tokenisierung in vendor/gpt2.js.
- Quelle: https://github.com/niieani/gpt-tokenizer
- Vollständiger Originaltext: [vendor/licenses/gpt-tokenizer.txt](vendor/licenses/gpt-tokenizer.txt)
- Änderungen: Für GPT-2 gebündelt und minimiert; Tokenisierung unverändert.

## sentencepiece-js

- Version: 1.3.3
- Lizenz: Apache-2.0
- Rechteinhaber / Mitwirkende: devilyouwei, Jan Kaul, Ronan Le Meillat und Mitwirkende
- Verwendung: JavaScript- und WASM-Laufzeit in vendor/sentencepiece.js.
- Quelle: https://github.com/sctg-development/sentencepiece-js/tree/30916b62bae58f8bb9cd038d3b5e449eee4cae6e
- Vollständiger Originaltext: [vendor/licenses/sentencepiece-js.txt](vendor/licenses/sentencepiece-js.txt)
- Änderungen: Browser-Build: nicht verwendete Node-Dateilader durch Fehler-Stubs ersetzt, Node-Erkennung deaktiviert, Export auf SentencePieceProcessor beschränkt und gebündelt/minimiert.

## SentencePiece C++

- Version: d8f741853847553169444afc12c00f4bbff3e9ce
- Lizenz: Apache-2.0
- Rechteinhaber / Mitwirkende: Google und SentencePiece-Mitwirkende
- Verwendung: Als WASM im veröffentlichten sentencepiece-js-Paket enthalten; die Quelle ist dessen festgelegtes Git-Submodul.
- Quelle: https://github.com/google/sentencepiece/tree/d8f741853847553169444afc12c00f4bbff3e9ce
- Vollständiger Originaltext: [vendor/licenses/sentencepiece-cpp.txt](vendor/licenses/sentencepiece-cpp.txt)
- Änderungen: Die upstream-WASM-Ausgabe wird übernommen; der C++-Code wurde hier nicht neu gebaut oder bearbeitet.

## Abseil-Unterkomponenten

- Version: SentencePiece-Submodul d8f7418
- Lizenz: Apache-2.0
- Rechteinhaber / Mitwirkende: Abseil-/Google-Mitwirkende
- Verwendung: Drittanbieterbestandteile des SentencePiece-Builds.
- Quelle: https://github.com/google/sentencepiece/tree/d8f741853847553169444afc12c00f4bbff3e9ce/third_party/absl
- Vollständiger Originaltext: [vendor/licenses/abseil.txt](vendor/licenses/abseil.txt)
- Änderungen: Unveränderte Bestandteile der upstream-WASM-Laufzeit.

## Darts-clone

- Version: SentencePiece-Submodul d8f7418
- Lizenz: BSD-3-Clause
- Rechteinhaber / Mitwirkende: Copyright (c) 2008-2011, Susumu Yata
- Verwendung: Trie-Datenstrukturen der SentencePiece-Laufzeit.
- Quelle: https://github.com/google/sentencepiece/tree/d8f741853847553169444afc12c00f4bbff3e9ce/third_party/darts_clone
- Vollständiger Originaltext: [vendor/licenses/darts-clone.txt](vendor/licenses/darts-clone.txt)
- Änderungen: Unveränderte Bestandteile der upstream-WASM-Laufzeit.

## Protobuf-lite

- Version: SentencePiece-Submodul d8f7418
- Lizenz: BSD-3-Clause
- Rechteinhaber / Mitwirkende: Copyright 2008 Google Inc.
- Verwendung: Lesen des serialisierten SentencePiece-Tokenizer-Modells.
- Quelle: https://github.com/google/sentencepiece/tree/d8f741853847553169444afc12c00f4bbff3e9ce/third_party/protobuf-lite
- Vollständiger Originaltext: [vendor/licenses/protobuf-lite.txt](vendor/licenses/protobuf-lite.txt)
- Änderungen: Unveränderte Bestandteile der upstream-WASM-Laufzeit.

## buffer

- Version: 6.0.3
- Lizenz: MIT
- Rechteinhaber / Mitwirkende: Copyright (c) Feross Aboukhadijeh und weitere Mitwirkende
- Verwendung: Binär-/Base64-Verarbeitung im SentencePiece-JavaScript-Bundle.
- Quelle: https://github.com/feross/buffer/tree/v6.0.3
- Vollständiger Originaltext: [vendor/licenses/buffer.txt](vendor/licenses/buffer.txt)
- Änderungen: Unverändert gebündelt und minimiert.

## base64-js

- Version: 1.5.1
- Lizenz: MIT
- Rechteinhaber / Mitwirkende: Copyright (c) 2014 Jameson Little
- Verwendung: Transitive buffer-Abhängigkeit in vendor/sentencepiece.js.
- Quelle: https://github.com/beatgammit/base64-js/tree/v1.5.1
- Vollständiger Originaltext: [vendor/licenses/base64-js.txt](vendor/licenses/base64-js.txt)
- Änderungen: Unverändert gebündelt und minimiert.

## ieee754

- Version: 1.2.1
- Lizenz: BSD-3-Clause
- Rechteinhaber / Mitwirkende: Copyright 2008 Fair Oaks Labs, Inc.
- Verwendung: Transitive buffer-Abhängigkeit in vendor/sentencepiece.js.
- Quelle: https://github.com/feross/ieee754/tree/v1.2.1
- Vollständiger Originaltext: [vendor/licenses/ieee754.txt](vendor/licenses/ieee754.txt)
- Änderungen: Unverändert gebündelt und minimiert.

## TypeScript-Laufzeithelfer

- Version: Im sentencepiece-js-Paket 1.3.3 enthalten
- Lizenz: Microsoft-Hinweis, permissiv
- Rechteinhaber / Mitwirkende: Copyright (c) Microsoft Corporation
- Verwendung: JavaScript-Helfer des veröffentlichten SentencePiece-Pakets.
- Quelle: https://github.com/sctg-development/sentencepiece-js/tree/30916b62bae58f8bb9cd038d3b5e449eee4cae6e
- Vollständiger Originaltext: [vendor/licenses/typescript-helpers.txt](vendor/licenses/typescript-helpers.txt)
- Änderungen: Der originale Hinweis wurde aus dem Paket übernommen; der Helfercode wird minimiert.

## SynthID Text – Referenzlogik

- Version: a6ec02c22ce87177c061643503e14a7cc839dc2b
- Lizenz: Apache-2.0
- Rechteinhaber / Mitwirkende: Copyright 2026 Google LLC
- Verwendung: Referenzalgorithmen in src/synthid/engine.js und Originalfunktionen in tests/reference/upstream/.
- Quelle: https://github.com/google-deepmind/synthid-text/tree/a6ec02c22ce87177c061643503e14a7cc839dc2b
- Vollständiger Originaltext: [vendor/licenses/synthid-text.txt](vendor/licenses/synthid-text.txt)
- Änderungen: JavaScript-Port mit BigInt/int64, Browser-Eingabeprüfung und Ringpuffer für Kontexte. Der zusätzliche z-Wert ist eine lokale Näherung, keine universelle Google-Entscheidungsschwelle.

## Gemma-Tokenizer-Daten

- Version: 33b652c465537c6158f9a472ea5700e5e770ad3f
- Lizenz: Repository-Lizenz: Apache-2.0; Zuordnung der Binärdatei offen
- Rechteinhaber / Mitwirkende: Google
- Verwendung: assets/tokenizers/gemma.model; separat mitgelieferte Tokenizer-Daten.
- Quelle: https://github.com/google/gemma_pytorch/blob/33b652c465537c6158f9a472ea5700e5e770ad3f/tokenizer/tokenizer.model
- Vollständiger Originaltext: [vendor/licenses/gemma-model.txt](vendor/licenses/gemma-model.txt)
- Änderungen: Die Datei wurde unverändert übernommen und nur lokal umbenannt. Der beigefügte Lizenztext ist die LICENSE des Herkunftsrepositories, keine abschließende Lizenzfreigabe für die Binärdatei.

Die genaue Zuordnung der Gemma-Tokenizer-Datei ist noch offen. Eine Apache-2.0-Lizenz des Repositories ersetzt keine Klärung eventuell zusätzlich geltender Gemma-Nutzungsbedingungen. Die Apache-2.0-Lizenz unseres eigenen Codes wird dadurch nicht auf diese Datei ausgedehnt.

Zusätzliche Originalbedingungen: https://ai.google.dev/gemma/terms

## Entwicklungswerkzeuge

Resvg 2.6.2 (MPL-2.0), Sharp 0.35.5 (Apache-2.0) sowie Esbuild, Tests und Formatierungswerkzeuge sind Entwicklungsabhängigkeiten. Ihre Software wird nicht mit den erzeugten Grafiken an Website-Besucher ausgeliefert. Bei Weitergabe der Werkzeuge selbst gelten deren eigene Bedingungen. Die genauen Paketversionen stehen in package-lock.json.

Der OG-Build wurde aus dem Projekt Threadline übernommen und an ES-Module angepasst. Die Grafiken wurden für KI-Text-Analyzer neu gestaltet.

Diese Beilage wird aus config/licenses.config.json erzeugt. Die Original-Lizenzdateien dürfen nicht durch bloße Links ersetzt werden.
