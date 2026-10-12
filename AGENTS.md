# Golden Promise — Agent Context

Malaysian wedding vendor **directory** (PropertyGuru-style classifieds), not a marketplace.
Couples browse verified venues/vendors and contact them via WhatsApp directly. Vendors pay a
subscription to be listed. No transactions, no commission, no cart/checkout anywhere in this app
— if you find yourself reaching for that, stop, it was deliberately removed.

FYP (Final Year Project) deadline: 15 July 2026.

## Stack

- **Backend:** Laravel 12, `backend/` — Sanctum SPA cookie auth, Eloquent, PHP attribute-based
  `#[Fillable([...])]` on models instead of `protected $fillable`.
- **Frontend:** React 19 + Vite, `frontend/src/` — Tailwind v4, framer-motion, GSAP + ScrollTrigger,
  Lenis (smooth scroll), Leaflet (maps), TanStack Query for all server state.
- **Database:** PostgreSQL 17 on **Aiven cloud (free tier)**. It auto-suspends when idle — if API
  calls fail with `could not translate host name "...aivencloud.com"`, the DB is asleep and needs
  manual "Power on" from the Aiven console; that is not a code bug.
- **AI:** Groq API, Llama 3.3 70B Versatile. `GROQ_API_KEY` in `backend/.env`. Used only for
  couple-facing planning tools (Smart Budget, Smart Checklist, "Ask Aisha" budget chat) — never for
  vendor/marketplace features.

## Brand tokens (do not invent new colors/fonts)

- Burgundy `#7B1F2A` (primary) · Deep burgundy `#4E1218` (text/dark sections) ·
  Blush `#FAEDE6` (soft surfaces) · Gold `#C08E3F` (accent) · Salmon `#E8C7BD`
- Fonts: **Great Vibes** (script accents/logo), **Playfair Display** (headings, italic accents),
  **Inter** (body)
- Prefer inline `style={{ color: '#4E1218' }}` or the Tailwind tokens already defined
  (`bg-burgundy-900`, `text-blush-100`, etc.) over introducing new hex values.

## Directory map

- `frontend/src/pages/` — route-level pages (Home, Venues, Vendors, dashboard/*, admin/*, vendor/*)
- `frontend/src/components/` — shared UI (`DashboardSidebar.jsx`, `Header.jsx`, `LiquidBlob.jsx`,
  `WavyDivider.jsx`, `SplitText.jsx`, `Magnetic.jsx`, `Reveal.jsx`)
- `frontend/src/api/` — one file per resource, thin axios wrappers only (no business logic)
- `backend/app/Http/Controllers/` — one controller per resource; `AiBudgetChatController.php` and
  `AiGeneratorController.php` are the two Groq integration points
- `backend/database/migrations/` — check here before assuming a column exists; several frontend
  fields currently reference columns that were never migrated (see Known Issues)

## Known issues / active work (read before touching Budget)

The Budget page (`frontend/src/pages/dashboard/Budget.jsx`) LOOKS complete but has real structural
gaps, verified against the schema — don't assume the UI reflects the database:

1. **`budget_items` has no `actual_cost` or `paid` column.** The frontend renders
   `it.actual_cost` / `it.paid` everywhere; they will always be `0`/`undefined`. Fix requires a new
   migration + `BudgetItemController::update` validation + UI to actually set these values.
2. **Vendor drawer fields (city/state/email/event date) are concatenated into one `notes` text
   column**, not stored as structured fields. Unqueryable, unsortable, can't drive reminders.
3. **The bell (reminders) and note icons on every budget row are non-functional** — they show a
   "coming soon" toast. Either wire them up or remove them; don't leave fake affordances.
4. **`See top matches` link is broken** — it links to `/vendors?category=X` but
   `frontend/src/pages/Vendors.jsx` has no query-param handling. Category filtering only works via
   the route `/vendors/:slug` (`VendorCategory.jsx`) using kebab-case slugs, not free-text names.
5. **Category delete uses a bare `confirm()` and cascades**, deleting all linked `budget_items`
   (including AI-booked real vendors) with no undo.
6. **`avg_min`/`avg_max` columns exist and are populated by the AI generator, but the current table
   UI never displays them.**
7. `frontend/src/api/budget.js` still exports `createExpense`/`updateExpense`/`deleteExpense`
   against an orphaned `budget_expenses` table nothing in the UI calls anymore — dead code,
   candidate for removal, don't build new features on top of it.

## Conventions

- No comments explaining WHAT code does — only WHY, for non-obvious constraints.
- Don't add cart/checkout/commission/payment-processing back in — this was a deliberate pivot away
  from a marketplace model. If a task seems to need it, ask first.
- Seeded test accounts (password `password`): `admin@goldenpromise.my`,
  `couple@goldenpromise.my`, `vendor@goldenpromise.my`.
- Before declaring a fix done, verify against the actual migration files in
  `backend/database/migrations/` — this project has drifted between frontend assumptions and
  backend schema before (see Known Issues above), so "the UI shows it" is not proof it works.
