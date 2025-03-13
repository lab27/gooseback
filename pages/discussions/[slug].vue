<template lang="pug">
  main.talk-detail
    h1 {{ talk?.title }}
    //- p {{ talk }}
    .talk-content
      .talk-stills-slider
        FilmStill(
          :filmStill="staticRemover(talk?.thumbnail || '')"
          :filmTitle="talk?.title || ''"
        ).talk-slide
      .talk-info.mb-12
        .talk-synopsis
          ContentDoc(:path="`/talks/${route.params.slug}`")
        .talk-schedule
          h2 Schedule
          .film-credits
            .film-credits-line
              span.film-credits-label Date & Time
              span.film-credits-value {{ talk?.dateTime ? formattedDate(talk.dateTime) : '' }}
            .film-credits-line
              span.film-credits-label Venue
              span.film-credits-value {{ talk?.venue }}
            .film-credits-line
              span.film-credits-label Tickets
              span.film-credits-value
                a(:href="talk?.ticketsLink" target="_blank") Buy Now&nbsp;&#8599;


</template>

<script setup lang="ts">
import { format } from 'date-fns'

interface Talk {
  title: string
  thumbnail: string
  description: string
  dateTime: string
  venue: string
  ticketsLink: string
}

const route = useRoute()
const { staticRemover } = useStaticRemover()

const { data: talk } = await useAsyncData('talk', () =>
  queryContent<Talk>('talks', route.params.slug as string).findOne()
)

useHead(() => ({
  title: talk.value?.title || 'Talk',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: talk.value?.description || ''
    }
  ]
}))

const formattedDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return format(date, 'EEEE, dd MMMM HH:mm')
}

const simplifyURL = (url: string) => {
  return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]
}
</script>
