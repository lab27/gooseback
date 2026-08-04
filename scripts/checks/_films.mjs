// Shared helpers for the content check scripts.
//
// Films live at content/films/<year>/<slug>.md. The `year` frontmatter field is the
// source of truth; the folder mirrors it because the CMS writes the path from
// `path: '{{year}}/{{slug}}'`. assertFolderMatchesYear() below enforces that they
// never drift apart.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const FILMS_DIR = 'content/films'

/** Every film file, recursed one level into the year folders. */
export const allFilms = () => {
  const out = []
  for (const entry of readdirSync(FILMS_DIR)) {
    const full = join(FILMS_DIR, entry)
    if (!statSync(full).isDirectory()) continue
    for (const file of readdirSync(full)) {
      if (!file.endsWith('.md')) continue
      const path = join(full, file)
      const raw = readFileSync(path, 'utf8')
      const m = raw.match(/^---\n([\s\S]*?)\n---/)
      if (!m) throw new Error(`no frontmatter in ${path}`)
      out.push({ path, file, folder: entry, slug: file.replace(/\.md$/, ''), data: parse(m[1]) })
    }
  }
  return out
}

export const filmsForYear = (year) => allFilms().filter(f => f.data.year === year)

/** Content references images as /static/… or /public/…; both live under public/. */
export const imagePathOnDisk = (ref) =>
  ref.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/')

export const imageRefs = (film) =>
  [film.data.thumbnail, ...(film.data.stills ?? []).map(s => s.still)].filter(Boolean)

/**
 * The folder must agree with the `year` field. If an editor changes a film's year in the
 * CMS and the file does not get moved, the site keeps rendering from the field while the
 * tree says otherwise — this is the assertion that catches it.
 */
export const assertFolderMatchesYear = (failures) => {
  for (const film of allFilms()) {
    if (String(film.data.year) !== film.folder) {
      failures.push(`${film.path} is in folder ${film.folder} but its year field is ${film.data.year}`)
    }
  }
}

export { existsSync }
