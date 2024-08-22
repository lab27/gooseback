<template lang="pug">
  main
    h1 {{ page.heading }}
    nuxt-content.lead-text(:document="page")
    ul.film-grid
      li(v-for="photo in page.photos" :key="photo.photo")
        NuxtImg(:src="$staticRemover(photo.photo)" alt="A still from the photo exhibit" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image

</template>

<script>
export default {
  head() {
    return {
      title: 'Photo Exhibit',
      bodyAttrs: {
        class: 'page-photo'
      }
    }
  },
  async asyncData({ $content }) {
    const page = await $content('pages/photo').fetch()
    return { page }
  }
}
</script>
