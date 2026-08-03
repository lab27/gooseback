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

definePageMeta({
  // Without this, navigating /archive/2023 -> /archive/2024 reuses the same
  // route-record component instance and setup() never re-runs, so `year`,
  // both useAsyncData calls, and the useHead title/canonical would stay
  // frozen at whichever year mounted first. Keying on the full path forces
  // a remount on every param change.
  key: route => route.fullPath
})

const route = useRoute()
const rawYear = route.params.year as string

// Require a strict 4-digit year (no zero-padding, no whitespace) so
// /archive/02024 and /archive/2024 don't both resolve to the same page
// under different, non-canonical URLs. This is distinct from the "no
// matching edition" 404 below: a malformed param never reaches the
// content lookup at all.
if (!/^\d{4}$/.test(rawYear)) {
  throw createError({ statusCode: 404, statusMessage: 'Invalid year format', fatal: true })
}

const year = Number(rawYear)

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
  // The current edition also lives at /movies; point search engines there with a
  // root-relative canonical (no verified production hostname to hardcode here).
  link: isCurrent.value ? [{ rel: 'canonical', href: '/movies' }] : []
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
