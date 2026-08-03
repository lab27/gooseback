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

const route = useRoute()
const year = Number(route.params.year)

if (!Number.isInteger(year)) {
  throw createError({ statusCode: 404, statusMessage: 'Edition not found', fatal: true })
}

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
