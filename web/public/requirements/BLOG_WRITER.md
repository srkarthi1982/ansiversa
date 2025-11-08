# ðŸ“° Blog Writer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/blog-writer` (builder) and `/blog` (public posts)  
**Category:** Writing and Creativity  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase, optional image generation API  
**Goal:** Help users **ideate, outline, draft, optimize (SEO), and publish** longâ€‘form blog posts with AI assistance â€” including image prompts, internal linking, and clean exports.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- Generate **ideas and outlines**; expand sections into **drafts**; **rewrite** for tone/reading level.
- Builtâ€‘in **editor** with headings, lists, code blocks, and images (Markdownâ€‘first).
- **SEO assistant**: title/slug, meta description, keywords, internal links, readability metrics.
- **Templates** for posts (Tutorial, Listicle, Case Study, Opinion, Release Notes).
- **Exports** (MD/HTML/PDF) and **publish** to `/blog/[slug]` with RSS feed.
- **Media library**: upload/insert images; AI image prompt helper (optional).

### Nonâ€‘Goals (v1)
- No multiâ€‘author newsroom workflow (assign/approve) â€” single author only.
- No comments system (Phase 2).
- No scheduling queue (Phase 2).

---

## 2) User Stories (with Acceptance Criteria)

1. **Topic â†’ Ideas**
   - *As a user*, I enter a topic and get 5â€“10 post ideas.  
   - **AC:** `/blog-writer/api/ai-ideas` returns ideas categorized by angle (beginner, advanced, trend).

2. **Outline Generator**
   - *As a user*, I select an idea and generate an outline (H1/H2/H3).  
   - **AC:** `/blog-writer/api/ai-outline` returns a hierarchical outline editable before drafting.

3. **Draft Sections**
   - *As a user*, I select one or more headings to **expand** into paragraphs, bullet points, or code samples.  
   - **AC:** `/blog-writer/api/ai-expand` writes content honoring tone (professional/friendly/technical) and target word count.

4. **Rewrite / Summarize / Shorten**
   - *As a user*, I can improve a selected paragraph (clarity, tone, length).  
   - **AC:** `/blog-writer/api/ai-rewrite` returns a safe, improved version; preserves facts as much as possible.

5. **SEO Assist**
   - *As a user*, I get a **title**, **meta description**, **slug**, **keywords**, and **internal links** suggestions.  
   - **AC:** `/blog-writer/api/ai-seo` returns structured SEO fields + score + recommendations.

6. **Images**
   - *As a user*, I can **upload** images or get **AI prompt suggestions** for hero/inline images.  
   - **AC:** `/blog-writer/api/ai-image-prompts` returns prompt ideas; uploaded images stored and referenced in Markdown (`![]()` paths).

7. **Publish**
   - *As a user*, I can preview and publish to `/blog/[slug]`.  
   - **AC:** Status changes to `published`; appears in blog index and RSS; canonical URL generated.

8. **Export**
   - *As a user*, I can export **Markdown**, **HTML**, and **PDF**.  
   - **AC:** File reflects current draft with hero image, TOC (optional), and code fences intact.

9. **Versioning**
   - *As a user*, I can save versions (v1, v2â€¦) and restore previous ones.  
   - **AC:** Version list shows timestamp, size, and diff preview (line/word).

10. **Plan Gating**
    - Free: up to 5 drafts, 1 publish/month, limited AI calls, â€œPowered by Ansiversaâ€ footer.  
    - Pro: unlimited drafts, unlimited publish, advanced SEO, no footer.

---

## 3) Information Architecture and Routes

- `/blog-writer` â€” Dashboard (drafts list + â€œNew Postâ€)  
- `/blog-writer/editor` â€” Main editor (outline tree + rich editor + SEO panel + media)  
- `/blog` â€” Public blog index (paginated)  
- `/blog/[slug].astro` â€” Public article view  
- `/blog/rss.xml` â€” RSS feed

**API Routes (SSR):**  
- `POST /blog-writer/api/create`  
- `POST /blog-writer/api/save` (patch; autosave)  
- `POST /blog-writer/api/ai-ideas`  
- `POST /blog-writer/api/ai-outline`  
- `POST /blog-writer/api/ai-expand`  
- `POST /blog-writer/api/ai-rewrite`  
- `POST /blog-writer/api/ai-seo`  
- `POST /blog-writer/api/ai-image-prompts`  
- `POST /blog-writer/api/publish`  
- `POST /blog-writer/api/export` (md/html/pdf)  
- `POST /blog-writer/api/delete`  
- `POST /blog-writer/api/duplicate`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `createdAt`

**Post**  
- `id` (pk uuid), `userId` (fk), `title`, `slug` (unique per user), `status` ('draft'|'published'),  
  `summary` (text), `contentMd` (longtext), `outline` (json), `seo` (json), `hero` (json),  
  `tags` (json), `readingMins` (int), `wordCount` (int),  
  `lastSavedAt` (datetime), `publishedAt` (datetime|null), `createdAt` (datetime)

**Media**  
- `id` (pk), `userId` (fk), `filePath` (string), `alt` (string), `width` (int), `height` (int), `createdAt`

**Tag** (optional)  
- `id` (pk), `userId` (fk), `name` (string), `slug` (string)

**PostTag** (optional)  
- `postId`, `tagId` (composite pk)

### JSON Examples

**Post.outline**  
```json
{
  "title": "Astro vs Next.js for Content Sites",
  "tree": [
    {"h": 2, "text": "Why performance matters"},
    {"h": 2, "text": "Rendering models"},
    {"h": 2, "text": "DX and ecosystem"},
    {"h": 2, "text": "Case studies"}
  ]
}
```

**Post.seo**  
```json
{
  "title": "Astro vs Next.js: Which One for Content Sites?",
  "slug": "astro-vs-nextjs-content-sites",
  "description": "We compare Astro and Next.js across performance, DX, and content workflows.",
  "keywords": ["Astro", "Next.js", "SSG", "content sites"],
  "internalLinks": [
    {"label": "Ansiversa Resume Builder", "url": "/resume"},
    {"label": "Quiz Institute", "url": "/quiz"}
  ],
  "score": 86,
  "recommendations": ["Shorten meta description to ~155 chars"]
}
```

**Post.hero**  
```json
{
  "image": "/uploads/blog/astro-vs-next/hero.png",
  "caption": "Astro and Next.js compared for content performance."
}
```

---

## 5) Editor UI / Pages

### `/blog-writer` (Dashboard)
- Table/cards: title, status, last edited, word count, tags, actions (**Open / Publish / Duplicate / Delete**).  
- Filters: status, tag, date range.  
- CTA: â€œNew Postâ€ â†’ choose Template (Tutorial/Listicle/Case Study/Opinion/Release Notes).

### `/blog-writer/editor`
- **Left**: Outline Tree (drag to reorder H2/H3). Buttons: Generate Outline, Expand Section, Add Section.  
- **Center**: Markdown Editor (toolbar: bold/italic/link/code/quote/list, AI Rewrite, Insert Image).  
- **Right**: SEO Panel (title/slug/meta/keywords/score), Post Settings (tags, hero image, publish toggle).  
- Footer: word count, reading time, autosave indicator.

### `/blog` (Public Index)
- Grid/list of published posts with hero, title, excerpt, reading time, tags, date.  
- Pagination; tag filter; RSS link.

### `/blog/[slug]` (Public View)
- Clean article page (typography, code highlighting, footnotes), social share, related posts.  
- Optional â€œPowered by Ansiversaâ€ footer on Free plan.

---

## 6) API Contracts

### `POST /blog-writer/api/create`
Req: `{ "title": "Astro vs Next.js", "template": "case-study" }`  
Res: `{ "id": "<uuid>", "slug": "astro-vs-nextjs" }`

### `POST /blog-writer/api/save`
Req: `{ "id": "<uuid>", "patch": { "path": "contentMd", "value": "# Heading..." } }`  
Res: `{ "ok": true, "wordCount": 1530, "readingMins": 7, "lastSavedAt": "<ISO>" }`

### `POST /blog-writer/api/ai-ideas`
Req: `{ "topic": "Astro performance", "audience": "developers" }`  
Res: `{ "ideas": [{"title":"..."}, {"title":"..."}] }`

### `POST /blog-writer/api/ai-outline`
Req: `{ "title": "Astro vs Next.js", "keywords": ["Astro","Next.js"] }`  
Res: `{ "outline": { "tree": [{ "h":2, "text":"..." }] } }`

### `POST /blog-writer/api/ai-expand`
Req: `{ "outline": {...}, "selection": [{"h":2,"text":"Rendering models"}], "tone":"technical", "words": 200 }`  
Res: `{ "content": "Generated paragraphs/markdown..." }`

### `POST /blog-writer/api/ai-rewrite`
Req: `{ "text": "para", "mode": "clarify|shorten|expand|tone", "tone":"friendly" }`  
Res: `{ "text": "rewritten para" }`

### `POST /blog-writer/api/ai-seo`
Req: `{ "title":"...", "contentMd":"...", "siteLinks":[{"label":"Resume","url":"/resume"}] }`  
Res: `{ "seo": { "title":"...", "slug":"...", "description":"...", "keywords":[...], "internalLinks":[...], "score": 0-100, "recommendations":[...] } }`

### `POST /blog-writer/api/ai-image-prompts`
Req: `{ "title":"...", "keywords":["astro","performance"] }`  
Res: `{ "prompts": ["futuristic static site...", "comparison chart..."] }`

### `POST /blog-writer/api/publish`
Req: `{ "id": "<uuid>", "slug": "astro-vs-nextjs-content-sites" }`  
Res: `{ "url": "/blog/astro-vs-nextjs-content-sites", "status": "published" }`

### `POST /blog-writer/api/export`
Req: `{ "id": "<uuid>", "format":"md|html|pdf" }`  
Res: `{ "url": "/exports/Post_Astro_vs_Next_2025-10-22.md" }`

### `POST /blog-writer/api/delete`
Req: `{ "id": "<uuid>" }`  
Res: `{ "ok": true }`

### `POST /blog-writer/api/duplicate`
Req: `{ "id": "<uuid>" }`  
Res: `{ "id": "<newUuid>" }`

---

## 7) Validation Rules

- Title 3â€“120 chars; slug unique per user.  
- Content length: min 300 words to publish.  
- SEO: meta description â‰¤ 160 chars; at least 1 internal link and 1 image (recommended).  
- Images: webâ€‘safe formats; alt text required; max 5MB each.  
- Tags: up to 8 per post; kebabâ€‘case slug.

---

## 8) Export and Rendering

- **Markdown**: primary storage and export; supports code fences and tables.  
- **HTML**: SSR render with clean typography and syntax highlighting.  
- **PDF**: server rendering with page numbers, cover (optional).  
- **RSS**: generated from latest 20 published posts.

---

## 9) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Drafts | 5 | Unlimited |
| Publishes / month | 1 | Unlimited |
| AI calls/day | 20 | Unlimited (fair-use) |
| Templates | 2 basic | All |
| Footer | â€œPowered by Ansiversaâ€ | None |

Rate limit keys: `userId` + day for AI; `userId` + month for publish.

---

## 10) Security and Privacy

- Drafts private; public only when published.  
- Sanitize Markdown on publish; allow basic HTML whitelisting for embeds (Phase 2).  
- Do not retain AI inputs beyond 30 days (configurable).

---

## 11) Analytics and Events

- `post.create`, `post.save`, `post.publish`, `post.export`, `post.delete`, `post.duplicate`, `ai.ideas`, `ai.outline`, `ai.expand`, `ai.rewrite`, `ai.seo`.  
- Track word count growth and read-time.

---

## 12) Accessibility and SEO

- Keyboardâ€‘accessible editor controls; aria labels.  
- Public posts include structured data (Article JSONâ€‘LD), OG/Twitter cards, canonical URL.  
- Support RTL posts (Arabic) with direction switch.

---

## 13) Suggested File Layout

```
src/pages/blog-writer/index.astro
src/pages/blog-writer/editor.astro

src/pages/blog/index.astro
src/pages/blog/[slug].astro
src/pages/blog/rss.xml.ts

src/pages/blog-writer/api/create.ts
src/pages/blog-writer/api/save.ts
src/pages/blog-writer/api/ai-ideas.ts
src/pages/blog-writer/api/ai-outline.ts
src/pages/blog-writer/api/ai-expand.ts
src/pages/blog-writer/api/ai-rewrite.ts
src/pages/blog-writer/api/ai-seo.ts
src/pages/blog-writer/api/ai-image-prompts.ts
src/pages/blog-writer/api/publish.ts
src/pages/blog-writer/api/export.ts
src/pages/blog-writer/api/delete.ts
src/pages/blog-writer/api/duplicate.ts

src/components/blog-writer/Outline/*.astro or .tsx
src/components/blog-writer/Editor/*.astro
src/components/blog/PostCard.astro
```

---

## 14) Future Enhancements (v2+)

- Scheduled publishing and social auto-share.  
- Collaboration (review/approve) and suggestions mode.  
- Plagiarism checker integration; factâ€‘checking assist.  
- Multiâ€‘author support with author pages.  
- Content calendar view.

---

**End of Requirements â€” ready for Codex implementation.**