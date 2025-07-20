<template lang="pug">
  main
    h1 {{ page?.heading }}
    .about-grid
      ContentDoc(path="/pages/about").lead-text
    .staff-grid
      .staff-member(v-for="person in page?.staff")
        .staff-member__image-wrapper
          nuxt-img(:src="staticRemover(person.thumbnail)" :alt="person.name" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).staff-member__image
        .staff-member__text-wrapper
          p.staff-member__name {{ person.name }}
          p.staff-member__role {{ person.role }}
          p.staff-member__contact
            a(:href="`mailto:${person.email}`")
              span.email {{ person.email }}
              span.external &nbsp;&#8599;
</template>

<script setup>
useHead({
  title: 'About',
  bodyAttrs: {
    class: 'page-about'
  }
})

const { data: page } = await useAsyncData('about', () =>
  queryContent('pages/about').findOne()
)

const staticRemover = (path) => path.replace('/public', '')
</script>
