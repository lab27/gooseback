<template lang="pug">
  main
    h1 Talks
    ul.film-grid
      li(v-for="talk in talks")
        nuxt-link(:to="`/talks/${talk.slug}`")
          .film-thumbnail-wrapper
            .thumbnail-arrow-wrapper
              //- img(src="/img/arrow.svg")
              Arrow
            .thumbnail-gauze
            nuxt-img(:src="$staticRemover(talk.thumbnail)" :alt="talk.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
          p.film-title {{ talk.title }}
    ButtonBlock
</template>

<script>
export default {
  async asyncData({ $content }) {
    const talks = await $content('talks').fetch()
    return { talks }
  }
}
</script>