export default {
  id: "menu_saturday_weightloss",
  dayKey: "saturday",
  labelKey: "menus.menu_saturday_weightloss.label",
  descriptionKey: "menus.menu_saturday_weightloss.description",
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
          { foodId: "tomato", amount: 80 },
          { foodId: "cheese_fresh", amount: 125 },
          { foodId: "fruit", amount: 100 },
        ],
      },
    ],
    lunch: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "salmon", amount: 200 },
          { foodId: "broccoli", amount: 200 },
          { foodId: "carrot", amount: 100 },
          { foodId: "olive_oil", amount: 5 },
          { foodId: "fruit", amount: 200 },
        ],
      },
    ],
    dinner: [
      {
        recipeId: null,
        labelKey: null,
        items: [
          { foodId: "chicken_breast", amount: 200 },
          { foodId: "cauliflower", amount: 250 },
          { foodId: "olive_oil", amount: 5 },
        ],
      },
    ],
  },
};
