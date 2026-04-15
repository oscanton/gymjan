export default {
  id: "menu_wednesday_weightloss",
  dayKey: "wednesday",
  labelKey: "menus.menu_wednesday_weightloss.label",
  descriptionKey: "menus.menu_wednesday_weightloss.description",
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
          { foodId: "wholegrain_bread", amount: 80 },
          { foodId: "tomato", amount: 80 },
          { foodId: "fruit", amount: 150 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "beef", amount: 200 },
          { foodId: "quinoa", amount: 150 },
          { foodId: "bell_pepper", amount: 150 },
          { foodId: "zucchini", amount: 150 },
          { foodId: "olive_oil", amount: 10 },
          { foodId: "plain_yogurt", amount: 125 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "turkey_breast", amount: 250 },
          { foodId: "artichoke", amount: 150 },
          { foodId: "olive_oil", amount: 5 },
        ],
      },
    ],
  },
};
