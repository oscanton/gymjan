/* =========================================
   data/menu.js - DATOS
   ========================================= */

window.MENU_DATA = [
    {
        dia: "Lunes",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "avena", amount: 60 },
                { foodId: "yogur_natural", amount: 125 },
                { foodId: "aguacate", amount: 80 }
            ],
            description: "Desayuno completo y saciante, con hidratos complejos y proteína para arrancar el día con energía estable."
        },
        comida: {
            items: [
                { foodId: "lomo_cerdo", amount: 220 },
                { foodId: "arroz", amount: 120 },
                { foodId: "calabacin", amount: 200 },
                { foodId: "tomate", amount: 80 },
                { foodId: "fruta", amount: 100 }
            ],
            description: "Plato principal equilibrado, rico en proteína y carbohidratos complejos, ideal para sostener el entrenamiento de la tarde."
        },
        cena: {
            items: [
                { foodId: "merluza", amount: 220 },
                { foodId: "coliflor", amount: 220 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "kefir", amount: 125 },
                { foodId: "suplemento_proteina", amount: 30 }
            ],
            description: "Cena ligera y digestiva, rica en proteína y fibra, pensada para favorecer la recuperación tras el entrenamiento."
        }
    },
    {
        dia: "Martes",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "pan_integral", amount: 80 },
                { foodId: "tomate", amount: 100 },
                { foodId: "pavo", amount: 100 }
            ],
            description: "Desayuno sencillo y proteico, con hidratos integrales que aportan saciedad sin exceso calórico."
        },
        comida: {
            items: [
                { foodId: "pollo", amount: 220 },
                { foodId: "patata", amount: 100 },
                { foodId: "tomate", amount: 100 },
                { foodId: "lechuga", amount: 200 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "yogur_natural", amount: 125 }
            ],
            description: "Comida rica en fibra y proteína vegetal, muy beneficiosa para la salud intestinal y la saciedad."
        },
        cena: {
            items: [
                { foodId: "salmon", amount: 160 },
                { foodId: "espinacas", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena nutritiva con grasas saludables y verduras, fácil de digerir y adecuada para un día sin entrenamiento."
        }
    },
    {
        dia: "Miércoles",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "huevo", amount: 2 },
                { foodId: "pan_integral", amount: 80 },
                { foodId: "tomate", amount: 80 },
                { foodId: "fruta", amount: 150 }
            ],
            description: "Desayuno equilibrado con proteína y carbohidratos, ideal para mantener energía constante durante la mañana."
        },
        comida: {
            items: [
                { foodId: "ternera", amount: 200 },
                { foodId: "quinoa", amount: 150 },
                { foodId: "pimiento", amount: 150 },
                { foodId: "calabacin", amount: 150 },
                { foodId: "aceite_oliva", amount: 10 },
                { foodId: "yogur_natural", amount: 125 }
            ],
            description: "Comida completa y variada, con buen aporte de proteína y carbohidratos complejos para el entrenamiento."
        },
        cena: {
            items: [
                { foodId: "pavo", amount: 250 },
                { foodId: "alcachofa", amount: 150 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena ligera, rica en proteína magra y verduras, que facilita la digestión y el descanso nocturno."
        }
    },
    {
        dia: "Jueves",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "suplemento_proteina", amount: 30 },
                { foodId: "kefir", amount: 125 },
                { foodId: "avena", amount: 50 },
                { foodId: "fruta", amount: 150 }
            ],
            description: "Desayuno rápido y proteico, ideal si hay poco tiempo por la mañana."
        },
        comida: {
            items: [
                { foodId: "atun", amount: 250 },
                { foodId: "patata", amount: 100 },
                { foodId: "tomate", amount: 120 },
                { foodId: "lechuga", amount: 180 },
                { foodId: "nueces", amount: 10 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "yogur_natural", amount: 125 }
            ],
            description: "Comida equilibrada con proteína magra, hidratos moderados y verduras variadas."
        },
        cena: {
            items: [
                { foodId: "calamar", amount: 250 },
                { foodId: "cebolla", amount: 50 },
                { foodId: "calabacin", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena sencilla y baja en carga digestiva, pensada para mantener el déficit sin pasar hambre."
        }
    },
    {
        dia: "Viernes",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "yogur_natural", amount: 170 },
                { foodId: "avena", amount: 40 },
                { foodId: "suplemento_proteina", amount: 30 },
                { foodId: "fruta", amount: 100 }
            ],
            description: "Desayuno ligero pero saciante, con hidratos complejos y proteína para un día activo."
        },
        comida: {
            items: [
                { foodId: "pavo", amount: 250 },
                { foodId: "cuscus", amount: 100 },
                { foodId: "guisantes", amount: 120 },
                { foodId: "pimiento", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "yogur_natural", amount: 125 }
            ],
            description: "Comida completa con buen aporte energético, ideal para rendir en el entrenamiento posterior."
        },
        cena: {
            items: [
                { foodId: "huevo", amount: 3 },
                { foodId: "champinones", amount: 250 },
                { foodId: "patata", amount: 80 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena proteica y reconfortante, con alimentos fáciles de digerir tras el esfuerzo físico."
        }
    },
    {
        dia: "Sábado",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "pan_integral", amount: 80 },
                { foodId: "tomate", amount: 80 },
                { foodId: "queso_fresco", amount: 125 },
                { foodId: "fruta", amount: 100 }
            ],
            description: "Desayuno equilibrado, con proteína y fruta, pensado para un día más relajado."
        },
        comida: {
            items: [
                { foodId: "salmon", amount: 200 },
                { foodId: "brocoli", amount: 200 },
                { foodId: "zanahoria", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "fruta", amount: 200 }
            ],
            description: "Comida rica en grasas saludables y verduras, muy saciante y nutritiva."
        },
        cena: {
            items: [
                { foodId: "pollo", amount: 200 },
                { foodId: "coliflor", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena sencilla y proteica, con verduras cocidas que facilitan la digestión."
        }
    },
    {
        dia: "Domingo",
        desayuno: {
            items: [
                { foodId: "cafe", amount: 1 },
                { foodId: "huevo", amount: 2 },
                { foodId: "aguacate", amount: 80 },
                { foodId: "pan_integral", amount: 80 }
            ],
            description: "Desayuno completo y saciante, con grasas saludables y proteína."
        },
        comida: {
            items: [
                { foodId: "lentejas", amount: 250 },
                { foodId: "zanahoria", amount: 100 },
                { foodId: "puerro", amount: 100 },
                { foodId: "aceite_oliva", amount: 5 },
                { foodId: "yogur_natural", amount: 125 }
            ],
            description: "Comida equilibrada y tradicional, con buena combinación de proteína, hidratos y verduras."
        },
        cena: {
            items: [
                { foodId: "merluza", amount: 220 },
                { foodId: "esparragos", amount: 200 },
                { foodId: "espinacas", amount: 250 },
                { foodId: "aceite_oliva", amount: 5 }
            ],
            description: "Cena ligera y vegetal, ideal para cerrar la semana sin sensación de pesadez."
        }
    }
];
