<template lang="pug">
  main.page-when
    h1 {{ page.heading }}
    nuxt-content.lead-text(:document="page")
</template>

<script>
export default {
  head() {
    return {
      title: 'Schedule',
      bodyAttrs: {
        class: 'page-schedule'
      }
    }
  },
  async asyncData({ $content }) {
    const page = await $content('pages/when').fetch()
    return { page }
  }
}
</script>