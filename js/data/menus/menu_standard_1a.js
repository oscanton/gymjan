export default {
  id: "menu_standard_1a",
  labelKey: "menus.menu_standard_1a.label",
  descriptionKey: "menus.menu_standard_1a.description",
  meals: {
    hydration: {
      items: [{ foodId: "water", amount: 2200 }],
    },
    breakfast: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "milk", amount: 250 },
          { foodId: "oats", amount: 55 },
          { foodId: "banana", amount: 120 },
          { foodId: "coffee", amount: 1 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "chicken_breast", amount: 180 },
          { foodId: "rice", amount: 220 },
          { foodId: "vegetables", amount: 180 },
          { foodId: "olive_oil", amount: 12 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "tuna", amount: 140 },
          { foodId: "wholegrain_bread", amount: 90 },
          { foodId: "egg", amount: 2 },
          { foodId: "tomato", amount: 150 },
          { foodId: "salad", amount: 120 },
        ],
      },
    ],
  },
};
