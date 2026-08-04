import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'

/**
 * This site is deployed as a PURE STATIC build: `yarn generate`, publishing `dist`
 * (the symlink Nuxt's generate creates to .output/public). There is no server at
 * runtime — no Netlify function, nothing to execute a redirect or render a route that
 * was not written to disk at build time.
 *
 * Two consequences drive everything below:
 *
 *   1. A page only exists if it was prerendered. Nitro discovers routes by crawling
 *      links, so any page nothing links to is silently missing from the deploy. The
 *      current edition is exactly that case — the archive lists only past years, so
 *      nothing links to /movies/<currentEdition>. Routes are therefore enumerated from
 *      content rather than left to the crawler.
 *
 *   2. Redirects must be static. A redirect implemented as a Vue page cannot run, so the
 *      legacy flat film URLs are emitted into a real _redirects file that Netlify reads.
 *
 * Both lists are derived from content at build time, so they cannot drift from it.
 */

const frontmatter = (path: string): Record<string, any> => {
  const match = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)
  return match ? parseYaml(match[1]) ?? {} : {}
}

/** @nuxt/content strips diacritics when building _path, so glömska.md serves at /glomska. */
const contentSlug = (filename: string) =>
  filename.replace(/\.md$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '')

const editionYears = (): number[] =>
  existsSync('content/editions')
    ? readdirSync('content/editions')
        .filter(f => f.endsWith('.md'))
        .map(f => frontmatter(join('content/editions', f)).year)
        .filter((y): y is number => Number.isInteger(y))
        .sort((a, b) => a - b)
    : []

const allFilms = (): { year: number, slug: string }[] => {
  if (!existsSync('content/films')) return []
  const out: { year: number, slug: string }[] = []
  for (const entry of readdirSync('content/films')) {
    const dir = join('content/films', entry)
    if (!statSync(dir).isDirectory()) continue
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const year = frontmatter(join(dir, file)).year
      if (Number.isInteger(year)) out.push({ year, slug: contentSlug(file) })
    }
  }
  return out
}

const currentEdition = (): number | undefined =>
  existsSync('content/settings.yml')
    ? parseYaml(readFileSync('content/settings.yml', 'utf8'))?.currentEdition
    : undefined

const YEARS = editionYears()
const FILMS = allFilms()
const CURRENT = currentEdition()

/** Every page that must exist on disk. Not left to the link crawler. */
const PRERENDER_ROUTES = [
  '/archive',
  ...YEARS.map(y => `/movies/${y}`),
  ...FILMS.map(f => `/movies/${f.year}/${f.slug}`)
]

/**
 * Netlify _redirects, most specific first.
 *
 * /movies is 302 and must stay 302: its target changes every festival, and browsers cache
 * a 301 indefinitely — anyone who hit it during 2026 would still be sent to /movies/2026
 * in 2027 with no way to correct it. The `!` forces the rule to win over any file Nitro
 * may have prerendered at that path.
 *
 * The rest are 301: a given year's page and a given film's page will not move again.
 *
 * Every rule is forced with `!`. Nitro also prerenders a meta-refresh stub at each of
 * these paths (from the matching routeRules entry), and Netlify serves a matching file in
 * preference to an unforced rule — so without the `!` visitors would get a client-side
 * meta refresh instead of a real HTTP redirect, which is slower and much weaker for SEO.
 * The stubs remain as a fallback if the rules are ever lost.
 */
const REDIRECTS = [
  ...(CURRENT ? [`/movies  /movies/${CURRENT}  302!`] : []),
  ...YEARS.map(y => `/archive/${y}  /movies/${y}  301!`),
  ...FILMS.map(f => `/movies/${f.slug}  /movies/${f.year}/${f.slug}  301!`)
]

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,

  hooks: {
    // Written after the public assets land in the output directory, so it ends up at the
    // root of what Netlify publishes.
    'nitro:build:public-assets': (nitro: any) => {
      const dir = nitro.options.output.publicDir
      writeFileSync(join(dir, '_redirects'), REDIRECTS.join('\n') + '\n')
      console.info(`[redirects] wrote ${REDIRECTS.length} rules to ${dir}/_redirects`)
    }
  },

  app: {
    head: {
      titleTemplate: 'Gåsebäck — %s',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#FBAF1D" },
        {
          rel: 'stylesheet',
          href: 'https://use.typekit.net/ijl5pip.css'
        }
      ]
    }
  },

  css: [
    '@/assets/css/main.css',
    '@/assets/css/buttonBlock.css',
  ],

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
  ],

  content: {
    // Content module configuration
  },

  image: {
    provider: 'ipx',
    dir: 'public',
    // Optional: default image options
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      default: {
        modifiers: {
          format: 'webp',
          quality: 80,
        }
      }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-03-13',

  // The same redirects as _redirects above, so `nuxt dev` and any future server-rendered
  // deploy behave identically to the static one. On the static build these are inert —
  // the _redirects file is what Netlify actually reads.
  routeRules: Object.fromEntries([
    ...(CURRENT ? [[`/movies`, { redirect: { to: `/movies/${CURRENT}`, statusCode: 302 } }]] : []),
    ...YEARS.map(y => [`/archive/${y}`, { redirect: { to: `/movies/${y}`, statusCode: 301 } }]),
    ...FILMS.map(f => [`/movies/${f.slug}`, { redirect: { to: `/movies/${f.year}/${f.slug}`, statusCode: 301 } }])
  ]),

  nitro: {
    prerender: {
      failOnError: false, // Temporarily add this to debug image issues
      // Enumerated from content rather than left to the link crawler: nothing links to
      // the current edition (the archive lists past years only), so crawling alone
      // silently omits the live programme page from the deploy.
      routes: PRERENDER_ROUTES
    }
  }
})
