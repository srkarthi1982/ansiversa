# ðŸ¥— Meal Planner â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/meals`  
**Category:** Lifestyle & Wellâ€‘Being  
**Stack:** Astro + Tailwind (islands for planners/forms), Astro SSR API routes, Astro DB / Supabase, optional workers for weekly jobs  
**Goal:** Help users plan nutritious, budgetâ€‘aware meals for the week. Generate meal plans by calories/macros, diet type, allergies, cuisine, and budget; produce grocery lists; track pantry; and export/share.

> Positioning: A fast, privacyâ€‘first weekly meal OS with smart substitutions, nutrition estimates, and oneâ€‘tap grocery lists.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Create **weekly/biâ€‘weekly** meal plans (Breakfast/Lunch/Dinner/Snacks).  
- Support **dietary patterns** (Veg/Nonâ€‘veg/Vegan/Keto/Lowâ€‘carb/Highâ€‘protein/Diabeticâ€‘friendly/Halal/Jain/etc.).  
- Handle **allergies** (nuts, dairy, gluten, eggs, soy, shellfish) and **dislikes**.  
- **Calorie & macro** targets (per day or per meal).  
- **Budget control** and **prep time** constraints (e.g., â‰¤ 30 min).  
- **Grocery list** builder with aisle categories, quantities, and unit conversions.  
- **Pantry** & **Leftovers** tracking with autoâ€‘suggestions to reduce waste.  
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
   - **AC:** `/meals/api/plan/generate` returns a 7â€‘day plan with recipes per meal, nutrition totals, and grocery list draft.

2. **Customize & Swap**
   - *As a user*, I replace a dinner with a different recipe respecting allergies.  
   - **AC:** `/meals/api/plan/swap` suggests compatible alternatives; totals update.

3. **Grocery List**
   - *As a user*, I view a consolidated list grouped by aisle.  
   - **AC:** `/meals/api/grocery/list` aggregates ingredients across the week, dedupes, and converts units.

4. **Pantry & Leftovers**
   - *As a user*, I mark items I already have.  
   - **AC:** `/meals/api/pantry/apply` subtracts pantry items; leftover recipes are suggested for unused ingredients.

5. **Batch Cooking / Prep**
   - *As a user*, I mark â€œmeal prep Sundayâ€ for lunches.  
   - **AC:** `/meals/api/prep/plan` merges steps and generates a prep checklist.

6. **Allergies & Dislikes**
   - *As a user*, I set allergens and disliked ingredients/cuisines.  
   - **AC:** generator excludes them; warnings show if a user recipe conflicts.

7. **Nutrition Targets**
   - *As a user*, I specify kcal/day and macro range.  
   - **AC:** daily totals show kcal, protein, carbs, fat; warnings if Â±10% off target.

8. **Plan Gating**
   - Free: 1 active plan, 30 recipe vault items, grocery export CSV only.  
   - Pro: unlimited plans, advanced nutrition, pantry optimizer, PDF exports, multiâ€‘profile.

---

## 3) Routes & Information Architecture

- `/meals` â€” Hub: New plan wizard, recent plans, quick add recipes.  
- `/meals/new` â€” Wizard: profiles (user/family), calories/macros, diet, allergies, budget, time, cuisines, days, meal slots.  
- `/meals/plan/[id]` â€” Plan board (calendar/week grid).  
- `/meals/grocery/[id]` â€” Grocery list (aisle groups, pantry toggle).  
- `/meals/recipes` â€” Browse/search recipes.  
- `/meals/recipes/new` â€” Add recipe form (ingredients, steps, tags, nutrition).  
- `/meals/pantry` â€” Pantry inventory & expiries.  
- `/meals/settings` â€” Units, language, default targets.

**API (SSR):**  
- `POST /meals/api/plan/generate` Â· `POST /meals/api/plan/update` Â· `POST /meals/api/plan/swap` Â· `POST /meals/api/plan/delete`  
- `GET  /meals/api/plan` (fetch by id) Â· `GET /meals/api/plan/list`  
- `POST /meals/api/grocery/list` Â· `POST /meals/api/grocery/export` (csv|md|pdf)  
- `POST /meals/api/pantry/apply` Â· `POST /meals/api/pantry/update` Â· `GET /meals/api/pantry`  
- `POST /meals/api/recipe/create` Â· `POST /meals/api/recipe/update` Â· `POST /meals/api/recipe/delete` Â· `GET /meals/api/recipe/search`  
- `POST /meals/api/prep/plan`  
- `POST /meals/api/profile/save`

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
- `id` (pk), `name`, `appliesTo` (ingredient name/tag), `alternatives` (array with qty factor & notes)

---

## 5) Plan Generation Logic (Outline)

1. **Constraints** from DietProfile (diet, allergies, dislikes, cuisines, kcal/macros, budget, prep time).  
2. **Candidate recipes** filtered by diet & allergens; score by fit (macros proximity, prep time, budget, cuisine).  
3. **Diversity rule**: avoid repeating the same primary protein/cuisine >2Ã— in a row.  
4. **Assemble week** per slot; compute daily totals; backâ€‘fill gaps with quick recipes.  
5. **Grocery aggregation** with unit normalization (g â†” kg, ml â†” L, cups â†” ml using a conversion table).  
6. **Pantry match** subtracts onâ€‘hand quantities; mark remaining as â€œto buyâ€.  
7. **Prep plan**: group steps (e.g., batchâ€‘cook rice & roast veggies Sunday).

---

## 6) UI / Pages

### `/meals` (Hub)
- New Plan wizard; last plan KPIs (avg kcal, protein, budget).

### `/meals/plan/[id]` (Week Grid)
- 7â€‘day grid with slots; click to view recipe card; swap, adjust servings, mark done.  
- Side panel: daily totals vs targets; warnings for macro deviations; prep suggestions.

### `/meals/grocery/[id]`
- Aisle groups, pantry toggle, checkboxes, print & export; â€œconvert to CSV for retailerâ€.

### `/meals/recipes`
- Search + filters (diet, time, kcal/serving, tags); import from URL (parse basic fields).

### `/meals/pantry`
- Inventory with categories and expiry badges; quick add; â€œuse soonâ€ suggestions.

---

## 7) API Contracts (examples)

### `POST /meals/api/plan/generate`
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

### `POST /meals/api/plan/swap`
Req: `{ "planId":"<uuid>", "date":"2025-11-05", "slot":"dinner", "constraints":{"maxTime":30} }`  
Res: `{ "recipe":{"id":"<uuid>","title":"Paneer Stirâ€‘Fry"}, "totalsUpdated":true }`

### `POST /meals/api/grocery/list`
Req: `{ "planId":"<uuid>", "pantryApply":true }`  
Res: `{ "items":[{"name":"Tomato","qty":6,"unit":"pcs","aisle":"Produce","pantry":false}] }`

### `POST /meals/api/recipe/create`
Req: `{ "title":"Oats Upma", "ingredients":[{"name":"oats","qty":1,"unit":"cup"}], "nutrition":{"kcal":320,"protein":12,"carbs":45,"fat":9} }`  
Res: `{ "recipeId":"<uuid>" }`

### `POST /meals/api/prep/plan`
Req: `{ "planId":"<uuid>" }`  
Res: `{ "steps":[{"when":"Sunday","task":"Cook 1kg rice; cool; portion"}] }`

### `POST /meals/api/grocery/export`
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

## 9) Plans & Limits

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

## 10) Accessibility & UX

- Large touch targets; keyboard navigation; highâ€‘contrast mode.  
- Screenâ€‘reader labels on buttons and ingredient checkboxes.  
- Metric/imperial toggle; RTL support for Arabic; localized number formats.

---

## 11) Suggested File Layout

```
src/pages/meals/index.astro
src/pages/meals/new.astro
src/pages/meals/plan/[id].astro
src/pages/meals/grocery/[id].astro
src/pages/meals/recipes/index.astro
src/pages/meals/recipes/new.astro
src/pages/meals/pantry/index.astro
src/pages/meals/settings.astro

src/pages/meals/api/plan/generate.ts
src/pages/meals/api/plan/update.ts
src/pages/meals/api/plan/swap.ts
src/pages/meals/api/plan/delete.ts
src/pages/meals/api/plan/index.ts
src/pages/meals/api/plan/list.ts
src/pages/meals/api/grocery/list.ts
src/pages/meals/api/grocery/export.ts
src/pages/meals/api/pantry/apply.ts
src/pages/meals/api/pantry/update.ts
src/pages/meals/api/pantry/index.ts
src/pages/meals/api/recipe/create.ts
src/pages/meals/api/recipe/update.ts
src/pages/meals/api/recipe/delete.ts
src/pages/meals/api/recipe/search.ts
src/pages/meals/api/prep/plan.ts
src/pages/meals/api/profile/save.ts

src/components/meals/Planner/*.astro
src/components/meals/Recipes/*.astro
src/components/meals/Grocery/*.astro
src/components/meals/Pantry/*.astro
```

---

## 12) Future Enhancements (v2+)

- **Retailer connectors** for direct cart creation (Carrefour/LuLu placeholders today).  
- **Barcode scan** for pantry updates.  
- **Nutrient optimizer** (micros: potassium, calcium, iron, vitamins).  
- **Meal plan marketplace** (moderated templates).  
- **Wearable sync** (calories burned) to adjust targets.  
- **PWA offline** for grocery list & recipes in-store.

---

**End of Requirements â€” ready for Codex implementation.**