# Cursorrules vs docs/cursorcontext — Alignment Check

**Checked:** 2025-02-02  
**Purpose:** Ensure `.cursorrules` references resolve to `docs/cursorcontext/` and that files exist and are populated.

**Updates applied:** `.cursorrules` was updated so all "See:" and "For detailed guides" links use `docs/cursorcontext/`. `database/DESIGN_PRINCIPLES.md` was renamed to `DATABASE_DESIGN_PRINCIPLES.md`.

---

## 1. Path alignment

`.cursorrules` currently points to **top-level** `docs/` paths (e.g. `docs/frontend/...`, `docs/database/...`). Your canonical context lives under **`docs/cursorcontext/`**.

| .cursorrules reference | docs/cursorcontext equivalent | Resolves? |
|------------------------|-------------------------------|-----------|
| `docs/frontend/UX_DESIGN_PRINCIPLES.md` | `docs/cursorcontext/frontend/UX_DESIGN_PRINCIPLES.md` | No (different path) |
| `docs/frontend/SKELETON_LOADING_GUIDE.md` | `docs/cursorcontext/frontend/SKELETON_LOADING_GUIDE.md` | No |
| `docs/database/DATABASE_DESIGN_PRINCIPLES.md` | `docs/cursorcontext/database/DATABASE_DESIGN_PRINCIPLES.md` | Yes (after .cursorrules update + file rename) |
| `docs/architecture/EXTENSIBILITY_PATTERNS.md` | `docs/cursorcontext/architecture/EXTENSIBILITY_PATTERNS.md` | No |
| `docs/architecture/SOLID_PRINCIPLES.md` | `docs/cursorcontext/architecture/SOLID_PRINCIPLES.md` | No |
| `docs/api/API_BEST_PRACTICES.md` | `docs/cursorcontext/api/API_BEST_PRACTICES.md` | No |
| `docs/features/notifications/EMAIL_POLICY.md` | `docs/cursorcontext/features/notifications/EMAIL_POLICY.md` | No |
| `docs/features/booking/PARENT_UX_STANDARD.md` | `docs/cursorcontext/features/booking/PARENT_UX_STANDARD.md` | No |
| `docs/GLOSSARY.md` | `docs/cursorcontext/GLOSSARY.md` | No |

**Recommendation:** Update `.cursorrules` so all “For detailed guides, see” and “See:” links use the `docs/cursorcontext/` prefix (see section 4 below). Optionally keep a single source of truth under `docs/cursorcontext/` and do not duplicate under `docs/frontend/`, `docs/database/`, etc.

---

## 2. Naming alignment

| .cursorrules | docs/cursorcontext | Action |
|--------------|--------------------|--------|
| `DATABASE_DESIGN_PRINCIPLES.md` | `DESIGN_PRINCIPLES.md` | Align name: either rename to `DATABASE_DESIGN_PRINCIPLES.md` in cursorcontext or update .cursorrules to `DESIGN_PRINCIPLES.md`. |

**Done:** `docs/cursorcontext/database/DESIGN_PRINCIPLES.md` was renamed to `DATABASE_DESIGN_PRINCIPLES.md` so the filename matches `.cursorrules`.

---

## 3. Content status (docs/cursorcontext)

| File | Status | Note |
|------|--------|------|
| `frontend/UX_DESIGN_PRINCIPLES.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` or create full guide |
| `frontend/SKELETON_LOADING_GUIDE.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` or create full guide |
| `database/DATABASE_DESIGN_PRINCIPLES.md` | Stub (links to cleanarchitecture) | Full content in `docs/cleanarchitecture/database/DATABASE_DESIGN_PRINCIPLES.md` — expand stub if needed |
| `database/PERFORMANCE_OPTIMIZATION.md` | Empty | Root `docs/cursorcontext/PERFORMANCE_OPTIMIZATION.md` has content — consider moving or copying here |
| `database/MIGRATION_STRATEGY.md` | Has content | OK (verify and keep) |
| `architecture/EXTENSIBILITY_PATTERNS.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` |
| `architecture/SOLID_PRINCIPLES.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` |
| `architecture/CLEAN_ARCHITECTURE_GUIDE.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` (not referenced in .cursorrules) |
| `api/API_BEST_PRACTICES.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` or create |
| `features/notifications/EMAIL_POLICY.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` or existing policy docs |
| `features/booking/PARENT_UX_STANDARD.md` | Empty | Populate from `COMPLETE_SETUP_GUIDE.md` or existing booking docs |
| `GLOSSARY.md` | Empty | Populate with project terms |
| `COMPLETE_SETUP_GUIDE.md` | Has content | Describes structure and condensed content for remaining files |
| `PERFORMANCE_OPTIMIZATION.md` (root) | Has content | Database performance; consider aligning with `database/PERFORMANCE_OPTIMIZATION.md` |
| `MIGRATION_STRATEGY.md` (root) | Has content | Verify vs `database/MIGRATION_STRATEGY.md` |
| `OPTIMIZATION_SUMMARY.md` | Has content | OK |

**Recommendation:** Populate empty files using the condensed versions in `COMPLETE_SETUP_GUIDE.md`, or copy/symlink from `docs/cleanarchitecture/` where content already exists (e.g. `DATABASE_DESIGN_PRINCIPLES.md`).

---

## 4. .cursorrules paths to update

To make all “See” and “For detailed guides” references resolve to `docs/cursorcontext/`, change:

- `docs/frontend/` → `docs/cursorcontext/frontend/`
- `docs/database/` → `docs/cursorcontext/database/`
- `docs/architecture/` → `docs/cursorcontext/architecture/`
- `docs/api/` → `docs/cursorcontext/api/`
- `docs/features/` → `docs/cursorcontext/features/`
- `docs/GLOSSARY.md` → `docs/cursorcontext/GLOSSARY.md`

**Do not change:**

- `docs/cleanarchitecture/<category>/<feature>.md` — used for implementation docs (different purpose).
- `.cursorrules-cost-optimization` and `docs/AI_COST_WARNING_TEMPLATE.md` — leave as-is unless you move those too.

---

## 5. Summary

1. **Paths:** Update `.cursorrules` so every “See:” and “For detailed guides, see” link uses `docs/cursorcontext/` for the guides above.
2. **Naming:** Use `DATABASE_DESIGN_PRINCIPLES.md` under `docs/cursorcontext/database/` (rename from `DESIGN_PRINCIPLES.md` if you keep one file).
3. **Content:** Fill or link the empty cursorcontext files (from `COMPLETE_SETUP_GUIDE.md` or `docs/cleanarchitecture/`) so the linked docs are useful when Cursor or a developer follows the rules.

After these changes, `.cursorrules` and `docs/cursorcontext/` will be aligned and the referenced docs will resolve and contain content.
