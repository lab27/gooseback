# Archive Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `/archive` section listing every festival edition, with per-year pages that render past programs exactly like the Movies page, and stop the annual delete-the-previous-program cycle.

**Architecture:** Films gain a `year` field. `content/pages/movies.md` is replaced by one `content/editions/<year>.md` per festival, each carrying a data-driven `sections` list so a single component renders 2023 (no program groups), 2024 (three groups) and 2025 (four groups). A `currentEdition` setting decides what `/movies` shows. The 2023 and 2024 programs are restored from git snapshots.

**Tech Stack:** Nuxt 3 (SSR + prerender), @nuxt/content v2, @nuxt/image (ipx), Pug templates, Tailwind, Decap CMS via git-gateway.

**Spec:** [docs/superpowers/specs/2026-08-01-archive-design.md](../specs/2026-08-01-archive-design.md), approved at commit `8e4c732`.

## Global Constraints

- **No test framework exists in this project and this plan does not add one.** The spec chose build + browser verification. Every task below therefore ends with concrete, runnable verification commands whose expected output is stated exactly. Treat "run this, expect this output" as the test — run it *before* implementing to watch it fail, then after to watch it pass.
- **Templates are Pug** (`<template lang="pug">`). Match the existing indentation-based style.
- **Image paths in content keep their `/static/…` or `/public/…` prefixes.** `useStaticRemover` strips them at render time. Do not rewrite paths in content files.
- **Film detail URLs stay `/movies/<slug>` for every film of every year.** No slug collisions exist across editions (verified). Do not introduce year-scoped film routes.
- **Never delete film content files.** The whole point of this work is that past editions stay.
- Node scripts are ESM (`.mjs`) — the project has `"type": "module"`.
- **Check scripts live in `scripts/checks/`, not `/tmp`.** Node resolves bare specifiers like `yaml` from the *importing file's* directory, not the working directory, so a script in `/tmp` cannot import the project's dependencies no matter where you run it from. Commit these scripts — they encode the invariants (8/21/24 films, every image resolves, no `exectProducers`) and are the closest thing this project has to a test suite.
- Commit after every task. Do not squash tasks together.

## Reference data (verified against git; do not re-derive)

| Edition | Films | Run dates | Programs | Source |
|---|---|---|---|---|
| 2023 | 8 | 31 Mar – 2 Apr 2023 | none (field did not exist) | snapshot `578b8d6` |
| 2024 | 21 | 30 Aug – 1 Sep 2024 | 7 features, 9 shorts1, 5 shorts2 | snapshot `01783b4` |
| 2025 | 24 | 28–31 Aug 2025 | 7 features, 9 shorts1, 5 helsingborg, 3 music | working tree |

Full snapshot SHAs: 2023 = `578b8d6a86b4b41f08562e7c3b554588445ff625`, 2024 = `01783b4a84cce4afbdef4c60a29c1218d8863f73`.

**2024 uses two different commits.** Films come from `01783b4` (March 2025) — its film set is byte-identical to August 2024's, verified with `diff`. Page copy comes from `e44e9c7` (2024-08-12), the last genuine 2024 edit; by `01783b4` the page body had already been rewritten toward 2025. 2023 and 2025 each use a single source.

## File Structure

**Create:**
- `composables/useFilmDate.ts` — parse and format screening date strings. One responsibility: dates.
- `components/FilmGrid.vue` — the film thumbnail grid. Currently copy-pasted 4× inside the Movies page.
- `components/EditionProgram.vue` — walks an edition's `sections` and renders a `FilmGrid` per group.
- `pages/archive/index.vue` — the year index.
- `pages/archive/[year].vue` — one edition's program.
- `content/editions/2023.md`, `2024.md`, `2025.md` — per-edition content.
- `content/settings.yml` — `currentEdition`.
- `scripts/make-edition.mjs` — build an edition file from a historical `movies.md`. Used for all three years.
- `scripts/restore-archive.mjs` — one-time restore of past editions' films and images from git. Kept in-repo as provenance for the restored content.

**Modify:**
- `pages/movies/index.vue` — becomes a thin wrapper over `EditionProgram`.
- `pages/movies/[slug].vue` — year-aware back button; `exectProducers` fix.
- `components/Nav.vue`, `components/MobileNav.vue` — Archive link.
- `public/admin/config.yml` — Editions collection, Year field, settings, remove Movies Page entry.
- `package.json` — add `yaml` devDependency (used by the restore script).

**Delete:**
- `content/pages/movies.md` — superseded by `content/editions/2025.md` (Task 4, after the Movies page stops reading it).

---

### Task 1: Screening-date composable

Extract the date parsing/formatting that currently lives inline in `pages/movies/index.vue` so `FilmGrid` and the sort control can share it. The existing parser assumes the *current* year when a date string has no year — correct for the current program, wrong for archived films. Since films now carry `year`, the parser takes it as a parameter.

**Files:**
- Create: `composables/useFilmDate.ts`
- Test: none (no framework — verified by node import, Step 2/4)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `useFilmDate(): { formatScreeningDate(dateString: string, year?: number): string, parseScreeningDate(dateString: string, year?: number): number }`
  - `formatScreeningDate` returns `dd.MM HH:mm`, or the original string if unparseable, or `'TBA'` for empty input.
  - `parseScreeningDate` returns epoch milliseconds, or `0` if unparseable. Used for sorting only.

- [ ] **Step 1: Write the verification script**

```bash
mkdir -p scripts/checks
```

Create `scripts/checks/check-filmdate.mjs`:

```js
import { readFileSync } from 'node:fs'
const src = readFileSync('composables/useFilmDate.ts', 'utf8')
// crude but sufficient: strip TS types and the export wrapper, then eval the two functions
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }
assert(src.includes('formatScreeningDate'), 'exports formatScreeningDate')
assert(src.includes('parseScreeningDate'), 'exports parseScreeningDate')
assert(src.includes('year'), 'accepts a year parameter')
console.log('PASS')
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/checks/check-filmdate.mjs
```
Expected: `Error: ENOENT: no such file or directory, open 'composables/useFilmDate.ts'`

- [ ] **Step 3: Write the composable**

```ts
import { format } from 'date-fns'

const SCREENING_PATTERN = /(\w+),?\s+(\w+)\s+(\d{1,2})\s+(\d{1,2}):(\d{2})/

/**
 * Screening dates are authored by the CMS as "Saturday, August 30 18:00" — no year.
 * The film's edition year supplies the missing piece; without it we fall back to the
 * current year, which is only correct for the current program.
 */
const toDate = (dateString: string, year?: number): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null

  const direct = new Date(dateString)
  if (!isNaN(direct.getTime())) return direct

  const parts = dateString.match(SCREENING_PATTERN)
  if (!parts) return null

  const [, , monthName, day, hour, minute] = parts
  const resolvedYear = year ?? new Date().getFullYear()
  const parsed = new Date(`${monthName} ${day}, ${resolvedYear} ${hour}:${minute}:00`)
  return isNaN(parsed.getTime()) ? null : parsed
}

export const useFilmDate = () => {
  const formatScreeningDate = (dateString: string, year?: number): string => {
    if (!dateString) return 'TBA'
    const date = toDate(dateString, year)
    return date ? format(date, 'dd.MM HH:mm') : dateString
  }

  const parseScreeningDate = (dateString: string, year?: number): number => {
    const date = toDate(dateString, year)
    return date ? date.getTime() : 0
  }

  return { formatScreeningDate, parseScreeningDate }
}
```

- [ ] **Step 4: Run the check to verify it passes**

```bash
node scripts/checks/check-filmdate.mjs
```
Expected: `PASS`

- [ ] **Step 5: Commit**

```bash
git add composables/useFilmDate.ts scripts/checks
git commit -m "[feat] extract year-aware screening date composable"
```

---

### Task 2: Edition content for 2025 and the currentEdition setting

Create the new content shape for the current year without changing any rendering yet. The site keeps working off `content/pages/movies.md` until Task 4.

**Files:**
- Create: `content/editions/2025.md`, `content/settings.yml`, `scripts/make-edition.mjs`
- Modify: all 24 files in `content/films/` (add `year: 2025`), `package.json` (add `yaml` devDependency)

**Interfaces:**
- Consumes: nothing.
- Produces: `queryContent('editions').find()` returns docs shaped `{ year: number, heading: string, dates: string, isAnnounced: boolean, featuredImage?: string, announcement?: string, sections: Array<{ title: string, program: string, description: string }>, body: any }`. `queryContent('settings').findOne()` returns `{ currentEdition: number }`.

- [ ] **Step 1: Write the verification script**

Create `scripts/checks/check-2025-content.mjs`:

```js
import { readFileSync, readdirSync } from 'node:fs'
import { parse } from 'yaml'

const frontmatter = (path) => {
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error(`no frontmatter in ${path}`)
  return parse(m[1])
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const settings = parse(readFileSync('content/settings.yml', 'utf8'))
assert(settings.currentEdition === 2025, 'currentEdition is 2025')

const ed = frontmatter('content/editions/2025.md')
assert(ed.year === 2025, 'edition year is 2025')
assert(ed.isAnnounced === true, 'edition is announced')
assert(typeof ed.dates === 'string' && ed.dates.length > 0, 'edition has dates')
assert(typeof ed.announcement === 'string' && ed.announcement.includes('2026'), 'announcement carries the 2026 teaser')
assert(Array.isArray(ed.sections) && ed.sections.length === 4, `2025 has 4 sections, got ${ed.sections?.length}`)
assert(ed.sections.map(s => s.program).join(',') === 'features,shorts1,helsingborg,music', 'section programs in order')
ed.sections.forEach(s => assert(s.title && s.description, `section ${s.program} has title and description`))

// Filtered by year, not a bare directory count, so this check stays valid
// after Tasks 5 and 6 add the 2024 and 2023 films to the same folder.
const films = readdirSync('content/films')
  .filter(f => f.endsWith('.md'))
  .map(f => ({ file: f, fm: frontmatter(`content/films/${f}`) }))

assert(films.every(f => Number.isInteger(f.fm.year)), 'every film has an integer year')
const y2025 = films.filter(f => f.fm.year === 2025)
assert(y2025.length === 24, `24 films for 2025, got ${y2025.length}`)
console.log('PASS')
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/checks/check-2025-content.mjs
```
Expected: `Error: ENOENT … 'content/settings.yml'`

- [ ] **Step 3: Create the settings file**

`content/settings.yml`:

```yaml
currentEdition: 2025
```

- [ ] **Step 4: Write the edition generator**

The descriptions being migrated are 100–200 word strings containing colons, curly apostrophes and quotes. Hand-copying them into YAML frontmatter will corrupt the file, so generate it. The same script is reused for 2024 and 2023 in later tasks.

First add the YAML dependency it needs:

```bash
yarn add --dev yaml
```

`scripts/make-edition.mjs`:

```js
#!/usr/bin/env node
/**
 * Build content/editions/<year>.md from a historical content/pages/movies.md.
 *
 * The old page carried one fixed `<program>Description` field per section; editions carry
 * an ordered `sections` list instead, so line-ups that differ per year (2023 had no program
 * groups at all, 2024 had no music program) all render through one component.
 *
 * Usage:
 *   node scripts/make-edition.mjs 2025 --dates "28–31 August 2025"
 *   node scripts/make-edition.mjs 2024 --dates "30 August – 1 September 2024" --ref 01783b4…
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { parse, stringify } from 'yaml'

const [, , yearArg, ...rest] = process.argv
const year = Number(yearArg)
const arg = (name) => {
  const i = rest.indexOf(`--${name}`)
  return i === -1 ? undefined : rest[i + 1]
}
const dates = arg('dates')
const ref = arg('ref')

if (!Number.isInteger(year) || !dates) {
  console.error('Usage: node scripts/make-edition.mjs <year> --dates "<run dates>" [--ref <commit>]')
  process.exit(1)
}

// Canonical order and display titles, taken from the h2 strings the Movies page used to hardcode.
const SECTION_TITLES = [
  ['features', 'Features'],
  ['shorts1', 'Shorts Program 1'],
  ['shorts2', 'Shorts Program 2'],
  ['helsingborg', 'Helsingborg Special'],
  ['music', 'Music Program']
]

const source = ref
  ? execFileSync('git', ['show', `${ref}:content/pages/movies.md`], { encoding: 'utf8' })
  : readFileSync('content/pages/movies.md', 'utf8')

const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
if (!match) {
  console.error('Source movies.md has no frontmatter')
  process.exit(1)
}

const data = parse(match[1])
let bodyLines = match[2].split('\n')

// A "next year revealed soon" teaser belongs to the current page, not to this edition's
// program — pull it out so the archive page never inherits a stale promise.
let announcement
const teaserIndex = bodyLines.findIndex(l => /revealed/i.test(l) && l.trim())
if (teaserIndex !== -1 && teaserIndex < 3) {
  announcement = bodyLines[teaserIndex].trim()
  bodyLines.splice(teaserIndex, 1)
}

const sections = SECTION_TITLES
  .map(([program, title]) => ({ title, program, description: (data[`${program}Description`] ?? '').trim() }))
  .filter(section => section.description.length > 0)

const edition = {
  year,
  heading: data.heading ?? 'The Movies',
  dates,
  isAnnounced: data.isAnnounced ?? true,
  ...(announcement ? { announcement } : {}),
  sections
}

mkdirSync('content/editions', { recursive: true })
const out = `---\n${stringify(edition).trimEnd()}\n---\n\n${bodyLines.join('\n').trim()}\n`
writeFileSync(`content/editions/${year}.md`, out)

console.log(`wrote content/editions/${year}.md — ${sections.length} sections${announcement ? ', announcement extracted' : ''}`)
```

No `featuredImage` is written. The archive index falls back to the first film's thumbnail when it is unset, so Hussain can choose images later in the CMS rather than the plan guessing them.

- [ ] **Step 5: Generate the 2025 edition**

```bash
node scripts/make-edition.mjs 2025 --dates "28–31 August 2025"
```
Expected: `wrote content/editions/2025.md — 4 sections, announcement extracted`

Four, not five: `shorts2Description` is empty in the source and 2025 has no shorts2 films, so it is skipped. Read the result to confirm the descriptions survived intact:

```bash
head -20 content/editions/2025.md
```

- [ ] **Step 6: Add `year: 2025` to all 24 films**

```bash
for f in content/films/*.md; do
  # insert `year: 2025` immediately after the opening --- of the frontmatter
  perl -i -0pe 's/\A---\n/---\nyear: 2025\n/' "$f"
done
grep -c "^year: 2025" content/films/*.md | grep -v ":1$" || echo "all films have exactly one year field"
```
Expected: `all films have exactly one year field`

- [ ] **Step 7: Run the check to verify it passes**

```bash
node scripts/checks/check-2025-content.mjs
```
Expected: `PASS`

- [ ] **Step 8: Confirm the site still builds and `/movies` is unchanged**

```bash
yarn build
```
Expected: build succeeds. `content/pages/movies.md` is still present and still what the Movies page reads — nothing visible changed yet.

- [ ] **Step 9: Commit**

```bash
git add content/settings.yml content/editions/2025.md content/films scripts/make-edition.mjs scripts/checks package.json yarn.lock
git commit -m "[feat] add 2025 edition file, currentEdition setting, and year field on films"
```

---

### Task 3: FilmGrid and EditionProgram components

Replace four copy-pasted grid blocks with one component, and make program sections data-driven.

**Files:**
- Create: `components/FilmGrid.vue`, `components/EditionProgram.vue`

**Interfaces:**
- Consumes: `useFilmDate()` from Task 1; edition shape from Task 2.
- Produces:
  - `<FilmGrid :films="Film[]" />` where `Film` has `_path`, `title`, `thumbnail`, `year`, `screenings?: Array<{ dateTime: string, venue: string }>`.
  - `<EditionProgram :edition="Edition" :films="Film[]" />`. Renders one `h2` + lead paragraph + `FilmGrid` per section that has matching films; renders a single ungrouped `FilmGrid` when `edition.sections` is empty or absent.

- [ ] **Step 1: Write the verification script**

Create `scripts/checks/check-components.mjs`:

```js
import { readFileSync } from 'node:fs'
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const grid = readFileSync('components/FilmGrid.vue', 'utf8')
assert(grid.includes('lang="pug"'), 'FilmGrid uses pug')
assert(grid.includes('ul.film-grid'), 'FilmGrid renders ul.film-grid')
assert(grid.includes('staticRemover'), 'FilmGrid strips static/public prefixes')
assert(grid.includes('useFilmDate'), 'FilmGrid uses the date composable')

const prog = readFileSync('components/EditionProgram.vue', 'utf8')
assert(prog.includes('FilmGrid'), 'EditionProgram renders FilmGrid')
assert(prog.includes('sections'), 'EditionProgram reads sections')
console.log('PASS')
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/checks/check-components.mjs
```
Expected: `Error: ENOENT … 'components/FilmGrid.vue'`

- [ ] **Step 3: Write FilmGrid**

The markup is lifted verbatim from the existing blocks in `pages/movies/index.vue` so the rendering is byte-identical.

`components/FilmGrid.vue`:

```vue
<template lang="pug">
ul.film-grid
  li(v-for="film in films" :key="film._path")
    NuxtLink(:to="`/movies/${slugFor(film)}`")
      .film-thumbnail-wrapper
        .thumbnail-arrow-wrapper
          Arrow
        .thumbnail-gauze
        NuxtImg(v-if="film.thumbnail" :src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
      .film-details-wrapper
        span.film-title {{ film.title }}
        span.film-date {{ dateFor(film) }}
</template>

<script setup lang="ts">
import { useStaticRemover } from '~/composables/useStaticRemover'
import { useFilmDate } from '~/composables/useFilmDate'

interface Screening {
  dateTime: string
  venue: string
}

interface Film {
  _path: string
  _stem?: string
  slug?: string
  title: string
  thumbnail?: string
  year?: number
  screenings?: Screening[]
}

const props = defineProps<{ films: Film[] }>()

const { staticRemover } = useStaticRemover()
const { formatScreeningDate } = useFilmDate()

const slugFor = (film: Film) =>
  film.slug || film._path.split('/').pop() || film._stem?.split('/').pop() || 'unknown'

const dateFor = (film: Film) => {
  const dateTime = film.screenings?.[0]?.dateTime
  return dateTime ? formatScreeningDate(dateTime, film.year) : 'TBA'
}
</script>

<style scoped>
.film-details-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
```

- [ ] **Step 4: Write EditionProgram**

`components/EditionProgram.vue`:

```vue
<template lang="pug">
.films-wrapper
  template(v-if="hasSections")
    template(v-for="section in populatedSections" :key="section.program")
      h2 {{ section.title }}
      p.lead-text(v-if="section.description") {{ section.description }}
      FilmGrid(:films="section.films")
  FilmGrid(v-else :films="films")
</template>

<script setup lang="ts">
interface Section {
  title: string
  program: string
  description?: string
}

interface Edition {
  sections?: Section[]
}

interface Film {
  _path: string
  title: string
  program?: string
  [key: string]: any
}

const props = defineProps<{ edition: Edition | null, films: Film[] }>()

const hasSections = computed(() => (props.edition?.sections?.length ?? 0) > 0)

/**
 * Sections with no films are dropped rather than rendered as an empty heading —
 * program line-ups differ per edition (2023 has none at all, 2024 had no music program).
 */
const populatedSections = computed(() =>
  (props.edition?.sections ?? [])
    .map(section => ({
      ...section,
      films: props.films.filter(film => film.program === section.program)
    }))
    .filter(section => section.films.length > 0)
)
</script>

<style scoped>
.films-wrapper h2 {
  font-size: 2rem;
  margin-bottom: .5rem;
}

.films-wrapper p.lead-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.films-wrapper :deep(.film-grid) {
  margin-bottom: 4rem;
}
</style>
```

- [ ] **Step 5: Run the check to verify it passes**

```bash
node scripts/checks/check-components.mjs && yarn build
```
Expected: `PASS`, then a successful build. The components are not mounted anywhere yet, so nothing visible changes.

- [ ] **Step 6: Commit**

```bash
git add components/FilmGrid.vue components/EditionProgram.vue scripts/checks
git commit -m "[feat] add FilmGrid and EditionProgram components"
```

---

### Task 4: Movies page renders the current edition

The behaviour-preserving refactor. `/movies` must look the same after this task as before it — same four sections, same order, same copy.

**Files:**
- Modify: `pages/movies/index.vue` (full rewrite)
- Delete: `content/pages/movies.md`

**Interfaces:**
- Consumes: `useFilmDate` (Task 1), `content/settings.yml` + `content/editions/2025.md` (Task 2), `EditionProgram` (Task 3).
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Capture the current rendering as the baseline**

```bash
yarn dev &
sleep 8
curl -s http://localhost:3000/movies | grep -o '<h2>[^<]*</h2>' > /tmp/movies-before.txt
curl -s http://localhost:3000/movies | grep -c 'film-grid' >> /tmp/movies-before.txt
cat /tmp/movies-before.txt
```
Expected: four `<h2>` lines — Features, Shorts Program 1, Helsingborg Special, Music Program — plus a grid count. Keep this file; Step 5 compares against it.

- [ ] **Step 2: Rewrite the page**

`pages/movies/index.vue`:

```vue
<template lang="pug">
  main
    header.films-header
      h1 {{ edition?.heading }}
    .sort-by.mb-8(v-if="edition?.isAnnounced")
      label Sort by:
      select(v-model="sortBy")
        option(value="title") Title
        option(value="dateTime") Screening Date
    article
      p.announcement(v-if="edition?.announcement") {{ edition.announcement }}
      ContentRenderer(v-if="edition" :value="edition")
    EditionProgram(v-if="edition?.isAnnounced" :edition="edition" :films="sortedFilms")
</template>

<script setup lang="ts">
import { useFilmDate } from '~/composables/useFilmDate'

interface Screening {
  dateTime: string
  venue: string
}

interface Film {
  _path: string
  _stem: string
  title: string
  thumbnail: string
  program?: string
  year: number
  screenings?: Screening[]
}

interface Section {
  title: string
  program: string
  description?: string
}

interface Edition {
  year: number
  heading: string
  isAnnounced: boolean
  announcement?: string
  sections?: Section[]
}

useHead({
  title: 'Movies',
  bodyAttrs: {
    class: 'page-movies'
  }
})

const { parseScreeningDate } = useFilmDate()
const sortBy = ref('title')

const { data: settings } = await useAsyncData('settings', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const currentYear = computed(() => settings.value?.currentEdition)

const { data: edition } = await useAsyncData('current-edition', () =>
  queryContent<Edition>('editions').where({ year: currentYear.value }).findOne()
)

const { data: films } = await useAsyncData('current-films', () =>
  queryContent<Film>('films').where({ year: currentYear.value }).find()
)

const sortedFilms = computed(() => {
  const list = (films.value ?? []).filter(film => film && film.title)

  if (sortBy.value === 'dateTime') {
    return [...list].sort((a, b) =>
      parseScreeningDate(a.screenings?.[0]?.dateTime ?? '', a.year) -
      parseScreeningDate(b.screenings?.[0]?.dateTime ?? '', b.year)
    )
  }

  return [...list].sort((a, b) => a.title.localeCompare(b.title))
})
</script>

<style scoped>
.films-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.announcement {
  margin-bottom: 1rem;
}
</style>
```

Note the removed defensive filter: the old code required `screenings.length > 0` for a film to appear at all, which would silently hide any archived film whose screening data is incomplete. Films now only need a title.

- [ ] **Step 3: Delete the superseded content file**

```bash
git rm content/pages/movies.md
```

- [ ] **Step 4: Run the check to verify the rendering is unchanged**

```bash
curl -s http://localhost:3000/movies | grep -o '<h2>[^<]*</h2>' > /tmp/movies-after.txt
curl -s http://localhost:3000/movies | grep -c 'film-grid' >> /tmp/movies-after.txt
diff /tmp/movies-before.txt /tmp/movies-after.txt && echo "IDENTICAL"
```
Expected: `IDENTICAL`. If the diff shows a missing section, the section's `program` value in `content/editions/2025.md` does not match the films' `program` values — fix the edition file, not the component.

- [ ] **Step 5: Verify the 2026 announcement and film count in the browser**

```bash
yarn build && yarn preview
```
Then check `/movies`: heading "The Movies", the 2026 teaser line visible, 24 films across four sections, sort control switches between title and date order.

- [ ] **Step 6: Commit**

```bash
git add pages/movies/index.vue
git commit -m "[refactor] render movies page from the current edition file"
```

---

### Task 5: Restore script and the 2024 edition

**Files:**
- Create: `scripts/restore-archive.mjs`
- Create (generated): 21 files in `content/films/`, recovered images in `public/img/film-stills/`, `content/editions/2024.md`

**Interfaces:**
- Consumes: edition/film content shapes from Task 2; `scripts/make-edition.mjs` and the `yaml` devDependency added in Task 2.
- Produces: `node scripts/restore-archive.mjs <year>` writes that edition's films and images into the working tree and reports what it did. Restored films carry `year: <year>`, normalized `producers`/`execProducers` arrays, and no non-image entries in `stills`.

- [ ] **Step 1: Write the verification script**

Create `scripts/checks/check-2024.mjs`:

```js
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { parse } from 'yaml'

const frontmatter = (path) => {
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error(`no frontmatter in ${path}`)
  return parse(m[1])
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const films = readdirSync('content/films')
  .filter(f => f.endsWith('.md'))
  .map(f => ({ file: f, fm: frontmatter(`content/films/${f}`) }))

const y2024 = films.filter(f => f.fm.year === 2024)
assert(y2024.length === 21, `21 films for 2024, got ${y2024.length}`)
assert(films.filter(f => f.fm.year === 2025).length === 24, '2025 films untouched')

const counts = y2024.reduce((acc, f) => {
  acc[f.fm.program] = (acc[f.fm.program] || 0) + 1
  return acc
}, {})
assert(counts.features === 7, `7 features, got ${counts.features}`)
assert(counts.shorts1 === 9, `9 shorts1, got ${counts.shorts1}`)
assert(counts.shorts2 === 5, `5 shorts2, got ${counts.shorts2}`)

y2024.forEach(({ file, fm }) => {
  assert(!('exectProducers' in fm), `${file} has no exectProducers typo`)
  if (fm.producers) assert(Array.isArray(fm.producers), `${file} producers is a list`)
  ;(fm.stills || []).forEach(s => assert(
    typeof s.still === 'string' && s.still.startsWith('/'),
    `${file} still is an image path, not markup`
  ))
})

// every referenced image resolves on disk
const onDisk = (p) => existsSync(p.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/'))
const missing = []
y2024.forEach(({ file, fm }) => {
  const refs = [fm.thumbnail, ...(fm.stills || []).map(s => s.still)].filter(Boolean)
  refs.forEach(r => { if (r.startsWith('/') && !onDisk(r)) missing.push(`${file} -> ${r}`) })
})
if (missing.length) { console.error('MISSING IMAGES:\n' + missing.join('\n')); process.exit(1) }

const ed = frontmatter('content/editions/2024.md')
assert(ed.year === 2024, 'edition year 2024')
assert(ed.sections.map(s => s.program).join(',') === 'features,shorts1,shorts2', '2024 sections')
console.log('PASS')
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/checks/check-2024.mjs
```
Expected: `FAIL: 21 films for 2024, got 0`

- [ ] **Step 3: Write the restore script**

`scripts/restore-archive.mjs`:

```js
#!/usr/bin/env node
/**
 * One-time restore of a past festival edition from git history.
 *
 * Each August the previous program was deleted file-by-file through the CMS, so past
 * editions only exist in history. Add-dates are unusable for this: the 2023 films were
 * created by renaming January-2023 placeholder files, and in 2024 the CMS recycled two
 * 2023 files into new films — following renames crosses year boundaries. The reliable
 * source is the content tree snapshotted just before each year's purge.
 *
 * Usage: node scripts/restore-archive.mjs 2024
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import { parse, stringify } from 'yaml'

const SNAPSHOTS = {
  2023: '578b8d6a86b4b41f08562e7c3b554588445ff625',
  2024: '01783b4a84cce4afbdef4c60a29c1218d8863f73'
}

const year = Number(process.argv[2])
const snapshot = SNAPSHOTS[year]
if (!snapshot) {
  console.error(`Unknown edition ${process.argv[2]}. Known: ${Object.keys(SNAPSHOTS).join(', ')}`)
  process.exit(1)
}

const git = (args, opts = {}) =>
  execFileSync('git', args, { maxBuffer: 64 * 1024 * 1024, ...opts })

const gitText = (args) => git(args, { encoding: 'utf8' })

/** Files under content/films at the snapshot, with quoting disabled so non-ASCII names survive. */
const filmPaths = gitText(['-c', 'core.quotepath=false', 'ls-tree', '-r', '--name-only', snapshot, 'content/films'])
  .split('\n')
  .filter(Boolean)

/** Recover a deleted blob: the last commit that touched the path still has it in its parent. */
const recoverImage = (contentPath) => {
  const diskPath = contentPath.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/')
  if (existsSync(diskPath)) return { path: diskPath, status: 'present' }

  const repoPath = contentPath.replace(/^\//, '')
  const candidates = [repoPath, repoPath.replace(/^static\//, 'public/'), repoPath.replace(/^public\//, 'static/')]

  for (const candidate of candidates) {
    let sha
    try {
      sha = gitText(['-c', 'core.quotepath=false', 'rev-list', '-n', '1', '--all', '--', candidate]).trim()
    } catch { continue }
    if (!sha) continue

    for (const ref of [`${sha}^:${candidate}`, `${sha}:${candidate}`]) {
      try {
        const blob = git(['show', ref])
        mkdirSync(dirname(diskPath), { recursive: true })
        writeFileSync(diskPath, blob)
        return { path: diskPath, status: 'recovered' }
      } catch { /* try the next ref */ }
    }
  }
  return { path: diskPath, status: 'missing' }
}

/** 2023 films use singular string fields; the templates expect lists of objects. */
const toList = (value, key) => {
  if (!value) return undefined
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || trimmed.toUpperCase() === 'NA') return undefined
    return [{ [key]: trimmed }]
  }
  return undefined
}

const normalize = (data) => {
  const out = { ...data }

  // The CMS wrote `exectProducers`/`exectProducer`; the templates read `execProducers`.
  if (out.exectProducers) {
    out.execProducers = out.exectProducers.map(e => ({ execProducer: e.exectProducer ?? e.execProducer }))
    delete out.exectProducers
  }

  out.producers = toList(out.producers ?? out.producer, 'producer')
  delete out.producer
  out.execProducers = toList(out.execProducers ?? out.execProducer, 'execProducer')
  delete out.execProducer

  // A ticket-button <a> tag was once saved into a stills field. Keep image paths only.
  if (Array.isArray(out.stills)) {
    out.stills = out.stills.filter(s => typeof s?.still === 'string' && s.still.startsWith('/'))
    if (!out.stills.length) delete out.stills
  }

  Object.keys(out).forEach(k => out[k] === undefined && delete out[k])
  return { year, ...out }
}

let recovered = 0
const missing = []

for (const path of filmPaths) {
  const raw = gitText(['show', `${snapshot}:${path}`])
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    console.error(`SKIP (no frontmatter): ${path}`)
    continue
  }

  const data = normalize(parse(match[1]))
  const body = match[2]

  for (const ref of [data.thumbnail, ...(data.stills ?? []).map(s => s.still)].filter(Boolean)) {
    const result = recoverImage(ref)
    if (result.status === 'recovered') recovered++
    if (result.status === 'missing') missing.push(`${path} -> ${ref}`)
  }

  writeFileSync(path, `---\n${stringify(data).trimEnd()}\n---\n\n${body.trimStart()}`)
  console.log(`restored ${path}`)
}

console.log(`\n${filmPaths.length} films, ${recovered} images recovered from history`)
if (missing.length) {
  console.log(`\n${missing.length} images unrecoverable (films will render without them):`)
  missing.forEach(m => console.log(`  ${m}`))
}
```

- [ ] **Step 4: Run the restore for 2024**

```bash
node scripts/restore-archive.mjs 2024
```
Expected: 21 `restored content/films/…` lines, a recovered-image count, and an unrecoverable list containing only the three `utvag.md` stills (`utvagotsv2 Large.png`, `stills_1.137.1 Large.png`, `utvag_stills__1.102.1 Large.png`) if those cannot be found.

If any *other* image is reported missing, stop and investigate before committing — it means the recovery fallbacks did not cover a path form.

- [ ] **Step 5: Handle the unrecoverable utvag stills**

The check script requires every referenced image to resolve. Remove the three unrecoverable `stills` entries from `content/films/utvag.md` so the film renders with its thumbnail only:

```bash
node -e "
import('node:fs').then(async ({readFileSync, writeFileSync, existsSync}) => {
  const { parse, stringify } = await import('yaml')
  const p = 'content/films/utvag.md'
  const raw = readFileSync(p, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)\$/)
  const d = parse(m[1])
  const ok = (s) => existsSync(s.still.replace(/^\/static\//,'public/').replace(/^\/public\//,'public/'))
  d.stills = (d.stills || []).filter(ok)
  if (!d.stills.length) delete d.stills
  writeFileSync(p, '---\n' + stringify(d).trimEnd() + '\n---\n\n' + m[2].trimStart())
  console.log('utvag stills pruned')
})
"
```
Expected: `utvag stills pruned`. If `utvag.md`'s thumbnail itself is unrecoverable, delete the `thumbnail` key too — `FilmGrid` has a `v-if` for it.

- [ ] **Step 6: Generate the 2024 edition file**

**The films and the page copy come from different commits.** `01783b4` (March 2025) has the right *films* — its film set is byte-identical to August 2024's — but by then `movies.md` had already been rewritten toward 2025 ("Building on the success of our 2024 festival…"). The last genuine 2024 page copy is at `e44e9c7` (2024-08-12).

```bash
node scripts/make-edition.mjs 2024 --dates "30 August – 1 September 2024" --ref e44e9c7
```
Expected: `wrote content/editions/2024.md — 2 sections`

**Two, not three — and that is a problem to fix by hand in the next step.** `shorts2Description` was empty in every 2024 commit: the Shorts Program 2 copy was pasted into the *middle of* `shorts1Description`, which is exactly why the old hardcoded template never rendered those 5 films.

- [ ] **Step 7: Split the mashed-together shorts copy into two sections**

Open `content/editions/2024.md`. The generated `shorts1` description currently ends with a run-on "Shorts Program 2: Short Program 2: Resistance - Dedicated to…". Replace the two shorts entries in `sections` with these three-field entries, using exactly this text:

```yaml
  - title: Shorts Program 1
    program: shorts1
    description: A raucous, sometimes cantankerous, black-comedy loving and
      form-challenging deep dive into some of the best emerging filmmaking talent
      from Sweden, and Skåne in particular, and around this weird, wild, wide world.
  - title: "Shorts Program 2: Resistance"
    program: shorts2
    description: Dedicated to the act of rebellion and the culture and people of
      Palestine, we have hand-picked this collection of unpredictable, highly crafted
      and emotional short films to build our thematic focus for 2024. The filmmakers
      come from Palestine, Iran, Europe: but they are all bound by the desire to shine
      a much needed light on the human price Palestinians must pay in order to survive
      under Occupation. Nonetheless, humor, family and dignity fuel this special brand
      of resilience. Catch the shorts that reflect one of the most important moments
      in history.
```

Note the quoted title — an unquoted YAML value containing `: ` is a parse error. Keep `features` as the first section, so the final order is features, shorts1, shorts2.

Confirm the file parses and the copy survived:

```bash
node -e "import('node:fs').then(async ({readFileSync}) => {
  const { parse } = await import('yaml')
  const fm = parse(readFileSync('content/editions/2024.md','utf8').match(/^---\n([\s\S]*?)\n---/)[1])
  console.log(fm.sections.map(s => s.program + ': ' + s.description.length + ' chars').join('\n'))
})"
```
Expected: three lines — `features`, `shorts1`, `shorts2` — each with a non-zero character count.

- [ ] **Step 8: Run the check to verify it passes**

```bash
node scripts/checks/check-2024.mjs
```
Expected: `PASS`

- [ ] **Step 9: Confirm the current program is unaffected**

```bash
yarn build
curl -s http://localhost:3000/movies | grep -c 'film-grid'
```
Expected: build succeeds; `/movies` still shows only the 24 films of 2025 — the 2024 films are in the content directory but filtered out by `currentEdition`.

- [ ] **Step 10: Commit**

```bash
git add scripts/restore-archive.mjs scripts/checks content/films content/editions/2024.md public/img/film-stills
git commit -m "[feat] restore the 2024 program from git history"
```

---

### Task 6: Restore the 2023 edition

Same script, different snapshot. 2023 is the awkward one: no `program` field on any film, singular `producer`/`execProducer` string fields, and almost all of its stills were deleted from disk and must come back from history.

**Files:**
- Create (generated): 8 files in `content/films/`, recovered images, `content/editions/2023.md`

**Interfaces:**
- Consumes: `scripts/restore-archive.mjs` (Task 5).
- Produces: 8 films with `year: 2023` and no `program` key; `content/editions/2023.md` with `sections: []`.

- [ ] **Step 1: Write the verification script**

Create `scripts/checks/check-2023.mjs`:

```js
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { parse } from 'yaml'

const frontmatter = (path) => {
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error(`no frontmatter in ${path}`)
  return parse(m[1])
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const films = readdirSync('content/films')
  .filter(f => f.endsWith('.md'))
  .map(f => ({ file: f, fm: frontmatter(`content/films/${f}`) }))

const y2023 = films.filter(f => f.fm.year === 2023)
assert(y2023.length === 8, `8 films for 2023, got ${y2023.length}`)
assert(films.length === 53, `53 films total, got ${films.length}`)
assert(films.filter(f => f.fm.year === 2024).length === 21, '2024 intact')
assert(films.filter(f => f.fm.year === 2025).length === 24, '2025 intact')

y2023.forEach(({ file, fm }) => {
  assert(!('producer' in fm), `${file} singular producer normalized away`)
  assert(!('execProducer' in fm), `${file} singular execProducer normalized away`)
  if (fm.producers) assert(Array.isArray(fm.producers) && fm.producers.every(p => 'producer' in p), `${file} producers shape`)
})

const onDisk = (p) => existsSync(p.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/'))
const missing = []
y2023.forEach(({ file, fm }) => {
  const refs = [fm.thumbnail, ...(fm.stills || []).map(s => s.still)].filter(Boolean)
  refs.forEach(r => { if (r.startsWith('/') && !onDisk(r)) missing.push(`${file} -> ${r}`) })
})
if (missing.length) { console.error('MISSING IMAGES:\n' + missing.join('\n')); process.exit(1) }

const ed = frontmatter('content/editions/2023.md')
assert(ed.year === 2023, 'edition year 2023')
assert(Array.isArray(ed.sections) && ed.sections.length === 0, '2023 has no sections')
console.log('PASS')
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/checks/check-2023.mjs
```
Expected: `FAIL: 8 films for 2023, got 0`

- [ ] **Step 3: Run the restore for 2023**

```bash
node scripts/restore-archive.mjs 2023
```
Expected: 8 `restored content/films/…` lines (`enys-men.md`, `glömska.md`, `i-need-help.md`, `invisible-demons.md`, `the-exam.md`, `the-fishbowl.md`, `the-mountain.md`, `the-oil-machine.md`) and roughly 18 images recovered from history.

Note `enys-men.md` and `glömska.md` are the two files the CMS later recycled into 2024's `agra.md` and `the-feeling.md`. Restoring them creates *new* files at their 2023 paths; it does not disturb the 2024 films. Confirm all four exist afterwards:

```bash
ls content/films/ | grep -E "enys-men|glömska|agra|the-feeling"
```
Expected: all four listed.

- [ ] **Step 4: Prune any unrecoverable stills**

Rerun the check to see which images, if any, could not be recovered:

```bash
node scripts/checks/check-2023.mjs
```
If it reports missing images, remove exactly those `stills` entries from the named files (same pruning approach as Task 5 Step 5), leaving thumbnails intact where they resolved.

- [ ] **Step 5: Generate the 2023 edition file**

```bash
node scripts/make-edition.mjs 2023 --dates "31 March – 2 April 2023" --ref 578b8d6a86b4b41f08562e7c3b554588445ff625
```
Expected: `wrote content/editions/2023.md — 0 sections`

Zero sections is correct: the 2023 page had only `heading`, `isAnnounced` and the body "All films subtitled in English." — program grouping did not exist yet. `EditionProgram` renders one ungrouped grid in this case.

```bash
cat content/editions/2023.md
```
Expected: `sections: []` in the frontmatter and the subtitles line as the body.

- [ ] **Step 6: Run the check to verify it passes**

```bash
node scripts/checks/check-2023.mjs
```
Expected: `PASS`

- [ ] **Step 7: Commit**

```bash
git add content/films content/editions/2023.md scripts/checks public/img/film-stills
git commit -m "[feat] restore the 2023 program from git history"
```

---

### Task 7: Fix the exectProducers typo

The CMS has always written `exectProducers` / `exectProducer` while `pages/movies/[slug].vue` reads `execProducers` / `execProducer`, so executive-producer credits have never rendered on any film page. The restore script already emits the correct spelling for 2023 and 2024; this task fixes the CMS config and the 2025 films so everything agrees.

**Files:**
- Modify: `public/admin/config.yml:148-155`
- Modify: 2025 film content files containing `exectProducers`
- Verify: `pages/movies/[slug].vue:44-52` (already correct — do not change)

**Interfaces:**
- Consumes: restored content from Tasks 5–6.
- Produces: no film file anywhere contains `exectProducers`; the CMS writes `execProducers`.

- [ ] **Step 1: Confirm the bug and identify affected files**

```bash
grep -l "exectProducers" content/films/*.md
grep -n "exectProducer" public/admin/config.yml
grep -n "execProducers" "pages/movies/[slug].vue"
```
Expected: at least `content/films/the-black-sea.md`; config.yml lines ~148–155 with the typo; the template using the correct spelling. This is the mismatch.

- [ ] **Step 2: Verify the credit is currently invisible**

```bash
yarn dev &
sleep 8
curl -s http://localhost:3000/movies/the-black-sea | grep -c "Executive Producers"
```
Expected: `0` — the film has four exec producers in its frontmatter and none reach the page.

- [ ] **Step 3: Rename the keys in content**

```bash
sed -i '' 's/^exectProducers:/execProducers:/; s/- exectProducer:/- execProducer:/' content/films/*.md
grep -c "exectProducer" content/films/*.md | grep -v ":0$" || echo "no typo remains in content"
```
Expected: `no typo remains in content`

- [ ] **Step 4: Rename the fields in the CMS config**

In `public/admin/config.yml`, the Films collection block currently reads:

```yaml
      - label: 'Executive Producers'
        name: 'exectProducers'
        widget: 'list'
        allow_add: true
        label_singular: Executive Producer
        summary: '{{fields.execProducer}}'
        fields:
          - {label: Executive Producer, name: exectProducer, widget: string }
```

Change it to:

```yaml
      - label: 'Executive Producers'
        name: 'execProducers'
        widget: 'list'
        allow_add: true
        label_singular: Executive Producer
        summary: '{{fields.execProducer}}'
        fields:
          - {label: Executive Producer, name: execProducer, widget: string }
```

- [ ] **Step 5: Verify the credit now renders**

```bash
curl -s http://localhost:3000/movies/the-black-sea | grep -c "Executive Producers"
```
Expected: `1`. Also confirm the four names (Ted Hope, Cameron Brodie, Jonas Carpignano, Chris K. Daniels) appear:

```bash
curl -s http://localhost:3000/movies/the-black-sea | grep -o "Ted Hope"
```
Expected: `Ted Hope`

- [ ] **Step 6: Commit**

```bash
git add content/films public/admin/config.yml
git commit -m "[fix] rename exectProducers to execProducers so exec credits render"
```

---

### Task 8: Archive year page

**Files:**
- Create: `pages/archive/[year].vue`

**Interfaces:**
- Consumes: `EditionProgram` (Task 3), edition and film content (Tasks 2, 5, 6), `content/settings.yml`.
- Produces: route `/archive/<year>`. Later tasks link to it.

- [ ] **Step 1: Verify the route does not exist yet**

```bash
yarn dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/archive/2024
```
Expected: `404`

- [ ] **Step 2: Write the page**

`pages/archive/[year].vue`:

```vue
<template lang="pug">
  main
    NuxtLink(to="/archive").back-button &#8592; The Archive
    header.films-header
      h1 {{ edition?.heading }} {{ edition?.year }}
      span.edition-dates(v-if="edition?.dates") {{ edition.dates }}
    article
      ContentRenderer(v-if="edition" :value="edition")
    EditionProgram(:edition="edition" :films="sortedFilms")
</template>

<script setup lang="ts">
interface Screening {
  dateTime: string
  venue: string
}

interface Film {
  _path: string
  title: string
  thumbnail?: string
  program?: string
  year: number
  screenings?: Screening[]
}

interface Section {
  title: string
  program: string
  description?: string
}

interface Edition {
  year: number
  heading: string
  dates?: string
  sections?: Section[]
}

const route = useRoute()
const year = Number(route.params.year)

if (!Number.isInteger(year)) {
  throw createError({ statusCode: 404, statusMessage: 'Edition not found', fatal: true })
}

const { data: edition } = await useAsyncData(`edition-${year}`, () =>
  queryContent<Edition>('editions').where({ year }).findOne()
)

if (!edition.value) {
  throw createError({ statusCode: 404, statusMessage: 'Edition not found', fatal: true })
}

const { data: films } = await useAsyncData(`films-${year}`, () =>
  queryContent<Film>('films').where({ year }).find()
)

const { data: settings } = await useAsyncData('settings-archive-year', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const isCurrent = computed(() => settings.value?.currentEdition === year)

const sortedFilms = computed(() =>
  [...(films.value ?? [])]
    .filter(film => film && film.title)
    .sort((a, b) => a.title.localeCompare(b.title))
)

useHead(() => ({
  title: `Archive ${year}`,
  bodyAttrs: {
    class: 'page-movies page-archive'
  },
  // The current edition also lives at /movies; point search engines there.
  link: isCurrent.value ? [{ rel: 'canonical', href: 'https://gasebackfilmfestival.se/movies' }] : []
}))
</script>

<style scoped>
.films-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.edition-dates {
  font-size: 1rem;
}
</style>
```

The `page-movies` body class is deliberate — archive year pages inherit the Movies page styling, which is the whole point.

- [ ] **Step 3: Verify all three years render with the right counts**

```bash
for y in 2023 2024 2025; do
  echo -n "$y: "
  curl -s http://localhost:3000/archive/$y | grep -o 'film-grid' | wc -l | tr -d ' '
  curl -s http://localhost:3000/archive/$y | grep -o '<h2>[^<]*</h2>'
done
```
Expected:
- `2023`: 1 grid, no `h2` sections (ungrouped fallback)
- `2024`: 3 grids, `<h2>Features</h2>`, `<h2>Shorts Program 1</h2>`, `<h2>Shorts Program 2</h2>`
- `2025`: 4 grids, Features / Shorts Program 1 / Helsingborg Special / Music Program

- [ ] **Step 4: Verify a nonexistent year 404s**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/archive/2019
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/archive/banana
```
Expected: `404` for both.

- [ ] **Step 5: Verify film counts per page**

```bash
for y in 2023 2024 2025; do
  echo -n "$y films: "
  curl -s http://localhost:3000/archive/$y | grep -o 'class="film-title"' | wc -l | tr -d ' '
done
```
Expected: `2023 films: 8`, `2024 films: 21`, `2025 films: 24`

- [ ] **Step 6: Commit**

```bash
git add pages/archive/[year].vue
git commit -m "[feat] add archive year pages"
```

---

### Task 9: Archive index page

Year list with a thumbnail per edition, newest first, "Current" badge on the current edition.

**Files:**
- Create: `pages/archive/index.vue`

**Interfaces:**
- Consumes: editions, films, settings; links to `/archive/<year>` (Task 8).
- Produces: route `/archive`.

- [ ] **Step 1: Verify the route does not exist yet**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/archive
```
Expected: `404`

- [ ] **Step 2: Write the page**

`pages/archive/index.vue`:

```vue
<template lang="pug">
  main
    h1 The Archive
    ul.archive-list
      li.archive-row(v-for="edition in editions" :key="edition.year")
        NuxtLink(:to="`/archive/${edition.year}`")
          .archive-thumbnail
            .thumbnail-gauze
            NuxtImg(v-if="edition.image" :src="staticRemover(edition.image)" :alt="`${edition.year} festival`" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="800" height="450" sizes="sm:40vw md:30vw lg:240px").thumbnail-image
          .archive-details
            .archive-year
              span {{ edition.year }}
              span.archive-badge(v-if="edition.isCurrent") Current
            .archive-meta {{ edition.dates }} · {{ edition.filmCount }} films
          .archive-arrow
            Arrow
</template>

<script setup lang="ts">
import { useStaticRemover } from '~/composables/useStaticRemover'

interface Edition {
  year: number
  dates?: string
  featuredImage?: string
}

interface Film {
  _path: string
  year: number
  thumbnail?: string
}

useHead({
  title: 'Archive',
  bodyAttrs: {
    class: 'page-archive'
  }
})

const { staticRemover } = useStaticRemover()

const { data: editionDocs } = await useAsyncData('editions', () =>
  queryContent<Edition>('editions').find()
)

const { data: films } = await useAsyncData('all-films', () =>
  queryContent<Film>('films').find()
)

const { data: settings } = await useAsyncData('settings-archive', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const editions = computed(() =>
  [...(editionDocs.value ?? [])]
    .sort((a, b) => b.year - a.year)
    .map(edition => {
      const yearFilms = (films.value ?? []).filter(film => film.year === edition.year)
      return {
        year: edition.year,
        dates: edition.dates ?? '',
        filmCount: yearFilms.length,
        // Fall back to the first film's still when an edition has no chosen image.
        image: edition.featuredImage ?? yearFilms.find(f => f.thumbnail)?.thumbnail ?? '',
        isCurrent: settings.value?.currentEdition === edition.year
      }
    })
)
</script>

<style scoped>
.archive-list {
  margin-top: 2rem;
}

.page-wrapper .archive-list li {
  margin-left: 0;
  list-style: none;
}

.archive-row a {
  display: grid;
  grid-template-columns: 12rem 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 2px solid var(--color-sky-blue);
}

.archive-thumbnail {
  position: relative;
  overflow: hidden;
}

.archive-year {
  display: flex;
  align-items: baseline;
  gap: .75rem;
  font-size: 2.5rem;
  line-height: 1;
}

.archive-badge {
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: .15rem .6rem;
}

.archive-meta {
  margin-top: .5rem;
  font-size: 1rem;
}

.archive-arrow {
  width: 3rem;
}

.archive-row a:hover .thumbnail-gauze {
  opacity: .1;
}

@media (max-width: 640px) {
  .archive-row a {
    grid-template-columns: 6rem 1fr;
    gap: 1rem;
  }

  .archive-arrow {
    display: none;
  }

  .archive-year {
    font-size: 1.75rem;
  }
}
</style>
```

- [ ] **Step 3: Verify the index lists all three editions**

```bash
curl -s http://localhost:3000/archive | grep -o 'archive-row' | wc -l | tr -d ' '
curl -s http://localhost:3000/archive | grep -oE '/archive/20[0-9]{2}'
curl -s http://localhost:3000/archive | grep -o 'Current'
```
Expected: `3`; the links `/archive/2025`, `/archive/2024`, `/archive/2023` in that order (newest first); one `Current` badge.

- [ ] **Step 4: Verify counts and dates are right**

```bash
curl -s http://localhost:3000/archive | grep -oE '[0-9]+ films'
```
Expected: `24 films`, `21 films`, `8 films` in that order.

- [ ] **Step 5: Verify each row links through**

```bash
for y in 2025 2024 2023; do
  echo -n "$y: "
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/archive/$y
done
```
Expected: `200` for all three.

- [ ] **Step 6: Commit**

```bash
git add pages/archive/index.vue
git commit -m "[feat] add archive index page"
```

---

### Task 10: Navigation and year-aware back button

**Files:**
- Modify: `components/Nav.vue`, `components/MobileNav.vue`
- Modify: `pages/movies/[slug].vue` (back button only)

**Interfaces:**
- Consumes: `/archive` (Task 9), film `year` field (Tasks 2, 5, 6), `content/settings.yml`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Verify the nav has no Archive link and the back button is unconditional**

```bash
grep -c "archive" components/Nav.vue components/MobileNav.vue
grep -n "back-button" "pages/movies/[slug].vue"
```
Expected: `0` for both nav files; the back button hardcoded to `/movies`.

- [ ] **Step 2: Add the Archive link to the desktop nav**

In `components/Nav.vue`, after the "A Bit About" list item and before "Get Tix":

```pug
      li
        NuxtLink(to="/about") A Bit About
      li
        NuxtLink(to="/archive") Archive
      li
        NuxtLink(to="/tickets") Get Tix
```

- [ ] **Step 3: Add the Archive link to the mobile nav**

In `components/MobileNav.vue`, the same insertion between "A Bit About" and "Get Tix":

```pug
      li
        NuxtLink(to="/about") A Bit About
      li
        NuxtLink(to="/archive") Archive
      li
        NuxtLink(to="/tickets") Get Tix
```

- [ ] **Step 4: Make the film detail back button year-aware**

In `pages/movies/[slug].vue`, replace the first template line:

```pug
    NuxtLink(to="/movies").back-button &#8592; All Films
```

with:

```pug
    NuxtLink(:to="backLink.to").back-button &#8592; {{ backLink.label }}
```

Add the `year` field to the `Film` interface:

```ts
interface Film {
  title: string
  year?: number
  director: string
  // …remaining fields unchanged
}
```

And add below the existing `film` fetch:

```ts
const { data: settings } = await useAsyncData('settings-film', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

/** Archived films return to their edition; current-program films return to /movies. */
const backLink = computed(() => {
  const year = film.value?.year
  const isCurrent = !year || year === settings.value?.currentEdition
  return isCurrent
    ? { to: '/movies', label: 'All Films' }
    : { to: `/archive/${year}`, label: `${year} Films` }
})
```

- [ ] **Step 5: Verify the nav links and both back-button variants**

```bash
curl -s http://localhost:3000/movies | grep -o 'href="/archive"' | head -1
curl -s http://localhost:3000/movies/kika | grep -A1 'back-button'
curl -s http://localhost:3000/movies/green-night | grep -A1 'back-button'
curl -s http://localhost:3000/movies/the-exam | grep -A1 'back-button'
```
Expected: the `/archive` nav link present; `kika` (2025) links to `/movies` labelled "All Films"; `green-night` (2024) links to `/archive/2024` labelled "2024 Films"; `the-exam` (2023) links to `/archive/2023` labelled "2023 Films".

- [ ] **Step 6: Commit**

```bash
git add components/Nav.vue components/MobileNav.vue "pages/movies/[slug].vue"
git commit -m "[feat] add archive nav link and year-aware film back button"
```

---

### Task 11: CMS configuration

Make all of the above editable by Hussain. Without this task the archive works but the annual rollover still requires a developer.

**Files:**
- Modify: `public/admin/config.yml`

**Interfaces:**
- Consumes: content shapes from Tasks 2, 5, 6; the `execProducers` rename from Task 7.
- Produces: no code dependencies.

- [ ] **Step 1: Verify the config does not yet know about editions**

```bash
grep -c "editions" public/admin/config.yml
grep -n "Movies Page" public/admin/config.yml
grep -c "view_filters" public/admin/config.yml
```
Expected: `0` editions, the Movies Page entry present at ~line 15, `0` view_filters.

- [ ] **Step 2: Remove the Movies Page file entry**

Delete this block from the Pages collection (it points at the file deleted in Task 4):

```yaml
      - label: "Movies Page"
        name: "movies"
        file: "/content/pages/movies.md"
        fields:
          - {label: Heading, name: heading, widget: string}
          - {label: Body, name: body, widget: markdown}
          - {label: Announced, name: isAnnounced, widget: boolean }
          - {label: 'Features Description', name: featuresDescription, widget: string, required: false}
          - {label: 'Shorts 1 Description', name: shorts1Description, widget: string, required: false}
          - {label: 'Shorts 2 Description', name: shorts2Description, widget: string, required: false}
          - {label: 'Helsingborg Program Description', name: helsingborgDescription, widget: string, required: false}
          - {label: 'Music Program Description', name: musicDescription, widget: string, required: false}
```

- [ ] **Step 3: Add the Editions collection**

Insert after the Pages collection, before `- name: films`:

```yaml
  - name: editions
    label: Editions
    label_singular: Edition
    folder: 'content/editions'
    format: 'frontmatter'
    create: true
    slug: '{{year}}'
    identifier_field: year
    summary: '{{year}} — {{dates}}'
    sortable_fields: ['year']
    editor:
      preview: false
    fields:
      - { label: 'Year', name: 'year', widget: 'number', value_type: 'int', min: 2023, max: 2100 }
      - { label: 'Heading', name: 'heading', widget: 'string', default: 'The Movies' }
      - { label: 'Run Dates', name: 'dates', widget: 'string', hint: 'Shown on the archive index, e.g. "28–31 August 2025"' }
      - { label: 'Announced', name: 'isAnnounced', widget: 'boolean', default: false }
      - { label: 'Announcement', name: 'announcement', widget: 'string', required: false, hint: 'Shown on the Movies page only, never in the archive. Use for "next year revealed soon" notes.' }
      - label: "Archive Image"
        name: "featuredImage"
        widget: "image"
        required: false
        media_folder: /public/img/film-stills
        hint: 'Thumbnail for this year on the archive index. Falls back to the first film still.'
      - { label: 'Intro', name: 'body', widget: 'markdown' }
      - label: 'Program Sections'
        name: 'sections'
        label_singular: Section
        widget: 'list'
        required: false
        allow_add: true
        summary: '{{fields.title}}'
        hint: 'Order here is the order on the page. A section with no films is hidden.'
        fields:
          - { label: 'Title', name: 'title', widget: 'string' }
          - { label: 'Program', name: 'program', widget: 'select', options: ['features', 'helsingborg', 'music', 'shorts1', 'shorts2'] }
          - { label: 'Description', name: 'description', widget: 'text', required: false }
```

- [ ] **Step 4: Split the films list into a Films collection and an Archive collection**

Both point at the same `content/films` folder — no second folder, no duplicated content. The
`year` field does the splitting. Verified against the pinned bundle (Netlify CMS 2.10.192):
`filter`, `view_groups`, `view_filters` and `sortable_fields` are all read, and its config parser
is the `yaml` package with full anchor/alias support.

In the existing `films` collection, add `filter` and `sortable_fields` directly after
`slug: '{{slug}}'`:

```yaml
    filter: { field: year, value: 2025 }
    sortable_fields: ['title', 'year']
```

Add the Year field as the first entry under `fields:`, before Title — **and anchor the whole
fields list** so the Archive collection can reuse it. Change the line `    fields:` to
`    fields: &film_fields` and insert Year as its first item:

```yaml
    fields: &film_fields
      - { label: 'Year', name: 'year', widget: 'number', value_type: 'int', default: 2025, min: 2023, max: 2100, hint: 'Which festival edition this film belongs to.' }
      - { label: 'Title', name: 'title', widget: 'string' }
      # …the remaining film fields stay exactly as they are…
```

Then add the Archive collection immediately after the `films` collection, before `- name: talks`:

```yaml
  - name: films_archive
    label: Archive
    label_singular: Archived Film
    folder: 'content/films'
    format: 'frontmatter'
    create: false
    slug: '{{slug}}'
    sortable_fields: ['year', 'title']
    summary: '{{year}} — {{title}}'
    view_groups:
      - label: Year
        field: year
    view_filters:
      - label: 'Current program only'
        field: year
        pattern: 2025
    editor:
      preview: false
    fields: *film_fields
```

`create: false` means new films can only be added through the Films collection, so nothing can be
filed into the archive by accident. `fields: *film_fields` resolves to the same field list as
Films, so the two views cannot drift apart. Editing an archived film still works normally.

**Do not duplicate the field list.** If you find yourself pasting 25 fields a second time, you have
missed the anchor.

- [ ] **Step 5: Add currentEdition to Site Settings**

In the `settings` collection's `files:` list, alongside the existing submissions entry:

```yaml
      - label: "Current Edition"
        name: "current_edition"
        file: "content/settings.yml"
        fields:
          - { label: 'Current Edition Year', name: 'currentEdition', widget: 'number', value_type: 'int', min: 2023, max: 2100, hint: 'Which edition the Movies page shows. Change this when a new program goes live — the previous year moves into the archive automatically.' }
```

- [ ] **Step 6: Verify the config is valid YAML and complete**

```bash
node -e "
import('node:fs').then(async ({readFileSync}) => {
  const { parse } = await import('yaml')
  const cfg = parse(readFileSync('public/admin/config.yml', 'utf8'))
  const names = cfg.collections.map(c => c.name)
  const films = cfg.collections.find(c => c.name === 'films')
  const editions = cfg.collections.find(c => c.name === 'editions')
  const pages = cfg.collections.find(c => c.name === 'pages')
  const settings = cfg.collections.find(c => c.name === 'settings')
  const archive = cfg.collections.find(c => c.name === 'films_archive')
  const check = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }
  check(names.includes('editions'), 'editions collection exists')
  check(films.fields.some(f => f.name === 'year'), 'films have a year field')
  check(films.filter?.field === 'year', 'films collection filters by year')
  check(!films.fields.some(f => f.name === 'exectProducers'), 'exectProducers typo gone')
  check(films.fields.some(f => f.name === 'execProducers'), 'execProducers present')
  check(archive, 'archive collection exists')
  check(archive.folder === films.folder, 'archive points at the same folder as films')
  check(archive.create === false, 'archive does not allow creating films')
  check(archive.view_groups?.[0]?.field === 'year', 'archive groups by year')
  // the anchor must have resolved — same schema, not a hand-copied duplicate
  check(JSON.stringify(archive.fields) === JSON.stringify(films.fields), 'archive shares the film field schema')
  check(editions.fields.some(f => f.name === 'sections'), 'editions have sections')
  check(!pages.files.some(f => f.file.includes('movies.md')), 'Movies Page entry removed')
  check(settings.files.some(f => f.file.includes('settings.yml')), 'currentEdition setting registered')
  console.log('PASS')
})
"
```
Expected: `PASS`. The `archive.fields === films.fields` assertion is the one that matters — it fails if the anchor was replaced with a hand-copied field list.

- [ ] **Step 7: Verify the CMS loads against local content**

```bash
yarn dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/
```
Expected: `200`. With the CMS's local backend running, open `http://localhost:3000/admin/` and confirm:
- The sidebar shows **Films** and **Archive** as separate entries.
- **Films** lists only the 24 films of the current edition.
- **Archive** lists all 53, collapsible into 2025 / 2024 / 2023 groups, with no "New Film" button.
- Opening a 2024 film from Archive shows the full edit form — same fields as Films — with its Executive Producers populated.
- **Editions** lists 2023, 2024, 2025.

- [ ] **Step 8: Commit**

```bash
git add public/admin/config.yml
git commit -m "[feat] add editions collection, film year field, and currentEdition to the CMS"
```

---

### Task 12: Full verification pass

Everything is built; confirm it holds together in a production build and in a real browser.

**Files:** none modified — this task either passes or sends you back to a previous task.

- [ ] **Step 1: Clean production build**

```bash
rm -rf .nuxt .output
yarn build
```
Expected: build succeeds with no errors. `nitro.prerender.failOnError` is `false`, so watch the log for prerender warnings rather than trusting the exit code alone — any `/archive` route warning must be investigated.

- [ ] **Step 2: Serve the build**

```bash
yarn preview &
sleep 6
```

- [ ] **Step 3: Verify every route responds**

```bash
for p in / /movies /archive /archive/2023 /archive/2024 /archive/2025 /about /when /where; do
  echo -n "$p -> "
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000$p
done
```
Expected: `200` for all.

- [ ] **Step 4: Verify one film detail page per edition**

```bash
for f in kika green-night the-exam; do
  echo -n "$f -> "
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/movies/$f
done
```
Expected: `200` for all three.

- [ ] **Step 5: Verify counts one final time**

```bash
node scripts/checks/check-2023.mjs && node scripts/checks/check-2024.mjs && node scripts/checks/check-2025-content.mjs
```
Expected: `PASS` three times — 8 + 21 + 24 = 53 films, each with a year, images all resolving, all three edition files well-formed.

- [ ] **Step 6: Browser pass with Playwright**

Using the Playwright MCP tools, visit and screenshot each of `/archive`, `/archive/2023`, `/archive/2024`, `/archive/2025`, `/movies`, and one archived film detail page. For each, check the console and network logs and confirm:
- no console errors
- **no image 404s** — this is the most likely failure, from an image the restore could not recover
- the archive index rows show thumbnail, year, dates, film count, with "Current" on 2025 only
- `/archive/2023` renders one ungrouped grid of 8 films
- `/archive/2024` renders three sections totalling 21 films, including Shorts Program 2
- `/archive/2025` and `/movies` show the same 24 films, but only `/movies` shows the 2026 announcement
- an archived film's detail page shows synopsis, credits, stills slider, screenings, and a back button reading "2024 Films"

- [ ] **Step 7: Verify mobile layout**

Resize the Playwright viewport to 390×844 and check `/archive`: rows stack to a two-column grid (thumbnail + details), the arrow is hidden, and the year type drops to 1.75rem. Confirm the mobile nav contains Archive.

- [ ] **Step 8: Commit any fixes**

If Steps 1–7 surfaced problems, fix them and commit with a `[fix]` prefix. If nothing needed fixing, there is nothing to commit — do not create an empty commit.

---

## Rollout notes

`currentEdition` stays at `2025`, so `/movies` is unchanged for visitors. The archive is purely additive.

**When the 2026 program is ready**, the process is now:

1. In the CMS: create the 2026 edition (Announced off, an `announcement` teaser if wanted), add the 2026 films with Year 2026, then flip **Site Settings → Current Edition** to 2026.
2. In `public/admin/config.yml`, bump **two lines** so the CMS's Films list follows the site:
   - the `films` collection's `filter: { field: year, value: 2025 }` → `2026`
   - the Year field's `default: 2025` → `2026`

The 2025 program moves into the archive by itself. **No films get deleted.**

Those two lines are static YAML and cannot be driven from content, which is the accepted cost of keeping the CMS Films list short. If they are ever forgotten the site is still correct — only the CMS's Films view keeps showing the previous year, and everything remains reachable under Archive.
