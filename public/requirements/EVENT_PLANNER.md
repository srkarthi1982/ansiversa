# ðŸ“… Event Planner â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/events`  
**Category:** Lifestyle & Wellâ€‘Being / Productivity  
**Stack:** Astro + Tailwind (islands for forms/dragâ€‘drop), Astro SSR API routes, Astro DB / Supabase, optional background workers for reminders  
**Goal:** Plan single or multiâ€‘day events (meetup, class, workshop, wedding, birthday, webinar) with smart timelines, task checklists, budgets, guest lists (RSVP), venue & vendor tracking, reminders, and exports. Integrates with Presentation Designer (runâ€‘ofâ€‘show deck), Email Polisher (invites/thanks), and Price Checker (vendors).

> Positioning: A lightweight but powerful event OS â€” from idea â†’ plan â†’ invite â†’ execute â†’ recap.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Create events with templates (Birthday, Wedding, Workshop, Meetup, Webinar, Custom).  
- Manage **agenda/timeline**, **tasks** (with assignees & due dates), **budget**, **guests & RSVPs**, **venues/vendors**, **assets** (files, images), **notes** and **checklists**.  
- Send **invites** and **reminders** (email/SMS placeholder), track **open/RSVP** status.  
- Generate **runâ€‘ofâ€‘show** and **printable schedules**, export ICS invites, PDF/MD summaries.  
- Dashboard with **Dâ€‘day countdown**, critical tasks, and budget usage.  
- Multiâ€‘language, timeâ€‘zone aware, and mobileâ€‘first.

### Nonâ€‘Goals (v1)
- No live payment collection for tickets (use â€œExternal ticket linkâ€).  
- No live twoâ€‘way calendar sync (export ICS only; GCal/Outlook connectors in v2).  
- No live seating chart editor (basic seating notes only).

---

## 2) Event Types & Templates

- **Birthday/Anniversary**: guest list, simple budget, cake/venue/vendor tasks.  
- **Wedding**: multiâ€‘day ceremonies, vendors per category, advanced budget, seating notes.  
- **Workshop/Class**: registrations list, materials checklist, speaker/host timeline.  
- **Meetup/Conference (1â€‘track)**: sessions, sponsors, venue rooms, checkâ€‘in list.  
- **Webinar**: virtual link, registration page, reminder emails, postâ€‘event survey.

Each template seeds: default **phases**, **tasks**, **budget categories**, **email copy**, **RSVP form** fields.

---

## 3) User Stories (Acceptance Criteria)

1. **Create an Event**
   - *As an organizer*, I select a template and enter title, dates, time zone, and location.  
   - **AC:** `/events/api/create` returns `eventId` with seeded tasks/budget and RSVP form.

2. **Plan Timeline**
   - *As an organizer*, I drag items in a timeline and set durations.  
   - **AC:** `/events/api/agenda/save` stores items with start/end and dependencies.

3. **Invite & Track RSVPs**
   - *As an organizer*, I import guests (CSV) and send invites.  
   - **AC:** `/events/api/guests/import` accepts CSV; `/events/api/invite/send` queues invites; `/events/rsvp/[slug]` shows branded RSVP page; `/events/api/rsvp` records response.

4. **Budget & Vendors**
   - *As a finance lead*, I add line items and assign vendors.  
   - **AC:** `/events/api/budget/save` stores items; totals show **planned vs actual** and **variance**.

5. **Tasks & Assignees**
   - *As a coordinator*, I create tasks with assignee & due date; I get reminders.  
   - **AC:** `/events/api/tasks/save` persists tasks; reminder jobs scheduled for dueâ€‘1d/hour.

6. **Dayâ€‘Of Run Sheet**
   - *As a host*, I export a runâ€‘ofâ€‘show (PDF) with contacts and contingencies.  
   - **AC:** `/events/api/export` returns PDF/MD; phoneâ€‘friendly view available at `/events/run/[eventId]`.

7. **Postâ€‘Event Recap**
   - *As an organizer*, I send a survey and generate a recap.  
   - **AC:** `/events/api/survey/send` queues messages; `/events/api/recap` compiles attendance, cost, feedback, and highlights.

8. **Plan Gating**
   - Free: 1 active event, 100 guests, basic export.  
   - Pro: unlimited events, 5k guests event, advanced templates, custom branding, reminders, and analytics.

---

## 4) Routes & Information Architecture

- `/events` â€” Hub: Create event (template picker), recent events, quick stats.  
- `/events/new` â€” Wizard (details, dates, template, branding).  
- `/events/[eventId]` â€” Event dashboard (tabs).  
- Tabs under event: **Overview Â· Agenda Â· Tasks Â· Budget Â· Guests Â· Vendors Â· Assets Â· Settings**.  
- Public pages: `/events/rsvp/[slug]`, `/events/info/[slug]`, `/events/run/[eventId]` (shareable run sheet).

**API (SSR):**  
- `POST /events/api/create` Â· `GET /events/api/list` Â· `POST /events/api/delete`  
- `POST /events/api/agenda/save` Â· `GET /events/api/agenda`  
- `POST /events/api/tasks/save` Â· `POST /events/api/tasks/update` Â· `POST /events/api/tasks/status`  
- `POST /events/api/budget/save` Â· `GET /events/api/budget`  
- `POST /events/api/guests/import` Â· `POST /events/api/guests/add` Â· `POST /events/api/guests/update`  
- `POST /events/api/invite/send` Â· `POST /events/api/reminders/send`  
- `POST /events/api/rsvp` Â· `GET /events/api/guestlist`  
- `POST /events/api/vendors/save` Â· `GET /events/api/vendors`  
- `POST /events/api/assets/upload` Â· `GET /events/api/assets`  
- `POST /events/api/export` (pdf|md|ics|csv)  
- `POST /events/api/recap`

---

## 5) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `timezone`, `language`, `createdAt`

**Event**  
- `id` (pk uuid), `userId` (fk), `title`, `description`, `type` ('birthday'|'wedding'|'workshop'|'meetup'|'webinar'|'custom'), `tz`,
  `start` (datetime), `end` (datetime), `location` (json {address, mapUrl, virtualUrl}), `slug` (unique),  
  `brand` (json {logoUrl, theme, palette}), `status` ('planning'|'active'|'done'|'archived'), `createdAt`, `updatedAt`

**AgendaItem**  
- `id` (pk uuid), `eventId` (fk), `title`, `desc`, `start`, `end`, `owner`, `dependsOn` (json ids), `location` (string), `notes` (text)

**Task**  
- `id` (pk uuid), `eventId` (fk), `title`, `desc`, `assignee`, `due`, `priority` ('p0'|'p1'|'p2'), `status` ('todo'|'doing'|'done'), `tags` (json)

**BudgetItem**  
- `id` (pk uuid), `eventId` (fk), `category` ('venue'|'food'|'decor'|'travel'|'marketing'|'misc'), `planned` (decimal), `actual` (decimal), `vendorId` (fk nullable), `notes`

**Vendor**  
- `id` (pk uuid), `eventId` (fk), `name`, `type` ('venue'|'caterer'|'photographer'|'sound'|'decor'|'transport'|'other'), `contact` (json), `quote` (decimal|null), `status` ('prospect'|'booked'|'paid'|'cancelled'), `notes`

**Guest**  
- `id` (pk uuid), `eventId` (fk), `name`, `email`, `phone`, `group` ('family'|'friends'|'vip'|'team'|'other'), `plusOnes` (int), `invited` (bool), `rsvp` ('yes'|'no'|'maybe'|null), `diet` (json), `notes`

**MessageTemplate**  
- `id` (pk uuid), `eventId` (fk), `type` ('invite'|'reminder'|'thanks'|'update'|'survey'), `subject`, `body`, `lang`, `channel` ('email'|'sms'), `variables` (json)

**Asset**  
- `id` (pk uuid), `eventId` (fk), `type` ('image'|'pdf'|'doc'|'spreadsheet'|'other'), `name`, `url`, `meta` (json), `createdAt`

**Survey**  
- `id` (pk uuid), `eventId` (fk), `link` (string), `questions` (json), `results` (json), `createdAt`

**ReminderJob**  
- `id` (pk), `eventId` (fk), `type` ('task_due'|'event_start'|'rsvp_reminder'), `runAt`, `status` ('queued'|'sent'|'error'), `payload` (json)

---

## 6) RSVP & Public Pages

### `/events/info/[slug]`
- Cover image, title, date/time (local + event TZ), location map or virtual link, schedule snippet, CTA: RSVP.

### `/events/rsvp/[slug]`
- Form: name, email, phone (optional), RSVP (Yes/No/Maybe), plusâ€‘ones, dietary restrictions, comments.  
- Success view with ICS download and â€œAdd to Calendarâ€ buttons.

**ICS Export**: one VEVENT per agenda start/end (or master event).

---

## 7) Budget & Reports

- Budget table with **planned/actual/variance** per category and total.  
- Export CSV; printable PDF.  
- Dashboard KPIs: **Guest confirmations**, **Tasks overdue**, **Budget variance**, **Days left**.

---

## 8) Templates & Seeding

- Store builtâ€‘in templates in `TemplatePack` with seeded **phases, tasks, budget categories, RSVP copy**.  
- Users can clone and customize templates.  
- Localization for template copy (en/ar/ta).

---

## 9) Validation Rules

- Title 3â€“120 chars; time range must be valid; time zone required.  
- Guests <= 5,000 (Free up to 100).  
- Budget decimal precision 2; totals autoâ€‘computed.  
- Vendors must have a name and contact method if status != prospect.  
- Files up to 10 MB; allowed mime types: images/pdf/doc/xlsx/csv.  
- Public slugs must be unique and URLâ€‘safe.

---

## 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Active events | 1 | Unlimited |
| Guests per event | 100 | 5,000 |
| Templates | Basic | All + custom branding |
| Exports | PDF, ICS (watermark) | PDF/ICS/CSV (no watermark) |
| Reminders | â€” | Task/Event/RSVP |
| Vendors | Basic fields | Full tracking + status |
| Analytics | Basic KPIs | Trends + variance + cohort views |

Rate limits: `userId`+day for invites/reminders/export; `eventId`+hour for RSVP reminders.

---

## 11) Accessibility & UX

- Large touch targets, highâ€‘contrast mode, keyboard navigation.  
- Clear date/time pickers with time zone awareness.  
- Screenâ€‘reader labels and ARIA roles for forms and tables.  
- RTL support for Arabic; localized date formats.

---

## 12) Suggested File Layout

```
src/pages/events/index.astro
src/pages/events/new.astro
src/pages/events/[eventId]/index.astro
src/pages/events/[eventId]/agenda.astro
src/pages/events/[eventId]/tasks.astro
src/pages/events/[eventId]/budget.astro
src/pages/events/[eventId]/guests.astro
src/pages/events/[eventId]/vendors.astro
src/pages/events/[eventId]/assets.astro
src/pages/events/[eventId]/settings.astro
src/pages/events/info/[slug].astro
src/pages/events/rsvp/[slug].astro
src/pages/events/run/[eventId].astro

src/pages/events/api/create.ts
src/pages/events/api/list.ts
src/pages/events/api/delete.ts
src/pages/events/api/agenda/save.ts
src/pages/events/api/agenda/index.ts
src/pages/events/api/tasks/save.ts
src/pages/events/api/tasks/update.ts
src/pages/events/api/tasks/status.ts
src/pages/events/api/budget/save.ts
src/pages/events/api/budget/index.ts
src/pages/events/api/guests/import.ts
src/pages/events/api/guests/add.ts
src/pages/events/api/guests/update.ts
src/pages/events/api/invite/send.ts
src/pages/events/api/reminders/send.ts
src/pages/events/api/rsvp.ts
src/pages/events/api/guestlist.ts
src/pages/events/api/vendors/save.ts
src/pages/events/api/vendors/index.ts
src/pages/events/api/assets/upload.ts
src/pages/events/api/assets/index.ts
src/pages/events/api/export.ts
src/pages/events/api/recap.ts

src/components/events/Dashboard/*.astro
src/components/events/Agenda/*.astro
src/components/events/Tasks/*.astro
src/components/events/Budget/*.astro
src/components/events/Guests/*.astro
src/components/events/Vendors/*.astro
src/components/events/Assets/*.astro
```

---

## 13) Future Enhancements (v2+)

- **Calendar connectors** (Google/Outlook) for twoâ€‘way sync.  
- **Ticketing** (Stripe + QR checkâ€‘in).  
- **Seating chart** editor and table assignments.  
- **Vendor marketplace** hooks (Price Checker integration).  
- **Mobile PWA** with offline mode for dayâ€‘of checklist.  
- **Postâ€‘event insights**: cost per attendee, NPS/CSAT survey analytics.

---

**End of Requirements â€” ready for Codex implementation.**