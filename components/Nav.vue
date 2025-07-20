<template lang="pug">
  nav
    ul
      li.logo-wrapper
        NuxtLink(to="/")
          GBLogo
      li
        NuxtLink(to="/movies") The Movies
      li
        NuxtLink(to="/helskitchen") Hel's Kitchen
      li
        NuxtLink(to="/photo") Music Video Workshop
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

<style>
nav ul {
  text-align: right;
  font-size: 1rem;
}

</style>
