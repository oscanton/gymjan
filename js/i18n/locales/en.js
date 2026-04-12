I18nRegistry.registerLocale('en', {
    meta: {
        code: 'en',
        label: 'English'
    },
    common: {
        index: 'Index',
        edit: 'Edit',
        done: 'Done',
        reset: 'Reset',
        add: 'Add',
        delete: 'Delete',
        ok: 'OK',
        misc: 'Misc',
        empty: 'Empty list.',
        language_aria: 'Change language',
        open_index_aria: 'Open index'
    },
    nav: {
        home: 'Home',
        calculator: 'Calculator',
        activity: 'Activity',
        menu: 'Menu',
        list: 'List'
    },
    weekDays: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    },
    metrics: {
        kcal: { label: 'Kcal', shortLabel: 'Kcal', description: 'Defines total daily energy. A sustained surplus can promote fat gain; an excessive deficit can reduce performance and recovery.' },
        protein: { label: 'Protein', shortLabel: 'Prot', description: 'Protein helps preserve and build muscle mass and improves satiety. A chronically low intake can limit recovery and muscle maintenance.' },
        carbs: { label: 'Carbohydrates', shortLabel: 'Carb', description: 'Carbohydrates are the main fuel for training and glycogen recovery. A very low intake can reduce energy, performance and intensity.' },
        fat: { label: 'Fats', shortLabel: 'Fat', description: 'Fats are key for hormonal function, vitamin absorption and cell health. A very low intake can affect hormones and overall wellbeing.' },
        fiber: { label: 'Fiber', shortLabel: 'Fiber', description: 'Fiber improves digestive health, satiety and glycemic control. A low intake often worsens digestion and overall diet quality.' },
        sugar: { label: 'Sugar', shortLabel: 'Sugar', description: 'Limit free sugars to improve nutritional quality and energy stability. Base rule: maximum % of kcal converted to grams with (kcal x %)/4. A sustained excess can promote appetite spikes and displacement of quality foods.' },
        saturatedFat: { label: 'Sat. fat', shortLabel: 'Sat. fat', description: 'Limit saturated fats to protect lipid profile and cardiovascular health. Habitual excess can worsen cardiometabolic markers.' },
        salt: { label: 'Salt', shortLabel: 'Salt', description: 'Controls approximate total sodium expressed as salt. Sustained excess can worsen fluid retention and blood pressure in sensitive people.' },
        processing: { label: 'Processing', shortLabel: 'Processed', description: 'Reflects the average level of processing in the diet. The higher it is, the greater the risk of poor nutrient density and worse long-term adherence.' },
        hydration: { label: 'Hydration', shortLabel: 'Water', description: 'Defines baseline daily hydration based on body weight (30-35 ml/kg) and the extra required for activity (ml/min).' },
        stepsKcal: { label: 'Steps kcal', shortLabel: 'Steps', description: 'Energy attributed to daily movement measured through steps.' },
        trainingKcal: { label: 'Training kcal', shortLabel: 'Training', description: 'Energy attributed to structured training work.' },
        met: { label: 'Training MET', shortLabel: 'MET', description: 'Average metabolic intensity of the recorded activity.' },
        intensity: { label: 'Intensity', shortLabel: 'Intensity', description: 'Relative intensity factor of the main training work.' }
    },
    pages: {
        index: {
            title: 'Index | gymjan'
        },
        calculator: {
            title: 'Calculator | gymjan',
            heading: 'Calculator'
        },
        activity: {
            title: 'Activity | gymjan',
            heading: 'Activity Plan'
        },
        menu: {
            title: 'Weekly Menu | gymjan',
            heading: 'Weekly Menu'
        },
        list: {
            title: 'Shopping List | gymjan',
            heading: 'Shopping List'
        }
    },
    errors: {
        loading_file: 'Error loading {{file}}',
        loading_dependencies: 'Error loading dependencies.',
        loading_list_service: 'Error loading shopping service.',
        missing_list_data: 'Missing data (Menu or Foods).'
    },
    storage: {
        reset_confirm: 'Delete all application data?'
    },
    list: {
        misc_input_placeholder: 'Add item to Misc...',
        misc_input_aria: 'New misc item',
        reset_confirm: 'Reset the list? Checks and added items will be lost.',
        categories: {
            other_processed: 'Other / Processed'
        }
    },
    menu: {
        meals: {
            hydration: 'Hydration',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            totals: 'Totals',
            default_title: 'Meal'
        },
        plans: {
            default: 'Base',
            weightloss: 'Weight loss'
        },
        actions: {
            add_food: 'Add food',
            remove_food: 'Remove food'
        },
        placeholders: {
            add_food: 'Add food'
        },
        states: {
            values_per_100g: 'Values per 100 g',
            values_per_100ml: 'Values per 100 ml',
            values_per_unit: 'Values per unit',
            load_failed: 'Error loading {{file}}',
            reset_confirm: 'Reset the original menu? Changes will be lost.',
            missing_menu_data: 'Error: menuData unavailable.',
            data_load_error: 'Error loading data: {{message}}',
            dependencies_critical: 'Critical error: dependencies could not be loaded (foods/formulas).',
            no_description: 'No description.',
            no_recipe: 'No recipe.'
        },
        nutrition: {
            water: 'Water',
            recipe: 'Recipe',
            nutritional_score: 'Nutrition score',
            score_value: 'Score',
            metric: 'Metric',
            deviation: 'Deviation',
            penalty: 'Penalty',
            actual: 'Actual',
            target: 'Target',
            kcal_debug_title: 'Kcal and macros calculation'
        }
    },
    activity: {
        plans: {
            default: 'Base'
        },
        sections: {
            movement: 'Movement',
            gym: 'Gym',
            extra: 'Extra',
            totals: 'Totals'
        },
        titles: {
            daily_movement: 'Daily movement',
            training: 'Training',
            rest: 'Rest',
            extra: 'Extra'
        },
        labels: {
            steps: 'Steps',
            steps_per_min: 'Pace (steps/min)',
            distance: 'Distance',
            time: 'Time',
            reps: 'Repetitions',
            load: 'Load',
            type: 'Type',
            focus: 'Focus',
            muscles: 'Muscles',
            equipment: 'Equipment',
            rest: 'Rest',
            metrics: 'Metrics',
            actual: 'Actual',
            target: 'Target',
            score_value: 'Score'
        },
        actions: {
            add_exercise: 'Add',
            remove_exercise: 'Delete'
        },
        states: {
            reset_confirm: 'Reset default activity? Changes will be lost.',
            missing_exercises: 'Error: exercise data unavailable.',
            no_plan: 'No weekly plan is selected or available.',
            no_exercises_defined: 'No exercises defined.',
            adding_exercise: 'Adding exercise...',
            dependencies_error: 'Error loading dependencies (exercises/activity).',
            technique_unavailable: 'Technique not available.'
        },
        score: {
            activity_score: 'Activity score',
            activity_score_title: 'Activity score'
        },
        taxonomy: {
            types: {
                strength: 'Strength',
                cardio: 'Cardio',
                recovery: 'Recovery',
                other: 'Other'
            },
            focuses: {
                upper_body: 'Upper body',
                lower_body: 'Lower body',
                core: 'Core',
                full_body: 'Full body',
                mobility: 'Mobility',
                recovery: 'Recovery',
                general: 'General'
            }
        }
    },
    calculator: {
        errors: {
            render: 'Error rendering Calculator.',
            dependencies: 'Error loading dependencies (formulas/targets/stores).',
            engine_dependencies: 'Error loading dependencies (engine formulas/targets).',
            update: 'Error updating Calculator calculations.'
        },
        sections: {
            profile: 'Personal Data',
            general_rest_goals: 'GENERAL GOALS (AT REST)',
            daily_goals: 'DAILY GOALS',
            base_results: 'Base Results'
        },
        profile: {
            sex: 'Sex',
            age: 'Age',
            height: 'Height (cm)',
            weight: 'Weight (kg)',
            male: 'Male',
            female: 'Female'
        },
        table: {
            goal: 'Goal',
            base_result: 'BASE RESULT',
            adjustment: 'Adjustment',
            adjusted_result: 'ADJUSTED RESULT',
            macros_pct: 'Macros (%)',
            activity: 'Activity'
        },
        labels: {
            bmi: 'BMI',
            bmr: 'BMR',
            energy: 'Energy',
            basal: 'Basal',
            calculation: 'Calculation',
            description: 'Description',
            steps_suffix: 'steps'
        },
        bmi: {
            invalid: '-',
            underweight: 'Underweight',
            normal: 'Normal',
            overweight: 'Overweight',
            obesity: 'Obesity',
            severe_obesity: 'Severe obesity'
        },
        activity_labels: {
            rest: 'Rest',
            gym: 'Gym',
            none: 'No activity'
        },
        rules: {
            objective_bmr: 'Goal: 1.2 x BMR',
            objective_pct_kcal: 'Goal: {{value}}% of kcal (g = (kcal x %)/{{divisor}})',
            objective_hydration: 'Goal: {{min}}-{{max}} ml/kg (+{{activity}} ml/min activity)',
            max_per_day: 'Max: {{value}} / day',
            min_per_1000_kcal: 'Min: {{value}} / 1000 kcal',
            max_pct_kcal: 'Max: {{value}}% of kcal (g = (kcal x %)/{{divisor}})',
            maximum_score: 'Maximum: {{value}}'
        }
    }
});
