<template lang="pug">
  main
    h1 {{ discussionsPage.heading }}
    nuxt-content.lead-text(:document="discussionsPage")
    ul.film-grid(v-if="talks.isAnnounced")
      li(v-for="talk in talks")
        nuxt-link(:to="`/talks/${talk.slug}`")
          .film-thumbnail-wrapper
            .thumbnail-arrow-wrapper
              //- img(src="/img/arrow.svg")
              Arrow
            .thumbnail-gauze
            nuxt-img(:src="$staticRemover(talk.thumbnail)" :alt="talk.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
          p.film-title {{ talk.title }} / {{ talk.dateTime }}
</template>

<script>
export default {
    head() {
    return {
      title: 'Talks',
      bodyAttrs: {
        class: 'page-talks'
      }
    }
  },
  async asyncData({ $content }) {
    const talks = await $content('talks').fetch()
    const discussionsPage = await $content('pages/discussions').fetch()
    return { talks, discussionsPage }
  }
}
</script>