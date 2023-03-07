<template lang="pug">
  main
    .tower-wrapper.cols-12
      TowerRays
    .mobile-info-block.mt-12
      h1.text-center.mb-2 Gåsebäck
        br
        | Film Festival
      p.mobile-dates.text-center March 31 — April 2, 2023
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

#red {
  animation: redflash 5s linear infinite;
}

.ray1 {
  animation: rayflash1 5s 0.1s linear infinite;
}

.ray2 {
  animation: rayflash1 5s linear infinite;
}

.ray3 {
  animation: rayflash3 5s linear infinite;
}

.ray4 {
  animation: rayflash4 5s 0.2s linear infinite;
}

.ray5 {
  animation: rayflash4 5s 0.25s linear infinite;
}

.ray6, .ray7 {
  animation: rayflash6 5s 0.25s linear infinite;
}

.ray7 {
  animation-delay: 300ms;
}


@keyframes redflash {
  5% {
    opacity: 1;
  }

  10% {
    opacity: 1;
  }

  20% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}

@keyframes rayflash1 { 
  0% { 
    stroke-dasharray: 100 538;
    stroke-dashoffset: 94;
  }

  10% {
    stroke-dasharray: 50 538;
    stroke-dashoffset: -538;
    opacity: 1;
  }

  100% {
    stroke-dasharray: 50 538;
    stroke-dashoffset: -538;
    opacity: 0;
  }
}

@keyframes rayflash3 {
  0% {
    stroke-dasharray: 100 330;
    stroke-dashoffset: 94;
  }

  8% {
    stroke-dasharray: 30 330;
    stroke-dashoffset: -330;
    opacity: 1;
  }

  100% {
    stroke-dasharray: 30 330;
    stroke-dashoffset: -330;
    opacity: 0;
  }
}

@keyframes rayflash4 {
  0% {
    stroke-dasharray: 200 1261;
    stroke-dashoffset: 94;
  }

  10% {
    stroke-dasharray: 30 1261;
    stroke-dashoffset: -1261;
    opacity: 1;
  }

  100% {
    stroke-dasharray: 30 1261;
    stroke-dashoffset: -1261;
    opacity: 0;
  }
}

@keyframes rayflash6 {
  0% {
    stroke-dasharray: 200 1225;
    stroke-dashoffset: 94;
  }

  10% {
    stroke-dasharray: 30 1225;
    stroke-dashoffset: -1225;
    opacity: 1;
  }

  100% {
    stroke-dasharray: 30 1225;
    stroke-dashoffset: -1225;
    opacity: 0;
  }
}
</style>

