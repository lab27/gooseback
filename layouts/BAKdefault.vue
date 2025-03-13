<template lang="pug">
.page-wrapper
  header
    Nav
  MovingTitle
  slot
  MetaBlock
  //- ButtonBlock
  Footer
  //- Ruler
  Transition(name="fade")
    MobileNav(v-if="isMobile")
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const route = useRoute()
const isMobile = ref(false)

// GSAP animations
const onIndexPageLoaded = () => {
  const tl = gsap.timeline()
  tl.to('.moving-title', {
    x: "50%",
    xPercent: -50,
    y: "5vh",
    rotate: 0,
    ease: 'Power2.easeInOut',
    duration: 1
  })
  .to('.moving-title .ff', {
    rotation: 0,
    y: 0,
    ease: 'Power2.easeInOut',
    duration: 1
  }, '<')
  .to('.moving-title .g', {
    rotation: 0,
    x: 0,
    y: 0,
    ease: 'Power2.easeInOut',
    duration: 1
  }, '<')
}

const onContentPageLoaded = () => {
  const tl = gsap.timeline()
  tl.to('.moving-title', {
    x: window.innerWidth/2 - 32,
    xPercent: -50,
    y: 52,
    ease: 'Power2.easeInOut',
    duration: 1
  })
  .to('.moving-title .ff', {
    rotation: -90,
    y: "-30%",
    ease: 'Power2.easeInOut',
    duration: 1
  }, '<')
  .to('.moving-title .g', {
    rotation: 0,
    x: "105%",
    ease: 'Power2.easeInOut',
    duration: 1
  }, '<')
}

// Lifecycle hooks
onMounted(() => {
  // Initial animations
  nextTick(() => {
    if (route.path === '/') {
      onIndexPageLoaded()
    } else {
      onContentPageLoaded()
    }
  })

  // Mobile check
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1000
  }
  checkMobile()

  // Event listeners
  const handleResize = () => {
    checkMobile()
    nextTick(() => {
      if (route.path === '/') {
        onIndexPageLoaded()
      } else {
        onContentPageLoaded()
      }
    })
  }
  window.addEventListener('resize', handleResize)

  // Clean up
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

// Route watcher
watch(route, (to) => {
  nextTick(() => {
    if (to.path === '/') {
      onIndexPageLoaded()
    } else {
      onContentPageLoaded()
    }
  })
})
</script>
