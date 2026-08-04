<template lang="pug">
  main.film-detail
    NuxtLink(:to="backLink.to").back-button &#8592; {{ backLink.label }}
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
          ContentDoc(:path="`/films/${year}/${slug}`")
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
          //- pre {{ screening.dateTime }}
          .film-screening-date
            span {{ screeningDate(screening.dateTime) }}
            span.screening-badge(v-if="isArchived") Past screening
          .film-screening-venue
            a(:href="getVenueMapLink(screening.venue)" target="_blank") {{ getVenueName(screening.venue) }}
          .film-screening-tickets(v-if="!isArchived")
            span &#8599;
            a(href="https://www.nortic.se/ticket/organizer/4557" target="_blank") Buy Tickets
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useVenues } from '~/composables/useVenues'
import { useFilmDate } from '~/composables/useFilmDate'

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
  year?: number
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

definePageMeta({
  // Film pages link to each other through the grid, and those navigations match this
  // same route record. Without a key Vue reuses the component instance and setup()
  // never re-runs, leaving the previous film's content under the new URL.
  key: route => route.fullPath
})

const route = useRoute()
const { staticRemover } = useStaticRemover()
const { getVenueName, getVenueMapLink } = useVenues()
const { formatScreeningDateLong } = useFilmDate()
const currentImageIndex = ref(0)

const year = route.params.year as string
const slug = route.params.film as string

// Films live at content/films/<year>/<slug>.md, so the lookup is scoped by year —
// a slug only resolves under the edition it actually belongs to.
const { data: film } = await useAsyncData(`film-${year}-${slug}`, () =>
  queryContent<Film>('films', year, slug).findOne()
)

if (!film.value) {
  throw createError({ statusCode: 404, statusMessage: 'Film not found', fatal: true })
}

const { data: settings } = await useAsyncData('settings-film', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

/**
 * A film is archived when its year differs from the current edition; a film with
 * no year at all is treated as current. This is the same rule the back button
 * already uses — reused here to decide whether to show the year on screening
 * dates and whether to render the ticket link.
 */
const isArchived = computed(() => {
  const filmYear = film.value?.year
  return !!filmYear && filmYear !== settings.value?.currentEdition
})

/**
 * Every film now sits under its edition, so the back link is always that edition's
 * program page. Built from the route param rather than the film's field so it stays
 * correct even for a film with no year.
 */
const backLink = computed(() => ({ to: `/movies/${year}`, label: `${year} Films` }))

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
  return stillsArray.filter(Boolean)
})

const currentImage = computed(() => stills.value[currentImageIndex.value])
const isFirstImage = computed(() => currentImageIndex.value === 0)
const isLastImage = computed(() => currentImageIndex.value === stills.value.length - 1)

// Methods
const formattedDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return format(date, 'EEEE, dd MMMM HH:mm')
}

const screeningDate = (dateTime: string) =>
  formatScreeningDateLong(dateTime, film.value?.year, isArchived.value)

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

<style scoped>
.film-screening-date {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;
}

.screening-badge {
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: .15rem .6rem;
  color: var(--color-sky-blue);
}
</style>
