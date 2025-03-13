<template lang="pug">
.mobile-nav-wrapper
  .nav-toggle(@click="showMenu = true")
    img(src="/img/gff-logo.svg", alt="GFF Logo")
  nav.mobile-nav(v-if="showMenu")
    .close-button(@click="showMenu = false") &times;
    ul
      li
        NuxtLink(to="/") Home
      li
        NuxtLink(to="/movies") The Movies
      li
        NuxtLink(to="/discussions") Discussions
      li
        NuxtLink(to="/when") When
      li
        NuxtLink(to="/where") Where
      li
        NuxtLink(to="/sponsors") Sponsors
      li
        NuxtLink(to="/about") A Bit About
      li
        NuxtLink(to="/tickets") Get Tix
</template>

<script setup lang="ts">
const showMenu = ref(false)
const route = useRoute()

watch(route, () => {
  showMenu.value = false
})
</script>

<style>
.mobile-nav-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}

.mobile-nav-wrapper .nav-toggle {
  position: fixed;
  top: 3rem;
  right: 2rem;
  cursor: pointer;
}

.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 9999;
  padding: 2rem;
  display: grid;
  place-content: center;
}

.mobile-nav ul {
  text-align: center;
}

.mobile-nav .close-button {
  position: fixed;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  top: 0;
  right: 2rem;
  font-size: 4rem;
  font-weight: 200;
  cursor: pointer;
}

.mobile-nav ul li {
  margin-bottom: 1rem;
}

.mobile-nav ul li a {
  font-size: 2rem;
}
</style>
