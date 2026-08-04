<template lang="pug">
  main
    NuxtLink(v-if="!isCurrent" to="/archive").back-button &#8592; The Archive
    header.films-header
      h1 {{ edition?.heading }} {{ edition?.year }}
    .sort-by.mb-8(v-if="showProgram")
      label Sort by:
      select(v-model="sortBy")
        option(value="title") Title
        option(value="dateTime") Screening Date
    article
      p.announcement(v-if="isCurrent && edition?.announcement") {{ edition.announcement }}
      ContentRenderer(v-if="hasIntro" :value="edition")
    EditionProgram(v-if="showProgram" :edition="edition" :films="sortedFilms")
</template>

<script setup lang="ts">
import { useFilmDate } from '~/composables/useFilmDate'

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
  isAnnounced: boolean
  announcement?: string
  description?: string
  sections?: Section[]
}

definePageMeta({
  // Without this, navigating /movies/2023 -> /movies/2024 matches the same route
  // record, so Vue reuses the component instance and setup() never re-runs — the
  // year, both content queries, and the head would stay frozen at whichever year
  // mounted first. Keying on the full path forces a remount on every param change.
  key: route => route.fullPath
})

const route = useRoute()
const param = route.params.year as string

/**
 * A strict 4-digit year. Legacy flat film URLs (/movies/kika) are handled by static
 * redirect rules in nuxt.config, not here — this is a static build, so a redirect
 * implemented as a page would never run.
 */
if (!/^\d{4}$/.test(param)) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}

const year = Number(param)

const { data: edition } = await useAsyncData(`edition-${year}`, () =>
  queryContent<Edition>('editions').where({ year }).findOne()
)

if (!edition.value) {
  throw createError({ statusCode: 404, statusMessage: 'Edition not found', fatal: true })
}

const { data: films } = await useAsyncData(`films-${year}`, () =>
  queryContent<Film>('films').where({ year }).find()
)

const { data: settings } = await useAsyncData('settings-year-page', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const isCurrent = computed(() => settings.value?.currentEdition === year)

/**
 * An edition before the current one has already happened, so its programme is a matter of
 * record — `isAnnounced` is a gate for an edition still being prepared and must not be
 * able to blank a past one. Without this, toggling the flag on an archived edition hides
 * every film on that year's page while the films sit untouched in the CMS.
 *
 * Same definition of "archived" the archive index uses: strictly before the current year.
 */
const isArchived = computed(() =>
  !!settings.value?.currentEdition && year < settings.value.currentEdition
)

const showProgram = computed(() => isArchived.value || edition.value?.isAnnounced === true)

/**
 * Guard on the body having actual nodes, not merely on the edition existing. Given an
 * empty document and no default slot, ContentRenderer falls back to dumping the whole
 * document object onto the page along with "You should use slots with <ContentRenderer>".
 * A new edition created in the CMS starts with an empty Intro, so this is the normal
 * state of next year's page, not an edge case.
 */
const hasIntro = computed(() => (edition.value?.body?.children?.length ?? 0) > 0)

const { parseScreeningDate } = useFilmDate()
const sortBy = ref('title')

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

useHead(() => ({
  title: `Movies ${year}`,
  bodyAttrs: {
    class: 'page-movies'
  },
  meta: [
    { name: 'description', content: edition.value?.description ?? '' },
    { property: 'og:description', content: edition.value?.description ?? '' }
  ]
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

.announcement {
  margin-bottom: 1rem;
  font-weight: bold;
}
</style>
