<template lang="pug">
main
  .mobile-info-block.mt-12
    h1.text-center.mb-2.title-g Gåsebäck
      br
      span.title-ff Film Festival
    p.mobile-dates.text-center August 28 — August 31, 2025
    p.mobile-location.text-center Gåsebäck, Helsingborg
</template>

<script setup>
useHead({
  script: [{ src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' }],
  title: 'Home',
  bodyAttrs: {
    class: 'page-home'
  }
})
</script>

