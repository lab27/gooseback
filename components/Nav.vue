<template lang="pug">
  nav
    ul
      li.logo-wrapper
        nuxt-link(to="/")
          img(src="/img/gff-logo.svg", alt="GFF Logo")
      li
        nuxt-link(to="/movies") The Movies
      li
        nuxt-link(to="/photo") Photo Exhibit
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

<style>
nav ul {
  text-align: right;
  font-size: 1rem;
}
</style>
