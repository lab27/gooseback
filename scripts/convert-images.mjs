// One-off-able image normaliser: re-encodes everything under public/img to WebP at a
// sane ceiling and rewrites the references that point at the old filenames.
//
// Why WebP and not JPEG: the site serves WebP to every visitor anyway, WebP came in
// 20-43% under JPEG at matched quality on these stills, and it keeps alpha — a dozen of
// the PNGs here have transparency that JPEG would flatten against black.
//
// Why 1600px: that is the widest slot in any layout (FilmStill is `width="1600"`). The
// sources arrive as 4K press stills, so most of the weight is pixels no layout can use.
// Note this pairs with `densities: [1]` in nuxt.config — with a 1600px master there is
// no 2x detail to serve, so asking the CDN for 3200px would just upscale.
//
// Safe to re-run: files already at or below the ceiling that would not get smaller are
// left alone, and an encode that fails leaves the original in place.
//
// Run: node scripts/convert-images.mjs [--dry]

import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

const DRY = process.argv.includes('--dry')
const ROOT = process.cwd()
const IMG_DIR = join(ROOT, 'public/img')
const MAX_EDGE = 1600
const QUALITY = 85
// PNGs this small are logos and UI graphics, not photographs — lossless keeps their flat
// colour and hard edges clean, and at this size it still beats the original.
const SMALL_PNG = 300 * 1024

const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])

const RASTER = /\.(jpe?g|png|webp|gif)$/i
const TEXT_DIRS = ['content', 'components', 'pages', 'layouts', 'assets', 'composables']
const TEXT_FILES = ['public/admin/config.yml', 'nuxt.config.ts', 'app.vue', 'error.vue']

const mb = b => (b / 1048576).toFixed(2)
const renames = new Map()   // old basename -> new basename
const skipped = []
let before = 0, after = 0

for (const file of walk(IMG_DIR).filter(f => RASTER.test(f))) {
  const origSize = statSync(file).size
  before += origSize
  const isPng = /\.png$/i.test(file)
  const target = file.replace(/\.[^.]+$/, '.webp')

  let buf
  try {
    // .rotate() bakes in EXIF orientation before the metadata is dropped, otherwise a
    // phone-shot still would come out sideways.
    const pipeline = sharp(file).rotate().resize({
      width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true,
    })
    buf = await (isPng && origSize < SMALL_PNG
      ? pipeline.webp({ lossless: true })
      : pipeline.webp({ quality: QUALITY })).toBuffer()
  } catch (error) {
    skipped.push({ file, reason: String(error.message).split('\n')[0] })
    after += origSize
    continue
  }

  // Never trade a smaller file for a bigger one — some sources are already optimised.
  if (buf.length >= origSize && file === target) {
    skipped.push({ file, reason: `re-encode was larger (${mb(buf.length)} MB vs ${mb(origSize)} MB)` })
    after += origSize
    continue
  }

  after += buf.length
  if (!DRY) {
    writeFileSync(target, buf)
    if (target !== file) unlinkSync(file)
  }
  if (target !== file) renames.set(basename(file), basename(target))
}

// Rewrite references. Matching is on the basename only, so the /static/img vs /public/img
// prefixes in the content files are left exactly as they are. Both Unicode normalisations
// are tried: macOS stores the Swedish filenames NFD on disk, the markdown carries NFC.
const textFiles = [
  ...TEXT_DIRS.flatMap(d => walk(join(ROOT, d))),
  ...TEXT_FILES.map(f => join(ROOT, f)),
].filter(f => /\.(md|ya?ml|vue|ts|js|css|json)$/.test(f))

let rewritten = 0
for (const file of textFiles) {
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  let out = text
  for (const [oldName, newName] of renames) {
    for (const variant of new Set([oldName, oldName.normalize('NFC'), oldName.normalize('NFD'), encodeURIComponent(oldName)])) {
      if (out.includes(variant)) {
        out = out.split(variant).join(variant === encodeURIComponent(oldName) ? encodeURIComponent(newName) : newName)
      }
    }
  }
  if (out !== text) {
    rewritten++
    if (!DRY) writeFileSync(file, out)
  }
}

console.log(`${DRY ? '[dry run] ' : ''}converted ${renames.size} images`)
console.log(`public/img: ${mb(before)} MB -> ${mb(after)} MB (${(100 - after / before * 100).toFixed(0)}% smaller)`)
console.log(`rewrote references in ${rewritten} files`)
if (skipped.length) {
  console.log(`\nleft alone (${skipped.length}):`)
  for (const s of skipped) console.log(`  ${s.file.replace(ROOT + '/', '')}\n     ${s.reason}`)
}
