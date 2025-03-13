<template lang="pug">
.button-section
  .button-block
    NuxtLink(:to="`/${button}`" v-for="button in buttons" :key="button").button-block__button
      .button-content
        span.button-text {{ button }}
        span.button-arrow-wrapper
          Arrow
  .tickets-button-wrapper(ref="ticketsButtonWrapper" v-if="route.path !== '/tickets'")
    NuxtLink(to="/tickets").tickets-button
      span.tickets-button__text Buy Tickets&nbsp;&#8599;
    .triangles
</template>

<script setup lang="ts">
const route = useRoute()

const buttons = ref([
  'films',
  'talks',
  'venues',
  'schedule',
  'about',
  'sponsors'
])

const ticketsButtonWrapper = ref<HTMLElement | null>(null)
const ticketLink = ref('https://www.eventbrite.com/e/2021-queer-film-festival-tickets-149202202651')
</script>

<style scoped>
/* Keep existing styles */
</style>
