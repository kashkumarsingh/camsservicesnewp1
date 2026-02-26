# Public Pages — Design System Audit

**Audit date:** 2026-02-26  
**Scope:** All public-facing pages under `app/(public)/` and shared components used on public pages.  
**Standard:** Kid- and parent-friendly theme: gradients, theme colours (primary-blue, navy-blue, light-blue-cyan, star-gold), no neutral slate/gray for backgrounds or primary UI.

---

## Design system standard (reference)

| Area | Use | Avoid |
|------|-----|--------|
| **Section backgrounds** | `bg-gradient-to-br from-blue-50 via-white to-purple-50`, `from-primary-blue/10`, `from-blue-50 to-purple-50` | `bg-white`, `bg-slate-50`, `bg-gray-50` as sole section background |
| **Borders** | `border-primary-blue/20`, `border-primary-blue/30` | `border-gray-200`, `border-slate-200`, `border-gray-100` |
| **Body text** | `text-navy-blue`, `text-navy-blue/80`, `text-navy-blue/90` | `text-gray-600`, `text-slate-600`, `text-gray-700` |
| **Headings** | `font-heading font-bold text-navy-blue` | `text-slate-900`, `text-gray-900` without theme |
| **Cards** | `rounded-card shadow-card border-2 border-primary-blue/20`, `card-hover-lift` | `border-gray-200`, `border-slate-200`, `shadow-sm` only |
| **Badges / pills** | `bg-primary-blue/10 text-navy-blue`, `rounded-full`, `border-primary-blue/30` | `bg-gray-100 text-gray-700`, `bg-slate-100` |
| **CTAs** | `buildPublicMetadata`, `CTASection` gradient/default, Button theme variants | Inline neutral backgrounds, slate buttons |
| **Auth/forms** | `rounded-header-button`, theme focus (`focus:ring-primary-blue`) | `border-gray-300`, `text-slate-*` for labels |

---

## Summary

| Status | Count | Notes |
|--------|-------|--------|
| **Compliant** | 11 | No slate/gray in page or already theme + gradients |
| **Partial** | 4 | Some theme but still neutral in places |
| **Non-compliant** | 15+ | Heavy slate/gray; needs update |

---

## Page-by-page audit

### Compliant

| Route | File(s) | Notes |
|-------|---------|--------|
| `/` | `page.tsx` | No slate/gray |
| `/about` | `about/page.tsx` | buildPublicMetadata; sections in separate components |
| `/blog` | `blog/page.tsx`, `BlogPageClient.tsx` | Gradients, navy-blue, theme badges |
| `/blog/[slug]` | `blog/[slug]/page.tsx`, `BlogSidebar.tsx` | Gradient content, theme colours |
| `/faq` | `faq/page.tsx` | No slate in page; FAQList has gray (see Shared) |
| `/contact` | `contact/page.tsx` | Minimal; contact components have gray |
| `/services` | `services/page.tsx` | No slate in list page |
| `/policies/[slug]` | `policies/[slug]/page.tsx` | Gradient hero, theme |
| `/page/[slug]` | `page/[slug]/page.tsx` | CMS-driven |
| `/login` | `LoginPageClient.tsx` | Uses slate gradient for layout (optional change) |
| `/register` | `RegisterPageClient.tsx` | Same as login |

### Partial

| Route | File(s) | Violations |
|-------|---------|------------|
| `/contact/thank-you` | `contact/thank-you/page.tsx` | Cards: `border-gray-100` → use `border-primary-blue/20` |
| `/policies` | `policies/page.tsx` | `border-slate-200`, `text-slate-600` |

### Non-compliant

| Route | File(s) | Violations |
|-------|---------|------------|
| `/become-a-trainer` | `become-a-trainer/page.tsx` | Hero/cards: slate-50, slate-200, slate-900, slate-600, slate-700 |
| `/trainers` | `TrainersPageClient.tsx` | gray-300, gray-600, gray-700, gray-200 throughout |
| `/trainers/[slug]` | `trainers/[slug]/page.tsx` | Sidebar: border-gray-200, text-gray-700 |
| `/services/[slug]` | `services/[slug]/page.tsx` | Hero/prose: slate-200, slate-50, slate-900, slate-600, prose-slate |
| `/packages` | `packages/page.tsx` | text-gray-*, bg-gray-50, border-gray-200 |
| `/packages/[slug]` | `packages/[slug]/page.tsx` | Heavy gray everywhere (hero, stats, sections, cards, testimonials, FAQ) |
| `/book/[slug]` | `book/[slug]/page.tsx` | from-slate-50, text-gray-*, gray-50, border-gray-200 |

---

## Shared components (public pages)

### Compliant

- CTASection, Header, AuthButtons — updated.

### Non-compliant

| Component | Violations |
|-----------|------------|
| ContactVisitSection | border-gray-200, bg-gray-100, text-gray-600 |
| ContactSidebar | border-gray-200, text-gray-900/700/600, divide-gray-100 |
| ContactFormSection | Extensive gray-300/900/600/400/50/200 for form UI |
| ServiceCard | border-gray-200, text-gray-600 |
| ServiceList | text-gray-600 empty state |
| PackageCard | border/ring/text gray; bg-gray-900 badge; gray buttons |
| PackageList | text-slate-600 empty |
| TrainerCard | border-slate-200, text-slate-*, bg-slate-100 |
| FAQList | text-gray-600, border-gray-200, bg-gray-200, text-gray-700 |
| FAQItem, PolicyDisplay, ActivityCard, ActivityDetail, ActivityList | Loading/empty/text gray |
| TrainerProfile | border/text gray throughout |
| BlogPostDetail | text-gray-600/700, border-gray-200 |

---

## Prioritised remediation

1. **High:** become-a-trainer, trainers (list + detail), services/[slug], packages (list + detail).
2. **Medium:** policies list, contact thank-you, book/[slug].
3. **Shared:** Contact* components, ServiceCard, PackageCard, TrainerCard, FAQList, PolicyDisplay, Activity*, TrainerProfile.
4. **Lower:** Login/Register layout gradient; booking/account components.

---

## Checklist per page

- [ ] Section backgrounds: gradient or primary-blue/10; no standalone bg-white/slate-50/gray-50.
- [ ] Borders: border-primary-blue/20 or /30; no border-gray-200/slate-200.
- [ ] Text: headings font-heading font-bold text-navy-blue; body text-navy-blue or /80.
- [ ] Cards: rounded-card shadow-card border-2 border-primary-blue/20; badges bg-primary-blue/10 text-navy-blue.
- [ ] generateMetadata() uses buildPublicMetadata(); copy from constants; no hex.
