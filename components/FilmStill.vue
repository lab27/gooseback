<template lang="pug">
nuxt-img(:src="filmStill" :alt="filmTitle" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:50vw xl:1600px" preload)
</template>

<script>
export default {
  props: {
    filmStill: {
      type: String,
      required: true
    },
    filmTitle: {
      type: String,
      required: true
    }
  }
}
</script>