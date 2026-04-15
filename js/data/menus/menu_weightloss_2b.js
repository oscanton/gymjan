export default {
  id: "menu_weightloss_2b",
  labelKey: "menus.menu_weightloss_2b.label",
  descriptionKey: "menus.menu_weightloss_2b.description",
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
          { foodId: "plain_yogurt", amount: 200 },
          { foodId: "oats", amount: 45 },
          { foodId: "berries", amount: 80 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "chicken_breast", amount: 150 },
          { foodId: "rice", amount: 160 },
          { foodId: "vegetables", amount: 180 },
          { foodId: "olive_oil", amount: 10 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "salmon", amount: 130 },
          { foodId: "potato", amount: 220 },
          { foodId: "salad", amount: 120 },
          { foodId: "tomato", amount: 120 },
        ],
      },
    ],
  },
};
