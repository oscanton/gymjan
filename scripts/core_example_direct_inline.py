import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOODS_CSV = Path(__file__).resolve().parent / 'foods.csv'
FOOD_IDS = ['coffee', 'greek_yogurt', 'chicken', 'rice', 'zucchini', 'fruit', 'salmon', 'cauliflower']
TARGETS = {
    'kcal': 2000, 'protein': 150, 'carbs': 200, 'fat': 60,
    'fiber': 25, 'sugar': 50, 'saturatedFat': 20, 'salt': 5, 'processing': 3.5
}
ENGINES = [
    ROOT / 'js' / 'core' / 'engine' / 'formulas.engine.js',
    ROOT / 'js' / 'core' / 'engine' / 'targets.engine.js',
    ROOT / 'js' / 'core' / 'engine' / 'nutrition-score.engine.js',
]


def load_engines(ctx):
    for path in ENGINES:
        ctx.eval(path.read_text(encoding='utf-8'))


def load_foods_csv(path):
    foods = {}
    with path.open('r', encoding='utf-8', newline='') as handle:
        reader = csv.DictReader(handle, delimiter=',')
        for row in reader:
            food_id = row.get('id')
            if not food_id:
                continue
            nutrition_unit = row.get('nutrition_unit', '').strip()
            nutrition = {
                'kcal': float(row.get('kcal', 0) or 0),
                'protein': float(row.get('protein', 0) or 0),
                'carbs': float(row.get('carbs', 0) or 0),
                'fat': float(row.get('fat', 0) or 0),
                'saturatedFat': float(row.get('saturated_fat', 0) or 0),
                'fiber': float(row.get('fiber', 0) or 0),
                'sugar': float(row.get('sugar', 0) or 0),
                'sodiumMg': float(row.get('sodium', 0) or 0),
            }
            foods[food_id] = {
                'name': row.get('name', '').strip(),
                'category': row.get('category', '').strip(),
                'unit': row.get('unit', '').strip(),
                'nutrition_unit': nutrition_unit,
                'nutritionPerUnit': nutrition if nutrition_unit == 'unit' else None,
                'nutritionPer100': nutrition if nutrition_unit != 'unit' else None,
                'processed': float(row.get('processed', 0) or 0),
            }
    return foods


def main():
    try:
        import quickjs  # pip install quickjs
    except Exception as exc:
        print('ERROR: necesitas instalar quickjs (pip install quickjs).', file=sys.stderr)
        print(f'Detalle: {exc}', file=sys.stderr)
        return 1

    ctx = quickjs.Context()
    load_engines(ctx)

    if not FOODS_CSV.exists():
        print(f'ERROR: No existe el CSV: {FOODS_CSV}', file=sys.stderr)
        return 1
    foods = load_foods_csv(FOODS_CSV)

    missing_ids = [food_id for food_id in FOOD_IDS if food_id not in foods]
    if missing_ids:
        print(f'ERROR: foodId no encontrado en CSV: {", ".join(missing_ids)}', file=sys.stderr)
        return 1
    day_data = {
        'breakfast': {
            'items': [
                {'foodId': 'coffee', 'amount': 1},
                {'foodId': 'greek_yogurt', 'amount': 125},
            ]
        },
        'lunch': {
            'items': [
                {'foodId': 'chicken', 'amount': 220},
                {'foodId': 'rice', 'amount': 125},
                {'foodId': 'zucchini', 'amount': 125},
                {'foodId': 'fruit', 'amount': 80},
            ]
        },
        'dinner': {
            'items': [
                {'foodId': 'salmon', 'amount': 200},
                {'foodId': 'cauliflower', 'amount': 200},
            ]
        }
    }

    # Inyectar datos en el contexto JS
    ctx.eval(f"const FOODS_INPUT = {json.dumps(foods)};")
    ctx.eval(f"const DAY_DATA = {json.dumps(day_data)};")
    ctx.eval(f"const TARGETS = {json.dumps(TARGETS)};")

    ctx.eval("""
        const mealKeys = ['breakfast','lunch','dinner'];
        const mealTotals = {};
        mealKeys.forEach((key) => {
            const items = (DAY_DATA[key] && DAY_DATA[key].items) ? DAY_DATA[key].items : [];
            mealTotals[key] = FormulasEngine.calculateMeal(items, FOODS_INPUT);
        });
        const totals = FormulasEngine.calculateDayTotals(DAY_DATA, FOODS_INPUT, mealKeys);
        const score = NutritionScoreEngine.calculate({
            kcal: totals.kcal,
            protein: totals.protein,
            carbs: totals.carbs,
            fat: totals.fat,
            fiber: totals.fiber,
            sugar: totals.sugar,
            saturatedFat: totals.saturatedFat,
            salt: totals.salt,
            processing: totals.processingAvg
        }, TARGETS);
        globalThis.__PY_OUT = { meals: mealTotals, totals, score };
    """)

    payload_json = ctx.eval('JSON.stringify(globalThis.__PY_OUT)')
    payload = json.loads(payload_json)
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
