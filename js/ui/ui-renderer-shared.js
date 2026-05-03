export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPanel(title, body) {
  return `
    <section class="panel">
      <div class="panel-body stack">
        <h2 class="section-title">${escapeHtml(title)}</h2>
        ${body}
      </div>
    </section>
  `;
}

export function renderSelectOptions(
  options,
  selectedValue,
  getValue,
  getLabel,
  placeholder,
) {
  const optionMarkup = options
    .map((option) => {
      const value = getValue(option);
      return `
        <option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>
          ${escapeHtml(getLabel(option))}
        </option>
      `;
    })
    .join("");

  return `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ""}${optionMarkup}`;
}

export function sortByLabel(items, getLabel) {
  return [...items].sort((left, right) =>
    getLabel(left).localeCompare(getLabel(right)),
  );
}

export function renderEmptyState(label) {
  return `<div class="empty-state">${escapeHtml(label)}</div>`;
}

export function renderField(label, controlMarkup, inputId = "") {
  const forAttribute = inputId ? ` for="${escapeHtml(inputId)}"` : "";
  return `
    <div class="field">
      <label${forAttribute}>${escapeHtml(label)}</label>
      ${controlMarkup}
    </div>
  `;
}

export function renderInputControl({
  id = "",
  type = "text",
  value = "",
  min = null,
  step = null,
  dataset = {},
}) {
  const dataAttributes = Object.entries(dataset)
    .map(([key, attributeValue]) => ` data-${key}="${escapeHtml(attributeValue)}"`)
    .join("");
  const idAttribute = id ? ` id="${escapeHtml(id)}"` : "";
  const minAttribute = min !== null ? ` min="${escapeHtml(min)}"` : "";
  const stepAttribute = step !== null ? ` step="${escapeHtml(step)}"` : "";

  return `<input${idAttribute} type="${escapeHtml(type)}"${minAttribute}${stepAttribute} value="${escapeHtml(
    value,
  )}"${dataAttributes}>`;
}

export function renderInputField(options) {
  return renderField(options.label, renderInputControl(options), options.id);
}

export function renderSelectField({
  id = "",
  label,
  options,
  selectedValue,
  getValue,
  getLabel,
  placeholder,
  dataset = {},
}) {
  const dataAttributes = Object.entries(dataset)
    .map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`)
    .join("");
  const idAttribute = id ? ` id="${escapeHtml(id)}"` : "";

  return renderField(
    label,
    `
      <select${idAttribute}${dataAttributes}>
        ${renderSelectOptions(options, selectedValue, getValue, getLabel, placeholder)}
      </select>
    `,
    id,
  );
}

export function getTemplateLabel(template, namespace, t) {
  return t(template.labelKey ?? `${namespace}.${template.id}.label`);
}

export function renderMetricCard(label, value, meta = "") {
  return `
    <article class="metric-card">
      <p class="metric-label">${escapeHtml(label)}</p>
      <p class="metric-value">${escapeHtml(value)}</p>
      ${meta ? `<p class="metric-label">${escapeHtml(meta)}</p>` : ""}
    </article>
  `;
}

export function renderStatusBadge(label, status, formatters) {
  return `<span class="badge ${formatters.statusClass(status)}">${escapeHtml(label)}</span>`;
}
