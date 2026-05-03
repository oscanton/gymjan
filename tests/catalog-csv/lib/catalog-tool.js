import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readCsv, writeCsv } from "./csv.js";

const FOOD_COLUMNS = [
  "id",
  "categoryId",
  "unit",
  "nutritionMode",
  "kcal",
  "protein",
  "carbs",
  "fat",
  "saturatedFat",
  "fiber",
  "sugar",
  "sodiumMg",
  "waterMl",
  "processingScore",
  "descriptionKey",
];

const EXERCISE_COLUMNS = [
  "id",
  "type",
  "focus",
  "met",
  "relativeLoad",
  "cadenceBase",
  "descriptionKey",
  "techniqueKey",
];

const MENU_COLUMNS = ["id", "sourceFile", "labelKey", "descriptionKey"];
const MENU_ITEM_COLUMNS = [
  "menuId",
  "mealKey",
  "blockIndex",
  "itemIndex",
  "recipeId",
  "labelKey",
  "foodId",
  "amount",
];

const ROUTINE_COLUMNS = ["id", "sourceFile", "labelKey", "descriptionKey"];
const ROUTINE_ITEM_COLUMNS = [
  "routineId",
  "sectionKey",
  "itemIndex",
  "exerciseId",
  "metric",
  "min",
  "durationSec",
  "cadencePerMin",
  "sets",
  "reps",
  "loadKg",
  "rir",
  "secPerRep",
  "restSec",
  "notes",
];

const SECONDARY_COLUMNS = [
  "saltMaxG",
  "fiberPer1000Kcal",
  "sugarMaxPctKcal",
  "saturatedFatMaxPctKcal",
  "processingMaxScore",
  "hydrationMlPerKg",
  "hydrationActivityMlPerMin",
];

const PROFILE_COLUMNS = [
  "id",
  "sourceFile",
  "labelKey",
  "descriptionKey",
  "sex",
  "targetBaseKcal",
  "fallbackKcalDeltaPct",
  "fallbackProtein",
  "fallbackCarbs",
  "fallbackFat",
  "secondaryPresetKey",
  ...SECONDARY_COLUMNS,
];

const PROFILE_WEEKLY_PLAN_COLUMNS = [
  "profileId",
  "dayKey",
  "menuTemplateId",
  "routineTemplateId",
  "kcalDeltaPct",
  "protein",
  "carbs",
  "fat",
  "secondaryPresetKey",
  ...SECONDARY_COLUMNS,
];

const CSV_FILES = {
  foods: "foods.csv",
  exercises: "exercises.csv",
  menus: "menus.csv",
  menuItems: "menu_items.csv",
  routines: "routines.csv",
  routineItems: "routine_items.csv",
  profiles: "profiles.csv",
  profileWeeklyPlan: "profile_weekly_plan.csv",
};

export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MEAL_KEYS = ["hydration", "breakfast", "lunch", "dinner"];
const ACTIVITY_SECTION_KEYS = ["walking", "gym", "extra"];

export async function exportCatalogsToCsv({
  sourceRoot,
  csvDir,
}) {
  const catalogs = await loadCatalogs(sourceRoot);
  const tables = catalogsToTables(catalogs);
  await writeTables(csvDir, tables);
  return tables;
}

export async function validateCsvCatalogs({ csvDir }) {
  const tables = await readTables(csvDir);
  const catalogs = await tablesToCatalogs({
    tables,
  });
  return validateCatalogs(catalogs);
}

export async function importCatalogsFromCsv({
  sourceRoot,
  csvDir,
  targetRoot,
  cleanTarget = false,
}) {
  const tables = await readTables(csvDir);
  const catalogs = await tablesToCatalogs({
    tables,
  });
  validateCatalogs(catalogs);
  await writeCatalogModules({
    sourceRoot,
    targetRoot,
    catalogs,
    cleanTarget,
  });
  return catalogs;
}

export async function loadCatalogs(sourceRoot) {
  const foodModule = await importFresh(
    path.join(sourceRoot, "js/catalog/food-catalog.js"),
  );
  const exerciseModule = await importFresh(
    path.join(sourceRoot, "js/catalog/exercise-catalog.js"),
  );
  const menuCatalogModule = await importFresh(
    path.join(sourceRoot, "js/catalog/menu-templates/menu-template-catalog.js"),
  );
  const routineCatalogModule = await importFresh(
    path.join(sourceRoot, "js/catalog/routine-templates/routine-template-catalog.js"),
  );
  const profileCatalogModule = await importFresh(
    path.join(sourceRoot, "js/catalog/profile-presets/profile-preset-catalog.js"),
  );

  const menuSourceFiles = await discoverSourceFiles({
    sourceRoot,
    relativeDir: "js/catalog/menu-templates",
    ignoredFiles: new Set(["menu-template-catalog.js"]),
  });
  const routineSourceFiles = await discoverSourceFiles({
    sourceRoot,
    relativeDir: "js/catalog/routine-templates",
    ignoredFiles: new Set(["routine-template-catalog.js"]),
  });
  const profileSourceFiles = await discoverSourceFiles({
    sourceRoot,
    relativeDir: "js/catalog/profile-presets",
    ignoredFiles: new Set(["profile-preset-catalog.js"]),
  });
  const profiles = profileCatalogModule.PROFILES_DB.map((profile) => ({
    ...clone(profile),
    sourceFile:
      profileSourceFiles.get(profile.id) ?? deriveSourceFileName("profile", profile.id),
  }));

  return {
    foods: clone(foodModule.FOODS_DB),
    exercises: clone(exerciseModule.EXERCISES_DB),
    menus: menuCatalogModule.MENUS_DB.map((menu) => ({
      ...clone(menu),
      sourceFile: menuSourceFiles.get(menu.id) ?? deriveSourceFileName("menu", menu.id),
    })),
    routines: routineCatalogModule.ROUTINES_DB.map((routine) => ({
      ...clone(routine),
      sourceFile:
        routineSourceFiles.get(routine.id) ??
        deriveSourceFileName("routine", routine.id),
    })),
    profiles,
    secondaryPresets: deriveSecondaryPresetsFromProfiles(profiles),
  };
}

export function catalogsToTables(catalogs) {
  return {
    foods: catalogs.foods.map((food) => ({
      id: food.id,
      categoryId: food.categoryId,
      unit: food.unit,
      nutritionMode: food.nutritionMode,
      kcal: food.nutrients.kcal,
      protein: food.nutrients.protein,
      carbs: food.nutrients.carbs,
      fat: food.nutrients.fat,
      saturatedFat: food.nutrients.saturatedFat,
      fiber: food.nutrients.fiber,
      sugar: food.nutrients.sugar,
      sodiumMg: food.nutrients.sodiumMg,
      waterMl: food.waterMl,
      processingScore: food.processingScore,
      descriptionKey: food.descriptionKey,
    })),
    exercises: catalogs.exercises.map((exercise) => ({
      id: exercise.id,
      type: exercise.type,
      focus: exercise.focus,
      met: exercise.met,
      relativeLoad: exercise.relativeLoad,
      cadenceBase: exercise.cadenceBase,
      descriptionKey: exercise.descriptionKey,
      techniqueKey: exercise.techniqueKey,
    })),
    menus: catalogs.menus.map((menu) => ({
      id: menu.id,
      sourceFile: menu.sourceFile ?? deriveSourceFileName("menu", menu.id),
      labelKey: menu.labelKey,
      descriptionKey: menu.descriptionKey,
    })),
    menuItems: catalogs.menus.flatMap((menu) => menuToMenuItemRows(menu)),
    routines: catalogs.routines.map((routine) => ({
      id: routine.id,
      sourceFile: routine.sourceFile ?? deriveSourceFileName("routine", routine.id),
      labelKey: routine.labelKey,
      descriptionKey: routine.descriptionKey,
    })),
    routineItems: catalogs.routines.flatMap((routine) => routineToItemRows(routine)),
    profiles: catalogs.profiles.map((profile) => ({
      id: profile.id,
      sourceFile: profile.sourceFile ?? deriveSourceFileName("profile", profile.id),
      labelKey: profile.labelKey,
      descriptionKey: profile.descriptionKey,
      sex: profile.userPreset.sex,
      targetBaseKcal: profile.userPreset.targetBaseKcal,
      fallbackKcalDeltaPct: profile.fallbackTargetTuning.kcalDeltaPct,
      fallbackProtein: profile.fallbackTargetTuning.macroRatios.protein,
      fallbackCarbs: profile.fallbackTargetTuning.macroRatios.carbs,
      fallbackFat: profile.fallbackTargetTuning.macroRatios.fat,
      ...targetSecondaryToRow(
        profile.fallbackTargetTuning.secondary,
        catalogs.secondaryPresets,
      ),
    })),
    profileWeeklyPlan: catalogs.profiles.flatMap((profile) =>
      DAY_KEYS.map((dayKey) => {
        const plan = profile.weeklyPlan[dayKey];
        return {
          profileId: profile.id,
          dayKey,
          menuTemplateId: plan.menuTemplateId,
          routineTemplateId: plan.routineTemplateId,
          ...targetTuningToRow(plan.targetTuning, catalogs.secondaryPresets),
        };
      }),
    ),
  };
}

export async function readTables(csvDir) {
  return {
    foods: await readCsv(path.join(csvDir, CSV_FILES.foods)),
    exercises: await readCsv(path.join(csvDir, CSV_FILES.exercises)),
    menus: await readCsv(path.join(csvDir, CSV_FILES.menus)),
    menuItems: await readCsv(path.join(csvDir, CSV_FILES.menuItems)),
    routines: await readCsv(path.join(csvDir, CSV_FILES.routines)),
    routineItems: await readCsv(path.join(csvDir, CSV_FILES.routineItems)),
    profiles: await readCsv(path.join(csvDir, CSV_FILES.profiles)),
    profileWeeklyPlan: await readCsv(path.join(csvDir, CSV_FILES.profileWeeklyPlan)),
  };
}

export async function writeTables(csvDir, tables) {
  await mkdir(csvDir, { recursive: true });

  await Promise.all([
    writeCsv(path.join(csvDir, CSV_FILES.foods), FOOD_COLUMNS, tables.foods),
    writeCsv(
      path.join(csvDir, CSV_FILES.exercises),
      EXERCISE_COLUMNS,
      tables.exercises,
    ),
    writeCsv(path.join(csvDir, CSV_FILES.menus), MENU_COLUMNS, tables.menus),
    writeCsv(
      path.join(csvDir, CSV_FILES.menuItems),
      MENU_ITEM_COLUMNS,
      tables.menuItems,
    ),
    writeCsv(
      path.join(csvDir, CSV_FILES.routines),
      ROUTINE_COLUMNS,
      tables.routines,
    ),
    writeCsv(
      path.join(csvDir, CSV_FILES.routineItems),
      ROUTINE_ITEM_COLUMNS,
      tables.routineItems,
    ),
    writeCsv(
      path.join(csvDir, CSV_FILES.profiles),
      PROFILE_COLUMNS,
      tables.profiles,
    ),
    writeCsv(
      path.join(csvDir, CSV_FILES.profileWeeklyPlan),
      PROFILE_WEEKLY_PLAN_COLUMNS,
      tables.profileWeeklyPlan,
    ),
    rm(path.join(csvDir, "routine_gym_items.csv"), { force: true }),
    rm(path.join(csvDir, "routine_extra_items.csv"), { force: true }),
  ]);
}

export async function tablesToCatalogs({
  tables,
}) {
  const foods = tables.foods.map((row) => ({
    id: requiredString(row.id, "foods.id"),
    categoryId: requiredString(row.categoryId, "foods.categoryId"),
    unit: requiredString(row.unit, "foods.unit"),
    nutritionMode: requiredString(row.nutritionMode, "foods.nutritionMode"),
    nutrients: {
      kcal: numberValue(row.kcal, "foods.kcal"),
      protein: numberValue(row.protein, "foods.protein"),
      carbs: numberValue(row.carbs, "foods.carbs"),
      fat: numberValue(row.fat, "foods.fat"),
      saturatedFat: numberValue(row.saturatedFat, "foods.saturatedFat"),
      fiber: numberValue(row.fiber, "foods.fiber"),
      sugar: numberValue(row.sugar, "foods.sugar"),
      sodiumMg: numberValue(row.sodiumMg, "foods.sodiumMg"),
    },
    waterMl: numberValue(row.waterMl, "foods.waterMl"),
    processingScore: numberValue(row.processingScore, "foods.processingScore"),
    descriptionKey: requiredString(row.descriptionKey, "foods.descriptionKey"),
  }));

  const exercises = tables.exercises.map((row) => ({
    id: requiredString(row.id, "exercises.id"),
    type: requiredString(row.type, "exercises.type"),
    focus: requiredString(row.focus, "exercises.focus"),
    met: numberValue(row.met, "exercises.met"),
    relativeLoad: nullableNumberValue(row.relativeLoad, "exercises.relativeLoad"),
    cadenceBase: nullableNumberValue(row.cadenceBase, "exercises.cadenceBase"),
    descriptionKey: requiredString(row.descriptionKey, "exercises.descriptionKey"),
    techniqueKey: requiredString(row.techniqueKey, "exercises.techniqueKey"),
  }));

  const menuRowsById = groupRows(tables.menuItems, "menuId");
  const menus = tables.menus.map((row) => buildMenuFromRows(row, menuRowsById.get(row.id) ?? []));

  const routineItemRowsById = groupRows(tables.routineItems, "routineId");
  const routines = tables.routines.map((row) =>
    buildRoutineFromRows(row, routineItemRowsById.get(row.id) ?? []),
  );

  const weeklyPlanRowsByProfileId = groupRows(tables.profileWeeklyPlan, "profileId");
  const profiles = tables.profiles.map((row) =>
    buildProfileFromRows({
      row,
      weeklyPlanRows: weeklyPlanRowsByProfileId.get(row.id) ?? [],
    }),
  );

  return {
    foods,
    exercises,
    menus,
    routines,
    profiles,
    secondaryPresets: deriveSecondaryPresetsFromProfiles(profiles),
  };
}

export function validateCatalogs(catalogs) {
  const errors = [];

  validateUniqueIds("foods", catalogs.foods, errors);
  validateUniqueIds("exercises", catalogs.exercises, errors);
  validateUniqueIds("menus", catalogs.menus, errors);
  validateUniqueIds("routines", catalogs.routines, errors);
  validateUniqueIds("profiles", catalogs.profiles, errors);

  const foodIds = new Set(catalogs.foods.map((food) => food.id));
  const exerciseIds = new Set(catalogs.exercises.map((exercise) => exercise.id));
  const menuIds = new Set(catalogs.menus.map((menu) => menu.id));
  const routineIds = new Set(catalogs.routines.map((routine) => routine.id));

  for (const menu of catalogs.menus) {
    for (const row of menuToMenuItemRows(menu)) {
      if (!foodIds.has(row.foodId)) {
        errors.push(
          `El menu "${menu.id}" referencia foodId inexistente: "${row.foodId}".`,
        );
      }
    }
  }

  for (const routine of catalogs.routines) {
    for (const section of routine.sections ?? []) {
      for (const item of section.items ?? []) {
        if (!exerciseIds.has(item.exerciseId)) {
          errors.push(
            `La rutina "${routine.id}" referencia exerciseId inexistente en ${section.sectionKey}: "${item.exerciseId}".`,
          );
        }

        if (!["steps", "duration", "strength"].includes(item.prescription?.metric)) {
          errors.push(
            `La rutina "${routine.id}" tiene metric invalido en ${section.sectionKey}: "${item.prescription?.metric}".`,
          );
        }

        if (item.prescription?.metric === "strength") {
          if (!isFiniteNumber(item.prescription.secPerRep) || item.prescription.secPerRep <= 0) {
            errors.push(
              `La rutina "${routine.id}" debe concretar secPerRep en ${section.sectionKey} para "${item.exerciseId}".`,
            );
          }

          if (!isFiniteNumber(item.prescription.restSec) || item.prescription.restSec < 0) {
            errors.push(
              `La rutina "${routine.id}" debe concretar restSec en ${section.sectionKey} para "${item.exerciseId}".`,
            );
          }
        }
      }
    }
  }

  for (const profile of catalogs.profiles) {
    validateMacroRatios(
      `Perfil "${profile.id}" fallbackTargetTuning`,
      profile.fallbackTargetTuning.macroRatios,
      errors,
    );
    validateSecondary(
      `Perfil "${profile.id}" fallbackTargetTuning`,
      profile.fallbackTargetTuning.secondary,
      errors,
    );

    if (Object.keys(profile.weeklyPlan).length !== DAY_KEYS.length) {
      errors.push(`El perfil "${profile.id}" no tiene los 7 dias en weeklyPlan.`);
    }

    for (const dayKey of DAY_KEYS) {
      const plan = profile.weeklyPlan[dayKey];

      if (!plan) {
        errors.push(`El perfil "${profile.id}" no tiene plan para "${dayKey}".`);
        continue;
      }

      if (!menuIds.has(plan.menuTemplateId)) {
        errors.push(
          `El perfil "${profile.id}" referencia menuTemplateId inexistente en ${dayKey}: "${plan.menuTemplateId}".`,
        );
      }

      if (!routineIds.has(plan.routineTemplateId)) {
        errors.push(
          `El perfil "${profile.id}" referencia routineTemplateId inexistente en ${dayKey}: "${plan.routineTemplateId}".`,
        );
      }

      validateMacroRatios(
        `Perfil "${profile.id}" ${dayKey}`,
        plan.targetTuning.macroRatios,
        errors,
      );

      validateSecondary(
        `Perfil "${profile.id}" ${dayKey}`,
        plan.targetTuning.secondary,
        errors,
      );
    }
  }

  if (errors.length > 0) {
    const error = new Error(`Validacion de catalogos fallida:\n- ${errors.join("\n- ")}`);
    error.validationErrors = errors;
    throw error;
  }

  return {
    ok: true,
    counts: {
      foods: catalogs.foods.length,
      exercises: catalogs.exercises.length,
      menus: catalogs.menus.length,
      routines: catalogs.routines.length,
      profiles: catalogs.profiles.length,
    },
  };
}

export async function writeCatalogModules({
  sourceRoot,
  targetRoot,
  catalogs,
  cleanTarget,
}) {
  if (cleanTarget) {
    await Promise.all([
      rm(path.join(targetRoot, "js/catalog/food-catalog.js"), { force: true }),
      rm(path.join(targetRoot, "js/catalog/exercise-catalog.js"), { force: true }),
      rm(path.join(targetRoot, "js/catalog/menu-templates"), {
        recursive: true,
        force: true,
      }),
      rm(path.join(targetRoot, "js/catalog/routine-templates"), {
        recursive: true,
        force: true,
      }),
      rm(path.join(targetRoot, "js/catalog/profile-presets"), {
        recursive: true,
        force: true,
      }),
    ]);
  }

  await Promise.all([
    mkdir(path.join(targetRoot, "js/shared"), { recursive: true }),
    mkdir(path.join(targetRoot, "js/catalog/menu-templates"), { recursive: true }),
    mkdir(path.join(targetRoot, "js/catalog/routine-templates"), { recursive: true }),
    mkdir(path.join(targetRoot, "js/catalog/profile-presets"), { recursive: true }),
  ]);

  await copyFile(
    path.join(sourceRoot, "js/shared/collection-utils.js"),
    path.join(targetRoot, "js/shared/collection-utils.js"),
  );

  await writeFile(
    path.join(targetRoot, "js/catalog/food-catalog.js"),
    buildFlatCatalogModule("FOODS_DB", "FOOD_BY_ID", catalogs.foods),
    "utf8",
  );
  await writeFile(
    path.join(targetRoot, "js/catalog/exercise-catalog.js"),
    buildFlatCatalogModule("EXERCISES_DB", "EXERCISE_BY_ID", catalogs.exercises),
    "utf8",
  );

  await Promise.all(
    catalogs.menus.map((menu) =>
      writeFile(
        path.join(targetRoot, "js/catalog/menu-templates", menu.sourceFile),
        buildDefaultExportModule(stripSourceFile(menu)),
        "utf8",
      ),
    ),
  );
  await writeFile(
    path.join(targetRoot, "js/catalog/menu-templates/menu-template-catalog.js"),
    buildAggregateCatalogModule({
      items: catalogs.menus,
      constName: "MENUS_DB",
      lookupName: "MENU_TEMPLATE_BY_ID",
    }),
    "utf8",
  );

  await Promise.all(
    catalogs.routines.map((routine) =>
      writeFile(
        path.join(targetRoot, "js/catalog/routine-templates", routine.sourceFile),
        buildDefaultExportModule(stripSourceFile(routine)),
        "utf8",
      ),
    ),
  );
  await writeFile(
    path.join(targetRoot, "js/catalog/routine-templates/routine-template-catalog.js"),
    buildAggregateCatalogModule({
      items: catalogs.routines,
      constName: "ROUTINES_DB",
      lookupName: "ROUTINE_TEMPLATE_BY_ID",
    }),
    "utf8",
  );

  await Promise.all(
    catalogs.profiles.map((profile) =>
      writeFile(
        path.join(targetRoot, "js/catalog/profile-presets", profile.sourceFile),
        buildDefaultExportModule(stripSourceFile(profile)),
        "utf8",
      ),
    ),
  );
  await writeFile(
    path.join(targetRoot, "js/catalog/profile-presets/profile-preset-catalog.js"),
    buildAggregateCatalogModule({
      items: catalogs.profiles,
      constName: "PROFILES_DB",
      lookupName: "PROFILE_BY_ID",
    }),
    "utf8",
  );
}

function buildMenuFromRows(row, itemRows) {
  const orderedRows = [...itemRows].sort(compareCompositeRows([
    "mealKey",
    "blockIndex",
    "itemIndex",
  ]));

  const mealBlocks = new Map();
  for (const mealKey of MEAL_KEYS) {
    mealBlocks.set(mealKey, []);
  }

  for (const itemRow of orderedRows) {
    const mealKey = requiredString(itemRow.mealKey, "menuItems.mealKey");
    if (!mealBlocks.has(mealKey)) {
      throw new Error(`mealKey invalido en menu_items.csv: "${mealKey}".`);
    }

    const blockIndex = integerValue(itemRow.blockIndex, "menuItems.blockIndex");
    const blocks = mealBlocks.get(mealKey);
    if (!blocks[blockIndex]) {
      blocks[blockIndex] = {
        recipeId: nullableString(itemRow.recipeId),
        labelKey: nullableString(itemRow.labelKey),
        items: [],
      };
    }

    blocks[blockIndex].items.push({
      foodId: requiredString(itemRow.foodId, "menuItems.foodId"),
      amount: numberValue(itemRow.amount, "menuItems.amount"),
    });
  }

  return {
    id: requiredString(row.id, "menus.id"),
    sourceFile: nullableString(row.sourceFile) ?? deriveSourceFileName("menu", row.id),
    labelKey: requiredString(row.labelKey, "menus.labelKey"),
    descriptionKey: requiredString(row.descriptionKey, "menus.descriptionKey"),
    meals: {
      hydration: {
        items: (mealBlocks.get("hydration")[0]?.items ?? []).map(clone),
      },
      breakfast: compactBlocks(mealBlocks.get("breakfast")),
      lunch: compactBlocks(mealBlocks.get("lunch")),
      dinner: compactBlocks(mealBlocks.get("dinner")),
    },
  };
}

function buildRoutineFromRows(row, itemRows) {
  const itemsBySection = new Map();
  for (const sectionKey of ACTIVITY_SECTION_KEYS) {
    itemsBySection.set(sectionKey, []);
  }

  for (const itemRow of [...itemRows].sort(compareCompositeRows(["sectionKey", "itemIndex"]))) {
    const sectionKey = requiredString(itemRow.sectionKey, "routineItems.sectionKey");
    if (!itemsBySection.has(sectionKey)) {
      itemsBySection.set(sectionKey, []);
    }

    itemsBySection.get(sectionKey).push(buildRoutineItemFromRow(itemRow));
  }

  const customSectionKeys = [...itemsBySection.keys()].filter(
    (sectionKey) => !ACTIVITY_SECTION_KEYS.includes(sectionKey),
  );

  return {
    id: requiredString(row.id, "routines.id"),
    sourceFile:
      nullableString(row.sourceFile) ?? deriveSourceFileName("routine", row.id),
    labelKey: requiredString(row.labelKey, "routines.labelKey"),
    descriptionKey: requiredString(row.descriptionKey, "routines.descriptionKey"),
    sections: [
      ...ACTIVITY_SECTION_KEYS.map((sectionKey) => ({
        sectionKey,
        items: itemsBySection.get(sectionKey) ?? [],
      })),
      ...customSectionKeys.map((sectionKey) => ({
        sectionKey,
        items: itemsBySection.get(sectionKey) ?? [],
      })),
    ],
  };
}

function buildProfileFromRows({
  row,
  weeklyPlanRows,
}) {
  const weeklyPlan = Object.fromEntries(
    [...weeklyPlanRows]
      .sort(compareCompositeRows(["dayKey"]))
      .map((planRow) => [
        requiredString(planRow.dayKey, "profileWeeklyPlan.dayKey"),
        {
          menuTemplateId: requiredString(
            planRow.menuTemplateId,
            "profileWeeklyPlan.menuTemplateId",
          ),
          routineTemplateId: requiredString(
            planRow.routineTemplateId,
            "profileWeeklyPlan.routineTemplateId",
          ),
          targetTuning: targetTuningFromRow(planRow, "profileWeeklyPlan"),
        },
      ]),
  );

  return {
    id: requiredString(row.id, "profiles.id"),
    sourceFile:
      nullableString(row.sourceFile) ?? deriveSourceFileName("profile", row.id),
    labelKey: requiredString(row.labelKey, "profiles.labelKey"),
    descriptionKey: requiredString(row.descriptionKey, "profiles.descriptionKey"),
    userPreset: {
      sex: requiredString(row.sex, "profiles.sex"),
      targetBaseKcal: numberValue(row.targetBaseKcal, "profiles.targetBaseKcal"),
    },
    fallbackTargetTuning: fallbackTargetTuningFromRow(row),
    weeklyPlan,
  };
}

function menuToMenuItemRows(menu) {
  const rows = [];

  menu.meals.hydration.items.forEach((item, itemIndex) => {
    rows.push({
      menuId: menu.id,
      mealKey: "hydration",
      blockIndex: 0,
      itemIndex,
      recipeId: null,
      labelKey: null,
      foodId: item.foodId,
      amount: item.amount,
    });
  });

  for (const mealKey of ["breakfast", "lunch", "dinner"]) {
    (menu.meals[mealKey] ?? []).forEach((block, blockIndex) => {
      block.items.forEach((item, itemIndex) => {
        rows.push({
          menuId: menu.id,
          mealKey,
          blockIndex,
          itemIndex,
          recipeId: block.recipeId,
          labelKey: block.labelKey,
          foodId: item.foodId,
          amount: item.amount,
        });
      });
    });
  }

  return rows;
}

function buildRoutineItemFromRow(itemRow) {
  const metric = requiredString(itemRow.metric, "routineItems.metric");

  if (metric === "steps") {
    return {
      exerciseId: requiredString(itemRow.exerciseId, "routineItems.exerciseId"),
      prescription: {
        metric,
        min: nullableNumberValue(itemRow.min, "routineItems.min"),
        cadencePerMin: nullableNumberValue(
          itemRow.cadencePerMin,
          "routineItems.cadencePerMin",
        ),
      },
      notes: nullableString(itemRow.notes),
    };
  }

  if (metric === "duration") {
    return {
      exerciseId: requiredString(itemRow.exerciseId, "routineItems.exerciseId"),
      prescription: {
        metric,
        durationSec: nullableNumberValue(
          itemRow.durationSec,
          "routineItems.durationSec",
        ),
        cadencePerMin: nullableNumberValue(
          itemRow.cadencePerMin,
          "routineItems.cadencePerMin",
        ),
      },
      notes: nullableString(itemRow.notes),
    };
  }

  return {
    exerciseId: requiredString(itemRow.exerciseId, "routineItems.exerciseId"),
    prescription: {
      metric: "strength",
      sets: nullableNumberValue(itemRow.sets, "routineItems.sets"),
      reps: nullableString(itemRow.reps),
      loadKg: nullableNumberValue(itemRow.loadKg, "routineItems.loadKg"),
      rir: nullableNumberValue(itemRow.rir, "routineItems.rir"),
      secPerRep: nullableNumberValue(itemRow.secPerRep, "routineItems.secPerRep"),
      restSec: nullableNumberValue(itemRow.restSec, "routineItems.restSec"),
    },
    notes: nullableString(itemRow.notes),
  };
}

function routineToItemRows(routine) {
  return (routine.sections ?? []).flatMap((section) =>
    (section.items ?? []).map((item, itemIndex) => ({
      routineId: routine.id,
      sectionKey: section.sectionKey,
      itemIndex,
      exerciseId: item.exerciseId,
      metric: item.prescription?.metric ?? null,
      min: item.prescription?.min ?? null,
      durationSec: item.prescription?.durationSec ?? null,
      cadencePerMin: item.prescription?.cadencePerMin ?? null,
      sets: item.prescription?.sets ?? null,
      reps: item.prescription?.reps ?? null,
      loadKg: item.prescription?.loadKg ?? null,
      rir: item.prescription?.rir ?? null,
      secPerRep: item.prescription?.secPerRep ?? null,
      restSec: item.prescription?.restSec ?? null,
      notes: item.notes,
    })),
  );
}

async function discoverSourceFiles({
  sourceRoot,
  relativeDir,
  ignoredFiles,
}) {
  const directory = path.join(sourceRoot, relativeDir);
  const entries = await readdir(directory, { withFileTypes: true });
  const fileMap = new Map();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js") || ignoredFiles.has(entry.name)) {
      continue;
    }

    const modulePath = path.join(directory, entry.name);
    const module = await importFresh(modulePath);
    if (module.default?.id) {
      fileMap.set(module.default.id, entry.name);
    }
  }

  return fileMap;
}

function buildFlatCatalogModule(constName, lookupName, items) {
  return [
    'import { createLookup } from "../shared/collection-utils.js";',
    "",
    `export const ${constName} = ${JSON.stringify(items, null, 2)};`,
    "",
    `export const ${lookupName} = createLookup(${constName});`,
    "",
  ].join("\n");
}

function buildDefaultExportModule(value) {
  return `export default ${JSON.stringify(value, null, 2)};\n`;
}

function buildAggregateCatalogModule({
  items,
  constName,
  lookupName,
}) {
  const importLines = items.map((item) => {
    const identifier = toIdentifier(item.id);
    return `import ${identifier} from "./${item.sourceFile}";`;
  });

  const itemList = items.map((item) => `  ${toIdentifier(item.id)},`);

  return [
    'import { createLookup } from "../../shared/collection-utils.js";',
    "",
    ...importLines,
    "",
    `export const ${constName} = [`,
    ...itemList,
    "];",
    "",
    `export const ${lookupName} = createLookup(${constName});`,
    "",
  ].join("\n");
}

function validateUniqueIds(label, items, errors) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`Hay ids duplicados en ${label}: "${item.id}".`);
    }
    seen.add(item.id);
  }
}

function validateMacroRatios(label, macroRatios, errors) {
  const sum =
    macroRatios.protein + macroRatios.carbs + macroRatios.fat;

  if (Math.abs(sum - 1) > 0.0001) {
    errors.push(`${label} tiene macros que no suman 1. Valor actual: ${sum}.`);
  }
}

function validateSecondary(label, secondary, errors) {
  for (const column of SECONDARY_COLUMNS) {
    if (!isFiniteNumber(secondary?.[column]) || Number(secondary[column]) < 0) {
      errors.push(`${label} tiene ${column} invalido: "${secondary?.[column]}".`);
    }
  }
}

function isFiniteNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function targetTuningToRow(targetTuning, secondaryPresets) {
  return {
    kcalDeltaPct: targetTuning.kcalDeltaPct,
    protein: targetTuning.macroRatios.protein,
    carbs: targetTuning.macroRatios.carbs,
    fat: targetTuning.macroRatios.fat,
    ...targetSecondaryToRow(targetTuning.secondary, secondaryPresets),
  };
}

function targetSecondaryToRow(secondary, secondaryPresets) {
  return {
    secondaryPresetKey: inferSecondaryPresetKey(secondary, secondaryPresets),
    ...secondaryToRow(secondary),
  };
}

function targetTuningFromRow(row, label) {
  return {
    kcalDeltaPct: numberValue(row.kcalDeltaPct, `${label}.kcalDeltaPct`),
    macroRatios: {
      protein: numberValue(row.protein, `${label}.protein`),
      carbs: numberValue(row.carbs, `${label}.carbs`),
      fat: numberValue(row.fat, `${label}.fat`),
    },
    secondary: secondaryFromRow(row, label),
  };
}

function fallbackTargetTuningFromRow(row) {
  return {
    kcalDeltaPct: numberValue(
      row.fallbackKcalDeltaPct,
      "profiles.fallbackKcalDeltaPct",
    ),
    macroRatios: {
      protein: numberValue(row.fallbackProtein, "profiles.fallbackProtein"),
      carbs: numberValue(row.fallbackCarbs, "profiles.fallbackCarbs"),
      fat: numberValue(row.fallbackFat, "profiles.fallbackFat"),
    },
    secondary: secondaryFromRow(row, "profiles"),
  };
}

function secondaryToRow(secondary = {}) {
  return Object.fromEntries(
    SECONDARY_COLUMNS.map((column) => [column, secondary[column] ?? null]),
  );
}

function secondaryFromRow(row, label) {
  return Object.fromEntries(
    SECONDARY_COLUMNS.map((column) => [
      column,
      numberValue(row[column], `${label}.${column}`),
    ]),
  );
}

function deriveSecondaryPresetsFromProfiles(profiles) {
  const presets = {};

  for (const profile of profiles) {
    const key = inferSecondaryPresetKeyFromProfileId(profile.id);

    if (!key) {
      continue;
    }

    const secondary = profile.fallbackTargetTuning?.secondary;

    if (!secondary) {
      throw new Error(
        `El perfil "${profile.id}" no define fallbackTargetTuning.secondary.`,
      );
    }

    if (presets[key] && !deepEqual(presets[key], secondary)) {
      throw new Error(
        `Los perfiles con secondaryPresetKey "${key}" no comparten el mismo secondary.`,
      );
    }

    presets[key] = clone(secondary);
  }

  return presets;
}

function inferSecondaryPresetKeyFromProfileId(profileId) {
  if (profileId.startsWith("weight_loss_")) {
    return "weight_loss";
  }

  if (profileId.startsWith("standard_")) {
    return "standard";
  }

  if (profileId.startsWith("muscle_gain_")) {
    return "gain";
  }

  return null;
}

function inferSecondaryPresetKey(secondaryValue, secondaryPresets) {
  for (const [key, preset] of Object.entries(secondaryPresets)) {
    if (deepEqual(secondaryValue, preset)) {
      return key;
    }
  }

  return "";
}

function compactBlocks(blocks) {
  return blocks.filter(Boolean).map((block) => ({
    recipeId: block.recipeId ?? null,
    labelKey: block.labelKey ?? null,
    items: block.items.map(clone),
  }));
}

function groupRows(rows, key) {
  const grouped = new Map();
  for (const row of rows) {
    const groupKey = row[key];
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey).push(row);
  }
  return grouped;
}

function compareCompositeRows(fields) {
  return (left, right) => {
    for (const field of fields) {
      const leftValue = getComparableValue(field, left[field]);
      const rightValue = getComparableValue(field, right[field]);
      if (leftValue !== rightValue) {
        return leftValue < rightValue ? -1 : 1;
      }
    }
    return 0;
  };
}

function getComparableValue(field, value) {
  if (field === "dayKey") {
    return DAY_KEYS.indexOf(value);
  }

  if (field === "mealKey") {
    return MEAL_KEYS.indexOf(value);
  }

  if (field === "sectionKey") {
    const index = ACTIVITY_SECTION_KEYS.indexOf(value);
    return index === -1 ? ACTIVITY_SECTION_KEYS.length : index;
  }

  return Number(value ?? 0);
}

function stripSourceFile(item) {
  const { sourceFile, ...rest } = item;
  return rest;
}

function deriveSourceFileName(kind, id) {
  const rawSlug =
    kind === "menu"
      ? removePrefix(id, "menu_")
      : kind === "routine"
        ? removePrefix(id, "activity_")
        : id;

  const prefix =
    kind === "menu"
      ? "menu-template-"
      : kind === "routine"
        ? "routine-template-"
        : "profile-preset-";

  return `${prefix}${rawSlug.replaceAll("_", "-")}.js`;
}

function removePrefix(value, prefix) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function toIdentifier(value) {
  return value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^[^a-zA-Z_$]+/, "_");
}

async function importFresh(modulePath) {
  const moduleUrl = pathToFileURL(modulePath);
  moduleUrl.searchParams.set("ts", `${Date.now()}-${Math.random()}`);
  return import(moduleUrl.href);
}

async function copyFile(sourcePath, targetPath) {
  await writeFile(targetPath, await readFile(sourcePath, "utf8"), "utf8");
}

function requiredString(value, label) {
  if (value === null || value === undefined || value === "") {
    throw new Error(`Falta un valor obligatorio para ${label}.`);
  }
  return value;
}

function nullableString(value) {
  return value === "" || value === undefined ? null : value;
}

function numberValue(value, label) {
  const parsed = Number(normalizeNumberString(value));
  if (Number.isNaN(parsed)) {
    throw new Error(`Numero invalido para ${label}: "${value}".`);
  }
  return parsed;
}

function integerValue(value, label) {
  const parsed = numberValue(value, label);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Se esperaba entero en ${label}: "${value}".`);
  }
  return parsed;
}

function nullableNumberValue(value, label) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }
  return numberValue(value, label);
}

function normalizeNumberString(value) {
  if (typeof value === "number") {
    return String(value);
  }

  const normalized = String(value).trim();
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      return normalized.replaceAll(".", "").replace(",", ".");
    }

    return normalized.replaceAll(",", "");
  }

  if (hasComma) {
    return normalized.replace(",", ".");
  }

  return normalized;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
