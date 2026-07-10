# Workflow: Research Report

## Purpose
Turn any topic into a clean, structured, cited report saved to `output/`.

---

## Phase 1 — Clarify (ALWAYS do this first, before any research)

Ask the user all of the following questions at once (not one at a time):

1. **Scope** — How broad or narrow should the coverage be? (e.g., high-level industry overview vs. a specific niche or subtopic)
2. **Audience** — Who will read this? (internal team, customers, investors, personal use, etc.)
3. **Depth** — Quick summary (~1 page) or deep dive (multi-section, detailed report)?
4. **Focus** — Any specific angles to prioritize? (e.g., pricing, competitors, trends, how-to, risks)
5. **Format** — Markdown file or plain text?

Wait for the user's answers before proceeding.

---

## Phase 2 — Research Plan

Before searching, state the plan clearly:

- List 3–5 key questions this report will answer
- List intended source types (news, academic, industry reports, competitor sites, etc.)
- Confirm with the user if anything looks off before starting

---

## Phase 3 — Research Execution

Use `WebSearch` to gather information. For each source found:

- Record the URL and one-sentence key takeaway
- Note if the source seems biased, outdated, or unreliable — flag it
- Aim for at least 5 distinct, credible sources

---

## Phase 4 — Organize & Draft

Use the template at `resources/report-template.md` as the skeleton. Fill in:

- **Executive Summary** — 2–3 bullet points covering the most important takeaways
- **Key Findings** — bullet list of concrete facts/data points
- **Detailed Sections** — one section per major research question (use findings to drive section titles)
- **Key Takeaways** — most important insights the reader should leave with
- **Recommended Next Steps** — 3 actionable steps, ordered by immediacy
- **Sources** — table with source name, URL, and retrieval date

Keep all prose in bullet points per project rules.

---

## Phase 5 — Save Output

Save the completed report to:

```
output/YYYY-MM-DD-[topic-slug].md
```

Example: `output/2026-04-17-lithium-battery-market.md`

Confirm to the user where the file was saved.
