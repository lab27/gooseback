<template lang="pug">
.mobile-nav-wrapper
  .nav-toggle(@click="showMenu = true")
    img(src="/img/gff-logo.svg", alt="GFF Logo")
  nav.mobile-nav(v-if="showMenu")
    .close-button(@click="showMenu = false") &times;
    ul
      li
        nuxt-link(to="/") Home
      li
        nuxt-link(to="/movies") The Movies
      li
        nuxt-link(to="/discussions") Discussions
      li
        nuxt-link(to="/when") When
      li
        nuxt-link(to="/where") Where
      li
        nuxt-link(to="/sponsors") Sponsors
      li
        nuxt-link(to="/about") A Bit About
      li
        nuxt-link(to="/tickets") Get Tix

</template>

<script>
export default {
  data() {
    return {
      showMenu: false
    }
  },
  // watch the route and change the showMenu value
  watch: {
    $route() {
      this.showMenu = false
    }
  }
}
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