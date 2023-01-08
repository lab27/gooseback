<template lang="pug">
  nav
    ul
      li.mb-12
        nuxt-link(to="/")
          img(src="/img/gff-logo.svg", alt="GFF Logo")
      li
        nuxt-link(to="/films") Films
      li
        nuxt-link(to="/talks") Talks
      li
        nuxt-link(to="/schedule") Schedule
      li
        nuxt-link(to="/venues") Venues
      li
        nuxt-link(to="/sponsors") Sponsors
      li
        nuxt-link(to="/about") About
      li
        a(href="https://ticketmaster.com" target="_blank").external_link Tickets

</template>

<style>
nav ul {
  text-align: right;
  font-size: 1rem;
}
</style>