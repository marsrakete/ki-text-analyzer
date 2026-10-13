/** Clone a template and fill its named text fields.
 * @param {HTMLTemplateElement} template Structure supplied by the page.
 * @param {object} values Values indexed by data-field name.
 * @returns {DocumentFragment} Independent nodes ready for insertion. */
export function cloneTemplate(template, values = {}) {
  if (!template?.content) {
    throw new TypeError("Expected an HTML template.");
  }
  const fragment = template.content.cloneNode(true);
  for (const element of fragment.querySelectorAll("[data-field]")) {
    const key = element.dataset.field;
    if (Object.hasOwn(values, key)) {
      element.textContent = String(values[key]);
    }
  }
  return fragment;
}

/** Replace a table body with structured rows or a single empty-state row.
 * @param {HTMLElement} target Destination table body.
 * @param {Array<Array<*>>} rows Three-column row data.
 * @param {object} templates Row and emptyRow templates.
 * @param {string} emptyText Text shown when no rows exist.
 * @returns {void} Updates the destination. */
export function renderRows(target, rows, templates, emptyText = "") {
  const fragment = target.ownerDocument.createDocumentFragment();
  if (rows.length === 0) {
    fragment.append(
      cloneTemplate(templates.emptyRow, {
        text: emptyText,
      }),
    );
  } else {
    for (const [first, second, third] of rows) {
      fragment.append(
        cloneTemplate(templates.row, {
          first,
          second,
          third,
        }),
      );
    }
  }
  target.replaceChildren(fragment);
}
