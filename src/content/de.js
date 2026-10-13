export const messages = {
  tokenizerNames: {
    gpt2: "GPT‑2",
    gemma: "Gemma",
  },
  synthConfiguration: "{0} Keys, ngram_len={1}",
  entropyTooltip: "{0} bit",
  analyzing: "analysiert …",
  analyze: "Analysieren",
  enterText: "Bitte zuerst einen Text eingeben.",
  analysisError: "Die Analyse konnte nicht abgeschlossen werden: {0}",
  prepare: "Tokenizer vorbereiten",
  preparing: "wird vorbereitet …",
  tokenizerPreparing: "{0} wird vorbereitet …",
  tokenizerReady: "{0} bereit · {1} Token · {2} · {3}",
  bpe: "BPE, {0} Merges",
  sentencePiece: "SentencePiece",
  cacheSource: "aus Browser-Cache",
  localSource: "lokale Dateien geladen",
  memorySource: "bereits vorbereitet",
  readyNotice: "Tokenizer bereit. Die Tokenisierung läuft auf diesem Gerät.",
  tokenizerError: "Tokenizer konnte nicht geladen werden: {0}",
  cacheCleared: "Tokenizer-Cache gelöscht.",
  cacheNotice:
    "Der gewählte Tokenizer wird beim nächsten Einsatz erneut vorbereitet.",
  cacheError: "Tokenizer-Cache konnte nicht gelöscht werden: {0}",
  demoLoaded:
    "SynthID-Positivdemo geladen: direkte Token-IDs; kein Tokenizer erforderlich.",
  demoCleared:
    "Demo-Token entfernt. Für Textanalyse wird wieder der gewählte Tokenizer verwendet.",
  checking: "prüft …",
  synthAnalyze: "SynthID-Referenzprüfung",
  synthError: "SynthID-Referenzprüfung: {0}",
  manualSource: "direkt eingegebene Token-IDs",
  gpt2Source: "GPT‑2-Tokenizer",
  gemmaSource: "Gemma-Tokenizer",
  withBos: " + BOS",
  withoutBos: " ohne BOS",
  invalidKeys: "Ungültige Watermark-Keys. Erwartet werden sichere Ganzzahlen.",
  invalidTokens:
    "Ungültige Token-ID-Liste. Erwartet werden nichtnegative sichere Ganzzahlen.",
  invalidNgram: "Die n-Gramm-Länge muss eine Ganzzahl zwischen 2 und 20 sein.",
  invalidHistory:
    "Die Context-History muss eine Ganzzahl zwischen 1 und 100000 sein.",
  tooFewTokens: "Mindestens {0} Token erforderlich.",
  allMasked: "Alle Kontexte wurden durch das Repetition-Masking verworfen.",
  cryptoMissing:
    "Für eigene Keys benötigt diese Browserumgebung WebCrypto/SHA-256.",
  unknownTokenizer: "Unbekannter Tokenizer.",
  invalidModel: "Die lokalen Tokenizer-Daten sind ungültig.",
  invalidText: "Erwartet wird ein Text.",
  assetError: "Tokenizer-Datei konnte nicht geladen werden: HTTP {0}",
  verdict:
    "Der Text zeigt {0}. Das Ergebnis ist heuristisch und darf nicht als Beweis für KI-Autorenschaft verwendet werden.",
  words: "{0} Wörter",
  signals: "{0} von 9",
  scoreExplanation:
    "Der Score ist kein Wahrscheinlichkeitswert. Ein Ergebnis von {0}/100 bedeutet also nicht, dass der Text mit {0} % Wahrscheinlichkeit von einer KI stammt.",
  scoreOrigin:
    "Die Berechnung beginnt bei 50 Punkten als neutralem Ausgangswert. Auffällige Merkmale erhöhen oder senken diesen Wert. Bei kurzen Texten werden die Ausschläge anschließend wieder in Richtung 50 abgeschwächt.",
  interpretationLabel: "Interpretation dieses Textes:",
  interpretationHuman:
    "Der Text zeigt derzeit mehr Merkmale, die gegen einen stark geglätteten KI-Stil sprechen.",
  interpretationMixed:
    "Die Merkmale sind gemischt. Aus diesem Text allein lässt sich keine belastbare Tendenz ableiten.",
  interpretationAi:
    "Mehrere statistische und stilistische Merkmale passen zu typischen KI-Textmustern, sind aber auch bei menschlichen Texten möglich.",
  interpretationStrong:
    "Mehrere starke Heuristiken zeigen in dieselbe Richtung. Auch dieser Wert bleibt jedoch ein Indikator und kein Herkunftsnachweis.",
  scoreUp: "KI-Indikator steigt",
  scoreDown: "KI-Indikator sinkt",
  scoreNeutral: "Ausgangspunkt",
  invisibleCount: "{0} unsichtbare/auffällige Unicode-Zeichen",
  invisibleWarning:
    "Das ist ein technischer Befund, aber kein Beweis für ein KI-Wasserzeichen. Solche Zeichen können auch aus Copy/Paste, Office, Websites oder typografischer Bearbeitung stammen.",
  noInvisible: "Keine typischen unsichtbaren Unicode-Marker gefunden",
  noInvisibleDetail:
    "Es wurden keine Zero-Width-Zeichen, Soft Hyphens oder ähnliche unsichtbare Marker erkannt.",
  mixedScripts:
    "Zusätzlich wurden Zeichen aus gemischten Schriftsystemen erkannt: Latein {0}, Kyrillisch {1}, Griechisch {2}. Das kann auf Homoglyphen hindeuten, muss aber nicht verdächtig sein.",
  repeatLabel: "Häufig wiederholte Inhaltswörter:",
  noRepeats: "Keine auffälligen Wortwiederholungen.",
  punctuationLabel: "Interpunktion:",
  punctuationDetail:
    "{0} strukturierende Satzzeichen, {1} Fragezeichen, {2} Ausrufezeichen, {3} Anführungszeichen.",
  structureLabel: "Strukturmarker:",
  noStructure: "keine typischen Marker erkannt",
  noSentences: "Zu wenige Sätze für eine lokale Analyse.",
  noData: "Keine ausreichenden Daten.",
  windowSentences: "Sätze {0}–{1}",
  uniform: "sehr gleichmäßig",
  medium: "mittel",
  variable: "variabel",
  entropyTrend: "Lokale Wortentropie: {0} bis {1} bit; Streuung {2}.",
  noEntropyTrend: "Zu wenig Text für einen belastbaren Entropieverlauf.",
  noReasons:
    "Keine starken Einzelindikatoren. Der Score liegt nahe am neutralen Ausgangswert.",
  findingRegularity: "auffällig hohe strukturelle Regelmäßigkeit",
  findingRedundancy: "erhöhte Redundanz und wiederkehrende n-Gramm-Muster",
  findingDiversity:
    "vergleichsweise geringe oder sehr gleichmäßig verteilte sprachliche Vielfalt",
  findingStyle: "mehrere typische KI-Stilmarker",
  findingUnicode: "{0} unsichtbare Unicode-Marker",
  findingNone: "keine einzelne Signalgruppe ist stark auffällig",
  finding:
    "Die stärkste Signalgruppe ist {0} mit {1}/100. Auffällig sind {2}. Die Aussagekraft der Analyse ist {3}. {4}Der Gesamtscore sollte als heuristische Musterbewertung und nicht als Herkunftsnachweis gelesen werden.",
  findingUnicodeNote:
    "Die Unicode-Marker sind ein technischer Befund, aber kein Beweis für KI-Autorenschaft. ",
  regularity: "Regelmäßigkeit",
  redundancy: "Redundanz",
  diversity: "sprachliche Vielfalt",
  style: "KI-Stilmuster",
  synthNone: "kein auffälliges",
  synthLight: "leicht erhöhtes",
  synthIncreased: "erhöhtes",
  synthStrong: "starkes",
  synthFinding:
    "Mit {0} ergibt sich ein Weighted-Mean-Score von {1} und ein orientierender Nullmodell-z-Wert von {2}. Das ist ein {3} Referenzsignal. Die z-Einordnung ist eine lokale Orientierung, keine von Google veröffentlichte universelle Entscheidungsschwelle.",
  synthRows: [
    [
      "Konfiguration",
      "Muss zur beim Generieren verwendeten Watermark-Konfiguration passen.",
    ],
    [
      "Hash-IV",
      "Aus SHA-256 der int64-Keyfolge; bei Default-Keys fest reproduziert.",
    ],
    ["Mean", "Ungewichteter Mittelwert der gültigen binären g-values."],
    [
      "Weighted Mean",
      "Layer-Gewichte linear 10 → 1, anschließend normalisiert.",
    ],
    [
      "Abweichung von 0,5",
      "Unter einem idealisierten unmarkierten Nullmodell liegt der Erwartungswert ungefähr bei 0,5.",
    ],
    [
      "Orientierender z-Wert",
      "Nur Näherung; ignoriert Abhängigkeiten und ersetzt keine kalibrierte Schwelle.",
    ],
    [
      "Maskierte Wiederholungskontexte",
      "Wiederholte (n−1)-Token-Kontexte liefern kein zusätzliches Watermark-Evidenzsignal.",
    ],
  ],
};

/** Substitute indexed values into a central content string.
 * @param {string} pattern Content with indexed placeholders such as {0}.
 * @param {...*} values Plain values, never interpreted as markup.
 * @returns {string} Formatted text. */
export function format(pattern, ...values) {
  return pattern.replace(
    /\{(\d+)\}/g,
    /** Adapt the supplied value for this module’s enclosing operation.
     * @param {*} match Value supplied by the enclosing operation.
     * @param {*} index Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (match, index) => {
      if (Number(index) < values.length) {
        return String(values[Number(index)]);
      }
      return match;
    },
  );
}
