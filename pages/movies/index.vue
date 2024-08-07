<template lang="pug">
  main
    h1 {{ filmPage.heading }}
    .films-wrapper(v-if="filmPage.isAnnounced")

      //- Features
      h2 Features
      p.lead-text {{ filmPage.featuresDescription }}
      ul.film-grid
        li(v-for="film in films" :key="film.slug" v-if="film.program === 'features'")
          nuxt-link(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(:src="$staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            p.film-title {{ film.title }}

      //- Shorts 1
      h2 Shorts Program 1
      p.lead-text {{ filmPage.shorts1Description }}
      ul.film-grid
        li(v-for="film in films" :key="film.slug" v-if="film.program === 'shorts1'")
          nuxt-link(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(:src="$staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            p.film-title {{ film.title }}

      //- Shorts 2
      h2
        span.flop R
        span E
        span S
        span I
        span S
        span T
        span.flip A
        span N
        span C
        span.flop E
      p.lead-text {{ filmPage.shorts1Description }}
      ul.film-grid
        li(v-for="film in films" :key="film.slug" v-if="film.program === 'shorts2'")
          nuxt-link(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(:src="$staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            p.film-title {{ film.title }}


    section(v-else)
      nuxt-content(:document="filmPage").lead-text

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

<style scoped>
.films-wrapper h2 {
  font-size: 2rem;
  margin-bottom: .5rem;
}

.films-wrapper p.lead-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.film-grid {
  margin-bottom: 4rem;
}

h2 span {
  display: inline-block;
}
h2 span.flop {
  transform: scaleX(-1);
}

h2 span.flip {
  transform: scaleY(-1) translateY(-1px) translateX(1px);
}
</style>
