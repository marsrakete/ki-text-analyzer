import { analysisContent } from "../content/analysis-de.js";
import { clamp, stddev } from "../shared/statistics.js";
/** Apply the existing heuristic weights and length corrections.
 * @param {object} metrics Collected text metrics.
 * @returns {object} Result of this operation. */
export function buildScores(metrics) {
  const {
    ws,
    ss,
    burstiness,
    lexical,
    paragraphCount,
    questionCount,
    exclamationCount,
    transitions,
    phrases,
    triRepeat,
    functionWords,
    firstWordRepeat,
    startDiversity,
    para,
    char4Repeat,
    bigramDiversity,
    sentJaccard,
    sentAutocorr,
    biProfile,
    triProfile,
    burstWindows,
    entropyWindows,
  } = metrics;
  let score = 50;
  const reasons = [];
  const scoreParts = [
    {
      label: analysisContent.text_neutraler_ausgangswert,
      detail:
        analysisContent.text_die_analyse_beginnt_bewusst_bei_50_punkten_erst_danach_versc,
      delta: 0,
    },
  ];
  const addScore =
    /** Add Score.
     * @param {*} delta Value supplied by the enclosing operation.
     * @param {*} label Value supplied by the enclosing operation.
     * @param {*} detail Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (delta, label, detail) => {
      score += delta;
      scoreParts.push({
        label,
        detail,
        delta,
      });
    };
  if (ss.length >= 4) {
    if (burstiness < 0.38) {
      addScore(
        13,
        analysisContent.text_sehr_gleichmassige_satzlangen,
        analysisContent.text_geringe_burstiness_die_satze_sind_ungewohnlich_ahnlich_lang_,
      );
      reasons.push(
        analysisContent.text_sehr_gleichmassige_satzlangen_geringe_burstiness_erhoht_den_,
      );
    } else if (burstiness < 0.55) {
      addScore(
        6,
        analysisContent.text_relativ_gleichmassige_satzlangen,
        analysisContent.text_die_satzlangen_variieren_weniger_als_bei_vielen_spontanen_me,
      );
      reasons.push(analysisContent.text_relativ_gleichmassige_satzlangen_2);
    } else if (burstiness > 0.9) {
      addScore(
        -9,
        analysisContent.text_stark_variierende_satzlangen,
        analysisContent.text_deutlich_unterschiedliche_satzlangen_sprechen_eher_gegen_ein,
      );
      reasons.push(
        analysisContent.text_stark_variierende_satzlangen_sprechen_eher_gegen_stark_gegla,
      );
    }
  }
  let transDensity;
  if (ws.length) {
    transDensity = transitions.length / (ws.length / 100);
  } else {
    transDensity = 0;
  }
  if (transDensity > 2) {
    addScore(
      12,
      analysisContent.text_viele_struktur_und_ubergangsworter,
      analysisContent.text_der_text_verwendet_uberdurchschnittlich_viele_formalisierend,
    );
    reasons.push(
      analysisContent.text_viele_typische_ubergangs_und_strukturworter,
    );
  } else if (transDensity > 1) {
    addScore(
      6,
      analysisContent.text_mehrere_strukturworter,
      analysisContent.text_mehrere_typische_ubergangsformulierungen_erhohen_den_ki_indi,
    );
    reasons.push(analysisContent.text_mehrere_typische_ubergangsworter);
  }
  if (phrases.length >= 2) {
    addScore(
      15,
      analysisContent.text_mehrere_generische_ki_phrasen,
      analysisContent.text_mehrere_haufig_bei_generischen_ki_antworten_vorkommende_form,
    );
    reasons.push(
      analysisContent.text_mehrere_haufige_generische_ki_formulierungen_gefunden,
    );
  } else if (phrases.length === 1) {
    addScore(
      7,
      analysisContent.text_generische_ki_phrase,
      analysisContent.text_eine_haufig_in_generischen_ki_texten_auftretende_formulierun,
    );
    reasons.push(
      analysisContent.text_eine_haufige_generische_ki_formulierung_gefunden,
    );
  }
  if (triRepeat > 0.025) {
    addScore(
      8,
      analysisContent.text_wiederholte_3_wort_folgen,
      analysisContent.text_mehrere_identische_kurze_wortfolgen_treten_wiederholt_auf_da,
    );
    reasons.push(
      analysisContent.text_auffallige_wiederholung_gleicher_3_wort_folgen,
    );
  }
  if (lexical < 0.42 && ws.length > 120) {
    addScore(
      6,
      analysisContent.text_geringere_lexikalische_vielfalt,
      analysisContent.text_bei_ausreichender_textlange_ist_der_anteil_unterschiedlicher,
    );
    reasons.push(analysisContent.text_relativ_geringe_lexikalische_vielfalt);
  }
  if (lexical > 0.68 && ws.length > 120) {
    addScore(
      -5,
      analysisContent.text_hohe_lexikalische_vielfalt,
      analysisContent.text_ein_hoher_anteil_unterschiedlicher_worter_senkt_den_ki_indik,
    );
    reasons.push(analysisContent.text_hohe_lexikalische_vielfalt_2);
  }
  if (questionCount + exclamationCount === 0 && ws.length > 180) {
    addScore(
      4,
      analysisContent.text_sehr_glatte_interpunktion,
      analysisContent.text_ein_langerer_text_ohne_fragen_oder_ausrufe_wirkt_formaler_un,
    );
    reasons.push(
      analysisContent.text_langerer_text_ohne_fragen_oder_ausrufe_wirkt_stark_geglattet,
    );
  }
  if (paragraphCount >= 3 && transitions.length >= 3) {
    addScore(
      4,
      analysisContent.text_stark_strukturierter_aufbau,
      analysisContent.text_mehrere_absatze_und_zugleich_viele_ubergangsmarker_ergeben_e,
    );
    reasons.push(
      analysisContent.text_sauber_strukturierte_absatze_kombiniert_mit_vielen_ubergangs,
    );
  }
  if (ws.length >= 150) {
    if (firstWordRepeat > 0.28) {
      addScore(
        4,
        analysisContent.text_wiederholte_satzanfange,
        analysisContent.text_viele_satze_beginnen_mit_denselben_wortern_das_kann_auf_form,
      );
      reasons.push(analysisContent.text_mehrere_wiederholte_satzanfange);
    }
    if (startDiversity > 0.9 && ss.length >= 8) {
      addScore(
        -2,
        analysisContent.text_hohe_vielfalt_bei_satzanfangen,
        analysisContent.text_die_satzanfange_sind_sehr_abwechslungsreich,
      );
    }
    if (para.count >= 3 && para.cv < 0.25) {
      addScore(
        3,
        analysisContent.text_sehr_gleichmassige_absatzlangen,
        analysisContent.text_die_absatze_sind_ungewohnlich_ahnlich_lang,
      );
      reasons.push(analysisContent.text_sehr_gleichmassige_absatzlangen_2);
    }
    if (functionWords > 0.52) {
      addScore(
        2,
        analysisContent.text_hoher_funktionswortanteil,
        analysisContent.text_der_text_enthalt_einen_hohen_anteil_haufig_verwendeter_gramm,
      );
    }
    if (char4Repeat > 0.2) {
      addScore(
        2,
        analysisContent.text_erhohte_zeichenfolgen_wiederholung,
        analysisContent.text_kurze_zeichenfolgen_wiederholen_sich_relativ_haufig,
      );
    }
  }
  if (ws.length >= 150) {
    if (bigramDiversity < 0.88) {
      addScore(
        3,
        analysisContent.text_geringere_bigramm_diversitat,
        analysisContent.text_viele_wortpaare_wiederholen_sich_das_erhoht_die_gemessene_re,
      );
      reasons.push(analysisContent.text_erhohte_wiederholung_von_wortpaaren);
    }
    if (sentJaccard > 0.18 && ss.length >= 6) {
      addScore(
        3,
        analysisContent.text_ahnliche_satzwortschatze,
        analysisContent.text_die_satze_teilen_relativ_viele_gleiche_inhaltsworter,
      );
      reasons.push(
        analysisContent.text_mehrere_satze_ahneln_sich_im_verwendeten_wortschatz,
      );
    }
    if (Math.abs(sentAutocorr) > 0.55 && ss.length >= 8) {
      addScore(
        2,
        analysisContent.text_regelmassiger_satzrhythmus,
        analysisContent.text_aufeinanderfolgende_satzlangen_zeigen_eine_deutliche_korrela,
      );
    }
  }
  if (ws.length >= 150) {
    if (biProfile.repeatRate > 0.1) {
      addScore(
        3,
        analysisContent.text_erhohte_bigramm_wiederholung,
        analysisContent.text_ein_relativ_grosser_anteil_der_wortpaare_tritt_mehrfach_auf,
      );
      reasons.push(
        analysisContent.text_n_gramm_profil_zeigt_erhohte_wiederholung,
      );
    }
    if (triProfile.gini > 0.2 && triProfile.total > 50) {
      addScore(
        2,
        analysisContent.text_ungleichmassiges_trigramm_profil,
        analysisContent.text_wenige_trigramme_konzentrieren_einen_auffalligen_teil_der_wi,
      );
    }
    if (burstWindows.length >= 2) {
      const vals = burstWindows.map(
        /** Read the measured value of a local analysis window.
         * @param {*} x Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (x) => {
          return x.value;
        },
      );
      const burstVar = stddev(vals);
      if (burstVar < 0.08) {
        addScore(
          3,
          analysisContent.text_konstante_lokale_burstiness,
          analysisContent.text_die_satzlangen_regelmassigkeit_bleibt_uber_mehrere_textabsch,
        );
        reasons.push(
          analysisContent.text_lokale_satzrhythmik_ist_auffallig_konstant,
        );
      }
    }
    if (entropyWindows.length >= 2) {
      const ev = stddev(
        entropyWindows.map(
          /** Read the measured value of a local analysis window.
           * @param {*} x Value supplied by the enclosing operation.
           * @returns {*} Result of this operation. */
          (x) => {
            return x.value;
          },
        ),
      );
      if (ev < 0.12) {
        addScore(
          3,
          analysisContent.text_konstanter_entropieverlauf,
          analysisContent.text_die_lokale_wortentropie_verandert_sich_uber_den_text_hinweg_,
        );
        reasons.push(
          analysisContent.text_entropieverlauf_ist_ungewohnlich_gleichmassig,
        );
      }
    }
  }
  if (ws.length < 80) {
    const before = score;
    score = 50 + (score - 50) * 0.45;
    scoreParts.push({
      label: analysisContent.text_langenkorrektur,
      detail:
        analysisContent.text_der_text_ist_kurz_deshalb_werden_alle_ausschlage_zum_neutral,
      delta: score - before,
    });
    reasons.push(
      analysisContent.text_kurzer_text_aussagekraft_wurde_deutlich_reduziert,
    );
  } else if (ws.length < 150) {
    const before = score;
    score = 50 + (score - 50) * 0.7;
    scoreParts.push({
      label: analysisContent.text_langenkorrektur,
      detail:
        analysisContent.text_der_text_ist_nur_mittellang_deshalb_werden_die_ausschlage_zu,
      delta: score - before,
    });
    reasons.push(
      analysisContent.text_mittellanger_text_aussagekraft_bleibt_eingeschrankt,
    );
  }
  score = clamp(Math.round(score), 5, 95);
  return {
    score,
    scoreParts,
    reasons,
  };
}
/** Compute four heuristic signal-group scores between zero and one hundred.
 * @param {object} r Complete analysis result.
 * @returns {object} Result of this operation. */
export function buildSubscores(r) {
  let regularity = 50;
  if (r.burstiness < 0.45) {
    regularity += 18;
  } else if (r.burstiness < 0.65) {
    regularity += 8;
  } else {
    regularity -= 6;
  }
  if (r.para.count >= 3 && r.para.cv < 0.25) {
    regularity += 12;
  }
  if (
    r.burstWindows.length > 1 &&
    stddev(
      r.burstWindows.map(
        /** Extract the calculated value used by the enclosing collection.
         * @param {*} window Input supplied by the enclosing API.
         * @returns {*} Operation result or undefined for a side effect. */
        (window) => window.value,
      ),
    ) < 0.08
  ) {
    regularity += 12;
  }
  if (Math.abs(r.sentAutocorr) > 0.55) {
    regularity += 6;
  }
  let redundancy =
    35 +
    r.biProfile.repeatRate * 180 +
    r.triProfile.repeatRate * 220 +
    r.biProfile.gini * 35 +
    r.char4Repeat * 90;
  if (r.lz < 0.08) {
    redundancy += 10;
  }
  let diversity = 50;
  if (r.lexical < 0.42) {
    diversity += 18;
  } else if (r.lexical < 0.55) {
    diversity += 8;
  } else {
    diversity -= 5;
  }
  if (r.hapax < 0.35) {
    diversity += 10;
  }
  if (r.ent < 6) {
    diversity += 7;
  }
  if (
    r.entropyWindows.length > 1 &&
    stddev(
      r.entropyWindows.map(
        /** Extract the calculated value used by the enclosing collection.
         * @param {*} window Input supplied by the enclosing API.
         * @returns {*} Operation result or undefined for a side effect. */
        (window) => window.value,
      ),
    ) < 0.12
  ) {
    diversity += 8;
  }
  let style =
    30 +
    Math.min(25, r.transitions.length * 5) +
    Math.min(25, r.phrases.length * 10);
  if (r.firstWordRepeat > 0.28) {
    style += 10;
  }
  if (r.functionWords > 0.52) {
    style += 7;
  }
  if (r.questionCount + r.exclamationCount === 0 && r.ws.length > 180) {
    style += 5;
  }
  return {
    regularity: clamp(Math.round(regularity), 0, 100),
    redundancy: clamp(Math.round(redundancy), 0, 100),
    diversity: clamp(Math.round(diversity), 0, 100),
    style: clamp(Math.round(style), 0, 100),
  };
}
/** Describe input coverage using the existing nine signal groups.
 * @param {object} r Complete analysis result.
 * @returns {object} Result of this operation. */
export function confidenceInfo(r) {
  const groups = [
    r.ss.length >= 4,
    r.ws.length >= 80,
    r.biProfile.total >= 30,
    r.entropyWindows.length >= 2,
    r.para.count >= 2,
    r.functionProfile.length >= 5,
    r.sentLens.length >= 5,
    r.uni.length >= 0,
    r.punctProfile.density >= 0,
  ].filter(Boolean).length;
  let label = analysisContent.text_niedrig;
  if (r.ws.length >= 500 && groups >= 8) {
    label = analysisContent.text_hoch;
  } else if (r.ws.length >= 180 && groups >= 6) {
    label = analysisContent.text_mittel;
  }
  return {
    label,
    groups,
  };
}
/** Choose the central verdict label and presentation class for a score.
 * @param {number} score Heuristic score.
 * @returns {*} Result of this operation. */
export function band(score) {
  if (score < 35) {
    return [analysisContent.text_eher_menschlich_gepragt, "good"];
  }
  if (score < 60) {
    return [analysisContent.text_unklar_gemischt, "warn"];
  }
  if (score < 78) {
    return [analysisContent.text_mehrere_ki_typische_muster, "warn"];
  }
  return [analysisContent.text_deutlich_ki_typische_muster, "bad"];
}
