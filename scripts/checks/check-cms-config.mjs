// Validates public/admin/config.yml beyond "does it parse".
//
// A config can be perfectly valid YAML and still be rejected by the CMS at load time,
// which surfaces only as "Error loading the CMS configuration" in the browser — a
// failure mode no curl check catches, since /admin/ returns 200 either way. This script
// asserts the structural invariants this site depends on plus the CMS schema constraints
// that are easy to violate from YAML.
//
// Run: node scripts/checks/check-cms-config.mjs

import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

const raw = readFileSync('public/admin/config.yml', 'utf8')
const cfg = parse(raw)

const failures = []
const check = (cond, msg) => { if (!cond) failures.push(msg) }

const byName = Object.fromEntries(cfg.collections.map(c => [c.name, c]))
const films = byName.films
const archive = byName.films_archive
const editions = byName.editions

// --- CMS schema constraints -------------------------------------------------
// view_filters[].pattern is `oneOf: [boolean, string]`. A bare YAML number parses
// fine and then fails config validation in the browser.
cfg.collections.forEach(col => {
  ;(col.view_filters ?? []).forEach((f, i) => {
    const t = typeof f.pattern
    check(
      t === 'string' || t === 'boolean',
      `${col.name}.view_filters[${i}].pattern must be a string or boolean, got ${t} (${JSON.stringify(f.pattern)}) — quote it in YAML`
    )
    check(typeof f.field === 'string', `${col.name}.view_filters[${i}].field must be a string`)
  })
  ;(col.view_groups ?? []).forEach((g, i) => {
    check(typeof g.field === 'string', `${col.name}.view_groups[${i}].field must be a string`)
  })
  // Every collection needs a name plus either a folder or a files list.
  check(!!col.name, 'every collection needs a name')
  check(!!col.folder || Array.isArray(col.files), `${col.name} needs either a folder or a files list`)
})

// Field definitions need a name and a widget, or the CMS drops them silently.
const walkFields = (fields, path) => {
  ;(fields ?? []).forEach((f, i) => {
    check(!!f.name, `${path}[${i}] is missing a name`)
    check(!!f.widget, `${path}[${i}] (${f.name}) is missing a widget`)
    if (f.fields) walkFields(f.fields, `${path}[${i}].fields`)
  })
}
cfg.collections.forEach(col => {
  if (col.fields) walkFields(col.fields, `${col.name}.fields`)
  ;(col.files ?? []).forEach((file, i) => walkFields(file.fields, `${col.name}.files[${i}].fields`))
})

// --- Site-specific invariants -----------------------------------------------
check(!!editions, 'the editions collection must exist')
check(!!films, 'the films collection must exist')

// One collection presenting a Films > Year > Film tree, not two collections over the
// same folder. The separate films_archive collection was removed when films moved into
// per-year folders — if it comes back, the current year appears in two places again.
check(!archive, 'films_archive must not exist — films are a single nested collection now')

// The tree comes from the folder structure, which comes from these two settings.
check(films?.path === '{{year}}/{{slug}}', "films.path must be '{{year}}/{{slug}}' so new films file under their year")
check(films?.nested?.depth === 2, 'films.nested.depth must be 2 (content/films/<year>/<slug>.md)')

// Without subfolders:false the year folders render titled after their first film,
// because Decap otherwise assumes each folder is a page with an index entry.
check(films?.nested?.subfolders === false, 'films.nested.subfolders must be false so year folders show the year, not their first film')

// A year filter would defeat the tree and reintroduce an annual config edit.
check(!films?.filter, 'films must not declare a filter — the nested tree replaces it')

// The typo that hid executive-producer credits for years must not come back.
check(!raw.includes('exectProducer'), 'the exectProducers typo must not reappear')

// The deleted movies.md must not be referenced.
check(!raw.includes('pages/movies.md'), 'config still references the deleted content/pages/movies.md')

// Editions field names must match the frontmatter the site actually reads.
const editionFieldNames = (editions?.fields ?? []).map(f => f.name)
;['year', 'heading', 'dates', 'isAnnounced', 'sections'].forEach(n =>
  check(editionFieldNames.includes(n), `editions collection is missing the ${n} field`)
)
const sections = (editions?.fields ?? []).find(f => f.name === 'sections')
check(
  JSON.stringify((sections?.fields ?? []).map(f => f.name)) === JSON.stringify(['title', 'program', 'description']),
  'editions.sections subfields must be title, program, description'
)

if (failures.length) {
  console.error('FAIL:\n' + failures.map(f => '  - ' + f).join('\n'))
  process.exit(1)
}
console.log('PASS')
