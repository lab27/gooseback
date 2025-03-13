<template lang="pug">
main.page-when
  h1 {{ page?.heading }}
  ContentDoc(path="/pages/when").lead-text
  Calendar
</template>

<script setup lang="ts">
interface WhenPage {
  heading: string
}

useHead({
  title: 'Schedule',
  bodyAttrs: {
    class: 'page-schedule'
  }
})

const { data: page } = await useAsyncData('whenPage', () =>
  queryContent<WhenPage>('pages/when').findOne()
)
</script>
