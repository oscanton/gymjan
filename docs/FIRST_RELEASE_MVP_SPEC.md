# GymJan First Release MVP Spec

## Purpose

Status: `single source of truth`

This document is the only specification needed to start GymJan from zero and implement a functional first release / MVP.

It is written to be sufficient for:

- creating the project structure
- implementing the core domain
- implementing persistence
- implementing the connector
- implementing the first UI
- preparing the first seed data
- starting validation and refinement with a stable base

This document intentionally does not depend on any previous rebuild notes, repo history, or architectural references.

If any implementation decision is not explicitly defined elsewhere in code, this document is the reference.

---

## 1. Product Definition

GymJan is a local-first, vanilla-code PWA for planning and evaluating:

- user body data
- weekly activity plans
- weekly nutrition plans
- daily targets
- daily assessments
- shopping list generation

The MVP works on planned data, not on real historical tracking.

The MVP must let the user:

- define body data: weight, height, age, sex
- choose language
- choose a weekly profile
- edit daily activity
- edit daily nutrition
- see daily derived metrics in real time
- see a weekly summary
- generate a shopping list from the editable weekly nutrition plan

The MVP must not include yet:

- historical tracking by real date
- real daily logging
- weight history charts
- advanced automation
- complex theming

---

## 2. Product Priorities

The implementation must optimize in this order:

1. Efficiency
2. Lightness
3. Speed
4. Simplicity
5. Robustness
6. Readability

Interpretation:

- the app must load fast
- the code must stay compact
- the architecture must not become over-fragmented
- fixes must be easy to apply without cascading rewrites
- the UI must never own business logic

---

## 3. Technical Principles

1. The core is pure business logic.
2. The UI never calculates business results.
3. The connector is the only bridge between UI and core.
4. Static reference data lives outside the core.
5. Text visible to the user is fully translatable.
6. Persist user inputs and selections, not derived outputs unless explicitly justified.
7. Use a compact file structure and split only when a file genuinely becomes too large.
8. The first UI is functional and simple, not visually ambitious.
9. The project must be mobile-first in behavior, while still usable on larger screens.
10. IDs are technical and always in English.

---

## 4. System Architecture

The architecture is:

`Inputs + Databases -> Core -> Connector -> UI`

### Layers

#### Databases

Static technical data:

- foods
- exercises
- profiles
- menu templates
- activity templates
- i18n content

#### Core

Pure domain logic:

- user calculations
- activity calculations
- nutrition calculations
- target calculations
- assessment
- scoring

#### Connector

Application boundary:

- commands
- queries
- persistence orchestration
- payload normalization
- output assembly for UI

#### UI

Presentation:

- render
- user interaction
- form handling
- view switching

#### Persistence

Local-first state:

- localStorage in MVP
- versioned keys
- no hidden business logic

### Runtime Flow

```text
User input
  -> UI event
  -> connector command
  -> storage update
  -> core recomputation through connector query
  -> normalized output
  -> UI render
```

---

## 5. Project Structure

This is the mandatory initial structure for the first release.

Note:

- the tree below reflects the original MVP bootstrap layout
- as the codebase grows, exact file and folder names may evolve
- the active repository naming source of truth is the `File And Folder Naming Policy`
- the current layered direction is `js/application`, `js/domain`, `js/catalog`, `js/locales`, `js/ui`, `js/shared`

```text
/
  index.html
  manifest.json
  sw.js

  css/
    app.css
    components.css

  js/
    app.js

    app/
      connector.js
      storage.js
      i18n.js
      pwa.js
      config.js

    core/
      user.core.js
      activity.core.js
      nutrition.core.js
      targets.core.js
      assessment.core.js
      scores.core.js
      contracts.js
      utils.js

    data/
      foods.db.js
      exercises.db.js
      profiles.db.js
      menus.db.js
      activities.db.js

    i18n/
      es.js
      en.js
      content.es.js
      content.en.js

    ui/
      screens.js
      render.js
      bindings.js
      formatters.js

  docs/
    FIRST_RELEASE_MVP_SPEC.md
```

### File Responsibilities

#### `index.html`

- root HTML shell
- app mount point
- load CSS and `js/app.js`

#### `manifest.json`

- PWA metadata

#### `sw.js`

- offline asset caching

#### `css/app.css`

- global layout and variables

#### `css/components.css`

- reusable visual components

#### `js/app.js`

- app bootstrap
- initialize i18n, connector, pwa
- load state and render the first screen

#### `js/app/connector.js`

- single public app API
- contains commands and queries conceptually
- no DOM access

#### `js/app/storage.js`

- localStorage wrapper
- versioned keys
- state loading and saving

#### `js/app/i18n.js`

- locale selection
- text translation
- content translation

#### `js/app/pwa.js`

- register service worker

#### `js/app/config.js`

- app constants and defaults

#### `js/core/*.core.js`

- one file per major domain
- pure functions only

#### `js/core/contracts.js`

- builders
- shape normalizers
- empty state helpers

#### `js/core/utils.js`

- shared pure helpers

#### `js/data/*.db.js`

- static technical data and templates

#### `js/i18n/*.js`

- UI locale bundles
- content bundles

#### `js/ui/screens.js`

- screen routing model
- current screen selection

#### `js/ui/render.js`

- convert view model to HTML

#### `js/ui/bindings.js`

- event listeners
- UI to connector bridge

#### `js/ui/formatters.js`

- formatting and visual status mapping

---

## 6. Canonical Enums and Naming

### Locales

- `es`
- `en`

### Sex

- `male`
- `female`

### Day Keys

- `monday`
- `tuesday`
- `wednesday`
- `thursday`
- `friday`
- `saturday`
- `sunday`

### Meal Keys

- `hydration`
- `breakfast`
- `lunch`
- `dinner`

### Activity Blocks

- `steps`
- `gym`
- `extra`

### Exercise Types

- `strength`
- `cardio`
- `mobility`
- `recovery`
- `other`

### Exercise Focus

- `upper_body`
- `lower_body`
- `core`
- `full_body`
- `mobility`
- `recovery`
- `general`

### Assessment Status

- `ok`
- `warning`
- `danger`
- `critical`
- `none`

### Score Verdict

- `very_good`
- `good`
- `ok`
- `to_improve`
- `bad`

### Naming Rules

- technical IDs: English, `snake_case`
- JS fields: `camelCase`
- i18n keys: English, dotted notation
- no accented characters in technical IDs or file names

### File And Folder Naming Policy

The repository naming policy must optimize for discoverability and long-term growth.

- file and folder names use `kebab-case`
- no two files in the repository should share the same basename
- folders name the layer or collection, files name the concrete responsibility
- avoid generic file names such as `utils`, `shared`, `defs`, `index`, `config`, `render`
- prefer explicit responsibility suffixes such as `-calculator`, `-evaluator`, `-repository`, `-resolver`, `-catalog`, `-runtime`, `-bindings`, `-formatters`
- application orchestration lives under `js/application/`
- pure business logic lives under `js/domain/`
- static reference data lives under `js/catalog/`
- locale bundles live under `js/locales/`
- visual presentation lives under `js/ui/`
- transversal helpers must be split by concern under `js/shared/`

Examples of preferred naming:

- `activity-calculator.js`
- `target-calculator.js`
- `profile-preset-catalog.js`
- `menu-template-weightloss-2b.js`
- `ui-renderer.js`
- `ui-text-es.js`

---

## 7. Data Model

## 7.1 Food Record

Every food record must follow this shape:

```js
{
  id: "oats",
  categoryId: "grains_legumes_tubers",
  unit: "g",
  nutritionMode: "per_100",
  nutrients: {
    kcal: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    saturatedFat: 1.2,
    fiber: 10.6,
    sugar: 0.9,
    sodiumMg: 2
  },
  waterMl: 10,
  processingScore: 1,
  descriptionKey: "foods.oats.description"
}
```

### Mandatory fields

- `id`
- `categoryId`
- `unit`
- `nutritionMode`
- `nutrients.kcal`
- `nutrients.protein`
- `nutrients.carbs`
- `nutrients.fat`
- `nutrients.saturatedFat`
- `nutrients.fiber`
- `nutrients.sugar`
- `nutrients.sodiumMg`
- `waterMl`
- `processingScore`
- `descriptionKey`

### Food rules

- `nutritionMode` is `"per_100"` or `"per_unit"`
- `processingScore` is a 0-10 scale
- sodium is always stored as `sodiumMg`
- salt is never stored, only derived
- foods with `categoryId: "beverages"` are treated as drinks
- liquid foods measured in `ml` are also treated as drinks
- `water` is identified by `id: "water"`

## 7.2 Exercise Record

```js
{
  id: "bench_press",
  type: "strength",
  focus: "upper_body",
  met: 5.5,
  relativeLoad: 0.42,
  cadenceBase: null,
  defaultSecPerRep: 4,
  defaultRestSec: 120,
  descriptionKey: "exercises.bench_press.description",
  techniqueKey: "exercises.bench_press.technique"
}
```

### Mandatory fields

- `id`
- `type`
- `focus`
- `met`
- `relativeLoad`
- `cadenceBase`
- `defaultSecPerRep`
- `defaultRestSec`
- `descriptionKey`
- `techniqueKey`

### Exercise rules

- `met` must be positive
- `relativeLoad` is mainly relevant for strength
- `cadenceBase` is mainly relevant for cardio or repetitive movement
- `defaultSecPerRep` and `defaultRestSec` are allowed to be `null` if not applicable

## 7.3 Profile Record

The profile is a weekly preset of daily template references and target tuning.

```js
{
  id: "weight_loss_female_1500",
  labelKey: "profiles.weight_loss_female_1500.label",
  descriptionKey: "profiles.weight_loss_female_1500.description",
  userPreset: {
    sex: "female",
    targetBaseKcal: 1500
  },
  fallbackTargetTuning: {
    kcalDeltaPct: 0,
    macroRatios: {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.30
    },
    secondary: {
      saltMaxG: 5,
      fiberPer1000Kcal: 14,
      sugarMaxPctKcal: 0.10,
      saturatedFatMaxPctKcal: 0.10,
      processingMaxScore: 3.5,
      hydrationBaseMl: 2000,
      hydrationMinMlPerKg: 30,
      hydrationMaxMlPerKg: 35,
      hydrationActivityMlPerMin: 10
    }
  },
  weeklyPlan: {
    monday: {
      menuTemplateId: "menu_weightloss_2b",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: {
        kcalDeltaPct: 0,
        macroRatios: {
          protein: 0.35,
          carbs: 0.35,
          fat: 0.30
        },
        secondary: {
          saltMaxG: 5,
          fiberPer1000Kcal: 14,
          sugarMaxPctKcal: 0.10,
          saturatedFatMaxPctKcal: 0.10,
          processingMaxScore: 3.5,
          hydrationBaseMl: 2000,
          hydrationMinMlPerKg: 30,
          hydrationMaxMlPerKg: 35,
          hydrationActivityMlPerMin: 10
        }
      }
    }
  }
}
```

### Profile rules

- `weeklyPlan` must include all 7 day keys
- macro ratios must sum to `1`
- day target tuning overrides fallback tuning
- user overrides will be applied on top of the resolved daily profile tuning

## 7.4 Menu Template Record

```js
{
  id: "menu_weightloss_2b",
  meals: {
    hydration: {
      items: [
        { foodId: "water", amount: 1500 }
      ]
    },
    breakfast: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "coffee", amount: 1 },
          { foodId: "plain_yogurt", amount: 200 }
        ]
      }
    ],
    lunch: [],
    dinner: []
  }
}
```

## 7.5 Activity Template Record

```js
{
  id: "activity_gymfullbody_4c",
  steps: {
    minDailySteps: 8000,
    plannedSteps: 10000,
    cadencePerMin: 100
  },
  gym: {
    items: [
      {
        exerciseId: "bench_press",
        sets: 4,
        reps: "6-10",
        loadKg: 30,
        rir: 2,
        secPerRep: null,
        restSec: null
      }
    ]
  },
  extra: {
    items: []
  }
}
```

---

## 8. Persisted State

## 8.1 User Context

```js
{
  locale: "es",
  profileId: "weight_loss_female_1500",
  user: {
    weightKg: 62,
    heightCm: 165,
    ageYears: 31,
    sex: "female"
  }
}
```

## 8.2 User Target Adjustments

```js
{
  kcalDeltaPct: 0,
  macroRatios: {
    protein: 0.35,
    carbs: 0.35,
    fat: 0.30
  },
  secondary: {
    saltMaxG: 5,
    fiberPer1000Kcal: 14,
    sugarMaxPctKcal: 0.10,
    saturatedFatMaxPctKcal: 0.10,
    processingMaxScore: 3.5,
    hydrationBaseMl: 2000,
    hydrationMinMlPerKg: 30,
    hydrationMaxMlPerKg: 35,
    hydrationActivityMlPerMin: 10
  }
}
```

All fields are optional at persistence time. Missing values are resolved against the selected profile and daily tuning.

## 8.3 Day Template Selection State

```js
{
  monday: {
    menuTemplateId: "menu_weightloss_2b",
    activityTemplateId: "activity_gymfullbody_4c"
  },
  tuesday: {
    menuTemplateId: "menu_weightloss_2b",
    activityTemplateId: "activity_rest_1a"
  }
}
```

This stores the current editable weekly selection independent from the base profile definition.

## 8.4 Editable Day Activity Input

```js
{
  dayKey: "monday",
  steps: {
    minDailySteps: 8000,
    plannedSteps: 10000,
    cadencePerMin: 100
  },
  gym: {
    items: [
      {
        exerciseId: "bench_press",
        sets: 4,
        reps: "6-10",
        loadKg: 30,
        rir: 2,
        secPerRep: null,
        restSec: null
      }
    ]
  },
  extra: {
    items: [
      {
        exerciseId: "spinning",
        durationSec: 1800,
        cadencePerMin: 90,
        sets: null,
        reps: null,
        loadKg: null,
        rir: null,
        secPerRep: null,
        restSec: null,
        notes: null
      }
    ]
  }
}
```

### Activity input rules

- `steps`, `gym`, and `extra` always exist
- `gym.items` and `extra.items` can be empty arrays
- if `secPerRep` or `restSec` are `null`, the exercise defaults are used

## 8.5 Editable Day Nutrition Input

```js
{
  dayKey: "monday",
  meals: {
    hydration: {
      items: [
        { foodId: "water", amount: 1500 }
      ]
    },
    breakfast: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "coffee", amount: 1 },
          { foodId: "plain_yogurt", amount: 200 }
        ]
      }
    ],
    lunch: [],
    dinner: []
  }
}
```

### Nutrition input rules

- `hydration`, `breakfast`, `lunch`, `dinner` always exist
- recipe blocks are optional, but the structure supports them from day one
- water is treated as a food item from the catalog

## 8.6 Custom Foods

The MVP supports custom foods.

```js
{
  id: "custom_greek_yogurt_001",
  source: "custom",
  categoryId: "dairy",
  unit: "g",
  nutritionMode: "per_100",
  nutrients: {
    kcal: 95,
    protein: 10,
    carbs: 4,
    fat: 4,
    saturatedFat: 2.5,
    fiber: 0,
    sugar: 4,
    sodiumMg: 40
  },
  waterMl: 80,
  processingScore: 3,
  name: "Yogur griego marca X",
  description: null
}
```

## 8.7 Food Equivalences

The MVP supports basic equivalences.

```js
{
  id: "eq_rice_to_potato_01",
  sourceFoodId: "rice",
  targetFoodId: "potato",
  ratio: 2.6,
  basis: "kcal"
}
```

Rules:

- `basis` in MVP is `"kcal"`
- `ratio` means target amount equivalent to 1 unit of source amount

---

## 9. Core Formulas

All formulas in this section are frozen for MVP unless explicitly changed later.

## 9.1 User Core

### BMI

```text
bmi = weightKg / ((heightCm / 100) ^ 2)
```

Rounded to 1 decimal for presentation.

### BMI Category

- `< 18.5` -> `underweight`
- `< 25` -> `normal`
- `< 30` -> `overweight`
- `< 35` -> `obesity`
- `>= 35` -> `severe_obesity`

### BMR

Use Mifflin-St Jeor.

```text
male   -> bmr = 10*weightKg + 6.25*heightCm - 5*ageYears + 5
female -> bmr = 10*weightKg + 6.25*heightCm - 5*ageYears - 161
```

Round to integer.

Implementation requirement:

- the code must include a comment stating explicitly that Mifflin-St Jeor is used

## 9.2 Activity Core

### Basal Activity

```text
basalKcal = bmr * 1.2
```

### Steps

Defaults:

- default walk MET = `3.5`
- default walk cadence = `100`

Formula:

```text
stepsMinutes = plannedSteps / cadencePerMin
stepsCadenceFactor = clamp(cadencePerMin / 100, 0.85, 1.25)
stepsMet = 3.5 * stepsCadenceFactor
stepsKcal = stepsMet * weightKg * stepsMinutes / 60
```

### Strength Item

Used for items whose resolved exercise type is `strength`.

Parse reps:

- if reps is a number, use it
- if reps is a range string like `6-10`, use the average

Resolved values:

- `secPerRepResolved = item.secPerRep ?? exercise.defaultSecPerRep ?? 4`
- `restSecResolved = item.restSec ?? exercise.defaultRestSec ?? 90`

Work:

```text
workMinutes = sets * avgReps * secPerRepResolved / 60
restMinutes = max(0, sets - 1) * restSecResolved / 60
```

Load factor:

```text
if relativeLoad and bodyWeightKg and loadKg exist:
  loadFactorRaw = (loadKg / bodyWeightKg) / relativeLoad
  loadFactor = clamp(loadFactorRaw, 0.7, 1.6)
else:
  loadFactor = 1.0
```

RIR factor:

```text
if rir is null:
  rirFactor = 1.0
else:
  rirFactor = clamp(1.20 - (rir * 0.06), 0.75, 1.20)
```

Strength kcal:

```text
strengthWorkKcal = exercise.met * weightKg * workMinutes / 60 * loadFactor * rirFactor
strengthRestKcal = 1.5 * weightKg * restMinutes / 60
strengthTotalKcal = strengthWorkKcal + strengthRestKcal
```

Strength intensity factor:

```text
intensityFactor = round(loadFactor * rirFactor, 2)
```

### Cardio / Mobility / Recovery / Other Item

If the item has `durationSec`, use it directly.

Otherwise:

```text
durationMinutes = sets * avgReps * secPerRepResolved / 60
```

Cadence factor:

```text
if cadencePerMin and exercise.cadenceBase:
  cadenceFactor = clamp(cadencePerMin / cadenceBase, 0.8, 1.3)
else:
  cadenceFactor = 1.0
```

Kcal:

```text
itemKcal = exercise.met * weightKg * durationMinutes / 60 * cadenceFactor
```

Intensity factor:

```text
intensityFactor = round(cadenceFactor, 2)
```

### Block Aggregation

```text
gymKcal = sum(gym item kcal)
gymMinutes = sum(gym item minutes)

extraKcal = sum(extra item kcal)
extraMinutes = sum(extra item minutes)
```

### Activity Totals

```text
activityKcal = stepsKcal + gymKcal + extraKcal
activityMinutes = stepsMinutes + gymMinutes + extraMinutes
totalKcal = basalKcal + activityKcal
```

### Average MET

Weighted by active minutes:

```text
metAvg = weighted average of:
  stepsMet over stepsMinutes
  each item met adjusted by intensity over its own duration
```

### Average Intensity

Weighted by activity minutes excluding basal activity:

```text
intensityAvg = weighted average of:
  stepsCadenceFactor
  gym item intensityFactor
  extra item intensityFactor
```

## 9.3 Nutrition Core

### Per Item Ratio

If `nutritionMode === "per_100"`:

```text
ratio = amount / 100
```

If `nutritionMode === "per_unit"`:

```text
ratio = amount
```

### Nutrient Contribution

For each food item:

```text
itemMetric = nutrientValue * ratio
```

### Salt

```text
saltG = sodiumMg * 2.5 / 1000
```

### Hydration

Hydration direct:

- water items from `meals.hydration.items` where the food id is `water`

Hydration other drinks:

- items from drinks except `water`, from any meal, including `hydration`
- drinks are foods in `categoryId: "beverages"` plus liquid foods measured in `ml`

Hydration from foods:

- water contribution from foods outside `categoryId: "beverages"` across breakfast, lunch, dinner

Total:

```text
hydrationTotalMl = hydrationDirectMl + hydrationFoodMl + hydrationOtherDrinksMl
```

### Processing Score

Weighted by kcal:

```text
processingWeightedSum = sum(food.processingScore * itemKcal)
processingKcalBase = sum(itemKcal)
processingScore = processingWeightedSum / processingKcalBase
```

If total kcal is `0`, processingScore is `0`.

## 9.4 Targets Core

### TDEE

```text
tdee = basalKcal + activityKcal
```

### Daily kcal target

The resolved profile defines a daily `kcalDeltaPct`, and the user can also define `kcalDeltaPct`.

```text
targetKcal = round(tdee * (1 + profileKcalDeltaPct) * (1 + userKcalDeltaPct))
```

### Macro ratios

Resolution order:

1. day profile macro ratios
2. user override ratios if present
3. normalize to sum `1`

### Macro grams

```text
proteinG = round((targetKcal * proteinRatio) / 4)
carbsG   = round((targetKcal * carbsRatio) / 4)
fatG     = round((targetKcal * fatRatio) / 9)
```

### Secondary targets

```text
fiberMinG = round((targetKcal / 1000) * fiberPer1000Kcal, 1)
sugarMaxG = round((targetKcal * sugarMaxPctKcal) / 4, 1)
saturatedFatMaxG = round((targetKcal * saturatedFatMaxPctKcal) / 9, 1)
saltMaxG = round(saltMaxG, 2)
processingMaxScore = round(processingMaxScore, 1)
```

### Hydration targets

```text
hydrationBaseMinByWeight = weightKg * hydrationMinMlPerKg
hydrationBaseMaxByWeight = weightKg * hydrationMaxMlPerKg
hydrationBaseMin = max(hydrationBaseMl, hydrationBaseMinByWeight)
hydrationBaseMax = max(hydrationBaseMin, hydrationBaseMaxByWeight)
hydrationExtraMl = round(activityMinutes * hydrationActivityMlPerMin)
hydrationMinMl = round(hydrationBaseMin + hydrationExtraMl)
hydrationMaxMl = round(hydrationBaseMax + hydrationExtraMl)
```

## 9.5 Assessment Core

### Target Metrics

Used for:

- `kcal`
- `protein`
- `carbs`
- `fat`

Rules by absolute deviation percent:

- `<= 5%` -> `ok`
- `<= 15%` -> `warning`
- `<= 30%` -> `danger`
- `> 30%` -> `critical`

### Min Metrics

Used for:

- `fiber`

Rules:

- actual `>= target` -> `ok`
- actual `>= 90% of target` -> `warning`
- actual `>= 75% of target` -> `danger`
- otherwise -> `critical`

### Max Metrics

Used for:

- `sugar`
- `saturatedFat`
- `saltG`
- `processingScore`

Rules:

- actual `<= target` -> `ok`
- actual `<= 110% of target` -> `warning`
- actual `<= 125% of target` -> `danger`
- otherwise -> `critical`

### Hydration Range

Rules:

- within range -> `ok`
- within 10% outside nearest bound -> `warning`
- within 25% outside nearest bound -> `danger`
- otherwise -> `critical`

## 9.6 Scores Core

The score system must be clear, not opaque.

### Nutrition Score

Start from `10`.

Subtract penalties:

- `kcal`: `abs(deviationPct) / 10 * 0.7`, cap `2.5`
- `protein`:
  - below target: `abs(deviationPct) / 10 * 0.8`, cap `2.0`
  - above target: `abs(deviationPct) / 10 * 0.3`, cap `1.2`
- `carbs`: `abs(deviationPct) / 10 * 0.4`, cap `1.5`
- `fat`: `abs(deviationPct) / 10 * 0.4`, cap `1.5`
- `fiber`: only if below target, `abs(deviationPct) / 10 * 0.9`, cap `2.0`
- `sugar`: only if above target, `abs(deviationPct) / 10 * 0.6`, cap `1.5`
- `saturatedFat`: only if above target, `abs(deviationPct) / 10 * 0.8`, cap `2.0`
- `saltG`: only if above target, `abs(deviationPct) / 10 * 0.6`, cap `1.5`
- `processingScore`: only if above target, `abs(deviationPct) / 10 * 0.8`, cap `1.5`

Formula:

```text
nutritionScore = max(0, 10 - totalNutritionPenalty)
```

### Activity Score

The activity score evaluates plan quality, not real execution.

Components:

- steps: weight `0.30`
- activityKcal vs target activity kcal: weight `0.30`
- metAvg vs target MET `5`: weight `0.20`
- intensityAvg vs target intensity `1.0`: weight `0.20`

Component scoring:

```text
componentScore = clamp((actual / target) * 10, 0, 10)
```

Final:

```text
activityScore =
  stepsScore * 0.30 +
  activityKcalScore * 0.30 +
  metScore * 0.20 +
  intensityScore * 0.20
```

Where:

- step target = `minDailySteps`
- activity kcal target = resolved daily activity target kcal
- met target = `5`
- intensity target = `1.0`

### Total Score

Equal weight:

```text
totalScore = nutritionScore * 0.5 + activityScore * 0.5
```

### Score Verdict

- `>= 9` -> `very_good`
- `>= 7.5` -> `good`
- `>= 6` -> `ok`
- `>= 4` -> `to_improve`
- `< 4` -> `bad`

### Score Status

- `>= 7.5` -> `ok`
- `>= 6` -> `warning`
- `>= 4` -> `danger`
- `< 4` -> `critical`

---

## 10. Derived Contracts

## 10.1 User Derived

```js
{
  weightKg: 62,
  heightCm: 165,
  ageYears: 31,
  sex: "female",
  bmi: 22.8,
  bmiCategory: "normal",
  bmr: 1325
}
```

## 10.2 Activity Derived

```js
{
  dayKey: "monday",
  steps: {
    minDailySteps: 8000,
    plannedSteps: 10000,
    cadencePerMin: 100,
    minutes: 100,
    kcal: 280,
    met: 3.5,
    intensityFactor: 1
  },
  gym: {
    items: [
      {
        exerciseId: "bench_press",
        resolvedType: "strength",
        kcal: 110,
        minutes: 18,
        met: 5.5,
        intensityFactor: 1.22
      }
    ],
    totalKcal: 310,
    totalMinutes: 52
  },
  extra: {
    items: [
      {
        exerciseId: "spinning",
        resolvedType: "cardio",
        kcal: 190,
        minutes: 30,
        met: 8.5,
        intensityFactor: 1.05
      }
    ],
    totalKcal: 190,
    totalMinutes: 30
  },
  activity: {
    basalKcal: 1590,
    stepsKcal: 280,
    gymKcal: 310,
    extraKcal: 190,
    activityKcal: 780,
    totalKcal: 2370,
    activityMinutes: 182,
    metAvg: 5.2,
    intensityAvg: 1.31
  }
}
```

## 10.3 Nutrition Derived

```js
{
  dayKey: "monday",
  meals: {
    hydration: {
      kcal: 0,
      hydrationDirectMl: 1500
    },
    breakfast: {
      kcal: 420,
      protein: 26,
      carbs: 38,
      fat: 12
    },
    lunch: {
      kcal: 610,
      protein: 45,
      carbs: 52,
      fat: 18
    },
    dinner: {
      kcal: 580,
      protein: 38,
      carbs: 44,
      fat: 20
    }
  },
  totals: {
    kcal: 1610,
    protein: 109,
    carbs: 134,
    fat: 50,
    saturatedFat: 10.5,
    fiber: 18.2,
    sugar: 25.1,
    sodiumMg: 1620,
    saltG: 4.05,
    hydrationDirectMl: 1500,
    hydrationFoodMl: 620,
    hydrationOtherDrinksMl: 200,
    hydrationTotalMl: 2320,
    processingScore: 2.2
  }
}
```

## 10.4 Day Targets

```js
{
  dayKey: "monday",
  kcal: 1900,
  macroRatios: {
    protein: 0.35,
    carbs: 0.35,
    fat: 0.30
  },
  protein: 166,
  carbs: 166,
  fat: 63,
  secondary: {
    saltMaxG: 5,
    fiberMinG: 26.6,
    sugarMaxG: 47.5,
    saturatedFatMaxG: 21.1,
    processingMaxScore: 3.5
  },
  hydration: {
    minMl: 2480,
    maxMl: 2790,
    baseMinMl: 2000,
    baseMaxMl: 2310,
    extraMl: 480
  },
  activity: {
    targetKcal: 780
  }
}
```

## 10.5 Day Assessment

```js
{
  dayKey: "monday",
  nutritionChecks: {
    kcal: {
      actual: 1610,
      target: 1900,
      deviationPct: -15.26,
      status: "warning",
      messageKey: "assessment.kcal.below_target"
    },
    fiber: {
      actual: 18.2,
      target: 26.6,
      deviationPct: -31.58,
      status: "critical",
      messageKey: "assessment.fiber.below_min"
    }
  },
  activityChecks: {
    activityKcal: {
      actual: 780,
      target: 780,
      deviationPct: 0,
      status: "ok",
      messageKey: "assessment.activity.on_target"
    }
  },
  flags: [
    "low_fiber",
    "kcal_below_target"
  ]
}
```

## 10.6 Day Scores

```js
{
  nutrition: {
    score: 7.4,
    status: "warning",
    verdict: "ok",
    breakdown: {
      kcal: 0.8,
      protein: 0.2,
      fiber: 1.2,
      sugar: 0.0
    }
  },
  activity: {
    score: 8.1,
    status: "ok",
    verdict: "good",
    breakdown: {
      steps: 8.5,
      activityKcal: 8.0,
      metAvg: 7.9,
      intensityAvg: 8.0
    }
  },
  total: {
    score: 7.75,
    status: "ok",
    verdict: "good",
    weights: {
      nutrition: 0.5,
      activity: 0.5
    }
  }
}
```

## 10.7 Day Output Contract

This is the main UI output contract.

```js
{
  dayKey: "monday",
  input: {
    userContext: {},
    activity: {},
    nutrition: {}
  },
  derived: {
    user: {},
    activity: {},
    nutrition: {},
    targets: {},
    assessment: {},
    scores: {}
  },
  ui: {
    warnings: [],
    errors: []
  }
}
```

## 10.8 Week Output Contract

```js
{
  days: {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {},
    sunday: {}
  },
  weeklySummary: {
    nutritionScoreAvg: 0,
    activityScoreAvg: 0,
    totalScoreAvg: 0,
    targetKcalTotal: 0,
    intakeKcalTotal: 0,
    activityKcalTotal: 0
  }
}
```

## 10.9 Shopping List Output

```js
{
  generatedAt: "week_plan",
  items: [
    {
      itemId: "oats",
      source: "catalog",
      foodId: "oats",
      labelKey: "foods.oats.name",
      amount: 210,
      unit: "g",
      categoryId: "grains_legumes_tubers",
      checked: false
    },
    {
      itemId: "custom_001",
      source: "custom",
      foodId: null,
      label: "Yogur griego marca X",
      amount: 400,
      unit: "g",
      categoryId: "dairy",
      checked: false
    }
  ]
}
```

---

## 11. Connector API

The connector is conceptually divided into commands and queries, but physically lives in the application layer connector module.

## 11.1 Commands

- `saveUserContext(payload)`
- `saveUserTargetAdjustments(payload)`
- `saveDayTemplateSelection(payload)`
- `saveDayActivity(dayKey, payload)`
- `saveDayNutrition(dayKey, payload)`
- `saveCustomFood(payload)`
- `saveFoodEquivalence(payload)`
- `setLocale(locale)`
- `resetDay(dayKey)`
- `resetWeekEditableState()`

### Generic command response

```js
{
  ok: true,
  saved: true,
  errors: [],
  warnings: []
}
```

## 11.2 Queries

- `getUserContext()`
- `getResolvedProfile()`
- `getDayInput(dayKey)`
- `calculateDay(dayKey)`
- `calculateWeek()`
- `getShoppingList()`
- `getReferenceData()`

### Connector rules

- the UI only talks to the connector
- the connector may enrich outputs for UI usage
- the connector may return `messageKeys`, but the pure core does not return final translated strings

---

## 12. Validation Rules

## 12.1 Blocking Errors

- `weightKg <= 0`
- `heightCm <= 0`
- `ageYears <= 0`
- invalid `profileId`
- invalid `foodId`
- invalid `exerciseId`
- macro ratios not summing to `1`
- negative amount
- `plannedSteps < minDailySteps`

## 12.2 Warnings

- `hydrationDirectMl === 0`
- very high `processingScore`
- unrealistic meal macro totals
- `rir` outside expected range
- equivalence with unresolved basis

### Validation Output

```js
{
  errors: [
    {
      code: "invalid_macro_ratios",
      path: "macroRatios",
      messageKey: "errors.invalid_macro_ratios"
    }
  ],
  warnings: [
    {
      code: "low_hydration",
      path: "meals.hydration",
      messageKey: "warnings.low_hydration"
    }
  ]
}
```

---

## 13. Persistence Keys

All keys must be versioned and namespaced.

Use:

```text
gymjan.mvp.v1.user_context
gymjan.mvp.v1.user_target_adjustments
gymjan.mvp.v1.day_template_selection
gymjan.mvp.v1.day_activity.monday
gymjan.mvp.v1.day_activity.tuesday
gymjan.mvp.v1.day_activity.wednesday
gymjan.mvp.v1.day_activity.thursday
gymjan.mvp.v1.day_activity.friday
gymjan.mvp.v1.day_activity.saturday
gymjan.mvp.v1.day_activity.sunday
gymjan.mvp.v1.day_nutrition.monday
gymjan.mvp.v1.day_nutrition.tuesday
gymjan.mvp.v1.day_nutrition.wednesday
gymjan.mvp.v1.day_nutrition.thursday
gymjan.mvp.v1.day_nutrition.friday
gymjan.mvp.v1.day_nutrition.saturday
gymjan.mvp.v1.day_nutrition.sunday
gymjan.mvp.v1.custom_foods
gymjan.mvp.v1.food_equivalences
gymjan.mvp.v1.shopping_state
```

### Shopping State

```js
{
  checkedItemIds: [],
  customItems: []
}
```

---

## 14. Empty Builders

These builders must exist in the domain contracts module.

## 14.1 Empty User Context

```js
{
  locale: "es",
  profileId: null,
  user: {
    weightKg: 0,
    heightCm: 0,
    ageYears: 0,
    sex: "male"
  }
}
```

## 14.2 Empty User Target Adjustments

```js
{
  kcalDeltaPct: null,
  macroRatios: null,
  secondary: null
}
```

## 14.3 Empty Day Template Selection

```js
{
  monday: { menuTemplateId: null, activityTemplateId: null },
  tuesday: { menuTemplateId: null, activityTemplateId: null },
  wednesday: { menuTemplateId: null, activityTemplateId: null },
  thursday: { menuTemplateId: null, activityTemplateId: null },
  friday: { menuTemplateId: null, activityTemplateId: null },
  saturday: { menuTemplateId: null, activityTemplateId: null },
  sunday: { menuTemplateId: null, activityTemplateId: null }
}
```

## 14.4 Empty Day Activity Input

```js
{
  dayKey: "monday",
  steps: {
    minDailySteps: 8000,
    plannedSteps: 8000,
    cadencePerMin: 100
  },
  gym: {
    items: []
  },
  extra: {
    items: []
  }
}
```

## 14.5 Empty Day Nutrition Input

```js
{
  dayKey: "monday",
  meals: {
    hydration: { items: [] },
    breakfast: [],
    lunch: [],
    dinner: []
  }
}
```

---

## 15. Seed Data Minimum for MVP

The MVP does not need the full future catalog to exist on day one, but it must start with a coherent minimum dataset.

## 15.1 Mandatory Initial Profiles

The MVP must ship with exactly these three fully defined profiles:

1. `weight_loss_female_1500`
2. `standard_male_2000`
3. `muscle_gain_male_2300`

## 15.2 Mandatory Initial Foods

At minimum, the seed must include these foods:

- `water`
- `coffee`
- `plain_yogurt`
- `greek_yogurt`
- `oats`
- `banana`
- `apple`
- `berries`
- `chicken_breast`
- `rice`
- `potato`
- `salmon`
- `tuna`
- `egg`
- `olive_oil`
- `wholegrain_bread`
- `tomato`
- `salad`
- `vegetables`
- `milk`

The full future food catalog can be expanded later, but the MVP must include at least these 20.

## 15.3 Mandatory Initial Exercises

At minimum, the seed must include:

- `walk`
- `joint_mobility`
- `bench_press`
- `incline_press`
- `barbell_row`
- `squat`
- `romanian_deadlift`
- `lunges`
- `plank`
- `spinning`
- `running`
- `stretching`

## 15.4 Mandatory Initial Activity Templates

At minimum:

- `activity_gymfullbody_4c`
- `activity_rest_1a`
- `activity_gymlegs_3c`
- `activity_cardio_1a`

## 15.5 Mandatory Initial Menu Templates

At minimum:

- `menu_weightloss_2b`
- `menu_standard_1a`
- `menu_gain_1a`

---

## 16. UI Scope

## 16.1 MVP Validation UI

The first UI is a functional validation UI, not the final styled product.

It must be:

- one long screen
- immediately reactive
- technically transparent
- mobile-first functional

### Sections

- User Context
- Profile Selection
- Day Selector
- Activity Editor
- Nutrition Editor
- Daily Targets
- Daily Results
- Daily Assessment
- Daily Scores
- Weekly Summary
- Shopping List
- Debug Panel

### Real-time Rule

Recalculation happens on every input change.

No manual "recalculate" button is required for the MVP.

## 16.2 Future UI Organization

After the validation MVP is stable, the app can evolve to separated screens:

- profile
- activity
- nutrition
- summary
- shopping

But this must not require changing the connector or core contracts.

---

## 17. Testing Scope

The MVP must include:

- manual validation through the UI
- unit tests for core formulas
- contract tests for connector and storage
- basic UI smoke tests

### Mandatory unit tests

- BMI
- BMR
- steps kcal
- strength kcal
- cardio kcal
- nutrition totals
- hydration totals
- target generation
- assessment statuses
- nutrition score
- activity score
- total score

### Mandatory contract tests

- user context normalization
- day activity normalization
- day nutrition normalization
- profile resolution
- persistence load/save
- calculateDay response shape

---

## 18. Acceptance Criteria for MVP

The first release MVP is considered valid when:

1. The app loads and works offline as a PWA.
2. The user can edit body data and see recalculation immediately.
3. The user can choose one of the three seed profiles.
4. The user can override daily templates.
5. The user can edit daily activity items.
6. The user can edit daily nutrition items.
7. The app calculates:
   - BMI
   - BMR
   - daily activity totals
   - daily nutrition totals
   - daily targets
   - assessment statuses
   - three scores
8. The app shows a weekly summary.
9. The shopping list is generated from the editable nutrition week.
10. The app supports both Spanish and English.
11. No mojibake is present.
12. UI code does not contain business calculations.

---

## 19. Implementation Order

The recommended implementation order is:

1. Create file structure.
2. Implement `config.js`.
3. Implement `contracts.js` with empty builders and normalizers.
4. Implement `storage.js`.
5. Create seed DB files.
6. Implement `i18n.js`.
7. Implement `user.core.js`.
8. Implement `activity.core.js`.
9. Implement `nutrition.core.js`.
10. Implement `targets.core.js`.
11. Implement `assessment.core.js`.
12. Implement `scores.core.js`.
13. Implement `connector.js`.
14. Implement the first validation UI.
15. Add tests.
16. Refine formulas and seed data.

---

## 20. Freeze Rule

For MVP development, the following are frozen unless deliberately revised:

- project structure
- canonical enums
- contracts
- persistence keys
- formulas
- score logic
- three initial profiles
- validation UI scope

This freeze exists so implementation can begin with confidence instead of reopening architecture during the first release phase.
