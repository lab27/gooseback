<template lang="pug">
  main.film-detail
    h1 {{ film.title }}
    p.film-header-meta dir. {{ film.director }} / {{ film.type }} / {{ film.durationInMinutes }} min
    .film-content
      .film-stills-slider
        transition(name="fade" mode="out-in")
          FilmStill(:filmStill="$staticRemover(still)" :filmTitle="film.title" v-for="still, index in stills" :key="index" v-if="index == currentImageIndex")
        button(v-if="!isFirstImage" @click="previousImage").slider_arrow.slider_arrow--left
          img(src="/img/arrowhead.svg").arrow_flop
        button(v-if="!isLastImage" @click="nextImage").slider_arrow.slider_arrow--right
          img(src="/img/arrowhead.svg")
      .film-info.mb-12
        .film-synopsis
          nuxt-content(:document="film")
        .film-credits
          .film-credits-line
            span.film-credits-label Director
            span.film-credits-value {{ film.director }}
          .film-credits-line
            span.film-credits-label Producer
            span.film-credits-value {{ film.producer }}
          .film-credits-line
            span.film-credits-label Executive Producer
            span.film-credits-value {{ film.execProducer }}
          .film-credits-line
            span.film-credits-label Cast
            span.film-credits-value {{ film.cast[0].actor }}
          .film-credits-line.no-underline
            span.film-credits-label 
            span.film-credits-value {{ film.cast[1].actor }}
          .film-credits-line.no-underline
            span.film-credits-label 
            span.film-credits-value {{ film.cast[2].actor }}
          .film-credits-line
            span.film-credits-label Music
            span.film-credits-value {{ film.music }}
          .film-credits-line
            span.film-credits-label Cinematography
            span.film-credits-value {{ film.cinematography }}
          .film-credits-line
            span.film-credits-label Editor
            span.film-credits-value {{ film.editor }}
          .film-credits-line
            span.film-credits-label Contact
            span.film-credits-value 
              a(:href="`mailto:${film.contact}`") 
                span &#8599; 
                span.clickable {{ film.contact }}
          .film-credits-line
            span.film-credits-label Film Website
            span.film-credits-value 
              a(:href="film.filmWebsite" target="_blank") 
                span &#8599; 
                span.clickable {{ simplifyURL(film.filmWebsite) }}
          .film-credits-line
            span.film-credits-label Film Trailer
            span.film-credits-value 
              a(:href="film.filmTrailer" target="_blank") 
                span &#8599; 
                span.clickable {{ simplifyURL(film.filmTrailer) }}
    .film-screenings
      h2 Screenings
      .film-screenings-list
        .film-screening(v-for="screening in film.screenings")
          .film-screening-date {{ formattedDate(screening.dateTime)}}
          .film-screening-venue {{ screening.venue }}
          .film-screening-tickets
            span &#8599; 
            a(:href="screening.tickets" target="_blank") Buy Tickets
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