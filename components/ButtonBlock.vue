<template lang="pug">
.button-section
  .button-block
    nuxt-link(:to="button" v-for="button, index in buttons" :key="button").button-block__button
      .button-content 
        span.button-text {{ button }} 
        span.button-arrow-wrapper
          Arrow
  .tickets-button-wrapper(ref="ticketsButtonWrapper")
    a(:href="ticketLink" target="_blank").tickets-button
      span.tickets-button__text Buy Tickets&nbsp;&#8599;
    .triangles

      
</template>

<script>

export default {
  data() {
    return {
      buttonWidths: [],
      buttons: ['films', 'talks', 'venues', 'schedule', 'about', 'sponsors'],
      ticketLink: 'https://www.eventbrite.com/e/2021-queer-film-festival-tickets-149202202651'
    }
  },

}
</script>