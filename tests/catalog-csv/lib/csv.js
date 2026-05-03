import { readFile, writeFile } from "node:fs/promises";

export async function readCsv(csvPath) {
  return parseCsv(await readFile(csvPath, "utf8"));
}

export async function writeCsv(csvPath, columns, rows) {
  await writeFile(csvPath, stringifyCsv(columns, rows), "utf8");
}

export function stringifyCsv(columns, rows) {
  const delimiter = ";";
  const lines = [columns.map((value) => escapeCsvCell(value, delimiter)).join(delimiter)];

  for (const row of rows) {
    lines.push(
      columns
        .map((column) => escapeCsvCell(formatCsvValue(row[column]), delimiter))
        .join(delimiter),
    );
  }

  return `${lines.join("\n")}\n`;
}

export function parseCsv(text) {
  const normalizedText = stripBom(text);
  const delimiter = detectDelimiter(normalizedText);
  const rows = [];
  let row = [];
  let cell = "";
  let index = 0;
  let inQuotes = false;

  while (index < normalizedText.length) {
    const char = normalizedText[index];

    if (inQuotes) {
      if (char === "\"") {
        if (normalizedText[index + 1] === "\"") {
          cell += "\"";
          index += 2;
          continue;
        }

        inQuotes = false;
        index += 1;
        continue;
      }

      cell += char;
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (char === delimiter) {
      row.push(cell);
      cell = "";
      index += 1;
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      index += 1;
      continue;
    }

    if (char === "\r") {
      index += 1;
      continue;
    }

    cell += char;
    index += 1;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const [header, ...dataRows] = rows;
  return dataRows
    .filter((dataRow) => dataRow.some((value) => value !== ""))
    .map((dataRow) =>
      Object.fromEntries(
        header.map((column, columnIndex) => [column, dataRow[columnIndex] ?? ""]),
      ),
    );
}

function escapeCsvCell(value, delimiter) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (stringValue.includes(delimiter) || /["\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
}

function formatCsvValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).replace(".", ",");
  }

  return value;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const commaCount = countChar(firstLine, ",");
  const semicolonCount = countChar(firstLine, ";");
  return semicolonCount > commaCount ? ";" : ",";
}

function countChar(text, char) {
  let count = 0;
  for (const current of text) {
    if (current === char) {
      count += 1;
    }
  }
  return count;
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
