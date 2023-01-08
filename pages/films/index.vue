<template lang="pug">
  main
    h1 Films
    ul.film-grid
      li(v-for="film in films")
        nuxt-link(:to="`/films/${film.slug}`")
          .film-thumbnail-wrapper
            .thumbnail-arrow-wrapper
              img(src="/img/arrow.svg")
            .thumbnail-gauze
            nuxt-img(:src="$staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            //- nuxt-img(:src="film.filmStills" :alt="film.title" :placeholder="[160,90, 10]" format="webp" fit="cover" width="800" height="450").thumbnail-image
          p.film-title {{ film.title }}
</template>

<script>
export default {
  async asyncData({ $content }) {
    const films = await $content('films').fetch()
    return { films }
  }
}
</script>