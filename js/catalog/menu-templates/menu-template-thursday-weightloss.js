export default {
  id: "menu_thursday_weightloss",
  dayKey: "thursday",
  labelKey: "menus.menu_thursday_weightloss.label",
  descriptionKey: "menus.menu_thursday_weightloss.description",
  meals: {
    hydration: {
      items: [{ foodId: "water", amount: 2000 }],
    },
    breakfast: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "coffee", amount: 1 },
          { foodId: "greek_yogurt", amount: 30 },
          { foodId: "kefir", amount: 125 },
          { foodId: "oats", amount: 50 },
          { foodId: "fruit", amount: 150 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "tuna", amount: 250 },
          { foodId: "potato", amount: 100 },
          { foodId: "tomato", amount: 120 },
          { foodId: "lettuce", amount: 180 },
          { foodId: "mixed_nuts", amount: 10 },
          { foodId: "olive_oil", amount: 5 },
          { foodId: "plain_yogurt", amount: 125 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "squid", amount: 250 },
          { foodId: "onion", amount: 50 },
          { foodId: "zucchini", amount: 250 },
          { foodId: "olive_oil", amount: 5 },
        ],
      },
    ],
  },
};
