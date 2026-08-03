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
let skipped = 0
const missing = []

for (const path of filmPaths) {
  // The CMS recycled at least one file path across years (see docstring above). Never
  // clobber content that already exists in the working tree — a collision means someone
  // is about to lose restored content, so it must be loud, not silent.
  if (existsSync(path)) {
    console.log(`SKIP (already exists, not overwriting): ${path}`)
    skipped++
    continue
  }

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

console.log(`\n${filmPaths.length} films, ${filmPaths.length - skipped} restored, ${skipped} skipped (already existed), ${recovered} images recovered from history`)
if (missing.length) {
  console.log(`\n${missing.length} images unrecoverable (films will render without them):`)
  missing.forEach(m => console.log(`  ${m}`))
}
