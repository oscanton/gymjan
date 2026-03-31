import argparse
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

COLUMNS = [
    'id',
    'name',
    'category',
    'unit',
    'nutrition_unit',
    'kcal',
    'protein',
    'carbs',
    'fat',
    'saturated_fat',
    'fiber',
    'sugar',
    'sodium',
    'processed',
]


def load_foods_js(path):
    try:
        import quickjs  # pip install quickjs
    except Exception as exc:
        print('ERROR: necesitas instalar quickjs (pip install quickjs).', file=sys.stderr)
        print(f'Detalle: {exc}', file=sys.stderr)
        return None

    ctx = quickjs.Context()
    ctx.eval(path.read_text(encoding='utf-8'))
    foods_json = ctx.eval('JSON.stringify(FOODS)')
    return json.loads(foods_json)


def normalize_num(value):
    if value is None:
        return 0
    return value


def write_csv(foods, out_path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, delimiter=',')
        writer.writeheader()
        for food_id, data in foods.items():
            nutrition = data.get('nutritionPer100')
            nutrition_unit = '100g'
            if nutrition is None:
                nutrition = data.get('nutritionPerUnit', {})
                nutrition_unit = 'unit'

            row = {
                'id': food_id,
                'name': data.get('name', ''),
                'category': data.get('category', ''),
                'unit': data.get('unit', ''),
                'nutrition_unit': nutrition_unit,
                'kcal': normalize_num(nutrition.get('kcal')),
                'protein': normalize_num(nutrition.get('protein')),
                'carbs': normalize_num(nutrition.get('carbs')),
                'fat': normalize_num(nutrition.get('fat')),
                'saturated_fat': normalize_num(nutrition.get('saturatedFat')),
                'fiber': normalize_num(nutrition.get('fiber')),
                'sugar': normalize_num(nutrition.get('sugar')),
                'sodium': normalize_num(nutrition.get('sodiumMg')),
                'processed': normalize_num(data.get('processed')),
            }
            writer.writerow(row)


def main():
    parser = argparse.ArgumentParser(description='Exporta FOODS de foods.js a CSV.')
    parser.add_argument('--foods-js', default=str(ROOT / 'js' / 'data' / 'foods.js'))
    parser.add_argument('--out-csv', default=str(Path(__file__).resolve().parent / 'foods.csv'))
    args = parser.parse_args()

    foods_js = Path(args.foods_js)
    if not foods_js.exists():
        print(f'ERROR: No existe foods.js: {foods_js}', file=sys.stderr)
        return 1

    foods = load_foods_js(foods_js)
    if foods is None:
        return 1

    out_csv = Path(args.out_csv)
    write_csv(foods, out_csv)
    print(f'OK: CSV generado en {out_csv}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
