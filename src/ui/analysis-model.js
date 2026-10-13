import { analysisContent } from "../content/analysis-de.js";
import { clamp, stddev } from "../shared/statistics.js";
import { pct } from "../shared/format.js";
/** Format calculated metrics into structured row data without DOM access.
 * @param {string} text Source text.
 * @param {object} r Complete analysis result.
 * @param {number|null} gz Gzip ratio or unsupported capability.
 * @returns {object} Three-column table data, metric label/value pairs and four profile scores. */
export function buildAnalysisModel(text, r, gz) {
  const chars = [...text].length;
  const metrics = [
    [analysisContent.text_zeichen, chars],
    [analysisContent.text_worter, r.ws.length],
    [analysisContent.text_satze, r.ss.length],
    [analysisContent.text_absatze, r.paragraphCount],
    [analysisContent.text_durchschnitt_worter_satz, r.avgSentence.toFixed(1)],
    [analysisContent.text_satzlangen_streuung, r.sentenceSD.toFixed(1)],
    [analysisContent.text_lexikalische_vielfalt, pct(r.lexical)],
    [
      analysisContent.text_wort_entropie,
      r.ent.toFixed(2) + analysisContent.text_bit,
    ],
  ];
  let burstLabel;
  if (r.burstiness < 0.38) {
    burstLabel = analysisContent.text_sehr_gleichmassig;
  } else if (r.burstiness < 0.6) {
    burstLabel = analysisContent.text_eher_gleichmassig;
  } else if (r.burstiness < 0.9) {
    burstLabel = analysisContent.text_variabel;
  } else {
    burstLabel = analysisContent.text_stark_variabel;
  }
  let lexLabel;
  if (r.lexical < 0.4) {
    lexLabel = analysisContent.text_eher_gering;
  } else if (r.lexical < 0.6) {
    lexLabel = analysisContent.text_mittel;
  } else {
    lexLabel = analysisContent.text_hoch;
  }
  let triLabel;
  if (r.triRepeat < 0.01) {
    triLabel = analysisContent.text_unauffallig;
  } else if (r.triRepeat < 0.03) {
    triLabel = analysisContent.text_leicht_erhoht;
  } else {
    triLabel = analysisContent.text_auffallig;
  }
  let transitionDescription;
  if (r.transitions.length) {
    transitionDescription = r.transitions.join(", ");
  } else {
    transitionDescription = analysisContent.text_keine_auffalligen;
  }
  let phraseDescription;
  if (r.phrases.length) {
    phraseDescription = r.phrases.join(", ");
  } else {
    phraseDescription = analysisContent.text_keine_gefunden;
  }
  const rows = [
    [
      analysisContent.text_satzlangen_burstiness,
      r.burstiness.toFixed(3),
      burstLabel,
    ],
    [analysisContent.text_lexikalische_vielfalt, pct(r.lexical), lexLabel],
    [
      analysisContent.text_wortentropie,
      r.ent.toFixed(2) + analysisContent.text_bit,
      analysisContent.text_beschreibender_wert_ohne_referenzkorpus_kein_ki_beweis,
    ],
    [
      analysisContent.text_wiederholte_3_wort_folgen,
      pct(r.triRepeat),
      triLabel,
    ],
    [
      analysisContent.text_gefundene_ubergangsworter,
      r.transitions.length,
      transitionDescription,
    ],
    [
      analysisContent.text_generische_ki_phrasen,
      r.phrases.length,
      phraseDescription,
    ],
  ];
  let wordLengthDescription;
  if (r.avgWord < 4.5) {
    wordLengthDescription = analysisContent.text_eher_kurze_worter;
  } else if (r.avgWord > 6) {
    wordLengthDescription = analysisContent.text_eher_lange_worter;
  } else {
    wordLengthDescription = analysisContent.text_mittlerer_bereich;
  }
  let sentenceVariationDescription;
  if (r.sentCV < 0.4) {
    sentenceVariationDescription = analysisContent.text_sehr_gleichmassig;
  } else if (r.sentCV < 0.7) {
    sentenceVariationDescription = analysisContent.text_mittel;
  } else {
    sentenceVariationDescription = analysisContent.text_stark_variierend;
  }
  let sentenceStartDescription;
  if (r.firstWordRepeat > 0.28) {
    sentenceStartDescription = analysisContent.text_auffallig_haufig;
  } else {
    sentenceStartDescription = analysisContent.text_unauffallig_bis_moderat;
  }
  let paragraphVariationDescription;
  if (r.para.count < 3) {
    paragraphVariationDescription = analysisContent.text_zu_wenige_absatze;
  } else if (r.para.cv < 0.25) {
    paragraphVariationDescription = analysisContent.text_sehr_gleichmassig;
  } else {
    paragraphVariationDescription = analysisContent.text_variabel;
  }
  const advanced = [
    [
      analysisContent.text_durchschnitt_wortlange,
      r.avgWord.toFixed(2) + analysisContent.text_zeichen_2,
      wordLengthDescription,
    ],
    [
      analysisContent.text_streuung_der_wortlangen,
      r.wordLenSD.toFixed(2),
      analysisContent.text_hohere_werte_starker_gemischte_wortlangen,
    ],
    [
      analysisContent.text_variationskoeffizient_wortlange,
      r.wordLenCV.toFixed(3),
      analysisContent.text_relative_streuung_der_wortlangen,
    ],
    [
      analysisContent.text_median_satzlange,
      r.medSentence.toFixed(1) + analysisContent.text_worter_2,
      analysisContent.text_robuster_als_der_mittelwert_gegenuber_ausreissern,
    ],
    [
      analysisContent.text_variationskoeffizient_satzlange,
      r.sentCV.toFixed(3),
      sentenceVariationDescription,
    ],
    [
      analysisContent.text_hapax_legomena,
      pct(r.hapax),
      analysisContent.text_anteil_der_worter_die_genau_einmal_vorkommen,
    ],
    [
      analysisContent.text_dislegomena,
      pct(r.dislegomena),
      analysisContent.text_anteil_der_worter_die_genau_zweimal_vorkommen,
    ],
    [
      analysisContent.text_lange_worter_8_zeichen,
      pct(r.longWords),
      analysisContent.text_hinweis_auf_wortschatz_und_textregister,
    ],
    [
      analysisContent.text_kurze_worter_3_zeichen,
      pct(r.shortWords),
      analysisContent.text_haufig_stark_durch_funktionsworter_gepragt,
    ],
    [
      analysisContent.text_funktionswortanteil,
      pct(r.functionWords),
      analysisContent.text_grammatische_worter_wie_artikel_pronomen_prapositionen,
    ],
    [
      analysisContent.text_wiederholte_satzanfange,
      pct(r.firstWordRepeat),
      sentenceStartDescription,
    ],
    [
      analysisContent.text_vielfalt_der_satzanfange,
      pct(r.startDiversity),
      analysisContent.text_anteil_unterschiedlicher_erster_worter,
    ],
    [
      analysisContent.text_durchschnitt_absatzlange,
      r.para.mean.toFixed(1) + analysisContent.text_worter_2,
      analysisContent.text_nur_sinnvoll_bei_mehreren_absatzen,
    ],
    [
      analysisContent.text_absatzlangen_cv,
      r.para.cv.toFixed(3),
      paragraphVariationDescription,
    ],
    [
      analysisContent.text_interpunktionsdichte,
      r.punctProfile.density.toFixed(1) + analysisContent.text_1000_zeichen,
      analysisContent.text_kommas_doppel_semikola_gedankenstriche_klammern_zitate_und,
    ],
    [
      analysisContent.text_kommas,
      r.punctProfile.commas,
      analysisContent.text_absolute_anzahl,
    ],
    [
      analysisContent.text_semikola,
      r.punctProfile.semicolons,
      analysisContent.text_absolute_anzahl,
    ],
    [
      analysisContent.text_doppelpunkte,
      r.punctProfile.colons,
      analysisContent.text_absolute_anzahl,
    ],
    [
      analysisContent.text_gedankenstriche,
      r.punctProfile.dashes,
      analysisContent.text_absolute_anzahl,
    ],
    [
      analysisContent.text_klammern,
      r.punctProfile.parens,
      analysisContent.text_absolute_anzahl,
    ],
    [
      analysisContent.text_auslassungszeichen,
      r.punctProfile.ellipses,
      analysisContent.text_oder_drei_punkte,
    ],
    [
      analysisContent.text_root_ttr,
      r.rootTTR.toFixed(3),
      analysisContent.text_langenrobustere_variante_der_type_token_ratio,
    ],
    [
      analysisContent.text_yule_s_k,
      r.yuleK.toFixed(2),
      analysisContent.text_hoher_starker_wiederholter_wortschatz,
    ],
    [
      analysisContent.text_4_zeichen_wiederholungsrate,
      pct(r.char4Repeat),
      analysisContent.text_grobe_redundanzmessung_auf_zeichenebene,
    ],
    [
      analysisContent.text_3_wort_wiederholungsrate,
      pct(r.triRepeat),
      analysisContent.text_wiederholte_kurze_wortsequenzen,
    ],
  ];
  let compressionValue;
  if (gz === null) {
    compressionValue = analysisContent.text_nicht_unterstutzt;
  } else {
    compressionValue = gz.toFixed(3);
  }
  let compressionDescription;
  if (gz === null) {
    compressionDescription =
      analysisContent.text_compressionstream_wird_von_diesem_browser_nicht_unterstutzt;
  } else if (gz < 0.45) {
    compressionDescription =
      analysisContent.text_stark_komprimierbar_hohe_redundanz;
  } else if (gz < 0.65) {
    compressionDescription = analysisContent.text_mittlere_redundanz;
  } else {
    compressionDescription = analysisContent.text_geringere_redundanz;
  }
  let complexityDescription;
  if (r.lz < 0.08) {
    complexityDescription = analysisContent.text_starker_wiederholte_struktur;
  } else if (r.lz < 0.14) {
    complexityDescription = analysisContent.text_mittlere_strukturelle_vielfalt;
  } else {
    complexityDescription = analysisContent.text_hohere_strukturelle_vielfalt;
  }
  let bigramDescription;
  if (r.bigramDiversity < 0.88) {
    bigramDescription =
      analysisContent.text_vergleichsweise_viele_wiederholungen;
  } else {
    bigramDescription = analysisContent.text_hohe_vielfalt;
  }
  let trigramDescription;
  if (r.trigramDiversity < 0.96) {
    trigramDescription = analysisContent.text_mehrere_wiederholte_wortfolgen;
  } else {
    trigramDescription = analysisContent.text_weitgehend_einzigartig;
  }
  let sentenceSimilarityDescription;
  if (r.sentJaccard > 0.18) {
    sentenceSimilarityDescription =
      analysisContent.text_relativ_ahnliche_wortwahl_zwischen_satzen;
  } else {
    sentenceSimilarityDescription =
      analysisContent.text_geringe_bis_mittlere_uberschneidung;
  }
  let autocorrelationDescription;
  if (Math.abs(r.sentAutocorr) > 0.55) {
    autocorrelationDescription =
      analysisContent.text_deutlicher_rhythmischer_zusammenhang;
  } else if (Math.abs(r.sentAutocorr) > 0.3) {
    autocorrelationDescription = analysisContent.text_moderater_zusammenhang;
  } else {
    autocorrelationDescription = analysisContent.text_geringer_zusammenhang;
  }
  const complexityRows = [
    [
      analysisContent.text_gzip_kompressionsfaktor,
      compressionValue,
      compressionDescription,
    ],
    [
      analysisContent.text_lempel_ziv_komplexitat,
      r.lz.toFixed(4),
      complexityDescription,
    ],
    [
      analysisContent.text_zeichenentropie,
      r.charEntropy.toFixed(3) + analysisContent.text_bit,
      analysisContent.text_vielfalt_und_gleichverteilung_der_verwendeten_zeichen,
    ],
    [
      analysisContent.text_bedingte_wortentropie,
      r.condEntropy.toFixed(3) + analysisContent.text_bit,
      analysisContent.text_wie_wenig_vorhersagbar_das_nachste_wort_aus_dem_vorherigen_w,
    ],
    [
      analysisContent.text_bigramm_diversitat,
      pct(r.bigramDiversity),
      bigramDescription,
    ],
    [
      analysisContent.text_trigramm_diversitat,
      pct(r.trigramDiversity),
      trigramDescription,
    ],
    [
      analysisContent.text_zipf_steigung,
      r.zipf.toFixed(3),
      analysisContent.text_frequenzabfall_haufiger_zu_selteneren_wortern_bei_naturliche,
    ],
    [
      analysisContent.text_mittlere_satzahnlichkeit,
      pct(r.sentJaccard),
      sentenceSimilarityDescription,
    ],
    [
      analysisContent.text_satzlangen_autokorrelation,
      r.sentAutocorr.toFixed(3),
      autocorrelationDescription,
    ],
  ];
  const ngramRegularity = Math.round(
    clamp(
      (1 - r.biProfile.diversity) * 55 +
        r.biProfile.repeatRate * 140 +
        r.biProfile.gini * 45,
      0,
      100,
    ),
  );
  let burstConst;
  if (r.burstWindows.length > 1) {
    burstConst = Math.round(
      clamp(
        (1 -
          stddev(
            r.burstWindows.map(
              /** Read the measured value of a local analysis window.
               * @param {*} x Value supplied by the enclosing operation.
               * @returns {*} Result of this operation. */
              (x) => {
                return x.value;
              },
            ),
          ) /
            0.35) *
          100,
        0,
        100,
      ),
    );
  } else {
    burstConst = 0;
  }
  let entropyConst;
  if (r.entropyWindows.length > 1) {
    entropyConst = Math.round(
      clamp(
        (1 -
          stddev(
            r.entropyWindows.map(
              /** Read the measured value of a local analysis window.
               * @param {*} x Value supplied by the enclosing operation.
               * @returns {*} Result of this operation. */
              (x) => {
                return x.value;
              },
            ),
          ) /
            0.5) *
          100,
        0,
        100,
      ),
    );
  } else {
    entropyConst = 0;
  }
  let functionConcentration;
  if (r.functionProfile.length) {
    functionConcentration = Math.round(
      clamp(
        r.functionProfile.slice(0, 6).reduce(
          /** Adapt the supplied value for this module’s enclosing operation.
           * @param {number[]} a Numeric series.
           * @param {*} x Value supplied by the enclosing operation.
           * @returns {*} Result of this operation. */
          (a, x) => {
            return a + x.share;
          },
          0,
        ) * 500,
        0,
        100,
      ),
    );
  } else {
    functionConcentration = 0;
  }
  let bigramDiversityDescription;
  if (r.biProfile.diversity < 0.88) {
    bigramDiversityDescription = analysisContent.text_erhohte_wiederholung;
  } else {
    bigramDiversityDescription = analysisContent.text_hohe_vielfalt;
  }
  let bigramRepeatDescription;
  if (r.biProfile.repeatRate > 0.1) {
    bigramRepeatDescription = analysisContent.text_auffallig;
  } else {
    bigramRepeatDescription = analysisContent.text_eher_unauffallig;
  }
  let trigramDiversityDescription;
  if (r.triProfile.diversity < 0.96) {
    trigramDiversityDescription = analysisContent.text_mehrere_wiederholungen;
  } else {
    trigramDiversityDescription = analysisContent.text_weitgehend_einzigartig;
  }
  let trigramRepeatDescription;
  if (r.triProfile.repeatRate > 0.04) {
    trigramRepeatDescription = analysisContent.text_erhoht;
  } else {
    trigramRepeatDescription = analysisContent.text_eher_unauffallig;
  }
  const np = [
    [
      analysisContent.text_bigramm_diversitat,
      pct(r.biProfile.diversity),
      bigramDiversityDescription,
    ],
    [
      analysisContent.text_bigramm_wiederholungsrate,
      pct(r.biProfile.repeatRate),
      bigramRepeatDescription,
    ],
    [
      analysisContent.text_bigramm_entropie,
      r.biProfile.entropy.toFixed(3) + analysisContent.text_bit,
      analysisContent.text_hoher_gleichmassigere_verteilung,
    ],
    [
      analysisContent.text_bigramm_gini,
      r.biProfile.gini.toFixed(3),
      analysisContent.text_hoher_starkere_konzentration_auf_wenige_muster,
    ],
    [
      analysisContent.text_trigramm_diversitat,
      pct(r.triProfile.diversity),
      trigramDiversityDescription,
    ],
    [
      analysisContent.text_trigramm_wiederholungsrate,
      pct(r.triProfile.repeatRate),
      trigramRepeatDescription,
    ],
    [
      analysisContent.text_trigramm_entropie,
      r.triProfile.entropy.toFixed(3) + analysisContent.text_bit,
      analysisContent.text_verteilung_der_wortdreiergruppen,
    ],
    [
      analysisContent.text_trigramm_gini,
      r.triProfile.gini.toFixed(3),
      analysisContent.text_konzentration_der_wiederholten_muster,
    ],
  ];
  return {
    metrics,
    rows,
    advanced,
    complexityRows,
    np,
    ngramRegularity,
    burstConst,
    entropyConst,
    functionConcentration,
  };
}
