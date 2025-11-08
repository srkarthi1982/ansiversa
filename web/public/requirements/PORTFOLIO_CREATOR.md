# ðŸŒ Portfolio Creator â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module:** `/portfolio`  
**Stack:** Astro (+ Tailwind, Alpine.js, Astro SSR routes, Astro DB / Supabase)  
**Goal:** Allow users to **create and publish their own portfolio websites** showcasing their profile, skills, and projects â€” with AI text enhancement and customizable templates.

---

## 1. Objectives

- Users can build a personal portfolio quickly without coding.
- AI assists in writing and improving content like About, Skills, and Project descriptions.
- Provide ready-made templates (Professional, Minimal, Creative, Bold).
- Public view on URLs like `ansiversa.com/portfolio/<username>`.
- Allow PDF/HTML export.
- Gated free/pro access.

---

## 2. Main User Stories

1. **Create Portfolio:** New entry with user info â†’ open in builder.  
2. **Edit Sections:** Update About, Skills, Experience, Projects, Contact.  
3. **AI Improve:** Enhance text tone/professionalism.  
4. **Switch Template:** Instantly preview other designs.  
5. **Upload Media:** Upload profile/project images.  
6. **Preview and Publish:** Live preview and publish to public URL.  
7. **Export PDF/HTML:** Offline copy download.  
8. **Pro Features:** Unlimited portfolios, all templates, no watermark.

---

## 3. Routing and APIs

- `/portfolio` â†’ Dashboard.  
- `/portfolio/builder` â†’ Main editor (form + preview).  
- `/portfolio/view/[slug]` â†’ Public portfolio view.  
- `/portfolio/templates` â†’ Template gallery.

**API Endpoints:**  
- `/api/create`, `/api/save`, `/api/publish`, `/api/ai-improve`, `/api/export`, `/api/delete`.

---

## 4. Database

**User:** id, email, plan, createdAt.  
**Portfolio:** id, userId, title, slug, templateKey, status, data (JSON), lastSavedAt.  
**Media:** id, portfolioId, filePath, type.

**JSON Example:**  
```json
{
  "basics": {"name": "Karthik", "title": "Fullâ€‘Stack Dev", "email": "me@example.com"},
  "about": "AI builder enthusiast.",
  "skills": [{"name": "Astro", "level": "Expert"}],
  "projects": [{"name": "Quiz Institute", "description": "Learning app"}]
}
```

---

## 5. UI Structure

- **Dashboard:** list + create button.  
- **Builder:** left form / right preview.  
- **Templates:** theme gallery.  
- **Public View:** SEO-rich public portfolio.

---

## 6. Validation

- Required fields: name, title, email.  
- About â‰¤ 1500 chars.  
- 1â€“20 projects.  
- Unique slug.

---

## 7. Export

- **PDF** via SSR render.  
- **HTML ZIP** download.  
- Optional public link `/portfolio/view/[slug]`.

---

## 8. Plans

| Feature | Free | Pro |
|----------|------|-----|
| Portfolios | 1 | Unlimited |
| Templates | 1 | All |
| Storage | 10â€¯MB | 500â€¯MB |
| AI Improves | 3/day | Unlimited |

---

## 9. Security and SEO

- Hide private data.  
- Sanitize inputs.  
- SEO + OpenGraph metadata.  
- Events: `create`, `save`, `publish`, `export`, `ai.improve`.

---

## 10. Future Enhancements

- Custom subdomains (e.g. `myname.ansiversa.com`).  
- Integration with Resume Builder.  
- Analytics (views, clicks).  
- Theme customizer.

---

**End of Document â€” Ready for Codex Implementation.**