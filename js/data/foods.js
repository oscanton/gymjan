// Convenciones:
// - nutritionPer100: por 100 g (sodium en mg; resto en g).
// - nutritionPerUnit: para unit="ud".
// - processed: 0–10 (0 crudo/directo; 10 ultraprocesado).

const FOODS = {

  /* =========================
     VERDURAS Y HORTALIZAS
     ========================= */
  acelga: { name: "Acelga", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 19, protein: 1.8, carbs: 3.7, fat: 0.2, saturated_fat: 0.0, fiber: 1.6, sugar: 1.1, sodium: 210 }, processed: 0 },
  ajo: { name: "Ajo", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 149, protein: 6.4, carbs: 33.1, fat: 0.5, saturated_fat: 0.1, fiber: 2.1, sugar: 1.0, sodium: 17 }, processed: 0 },
  alcachofa: { name: "Alcachofa", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 47, protein: 3.3, carbs: 10.5, fat: 0.2, saturated_fat: 0.0, fiber: 5.4, sugar: 1.0, sodium: 94 }, processed: 0 },
  apio: { name: "Apio", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 16, protein: 0.7, carbs: 3.0, fat: 0.2, saturated_fat: 0.0, fiber: 1.6, sugar: 1.3, sodium: 80 }, processed: 0 },
  berenjena: { name: "Berenjena", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 25, protein: 1.0, carbs: 6.0, fat: 0.2, saturated_fat: 0.0, fiber: 3.0, sugar: 3.5, sodium: 2 }, processed: 0 },
  brocoli: { name: "Brócoli", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, saturated_fat: 0.1, fiber: 2.6, sugar: 1.7, sodium: 33 }, processed: 0 },
  calabacin: { name: "Calabacín", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3, saturated_fat: 0.1, fiber: 1.0, sugar: 2.5, sodium: 8 }, processed: 0 },
  calabaza: { name: "Calabaza", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 26, protein: 1.0, carbs: 6.5, fat: 0.1, saturated_fat: 0.0, fiber: 0.5, sugar: 2.8, sodium: 1 }, processed: 0 },
  cebolla: { name: "Cebolla", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, saturated_fat: 0.0, fiber: 1.7, sugar: 4.2, sodium: 4 }, processed: 0 },
  champinones: { name: "Champiñones", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, saturated_fat: 0.1, fiber: 1.0, sugar: 2.0, sodium: 5 }, processed: 0 },
  col: { name: "Col", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1, saturated_fat: 0.0, fiber: 2.5, sugar: 3.2, sodium: 18 }, processed: 0 },
  col_rizada: { name: "Col rizada (kale)", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 49, protein: 4.3, carbs: 8.8, fat: 0.9, saturated_fat: 0.1, fiber: 3.6, sugar: 2.3, sodium: 38 }, processed: 0 },
  coles_bruselas: { name: "Coles de Bruselas", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 43, protein: 3.4, carbs: 9.0, fat: 0.3, saturated_fat: 0.1, fiber: 3.8, sugar: 2.2, sodium: 25 }, processed: 0 },
  coliflor: { name: "Coliflor", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 25, protein: 1.9, carbs: 5.0, fat: 0.3, saturated_fat: 0.1, fiber: 2.0, sugar: 1.9, sodium: 30 }, processed: 0 },
  endibia: { name: "Endibia", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 17, protein: 1.3, carbs: 3.4, fat: 0.2, saturated_fat: 0.0, fiber: 3.1, sugar: 0.3, sodium: 22 }, processed: 0 },
  esparragos: { name: "Espárragos", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 20, protein: 2.2, carbs: 3.9, fat: 0.1, saturated_fat: 0.0, fiber: 2.1, sugar: 1.9, sodium: 2 }, processed: 0 },
  espinacas: { name: "Espinacas", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, saturated_fat: 0.1, fiber: 2.2, sugar: 0.4, sodium: 79 }, processed: 0 },
  guisantes: { name: "Guisantes", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 81, protein: 5.4, carbs: 14.5, fat: 0.4, saturated_fat: 0.1, fiber: 5.1, sugar: 5.7, sodium: 5 }, processed: 1 },
  judias_verdes: { name: "Judías verdes", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 31, protein: 1.8, carbs: 7.0, fat: 0.1, saturated_fat: 0.0, fiber: 3.4, sugar: 3.3, sodium: 6 }, processed: 0 },
  lechuga: { name: "Lechuga", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, saturated_fat: 0.0, fiber: 1.3, sugar: 0.8, sodium: 28 }, processed: 0 },
  maiz: { name: "Maíz", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 96, protein: 3.4, carbs: 21.0, fat: 1.5, saturated_fat: 0.2, fiber: 2.4, sugar: 4.5, sodium: 15 }, processed: 2 },
  pepino: { name: "Pepino", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, saturated_fat: 0.0, fiber: 0.5, sugar: 1.7, sodium: 2 }, processed: 0 },
  pimiento: { name: "Pimiento", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 31, protein: 1.0, carbs: 6.0, fat: 0.3, saturated_fat: 0.0, fiber: 2.1, sugar: 4.2, sodium: 2 }, processed: 0 },
  puerro: { name: "Puerro", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 61, protein: 1.5, carbs: 14.0, fat: 0.3, saturated_fat: 0.0, fiber: 1.8, sugar: 3.9, sodium: 20 }, processed: 0 },
  rabano: { name: "Rábano", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 16, protein: 0.7, carbs: 3.4, fat: 0.1, saturated_fat: 0.0, fiber: 1.6, sugar: 1.9, sodium: 39 }, processed: 0 },
  remolacha: { name: "Remolacha cocida", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 44, protein: 1.7, carbs: 10.0, fat: 0.2, saturated_fat: 0.0, fiber: 2.0, sugar: 7.0, sodium: 78 }, processed: 1 },
  tomate: { name: "Tomate", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, saturated_fat: 0.0, fiber: 1.2, sugar: 2.6, sodium: 5 }, processed: 0 },
  zanahoria: { name: "Zanahoria", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, saturated_fat: 0.0, fiber: 2.8, sugar: 4.7, sodium: 69 }, processed: 0 },

  /* =========================
     FRUTAS
     ========================= */
  aguacate: { name: "Aguacate", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 160, protein: 2.0, carbs: 8.5, fat: 14.7, saturated_fat: 2.1, fiber: 6.7, sugar: 0.7, sodium: 7 }, processed: 0 },
  albaricoque: { name: "Albaricoque", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 48, protein: 1.4, carbs: 11.1, fat: 0.4, saturated_fat: 0.0, fiber: 2.0, sugar: 9.2, sodium: 1 }, processed: 0 },
  arandanos: { name: "Arándanos", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, saturated_fat: 0.0, fiber: 2.4, sugar: 10.0, sodium: 1 }, processed: 0 },
  ciruela: { name: "Ciruela", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 46, protein: 0.7, carbs: 11.4, fat: 0.3, saturated_fat: 0.0, fiber: 1.4, sugar: 9.9, sodium: 0 }, processed: 0 },
  fresas: { name: "Fresas", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, saturated_fat: 0.0, fiber: 2.0, sugar: 4.9, sodium: 1 }, processed: 0 },
  frutos_rojos: { name: "Frutos rojos", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 45, protein: 1.0, carbs: 10.0, fat: 0.5, saturated_fat: 0.0, fiber: 3.5, sugar: 6.0, sodium: 1 }, processed: 0 },
  granada: { name: "Granada", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 83, protein: 1.7, carbs: 18.7, fat: 1.2, saturated_fat: 0.1, fiber: 4.0, sugar: 13.7, sodium: 3 }, processed: 0 },
  kiwi: { name: "Kiwi", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 61, protein: 1.1, carbs: 14.7, fat: 0.5, saturated_fat: 0.0, fiber: 3.0, sugar: 9.0, sodium: 3 }, processed: 0 },
  limon: { name: "Limón", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 29, protein: 1.1, carbs: 9.3, fat: 0.3, saturated_fat: 0.0, fiber: 2.8, sugar: 2.5, sodium: 2 }, processed: 0 },
  mandarina: { name: "Mandarina", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 53, protein: 0.8, carbs: 13.3, fat: 0.3, saturated_fat: 0.0, fiber: 1.8, sugar: 10.6, sodium: 2 }, processed: 0 },
  manzana: { name: "Manzana", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, saturated_fat: 0.0, fiber: 2.4, sugar: 10.4, sodium: 1 }, processed: 0 },
  mango: { name: "Mango", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 60, protein: 0.8, carbs: 15.0, fat: 0.4, saturated_fat: 0.1, fiber: 1.6, sugar: 13.7, sodium: 1 }, processed: 0 },
  melon: { name: "Melón", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 34, protein: 0.8, carbs: 8.2, fat: 0.2, saturated_fat: 0.0, fiber: 0.9, sugar: 7.9, sodium: 16 }, processed: 0 },
  melocoton: { name: "Melocotón", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 39, protein: 0.9, carbs: 9.5, fat: 0.3, saturated_fat: 0.0, fiber: 1.5, sugar: 8.4, sodium: 0 }, processed: 0 },
  naranja: { name: "Naranja", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, saturated_fat: 0.0, fiber: 2.4, sugar: 9.4, sodium: 0 }, processed: 0 },
  pera: { name: "Pera", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 57, protein: 0.4, carbs: 15.2, fat: 0.1, saturated_fat: 0.0, fiber: 3.1, sugar: 10.0, sodium: 1 }, processed: 0 },
  pina: { name: "Piña", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 50, protein: 0.5, carbs: 13.1, fat: 0.1, saturated_fat: 0.0, fiber: 1.4, sugar: 9.9, sodium: 1 }, processed: 0 },
  platano: { name: "Plátano", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, saturated_fat: 0.1, fiber: 2.6, sugar: 12.2, sodium: 1 }, processed: 0 },
  pomelo: { name: "Pomelo", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 42, protein: 0.8, carbs: 10.7, fat: 0.1, saturated_fat: 0.0, fiber: 1.6, sugar: 6.9, sodium: 0 }, processed: 0 },
  sandia: { name: "Sandía", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, saturated_fat: 0.0, fiber: 0.4, sugar: 6.2, sodium: 2 }, processed: 0 },
  uvas: { name: "Uvas", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, saturated_fat: 0.1, fiber: 0.9, sugar: 15.5, sodium: 2 }, processed: 0 },

  /* =========================
     LEGUMBRES
     ========================= */
  alubias: { name: "Alubias cocidas", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 110, protein: 7.5, carbs: 19.7, fat: 0.5, saturated_fat: 0.1, fiber: 6.3, sugar: 0.6, sodium: 5 }, processed: 1 },
  edamame: { name: "Edamame", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 121, protein: 11.9, carbs: 8.9, fat: 5.2, saturated_fat: 0.7, fiber: 5.2, sugar: 2.2, sodium: 6 }, processed: 2 },
  garbanzos: { name: "Garbanzos cocidos", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, saturated_fat: 0.3, fiber: 7.6, sugar: 4.8, sodium: 7 }, processed: 1 },
  guisantes: { name: "Guisantes", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 81, protein: 5.4, carbs: 14.5, fat: 0.4, saturated_fat: 0.1, fiber: 5.1, sugar: 5.7, sodium: 5 }, processed: 0 },
  hummus: { name: "Hummus", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 166, protein: 7.9, carbs: 14.3, fat: 9.6, saturated_fat: 1.4, fiber: 6.0, sugar: 0.3, sodium: 300 }, processed: 4 },
  lentejas: { name: "Lentejas cocidas", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 116, protein: 9.0, carbs: 20.1, fat: 0.4, saturated_fat: 0.1, fiber: 7.9, sugar: 1.8, sodium: 2 }, processed: 1 },

  /* =========================
     CEREALES, PANES Y TUBÉRCULOS
     ========================= */
  arroz: { name: "Arroz cocido", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3, saturated_fat: 0.1, fiber: 0.4, sugar: 0.1, sodium: 1 }, processed: 1 },
  arroz_integral: { name: "Arroz integral cocido", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 123, protein: 2.7, carbs: 25.6, fat: 1.0, saturated_fat: 0.2, fiber: 1.8, sugar: 0.4, sodium: 2 }, processed: 1 },
  avena: { name: "Avena", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, saturated_fat: 1.2, fiber: 10.6, sugar: 0.9, sodium: 2 }, processed: 1 },
  batata: { name: "Batata", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 90, protein: 2.0, carbs: 21.0, fat: 0.2, saturated_fat: 0.0, fiber: 3.0, sugar: 4.2, sodium: 36 }, processed: 0 },
  cuscus: { name: "Cuscús cocido", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 112, protein: 3.8, carbs: 23.2, fat: 0.2, saturated_fat: 0.0, fiber: 1.4, sugar: 0.1, sodium: 5 }, processed: 2 },
  pan: { name: "Pan", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 250, protein: 9.0, carbs: 49.0, fat: 3.2, saturated_fat: 0.7, fiber: 2.7, sugar: 5.0, sodium: 490 }, processed: 5 },
  pan_centeno: { name: "Pan de centeno", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 259, protein: 8.5, carbs: 48.0, fat: 3.3, saturated_fat: 0.6, fiber: 6.0, sugar: 5.0, sodium: 600 }, processed: 5 },
  pan_integral: { name: "Pan integral", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 240, protein: 9.0, carbs: 42.0, fat: 4.0, saturated_fat: 0.8, fiber: 6.0, sugar: 5.0, sodium: 450 }, processed: 4 },
  pasta_integral: { name: "Pasta integral cocida", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 124, protein: 5.0, carbs: 26.0, fat: 0.9, saturated_fat: 0.2, fiber: 3.0, sugar: 1.0, sodium: 6 }, processed: 3 },
  patata: { name: "Patata cocida", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 87, protein: 2.0, carbs: 20.1, fat: 0.1, saturated_fat: 0.0, fiber: 1.8, sugar: 0.9, sodium: 7 }, processed: 0 },
  quinoa: { name: "Quinoa cocida", category: "🍚 Cereales, legumbres y tubérculos", unit: "g", nutritionPer100: { kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9, saturated_fat: 0.2, fiber: 2.8, sugar: 0.9, sodium: 7 }, processed: 1 },

  /* =========================
     PROTEÍNAS (CARNES, PESCADOS, MARISCOS, VEGETALES)
     ========================= */
  atun: { name: "Atún", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 109, protein: 24.0, carbs: 0.0, fat: 1.0, saturated_fat: 0.3, fiber: 0.0, sugar: 0.0, sodium: 50 }, processed: 2 },
  atun_lata_natural: { name: "Atún al natural (lata)", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 116, protein: 26.0, carbs: 0.0, fat: 1.0, saturated_fat: 0.3, fiber: 0.0, sugar: 0.0, sodium: 300 }, processed: 5 },
  bacalao: { name: "Bacalao", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 82, protein: 18.0, carbs: 0.0, fat: 0.7, saturated_fat: 0.1, fiber: 0.0, sugar: 0.0, sodium: 54 }, processed: 1 },
  bonito: { name: "Bonito", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 140, protein: 24.0, carbs: 0.0, fat: 5.0, saturated_fat: 1.3, fiber: 0.0, sugar: 0.0, sodium: 60 }, processed: 1 },
  calamar: { name: "Calamar", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 92, protein: 15.6, carbs: 3.1, fat: 1.4, saturated_fat: 0.4, fiber: 0.0, sugar: 0.0, sodium: 44 }, processed: 1 },
  conejo: { name: "Conejo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 136, protein: 21.0, carbs: 0.0, fat: 5.5, saturated_fat: 1.5, fiber: 0.0, sugar: 0.0, sodium: 45}, processed: 1 },
  cordero: {name: "Cordero", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 250, protein: 25.0, carbs: 0.0, fat: 20.0, saturated_fat: 9.0, fiber: 0.0, sugar: 0.0, sodium: 70}, processed: 2 },
  carne_magra: { name: "Carne magra", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 140, protein: 26.0, carbs: 0.0, fat: 4.0, saturated_fat: 1.5, fiber: 0.0, sugar: 0.0, sodium: 70 }, processed: 2 },
  claras_huevo: { name: "Claras de huevo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 52, protein: 11.0, carbs: 1.0, fat: 0.2, saturated_fat: 0.0, fiber: 0.0, sugar: 1.0, sodium: 166 }, processed: 3 },
  gambas: { name: "Gambas", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 99, protein: 24.0, carbs: 0.2, fat: 0.3, saturated_fat: 0.1, fiber: 0.0, sugar: 0.0, sodium: 150 }, processed: 1 },
  hamburguesa_magra: { name: "Hamburguesa magra", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 170, protein: 20.0, carbs: 2.0, fat: 10.0, saturated_fat: 4.0, fiber: 0.0, sugar: 0.5, sodium: 450 }, processed: 6 },
  huevo: { name: "Huevo", category: "🥩 Proteínas", unit: "ud", nutritionPerUnit: { kcal: 78, protein: 6.5, carbs: 0.6, fat: 5.3, saturated_fat: 1.6, fiber: 0.0, sugar: 0.6, sodium: 62 }, processed: 1 },
  lomo_cerdo: { name: "Lomo de cerdo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 143, protein: 22.0, carbs: 0.0, fat: 5.9, saturated_fat: 2.0, fiber: 0.0, sugar: 0.0, sodium: 62 }, processed: 2 },
  mejillones: { name: "Mejillones", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 172, protein: 24.0, carbs: 7.4, fat: 4.5, saturated_fat: 1.2, fiber: 0.0, sugar: 0.0, sodium: 286 }, processed: 1 },
  merluza: { name: "Merluza", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 73, protein: 16.0, carbs: 0.0, fat: 1.0, saturated_fat: 0.2, fiber: 0.0, sugar: 0.0, sodium: 60 }, processed: 1 },
  pavo: { name: "Pavo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 110, protein: 24.0, carbs: 0.0, fat: 1.0, saturated_fat: 0.3, fiber: 0.0, sugar: 0.0, sodium: 70 }, processed: 1 },
  pechuga_pollo: { name: "Pechuga de pollo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 165, protein: 31.0, carbs: 0.0, fat: 2.0, saturated_fat: 1.0, fiber: 0.0, sugar: 0.0, sodium: 74 }, processed: 1 },
  pechuga_pavo: { name: "Pechuga de pavo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 135, protein: 29.0, carbs: 0.0, fat: 1.6, saturated_fat: 0.4, fiber: 0.0, sugar: 0.0, sodium: 80 }, processed: 2 },
  pescado_azul: { name: "Pescado azul", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 200, protein: 20.0, carbs: 0.0, fat: 13.0, saturated_fat: 3.0, fiber: 0.0, sugar: 0.0, sodium: 70 }, processed: 1 },
  pescado_blanco: { name: "Pescado blanco", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 90, protein: 20.0, carbs: 0.0, fat: 1.0, saturated_fat: 0.2, fiber: 0.0, sugar: 0.0, sodium: 70 }, processed: 1 },
  pollo: { name: "Pollo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6, saturated_fat: 1.0, fiber: 0.0, sugar: 0.0, sodium: 74 }, processed: 1 },
  pulpo: { name: "Pulpo", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 82, protein: 15.0, carbs: 2.0, fat: 1.0, saturated_fat: 0.2, fiber: 0.0, sugar: 0.0, sodium: 230 }, processed: 1 },
  salmon: { name: "Salmón", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 208, protein: 20.0, carbs: 0.0, fat: 13.0, saturated_fat: 3.1, fiber: 0.0, sugar: 0.0, sodium: 59 }, processed: 1 },
  sardinas: { name: "Sardinas", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 208, protein: 25.0, carbs: 0.0, fat: 11.0, saturated_fat: 2.0, fiber: 0.0, sugar: 0.0, sodium: 120 }, processed: 2 },
  tempeh: { name: "Tempeh", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 193, protein: 20.0, carbs: 9.0, fat: 11.0, saturated_fat: 2.2, fiber: 1.4, sugar: 0.5, sodium: 9 }, processed: 3 },
  ternera: { name: "Ternera", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 170, protein: 26.0, carbs: 0.0, fat: 7.0, saturated_fat: 3.0, fiber: 0.0, sugar: 0.0, sodium: 72 }, processed: 2 },
  tofu: { name: "Tofu", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 76, protein: 8.0, carbs: 1.9, fat: 4.8, saturated_fat: 0.7, fiber: 0.3, sugar: 0.3, sodium: 7 }, processed: 2 },

  /* =========================
     LÁCTEOS Y QUESOS
     ========================= */
  kefir: { name: "Kéfir", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 60, protein: 3.5, carbs: 4.8, fat: 3.3, saturated_fat: 2.1, fiber: 0.0, sugar: 4.8, sodium: 40 }, processed: 4 },
  leche: { name: "Leche", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 42, protein: 3.4, carbs: 5.0, fat: 1.0, saturated_fat: 0.6, fiber: 0.0, sugar: 5.0, sodium: 44 }, processed: 2 },
  mozzarella: { name: "Mozzarella", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 280, protein: 28.0, carbs: 3.0, fat: 17.0, saturated_fat: 10.0, fiber: 0.0, sugar: 1.0, sodium: 620 }, processed: 6 },
  queso_emmental: { name: "Queso emmental", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 380, protein: 29.0, carbs: 4.0, fat: 29.0, saturated_fat: 18.0, fiber: 0.0, sugar: 0.5, sodium: 300 }, processed: 6 },
  queso_fresco: { name: "Queso fresco", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 98, protein: 11.0, carbs: 3.0, fat: 4.0, saturated_fat: 2.5, fiber: 0.0, sugar: 3.0, sodium: 400 }, processed: 4 },
  yogur_griego: { name: "Yogur griego", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 120, protein: 10.0, carbs: 4.0, fat: 8.0, saturated_fat: 5.0, fiber: 0.0, sugar: 4.0, sodium: 40 }, processed: 4 },
  yogur_natural: { name: "Yogur natural", category: "🥛 Lácteos", unit: "g", nutritionPer100: { kcal: 60, protein: 4.0, carbs: 5.0, fat: 3.0, saturated_fat: 2.0, fiber: 0.0, sugar: 5.0, sodium: 36 }, processed: 3 },

  /* =========================
     GRASAS, FRUTOS SECOS Y SEMILLAS
     ========================= */
  aceite_oliva: { name: "Aceite de oliva", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 900, protein: 0.0, carbs: 0.0, fat: 100.0, saturated_fat: 14.0, fiber: 0.0, sugar: 0.0, sodium: 0 }, processed: 2 },
  aceitunas: { name: "Aceitunas", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 145, protein: 1.0, carbs: 3.8, fat: 15.3, saturated_fat: 2.0, fiber: 3.3, sugar: 0.0, sodium: 735 }, processed: 6 },
  almendras: { name: "Almendras", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 579, protein: 21.0, carbs: 22.0, fat: 50.0, saturated_fat: 3.8, fiber: 12.5, sugar: 4.4, sodium: 1 }, processed: 1 },
  cacahuetes: { name: "Cacahuetes", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 567, protein: 26.0, carbs: 16.0, fat: 49.0, saturated_fat: 7.0, fiber: 8.5, sugar: 4.7, sodium: 18 }, processed: 3 },
  frutos_secos: { name: "Frutos secos", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 600, protein: 18.0, carbs: 16.0, fat: 55.0, saturated_fat: 7.0, fiber: 8.0, sugar: 4.0, sodium: 5 }, processed: 3 },
  mantequilla: { name: "Mantequilla", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 717, protein: 0.9, carbs: 0.1, fat: 81.0, saturated_fat: 51.0, fiber: 0.0, sugar: 0.1, sodium: 11 }, processed: 6 },
  nueces: { name: "Nueces", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 654, protein: 15.0, carbs: 14.0, fat: 65.0, saturated_fat: 6.0, fiber: 6.7, sugar: 2.6, sodium: 2 }, processed: 1 },
  semillas_chia: { name: "Semillas de chía", category: "🥑 Grasas, frutos secos y semillas", unit: "g", nutritionPer100: { kcal: 486, protein: 17.0, carbs: 42.0, fat: 31.0, saturated_fat: 3.3, fiber: 34.0, sugar: 0.0, sodium: 16 }, processed: 1 },

  /* =========================
     CONDIMENTOS, ESPECIAS Y SALSES BÁSICAS
     ========================= */
  canela: { name: "Canela", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 247, protein: 4.0, carbs: 81.0, fat: 1.2, saturated_fat: 0.3, fiber: 53.0, sugar: 2.2, sodium: 10 }, processed: 2 },
  comino: { name: "Comino", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 375, protein: 18.0, carbs: 44.0, fat: 22.0, saturated_fat: 1.5, fiber: 10.5, sugar: 2.3, sodium: 168 }, processed: 2 },
  curry: { name: "Curry en polvo", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 325, protein: 14.0, carbs: 58.0, fat: 14.0, saturated_fat: 2.1, fiber: 33.0, sugar: 2.8, sodium: 52 }, processed: 3 },
  mostaza: { name: "Mostaza", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 66, protein: 4.4, carbs: 5.8, fat: 4.4, saturated_fat: 0.2, fiber: 3.3, sugar: 1.8, sodium: 1135 }, processed: 7 },
  oregano: { name: "Orégano", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 265, protein: 9.0, carbs: 69.0, fat: 4.3, saturated_fat: 1.6, fiber: 42.0, sugar: 4.1, sodium: 25 }, processed: 2 },
  pimenton: { name: "Pimentón", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 282, protein: 14.0, carbs: 54.0, fat: 13.0, saturated_fat: 2.1, fiber: 35.0, sugar: 10.3, sodium: 68 }, processed: 2 },
  pimienta_negra: { name: "Pimienta negra", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 251, protein: 10.4, carbs: 64.0, fat: 3.3, saturated_fat: 1.4, fiber: 26.5, sugar: 0.6, sodium: 20 }, processed: 2 },
  sal: { name: "Sal", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturated_fat: 0.0, fiber: 0.0, sugar: 0.0, sodium: 38758 }, processed: 3 },
  vinagre: { name: "Vinagre", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 18, protein: 0.0, carbs: 0.04, fat: 0.0, saturated_fat: 0.0, fiber: 0.0, sugar: 0.04, sodium: 2 }, processed: 2 },
  vinagre_balsamico: { name: "Vinagre balsámico", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 88, protein: 0.5, carbs: 17.0, fat: 0.0, saturated_fat: 0.0, fiber: 0.0, sugar: 15.0, sodium: 23 }, processed: 4 },
  miel: { name: "Miel", category: "🧂 Condimentos y especias", unit: "g", nutritionPer100: { kcal: 304, protein: 0.3, carbs: 82.4, fat: 0.0, saturated_fat: 0.0, fiber: 0.2, sugar: 82.1, sodium: 4 }, processed: 2 },

  /* =========================
     BEBIDAS E INFUSIONES
     ========================= */
  cafe: { name: "Café", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturated_fat: 0.0, fiber: 0.0, sugar: 0.0, sodium: 5 }, processed: 1 },
  infusion: { name: "Infusión", category: "☕ Bebidas", unit: "ud", nutritionPerUnit: { kcal: 0, protein: 0.0, carbs: 0.0, fat: 0.0, saturated_fat: 0.0, fiber: 0.0, sugar: 0.0, sodium: 5 }, processed: 1 },

  /* =========================
     GENÉRICOS
     ========================= */
  ensalada: { name: "Ensalada mix", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 20, protein: 1.2, carbs: 3.5, fat: 0.2, saturated_fat: 0.0, fiber: 1.5, sugar: 1.8, sodium: 25 }, processed: 1 },
  fruta: { name: "Fruta variada", category: "🍎 Fruta", unit: "g", nutritionPer100: { kcal: 55, protein: 0.7, carbs: 13.0, fat: 0.2, saturated_fat: 0.0, fiber: 2.0, sugar: 10.0, sodium: 2 }, processed: 1 },
  verduras: { name: "Verduras mix", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 30, protein: 2.0, carbs: 6.0, fat: 0.3, saturated_fat: 0.0, fiber: 2.0, sugar: 3.0, sodium: 20 }, processed: 1 },

  /* =========================
     MENOS SALUDABLES / PROCESADOS
     ========================= */
  jamon_iberico: { name: "Jamón ibérico", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 250, protein: 33.0, carbs: 0.0, fat: 13.0, saturated_fat: 4.5, fiber: 0.0, sugar: 0.0, sodium: 1800 }, processed: 7 },
  jamon_york: { name: "Jamón york", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 110, protein: 18.0, carbs: 2.0, fat: 3.0, saturated_fat: 1.0, fiber: 0.0, sugar: 1.0, sodium: 1000 }, processed: 7 },
  patatas_fritas: { name: "Patatas fritas", category: "📦 Otros / Procesados", unit: "g", nutritionPer100: { kcal: 536, protein: 7.0, carbs: 53.0, fat: 35.0, saturated_fat: 5.0, fiber: 4.0, sugar: 0.5, sodium: 525 }, processed: 9 },
  pepinillos_encurtidos: { name: "Pepinillos encurtidos", category: "🥔 Verduras y hortalizas", unit: "g", nutritionPer100: { kcal: 11, protein: 0.5, carbs: 2.3, fat: 0.2, saturated_fat: 0.0, fiber: 1.2, sugar: 1.2, sodium: 1200 }, processed: 6 },
  salmon_ahumado: { name: "Salmón ahumado", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 117, protein: 18.3, carbs: 0.0, fat: 4.3, saturated_fat: 0.9, fiber: 0.0, sugar: 0.0, sodium: 1200 }, processed: 7 },
  surimi: { name: "Surimi (cangrejo)", category: "🥩 Proteínas", unit: "g", nutritionPer100: { kcal: 95, protein: 7.5, carbs: 15.0, fat: 0.5, saturated_fat: 0.1, fiber: 0.5, sugar: 6.5, sodium: 700 }, processed: 8 },

  /* =========================
     SUPLEMENTOS
     ========================= */
  suplemento_proteina: { name: "Suplemento de proteína", category: "💊 Suplementos", unit: "g", nutritionPer100: { kcal: 400, protein: 80.0, carbs: 8.0, fat: 6.0, saturated_fat: 2.0, fiber: 2.0, sugar: 3.0, sodium: 500 }, processed: 7 },

};