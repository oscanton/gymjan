import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  catalogsToTables,
  DAY_KEYS,
  exportCatalogsToCsv,
  importCatalogsFromCsv,
  loadCatalogs,
  readTables,
  tablesToCatalogs,
  validateCatalogs,
  validateCsvCatalogs,
} from "./lib/catalog-tool.js";
import { parseCsv } from "./lib/csv.js";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..", "..");
const tempRoot = path.join(repoRoot, "tests/.tmp-catalog-csv");

test("export -> read -> import mantiene la estructura de catalogos", async () => {
  await rm(tempRoot, { recursive: true, force: true });
  await mkdir(tempRoot, { recursive: true });

  const csvDir = path.join(tempRoot, "csv");
  const generatedRoot = path.join(tempRoot, "generated");

  const sourceCatalogs = await loadCatalogs(repoRoot);
  await exportCatalogsToCsv({
    sourceRoot: repoRoot,
    csvDir,
  });

  const validationResult = await validateCsvCatalogs({
    csvDir,
  });
  assert.equal(validationResult.ok, true);

  const tables = await readTables(csvDir);
  const importedCatalogs = await tablesToCatalogs({
    tables,
  });

  assert.deepEqual(catalogsToTables(importedCatalogs), catalogsToTables(sourceCatalogs));
  validateCatalogs(importedCatalogs);

  await importCatalogsFromCsv({
    sourceRoot: repoRoot,
    csvDir,
    targetRoot: generatedRoot,
    cleanTarget: true,
  });

  const generatedFiles = await readdir(path.join(generatedRoot, "js/catalog"), {
    recursive: true,
  });
  assert.ok(generatedFiles.includes("food-catalog.js"));
  assert.ok(generatedFiles.includes("exercise-catalog.js"));
  assert.ok(generatedFiles.includes(path.join("menu-templates", "menu-template-catalog.js")));
  assert.ok(
    generatedFiles.includes(
      path.join("routine-templates", "routine-template-catalog.js"),
    ),
  );
  assert.ok(
    generatedFiles.includes(
      path.join("profile-presets", "profile-preset-catalog.js"),
    ),
  );
});

test("los perfiles importados conservan los 7 dias", async () => {
  const sourceCatalogs = await loadCatalogs(repoRoot);

  for (const profile of sourceCatalogs.profiles) {
    assert.deepEqual(Object.keys(profile.weeklyPlan), DAY_KEYS);
  }
});

test("parseCsv acepta CSV guardado desde Excel con ; y BOM", async () => {
  const csvText = "\ufeffid;categoryId;unit\nwater;beverages;ml\n";
  const rows = parseCsv(csvText);

  assert.deepEqual(rows, [
    {
      id: "water",
      categoryId: "beverages",
      unit: "ml",
    },
  ]);
});

test("validate funciona con un CSV regrabado en formato Excel con ;", async () => {
  await rm(tempRoot, { recursive: true, force: true });
  await mkdir(tempRoot, { recursive: true });

  const csvDir = path.join(tempRoot, "csv");
  await exportCatalogsToCsv({
    sourceRoot: repoRoot,
    csvDir,
  });

  const foodsPath = path.join(csvDir, "foods.csv");
  const semicolonCsv = await readFile(foodsPath, "utf8");
  const excelStyleCsv = `\ufeff${semicolonCsv}`;
  await writeFile(foodsPath, excelStyleCsv, "utf8");

  const validationResult = await validateCsvCatalogs({
    csvDir,
  });

  assert.equal(validationResult.ok, true);
});

test("el export escribe formato amigable para Excel con ; y coma decimal", async () => {
  await rm(tempRoot, { recursive: true, force: true });
  await mkdir(tempRoot, { recursive: true });

  const csvDir = path.join(tempRoot, "csv");
  await exportCatalogsToCsv({
    sourceRoot: repoRoot,
    csvDir,
  });

  const foodsPath = path.join(csvDir, "foods.csv");
  const csvText = await readFile(foodsPath, "utf8");

  assert.match(csvText, /^id;categoryId;unit;/m);
  assert.match(csvText, /beer;beverages;ml;per_unit;0,433;0,004;/);
});
