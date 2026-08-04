// Every image referenced by content or code must exist in public/img.
//
// The images were normalised to WebP in one pass, which renamed 135 files and rewrote the
// references in 56 others. A missed reference does not fail the build — Nuxt happily
// prerenders an <img> pointing at a file that isn't there, and the CMS shows a broken
// thumbnail — so it has to be asserted here instead.
//
// Filenames are compared as decoded, NFC-normalised basenames on purpose: macOS stores
// the Swedish stills (glömska, affären, se-mig-ikväll) as NFD on disk while the markdown
// carries NFC, and the built HTML percent-encodes them. Comparing raw bytes reports
// files as missing that are sitting right there.
//
// Run: node scripts/checks/check-images.mjs

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const norm = s => { try { return decodeURIComponent(s).normalize('NFC').toLowerCase() } catch { return s.normalize('NFC').toLowerCase() } }

const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])

const onDisk = new Set(walk(join(ROOT, 'public/img')).map(f => norm(f.split('/').pop())))

// Only paths that actually point into the image folder — bare filenames in prose would
// otherwise be reported as broken references.
const IMG_PATH = /(?:\/(?:static|public)?\/?img\/[^\s"'`)<>]+?)\.(?:jpe?g|png|webp|gif|svg)/gi

const sources = [
  ...['content', 'components', 'pages', 'layouts', 'assets', 'composables'].flatMap(d => walk(join(ROOT, d))),
  join(ROOT, 'app.vue'), join(ROOT, 'error.vue'),
].filter(f => /\.(md|ya?ml|vue|ts|js|css|json)$/.test(f))

const failures = []
for (const file of sources) {
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  for (const match of text.matchAll(IMG_PATH)) {
    const name = norm(match[0].split('/').pop())
    if (!onDisk.has(name)) {
      failures.push(`${file.replace(ROOT + '/', '')} references ${match[0]}, which does not exist in public/img`)
    }
  }
}

// Every image must opt out of 2x. The sources are 1600px masters, so a 2x request makes
// the CDN upscale — twice the bytes for detail that isn't in the file. This cannot be set
// globally in nuxt.config: Nuxt merges module options with defu, which concatenates
// arrays, so `densities: [1]` resolves to [1, 1, 2] and the 2 survives. See nuxt.config.
for (const file of sources.filter(f => /\.vue$/.test(f))) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(/(?:NuxtImg|nuxt-img)\(([^)]*)/g)) {
    if (!match[1].includes('densities')) {
      failures.push(`${file.replace(ROOT + '/', '')} has a NuxtImg without densities="x1" — it will request 2x renders the 1600px sources cannot fill`)
    }
  }
}

if (failures.length) {
  console.error('FAIL:\n' + [...new Set(failures)].map(f => '  - ' + f).join('\n'))
  process.exit(1)
}
console.log(`PASS (${onDisk.size} images on disk, every reference resolves)`)
