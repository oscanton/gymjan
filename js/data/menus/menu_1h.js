/* =========================================
   data/menu.js - DATOS (ADAPTADO)
   ========================================= */

window.MENU_DATA = [
    {
        day: "Lunes",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 }, // evitar justo tras comidas con hierro
                { foodId: "avena", amount: 60 },
                { foodId: "yogur_natural", amount: 125 },
                { foodId: "aguacate", amount: 80 }
            ],
            description: "Desayuno completo. Mantener café separado de comidas ricas en hierro."
        },
        lunch: {
            items: [
                { foodId: "lentejas", amount: 250 },
                { foodId: "pimiento", amount: 120 }, // vitamina C clave
                { foodId: "huevo", amount: 2 },
                { foodId: "tomate", amount: 80 },
                { foodId: "fruta", amount: 100 }
            ],
            description: "Comida rica en hierro vegetal con mejora de absorción gracias a vitamina C."
        },
        dinner: {
            items: [
                { foodId: "salmon", amount: 200 },
                { foodId: "coliflor", amount: 220 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "kefir", amount: 125 }
            ],
            description: "Cena con grasas saludables para mantener HDL alto."
        }
    },
    {
        day: "Martes",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "pan_integral", amount: 80 },
                { foodId: "tomate", amount: 100 },
                { foodId: "pavo", amount: 100 }
            ],
            description: "Desayuno equilibrado."
        },
        lunch: {
            items: [
                { foodId: "ternera", amount: 220 }, // hierro hemo clave
                { foodId: "arroz", amount: 120 },
                { foodId: "pimiento", amount: 100 },
                { foodId: "lechuga", amount: 200 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Comida clave de la semana para subir hierro biodisponible."
        },
        dinner: {
            items: [
                { foodId: "espinacas", amount: 250 },
                { foodId: "huevo", amount: 2 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena ligera con aporte extra de hierro vegetal."
        }
    },
    {
        day: "Miércoles",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "huevo", amount: 2 },
                { foodId: "pan_integral", amount: 80 },
                { foodId: "tomate", amount: 80 },
                { foodId: "fruta", amount: 150 }
            ],
            description: "Desayuno completo y energético."
        },
        lunch: {
            items: [
                { foodId: "garbanzos", amount: 250 },
                { foodId: "espinacas", amount: 150 },
                { foodId: "pimiento", amount: 150 },
                { foodId: "aceite_oliva", amount: 10 }
            ],
            description: "Comida vegetal rica en hierro con buena absorción."
        },
        dinner: {
            items: [
                { foodId: "sardinas", amount: 200 }, // omega 3 + hierro
                { foodId: "calabacin", amount: 200 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena excelente para perfil lipídico y micronutrientes."
        }
    },
    {
        day: "Jueves",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "proteina", amount: 30 },
                { foodId: "kefir", amount: 125 },
                { foodId: "avena", amount: 50 },
                { foodId: "fruta", amount: 150 }
            ],
            description: "Desayuno rápido y completo."
        },
        lunch: {
            items: [
                { foodId: "atun", amount: 250 },
                { foodId: "patata", amount: 100 },
                { foodId: "tomate", amount: 120 },
                { foodId: "pimiento", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Comida equilibrada con aporte proteico y vitamina C."
        },
        dinner: {
            items: [
                { foodId: "calamar", amount: 250 },
                { foodId: "cebolla", amount: 50 },
                { foodId: "calabacin", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena ligera y digestiva."
        }
    },
    {
        day: "Viernes",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "yogur_natural", amount: 170 },
                { foodId: "avena", amount: 40 },
                { foodId: "proteina", amount: 30 },
                { foodId: "fruta", amount: 100 }
            ],
            description: "Desayuno equilibrado."
        },
        lunch: {
            items: [
                { foodId: "ternera", amount: 220 }, // segunda dosis semanal
                { foodId: "patata", amount: 120 },
                { foodId: "pimiento", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Refuerzo de hierro hemo para mejorar anemia."
        },
        dinner: {
            items: [
                { foodId: "huevo", amount: 3 },
                { foodId: "champinones", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena proteica y ligera."
        }
    },
    {
        day: "Sábado",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "pan_integral", amount: 80 },
                { foodId: "tomate", amount: 80 },
                { foodId: "queso_fresco", amount: 125 },
                { foodId: "fruta", amount: 100 }
            ],
            description: "Desayuno equilibrado."
        },
        lunch: {
            items: [
                { foodId: "salmon", amount: 200 },
                { foodId: "brocoli", amount: 200 },
                { foodId: "zanahoria", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Comida rica en omega 3 y antioxidantes."
        },
        dinner: {
            items: [
                { foodId: "pollo", amount: 200 },
                { foodId: "coliflor", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena sencilla y digestiva."
        }
    },
    {
        day: "Domingo",
        breakfast: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "huevo", amount: 2 },
                { foodId: "aguacate", amount: 80 },
                { foodId: "pan_integral", amount: 80 }
            ],
            description: "Desayuno completo."
        },
        lunch: {
            items: [
                { foodId: "lentejas", amount: 250 },
                { foodId: "zanahoria", amount: 100 },
                { foodId: "pimiento", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Comida rica en hierro vegetal bien absorbido."
        },
        dinner: {
            items: [
                { foodId: "merluza", amount: 220 },
                { foodId: "espinacas", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena ligera para cerrar la semana."
        }
    }
];