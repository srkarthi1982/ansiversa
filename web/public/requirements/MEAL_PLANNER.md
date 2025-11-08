# ðŸ¥— Meal Planner â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/meal-planner`  
**Category:** Lifestyle and Wellâ€‘Being  
**Stack:** Astro + Tailwind (islands for planners/forms), Astro SSR API routes, Astro DB / Supabase, optional workers for weekly jobs  
**Goal:** Help users plan nutritious, budgetâ€‘aware meals for the week. Generate meal plans by calories/macros, diet type, allergies, cuisine, and budget; produce grocery lists; track pantry; and export/share.

> Positioning: A fast, privacyâ€‘first weekly meal OS with smart substitutions, nutrition estimates, and oneâ€‘tap grocery lists.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- Create **weekly/biâ€‘weekly** meal plans (Breakfast/Lunch/Dinner/Snacks).  
- Support **dietary patterns** (Veg/Nonâ€‘veg/Vegan/Keto/Lowâ€‘carb/Highâ€‘protein/Diabeticâ€‘friendly/Halal/Jain/etc.).  
- Handle **allergies** (nuts, dairy, gluten, eggs, soy, shellfish) and **dislikes**.  
- **Calorie and macro** targets (per day or per meal).  
- **Budget control** and **prep time** constraints (e.g., â‰¤ 30 min).  
- **Grocery list** builder with aisle categories, quantities, and unit conversions.  
- **Pantry** and **Leftovers** tracking with autoâ€‘suggestions to reduce waste.  
- **Recipe vault** (builtâ€‘in + user) with nutrition estimates and tags.  
- Exports: **PDF**, **CSV**, **MD**, **Share Link**.  
- Multiâ€‘language and metric/imperial units.

### Nonâ€‘Goals (v1)
- No realâ€‘time shopping API integrations (show â€œCopy to cartâ€ CSV).  
- No dietitian medical advice (informational only, disclaimers required).  
- No social feed/comments; plans are private (share via link only).

---

## 2) User Stories (Acceptance Criteria)

1. **Generate Weekly Plan**
   - *As a user*, I set calories (e.g., 2,000/day), protein min (100g), diet=Vegetarian, and budget=moderate.  
   - **AC:** `/meal-planner/api/plan/generate` returns a 7â€‘day plan with recipes per meal, nutrition totals, and grocery list draft.

2. **Customize and Swap**
   - *As a user*, I replace a dinner with a different recipe respecting allergies.  
   - **AC:** `/meal-planner/api/plan/swap` suggests compatible alternatives; totals update.

3. **Grocery List**
   - *As a user*, I view a consolidated list grouped by aisle.  
   - **AC:** `/meal-planner/api/grocery/list` aggregates ingredients across the week, dedupes, and converts units.

4. **Pantry and Leftovers**
   - *As a user*, I mark items I already have.  
   - **AC:** `/meal-planner/api/pantry/apply` subtracts pantry items; leftover recipes are suggested for unused ingredients.

5. **Batch Cooking / Prep**
   - *As a user*, I mark â€œmeal prep Sundayâ€ for lunches.  
   - **AC:** `/meal-planner/api/prep/plan` merges steps and generates a prep checklist.

6. **Allergies and Dislikes**
   - *As a user*, I set allergens and disliked ingredients/cuisines.  
   - **AC:** generator excludes them; warnings show if a user recipe conflicts.

7. **Nutrition Targets**
   - *As a user*, I specify kcal/day and macro range.  
   - **AC:** daily totals show kcal, protein, carbs, fat; warnings if Â±10% off target.

8. **Plan Gating**
   - Free: 1 active plan, 30 recipe vault items, grocery export CSV only.  
   - Pro: unlimited plans, advanced nutrition, pantry optimizer, PDF exports, multiâ€‘profile.

---

## 3) Routes and Information Architecture

- `/meal-planner` â€” Hub: New plan wizard, recent plans, quick add recipes.  
- `/meal-planner/new` â€” Wizard: profiles (user/family), calories/macros, diet, allergies, budget, time, cuisines, days, meal slots.  
- `/meal-planner/plan/[id]` â€” Plan board (calendar/week grid).  
- `/meal-planner/grocery/[id]` â€” Grocery list (aisle groups, pantry toggle).  
- `/meal-planner/recipes` â€” Browse/search recipes.  
- `/meal-planner/recipes/new` â€” Add recipe form (ingredients, steps, tags, nutrition).  
- `/meal-planner/pantry` â€” Pantry inventory and expiries.  
- `/meal-planner/settings` â€” Units, language, default targets.

**API (SSR):**  
- `POST /meal-planner/api/plan/generate` Â· `POST /meal-planner/api/plan/update` Â· `POST /meal-planner/api/plan/swap` Â· `POST /meal-planner/api/plan/delete`  
- `GET  /meal-planner/api/plan` (fetch by id) Â· `GET /meal-planner/api/plan/list`  
- `POST /meal-planner/api/grocery/list` Â· `POST /meal-planner/api/grocery/export` (csv|md|pdf)  
- `POST /meal-planner/api/pantry/apply` Â· `POST /meal-planner/api/pantry/update` Â· `GET /meal-planner/api/pantry`  
- `POST /meal-planner/api/recipe/create` Â· `POST /meal-planner/api/recipe/update` Â· `POST /meal-planner/api/recipe/delete` Â· `GET /meal-planner/api/recipe/search`  
- `POST /meal-planner/api/prep/plan`  
- `POST /meal-planner/api/profile/save`

---

## 4) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `timezone`, `language`, `units` ('metric'|'imperial'), `createdAt`

**DietProfile**  
- `id` (pk uuid), `userId` (fk), `name` ('Me'|'Family'...), `kcalTarget` (int), `proteinMin` (int), `carbRange` (json), `fatRange` (json),  
  `diet` ('veg'|'nonveg'|'vegan'|'keto'|'lowcarb'|'mediterranean'|'halal'|'jain'|'custom'), `allergies` (json), `dislikes` (json), `cuisines` (json), `budget` ('low'|'moderate'|'high'), `prepTimeMax` (int)

**Plan**  
- `id` (pk uuid), `userId` (fk), `profileId` (fk), `title`, `startDate`, `days` (int), `meals` (json schema), `totals` (json per day), `groceryId` (fk), `createdAt`

**MealSlot** (optional table if normalized)  
- `id` (pk), `planId` (fk), `date`, `slot` ('breakfast'|'lunch'|'dinner'|'snack'), `recipeId` (fk), `servings` (int), `notes` (text)

**Recipe**  
- `id` (pk uuid), `userId` (fk), `title`, `summary`, `ingredients` (array of {name, qty, unit, notes}), `steps` (array), `tags` (json),  
  `nutrition` ({kcal, protein, carbs, fat, fiber, sugar, sodium}), `time` ({prep, cook, total}), `servings` (int), `dietFlags` (json), `allergenFlags` (json), `sourceUrl` (string|null), `visibility` ('private'|'public'|'builtin'), `images` (json), `createdAt`

**GroceryList**  
- `id` (pk uuid), `planId` (fk), `items` (array of {name, qty, unit, aisle, sourceRecipeIds, pantry: bool}), `totals` (json), `createdAt`

**PantryItem**  
- `id` (pk uuid), `userId` (fk), `name`, `qty` (decimal), `unit`, `category`, `expiresOn` (date|null), `notes`, `updatedAt`

**Leftover**  
- `id` (pk), `userId` (fk), `name`, `qty`, `unit`, `expiresOn` (date|null), `sourceRecipeId` (fk|null)

**SubstitutionRule**  
- `id` (pk), `name`, `appliesTo` (ingredient name/tag), `alternatives` (array with qty factor and notes)

---

## 5) Plan Generation Logic (Outline)

1. **Constraints** from DietProfile (diet, allergies, dislikes, cuisines, kcal/macros, budget, prep time).  
2. **Candidate recipes** filtered by diet and allergens; score by fit (macros proximity, prep time, budget, cuisine).  
3. **Diversity rule**: avoid repeating the same primary protein/cuisine >2Ã— in a row.  
4. **Assemble week** per slot; compute daily totals; backâ€‘fill gaps with quick recipes.  
5. **Grocery aggregation** with unit normalization (g â†” kg, ml â†” L, cups â†” ml using a conversion table).  
6. **Pantry match** subtracts onâ€‘hand quantities; mark remaining as â€œto buyâ€.  
7. **Prep plan**: group steps (e.g., batchâ€‘cook rice and roast veggies Sunday).

---

## 6) UI / Pages

### `/meal-planner` (Hub)
- New Plan wizard; last plan KPIs (avg kcal, protein, budget).

### `/meal-planner/plan/[id]` (Week Grid)
- 7â€‘day grid with slots; click to view recipe card; swap, adjust servings, mark done.  
- Side panel: daily totals vs targets; warnings for macro deviations; prep suggestions.

### `/meal-planner/grocery/[id]`
- Aisle groups, pantry toggle, checkboxes, print and export; â€œconvert to CSV for retailerâ€.

### `/meal-planner/recipes`
- Search + filters (diet, time, kcal/serving, tags); import from URL (parse basic fields).

### `/meal-planner/pantry`
- Inventory with categories and expiry badges; quick add; â€œuse soonâ€ suggestions.

---

## 7) API Contracts (examples)

### `POST /meal-planner/api/plan/generate`
Req:  
```json
{
  "profileId":"<uuid>",
  "startDate":"2025-11-02",
  "days":7,
  "slots":["breakfast","lunch","dinner","snack"]
}
```
Res: `{ "planId":"<uuid>", "groceryId":"<uuid>" }`

### `POST /meal-planner/api/plan/swap`
Req: `{ "planId":"<uuid>", "date":"2025-11-05", "slot":"dinner", "constraints":{"maxTime":30} }`  
Res: `{ "recipe":{"id":"<uuid>","title":"Paneer Stirâ€‘Fry"}, "totalsUpdated":true }`

### `POST /meal-planner/api/grocery/list`
Req: `{ "planId":"<uuid>", "pantryApply":true }`  
Res: `{ "items":[{"name":"Tomato","qty":6,"unit":"pcs","aisle":"Produce","pantry":false}] }`

### `POST /meal-planner/api/recipe/create`
Req: `{ "title":"Oats Upma", "ingredients":[{"name":"oats","qty":1,"unit":"cup"}], "nutrition":{"kcal":320,"protein":12,"carbs":45,"fat":9} }`  
Res: `{ "recipeId":"<uuid>" }`

### `POST /meal-planner/api/prep/plan`
Req: `{ "planId":"<uuid>" }`  
Res: `{ "steps":[{"when":"Sunday","task":"Cook 1kg rice; cool; portion"}] }`

### `POST /meal-planner/api/grocery/export`
Req: `{ "groceryId":"<uuid>", "format":"csv" }`  
Res: `{ "url":"/exports/grocery_2025-11-02.csv" }`

---

## 8) Validation Rules

- kcal target 800â€“4000/day; macros must sum ~100% Â± 5%.  
- Allergies/dislikes are enforced across generator and swap.  
- Recipe fields: title 2â€“120 chars; ingredients 1â€“100 items; units from whitelist.  
- Unit conversions use a controlled table; unknown units flagged.  
- Pantry item names normalized (casefold + synonym map).

---

## 9) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Active plans | 1 | Unlimited |
| Recipe vault | 30 | 1,000 |
| Pantry items | 50 | 1,000 |
| Exports | CSV only | PDF/CSV/MD |
| Profiles | 1 | Multiple (family) |
| Nutrition detail | Basic (kcal/macros) | Extended (fiber, sugar, sodium) |
| Prep planner | Basic | Advanced batch prep |
| Share link | Yes (readâ€‘only) | Yes + branding |

Rate limits: `userId`+day for generations/exports; `planId`+hour for swaps.

---

## 10) Accessibility and UX

- Large touch targets; keyboard navigation; highâ€‘contrast mode.  
- Screenâ€‘reader labels on buttons and ingredient checkboxes.  
- Metric/imperial toggle; RTL support for Arabic; localized number formats.

---

## 11) Suggested File Layout

```
src/pages/meal-planner/index.astro
src/pages/meal-planner/new.astro
src/pages/meal-planner/plan/[id].astro
src/pages/meal-planner/grocery/[id].astro
src/pages/meal-planner/recipes/index.astro
src/pages/meal-planner/recipes/new.astro
src/pages/meal-planner/pantry/index.astro
src/pages/meal-planner/settings.astro

src/pages/meal-planner/api/plan/generate.ts
src/pages/meal-planner/api/plan/update.ts
src/pages/meal-planner/api/plan/swap.ts
src/pages/meal-planner/api/plan/delete.ts
src/pages/meal-planner/api/plan/index.ts
src/pages/meal-planner/api/plan/list.ts
src/pages/meal-planner/api/grocery/list.ts
src/pages/meal-planner/api/grocery/export.ts
src/pages/meal-planner/api/pantry/apply.ts
src/pages/meal-planner/api/pantry/update.ts
src/pages/meal-planner/api/pantry/index.ts
src/pages/meal-planner/api/recipe/create.ts
src/pages/meal-planner/api/recipe/update.ts
src/pages/meal-planner/api/recipe/delete.ts
src/pages/meal-planner/api/recipe/search.ts
src/pages/meal-planner/api/prep/plan.ts
src/pages/meal-planner/api/profile/save.ts

src/components/meal-planner/Planner/*.astro
src/components/meal-planner/Recipes/*.astro
src/components/meal-planner/Grocery/*.astro
src/components/meal-planner/Pantry/*.astro
```

---

## 12) Future Enhancements (v2+)

- **Retailer connectors** for direct cart creation (Carrefour/LuLu placeholders today).  
- **Barcode scan** for pantry updates.  
- **Nutrient optimizer** (micros: potassium, calcium, iron, vitamins).  
- **Meal plan marketplace** (moderated templates).  
- **Wearable sync** (calories burned) to adjust targets.  
- **PWA offline** for grocery list and recipes in-store.

---

**End of Requirements â€” ready for Codex implementation.**