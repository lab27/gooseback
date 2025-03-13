<template lang="pug">
  main
    h1 {{ page?.heading }}
    ContentDoc(path="/pages/photo").lead-text
    ul.film-grid
      li(v-for="photo in page?.photos" :key="photo.photo")
        NuxtImg(:src="staticRemover(photo.photo)" alt="A still from the photo exhibit" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
</template>

<script setup lang="ts">
import { useStaticRemover } from '~/composables/useStaticRemover'
interface Photo {
  photo: string
}

interface PhotoPage {
  heading: string
  photos: Photo[]
}

useHead({
  title: 'Photo Exhibit',
  bodyAttrs: {
    class: 'page-photo'
  }
})

const { staticRemover } = useStaticRemover()

const { data: page } = await useAsyncData('photoPage', () =>
  queryContent<PhotoPage>('pages/photo').findOne()
)
</script>
