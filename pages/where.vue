<template lang="pug">
  main
    h1 {{ page.heading }}
    nuxt-content.lead-text(:document="page")
</template>

<script>
export default {
  async asyncData({ $content }) {
    const page = await $content('pages/where').fetch()
    return { page }
  }
}
</script>