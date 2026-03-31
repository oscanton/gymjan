// Convenciones:
// - nutritionPer100: por 100 g (sodiumMg en mg; resto en g).
// - nutritionPerUnit: para unit="ud".
// - processed: 0-10 (0 crudo/directo; 10 ultraprocesado).

const FOODS = {

  /* =========================
     VERDURAS Y HORTALIZAS
     ========================= */
  chard: { name: "Acelga", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 19, protein: 1.8, carbs: 3.7, fat: 0.2, saturatedFat: 0.0, fiber: 1.6, sugar: 1.1, sodiumMg: 210 }, processed: 0 },
  garlic: { name: "Ajo", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 149, protein: 6.4, carbs: 33.1, fat: 0.5, saturatedFat: 0.1, fiber: 2.1, sugar: 1.0, sodiumMg: 17 }, processed: 0 },
  seaweed_nori: { name: "Alga nori", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 306, protein: 41.4, carbs: 38.7, fat: 3.7, saturatedFat: 0.5, fiber: 0.0, sugar: 0.5, sodiumMg: 530 }, processed: 2 },
  artichoke: { name: "Alcachofa", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 47, protein: 3.3, carbs: 10.5, fat: 0.2, saturatedFat: 0.0, fiber: 5.4, sugar: 1.0, sodiumMg: 94 }, processed: 0 },
  celery: { name: "Apio", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 16, protein: 0.7, carbs: 3.0, fat: 0.2, saturatedFat: 0.0, fiber: 1.6, sugar: 1.3, sodiumMg: 80 }, processed: 0 },
  eggplant: { name: "Berenjena", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 25, protein: 1.0, carbs: 6.0, fat: 0.2, saturatedFat: 0.0, fiber: 3.0, sugar: 3.5, sodiumMg: 2 }, processed: 0 },
  broccoli: { name: "Brócoli", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, saturatedFat: 0.1, fiber: 2.6, sugar: 1.7, sodiumMg: 33 }, processed: 0 },
  zucchini: { name: "Calabacín", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3, saturatedFat: 0.1, fiber: 1.0, sugar: 2.5, sodiumMg: 8 }, processed: 0 },
  pumpkin: { name: "Calabaza", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 26, protein: 1.0, carbs: 6.5, fat: 0.1, saturatedFat: 0.0, fiber: 0.5, sugar: 2.8, sodiumMg: 1 }, processed: 0 },
  onion: { name: "Cebolla", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, saturatedFat: 0.0, fiber: 1.7, sugar: 4.2, sodiumMg: 4 }, processed: 0 },
  mushrooms: { name: "Champiñones", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, saturatedFat: 0.1, fiber: 1.0, sugar: 2.0, sodiumMg: 5 }, processed: 0 },
  cabbage: { name: "Col", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1, saturatedFat: 0.0, fiber: 2.5, sugar: 3.2, sodiumMg: 18 }, processed: 0 },
  kale: { name: "Col rizada (kale)", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 49, protein: 4.3, carbs: 8.8, fat: 0.9, saturatedFat: 0.1, fiber: 3.6, sugar: 2.3, sodiumMg: 38 }, processed: 0 },
  brussels_sprouts: { name: "Coles de Bruselas", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 43, protein: 3.4, carbs: 9.0, fat: 0.3, saturatedFat: 0.1, fiber: 3.8, sugar: 2.2, sodiumMg: 25 }, processed: 0 },
  cauliflower: { name: "Coliflor", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 25, protein: 1.9, carbs: 5.0, fat: 0.3, saturatedFat: 0.1, fiber: 2.0, sugar: 1.9, sodiumMg: 30 }, processed: 0 },
  endive: { name: "Endibia", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 17, protein: 1.3, carbs: 3.4, fat: 0.2, saturatedFat: 0.0, fiber: 3.1, sugar: 0.3, sodiumMg: 22 }, processed: 0 },
  asparagus: { name: "Espárragos", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 20, protein: 2.2, carbs: 3.9, fat: 0.1, saturatedFat: 0.0, fiber: 2.1, sugar: 1.9, sodiumMg: 2 }, processed: 0 },
  spinach: { name: "Espinacas", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, saturatedFat: 0.1, fiber: 2.2, sugar: 0.4, sodiumMg: 79 }, processed: 0 },
  green_beans: { name: "Judías verdes", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 31, protein: 1.8, carbs: 7.0, fat: 0.1, saturatedFat: 0.0, fiber: 3.4, sugar: 3.3, sodiumMg: 6 }, processed: 0 },
  lettuce: { name: "Lechuga", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, saturatedFat: 0.0, fiber: 1.3, sugar: 0.8, sodiumMg: 28 }, processed: 0 },
  corn: { name: "Maíz", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 96, protein: 3.4, carbs: 21.0, fat: 1.5, saturatedFat: 0.2, fiber: 2.4, sugar: 4.5, sodiumMg: 15 }, processed: 2 },
  cucumber: { name: "Pepino", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, saturatedFat: 0.0, fiber: 0.5, sugar: 1.7, sodiumMg: 2 }, processed: 0 },
  bell_pepper: { name: "Pimiento", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 31, protein: 1.0, carbs: 6.0, fat: 0.3, saturatedFat: 0.0, fiber: 2.1, sugar: 4.2, sodiumMg: 2 }, processed: 0 },
  leek: { name: "Puerro", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 61, protein: 1.5, carbs: 14.0, fat: 0.3, saturatedFat: 0.0, fiber: 1.8, sugar: 3.9, sodiumMg: 20 }, processed: 0 },
  radish: { name: "Rábano", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 16, protein: 0.7, carbs: 3.4, fat: 0.1, saturatedFat: 0.0, fiber: 1.6, sugar: 1.9, sodiumMg: 39 }, processed: 0 },
  beetroot: { name: "Remolacha cocida", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 44, protein: 1.7, carbs: 10.0, fat: 0.2, saturatedFat: 0.0, fiber: 2.0, sugar: 7.0, sodiumMg: 78 }, processed: 1 },
  tomato: { name: "Tomate", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, saturatedFat: 0.0, fiber: 1.2, sugar: 2.6, sodiumMg: 5 }, processed: 0 },
  carrot: { name: "Zanahoria", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, saturatedFat: 0.0, fiber: 2.8, sugar: 4.7, sodiumMg: 69 }, processed: 0 },

  /* =========================
     FRUTAS
     ========================= */
  avocado: { name: "Aguacate", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 160, protein: 2.0, carbs: 8.5, fat: 14.7, saturatedFat: 2.1, fiber: 6.7, sugar: 0.7, sodiumMg: 7 }, processed: 0 },
  apricot: { name: "Albaricoque", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 48, protein: 1.4, carbs: 11.1, fat: 0.4, saturatedFat: 0.0, fiber: 2.0, sugar: 9.2, sodiumMg: 1 }, processed: 0 },
  blueberries: { name: "Arándanos", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, saturatedFat: 0.0, fiber: 2.4, sugar: 10.0, sodiumMg: 1 }, processed: 0 },
  plum: { name: "Ciruela", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 46, protein: 0.7, carbs: 11.4, fat: 0.3, saturatedFat: 0.0, fiber: 1.4, sugar: 9.9, sodiumMg: 0 }, processed: 0 },
  strawberries: { name: "Fresas", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, saturatedFat: 0.0, fiber: 2.0, sugar: 4.9, sodiumMg: 1 }, processed: 0 },
  berries: { name: "Frutos rojos", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 45, protein: 1.0, carbs: 10.0, fat: 0.5, saturatedFat: 0.0, fiber: 3.5, sugar: 6.0, sodiumMg: 1 }, processed: 0 },
  pomegranate: { name: "Granada", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 83, protein: 1.7, carbs: 18.7, fat: 1.2, saturatedFat: 0.1, fiber: 4.0, sugar: 13.7, sodiumMg: 3 }, processed: 0 },
  kiwi: { name: "Kiwi", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 61, protein: 1.1, carbs: 14.7, fat: 0.5, saturatedFat: 0.0, fiber: 3.0, sugar: 9.0, sodiumMg: 3 }, processed: 0 },
  lemon: { name: "Limón", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 29, protein: 1.1, carbs: 9.3, fat: 0.3, saturatedFat: 0.0, fiber: 2.8, sugar: 2.5, sodiumMg: 2 }, processed: 0 },
  mandarin: { name: "Mandarina", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 53, protein: 0.8, carbs: 13.3, fat: 0.3, saturatedFat: 0.0, fiber: 1.8, sugar: 10.6, sodiumMg: 2 }, processed: 0 },
  apple: { name: "Manzana", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, saturatedFat: 0.0, fiber: 2.4, sugar: 10.4, sodiumMg: 1 }, processed: 0 },
  mango: { name: "Mango", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 60, protein: 0.8, carbs: 15.0, fat: 0.4, saturatedFat: 0.1, fiber: 1.6, sugar: 13.7, sodiumMg: 1 }, processed: 0 },
  melon: { name: "Melón", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 34, protein: 0.8, carbs: 8.2, fat: 0.2, saturatedFat: 0.0, fiber: 0.9, sugar: 7.9, sodiumMg: 16 }, processed: 0 },
  peach: { name: "Melocotón", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 39, protein: 0.9, carbs: 9.5, fat: 0.3, saturatedFat: 0.0, fiber: 1.5, sugar: 8.4, sodiumMg: 0 }, processed: 0 },
  orange: { name: "Naranja", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, saturatedFat: 0.0, fiber: 2.4, sugar: 9.4, sodiumMg: 0 }, processed: 0 },
  pear: { name: "Pera", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 57, protein: 0.4, carbs: 15.2, fat: 0.1, saturatedFat: 0.0, fiber: 3.1, sugar: 10.0, sodiumMg: 1 }, processed: 0 },
  pineapple: { name: "Piña", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 50, protein: 0.5, carbs: 13.1, fat: 0.1, saturatedFat: 0.0, fiber: 1.4, sugar: 9.9, sodiumMg: 1 }, processed: 0 },
  banana: { name: "Plátano", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, saturatedFat: 0.1, fiber: 2.6, sugar: 12.2, sodiumMg: 1 }, processed: 0 },
  grapefruit: { name: "Pomelo", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 42, protein: 0.8, carbs: 10.7, fat: 0.1, saturatedFat: 0.0, fiber: 1.6, sugar: 6.9, sodiumMg: 0 }, processed: 0 },
  watermelon: { name: "Sandía", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, saturatedFat: 0.0, fiber: 0.4, sugar: 6.2, sodiumMg: 2 }, processed: 0 },
  grapes: { name: "Uvas", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, saturatedFat: 0.1, fiber: 0.9, sugar: 15.5, sodiumMg: 2 }, processed: 0 },

  /* =========================
     LEGUMBRES
     ========================= */
  beans: { name: "Alubias cocidas", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 110, protein: 7.5, carbs: 19.7, fat: 0.5, saturatedFat: 0.1, fiber: 6.3, sugar: 0.6, sodiumMg: 5 }, processed: 1 },
  edamame: { name: "Edamame", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 121, protein: 11.9, carbs: 8.9, fat: 5.2, saturatedFat: 0.7, fiber: 5.2, sugar: 2.2, sodiumMg: 6 }, processed: 2 },
  chickpeas: { name: "Garbanzos cocidos", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, saturatedFat: 0.3, fiber: 7.6, sugar: 4.8, sodiumMg: 7 }, processed: 1 },
  peas: { name: "Guisantes", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 81, protein: 5.4, carbs: 14.5, fat: 0.4, saturatedFat: 0.1, fiber: 5.1, sugar: 5.7, sodiumMg: 5 }, processed: 0 },
  hummus: { name: "Hummus", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 166, protein: 7.9, carbs: 14.3, fat: 9.6, saturatedFat: 1.4, fiber: 6.0, sugar: 0.3, sodiumMg: 300 }, processed: 4 },
  lentils: { name: "Lentejas cocidas", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 116, protein: 9.0, carbs: 20.1, fat: 0.4, saturatedFat: 0.1, fiber: 7.9, sugar: 1.8, sodiumMg: 2 }, processed: 1 },

  /* =========================
     CEREALES, PANES Y TUBÉRCULOS
     ========================= */
  rice: { name: "Arroz cocido", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3, saturatedFat: 0.1, fiber: 0.4, sugar: 0.1, sodiumMg: 1 }, processed: 1 },
  rice_wholegrain: { name: "Arroz integral cocido", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 123, protein: 2.7, carbs: 25.6, fat: 1.0, saturatedFat: 0.2, fiber: 1.8, sugar: 0.4, sodiumMg: 2 }, processed: 1 },
  oats: { name: "Avena", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, saturatedFat: 1.2, fiber: 10.6, sugar: 0.9, sodiumMg: 2 }, processed: 1 },
  sweet_potato: { name: "Batata", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 90, protein: 2.0, carbs: 21.0, fat: 0.2, saturatedFat: 0.0, fiber: 3.0, sugar: 4.2, sodiumMg: 36 }, processed: 0 },
  couscous: { name: "Cuscús cocido", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 112, protein: 3.8, carbs: 23.2, fat: 0.2, saturatedFat: 0.0, fiber: 1.4, sugar: 0.1, sodiumMg: 5 }, processed: 2 },
  flour_rice: { name: "Harina de arroz", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 366, protein: 5.9, carbs: 80.1, fat: 1.4, saturatedFat: 0.4, fiber: 2.4, sugar: 0.1, sodiumMg: 0 }, processed: 3 },
  flour_chickpea: { name: "Harina de garbanzo", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 387, protein: 22.4, carbs: 57.8, fat: 6.7, saturatedFat: 0.7, fiber: 10.8, sugar: 10.9, sodiumMg: 64 }, processed: 3 },
  flour_corn: { name: "Harina de maíz", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 364, protein: 6.9, carbs: 76.9, fat: 3.9, saturatedFat: 0.6, fiber: 7.3, sugar: 0.6, sodiumMg: 7 }, processed: 3 },
  flour_wheat: { name: "Harina de trigo", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 364, protein: 10.3, carbs: 76.3, fat: 1.0, saturatedFat: 0.2, fiber: 2.7, sugar: 0.3, sodiumMg: 2 }, processed: 3 },
  bread: { name: "Pan", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 250, protein: 9.0, carbs: 49.0, fat: 3.2, saturatedFat: 0.7, fiber: 2.7, sugar: 5.0, sodiumMg: 490 }, processed: 5 },
  rye_bread: { name: "Pan de centeno", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 259, protein: 8.5, carbs: 48.0, fat: 3.3, saturatedFat: 0.6, fiber: 6.0, sugar: 5.0, sodiumMg: 600 }, processed: 5 },
  wholegrain_bread: { name: "Pan integral", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 240, protein: 9.0, carbs: 42.0, fat: 4.0, saturatedFat: 0.8, fiber: 6.0, sugar: 5.0, sodiumMg: 450 }, processed: 4 },
  wholegrain_sandwich_bread: { name: "Pan de molde integral", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 250, protein: 10.0, carbs: 41.0, fat: 4.5, saturatedFat: 0.8, fiber: 7.0, sugar: 5.0, sodiumMg: 470 }, processed: 5 },
  pasta: { name: "Pasta cocida", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 131, protein: 5.0, carbs: 25.6, fat: 1.1, saturatedFat: 0.2, fiber: 1.5, sugar: 0.6, sodiumMg: 5 }, processed: 3 },
  pasta_wholegrain: { name: "Pasta integral cocida", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 124, protein: 5.0, carbs: 26.0, fat: 0.9, saturatedFat: 0.2, fiber: 3.0, sugar: 1.0, sodiumMg: 6 }, processed: 3 },
  egg_noodles: { name: "Noodles de huevo cocidos", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 138, protein: 5.3, carbs: 25.2, fat: 2.1, saturatedFat: 0.6, fiber: 1.2, sugar: 0.7, sodiumMg: 10 }, processed: 3 },
  rice_noodles: { name: "Noodles de arroz cocidos", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 108, protein: 1.8, carbs: 24.0, fat: 0.2, saturatedFat: 0.0, fiber: 0.8, sugar: 0.1, sodiumMg: 5 }, processed: 3 },
  potato: { name: "Patata cocida", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 87, protein: 2.0, carbs: 20.1, fat: 0.1, saturatedFat: 0.0, fiber: 1.8, sugar: 0.9, sodiumMg: 7 }, processed: 0 },
  quinoa: { name: "Quinoa cocida", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9, saturatedFat: 0.2, fiber: 2.8, sugar: 0.9, sodiumMg: 7 }, processed: 1 },
  wheat_tortilla: { name: "Tortilla de trigo", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 310, protein: 8.0, carbs: 52.0, fat: 8.0, saturatedFat: 2.0, fiber: 3.0, sugar: 2.0, sodiumMg: 620 }, processed: 6 },
  wholegrain_wrap: { name: "Wrap integral", category: "🌾 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 290, protein: 9.0, carbs: 48.0, fat: 7.0, saturatedFat: 1.5, fiber: 6.0, sugar: 3.0, sodiumMg: 560 }, processed: 5 },

  /* =========================
     PROTEÍNAS (CARNES, PESCADOS, MARISCOS, VEGETALES)
     ========================= */
  tuna: { name: "Atún", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 109, protein: 24.0, carbs: 0.0, fat: 1.0, saturatedFat: 0.3, fiber: 0.0, sugar: 0.0, sodiumMg: 50 }, processed: 2 },
  canned_tuna_natural: { name: "Atún al natural (lata)", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 116, protein: 26.0, carbs: 0.0, fat: 1.0, saturatedFat: 0.3, fiber: 0.0, sugar: 0.0, sodiumMg: 300 }, processed: 5 },
  canned_tuna_in_oil: { name: "Atún en aceite (lata)", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 198, protein: 24.0, carbs: 0.0, fat: 11.0, saturatedFat: 1.8, fiber: 0.0, sugar: 0.0, sodiumMg: 320 }, processed: 6 },
  cod: { name: "Bacalao", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 82, protein: 18.0, carbs: 0.0, fat: 0.7, saturatedFat: 0.1, fiber: 0.0, sugar: 0.0, sodiumMg: 54 }, processed: 1 },
  bonito: { name: "Bonito", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 140, protein: 24.0, carbs: 0.0, fat: 5.0, saturatedFat: 1.3, fiber: 0.0, sugar: 0.0, sodiumMg: 60 }, processed: 1 },
  squid: { name: "Calamar", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 92, protein: 15.6, carbs: 3.1, fat: 1.4, saturatedFat: 0.4, fiber: 0.0, sugar: 0.0, sodiumMg: 44 }, processed: 1 },
  rabbit: { name: "Conejo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 136, protein: 21.0, carbs: 0.0, fat: 5.5, saturatedFat: 1.5, fiber: 0.0, sugar: 0.0, sodiumMg: 45}, processed: 1 },
  lamb: {name: "Cordero", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 250, protein: 25.0, carbs: 0.0, fat: 20.0, saturatedFat: 9.0, fiber: 0.0, sugar: 0.0, sodiumMg: 70}, processed: 2 },
  lean_meat: { name: "Carne magra", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 140, protein: 26.0, carbs: 0.0, fat: 4.0, saturatedFat: 1.5, fiber: 0.0, sugar: 0.0, sodiumMg: 70 }, processed: 2 },
  egg_whites: { name: "Claras de huevo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 52, protein: 11.0, carbs: 1.0, fat: 0.2, saturatedFat: 0.0, fiber: 0.0, sugar: 1.0, sodiumMg: 166 }, processed: 3 },
  prawns: { name: "Gambas", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 99, protein: 24.0, carbs: 0.2, fat: 0.3, saturatedFat: 0.1, fiber: 0.0, sugar: 0.0, sodiumMg: 150 }, processed: 1 },
  lean_burger: { name: "Hamburguesa magra", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 170, protein: 20.0, carbs: 2.0, fat: 10.0, saturatedFat: 4.0, fiber: 0.0, sugar: 0.5, sodiumMg: 450 }, processed: 6 },
  egg: { name: "Huevo", category: "🥩 Proteínas", unit: "ud", nutritionPerUnit: { kcal: 78, protein: 6.5, carbs: 0.6, fat: 5.3, saturatedFat: 1.6, fiber: 0.0, sugar: 0.6, sodiumMg: 62 }, processed: 1 },
  loin_pork: { name: "Lomo de cerdo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 143, protein: 22.0, carbs: 0.0, fat: 5.9, saturatedFat: 2.0, fiber: 0.0, sugar: 0.0, sodiumMg: 62 }, processed: 2 },
  mussels: { name: "Mejillones", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 172, protein: 24.0, carbs: 7.4, fat: 4.5, saturatedFat: 1.2, fiber: 0.0, sugar: 0.0, sodiumMg: 286 }, processed: 1 },
  hake: { name: "Merluza", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 73, protein: 16.0, carbs: 0.0, fat: 1.0, saturatedFat: 0.2, fiber: 0.0, sugar: 0.0, sodiumMg: 60 }, processed: 1 },
  turkey: { name: "Pavo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 110, protein: 24.0, carbs: 0.0, fat: 1.0, saturatedFat: 0.3, fiber: 0.0, sugar: 0.0, sodiumMg: 70 }, processed: 1 },
  chicken_breast: { name: "Pechuga de pollo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 165, protein: 31.0, carbs: 0.0, fat: 2.0, saturatedFat: 1.0, fiber: 0.0, sugar: 0.0, sodiumMg: 74 }, processed: 1 },
  turkey_breast: { name: "Pechuga de pavo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 135, protein: 29.0, carbs: 0.0, fat: 1.6, saturatedFat: 0.4, fiber: 0.0, sugar: 0.0, sodiumMg: 80 }, processed: 2 },
  oily_fish: { name: "Pescado azul", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 200, protein: 20.0, carbs: 0.0, fat: 13.0, saturatedFat: 3.0, fiber: 0.0, sugar: 0.0, sodiumMg: 70 }, processed: 1 },
  white_fish: { name: "Pescado blanco", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 90, protein: 20.0, carbs: 0.0, fat: 1.0, saturatedFat: 0.2, fiber: 0.0, sugar: 0.0, sodiumMg: 70 }, processed: 1 },
  chicken: { name: "Pollo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6, saturatedFat: 1.0, fiber: 0.0, sugar: 0.0, sodiumMg: 74 }, processed: 1 },
  octopus: { name: "Pulpo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 82, protein: 15.0, carbs: 2.0, fat: 1.0, saturatedFat: 0.2, fiber: 0.0, sugar: 0.0, sodiumMg: 230 }, processed: 1 },
  salmon: { name: "Salmón", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 208, protein: 20.0, carbs: 0.0, fat: 13.0, saturatedFat: 3.1, fiber: 0.0, sugar: 0.0, sodiumMg: 59 }, processed: 1 },
  sardines: { name: "Sardinas", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 208, protein: 25.0, carbs: 0.0, fat: 11.0, saturatedFat: 2.0, fiber: 0.0, sugar: 0.0, sodiumMg: 120 }, processed: 2 },
  tempeh: { name: "Tempeh", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 193, protein: 20.0, carbs: 9.0, fat: 11.0, saturatedFat: 2.2, fiber: 1.4, sugar: 0.5, sodiumMg: 9 }, processed: 3 },
  beef: { name: "Ternera", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 170, protein: 26.0, carbs: 0.0, fat: 7.0, saturatedFat: 3.0, fiber: 0.0, sugar: 0.0, sodiumMg: 72 }, processed: 2 },
  tofu: { name: "Tofu", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 76, protein: 8.0, carbs: 1.9, fat: 4.8, saturatedFat: 0.7, fiber: 0.3, sugar: 0.3, sodiumMg: 7 }, processed: 2 },

  /* =========================
     LÁCTEOS Y QUESOS
     ========================= */
  kefir: { name: "Kéfir", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 60, protein: 3.5, carbs: 4.8, fat: 3.3, saturatedFat: 2.1, fiber: 0.0, sugar: 4.8, sodiumMg: 40 }, processed: 4 },
  whole_milk: { name: "Leche entera", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 61, protein: 3.3, carbs: 4.8, fat: 3.3, saturatedFat: 2.1, fiber: 0.0, sugar: 4.8, sodiumMg: 43 }, processed: 2 },
  semi_skimmed_milk: { name: "Leche semidesnatada", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 46, protein: 3.3, carbs: 4.9, fat: 1.6, saturatedFat: 1.0, fiber: 0.0, sugar: 4.9, sodiumMg: 44 }, processed: 2 },
  skimmed_milk: { name: "Leche desnatada", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 35, protein: 3.4, carbs: 5.0, fat: 0.2, saturatedFat: 0.1, fiber: 0.0, sugar: 5.0, sodiumMg: 45 }, processed: 2 },
  mozzarella: { name: "Mozzarella", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 280, protein: 28.0, carbs: 3.0, fat: 17.0, saturatedFat: 10.0, fiber: 0.0, sugar: 1.0, sodiumMg: 620 }, processed: 6 },
  cheese_emmental: { name: "Queso emmental", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 380, protein: 29.0, carbs: 4.0, fat: 29.0, saturatedFat: 18.0, fiber: 0.0, sugar: 0.5, sodiumMg: 300 }, processed: 6 },
  cheese_fresh: { name: "Queso fresco", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 98, protein: 11.0, carbs: 3.0, fat: 4.0, saturatedFat: 2.5, fiber: 0.0, sugar: 3.0, sodiumMg: 400 }, processed: 4 },
  sliced_cheese: { name: "Queso en lonchas", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 280, protein: 16.0, carbs: 6.0, fat: 22.0, saturatedFat: 14.0, fiber: 0.0, sugar: 2.0, sodiumMg: 950 }, processed: 8 },
  light_sliced_cheese: { name: "Queso en lonchas light", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 190, protein: 24.0, carbs: 6.0, fat: 8.0, saturatedFat: 5.0, fiber: 0.0, sugar: 2.0, sodiumMg: 980 }, processed: 8 },
  greek_yogurt: { name: "Yogur griego", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 120, protein: 10.0, carbs: 4.0, fat: 8.0, saturatedFat: 5.0, fiber: 0.0, sugar: 4.0, sodiumMg: 40 }, processed: 4 },
  plain_yogurt: { name: "Yogur natural", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 60, protein: 4.0, carbs: 5.0, fat: 3.0, saturatedFat: 2.0, fiber: 0.0, sugar: 5.0, sodiumMg: 36 }, processed: 3 },

  /* =========================
     GRASAS, FRUTOS SECOS Y SEMILLAS
     ========================= */
  olive_oil: { name: "Aceite de oliva", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 900, protein: 0.0, carbs: 0.0, fat: 100.0, saturatedFat: 14.0, fiber: 0.0, sugar: 0.0, sodiumMg: 0 }, processed: 2 },
  olives: { name: "Aceitunas", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 145, protein: 1.0, carbs: 3.8, fat: 15.3, saturatedFat: 2.0, fiber: 3.3, sugar: 0.0, sodiumMg: 735 }, processed: 6 },
  almonds: { name: "Almendras", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 579, protein: 21.0, carbs: 22.0, fat: 50.0, saturatedFat: 3.8, fiber: 12.5, sugar: 4.4, sodiumMg: 1 }, processed: 1 },
  flour_almond: { name: "Harina de almendra", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 571, protein: 21.0, carbs: 21.4, fat: 50.0, saturatedFat: 3.8, fiber: 10.4, sugar: 4.4, sodiumMg: 1 }, processed: 3 },
  peanuts: { name: "Cacahuetes", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 567, protein: 26.0, carbs: 16.0, fat: 49.0, saturatedFat: 7.0, fiber: 8.5, sugar: 4.7, sodiumMg: 18 }, processed: 3 },
  coconut: { name: "Coco", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 354, protein: 3.3, carbs: 15.2, fat: 33.5, saturatedFat: 29.7, fiber: 9.0, sugar: 6.2, sodiumMg: 20 }, processed: 1 },
  mixed_nuts: { name: "Frutos secos", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 600, protein: 18.0, carbs: 16.0, fat: 55.0, saturatedFat: 7.0, fiber: 8.0, sugar: 4.0, sodiumMg: 5 }, processed: 3 },
  butter: { name: "Mantequilla", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 717, protein: 0.9, carbs: 0.1, fat: 81.0, saturatedFat: 51.0, fiber: 0.0, sugar: 0.1, sodiumMg: 11 }, processed: 6 },
  walnuts: { name: "Nueces", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 654, protein: 15.0, carbs: 14.0, fat: 65.0, saturatedFat: 6.0, fiber: 6.7, sugar: 2.6, sodiumMg: 2 }, processed: 1 },
  chia_seeds: { name: "Semillas de chía", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 486, protein: 17.0, carbs: 42.0, fat: 31.0, saturatedFat: 3.3, fiber: 34.0, sugar: 0.0, sodiumMg: 16 }, processed: 1 },
  sesame: { name: "Sésamo (semillas)", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 573, protein: 17.7, carbs: 23.5, fat: 49.7, saturatedFat: 7.0, fiber: 11.8, sugar: 0.3, sodiumMg: 11 }, processed: 1 },

  /* =========================
     CONDIMENTOS, ESPECIAS Y SALSES BÁSICAS
     ========================= */
  cinnamon: { name: "Canela", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 247, protein: 4.0, carbs: 81.0, fat: 1.2, saturatedFat: 0.3, fiber: 53.0, sugar: 2.2, sodiumMg: 10 }, processed: 2 },
  cilantro: { name: "Cilantro", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 23, protein: 2.1, carbs: 3.7, fat: 0.5, saturatedFat: 0.0, fiber: 2.8, sugar: 0.9, sodiumMg: 46 }, processed: 1 },
  cumin: { name: "Comino", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 375, protein: 18.0, carbs: 44.0, fat: 22.0, saturatedFat: 1.5, fiber: 10.5, sugar: 2.3, sodiumMg: 168 }, processed: 2 },
  curry: { name: "Curry en polvo", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 325, protein: 14.0, carbs: 58.0, fat: 14.0, saturatedFat: 2.1, fiber: 33.0, sugar: 2.8, sodiumMg: 52 }, processed: 3 },
  basil: { name: "Albahaca", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 23, protein: 3.2, carbs: 2.7, fat: 0.6, saturatedFat: 0.0, fiber: 1.6, sugar: 0.3, sodiumMg: 4 }, processed: 1 },
  ginger: { name: "Jengibre", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 80, protein: 1.8, carbs: 17.8, fat: 0.8, saturatedFat: 0.2, fiber: 2.0, sugar: 1.7, sodiumMg: 13 }, processed: 1 },
  garlic_powder: { name: "Ajo en polvo", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 331, protein: 16.6, carbs: 72.7, fat: 0.7, saturatedFat: 0.2, fiber: 9.0, sugar: 2.4, sodiumMg: 60 }, processed: 4 },
  parsley: { name: "Perejil", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 36, protein: 3.0, carbs: 6.3, fat: 0.8, saturatedFat: 0.1, fiber: 3.3, sugar: 0.9, sodiumMg: 56 }, processed: 1 },
  sugar: { name: "Azúcar", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 387, protein: 0.0, carbs: 100.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 100.0, sodiumMg: 1 }, processed: 3 },
  sweetener_stevia: { name: "Edulcorante (estevia)", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 0 }, processed: 5 },
  ketchup: { name: "Ketchup", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 112, protein: 1.3, carbs: 25.0, fat: 0.2, saturatedFat: 0.0, fiber: 0.3, sugar: 22.0, sodiumMg: 900 }, processed: 7 },
  mayo: { name: "Mayonesa", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 680, protein: 1.0, carbs: 1.0, fat: 75.0, saturatedFat: 11.0, fiber: 0.0, sugar: 1.0, sodiumMg: 700 }, processed: 8 },
  mustard: { name: "Mostaza", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 66, protein: 4.4, carbs: 5.8, fat: 4.4, saturatedFat: 0.2, fiber: 3.3, sugar: 1.8, sodiumMg: 1135 }, processed: 7 },
  oregano: { name: "Orégano", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 265, protein: 9.0, carbs: 69.0, fat: 4.3, saturatedFat: 1.6, fiber: 42.0, sugar: 4.1, sodiumMg: 25 }, processed: 2 },
  paprika: { name: "Pimentón", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 282, protein: 14.0, carbs: 54.0, fat: 13.0, saturatedFat: 2.1, fiber: 35.0, sugar: 10.3, sodiumMg: 68 }, processed: 2 },
  black_pepper: { name: "Pimienta negra", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 251, protein: 10.4, carbs: 64.0, fat: 3.3, saturatedFat: 1.4, fiber: 26.5, sugar: 0.6, sodiumMg: 20 }, processed: 2 },
  salt: { name: "Sal", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 38758 }, processed: 3 },
  sauce_soy: { name: "Salsa de soja", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 53, protein: 8.1, carbs: 4.9, fat: 0.1, saturatedFat: 0.0, fiber: 0.8, sugar: 0.4, sodiumMg: 5490 }, processed: 7 },
  vinegar: { name: "Vinagre", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 18, protein: 0.0, carbs: 0.04, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.04, sodiumMg: 2 }, processed: 2 },
  balsamic_vinegar: { name: "Vinagre balsámico", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 88, protein: 0.5, carbs: 17.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 15.0, sodiumMg: 23 }, processed: 4 },
  honey: { name: "Miel", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 304, protein: 0.3, carbs: 82.4, fat: 0.0, saturatedFat: 0.0, fiber: 0.2, sugar: 82.1, sodiumMg: 4 }, processed: 2 },
  yeast: { name: "Levadura (seca)", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 325, protein: 40.4, carbs: 41.2, fat: 7.6, saturatedFat: 1.1, fiber: 26.9, sugar: 0.0, sodiumMg: 30 }, processed: 4 },

  /* =========================
     DULCES Y CHOCOLATES
     ========================= */
  pure_cocoa_powder: { name: "Cacao puro en polvo (desgrasado)", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 228, protein: 19.6, carbs: 57.9, fat: 13.7, saturatedFat: 8.1, fiber: 37.0, sugar: 1.8, sodiumMg: 21 }, processed: 3 },
  instant_cocoa: { name: "Cacao soluble", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 380, protein: 5.0, carbs: 82.0, fat: 4.0, saturatedFat: 2.4, fiber: 6.0, sugar: 75.0, sodiumMg: 300 }, processed: 8 },
  dark_chocolate_85: { name: "Chocolate negro 85%", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 597, protein: 12.0, carbs: 20.0, fat: 49.0, saturatedFat: 30.0, fiber: 14.0, sugar: 14.0, sodiumMg: 0 }, processed: 7 },
  dark_chocolate_70: { name: "Chocolate negro 70%", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 568, protein: 10.0, carbs: 32.0, fat: 42.0, saturatedFat: 26.0, fiber: 11.0, sugar: 27.0, sodiumMg: 12 }, processed: 7 },
  milk_chocolate: { name: "Chocolate con leche", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 534, protein: 6.0, carbs: 59.0, fat: 30.0, saturatedFat: 18.0, fiber: 2.3, sugar: 58.0, sodiumMg: 0 }, processed: 8 },
  white_chocolate: { name: "Chocolate blanco", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 539, protein: 5.9, carbs: 59.0, fat: 32.0, saturatedFat: 20.0, fiber: 0.0, sugar: 59.0, sodiumMg: 100 }, processed: 8 },
  cookies: { name: "Galletas", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 480, protein: 6.0, carbs: 70.0, fat: 20.0, saturatedFat: 8.0, fiber: 3.0, sugar: 30.0, sodiumMg: 350 }, processed: 8 },
  muffin: { name: "Magdalena", category: "🍫 Dulces y chocolates", unit: "ud", nutritionPerUnit: { kcal: 150, protein: 2.5, carbs: 18.0, fat: 7.5, saturatedFat: 2.5, fiber: 0.7, sugar: 10.0, sodiumMg: 120 }, processed: 8 },
  sponge_cake: { name: "Bizcocho", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 350, protein: 6.0, carbs: 50.0, fat: 14.0, saturatedFat: 4.0, fiber: 1.5, sugar: 30.0, sodiumMg: 250 }, processed: 7 },
  croissant: { name: "Croissant", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 406, protein: 8.0, carbs: 45.0, fat: 21.0, saturatedFat: 12.0, fiber: 2.5, sugar: 9.0, sodiumMg: 430 }, processed: 8 },
  ice_cream: { name: "Helado", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 207, protein: 3.5, carbs: 24.0, fat: 11.0, saturatedFat: 7.0, fiber: 0.7, sugar: 21.0, sodiumMg: 80 }, processed: 7 },
  gummies: { name: "Gominolas", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 340, protein: 5.0, carbs: 80.0, fat: 0.2, saturatedFat: 0.1, fiber: 0.0, sugar: 60.0, sodiumMg: 40 }, processed: 9 },
  candies: { name: "Caramelos", category: "🍫 Dulces y chocolates", unit: "g", nutritionPer100: { kcal: 390, protein: 0.0, carbs: 98.0, fat: 0.2, saturatedFat: 0.1, fiber: 0.0, sugar: 90.0, sodiumMg: 30 }, processed: 9 },

  /* =========================
     BEBIDAS E INFUSIONES
     ========================= */
  beer_330: { name: "1 cerveza (330ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 143, protein: 1.3, carbs: 11.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 14 }, processed: 5 },
  wine_150: { name: "1 vino (150ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 125, protein: 0.1, carbs: 4.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 1.0, sodiumMg: 7 }, processed: 4 },
  coca_cola_330: { name: "1 coca-cola (330ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 139, protein: 0.0, carbs: 35.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 35.0, sodiumMg: 11 }, processed: 8 },
  bolero_sachet_9g: { name: "Bolero (1 sobre de 9g)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 1, protein: 0.0, carbs: 0.1, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 15 }, processed: 7 },
  soda_330: { name: "1 refresco (330ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 132, protein: 0.0, carbs: 33.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 33.0, sodiumMg: 20 }, processed: 8 },
  diet_soda_330: { name: "Refresco light (330ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 2, protein: 0.0, carbs: 0.3, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 15 }, processed: 7 },
  shake_250: { name: "1 batido (250ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 180, protein: 7.0, carbs: 26.0, fat: 5.0, saturatedFat: 3.0, fiber: 0.0, sugar: 24.0, sodiumMg: 120 }, processed: 8 },
  natural_juice_250: { name: "Zumo natural (250ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 110, protein: 1.5, carbs: 25.0, fat: 0.2, saturatedFat: 0.0, fiber: 0.5, sugar: 21.0, sodiumMg: 5 }, processed: 3 },
  processed_juice_250: { name: "Zumo procesado (250ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 115, protein: 0.5, carbs: 27.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.1, sugar: 26.0, sodiumMg: 15 }, processed: 6 },
  coconut_water_250: { name: "Agua de coco (250ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 48, protein: 0.5, carbs: 11.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 10.0, sodiumMg: 105 }, processed: 4 },
  energy_drink_250: { name: "Bebida energética (250ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 112, protein: 0.0, carbs: 27.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 27.0, sodiumMg: 200 }, processed: 8 },
  tea: { name: "Té", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 3 }, processed: 1 },
  tonic_330: { name: "Tónica (330ml)", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 112, protein: 0.0, carbs: 28.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 28.0, sodiumMg: 33 }, processed: 7 },
  coffee: { name: "Café", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 5 }, processed: 1 },
  herbal_tea: { name: "Infusión", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 5 }, processed: 1 },

  /* =========================
     GENÉRICOS
     ========================= */
  salad: { name: "Ensalada mix", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 20, protein: 1.2, carbs: 3.5, fat: 0.2, saturatedFat: 0.0, fiber: 1.5, sugar: 1.8, sodiumMg: 25 }, processed: 1 },
  fruit: { name: "Fruta variada", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 55, protein: 0.7, carbs: 13.0, fat: 0.2, saturatedFat: 0.0, fiber: 2.0, sugar: 10.0, sodiumMg: 2 }, processed: 1 },
  vegetables: { name: "Verduras mix", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 30, protein: 2.0, carbs: 6.0, fat: 0.3, saturatedFat: 0.0, fiber: 2.0, sugar: 3.0, sodiumMg: 20 }, processed: 1 },

  /* =========================
     MENOS SALUDABLES / PROCESADOS
     ========================= */
  iberian_ham: { name: "Jamón ibérico", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 250, protein: 33.0, carbs: 0.0, fat: 13.0, saturatedFat: 4.5, fiber: 0.0, sugar: 0.0, sodiumMg: 1800 }, processed: 7 },
  york_ham: { name: "Jamón york", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 110, protein: 18.0, carbs: 2.0, fat: 3.0, saturatedFat: 1.0, fiber: 0.0, sugar: 1.0, sodiumMg: 1000 }, processed: 7 },
  turkey_deli_meat: { name: "Fiambre de pavo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 105, protein: 19.0, carbs: 2.0, fat: 2.0, saturatedFat: 0.7, fiber: 0.0, sugar: 1.5, sodiumMg: 1100 }, processed: 7 },
  chorizo: { name: "Chorizo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 455, protein: 24.0, carbs: 1.5, fat: 38.0, saturatedFat: 14.0, fiber: 0.0, sugar: 1.0, sodiumMg: 1600 }, processed: 9 },
  salami: { name: "Salchichón", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 420, protein: 25.0, carbs: 1.0, fat: 35.0, saturatedFat: 12.0, fiber: 0.0, sugar: 0.5, sodiumMg: 1700 }, processed: 9 },
  bacon: { name: "Bacon", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 541, protein: 37.0, carbs: 1.5, fat: 42.0, saturatedFat: 14.0, fiber: 0.0, sugar: 1.0, sodiumMg: 1700 }, processed: 9 },
  sausages: { name: "Salchichas", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 290, protein: 12.0, carbs: 2.0, fat: 25.0, saturatedFat: 9.0, fiber: 0.0, sugar: 1.0, sodiumMg: 1000 }, processed: 9 },
  french_fries: { name: "Patatas fritas", category: "📦 Otros / Procesados", unit: "g", nutritionPer100: { kcal: 536, protein: 7.0, carbs: 53.0, fat: 35.0, saturatedFat: 5.0, fiber: 4.0, sugar: 0.5, sodiumMg: 525 }, processed: 9 },
  pickled_gherkins: { name: "Pepinillos encurtidos", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 11, protein: 0.5, carbs: 2.3, fat: 0.2, saturatedFat: 0.0, fiber: 1.2, sugar: 1.2, sodiumMg: 1200 }, processed: 6 },
  smoked_salmon: { name: "Salmón ahumado", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 117, protein: 18.3, carbs: 0.0, fat: 4.3, saturatedFat: 0.9, fiber: 0.0, sugar: 0.0, sodiumMg: 1200 }, processed: 7 },
  surimi: { name: "Surimi (cangrejo)", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 95, protein: 7.5, carbs: 15.0, fat: 0.5, saturatedFat: 0.1, fiber: 0.5, sugar: 6.5, sodiumMg: 700 }, processed: 8 },

  /* =========================
     SUPLEMENTOS
     ========================= */
  creatine_monohydrate: { name: "Creatina monohidrato", category: "💊 Suplementos", unit: "g", nutritionPer100: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturatedFat: 0.0, fiber: 0.0, sugar: 0.0, sodiumMg: 0 }, processed: 6 },
  protein: { name: "Proteína", category: "💊 Suplementos", unit: "g", nutritionPer100: { kcal: 400, protein: 80.0, carbs: 8.0, fat: 6.0, saturatedFat: 2.0, fiber: 2.0, sugar: 3.0, sodiumMg: 500 }, processed: 7 },
  protein_isolate: { name: "Proteína aislada", category: "💊 Suplementos", unit: "g", nutritionPer100: { kcal: 375, protein: 90.0, carbs: 3.0, fat: 1.5, saturatedFat: 0.6, fiber: 0.0, sugar: 1.0, sodiumMg: 350 }, processed: 7 },
  casein_protein: { name: "Proteína caseína", category: "💊 Suplementos", unit: "g", nutritionPer100: { kcal: 370, protein: 82.0, carbs: 7.0, fat: 2.5, saturatedFat: 1.2, fiber: 0.0, sugar: 4.0, sodiumMg: 420 }, processed: 7 },

};


