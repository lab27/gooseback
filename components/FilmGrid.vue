<template lang="pug">
ul.film-grid
  li(v-for="film in films" :key="film._path")
    NuxtLink(:to="`/movies/${film.year}/${slugFor(film)}`")
      .film-thumbnail-wrapper
        .thumbnail-arrow-wrapper
          Arrow
        .thumbnail-gauze
        NuxtImg(v-if="film.thumbnail" :src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
      .film-details-wrapper
        span.film-title {{ film.title }}
        span.film-date {{ dateFor(film) }}
</template>

<script setup lang="ts">
import { useStaticRemover } from '~/composables/useStaticRemover'
import { useFilmDate } from '~/composables/useFilmDate'

interface Screening {
  dateTime: string
  venue: string
}

interface Film {
  _path: string
  _stem?: string
  slug?: string
  title: string
  thumbnail?: string
  year?: number
  screenings?: Screening[]
}

const props = defineProps<{ films: Film[] }>()

const { staticRemover } = useStaticRemover()
const { formatScreeningDate } = useFilmDate()

// Fetched here (rather than threaded through EditionProgram) to keep the parent
// pages/components free of a prop they don't otherwise need. FilmGrid can render
// multiple times per page (once per program section); useAsyncData dedupes by key,
// so this only issues one fetch regardless of instance count.
const { data: settings } = await useAsyncData('settings-grid', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const slugFor = (film: Film) =>
  film.slug || film._path.split('/').pop() || film._stem?.split('/').pop() || 'unknown'

/** A film is archived when its year differs from the current edition; yearless films count as current. */
const isArchived = (film: Film) =>
  !!film.year && film.year !== settings.value?.currentEdition

const dateFor = (film: Film) => {
  const dateTime = film.screenings?.[0]?.dateTime
  return dateTime ? formatScreeningDate(dateTime, film.year, isArchived(film)) : 'TBA'
}
</script>

<style scoped>
.film-details-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
