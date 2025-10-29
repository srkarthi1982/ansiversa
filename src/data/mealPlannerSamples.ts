import type {
  MealPlannerDietProfile,
  MealPlannerExportOption,
  MealPlannerGroceryList,
  MealPlannerPlan,
  MealPlannerPrepSession,
  MealPlannerRecipe,
  MealPlannerSwapSuggestion,
  MealPlannerPantryItem,
} from '../types/meal-planner';

type MealPlannerSampleData = {
  plans: MealPlannerPlan[];
  recipes: MealPlannerRecipe[];
  groceryLists: MealPlannerGroceryList[];
  pantry: MealPlannerPantryItem[];
  dietProfiles: MealPlannerDietProfile[];
  swapSuggestions: MealPlannerSwapSuggestion[];
  prepSessions: MealPlannerPrepSession[];
  exportOptions: MealPlannerExportOption[];
};


const recipes: MealPlannerRecipe[] = [
  {
    id: 'steel-cut-oats-berries',
    title: 'Steel-Cut Oats with Berries',
    description:
      'Slow-cooked oats topped with blueberries, almonds, and chia seeds for sustained morning energy.',
    calories: 420,
    macros: { calories: 420, protein: 18, carbs: 56, fat: 12 },
    prepTimeMinutes: 15,
    servings: 2,
    cuisine: 'American',
    dietTags: ['vegetarian', 'high-fiber'],
    allergens: ['nuts'],
    costPerServing: 2.4,
    highlights: ['Soak overnight for faster mornings', 'Swap almond milk for oat milk for nut-free version'],
  },
  {
    id: 'mediterranean-quinoa-bowl',
    title: 'Mediterranean Quinoa Bowl',
    description:
      'Quinoa, roasted vegetables, chickpeas, and lemon tahini dressing for a colorful mid-day fuel.',
    calories: 520,
    macros: { calories: 520, protein: 22, carbs: 62, fat: 18 },
    prepTimeMinutes: 25,
    servings: 2,
    cuisine: 'Mediterranean',
    dietTags: ['vegetarian'],
    allergens: ['sesame'],
    costPerServing: 3.8,
    highlights: ['Batch roast vegetables for two days', 'Add feta for extra protein if dairy-friendly'],
  },
  {
    id: 'lemon-herb-salmon',
    title: 'Lemon Herb Salmon with Greens',
    description:
      'Baked salmon fillets served alongside garlic-sautéed greens and roasted potatoes.',
    calories: 610,
    macros: { calories: 610, protein: 42, carbs: 32, fat: 32 },
    prepTimeMinutes: 30,
    servings: 2,
    cuisine: 'American',
    dietTags: ['pescatarian', 'gluten-free'],
    allergens: ['fish'],
    costPerServing: 6.1,
    highlights: ['Bake salmon on sheet pan with potatoes', 'Use leftovers for salmon salad lunch'],
  },
  {
    id: 'citrus-chicken-quinoa',
    title: 'Citrus Herb Chicken & Quinoa',
    description:
      'Citrus-marinated chicken thighs with tri-color quinoa and roasted broccoli.',
    calories: 550,
    macros: { calories: 550, protein: 45, carbs: 48, fat: 18 },
    prepTimeMinutes: 35,
    servings: 4,
    cuisine: 'Fusion',
    dietTags: ['high-protein', 'gluten-free'],
    allergens: [],
    costPerServing: 4.6,
    highlights: ['Marinate overnight for deeper flavor', 'Use broccoli stems in stir-fry later'],
  },
  {
    id: 'cocoa-chia-pudding',
    title: 'Cocoa Overnight Chia Pudding',
    description:
      'Meal-prep friendly chia pudding with cacao, almond milk, and sliced banana.',
    calories: 280,
    macros: { calories: 280, protein: 9, carbs: 32, fat: 12 },
    prepTimeMinutes: 10,
    servings: 2,
    cuisine: 'American',
    dietTags: ['vegan', 'gluten-free'],
    allergens: ['nuts'],
    costPerServing: 1.9,
    highlights: ['Prep 3 jars at once', 'Top with berries for antioxidant boost'],
  },
  {
    id: 'avocado-chickpea-wrap',
    title: 'Avocado Chickpea Crunch Wrap',
    description:
      'Whole-wheat wrap stuffed with smashed chickpeas, crunchy veggies, and lemon yogurt dressing.',
    calories: 480,
    macros: { calories: 480, protein: 19, carbs: 58, fat: 18 },
    prepTimeMinutes: 15,
    servings: 2,
    cuisine: 'Mediterranean',
    dietTags: ['vegetarian'],
    allergens: ['gluten', 'dairy'],
    costPerServing: 3.2,
    highlights: ['Great for desk lunches', 'Swap yogurt with tahini for dairy-free'],
  },
  {
    id: 'green-smoothie-fuel',
    title: 'Green Smoothie Fuel',
    description:
      'Spinach, pineapple, avocado, and plant protein blended for a quick snack.',
    calories: 310,
    macros: { calories: 310, protein: 15, carbs: 36, fat: 12 },
    prepTimeMinutes: 5,
    servings: 1,
    cuisine: 'American',
    dietTags: ['vegan', 'gluten-free'],
    allergens: [],
    costPerServing: 2.1,
    highlights: ['Freeze portions for faster blending', 'Add ginger for digestion'],
  },
  {
    id: 'keto-spinach-omelette',
    title: 'Spinach & Feta Keto Omelette',
    description:
      'Three-egg omelette with spinach, feta, and smoked salmon for keto mornings.',
    calories: 460,
    macros: { calories: 460, protein: 34, carbs: 6, fat: 34 },
    prepTimeMinutes: 12,
    servings: 1,
    cuisine: 'Mediterranean',
    dietTags: ['keto'],
    allergens: ['eggs', 'dairy', 'fish'],
    costPerServing: 3.9,
    highlights: ['Cook salmon separately for meal prep', 'Swap feta for goat cheese as needed'],
  },
  {
    id: 'grilled-steak-salad',
    title: 'Chimichurri Steak Salad',
    description:
      'Grilled flank steak with chimichurri, greens, radish, and toasted pepitas.',
    calories: 650,
    macros: { calories: 650, protein: 48, carbs: 18, fat: 42 },
    prepTimeMinutes: 30,
    servings: 2,
    cuisine: 'Latin American',
    dietTags: ['keto', 'high-protein'],
    allergens: ['nuts'],
    costPerServing: 5.6,
    highlights: ['Marinate steak overnight', 'Use leftovers in lettuce wraps'],
  },
  {
    id: 'miso-tofu-lettuce-cups',
    title: 'Miso Ginger Tofu Lettuce Cups',
    description:
      'Caramelized tofu crumbles with miso ginger glaze served in lettuce cups.',
    calories: 340,
    macros: { calories: 340, protein: 22, carbs: 24, fat: 16 },
    prepTimeMinutes: 20,
    servings: 2,
    cuisine: 'Asian',
    dietTags: ['vegan', 'gluten-free'],
    allergens: ['soy'],
    costPerServing: 2.7,
    highlights: ['Excellent for meal prep', 'Serve with cauliflower rice for keto option'],
  },
];

const plans: MealPlannerPlan[] = [
  {
    id: 'balanced-family-week',
    title: 'Balanced Family Week',
    summary:
      'A colorful seven-day plan that balances fiber, protein, and budget-conscious ingredients for a family of four.',
    startDate: '2024-07-08',
    endDate: '2024-07-14',
    dietProfileId: 'balanced',
    calorieTarget: 2000,
    macroSplit: { calories: 2000, protein: 120, carbs: 230, fat: 70 },
    budgetPerWeek: 120,
    prepMinutesTarget: 210,
    groceryListId: 'balanced-family-week-grocery',
    tags: ['family', 'batch-cook', 'fiber-rich'],
    heroCallout: 'Reduce waste with smart leftover re-use and a single Sunday prep.',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((label, index) => ({
      id: `balanced-${index}`,
      label,
      focus:
        index === 0
          ? 'Start strong with omega-3s and greens.'
          : index === 3
          ? 'Quick midweek dinners with prepped bases.'
          : index === 5
          ? 'Family-style platter to stretch leftovers.'
          : 'Keep energy steady with balanced macros.',
      meals: [
        { mealType: 'breakfast', recipeId: index % 2 === 0 ? 'steel-cut-oats-berries' : 'cocoa-chia-pudding' },
        { mealType: 'lunch', recipeId: index % 3 === 0 ? 'mediterranean-quinoa-bowl' : 'avocado-chickpea-wrap' },
        { mealType: 'dinner', recipeId: index % 2 === 0 ? 'lemon-herb-salmon' : 'citrus-chicken-quinoa' },
        { mealType: 'snack', recipeId: index % 2 === 0 ? 'green-smoothie-fuel' : 'cocoa-chia-pudding' },
      ],
    })),
  },
  {
    id: 'keto-focus-week',
    title: 'Keto Focus Week',
    summary:
      'High-fat, low-carb rotations with streamlined prep sessions for busy professionals staying under 35g net carbs.',
    startDate: '2024-07-08',
    endDate: '2024-07-14',
    dietProfileId: 'keto',
    calorieTarget: 1800,
    macroSplit: { calories: 1800, protein: 130, carbs: 60, fat: 120 },
    budgetPerWeek: 150,
    prepMinutesTarget: 180,
    groceryListId: 'keto-focus-week-grocery',
    tags: ['keto', 'low-carb', 'batch-prep'],
    heroCallout: 'Built-in swaps keep you in ketosis while avoiding repeat flavors.',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((label, index) => ({
      id: `keto-${index}`,
      label,
      focus:
        index === 1
          ? 'Portable lunches with minimal reheating.'
          : index === 4
          ? 'Weekend grilling with double-duty leftovers.'
          : 'Stay within 20g net carbs without sacrificing flavor.',
      meals: [
        { mealType: 'breakfast', recipeId: index % 2 === 0 ? 'keto-spinach-omelette' : 'miso-tofu-lettuce-cups' },
        { mealType: 'lunch', recipeId: index % 3 === 0 ? 'grilled-steak-salad' : 'miso-tofu-lettuce-cups' },
        { mealType: 'dinner', recipeId: index % 2 === 0 ? 'grilled-steak-salad' : 'citrus-chicken-quinoa' },
        { mealType: 'snack', recipeId: index % 2 === 0 ? 'green-smoothie-fuel' : 'cocoa-chia-pudding' },
      ],
    })),
  },
];

const groceryLists: MealPlannerGroceryList[] = [
  {
    id: 'balanced-family-week-grocery',
    title: 'Balanced Family Grocery List',
    budgetCap: 125,
    notes: 'Shop once on Sunday; quick midweek top-up for greens if needed.',
    aisles: [
      {
        id: 'produce',
        name: 'Produce',
        icon: 'fas fa-carrot',
        items: [
          { id: 'spinach-bag', name: 'Baby spinach', quantity: 10, unit: 'cups', priceEstimate: 6.5, pantryItemId: 'spinach-freezer' },
          { id: 'berries-mix', name: 'Mixed berries', quantity: 4, unit: 'cups', priceEstimate: 9.2 },
          { id: 'broccoli-crowns', name: 'Broccoli crowns', quantity: 4, unit: 'heads', priceEstimate: 7.5 },
          { id: 'avocados', name: 'Avocados', quantity: 5, unit: 'each', priceEstimate: 7.0 },
        ],
      },
      {
        id: 'pantry',
        name: 'Pantry & Grains',
        icon: 'fas fa-wheat-awn',
        items: [
          { id: 'steel-cut-oats', name: 'Steel-cut oats', quantity: 1.5, unit: 'kg', priceEstimate: 5.4 },
          { id: 'quinoa', name: 'Tri-color quinoa', quantity: 1, unit: 'kg', priceEstimate: 6.8, pantryItemId: 'quinoa-bulk' },
          { id: 'chickpeas', name: 'Chickpeas', quantity: 6, unit: 'cans', priceEstimate: 8.4 },
          { id: 'chia-seeds', name: 'Chia seeds', quantity: 0.5, unit: 'kg', priceEstimate: 4.3, pantryItemId: 'chia-jar' },
        ],
      },
      {
        id: 'protein',
        name: 'Protein & Dairy',
        icon: 'fas fa-drumstick-bite',
        items: [
          { id: 'salmon-fillets', name: 'Salmon fillets', quantity: 6, unit: 'pieces', priceEstimate: 24.0 },
          { id: 'chicken-thighs', name: 'Chicken thighs', quantity: 10, unit: 'pieces', priceEstimate: 16.5 },
          { id: 'greek-yogurt', name: 'Greek yogurt', quantity: 2, unit: 'tubs', priceEstimate: 8.0 },
          { id: 'almond-milk', name: 'Almond milk', quantity: 2, unit: 'cartons', priceEstimate: 6.6, pantryItemId: 'almond-milk' },
        ],
      },
    ],
  },
  {
    id: 'keto-focus-week-grocery',
    title: 'Keto Staples Grocery List',
    budgetCap: 160,
    notes: 'Double the steak if cooking for two; swap tofu for tempeh if soy-free.',
    aisles: [
      {
        id: 'produce-keto',
        name: 'Produce',
        icon: 'fas fa-leaf',
        items: [
          { id: 'cauliflower', name: 'Cauliflower heads', quantity: 3, unit: 'each', priceEstimate: 9.3 },
          { id: 'mixed-greens', name: 'Mixed greens', quantity: 4, unit: 'bags', priceEstimate: 10.0 },
          { id: 'herbs', name: 'Herb bundle', quantity: 3, unit: 'bunches', priceEstimate: 5.4 },
        ],
      },
      {
        id: 'protein-keto',
        name: 'Protein',
        icon: 'fas fa-bacon',
        items: [
          { id: 'flank-steak', name: 'Flank steak', quantity: 4, unit: 'lbs', priceEstimate: 28.0 },
          { id: 'eggs', name: 'Eggs', quantity: 2, unit: 'dozens', priceEstimate: 7.8 },
          { id: 'smoked-salmon', name: 'Smoked salmon', quantity: 1.2, unit: 'lbs', priceEstimate: 14.0 },
        ],
      },
      {
        id: 'pantry-keto',
        name: 'Pantry & Snacks',
        icon: 'fas fa-jar',
        items: [
          { id: 'olive-oil', name: 'Extra virgin olive oil', quantity: 1, unit: 'liter', priceEstimate: 12.5, pantryItemId: 'olive-oil-tin' },
          { id: 'pepitas', name: 'Toasted pepitas', quantity: 0.5, unit: 'kg', priceEstimate: 6.2 },
          { id: 'almonds', name: 'Raw almonds', quantity: 0.6, unit: 'kg', priceEstimate: 7.4 },
        ],
      },
    ],
  },
];

const pantry: MealPlannerPantryItem[] = [
  {
    id: 'quinoa-bulk',
    name: 'Bulk quinoa jar',
    quantity: 3,
    unit: 'cups',
    category: 'Grains',
    expiresOn: '2024-10-12',
    status: 'fresh',
  },
  {
    id: 'chia-jar',
    name: 'Chia seed jar',
    quantity: 1,
    unit: 'kg',
    category: 'Seeds',
    expiresOn: '2025-01-08',
    status: 'fresh',
  },
  {
    id: 'olive-oil-tin',
    name: 'Olive oil tin',
    quantity: 0.7,
    unit: 'liter',
    category: 'Oils',
    expiresOn: '2024-12-01',
    status: 'low',
  },
  {
    id: 'almond-milk',
    name: 'Almond milk carton',
    quantity: 1,
    unit: 'carton',
    category: 'Dairy Alternatives',
    expiresOn: '2024-07-18',
    status: 'expiring',
  },
  {
    id: 'spinach-freezer',
    name: 'Frozen spinach portions',
    quantity: 6,
    unit: 'cups',
    category: 'Frozen',
    expiresOn: '2024-09-20',
    status: 'fresh',
  },
];

const dietProfiles: MealPlannerDietProfile[] = [
  {
    id: 'balanced',
    name: 'Balanced Lifestyle',
    description: 'Mix of complex carbs, lean protein, and heart-healthy fats for general wellness.',
    calorieRange: '1800-2200 kcal',
    macroPercentage: { protein: 25, carbs: 45, fat: 30 },
    recommendedAllergies: ['shellfish'],
  },
  {
    id: 'keto',
    name: 'Ketogenic',
    description: 'Very low-carb, high-fat plan focused on staying in ketosis with nutrient-dense ingredients.',
    calorieRange: '1600-2000 kcal',
    macroPercentage: { protein: 25, carbs: 10, fat: 65 },
    recommendedAllergies: ['grains', 'added sugar'],
  },
  {
    id: 'high-protein',
    name: 'High-Protein Performance',
    description: 'Elevated protein split ideal for strength training or recomposition goals.',
    calorieRange: '2000-2400 kcal',
    macroPercentage: { protein: 35, carbs: 35, fat: 30 },
    recommendedAllergies: ['none'],
  },
];

const swapSuggestions: MealPlannerSwapSuggestion[] = [
  {
    id: 'swap-chia-pudding',
    label: 'Swap to Cocoa Chia Pudding',
    mealType: 'breakfast',
    recipeId: 'cocoa-chia-pudding',
    dietProfileIds: ['balanced', 'keto'],
    reason: 'Lower carbohydrates without losing fiber; overnight-friendly.',
  },
  {
    id: 'swap-tofu-lettuce',
    label: 'Replace lunch with Miso Tofu Lettuce Cups',
    mealType: 'lunch',
    recipeId: 'miso-tofu-lettuce-cups',
    dietProfileIds: ['balanced', 'keto', 'high-protein'],
    reason: 'Adds plant-based protein and cuts prep time to under 20 minutes.',
  },
  {
    id: 'swap-steak-salad',
    label: 'Swap dinner to Chimichurri Steak Salad',
    mealType: 'dinner',
    recipeId: 'grilled-steak-salad',
    dietProfileIds: ['keto', 'high-protein'],
    reason: 'Keeps carbs ultra-low while boosting iron and B12.',
  },
];

const prepSessions: MealPlannerPrepSession[] = [
  {
    id: 'prep-sunday',
    label: 'Meal Prep Sunday',
    day: 'Sunday',
    focus: 'Batch cook grains, proteins, and prep vegetables to cover 3 dinners.',
    tasks: [
      { id: 'task-roast-veggies', label: 'Roast sheet pans of broccoli & carrots', durationMinutes: 30 },
      { id: 'task-marinate-protein', label: 'Marinate chicken and steak for 2 nights', durationMinutes: 20 },
      { id: 'task-portion-breakfast', label: 'Portion chia puddings and smoothie packs', durationMinutes: 15 },
      { id: 'task-label-storage', label: 'Label containers with day & meal', durationMinutes: 10 },
    ],
  },
  {
    id: 'midweek-reset',
    label: 'Midweek Reset',
    day: 'Wednesday',
    focus: 'Top-up greens, assemble snack boxes, and refresh leftovers.',
    tasks: [
      { id: 'task-check-pantry', label: 'Check pantry inventory & mark lows', durationMinutes: 8 },
      { id: 'task-assemble-snacks', label: 'Assemble smoothie freezer bags', durationMinutes: 12 },
      { id: 'task-simmer-broth', label: 'Simmer quick vegetable broth for sipping', durationMinutes: 20 },
    ],
  },
];

const exportOptions: MealPlannerExportOption[] = [
  {
    id: 'export-pdf',
    label: 'Weekly Playbook (PDF)',
    description: 'Print-ready overview with meal schedule, grocery aisles, and prep checklist.',
    format: 'pdf',
  },
  {
    id: 'export-csv',
    label: 'Grocery CSV',
    description: 'CSV download for quick import into budget trackers or shared sheets.',
    format: 'csv',
  },
  {
    id: 'export-markdown',
    label: 'Notion Markdown',
    description: 'Copy-paste friendly Markdown blocks for Notion or Obsidian.',
    format: 'markdown',
  },
  {
    id: 'export-link',
    label: 'Shareable Link',
    description: 'Generate a read-only public link for household or clients.',
    format: 'share-link',
  },
];

export const getMealPlannerSampleData = (): MealPlannerSampleData => ({
  plans,
  recipes,
  groceryLists,
  pantry,
  dietProfiles,
  swapSuggestions,
  prepSessions,
  exportOptions,
});
