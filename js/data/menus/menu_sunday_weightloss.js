export default {
  id: "menu_sunday_weightloss",
  dayKey: "sunday",
  labelKey: "menus.menu_sunday_weightloss.label",
  descriptionKey: "menus.menu_sunday_weightloss.description",
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
          { foodId: "egg", amount: 2 },
          { foodId: "avocado", amount: 80 },
          { foodId: "wholegrain_bread", amount: 80 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "lentils", amount: 250 },
          { foodId: "carrot", amount: 100 },
          { foodId: "leek", amount: 100 },
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
          { foodId: "hake", amount: 220 },
          { foodId: "asparagus", amount: 200 },
          { foodId: "spinach", amount: 250 },
          { foodId: "olive_oil", amount: 5 },
        ],
      },
    ],
  },
};
