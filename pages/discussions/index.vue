<template lang="pug">
  main
    h1 {{ discussionsPage?.heading }}
    ContentDoc(path="/pages/discussions").lead-text
    ul.film-grid(v-if="talks?.isAnnounced")
      li(v-for="talk in talks" :key="talk.slug")
        NuxtLink(:to="`/talks/${talk.slug}`")
          .film-thumbnail-wrapper
            .thumbnail-arrow-wrapper
              //- img(src="/img/arrow.svg")
              Arrow
            .thumbnail-gauze
            NuxtImg(:src="staticRemover(talk.thumbnail)" :alt="talk.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
          p.film-title {{ talk.title }} / {{ talk.dateTime }}
</template>

<script setup lang="ts">
import { useStaticRemover } from '~/composables/useStaticRemover'
interface Talk {
  slug: string
  title: string
  thumbnail: string
  dateTime: string
}

interface DiscussionsPage {
  heading: string
  isAnnounced: boolean
}

useHead({
  title: 'Talks',
  bodyAttrs: {
    class: 'page-talks'
  }
})

const { staticRemover } = useStaticRemover()

const { data: talks } = await useAsyncData('talks', () =>
  queryContent<Talk>('talks').find()
)

const { data: discussionsPage } = await useAsyncData('discussionsPage', () =>
  queryContent<DiscussionsPage>('pages/discussions').findOne()
)
</script>
