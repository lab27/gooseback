<template lang="pug">
  nav
    ul
      li.logo-wrapper
        NuxtLink(to="/")
          img(src="/img/gff-logo.svg", alt="GFF Logo")
      li
        NuxtLink(to="/movies") The Movies
      li
        NuxtLink(to="/helskitchen") Hel's Kitchen
      li
        NuxtLink(to="/photo") Photo Exhibit
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
// Component is stateless, no setup needed
</script>

<style>
nav ul {
  text-align: right;
  font-size: 1rem;
}
</style>
