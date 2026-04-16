export default {
  id: "menu_monday_weightloss",
  dayKey: "monday",
  labelKey: "menus.menu_monday_weightloss.label",
  descriptionKey: "menus.menu_monday_weightloss.description",
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
          { foodId: "oats", amount: 60 },
          { foodId: "plain_yogurt", amount: 125 },
          { foodId: "avocado", amount: 80 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "loin_pork", amount: 220 },
          { foodId: "rice", amount: 120 },
          { foodId: "zucchini", amount: 200 },
          { foodId: "tomato", amount: 80 },
          { foodId: "fruit", amount: 100 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "hake", amount: 220 },
          { foodId: "cauliflower", amount: 220 },
          { foodId: "olive_oil", amount: 5 },
          { foodId: "kefir", amount: 125 },
          { foodId: "greek_yogurt", amount: 30 },
        ],
      },
    ],
  },
};
