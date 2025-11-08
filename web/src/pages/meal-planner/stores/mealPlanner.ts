import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import { getMealPlannerSampleData } from '../../../data/mealPlannerSamples';
import type {
  MealPlannerDietProfile,
  MealPlannerExportOption,
  MealPlannerGroceryItem,
  MealPlannerGroceryList,
  MealPlannerMetrics,
  MealPlannerPantryItem,
  MealPlannerPlan,
  MealPlannerPlanDay,
  MealPlannerRecipe,
  MealPlannerSwapSuggestion,
  MealPlannerPrepSession,
} from '../../../types/meal-planner';

type DietFilterState = {
  dietProfileId: string | null;
  allergies: string[];
};

const normalise = (value: string): string => value.trim().toLowerCase();

const isAllergyConflict = (recipe: MealPlannerRecipe, allergies: string[]): boolean => {
  if (!allergies.length) return false;
  const allergySet = new Set(allergies.map(normalise));
  return recipe.allergens.some((item) => allergySet.has(normalise(item)));
};

const sumReducer = (total: number, value: number): number => total + value;

class MealPlannerStore extends BaseStore {
  state: {
    loading: boolean;
    plans: MealPlannerPlan[];
    recipes: MealPlannerRecipe[];
    groceryLists: MealPlannerGroceryList[];
    pantry: MealPlannerPantryItem[];
    pantryApplied: boolean;
    prepSessions: MealPlannerPrepSession[];
    exportOptions: MealPlannerExportOption[];
    dietProfiles: MealPlannerDietProfile[];
    swapSuggestions: MealPlannerSwapSuggestion[];
    filters: DietFilterState;
    activePlanId: string | null;
    selectedDayIndex: number;
    metrics: MealPlannerMetrics;
  } = {
    loading: false,
    plans: [],
    recipes: [],
    groceryLists: [],
    pantry: [],
    pantryApplied: false,
    prepSessions: [],
    exportOptions: [],
    dietProfiles: [],
    swapSuggestions: [],
    filters: {
      dietProfileId: null,
      allergies: [],
    },
    activePlanId: null,
    selectedDayIndex: 0,
    metrics: {
      averageCalories: 0,
      macroTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      pantryCoverage: 0,
      grocerySpend: 0,
      budgetHeadroom: 0,
      prepMinutes: 0,
    },
  };

  private initialised = false;

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.hydrate();
  }

  get activePlan(): MealPlannerPlan | null {
    const { activePlanId } = this.state;
    if (!activePlanId) return null;
    return this.state.plans.find((plan) => plan.id === activePlanId) ?? null;
  }

  get activeDay(): MealPlannerPlanDay | null {
    const plan = this.activePlan;
    if (!plan) return null;
    return plan.days[this.state.selectedDayIndex] ?? plan.days[0] ?? null;
  }

  get activeGroceryList(): MealPlannerGroceryList | null {
    const plan = this.activePlan;
    if (!plan) return null;
    return this.state.groceryLists.find((list) => list.id === plan.groceryListId) ?? null;
  }

  get activeDietProfile(): MealPlannerDietProfile | null {
    const { dietProfileId } = this.state.filters;
    if (!dietProfileId) return null;
    return this.state.dietProfiles.find((profile) => profile.id === dietProfileId) ?? null;
  }

  get availableRecipes(): MealPlannerRecipe[] {
    const { allergies } = this.state.filters;
    return this.state.recipes.filter((recipe) => !isAllergyConflict(recipe, allergies));
  }

  setActivePlan(planId: string): void {
    if (this.state.activePlanId === planId) return;
    this.state.activePlanId = planId;
    this.state.selectedDayIndex = 0;
    const plan = this.activePlan;
    if (plan) {
      this.state.filters.dietProfileId = plan.dietProfileId;
      this.applyDietDefaults(plan.dietProfileId);
    }
    this.refreshMetrics();
  }

  setSelectedDay(index: number): void {
    if (this.state.selectedDayIndex === index) return;
    this.state.selectedDayIndex = index;
  }

  setDietProfile(dietProfileId: string): void {
    if (this.state.filters.dietProfileId === dietProfileId) return;
    this.state.filters.dietProfileId = dietProfileId;
    this.applyDietDefaults(dietProfileId);
    this.refreshMetrics();
  }

  toggleAllergy(allergy: string): void {
    const { allergies } = this.state.filters;
    const normalised = normalise(allergy);
    const index = allergies.findIndex((item) => item === normalised);
    if (index >= 0) {
      allergies.splice(index, 1);
    } else {
      allergies.push(normalised);
    }
    this.refreshMetrics();
  }

  swapMeal(dayId: string, mealType: MealPlannerPlanDay['meals'][number]['mealType'], swapId: string): void {
    const plan = this.activePlan;
    if (!plan) return;
    const day = plan.days.find((candidate) => candidate.id === dayId);
    if (!day) return;
    const meal = day.meals.find((candidate) => candidate.mealType === mealType);
    if (!meal) return;

    const suggestion = this.state.swapSuggestions.find((swap) => swap.id === swapId);
    if (!suggestion) return;

    const recipe = this.state.recipes.find((item) => item.id === suggestion.recipeId);
    if (!recipe) return;

    if (isAllergyConflict(recipe, this.state.filters.allergies)) return;
    if (!suggestion.dietProfileIds.includes(this.state.filters.dietProfileId ?? '')) return;

    meal.recipeId = recipe.id;
    this.refreshMetrics();
  }

  applyPantryToGrocery(): void {
    const groceryList = this.activeGroceryList;
    if (!groceryList) return;
    groceryList.aisles.forEach((aisle) => {
      aisle.items.forEach((item) => {
        if (!item.pantryItemId) return;
        const pantryItem = this.state.pantry.find((candidate) => candidate.id === item.pantryItemId);
        item.fulfilled = Boolean(pantryItem);
      });
    });
    this.state.pantryApplied = true;
    this.refreshMetrics();
  }

  resetPantryMatches(): void {
    const groceryList = this.activeGroceryList;
    if (!groceryList) return;
    groceryList.aisles.forEach((aisle) => {
      aisle.items.forEach((item) => {
        if (item.fulfilled) item.fulfilled = false;
      });
    });
    this.state.pantryApplied = false;
    this.refreshMetrics();
  }

  private hydrate(): void {
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const sample = getMealPlannerSampleData();
      this.state.plans = sample.plans.map((plan) => clone(plan));
      this.state.recipes = sample.recipes.map((recipe) => clone(recipe));
      this.state.groceryLists = sample.groceryLists.map((list) => clone(list));
      this.state.pantry = sample.pantry.map((item) => clone(item));
      this.state.pantryApplied = false;
      this.state.prepSessions = sample.prepSessions.map((session) => clone(session));
      this.state.exportOptions = sample.exportOptions.map((option) => clone(option));
      this.state.dietProfiles = sample.dietProfiles.map((profile) => clone(profile));
      this.state.swapSuggestions = sample.swapSuggestions.map((swap) => clone(swap));
      this.state.activePlanId = sample.plans[0]?.id ?? null;
      this.state.filters.dietProfileId = sample.plans[0]?.dietProfileId ?? sample.dietProfiles[0]?.id ?? null;
      this.applyDietDefaults(this.state.filters.dietProfileId ?? '');
      this.refreshMetrics();
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  private applyDietDefaults(dietProfileId: string): void {
    const diet = this.state.dietProfiles.find((profile) => profile.id === dietProfileId);
    if (!diet) return;
    const allergies = new Set(this.state.filters.allergies.map(normalise));
    diet.recommendedAllergies.forEach((item) => {
      const trimmed = item.trim();
      if (!trimmed || trimmed.toLowerCase() === 'none') return;
      allergies.add(normalise(trimmed));
    });
    this.state.filters.allergies = Array.from(allergies);
  }

  getSwapOptions(mealType: MealPlannerPlanDay['meals'][number]['mealType']): MealPlannerSwapSuggestion[] {
    const activeDiet = this.state.filters.dietProfileId ?? this.activePlan?.dietProfileId ?? null;
    if (!activeDiet) return [];
    return this.state.swapSuggestions.filter(
      (swap) => swap.mealType === mealType && swap.dietProfileIds.includes(activeDiet)
    );
  }

  resolveRecipe(recipeId: string): MealPlannerRecipe | null {
    const recipe = this.state.recipes.find((candidate) => candidate.id === recipeId);
    if (!recipe) return null;
    return isAllergyConflict(recipe, this.state.filters.allergies) ? null : recipe;
  }

  private refreshMetrics(): void {
    const plan = this.activePlan;
    const groceryList = this.activeGroceryList;
    const metrics: MealPlannerMetrics = {
      averageCalories: 0,
      macroTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      pantryCoverage: 0,
      grocerySpend: 0,
      budgetHeadroom: 0,
      prepMinutes: 0,
    };

    if (plan) {
      const macroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      let mealCount = 0;
      plan.days.forEach((day) => {
        day.meals.forEach((meal) => {
          const recipe = this.state.recipes.find((candidate) => candidate.id === meal.recipeId);
          if (!recipe || isAllergyConflict(recipe, this.state.filters.allergies)) return;
          macroTotals.calories += recipe.macros.calories;
          macroTotals.protein += recipe.macros.protein;
          macroTotals.carbs += recipe.macros.carbs;
          macroTotals.fat += recipe.macros.fat;
          mealCount += 1;
        });
      });
      metrics.macroTotals = macroTotals;
      metrics.averageCalories = mealCount ? Math.round(macroTotals.calories / plan.days.length) : 0;
      metrics.prepMinutes = this.state.prepSessions
        .map((session) => session.tasks.map((task) => task.durationMinutes).reduce(sumReducer, 0))
        .reduce(sumReducer, 0);
      metrics.budgetHeadroom = plan.budgetPerWeek;
    }

    if (groceryList) {
      const items: MealPlannerGroceryItem[] = [];
      groceryList.aisles.forEach((aisle) => {
        aisle.items.forEach((item) => items.push(item));
      });
      const spend = items.map((item) => item.priceEstimate).reduce(sumReducer, 0);
      const covered = items.filter((item) => item.pantryItemId).length;
      const fulfilled = items.filter((item) => item.pantryItemId && item.fulfilled).length;
      metrics.grocerySpend = Math.round(spend * 10) / 10;
      metrics.pantryCoverage = covered ? Math.round((fulfilled / covered) * 100) : 0;
      if (plan) {
        metrics.budgetHeadroom = Math.round((plan.budgetPerWeek - spend) * 10) / 10;
      }
    }

    this.state.metrics = metrics;
  }
}

const store = new MealPlannerStore();

Alpine.store('mealPlanner', store);

export type MealPlannerStoreType = MealPlannerStore;
