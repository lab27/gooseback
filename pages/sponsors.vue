<template lang="pug">
main
  h1 {{ page?.heading }}
  ContentDoc(path="/pages/sponsors").lead-text
  ul.sponsors-grid
    li(:key="sponsor.name" v-for="sponsor in page?.logos")
      img(:src="staticRemover(sponsor.logo)" :alt="sponsor.name")
</template>

<script setup lang="ts">
interface Sponsor {
  name: string
  logo: string
}

interface SponsorsPage {
  heading: string
  logos: Sponsor[]
}

useHead({
  title: 'Sponsors',
  bodyAttrs: {
    class: 'page-sponsors'
  }
})

const { staticRemover } = useStaticRemover()

const { data: page } = await useAsyncData('sponsorsPage', () =>
  queryContent<SponsorsPage>('pages/sponsors').findOne()
)
</script>
