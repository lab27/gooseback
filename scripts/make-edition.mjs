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
