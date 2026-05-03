#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  exportCatalogsToCsv,
  importCatalogsFromCsv,
  validateCsvCatalogs,
} from "./lib/catalog-tool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const defaults = {
  sourceRoot: repoRoot,
  csvDir: path.join(repoRoot, "tests/catalog-csv/data"),
  targetRoot: path.join(repoRoot, "tests/catalog-csv/generated-app"),
};

const { command, options } = parseArgs(process.argv.slice(2));

if (!command || options.help) {
  printHelp();
  process.exit(command ? 0 : 1);
}

try {
  if (command === "export") {
    const tables = await exportCatalogsToCsv({
      sourceRoot: resolveOptionPath(options.sourceRoot, defaults.sourceRoot),
      csvDir: resolveOptionPath(options.csvDir, defaults.csvDir),
    });
    logSuccess(
      `CSV exportados en ${resolveOptionPath(options.csvDir, defaults.csvDir)}.`,
      summarizeTables(tables),
    );
    process.exit(0);
  }

  if (command === "validate") {
    const result = await validateCsvCatalogs({
      csvDir: resolveOptionPath(options.csvDir, defaults.csvDir),
    });
    logSuccess(
      `CSV validados correctamente en ${resolveOptionPath(options.csvDir, defaults.csvDir)}.`,
      result.counts,
    );
    process.exit(0);
  }

  if (command === "import") {
    const catalogs = await importCatalogsFromCsv({
      sourceRoot: resolveOptionPath(options.sourceRoot, defaults.sourceRoot),
      csvDir: resolveOptionPath(options.csvDir, defaults.csvDir),
      targetRoot: resolveOptionPath(options.targetRoot, defaults.targetRoot),
      cleanTarget: options.clean === "true",
    });
    logSuccess(
      `JS regenerados en ${resolveOptionPath(options.targetRoot, defaults.targetRoot)}.`,
      {
        foods: catalogs.foods.length,
        exercises: catalogs.exercises.length,
        menus: catalogs.menus.length,
        routines: catalogs.routines.length,
        profiles: catalogs.profiles.length,
      },
    );
    process.exit(0);
  }

  printHelp();
  process.exit(1);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function parseArgs(args) {
  const [command, ...rest] = args;
  const options = {};

  for (const arg of rest) {
    if (!arg.startsWith("--")) {
      continue;
    }

    const [rawKey, rawValue] = arg.slice(2).split("=");
    options[rawKey] = rawValue ?? "true";
  }

  return { command, options };
}

function resolveOptionPath(value, fallback) {
  if (!value) {
    return fallback;
  }

  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function logSuccess(message, counts) {
  console.log(message);
  console.log(JSON.stringify(counts, null, 2));
}

function summarizeTables(tables) {
  return Object.fromEntries(
    Object.entries(tables).map(([key, rows]) => [key, rows.length]),
  );
}

function printHelp() {
  console.log(`Uso:
  node tests/catalog-csv/cli.js export [--csvDir=tests/catalog-csv/data] [--sourceRoot=.]
  node tests/catalog-csv/cli.js validate [--csvDir=tests/catalog-csv/data] [--sourceRoot=.]
  node tests/catalog-csv/cli.js import [--csvDir=tests/catalog-csv/data] [--targetRoot=tests/catalog-csv/generated-app] [--sourceRoot=.] [--clean=true]

Notas:
  - export extrae los catalogos actuales a CSV.
  - validate comprueba referencias e ids.
  - import regenera JS desde CSV.
  - Para sobrescribir el proyecto real, usa --targetRoot=. y revisa el diff antes.
  - Tambien puedes lanzar: npm run catalog:csv -- export
`);
}
