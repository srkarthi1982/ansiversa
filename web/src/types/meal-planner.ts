export type MealPlannerMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealPlannerMacroBreakdown = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealPlannerRecipe = {
  id: string;
  title: string;
  description: string;
  calories: number;
  macros: MealPlannerMacroBreakdown;
  prepTimeMinutes: number;
  servings: number;
  cuisine: string;
  dietTags: string[];
  allergens: string[];
  costPerServing: number;
  heroImage?: string;
  highlights: string[];
};

export type MealPlannerPlanMeal = {
  mealType: MealPlannerMealType;
  recipeId: string;
  notes?: string;
};

export type MealPlannerPlanDay = {
  id: string;
  label: string;
  focus: string;
  meals: MealPlannerPlanMeal[];
};

export type MealPlannerPlan = {
  id: string;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  dietProfileId: string;
  calorieTarget: number;
  macroSplit: MealPlannerMacroBreakdown;
  budgetPerWeek: number;
  prepMinutesTarget: number;
  groceryListId: string;
  tags: string[];
  heroCallout: string;
  days: MealPlannerPlanDay[];
};

export type MealPlannerGroceryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  priceEstimate: number;
  pantryItemId?: string;
  fulfilled?: boolean;
};

export type MealPlannerGroceryAisle = {
  id: string;
  name: string;
  icon: string;
  items: MealPlannerGroceryItem[];
};

export type MealPlannerGroceryList = {
  id: string;
  title: string;
  budgetCap: number;
  notes: string;
  aisles: MealPlannerGroceryAisle[];
};

export type MealPlannerPantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiresOn: string;
  status: 'fresh' | 'low' | 'expiring';
};

export type MealPlannerDietProfile = {
  id: string;
  name: string;
  description: string;
  calorieRange: string;
  macroPercentage: {
    protein: number;
    carbs: number;
    fat: number;
  };
  recommendedAllergies: string[];
};

export type MealPlannerSwapSuggestion = {
  id: string;
  label: string;
  mealType: MealPlannerMealType;
  recipeId: string;
  dietProfileIds: string[];
  reason: string;
};

export type MealPlannerPrepTask = {
  id: string;
  label: string;
  durationMinutes: number;
  dependsOn?: string;
};

export type MealPlannerPrepSession = {
  id: string;
  label: string;
  day: string;
  focus: string;
  tasks: MealPlannerPrepTask[];
};

export type MealPlannerExportOption = {
  id: string;
  label: string;
  description: string;
  format: 'pdf' | 'csv' | 'markdown' | 'share-link';
};

export type MealPlannerMetrics = {
  averageCalories: number;
  macroTotals: MealPlannerMacroBreakdown;
  pantryCoverage: number;
  grocerySpend: number;
  budgetHeadroom: number;
  prepMinutes: number;
};
