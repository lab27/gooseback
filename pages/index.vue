<template lang="pug">
  main
    .tower-wrapper.cols-12
      img(src="/img/tower.svg", alt="Gåsebäck Film Festival Hero Image")
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  place-content: center;
  pointer-events: none;
}

.tower-wrapper img {
  height: 70vh;
}
</style>

