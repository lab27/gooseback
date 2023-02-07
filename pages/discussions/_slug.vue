<template lang="pug">
  main.talk-detail
    h1 {{ talk.title }}
    //- p {{ talk }}
    .talk-content
      .talk-stills-slider
        FilmStill(:filmStill="$staticRemover(talk.thumbnail)" :filmTitle="talk.title").talk-slide
      .talk-info.mb-12
        .talk-synopsis
          nuxt-content(:document="talk")
        .talk-schedule
          h2 Schedule
          .film-credits
            .film-credits-line
              span.film-credits-label Date & Time
              span.film-credits-value {{ formattedDate(talk.dateTime) }}
            .film-credits-line
              span.film-credits-label Venue
              span.film-credits-value {{ talk.venue }}
            .film-credits-line
              span.film-credits-label Tickets
              span.film-credits-value
                a(:href="talk.ticketsLink" target="_blank") Buy Now&nbsp;&#8599; 


</template>

<script>
import { format } from 'date-fns'
export default {
  async asyncData({ $content, params }) {
    const talk = await $content('talks', params.slug).fetch()
    return { talk }
  },
  head() {
    return {
      title: this.talk.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.talk.description
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