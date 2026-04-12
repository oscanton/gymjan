I18nRegistry.registerLocale('es', {
    meta: {
        code: 'es',
        label: 'Espa\u00F1ol'
    },
    common: {
        index: '\u00CDndice',
        edit: 'Editar',
        done: 'Listo',
        reset: 'Reset',
        add: 'A\u00F1adir',
        delete: 'Eliminar',
        ok: 'OK',
        misc: 'Varios',
        empty: 'Lista vac\u00EDa.',
        language_aria: 'Cambiar idioma',
        open_index_aria: 'Abrir \u00EDndice'
    },
    nav: {
        home: 'Inicio',
        calculator: 'Calculadora',
        activity: 'Actividad',
        menu: 'Men\u00FA',
        list: 'Lista'
    },
    weekDays: {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Mi\u00E9rcoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'S\u00E1bado',
        sunday: 'Domingo'
    },
    metrics: {
        kcal: { label: 'Kcal', shortLabel: 'Kcal', description: 'Define la energ\u00EDa diaria total. Un exceso sostenido puede favorecer ganancia de grasa; un d\u00E9ficit excesivo puede reducir rendimiento y recuperaci\u00F3n.' },
        protein: { label: 'Prote\u00EDna', shortLabel: 'Prot', description: 'La prote\u00EDna ayuda a conservar y construir masa muscular, y mejora la saciedad. Un aporte bajo sostenido puede limitar recuperaci\u00F3n y mantenimiento muscular.' },
        carbs: { label: 'Carbohidratos', shortLabel: 'Carb', description: 'Los carbohidratos son el combustible principal para entrenar y recuperar gluc\u00F3geno. Un aporte muy bajo puede reducir energ\u00EDa, rendimiento e intensidad.' },
        fat: { label: 'Grasas', shortLabel: 'Grasa', description: 'Las grasas son clave para funci\u00F3n hormonal, absorci\u00F3n de vitaminas y salud celular. Un aporte muy bajo puede afectar hormonas y bienestar general.' },
        fiber: { label: 'Fibra', shortLabel: 'Fibra', description: 'La fibra mejora salud digestiva, saciedad y control gluc\u00E9mico. Un aporte bajo suele empeorar tr\u00E1nsito intestinal y calidad global de la dieta.' },
        sugar: { label: 'Az\u00FAcar', shortLabel: 'Az\u00FAcar', description: 'Limita az\u00FAcares libres para mejorar calidad nutricional y estabilidad energ\u00E9tica. Regla base: m\u00E1ximo % de kcal y conversi\u00F3n a gramos con (kcal x %)/4. Un exceso sostenido facilita picos de apetito y desplazamiento de alimentos de calidad.' },
        saturatedFat: { label: 'Grasa sat.', shortLabel: 'Grasa sat.', description: 'Limita grasas saturadas para proteger perfil lip\u00EDdico y salud cardiovascular. Un exceso habitual puede empeorar marcadores cardiometab\u00F3licos.' },
        salt: { label: 'Sal', shortLabel: 'Sal', description: 'Controla el sodio total aproximado (expresado como sal). Un exceso mantenido puede empeorar retenci\u00F3n de l\u00EDquidos y tensi\u00F3n arterial en personas sensibles.' },
        processing: { label: 'Procesamiento', shortLabel: 'Procesado', description: 'Refleja el grado medio de procesado de la dieta. Cuanto m\u00E1s alto, mayor riesgo de baja densidad nutricional y peor adherencia a largo plazo.' },
        hydration: { label: 'Hidrataci\u00F3n', shortLabel: 'Agua', description: 'Define la hidrataci\u00F3n diaria base seg\u00FAn peso (30-35 ml/kg) y el extra por actividad (ml/min).' },
        stepsKcal: { label: 'Kcal pasos', shortLabel: 'Pasos', description: 'Energ\u00EDa atribuida al desplazamiento diario medido mediante pasos.' },
        trainingKcal: { label: 'Kcal entrenamiento', shortLabel: 'Entrenamiento', description: 'Energ\u00EDa atribuida al trabajo de entrenamiento estructurado.' },
        met: { label: 'MET entrenamiento', shortLabel: 'MET', description: 'Intensidad metab\u00F3lica media de la actividad registrada.' },
        intensity: { label: 'Intensidad', shortLabel: 'Intensidad', description: 'Factor relativo de intensidad del trabajo principal de entrenamiento.' }
    },
    pages: {
        index: {
            title: '\u00CDndice | gymjan'
        },
        calculator: {
            title: 'Calculadora | gymjan',
            heading: 'Calculadora'
        },
        activity: {
            title: 'Actividad | gymjan',
            heading: 'Plan de Actividad'
        },
        menu: {
            title: 'Men\u00FA Semanal | gymjan',
            heading: 'Men\u00FA Semanal'
        },
        list: {
            title: 'Lista de la compra | gymjan',
            heading: 'Lista de la compra'
        }
    },
    errors: {
        loading_file: 'Error cargando {{file}}',
        loading_dependencies: 'Error cargando dependencias.',
        loading_list_service: 'Error cargando servicio de lista.',
        missing_list_data: 'Faltan datos (Men\u00FA o Alimentos).'
    },
    storage: {
        reset_confirm: 'Borrar todos los datos de la aplicaci\u00F3n?'
    },
    list: {
        misc_input_placeholder: 'A\u00F1adir \u00EDtem a Varios...',
        misc_input_aria: 'Nuevo \u00EDtem de varios',
        reset_confirm: '\u00BFRestablecer la lista? Se perder\u00E1n checks y elementos a\u00F1adidos.',
        categories: {
            other_processed: 'Otros / Procesados'
        }
    },
    menu: {
        meals: {
            hydration: 'Hidrataci\u00F3n',
            breakfast: 'Desayuno',
            lunch: 'Comida',
            dinner: 'Cena',
            totals: 'Totales',
            default_title: 'Comida'
        },
        plans: {
            default: 'Base',
            weightloss: 'P\u00E9rdida de peso'
        },
        actions: {
            add_food: 'A\u00F1adir alimento',
            remove_food: 'Eliminar alimento'
        },
        placeholders: {
            add_food: 'A\u00F1adir alimento'
        },
        states: {
            values_per_100g: 'Valores por 100 g',
            values_per_100ml: 'Valores por 100 ml',
            values_per_unit: 'Valores por unidad',
            load_failed: 'Error cargando {{file}}',
            reset_confirm: '\u00BFRestablecer el men\u00FA original? Se perder\u00E1n los cambios.',
            missing_menu_data: 'Error: menuData no disponible.',
            data_load_error: 'Error cargando los datos: {{message}}',
            dependencies_critical: 'Error cr\u00EDtico: No se pudieron cargar las dependencias (foods/formulas).',
            no_description: 'Sin descripci\u00F3n.',
            no_recipe: 'Sin receta.'
        },
        nutrition: {
            water: 'Agua',
            recipe: 'Receta',
            nutritional_score: 'Score nutricional',
            score_value: 'Puntuaci\u00F3n',
            metric: 'M\u00E9trica',
            deviation: 'Desviaci\u00F3n',
            penalty: 'Penalizaci\u00F3n',
            actual: 'Actual',
            target: 'Objetivo',
            kcal_debug_title: 'C\u00E1lculo de kcal y macros'
        }
    },
    activity: {
        plans: {
            default: 'Base'
        },
        sections: {
            movement: 'Movimiento',
            gym: 'Gimnasio',
            extra: 'Extra',
            totals: 'Totales'
        },
        titles: {
            daily_movement: 'Movimiento diario',
            training: 'Entrenamiento',
            rest: 'Descanso',
            extra: 'Extra'
        },
        labels: {
            steps: 'Pasos',
            steps_per_min: 'Ritmo (pasos/min)',
            distance: 'Distancia',
            time: 'Tiempo',
            reps: 'Repeticiones',
            load: 'Carga',
            type: 'Tipo',
            focus: 'Enfoque',
            muscles: 'M\u00FAsculos',
            equipment: 'Equipo',
            rest: 'Descanso',
            metrics: 'M\u00E9tricas',
            actual: 'Actual',
            target: 'Objetivo',
            score_value: 'Puntuaci\u00F3n'
        },
        actions: {
            add_exercise: 'A\u00F1adir',
            remove_exercise: 'Borrar'
        },
        states: {
            reset_confirm: '\u00BFRestablecer actividad por defecto? Se perder\u00E1n los cambios.',
            missing_exercises: 'Error: datos de ejercicios no disponibles.',
            no_plan: 'No hay plan semanal seleccionado o disponible.',
            no_exercises_defined: 'Sin ejercicios definidos.',
            adding_exercise: 'A\u00F1adiendo ejercicio...',
            dependencies_error: 'Error cargando dependencias (ejercicios/actividad).',
            technique_unavailable: 'T\u00E9cnica no disponible.'
        },
        score: {
            activity_score: 'Score actividad',
            activity_score_title: 'Score de actividad'
        },
        taxonomy: {
            types: {
                strength: 'Fuerza',
                cardio: 'Cardio',
                recovery: 'Recuperacion',
                other: 'Otros'
            },
            focuses: {
                upper_body: 'Tren superior',
                lower_body: 'Tren inferior',
                core: 'Core',
                full_body: 'Cuerpo completo',
                mobility: 'Movilidad',
                recovery: 'Recuperacion',
                general: 'General'
            }
        }
    },
    calculator: {
        errors: {
            render: 'Error renderizando la Calculadora.',
            dependencies: 'Error cargando dependencias (formulas/targets/stores).',
            engine_dependencies: 'Error cargando dependencias (engine formulas/targets).',
            update: 'Error actualizando c\u00E1lculos de la Calculadora.'
        },
        sections: {
            profile: 'Datos Personales',
            general_rest_goals: 'OBJETIVOS GENERALES (EN REPOSO)',
            daily_goals: 'OBJETIVOS DIARIOS',
            base_results: 'Resultados Base'
        },
        profile: {
            sex: 'Sexo',
            age: 'Edad',
            height: 'Altura (cm)',
            weight: 'Peso (kg)',
            male: 'Hombre',
            female: 'Mujer'
        },
        table: {
            goal: 'Objetivo',
            base_result: 'RESULTADO BASE',
            adjustment: 'Ajuste',
            adjusted_result: 'RESULTADO AJUSTADO',
            macros_pct: 'Macros (%)',
            activity: 'Actividad'
        },
        labels: {
            bmi: 'IMC',
            bmr: 'BMR',
            energy: 'Energ\u00EDa',
            basal: 'Basal',
            calculation: 'C\u00E1lculo',
            description: 'Descripci\u00F3n',
            steps_suffix: 'pasos'
        },
        bmi: {
            invalid: '-',
            underweight: 'Bajo peso',
            normal: 'Adecuado',
            overweight: 'Sobrepeso',
            obesity: 'Obesidad',
            severe_obesity: 'Gran obesidad'
        },
        activity_labels: {
            rest: 'Descanso',
            gym: 'Gimnasio',
            none: 'Sin actividad'
        },
        rules: {
            objective_bmr: 'Objetivo: 1,2 x BMR',
            objective_pct_kcal: 'Objetivo: {{value}}% de kcal (g = (kcal x %)/{{divisor}})',
            objective_hydration: 'Objetivo: {{min}}-{{max}} ml/kg (+{{activity}} ml/min actividad)',
            max_per_day: 'M\u00E1x: {{value}} / d\u00EDa',
            min_per_1000_kcal: 'M\u00EDn: {{value}} / 1000 kcal',
            max_pct_kcal: 'M\u00E1x: {{value}}% de kcal (g = (kcal x %)/{{divisor}})',
            maximum_score: 'M\u00E1ximo: {{value}}'
        }
    }
});
