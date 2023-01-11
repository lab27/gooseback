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
    .film-screenings
      h2 Schedule
      .film-screenings-list
        .film-screening
          .film-screening-date {{ formattedDate(talk.dateTime)}}
          .film-screening-venue {{ talk.venue }}
          .film-screening-tickets
            span &#8599; 
            a(:href="talk.ticketsLink" target="_blank") Buy Tickets
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