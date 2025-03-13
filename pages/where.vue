<template lang="pug">
main
  h1 {{ page?.heading }}
  ContentDoc(path="/pages/where").lead-text
</template>

<script setup lang="ts">
interface WherePage {
  heading: string
}

useHead({
  title: 'Venues',
  bodyAttrs: {
    class: 'page-venues'
  }
})

const { data: page } = await useAsyncData('wherePage', () =>
  queryContent<WherePage>('pages/where').findOne()
)
</script>
