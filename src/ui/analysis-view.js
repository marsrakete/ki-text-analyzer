import { cloneTemplate, renderRows } from "../shared/dom.js";
import { pct } from "../shared/format.js";
import { stddev } from "../shared/statistics.js";
import { buildSubscores, confidenceInfo, band } from "../analysis/scoring.js";
import { buildAnalysisModel } from "./analysis-model.js";
import { format } from "../content/de.js";
import { unicodeLabels } from "../content/reference-data.js";

/** Create the analysis view with explicitly supplied DOM and content.
 * @param {object} config Page root, template collection and messages.
 * @returns {{render: Function, clear: Function, busy: Function, error: Function}} View API. */
export function createAnalysisView({ root, templates, messages }) {
  /** Find an element within this view's supplied root.
   * @param {string} id Element ID.
   * @returns {HTMLElement} Page element. */
  function element(id) {
    return root.querySelector("#" + id);
  }

  /** Render a label and value using the paragraph template.
   * @param {HTMLElement} target Paragraph destination.
   * @param {string} label Emphasized label.
   * @param {string} text Plain paragraph value.
   * @returns {void} Appends one paragraph. */
  function paragraph(target, label, text) {
    target.append(
      cloneTemplate(templates.paragraph, {
        label,
        text,
      }),
    );
  }

  /** Show safe text with inline Unicode-marker nodes.
   * @param {string} text Original source text.
   * @returns {void} Replaces the visualization. */
  function renderUnicode(text) {
    const fragment = root.ownerDocument.createDocumentFragment();
    let run = "";
    for (const char of text) {
      const label = unicodeLabels.get(char.codePointAt(0));
      if (label) {
        fragment.append(root.ownerDocument.createTextNode(run));
        run = "";
        fragment.append(
          cloneTemplate(templates.marker, {
            text: "[" + label + "]",
          }),
        );
      } else {
        run += char;
      }
    }
    fragment.append(root.ownerDocument.createTextNode(run));
    element("unicodeVisualized").replaceChildren(fragment);
  }

  /** Compose the forensic description from structured scores.
   * @param {object} result Analysis metrics.
   * @param {object} subs Four subscores.
   * @param {object} confidence Confidence label and group count.
   * @returns {string} Plain description. */
  function finding(result, subs, confidence) {
    const findings = [];
    for (const [key, text] of [
      ["regularity", messages.findingRegularity],
      ["redundancy", messages.findingRedundancy],
      ["diversity", messages.findingDiversity],
      ["style", messages.findingStyle],
    ]) {
      if (subs[key] >= 70) {
        findings.push(text);
      }
    }
    let unicodeNote = "";
    if (result.uni.length) {
      findings.push(format(messages.findingUnicode, result.uni.length));
      unicodeNote = messages.findingUnicodeNote;
    }
    if (!findings.length) {
      findings.push(messages.findingNone);
    }
    const strongest = Object.entries(subs).sort(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {*} first Value supplied by the enclosing operation.
       * @param {*} second Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (first, second) => {
        return second[1] - first[1];
      },
    )[0];
    return format(
      messages.finding,
      messages[strongest[0]],
      strongest[1],
      findings.join(", "),
      confidence.label,
      unicodeNote,
    );
  }

  /** Render a fully calculated analysis; no asynchronous work occurs here.
   * @param {string} text Original source text.
   * @param {object} result Analysis data including reasons.
   * @param {number|null} compression Gzip ratio or unsupported capability.
   * @returns {void} Updates all result sections atomically within this call. */
  function render(text, result, compression) {
    const r = result;
    const model = buildAnalysisModel(text, r, compression);
    const [label, className] = band(r.score);
    const verdict = cloneTemplate(templates.verdict, {
      label,
      text: format(messages.verdict, label),
    });
    verdict.querySelector(".badge").classList.add(className);
    element("verdict").replaceChildren(verdict);
    element("scoreBar").style.width = r.score + "%";
    element("scoreText").textContent = r.score + " / 100";
    const subs = buildSubscores(r);
    for (const [id, key] of [
      ["scoreRegularity", "regularity"],
      ["scoreRedundancy", "redundancy"],
      ["scoreDiversity", "diversity"],
      ["scoreStyle", "style"],
    ]) {
      element(id).textContent = subs[key] + "/100";
    }
    const confidence = confidenceInfo(r);
    element("confidenceLabel").textContent = confidence.label;
    element("confidenceLength").textContent = format(
      messages.words,
      r.ws.length,
    );
    element("confidenceSignals").textContent = format(
      messages.signals,
      confidence.groups,
    );
    const meaning = element("analysisMeaning");
    meaning.replaceChildren();
    paragraph(meaning, messages.meaningLabel, messages.analysisMeaning);
    paragraph(meaning, "", messages.confidenceMeaning);
    if (r.ws.length < 80) {
      paragraph(meaning, "", messages.shortTextMeaning);
    }
    element("forensicFinding").textContent = finding(r, subs, confidence);
    let interpretation = messages.interpretationStrong;
    if (r.score < 35) {
      interpretation = messages.interpretationHuman;
    } else if (r.score < 60) {
      interpretation = messages.interpretationMixed;
    } else if (r.score < 78) {
      interpretation = messages.interpretationAi;
    }
    const explanation = element("scoreExplanation");
    explanation.replaceChildren();
    paragraph(explanation, "", format(messages.scoreExplanation, r.score));
    paragraph(explanation, "", messages.scoreOrigin);
    paragraph(explanation, messages.interpretationLabel, interpretation);
    const scoreRows = root.ownerDocument.createDocumentFragment();
    for (const part of r.scoreParts) {
      let delta = "±0",
        influence = messages.scoreNeutral,
        style = "warn";
      if (Math.abs(part.delta) >= 0.05) {
        delta = part.delta.toFixed(1);
        if (part.delta > 0) {
          delta = "+" + delta;
        }
      }
      if (part.delta > 0) {
        influence = messages.scoreUp;
        style = "bad";
      } else if (part.delta < 0) {
        influence = messages.scoreDown;
        style = "good";
      }
      const row = cloneTemplate(templates.scoreRow, {
        label: part.label,
        detail: part.detail,
        influence,
        delta,
      });
      row.querySelector(".badge").classList.add(style);
      scoreRows.append(row);
    }
    element("scoreBreakdown").replaceChildren(scoreRows);
    element("metrics").replaceChildren(
      ...model.metrics.map(
        /** Build one independent template instance for the supplied result item.
         * @param {*} argument1 Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        ([label, value]) => {
          return cloneTemplate(templates.metric, {
            label,
            value,
          });
        },
      ),
    );
    let unicodeLabel = messages.noInvisible,
      unicodeDetail = messages.noInvisibleDetail,
      unicodeClass = "good";
    if (r.uni.length) {
      unicodeLabel = format(messages.invisibleCount, r.uni.length);
      unicodeDetail = messages.invisibleWarning;
      unicodeClass = "bad";
    }
    const summary = cloneTemplate(templates.verdict, {
      label: unicodeLabel,
      text: unicodeDetail,
    });
    summary.querySelector(".badge").classList.add(unicodeClass);
    element("unicodeSummary").replaceChildren(summary);
    const details = element("unicodeDetails");
    details.replaceChildren();
    if (r.uni.length) {
      const table = cloneTemplate(templates.unicodeTable);
      renderRows(
        table.querySelector("tbody"),
        r.uni.map(
          /** Convert one source item to the representation required by this metric or view.
           * @param {*} item Value supplied by the enclosing operation.
           * @returns {*} Result of this operation. */
          (item) => {
            return [
              item.index,
              "U+" + item.cp.toString(16).toUpperCase().padStart(4, "0"),
              item.name,
            ];
          },
        ),
        templates,
      );
      details.append(table);
    }
    renderUnicode(text);
    if (r.scripts.cyr + r.scripts.greek > 0 && r.scripts.latin > 20) {
      paragraph(
        details,
        "",
        format(
          messages.mixedScripts,
          r.scripts.latin,
          r.scripts.cyr,
          r.scripts.greek,
        ),
      );
    }
    const styleDetails = element("styleDetails");
    styleDetails.replaceChildren();
    if (r.repeats.length) {
      paragraph(
        styleDetails,
        messages.repeatLabel,
        r.repeats
          .map(
            /** Convert one source item to the representation required by this metric or view.
             * @param {*} argument1 Value supplied by the enclosing operation.
             * @returns {*} Result of this operation. */
            ([word, count]) => {
              return word + " (" + count + "×)";
            },
          )
          .join(", "),
      );
    } else {
      paragraph(styleDetails, "", messages.noRepeats);
    }
    paragraph(
      styleDetails,
      messages.punctuationLabel,
      format(
        messages.punctuationDetail,
        r.punct,
        r.questionCount,
        r.exclamationCount,
        r.quotes,
      ),
    );
    let markers = messages.noStructure;
    if (r.transitions.length) {
      markers = r.transitions.join(", ");
    }
    paragraph(styleDetails, messages.structureLabel, markers + ".");
    for (const [id, rows] of [
      ["statsRows", model.rows],
      ["advancedRows", model.advanced],
      ["complexityRows", model.complexityRows],
      ["ngramProfileRows", model.np],
    ]) {
      renderRows(element(id), rows, templates, messages.noData);
    }
    element("ngramScore").textContent = model.ngramRegularity + "/100";
    element("functionProfileScore").textContent =
      model.functionConcentration + "/100";
    element("localBurstScore").textContent = "–";
    element("entropyTrendScore").textContent = "–";
    if (r.burstWindows.length) {
      element("localBurstScore").textContent = model.burstConst + "/100";
    }
    if (r.entropyWindows.length) {
      element("entropyTrendScore").textContent = model.entropyConst + "/100";
    }
    renderRows(
      element("burstWindowRows"),
      r.burstWindows.slice(0, 12).map(
        /** Convert one source item to the representation required by this metric or view.
         * @param {*} window Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (window) => {
          let label = messages.variable;
          if (window.value < 0.4) {
            label = messages.uniform;
          } else if (window.value < 0.7) {
            label = messages.medium;
          }
          return [
            format(messages.windowSentences, window.start, window.end),
            window.value.toFixed(3),
            label,
          ];
        },
      ),
      templates,
      messages.noSentences,
    );
    const entropy = r.entropyWindows.map(
      /** Read the measured value of a local analysis window.
       * @param {*} window Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (window) => {
        return window.value;
      },
    );
    element("entropySpark").replaceChildren();
    element("entropyTrendText").textContent = messages.noEntropyTrend;
    if (entropy.length) {
      const min = Math.min(...entropy),
        max = Math.max(...entropy);
      for (const value of entropy) {
        const bar = cloneTemplate(templates.spark);
        bar.firstElementChild.style.height =
          (10 + (32 * (value - min)) / Math.max(0.001, max - min)).toFixed(0) +
          "px";
        bar.firstElementChild.title = format(
          messages.entropyTooltip,
          value.toFixed(3),
        );
        element("entropySpark").append(bar);
      }
      if (entropy.length > 1) {
        element("entropyTrendText").textContent = format(
          messages.entropyTrend,
          min.toFixed(3),
          max.toFixed(3),
          stddev(entropy).toFixed(3),
        );
      }
    }
    renderRows(
      element("functionWordRows"),
      r.functionProfile.map(
        /** Convert one source item to the representation required by this metric or view.
         * @param {*} item Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (item) => {
          return [item.word, pct(item.share), item.count];
        },
      ),
      templates,
      messages.noData,
    );
    let reasons = r.reasons;
    if (!reasons.length) {
      reasons = [messages.noReasons];
    }
    element("reasons").replaceChildren(
      ...reasons.map(
        /** Build one independent template instance for the supplied result item.
         * @param {string} text Source text.
         * @returns {*} Result of this operation. */
        (text) => {
          return cloneTemplate(templates.listItem, {
            text,
          });
        },
      ),
    );
    element("analysisMessage").textContent = "";
    element("results").classList.remove("hidden");
  }

  /** Hide result panels after clearing the input.
   * @returns {void} Hides results and clears status. */
  function clear() {
    element("results").classList.add("hidden");
    element("analysisMessage").textContent = "";
  }
  /** Set the analyze button's busy status.
   * @param {boolean} active Whether calculation is running.
   * @returns {void} Updates the button. */
  function busy(active) {
    element("analyzeBtn").disabled = active;
    if (active) {
      element("analyzeBtn").textContent = messages.analyzing;
    } else {
      element("analyzeBtn").textContent = messages.analyze;
    }
  }
  /** Display an accessible analysis error.
   * @param {string} text Plain message.
   * @returns {void} Updates the live region. */
  function error(text) {
    element("analysisMessage").textContent = text;
  }
  return {
    render,
    clear,
    busy,
    error,
  };
}
