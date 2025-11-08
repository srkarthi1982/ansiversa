# ðŸ›’ Price Checker â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Price Checker** mini app that compares product prices across online/offline retailers, normalizes pack sizes, and tracks price history with alerts. Designed for Astro (SSR) + Tailwind + Alpine.js + Astro DB, deployed on Vercel.

> **Regions to prioritize first:** UAE (Dubai time, AED), with initial retailers like **Carrefour UAE, Lulu Hypermarket, Noon, Amazon.ae**. Add more stores later via adapters.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
- Search a product once; get **comparable offers** from multiple stores.  
- Normalize by **unit price** (e.g., AED/100g, AED/L, AED/unit).  
- Show **availability**, delivery/pickâ€‘up options, shipping fees, promotions, and **price history** charts.  
- Allow **alerts** for price drops or target price.  
- Export/share a **deal link** and **comparison table**.  

### Core Features
- **Store adapters**: pluggable sources per retailer (official APIs/feeds first; scraping only where allowed).
- **Canonical product mapping**: deduplicate identical products (barcode/GTIN if available).
- **Pack & size normalization**: parse quantity (e.g., â€œ2 x 1Lâ€, â€œ500 gâ€), compute perâ€‘unit price.
- **Smart query parsing**: brand + model + size keywords; localeâ€‘aware synonyms (EN/AR).
- **Filters**: store, delivery, availability, prime/express, rating, promo type, price range.
- **Sorting**: total price, unit price, distance (for offline), freshness (price updated at).
- **Price history**: per store per product; 30/90/365â€‘day view.
- **Alerts**: target price or % drop; delivery email/push (future).
- **Region & currency**: geo default to **AED**, support conversion via **Unit & Currency Converter** app service.
- **Compliance & safety**: follow robots.txt, store terms; rate limits, caching, and source attribution.

### Key Pages
- `/price` â€” Search & comparison (results table/cards + filters + sort + unit price).
- `/price/[canonicalId]` â€” Product detail (offers list + history chart + alert button).
- `/price/alerts` â€” Manage alerts.
- `/price/settings` â€” Region, currency, stores on/off, unit preferences (per 100g, per kg, etc.).
- `/price/sources` â€” Transparency (where data comes from, last refreshed).

### Minimal Data Model
`Store`, `Source`, `Product`, `CanonicalProduct`, `Offer`, `PricePoint`, `Query`, `Alert`, `Job`, `Profile`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Stores enabled | 4 | 20+ |
| Alerts | 3 active | 50 active |
| History | 30 days | 365 days |
| Exports | CSV only | CSV/JSON |
| Refresh onâ€‘demand | â€” | âœ… |
| Unit breakdowns | Basic | Advanced (multibuy, bundles) |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide **accurate, comparable** prices with transparent normalization and source timestamps.
- Respect **store policies** and avoid excessive traffic; prefer official APIs and affiliate feeds.
- Make results **portable** (export/share) and **composable** with other mini apps.

**Nonâ€‘Goals (v1)**
- No cart/checkout; link out to the retailer product page.
- No coupon injection/automation (show promos if publicly visible).

---

### 2) Architecture & Routes

**Pages**
- `/price` â€” Search bar; results as table/cards; sticky filters; unit price toggle; â€œtrack priceâ€ CTA.
- `/price/[canonicalId]` â€” Canonical product page; gallery, specs, offers list, price history chart; alert form.
- `/price/alerts` â€” List, edit, pause, delete alerts.
- `/price/settings` â€” Region/currency; preferred unit basis (per kg/L/100g); enable/disable stores.
- `/price/sources` â€” Show store adapters, status, last sync.

**API (SSR)**
- Search: `GET /price/api/search?q=&region=&cursor=`
- Canonical: `GET /price/api/product?id=`
- Offers refresh: `POST /price/api/offers/refresh` (Pro or cron)
- Alerts: `POST /price/api/alert/save` Â· `POST /price/api/alert/delete` Â· `GET /price/api/alert/list`
- History: `GET /price/api/history?canonicalId=&span=30|90|365`
- Settings: `POST /price/api/settings/save`
- Sources: `GET /price/api/sources` (health/status for adapters)

**Workers / Cron**
- `price:poll` â€” background fetch for changed offers (respect retailer limits & cache TTL).
- `price:alerts` â€” evaluate alerts, queue notifications.

---

### 3) Store Adapters

**Principles**
- Prefer **official APIs/feeds/affiliate programs**.  
- If scraping is allowed: obey **robots.txt**, cache responses, throttle, identify with UA.  
- Each adapter returns a uniform shape: `Product[]` or `Offer[]` with **source fields** preserved.

**Adapter Interface (pseudo)**
```ts
interface StoreAdapter {
  name: 'carrefour-uae'|'lulu-uae'|'noon'|'amazon-ae'|string;
  regions: string[];                   // e.g., ['AE']
  supportsUnitPrice: boolean;
  search(q: Query): Promise<RawProductResult[]>;
  offers(productRef: ProductRef): Promise<RawOffer[]>; // per product page
  resolveCanonical(raw: RawProductResult): CanonicalHint; // brand, name, size, gtin
}
```

**Normalization Pipeline**
1. **Parse size/pack**: â€œ2 x 1Lâ€, â€œ500 gâ€, â€œ6â€‘packâ€, â€œ200 mlâ€.  
2. **Map to base units**: mass (g/kg), volume (ml/L), count (unit).  
3. **Compute unit price**: price / baseQuantity (per 100g or per kg depending on category).  
4. **Canonical entity** by (brand + product line + flavor + size) or **GTIN** if present.  
5. Persist raw + normalized rows; show both price and unit price; show **asâ€‘of** time.

---

### 4) Data Model (Astro DB / SQL)

**Store**  
- `id` (pk), `key` (text unique), `name`, `region`, `status` ('active'|'paused'), `meta` (json:{affiliateTag, throttle, ttl})

**Source** (per adapter run)  
- `id` (pk), `storeId` (fk), `kind` ('search'|'offers'), `input` (json), `status` ('ok'|'error'), `fetchedAt`, `error` (text|null)

**Product** (raw per store)  
- `id` (pk), `storeId` (fk), `storeSku` (text), `title`, `brand` (text|null), `sizeLabel` (text|null), `image` (text|null), `url` (text), `category` (text|null), `gtin` (text|null), `createdAt`

**CanonicalProduct**  
- `id` (uuid pk), `fingerprint` (text unique), `brand`, `name`, `variant` (text|null), `sizeValue` (numeric|null), `sizeUnit` (text|null: g|kg|ml|l|unit), `image` (text|null), `category` (text|null), `createdAt`

**Offer** (normalized per store per canonical)  
- `id` (pk), `canonicalId` (fk), `storeId` (fk), `productId` (fkâ†’Product.id), `price` (numeric), `currency` (char3), `unitPrice` (numeric|null), `unitBasis` (text|null:'per_100g'|'per_kg'|'per_l'|'per_unit'), `availability` ('in_stock'|'out_of_stock'|'limited'|'unknown'), `delivery` (json:{pickup,shippingFee,eta}), `promo` (json:{type,desc,until}), `asOf` (datetime)

**PricePoint**  
- `id` (pk), `offerId` (fk), `price` (numeric), `unitPrice` (numeric|null), `asOf` (datetime)

**Query**  
- `id` (pk), `q` (text), `region` (text), `filters` (json), `createdAt`

**Alert**  
- `id` (pk), `userId` (fk), `canonicalId` (fk), `targetPrice` (numeric|null), `dropPercent` (numeric|null), `active` (bool), `lastTriggeredAt` (datetime|null), `createdAt`

**Job**  
- `id` (pk), `type` ('poll'|'alerts'), `payload` (json), `status` ('queued'|'running'|'done'|'error'), `createdAt`

**Profile**  
- `id` (pk), `userId` (fk), `region` (text default 'AE'), `currency` (char3 default 'AED'), `unitPrefs` (json)

Indexes: `Offer.canonicalId+storeId`, `PricePoint.offerId+asOf`, `CanonicalProduct.fingerprint`, `Product.gtin`.

---

### 5) UX / UI

- **Search bar** with examples; recent searches; popular categories (Milk, Rice, Oil, Baby Diapers, etc.).  
- **Results table** with columns: store (logo), title, pack/size, **price**, **unit price**, promo, availability, updated (asâ€‘of), link.  
- **Cards mode** on mobile; sticky sort & filters; infinite scroll or pagination.  
- **Detail page**: best offer callout; list all stores; **sparkline/chart** of history; alert form.  
- **Settings**: region + currency + preferred unit basis; toggle stores; set default sort.  
- **Accessibility**: keyboard navigation, ARIA labels, large touch targets.

Shortcuts: `Enter` search, `S` sort menu, `F` toggle filters, `A` set alert.

---

### 6) Calculations & Normalization Rules

- **Pack detection**: recognize â€œxâ€, â€œÃ—â€, â€œpackâ€, â€œpcsâ€, â€œbottleâ€, â€œsachetâ€.  
- **Size parsing**: `(\d+(\.\d+)?)\s*(ml|l|g|kg)`; multiply by pack count if â€œ2 x 1Lâ€.  
- **Unit basis** defaults by category: dry goods **per kg**, liquids **per L**, small items **per 100g** for comparability.  
- **Total cost** = item price + shipping (if mandatory) âˆ’ promo credit (if automatic). Show assumptions.  
- **Currency**: if mixed, convert to profile currency via Converter service and show both values.

---

### 7) Compliance, Caching & Rate Limits

- **Compliance first**: use public/affiliate APIs where possible; only scrape if robots.txt allows; set proper UA; throttle.  
- **Caching**: cache search results and product pages by query/sku; TTL per store (e.g., 10â€“60 min).  
- **Attribution**: always link to the store page; include â€œasâ€‘ofâ€ timestamp.  
- **Rate Limits**: per IP/per user and per adapter; exponential backoff on errors.  
- **Data freshness banner** if result age > TTL.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Stores | 4 | 20+ |
| Alerts | 3 | 50 |
| History | 30 days | 365 days |
| Exports | CSV | CSV/JSON |
| Refresh now | â€” | âœ… |
| API access | â€” | âœ… (internal) |

---

### 9) Suggested File Layout

```
src/pages/price/index.astro
src/pages/price/[canonicalId].astro
src/pages/price/alerts.astro
src/pages/price/settings.astro
src/pages/price/sources.astro

src/pages/price/api/search.ts
src/pages/price/api/product.ts
src/pages/price/api/offers/refresh.ts
src/pages/price/api/alert/save.ts
src/pages/price/api/alert/delete.ts
src/pages/price/api/alert/list.ts
src/pages/price/api/history.ts
src/pages/price/api/settings/save.ts
src/pages/price/api/sources.ts

src/lib/price/adapters/carrefour-uae.ts
src/lib/price/adapters/lulu-uae.ts
src/lib/price/adapters/noon.ts
src/lib/price/adapters/amazon-ae.ts
src/lib/price/normalize.ts
src/lib/price/unit-parser.ts
src/lib/price/canonical.ts
src/lib/price/calc.ts
src/lib/price/cache.ts
src/lib/price/rate-limit.ts

src/components/price/SearchBar.astro
src/components/price/Filters.astro
src/components/price/ResultsTable.astro
src/components/price/OfferCard.astro
src/components/price/HistoryChart.astro
src/components/price/AlertForm.astro
```

---

### 10) Pseudocode Snippets

**Canonical fingerprint**
```ts
function fingerprint(brand, name, variant, sizeValue, sizeUnit) {
  return slugify([brand, name, variant, `${sizeValue}${sizeUnit}`].join('-').toLowerCase());
}
```

**Unit price**
```ts
function unitPrice(price, qtyValue, qtyUnit, basis='per_kg') {
  const grams = toGrams(qtyValue, qtyUnit); // e.g., 500g â†’ 500; 1kg â†’ 1000
  const perKg = price / (grams/1000);
  return basis === 'per_100g' ? perKg / 10 : perKg;
}
```

**Alert evaluation**
```ts
for (const alert of activeAlerts) {
  const best = await getBestOffer(alert.canonicalId);
  if (!best) continue;
  const hitTarget = alert.targetPrice && best.price <= alert.targetPrice;
  const hitDrop = alert.dropPercent && percentDrop(best.price, recentAvg) >= alert.dropPercent;
  if (hitTarget || hitDrop) notifyUser(alert.userId, best);
}
```

---

### 11) Acceptance Criteria

- [ ] Search returns comparable offers across at least **Carrefour UAE, Lulu, Noon, Amazon.ae** for common products (e.g., milk, rice).  
- [ ] Results display **price**, **unit price**, promo info, availability, and **asâ€‘of** timestamps.  
- [ ] Product detail page shows **price history** and **alert** creation.  
- [ ] Normalization handles â€œmultiâ€‘packâ€ and size units correctly.  
- [ ] Caching & rate limits prevent store overload; data respects store policies.  
- [ ] Region defaults to **AE/AED** with option to change currency.  
- [ ] Clean file layout and documented adapters.

---

### 12) Future Enhancements (v2+)

- **Store pickup locator** with distance and store stock.  
- **Coupon code & loyalty card** fields (manual).  
- **AI substitution** suggestions (cheaper alternatives with similar specs).  
- **Weekly basket** tracker (compare a saved list total across stores).  
- **Browser extension** to show best price on retailer pages.

---

**End of Requirements â€” Ready for Codex Implementation.**