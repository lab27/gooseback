<template lang="pug">
  main
    header.films-header
      h1 {{ filmPage?.heading }}
      .sort-by
        label Sort by:
        select(v-model="sortBy")
          option(value="title") Title
          option(value="dateTime") Screening Date
    .films-wrapper(v-if="filmPage?.isAnnounced")

      //- Features
      h2 Features
      p.lead-text {{ filmPage?.featuresDescription }}
      ul.film-grid
        li(v-for="film in sortedFilms" :key="film.slug" v-if="film.program === 'features'")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(:src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ formattedDate(film.screenings[0].dateTime) }}

      //- Shorts 1
      h2 Shorts Program 1
      p.lead-text {{ filmPage?.shorts1Description }}
      ul.film-grid
        li(v-for="film in sortedFilms" :key="film.slug" v-if="film.program === 'shorts1'")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(:src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ formattedDate(film.screenings[0].dateTime) }}

      //- Shorts 2
      h2
        span.flop R
        span E
        span S
        span I
        span S
        span T
        span.flip A
        span N
        span C
        span.flop E
      p.lead-text {{ filmPage?.shorts1Description }}
      ul.film-grid
        li(v-for="film in sortedFilms" :key="film.slug" v-if="film.program === 'shorts2'")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(:src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ formattedDate(film.screenings[0].dateTime) }}


    section(v-else)
      ContentDoc(path="/pages/movies")

</template>

<script setup lang="ts">
import { format } from 'date-fns'

interface Film {
  slug: string
  title: string
  thumbnail: string
  program: 'features' | 'shorts1' | 'shorts2'
  screenings: Array<{
    dateTime: string
  }>
}

interface FilmPage {
  heading: string
  isAnnounced: boolean
  featuresDescription: string
  shorts1Description: string
}

useHead({
  title: 'Movies',
  bodyAttrs: {
    class: 'page-movies'
  }
})

const { $staticRemover } = useNuxtApp()
const sortBy = ref('title')

// Fetch data
const { data: films } = await useAsyncData('films', () =>
  queryContent<Film>('films').find()
)

const { data: filmPage } = await useAsyncData('filmPage', () =>
  queryContent<FilmPage>('pages/movies').findOne()
)

// Computed
const sortedFilms = computed(() => {
  if (!films.value) return []

  if (sortBy.value === 'dateTime') {
    return [...films.value].sort((a, b) =>
      new Date(a.screenings[0].dateTime).getTime() - new Date(b.screenings[0].dateTime).getTime()
    )
  }

  return [...films.value].sort((a, b) =>
    a[sortBy.value].localeCompare(b[sortBy.value])
  )
})

// Methods
const formattedDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return format(date, 'dd.MM HH:mm')
}
</script>

<style scoped>
.films-wrapper h2 {
  font-size: 2rem;
  margin-bottom: .5rem;
}

.films-wrapper p.lead-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.film-grid {
  margin-bottom: 4rem;
}

h2 span {
  display: inline-block;
}
h2 span.flop {
  transform: scaleX(-1);
}

h2 span.flip {
  transform: scaleY(-1) translateY(-1px) translateX(1px);
}

.film-details-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.films-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
</style>
