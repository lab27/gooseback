<template lang="pug">
  main
    h1 {{ page.heading }}
    nuxt-content(:document="page").lead-text
    ul.sponsors-grid
      li(:key="sponsor.name" v-for="sponsor in page.logos")
        img(:src="$staticRemover(sponsor.logo)" :alt="sponsor.name")
</template>

<script>
export default {
  head() {
    return {
      title: 'Sponsors',
      bodyAttrs: {
        class: 'page-sponsors'
      }
    }
  },
  async asyncData({ $content }) {
    const page = await $content('pages/sponsors').fetch()
    return { page }
  }
}
</script>