<template lang="pug">
  main
    .tower-wrapper.cols-12
      img(src="/img/tower.svg", alt="Gåsebäck Film Festival Hero Image")
    .mobile-info-block.mt-12
      h1.text-center.mb-2 Gåsebäck
        br
        | Film Festival
      p.mobile-dates.text-center March 31 — April 2, 2023
      p.mobile-location.text-center Gåsebäck, Helsingborg
    img(src="/img/ok-hand-film.svg", alt="Film Reel Hand Illustration").m-auto
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

<style>
.tower-wrapper {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: fit-content;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  place-content: center;
  pointer-events: none;
}

.tower-wrapper img {
  @apply m-0 lg:my-20;
  height: 70vh;
}
</style>

