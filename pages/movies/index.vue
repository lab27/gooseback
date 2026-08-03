<template lang="pug">
  main
    header.films-header
      h1 {{ edition?.heading }}
    .sort-by.mb-8(v-if="edition?.isAnnounced")
      label Sort by:
      select(v-model="sortBy")
        option(value="title") Title
        option(value="dateTime") Screening Date
    article
      p.announcement(v-if="edition?.announcement") {{ edition.announcement }}
      ContentRenderer(v-if="edition" :value="edition")
    EditionProgram(v-if="edition?.isAnnounced" :edition="edition" :films="sortedFilms")
</template>

<script setup lang="ts">
import { useFilmDate } from '~/composables/useFilmDate'

interface Screening {
  dateTime: string
  venue: string
}

interface Film {
  _path: string
  _stem: string
  title: string
  thumbnail: string
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
  isAnnounced: boolean
  announcement?: string
  description?: string
  sections?: Section[]
}

const { parseScreeningDate } = useFilmDate()
const sortBy = ref('title')

const { data: settings } = await useAsyncData('settings', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const currentYear = computed(() => settings.value?.currentEdition)

const { data: edition } = await useAsyncData('current-edition', () =>
  queryContent<Edition>('editions').where({ year: currentYear.value }).findOne()
)

useHead(() => ({
  title: 'Movies',
  bodyAttrs: {
    class: 'page-movies'
  },
  meta: [
    { name: 'description', content: edition.value?.description ?? '' },
    { property: 'og:description', content: edition.value?.description ?? '' }
  ]
}))

const { data: films } = await useAsyncData('current-films', () =>
  queryContent<Film>('films').where({ year: currentYear.value }).find()
)

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
</script>

<style scoped>
.films-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.announcement {
  margin-bottom: 1rem;
  font-weight: bold;
}
</style>
