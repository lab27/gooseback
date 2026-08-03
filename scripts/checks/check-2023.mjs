import { readFileSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync } from 'node:fs'
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

/**
 * These 53 films' images exist nowhere but git history for anything that gets pruned or
 * corrupted, so `existsSync` alone is not enough — a 0-byte or truncated write would pass
 * that check silently. Confirm each referenced image is non-zero size and, where the format
 * is cheaply identifiable, has a recognizable magic number. Every image referenced across
 * the current content tree (thumbnail and still fields across content/films) is JPEG, PNG,
 * or AVIF — WebP does not appear, so no signature is defined for it. If a future restore
 * introduces an extension with no signature here, fall back to a minimum-size floor rather
 * than silently passing or hard-failing on an unrecognized format.
 */
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff]
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const SIGNATURES = { '.jpg': JPEG_SIGNATURE, '.jpeg': JPEG_SIGNATURE, '.png': PNG_SIGNATURE }
const AVIF_BRANDS = ['avif', 'avis', 'mif1', 'msf1']
const MIN_PLAUSIBLE_BYTES = 256 // fallback floor for extensions with no defined signature

const startsWith = (head, sig) => sig.every((byte, i) => head[i] === byte)

const inspectImage = (diskPath) => {
  if (!existsSync(diskPath)) return { ok: false, reason: 'does not exist on disk' }

  const size = statSync(diskPath).size
  if (size === 0) return { ok: false, reason: 'is 0 bytes' }

  const fd = openSync(diskPath, 'r')
  const head = Buffer.alloc(12)
  const bytesRead = readSync(fd, head, 0, 12, 0)
  closeSync(fd)

  const ext = diskPath.slice(diskPath.lastIndexOf('.')).toLowerCase()

  if (ext === '.avif') {
    const ftyp = head.toString('ascii', 4, 8)
    const brand = head.toString('ascii', 8, 12)
    if (bytesRead < 12 || ftyp !== 'ftyp' || !AVIF_BRANDS.includes(brand)) {
      return { ok: false, reason: `does not have a valid AVIF ftyp signature (got ftyp="${ftyp}" brand="${brand}")` }
    }
    return { ok: true }
  }

  const signature = SIGNATURES[ext]
  if (signature) {
    if (!startsWith(head, signature)) {
      const hex = [...head.slice(0, signature.length)].map(b => b.toString(16).padStart(2, '0')).join(' ')
      return { ok: false, reason: `does not have a valid ${ext} signature (got magic bytes ${hex})` }
    }
    return { ok: true }
  }

  if (size < MIN_PLAUSIBLE_BYTES) {
    return { ok: false, reason: `is only ${size} bytes and extension ${ext} has no defined signature (below ${MIN_PLAUSIBLE_BYTES}-byte fallback floor)` }
  }
  return { ok: true }
}

const missing = []
y2023.forEach(({ file, fm }) => {
  const refs = [fm.thumbnail, ...(fm.stills || []).map(s => s.still)].filter(Boolean)
  refs.forEach(r => {
    if (!r.startsWith('/')) return
    const diskPath = r.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/')
    const result = inspectImage(diskPath)
    if (!result.ok) missing.push(`${file} -> ${r} : ${result.reason}`)
  })
})
if (missing.length) { console.error('INVALID IMAGES:\n' + missing.join('\n')); process.exit(1) }

const ed = frontmatter('content/editions/2023.md')
assert(ed.year === 2023, 'edition year 2023')
assert(Array.isArray(ed.sections) && ed.sections.length === 0, '2023 has no sections')
console.log('PASS')
