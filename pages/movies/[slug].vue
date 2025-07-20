<template lang="pug">
  main.film-detail
    NuxtLink(to="/movies").back-button &#8592; All Films
    h1 {{ film?.title }}
    p.film-header-meta dir. {{ film?.director }} / {{ film?.type }} / {{ film?.durationInMinutes }} min / {{ film?.language }}
    .film-content
      .film-stills-slider
        FilmStill(
          v-for="(still, index) in stills"
          :key="index"
          :filmStill="staticRemover(still)"
          :filmTitle="film?.title || ''"
          :class="{ 'active': index === currentImageIndex }"
        ).film-slide
        button(
          v-if="!isFirstImage"
          @click="previousImage"
        ).slider_arrow.slider_arrow--left
          img(src="/img/arrowhead.svg").arrow_flop
        button(
          v-if="!isLastImage"
          @click="nextImage"
        ).slider_arrow.slider_arrow--right
          img(src="/img/arrowhead.svg")
      .film-info.mb-12
        .film-synopsis
          ContentDoc(:path="`/films/${route.params.slug}`")
        .film-credits
          .film-credits-line(v-if="film?.country")
            span.film-credits-label Country
            span.film-credits-value {{ film.country }}
          .film-credits-line(v-if="film?.director")
            span.film-credits-label Director
            span.film-credits-value {{ film.director }}
          .film-credits-line(
            v-if="film?.producers"
            v-for="(producer, index) in film.producers"
            :key="`producer-${index}`"
            :class="{ 'no-underline': index > 0 }"
          )
            span.film-credits-label(v-if="index === 0") Producers
            span.film-credits-label(v-else) &nbsp;
            span.film-credits-value {{ producer.producer }}
          .film-credits-line(
            v-if="film?.execProducers"
            v-for="(producer, index) in film.execProducers"
            :key="`producer-${index}`"
            :class="{ 'no-underline': index > 0 }"
          )
            span.film-credits-label(v-if="index === 0") Executive Producers
            span.film-credits-label(v-else) &nbsp;
            span.film-credits-value {{ producer.execProducer }}
          .film-credits-line(
            v-if="film?.cast"
            v-for="(actor, index) in film.cast"
            :key="`actor-${index}`"
            :class="{ 'no-underline': index > 0 }"
          )
            span.film-credits-label(v-if="index === 0") Cast
            span.film-credits-label(v-else) &nbsp;
            span.film-credits-value {{ actor.actor }}
          template(v-if="film")
            .film-credits-line(v-if="film.music")
              span.film-credits-label Music
              span.film-credits-value {{ film.music }}
            .film-credits-line(v-if="film.cinematography")
              span.film-credits-label Cinematography
              span.film-credits-value {{ film.cinematography }}
            .film-credits-line(v-if="film.editor")
              span.film-credits-label Editor
              span.film-credits-value {{ film.editor }}
            .film-credits-line(v-if="film.contact")
              span.film-credits-label Contact
              span.film-credits-value
                a(:href="`mailto:${film.contact}`")
                  span &#8599;
                  span.clickable {{ film.contact }}
            .film-credits-line(v-if="film.filmWebsite")
              span.film-credits-label Film Website
              span.film-credits-value
                a(:href="film.filmWebsite" target="_blank")
                  span &#8599;
                  span.clickable {{ simplifyURL(film.filmWebsite) }}
            .film-credits-line(v-if="film.filmTrailer")
              span.film-credits-label Film Trailer
              span.film-credits-value
                a(:href="film.filmTrailer" target="_blank")
                  span &#8599;
                  span.clickable {{ simplifyURL(film.filmTrailer) }}
    .film-screenings(v-if="film?.screenings")
      h2 Screenings
      .film-screenings-list
        .film-screening(v-for="screening in film.screenings")
          .film-screening-date {{ formattedDate(screening.dateTime) }}
          .film-screening-venue
            a(:href="getVenueMapLink(screening.venue)" target="_blank") {{ getVenueName(screening.venue) }}
          .film-screening-tickets
            span &#8599;
            a(href="https://filmfreeway.com/GasebackFilmFestival/tickets?welcome=true" target="_blank") Buy Tickets
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useVenues } from '~/composables/useVenues'

interface Producer {
  producer: string
}

interface ExecProducer {
  execProducer: string
}

interface Actor {
  actor: string
}

interface Still {
  still: string
}

interface Screening {
  dateTime: string
  venue: string
}

interface Film {
  title: string
  director: string
  type: string
  durationInMinutes: number
  language: string
  country: string
  description: string
  thumbnail: string
  stills?: Still[]
  producers?: Producer[]
  execProducers?: ExecProducer[]
  cast?: Actor[]
  music?: string
  cinematography?: string
  editor?: string
  contact?: string
  filmWebsite?: string
  filmTrailer?: string
  screenings: Screening[]
}

const route = useRoute()
const { staticRemover } = useStaticRemover()
const { getVenueName, getVenueMapLink } = useVenues()
const currentImageIndex = ref(0)

const { data: film } = await useAsyncData('film', () =>
  queryContent<Film>('films', route.params.slug as string).findOne()
)

useHead(() => ({
  title: film.value?.title || 'Film',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: film.value?.description || ''
    }
  ]
}))

// Computed
const stills = computed(() => {
  if (!film.value) return []

  const stillsArray = [film.value.thumbnail]
  if (film.value.stills) {
    film.value.stills.forEach(still => {
      stillsArray.push(still.still)
    })
  }
  return stillsArray
})

const currentImage = computed(() => stills.value[currentImageIndex.value])
const isFirstImage = computed(() => currentImageIndex.value === 0)
const isLastImage = computed(() => currentImageIndex.value === stills.value.length - 1)

// Methods
const formattedDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return format(date, 'EEEE, dd MMMM HH:mm')
}

const simplifyURL = (url: string) => {
  return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]
}

const previousImage = () => {
  if (!isFirstImage.value) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (!isLastImage.value) {
    currentImageIndex.value++
  }
}
</script>
