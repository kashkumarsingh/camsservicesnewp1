# ML/AI Plan: Worry-Free, Human-Operator-Friendly

**Purpose:** Outline ML and AI options that can be adopted with minimal operational risk and without requiring constant human oversight. This is a planning document only; no implementation.

**Definition of "worry free" here:** The system suggests, ranks, or summarises; a human remains in the loop for any consequential decision. No autonomous high-stakes actions; outputs are explainable and auditable where needed.

---

## 1. Principles for Worry-Free AI/ML

| Principle | Meaning |
|-----------|--------|
| **Augmentation, not replacement** | AI assists (prioritise, draft, flag); humans approve or decide. |
| **Bounded tasks** | Classification, ranking, summarisation, anomaly scoring—not open-ended generation of policy or financial decisions. |
| **Fallback to human** | Low confidence → surface to operator; never auto-apply critical actions. |
| **Explainability** | Where it matters (e.g. "why was this session flagged?"), provide a short, consistent reason. |
| **No PII in prompts by default** | Prefer IDs, aggregates, or anonymised snippets; keep personal data in your systems, not in third-party model inputs unless contractually and legally clear. |
| **Auditability** | Log what was suggested and whether it was accepted/rejected, for debugging and compliance. |

---

## 2. Recommended Use Cases (Worry-Free Tier)

### 2.1 Admin / Operations

- **Session / booking triage**
  - **What:** Score or rank items (e.g. "needs attention", "likely no-show", "payment at risk") using rules + optional lightweight ML (e.g. simple classifiers or scoring models).
  - **Why worry free:** Output is a suggestion; admin still assigns, cancels, or contacts. No automatic cancellation or payment changes.

- **Anomaly and outlier detection**
  - **What:** Flag unusual patterns (e.g. spike in no-shows, odd payment retries, outlier hours per child) for review.
  - **Why worry free:** Alerts only; human investigates and acts.

- **Demand and capacity hints**
  - **What:** Simple forecasting (e.g. next week's likely session demand by service or trainer) to aid rota and capacity planning.
  - **Why worry free:** Informational; no automatic scheduling or commitment.

- **Summarisation and drafting**
  - **What:** Short summaries of "what happened this week" for admins, or draft text for standard emails (reminders, follow-ups) from structured data.
  - **Why worry free:** Human edits and sends; no automated sending of unvetted content.

### 2.2 Parent / Trainer Experience

- **Smart defaults and recommendations**
  - **What:** "Parents like you often book X" or "Suggested times based on your history" using collaborative filtering or simple rules.
  - **Why worry free:** Suggestions only; user chooses. No automatic booking.

- **Friendly, templated replies**
  - **What:** Suggested reply snippets for common trainer/parent messages (from templates or very constrained generation).
  - **Why worry free:** Human selects and edits; no automated sending.

### 2.3 Content and Discovery (CMS / Public)

- **Search and ranking**
  - **What:** Improve search over packages, services, or FAQs (e.g. keyword + light semantic ranking or click-through signals).
  - **Why worry free:** Same content, better order; no generation of new public content.

- **Optional: SEO or meta descriptions**
  - **What:** Generate or suggest meta descriptions from existing titles/blurbs, with human review before publish.
  - **Why worry free:** Human always approves before anything goes live.

---

## 3. Use Cases to Treat as Higher Risk (Not "Worry Free" by Default)

- **Fully automated decisions** that affect money or legal (e.g. auto-refunds, auto-approval of bookings, auto-suspension of accounts). Keep these rule-based and human-approved until you explicitly design an exception.
- **Unconstrained generative content** shown to users without review (e.g. dynamic FAQ answers or policy text generated live).
- **Using PII in external model APIs** without a clear data-processing agreement and user/legal basis.
- **Replacing human support** with a chatbot that can change bookings or payments without a clear handoff to a human and an audit trail.

These can still be pursued later with proper guardrails, contracts, and risk acceptance; they are out of scope for the "worry free" set.

---

## 4. Implementation Approach (When You Do Implement)

- **Prefer "buy" over "build" for base models:** Use managed APIs (e.g. classification, embedding, or summarisation) with clear SLAs and data policies.
- **Keep logic in your codebase:** Your app should own rules, thresholds, and when to show "suggested" vs "automated"; the external service is one input.
- **Feature and feedback loop:** Store inputs and outcomes (e.g. "suggestion shown", "accepted" / "rejected") so you can tune or add simple models later without guessing.
- **Human-in-the-loop by default:** Any action that affects booking, payment, or account status should require an explicit human step (e.g. "Apply suggestion", "Send", "Approve").

---

## 5. Summary Table

| Area | Example | Risk level | Operator role |
|------|--------|------------|----------------|
| Triage / ranking | "Sessions needing attention" | Low | Review and act |
| Anomaly detection | Unusual no-shows, payment patterns | Low | Investigate and act |
| Demand hints | Next week demand forecast | Low | Use for planning |
| Summaries / drafts | Weekly digest, email drafts | Low | Edit and send |
| Recommendations | "Parents like you also booked…" | Low | User chooses |
| Search ranking | Better package/FAQ search | Low | Same content, better order |
| Auto-decisions on money/booking | Auto-refund, auto-approve | High | Keep human in loop |
| Unvetted generated content | Live FAQ/policy generation | Medium–High | Review before publish |

---

## 6. Next Steps (When You Decide to Implement)

1. Pick one "worry free" use case (e.g. session triage or anomaly alerts).
2. Define the exact input (data), output (suggestion/score/alert), and where the human approves or dismisses.
3. Choose build vs buy (e.g. managed ML API vs small in-house model) and document data flows and PII handling.
4. Add logging/audit for suggestions and outcomes.
5. Roll out behind a feature flag or admin-only, then extend.

---

*Document: planning only. No implementation in this deliverable.*
