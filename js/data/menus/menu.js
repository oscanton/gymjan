/* =========================================
   data/menu.js - DATOS
   ========================================= */

// --- 3. PLAN: MENÚS SEMANAL ---
window.MENU_DATA = [
    {
        day: "Lunes",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "yogur_griego", amount: 125 }, { foodId: "proteina", amount: 35 }, { foodId: "frutos_rojos", amount: 100 }],
            description: "Foco en grasas saludables y antioxidantes."
        },
        lunch: {
            items: [{ foodId: "lomo_cerdo", amount: 200 }, { foodId: "pan_integral", amount: 50 }, { foodId: "aceite_oliva", amount: 10 }, { foodId: "ensalada", amount: 300 }, { foodId: "fruta", amount: 200 }],
            description: "Comida limpia con aporte graso controlado."
        },
        dinner: {
            items: [{ foodId: "huevo", amount: 2 }, { foodId: "patata", amount: 250 }, { foodId: "judias_verdes", amount: 200 }, { foodId: "aceite_oliva", amount: 10 }, { foodId: "yogur_natural", amount: 125 }],
            description: "Recuperación post-fuerza: Proteína + Glucógeno."
        }
    },
    {
        day: "Martes",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "pan_integral", amount: 80 }, { foodId: "tomate", amount: 60 }, { foodId: "pavo", amount: 100 }],
            description: "Tostada clásica y rápida."
        },
        lunch: {
            items: [{ foodId: "pollo", amount: 200 }, { foodId: "arroz", amount: 130 }, { foodId: "calabacin", amount: 200 }, { foodId: "fruta", amount: 200 }],
            description: "Pollo con base de arroz y vegetal."
        },
        dinner: {
            items: [{ foodId: "merluza", amount: 200 }, { foodId: "pan_integral", amount: 40 }, { foodId: "aceite_oliva", amount: 5 }, { foodId: "ensalada", amount: 300 }, { foodId: "tomate", amount: 120 }],
            description: "Cena ligera de descanso."
        }
    },
    {
        day: "Miércoles",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "proteina", amount: 35 }, { foodId: "platano", amount: 150 }, { foodId: "frutos_secos", amount: 20 }],
            description: "Rápido, saciante y energético."
        },
        lunch: {
            items: [{ foodId: "quinoa", amount: 150 }, { foodId: "atun", amount: 150 }, { foodId: "aguacate", amount: 120 }, { foodId: "tomate", amount: 120 }, { foodId: "yogur_natural", amount: 125 }],
            description: "Bowl de quinoa con grasas vegetales."
        },
        dinner: {
            items: [{ foodId: "lomo_cerdo", amount: 180 }, { foodId: "aceite_oliva", amount: 5 }, { foodId: "patata", amount: 180 }, { foodId: "espinacas", amount: 150 }, { foodId: "kiwi", amount: 150 }],
            description: "Post-entreno: Magro y patata."
        }
    },
    {
        day: "Jueves",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "yogur_griego", amount: 125 }, { foodId: "avena", amount: 50 }, { foodId: "fruta", amount: 150 }],
            description: "Lácteo, cereal y fruta fresca."
        },
        lunch: {
            items: [{ foodId: "lentejas", amount: 250 }, { foodId: "arroz", amount: 50 }, { foodId: "zanahoria", amount: 50 }, { foodId: "yogur_natural", amount: 125 }, { foodId: "proteina", amount: 35 }],
            description: "Legumbre con cereal (protein complete)."
        },
        dinner: {
            items: [{ foodId: "huevo", amount: 2 }, { foodId: "champinones", amount: 250 }, { foodId: "pimiento", amount: 100 }, { foodId: "aceite_oliva", amount: 10 }],
            description: "Cena ligera low-carb."
        }
    },
    {
        day: "Viernes",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "pan_integral", amount: 80 }, { foodId: "huevo", amount: 2 }, { foodId: "aceite_oliva", amount: 10 }],
            description: "Base proteica y grasa para el día."
        },
        lunch: {
            items: [{ foodId: "salmon", amount: 200 }, { foodId: "coliflor", amount: 200 }, { foodId: "brocoli", amount: 200 }, { foodId: "yogur_natural", amount: 125 }],
            description: "Saciante y antiinflamatoria (Omega-3)."
        },
        dinner: {
            items: [{ foodId: "pollo", amount: 200 }, { foodId: "patata", amount: 200 }, { foodId: "ensalada", amount: 200 }, { foodId: "fruta", amount: 200 }],
            description: "Carga de micronutrientes y fibra."
        }
    },
    {
        day: "Sábado",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "proteina", amount: 35 }, { foodId: "pan_integral", amount: 80 }, { foodId: "frutos_secos", amount: 15 }],
            description: "Pre-actividad aeróbica."
        },
        lunch: {
            items: [{ foodId: "pavo", amount: 200 }, { foodId: "cuscus", amount: 100 }, { foodId: "pimiento", amount: 200 }, { foodId: "aceite_oliva", amount: 5 }, { foodId: "fruta", amount: 200 }],
            description: "Comida de sábado balanceada."
        },
        dinner: {
            items: [{ foodId: "calamar", amount: 200 }, { foodId: "ensalada", amount: 200 }, { foodId: "aceite_oliva", amount: 5 }, { foodId: "yogur_natural", amount: 125 }],
            description: "Proteína limpia del mar."
        }
    },
    {
        day: "Domingo",
        breakfast: {
            items: [{ foodId: "cafe", amount: 1 }, { foodId: "pan_integral", amount: 40 }, { foodId: "queso_fresco", amount: 250 }, { foodId: "fruta", amount: 200 }],
            description: "Lácteo fresco y fruta."
        },
        lunch: {
            items: [{ foodId: "ternera", amount: 200 }, { foodId: "pan_integral", amount: 40 }, { foodId: "ensalada", amount: 300 }, { foodId: "aceite_oliva", amount: 5 }, { foodId: "yogur_natural", amount: 125 }],
            description: "Carne roja magra y saciedad."
        },
        dinner: {
            items: [{ foodId: "verduras", amount: 350 }, { foodId: "aceite_oliva", amount: 5 }, { foodId: "huevo", amount: 2 }],
            description: "Reset digestivo para la semana."
        }
    }
];

