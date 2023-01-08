<template lang="pug">
.page-wrapper
  header
    Nav
  MovingTitle
  nuxt
</template>

<script>
export default {
  data() {
    return {
      isIndexPage: false,
    }
  },

  methods: {
    onIndexPageLoaded() {
      this.$gsap.to('.moving-title', {x: "50%", xPercent: -50, y: "5vh", rotate: 0, ease: 'Power2.easeInOut'})
      this.$gsap.to('.moving-title .ff', {rotation: 0, y: 0, ease: 'Power2.easeInOut'}, '-=1')
      this.$gsap.to('.moving-title .g', {rotation: 0, x:0,  y: 0, ease: 'Power2.easeInOut'}, '-=1')
    },
    onContentPageLoaded() {
      this.$gsap.to('.moving-title', {x: window.innerWidth/2 - 32, xPercent: -50, y: 44, ease: 'Power2.easeInOut'})
      this.$gsap.to('.moving-title .ff', {rotation: -90, y: "-30%", ease: 'Power2.easeInOut'}, '-=1')
      this.$gsap.to('.moving-title .g', {rotation: 0, x: "105%", ease: 'Power2.easeInOut'}, '-=1')
    }
  },
  mounted() {
    this.$gsap.defaults({ duration: 1 })
    if(this.$route.path === '/') {
      this.$nextTick(() => {
        this.onIndexPageLoaded()
      })
    } else {
      this.$nextTick(() => {
        this.onContentPageLoaded()
      })
    }
    // add resize event handler
    window.addEventListener('resize', () => {
      if(this.$route.path === '/') {
        this.$nextTick(() => {
          this.onIndexPageLoaded()
        })
      } else {
        this.$nextTick(() => {
          this.onContentPageLoaded()
        })
      }
    })
  },
  watch: {
    $route(to, from) {
      if(to.path === '/') {
        this.$nextTick(() => {
          this.onIndexPageLoaded()
        })
      } else {
        this.$nextTick(() => {
          this.onContentPageLoaded()
        })
      }
     
    },
  }
}
</script>
