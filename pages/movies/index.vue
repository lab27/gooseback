<template lang="pug">
  main
    h1 The Movies
    nuxt-content.lead-text(:document="filmPage")
    ul.film-grid
      li(v-for="film in films")
        nuxt-link(:to="`/movies/${film.slug}`")
          .film-thumbnail-wrapper
            .thumbnail-arrow-wrapper
              //- img(src="/img/arrow.svg")
              Arrow
            .thumbnail-gauze
            nuxt-img(:src="$staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
          p.film-title {{ film.title }}
</template>

<script>
export default {
  head() {
    return {
      title: 'Movies',
      bodyAttrs: {
        class: 'page-movies'
      }
    }
  },
  async asyncData({ $content }) {
    const films = await $content('films').fetch()
    const filmPage = await $content('pages/movies').fetch()
    return { films, filmPage }
  }
}
</script>