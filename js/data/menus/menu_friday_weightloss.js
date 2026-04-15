export default {
  id: "menu_friday_weightloss",
  dayKey: "friday",
  labelKey: "menus.menu_friday_weightloss.label",
  descriptionKey: "menus.menu_friday_weightloss.description",
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
          { foodId: "plain_yogurt", amount: 170 },
          { foodId: "oats", amount: 40 },
          { foodId: "greek_yogurt", amount: 30 },
          { foodId: "fruit", amount: 100 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "turkey_breast", amount: 250 },
          { foodId: "couscous", amount: 100 },
          { foodId: "peas", amount: 120 },
          { foodId: "bell_pepper", amount: 100 },
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
          { foodId: "egg", amount: 3 },
          { foodId: "mushrooms", amount: 250 },
          { foodId: "potato", amount: 80 },
          { foodId: "olive_oil", amount: 5 },
        ],
      },
    ],
  },
};
