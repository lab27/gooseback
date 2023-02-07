<template lang="pug">
  main
    h1 Sponsors
    p This is the sponsors page
</template>

<script>
export default {
  head() {
    return {
      title: 'Sponsors',
      bodyAttrs: {
        class: 'page-sponsors'
      }
    }
  },
}
</script>