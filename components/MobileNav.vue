<template lang="pug">
.mobile-nav-wrapper
  .nav-toggle(@click="showMenu = true")
    GBLogo(class="w-16")
    .nav-toggle-lines
  nav.mobile-nav(v-if="showMenu")
    .close-button(@click="showMenu = false") &times;
    ul
      li
        NuxtLink(to="/") Home
      li
        NuxtLink(to="/movies") The Movies
      li
        NuxtLink(to="/helskitchen") Hel's Kitchen
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
  list-style: none;
}

.mobile-nav ul li a {
  font-size: 2rem;
}

.nav-toggle-lines {
  width: 100%;
  height: 1rem;
  border-top: 2px solid var(--color-sky-blue);
  border-bottom: 2px solid var(--color-sky-blue);
  margin-top: 1rem;
}

</style>
