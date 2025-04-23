
<template lang="pug">
  main
    h1 {{ page?.heading }}
    .tickets-grid
      ContentDoc(path="/pages/helskitchen").mb-12

      a(href="https://docs.google.com/forms/d/e/1FAIpQLSd1Pe3QpoSFk9iqCBf-QeXC7OvPCrkwzSqfgPBV_Tkqg4cr2g/viewform?usp=header" target="_blank" ref="buttonRef").tickets-button
        span.tickets-button__text Apply here&nbsp;&#8599;
</template>


<script setup lang="ts">
useHead({
  title: 'Hel\'s Kitchen',
  bodyAttrs: {
    class: 'page-helskitchen'
  }
})

const { data: page } = await useAsyncData('helskitchenPage', () =>
  queryContent<HelsKitchenPage>('pages/helskitchen').findOne()
)
</script>
