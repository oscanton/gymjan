export default {
  id: "menu_gain_1a",
  labelKey: "menus.menu_gain_1a.label",
  descriptionKey: "menus.menu_gain_1a.description",
  meals: {
    hydration: {
      items: [{ foodId: "water", amount: 2500 }],
    },
    breakfast: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "greek_yogurt", amount: 250 },
          { foodId: "oats", amount: 70 },
          { foodId: "banana", amount: 150 },
          { foodId: "milk", amount: 250 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "salmon", amount: 180 },
          { foodId: "rice", amount: 260 },
          { foodId: "vegetables", amount: 200 },
          { foodId: "olive_oil", amount: 14 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "chicken_breast", amount: 180 },
          { foodId: "potato", amount: 300 },
          { foodId: "wholegrain_bread", amount: 110 },
          { foodId: "egg", amount: 2 },
          { foodId: "tomato", amount: 150 },
        ],
      },
    ],
  },
};
