# Archive Section — Design

**Date:** 2026-08-01
**Status:** Approved, ready for implementation planning

## Problem

The festival has run three editions (2023, 2024, 2025) but the site only ever shows the current
one. Each year the previous program was deleted film-by-film through the CMS to make room for the
new slate — the 2024 program was erased on 2025-08-01, the 2023 program on 2024-08-05. Visitors
have no way to see past years, and the festival loses its own history every August.

This design adds an Archive section and, more importantly, ends the delete-to-refresh cycle: past
editions stay on the site and the annual rollover becomes a single setting change.

## Goals

1. `/archive` lists every edition; `/archive/<year>` shows that year's program, looking and
   behaving like the Movies page.
2. Restore the 2023 and 2024 programs as full content, with working film detail pages.
3. Make future rollovers non-destructive.

## Non-goals

- Redesigning the Movies page visuals. Archive pages reuse the existing look.
- Search, filtering, or cross-year browsing beyond the year index.
- Restoring editions before 2023 (none exist).

## Findings that shaped the design

**The three editions and their exact slates.** Film add-dates are *not* a reliable source: the 2023
films were created by renaming January-2023 placeholder files (`desert-peony.md` →
`invisible-demons.md`), and in 2024 the CMS recycled two 2023 files into new films (`enys-men.md`
→ `agra.md`, `glömska.md` → `the-feeling.md`), so rename-following crosses year boundaries. The
reliable source is the content tree snapshotted at the last commit before each year's purge:

| Edition | Films | Ran | Programs | Snapshot commit |
|---|---|---|---|---|
| 2023 | 8 | 31 Mar – 2 Apr 2023 | none | `578b8d6` |
| 2024 | 21 | 30 Aug – 1 Sep 2024 | 7 features, 9 shorts1, 5 shorts2 | `01783b4` |
| 2025 | 24 | 28–31 Aug 2025 | 7 features, 9 shorts1, 5 helsingborg, 3 music | working tree |

One 2024 film carries a stray `Thursday, August 01 16:30` screening that falls outside the
festival run — almost certainly a CMS default left unedited. The restore preserves it as-is;
correcting it is Hussain's call, not the script's.

**Program sections differ by year, and the current template hardcodes them.**
[pages/movies/index.vue](../../../pages/movies/index.vue) has four copy-pasted `h2` + grid blocks
(Features, Shorts 1, Helsingborg, Music). But 2023 films have no `program` field at all — it was
introduced 2024-08-06 — and 2024 used features/shorts1/**shorts2**, where the shorts2 block is
commented out in the template. A fixed set of sections would render 2023 as an empty page and drop
5 of 2024's 21 films. Sections must therefore be data, not markup.

**"Current year" cannot be derived from the calendar.** Today is 2026-08-01, but every film in the
repo is from 2025 and the live Movies page shows the 2025 program under a "*The 2026 program will
be revealed early August*" teaser. Deriving the current edition from `new Date()` would blank the
page.

**Images for archived films are recoverable.** 2024's stills are almost entirely still on disk
(60 referenced, 3 missing). 2023's were deleted along with the films, but git history holds 252
image blobs under the two stills directories versus 129 on disk, so the missing ones can be
restored from history.

**Executive producers have never rendered.** The CMS writes `exectProducers` / `exectProducer`
(typo) while [pages/movies/\[slug\].vue](../../../pages/movies/[slug].vue) reads `execProducers` /
`execProducer`. Every film's exec-producer credits are silently dropped. In scope to fix.

## Content model

### Films

One new frontmatter field:

```yaml
year: 2025
```

Films stay in a flat `content/films/` folder. No slug collisions exist across the three editions
(verified), so detail URLs stay `/movies/<slug>` for every film, past and present — existing links
keep working.

### Editions

New `content/editions/<year>.md`, one per festival. Replaces `content/pages/movies.md`.

```yaml
---
year: 2025
heading: The Movies
dates: 28–31 August 2025
isAnnounced: true
featuredImage: /public/img/film-stills/….jpg
announcement: "*The 2026 program will be revealed early August*"
sections:
  - title: Features
    program: features
    description: "…"
  - title: Shorts Program 1
    program: shorts1
    description: "…"
---

Intro copy as markdown body.
```

| Field | Purpose |
|---|---|
| `year` | Identity; matches films' `year` |
| `heading` | Page `h1` |
| `dates` | Human-readable run dates, shown on the archive index |
| `isAnnounced` | Existing behavior — when false, only heading and body render |
| `featuredImage` | Archive-index thumbnail; falls back to the first film's thumbnail if unset |
| `announcement` | Teaser rendered on `/movies` only, never on the archive page |
| `sections` | Ordered list of program groups; empty list means one ungrouped grid |
| body | Intro copy |

`announcement` exists because the current "2026 revealed early August" line is a property of the
*current page*, not of the 2025 program. Keeping it separate means `/archive/2025` does not inherit
a stale promise once 2026 launches.

### Site settings

New `content/settings.yml`:

```yaml
currentEdition: 2025
```

Registered under the existing Site Settings CMS collection alongside `submissions.yml`. `/movies`
renders this edition. The annual rollover is: create the new edition file, add its films, change
this one value.

### Migration of existing page content

- `content/pages/movies.md` → `content/editions/2025.md`. Its four `*Description` fields become
  four `sections` entries (features, shorts1, helsingborg, music); its body becomes the edition
  body; the 2026 teaser line moves from the body into `announcement`.
- 2024's `content/pages/movies.md` at `01783b4` → `content/editions/2024.md`, three sections
  (features, shorts1, shorts2).
- 2023's at `578b8d6` → `content/editions/2023.md`. It had only `heading`, `isAnnounced`, and the
  body "All films subtitled in English." — so `sections: []`.

## Routes and components

| Route | Behavior |
|---|---|
| `/archive` | Year list with thumbnails, newest first, "Current" badge on `currentEdition` |
| `/archive/<year>` | Renders that edition; canonical link points to `/movies` when it is the current edition |
| `/movies` | Renders `currentEdition` |
| `/movies/<slug>` | Unchanged; serves all 53 films |

Archive index rows show: thumbnail, year, `dates`, film count, arrow. All three editions are
listed including the current one — 2025 appears immediately, badged "Current".

### New components

**`components/FilmGrid.vue`** — takes `films`, renders the `ul.film-grid` markup (thumbnail
wrapper, arrow, gauze, `NuxtImg`, title, date). This markup currently exists as four identical
copies inside [pages/movies/index.vue](../../../pages/movies/index.vue); this reduces it to one.

**`components/EditionProgram.vue`** — takes `edition` and `films`. Walks `edition.sections`,
rendering an `h2`, a lead paragraph, and a `FilmGrid` of films whose `program` matches
`section.program`. When `sections` is empty, renders a single `FilmGrid` of all the edition's
films. Sections with no matching films render nothing.

### Changed components

**`pages/movies/index.vue`** — becomes a thin wrapper: read `currentEdition`, fetch its films,
render `announcement` and `EditionProgram`. The sort-by control stays.

**`pages/movies/[slug].vue`** — year-aware back button: "← All Films" → `/movies` when the film
belongs to the current edition, "← 2024 Films" → `/archive/2024` otherwise. Plus the
`exectProducers` fix below.

**`components/Nav.vue` and `components/MobileNav.vue`** — "Archive" link after "A Bit About".

## Data flow

```
content/settings.yml ──> currentEdition ──> /movies renders that edition
                                    │
content/editions/*.md ──────────────┴─────> /archive lists all editions
        │                                        │
        │ sections[].program                     │
        v                                        v
content/films/*.md (year: N) ──filter by year──> EditionProgram ──> FilmGrid
```

## The `exectProducers` fix

Approved as part of this work. Three coordinated changes:

1. [pages/movies/\[slug\].vue](../../../pages/movies/[slug].vue) reads `execProducers` /
   `execProducer` — keep as-is, it is the correct spelling.
2. [public/admin/config.yml](../../../public/admin/config.yml) — rename the field `exectProducers`
   → `execProducers` and its subfield `exectProducer` → `execProducer`.
3. Rename the key in all existing film markdown as part of the restore script, so current 2025
   films and restored ones agree.

All three must land together; renaming only the CMS config would orphan existing content.

## One-time restore

A script, run once, committed as content:

1. Write 8 film files from `578b8d6` and 21 from `01783b4` into `content/films/`.
2. Restore missing referenced images from git history into `public/img/film-stills/`.
3. Normalize restored content:
   - 2023's singular `producer` / `execProducer` string fields → the `producers` / `execProducers`
     list-of-objects shape the template expects.
   - Strip the stray HTML ticket-button markup saved into `green-night.md`'s `stills` field.
   - Rename `exectProducers` → `execProducers` across all films.
   - Leave `/static/...` image paths alone — `useStaticRemover` already handles them.
4. Add `year:` to all 53 films: 8 → 2023, 21 → 2024, 24 → 2025.
5. Write the three edition files.

Films whose images are unrecoverable render without a thumbnail rather than blocking the restore;
the script reports any such cases.

## CMS changes

- **Films**: add a Year field; add `view_filters` on year and `sortable_fields` so the list stays
  navigable at 53+ entries.
- **Editions**: new folder collection over `content/editions`, with a `sections` list widget
  (title, program select, description) mirroring the frontmatter above.
- **Site Settings**: add `currentEdition`.
- **Pages**: remove the "Movies Page" file entry, now superseded by Editions.

## Error handling

| Case | Behavior |
|---|---|
| `/archive/<year>` with no edition file | 404 |
| Edition with `sections: []` | Single ungrouped grid |
| Section matching no films | Section omitted |
| Film missing `year` | Excluded from all edition pages; flagged during restore |
| Film missing thumbnail | Grid item renders without image (existing `v-if` behavior) |
| `currentEdition` pointing at a missing edition | `/movies` renders empty state; caught in verification |

## Verification

No test framework exists in this project, so verification is a real build plus a browser pass:

- `yarn build` succeeds.
- `/archive` lists 2025 (badged Current), 2024, 2023 with thumbnails and correct counts.
- `/archive/2023` renders 8 films ungrouped; `/archive/2024` renders 21 across three sections
  including shorts2; `/archive/2025` renders 24 across four sections.
- `/movies` still renders the 2025 program with the 2026 announcement.
- A sample of restored film detail pages (one per year) renders synopsis, credits, stills, and
  screenings, with a correct year-aware back button.
- Exec producers now visible on a film that has them.
- No image 404s in the network log across the archive pages.

## Rollout

The restore lands as one commit of content plus one of code. `currentEdition` stays at 2025, so
`/movies` is unchanged for visitors on day one and the archive is purely additive.
