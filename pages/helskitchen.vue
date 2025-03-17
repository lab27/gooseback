<template lang="pug">
  main
    h1 Hel's Kitchen
    p.lead-text Hel's Kitchen is our new independent film market. More info to follow!
    br
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
</script>
