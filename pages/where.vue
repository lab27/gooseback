<template lang="pug">
  main
    h1 {{ page.heading }}
    nuxt-content.lead-text(:document="page")
</template>

<script>
export default {
  head() {
    return {
      title: 'Venues',
      bodyAttrs: {
        class: 'page-venues'
      }
    }
  },
  async asyncData({ $content }) {
    const page = await $content('pages/where').fetch()
    return { page }
  }
}
</script>