<template lang="pug">
  main.film-detail
    nuxt-link(to="/movies").back-button &#8592; All Films
    h1 {{ film.title }}
    p.film-header-meta dir. {{ film.director }} / {{ film.type }} / {{ film.durationInMinutes }} min / {{ film.language }}
    .film-content
      .film-stills-slider
        //- transition-group(name="fade" mode="out-in")
        FilmStill(:filmStill="$staticRemover(still)" :filmTitle="film.title" v-for="still, index in stills" :key="index" :class="{ 'active': index === currentImageIndex }").film-slide
        button(v-if="!isFirstImage" @click="previousImage").slider_arrow.slider_arrow--left
          img(src="/img/arrowhead.svg").arrow_flop
        button(v-if="!isLastImage" @click="nextImage").slider_arrow.slider_arrow--right
          img(src="/img/arrowhead.svg")
      .film-info.mb-12
        .film-synopsis
          nuxt-content(:document="film")
        .film-credits
          .film-credits-line(v-if="film.country")
            span.film-credits-label Country
            span.film-credits-value {{ film.country }}
          //- .film-credits-line(v-if="film.language")
          //-   span.film-credits-label Language
          //-   span.film-credits-value {{ film.language }}
          .film-credits-line(v-if="film.director")
            span.film-credits-label Director
            span.film-credits-value {{ film.director }}
          .film-credits-line(v-if="film.producers" v-for="producer, index in film.producers" :key="`producer-${index}`" :class="{ 'no-underline': index > 0 }")
            span.film-credits-label(v-if="index === 0") Producers
            span.film-credits-label(v-else) &nbsp;
            span.film-credits-value {{ producer.producer}}
          .film-credits-line(v-if="film.execProducers" v-for="producer, index in film.execProducers" :key="`producer-${index}`" :class="{ 'no-underline': index > 0 }")
            span.film-credits-label(v-if="index === 0") Executive Producers
            span.film-credits-label(v-else) &nbsp;
            span.film-credits-value {{ producer.execProducer}}
          .film-credits-line(v-if="film.cast" v-for="actor, index in film.cast" :key="`actor-${index}`" :class="{ 'no-underline': index > 0 }")
            span.film-credits-label(v-if="index === 0") Cast
            span.film-credits-label(v-else) &nbsp;
            span.film-credits-value {{ actor.actor}}
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
    .film-screenings
      h2 Screenings
      .film-screenings-list
        .film-screening(v-for="screening in film.screenings")
          //- .film-screening-date {{ formattedDate(screening.dateTime)}}
          .film-screening-date {{ screening.dateTime}}
          .film-screening-venue 
            a(href="https://goo.gl/maps/24UHpb31Xt13gXQH7" target="_blank") Verkstadsgatan 11
          .film-screening-tickets
            span &#8599; 
            a(href="https://filmfreeway.com/GasebackFilmFestival/tickets?welcome=true" target="_blank") Buy Tickets
</template>

<script>
import { format } from 'date-fns'
export default {
  async asyncData({ $content, params }) {
    const film = await $content('films', params.slug).fetch()
    return { film }
  },
  data() {
    return {
      currentImageIndex: 0
    }
  },
  computed: {

    stills() {
      // pull the "still" value out of the stills array and add it to the stills array
      const stills = []
      stills.push(this.film.thumbnail)
      this.film.stills.forEach(still => {
        stills.push(still.still)
      })
      return stills
    },
    currentImage() {
      return this.stills[this.currentImageIndex];
    },
    isFirstImage() {
      return this.currentImageIndex === 0;
    },
    isLastImage() {
      return this.currentImageIndex === this.stills.length - 1;
    }
  },
  head() {
    return {
      title: this.film.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.film.description
        }
      ]
    }
  },
  methods: {
    formattedDate(isoDate) {
      const date = new Date(isoDate);
      const timestamp = date.getTime() / 1000;
      return format(date, 'EEEE, dd MMMM HH:mm');
    },
    simplifyURL(url) {
      return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]
    },
    previousImage() {
      this.currentImageIndex--;
    },
    nextImage() {
      this.currentImageIndex++;
    }
  }
}
</script>