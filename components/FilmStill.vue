<template lang="pug">
NuxtImg(:src="filmStill" :alt="filmTitle" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:50vw xl:1600px" preload)
</template>

<script setup lang="ts">
interface Props {
  filmStill: string
  filmTitle: string
}

defineProps<Props>()
</script>
