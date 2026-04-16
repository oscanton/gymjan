export default {
  id: "menu_tuesday_weightloss",
  dayKey: "tuesday",
  labelKey: "menus.menu_tuesday_weightloss.label",
  descriptionKey: "menus.menu_tuesday_weightloss.description",
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
          { foodId: "wholegrain_bread", amount: 80 },
          { foodId: "tomato", amount: 100 },
          { foodId: "turkey_breast", amount: 100 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "chicken_breast", amount: 220 },
          { foodId: "potato", amount: 100 },
          { foodId: "tomato", amount: 100 },
          { foodId: "lettuce", amount: 200 },
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
          { foodId: "salmon", amount: 160 },
          { foodId: "spinach", amount: 250 },
          { foodId: "olive_oil", amount: 5 },
        ],
      },
    ],
  },
};
