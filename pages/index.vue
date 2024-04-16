<template lang="pug">
main
  //- .sky.sky-bg1
  //- .sky.sky-bg2
  //- .sky.sky-bg3
  //- .horizon
  .mobile-info-block.mt-12
    h1.text-center.mb-2.title-g Gåsebäck
      br
      span.title-ff Film Festival
    p.mobile-dates.text-center August 30 — September 1, 2023
    p.mobile-location.text-center Gåsebäck, Helsingborg
    //- img(src="/img/ok-hand-film.svg", alt="Film Reel Hand Illustration").m-auto
</template>

<script>
export default {
  head () {
    return {
      script: [{ src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' }],
      title: 'Home',
      bodyAttrs: {
        class: 'page-home'
      }
    }
  },
  mounted() {
    // console.log('index page mounted');
    this.$emit('indexPageLoaded')
  }
}
</script>

