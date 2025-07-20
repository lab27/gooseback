<template lang="pug">
main.page-when
  h1 {{ page?.heading }}
  ContentDoc(path="/pages/when" v-if="page.isAnnounced").lead-text
  p.lead-text(v-else) More info on our schedule is coming soon.
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
