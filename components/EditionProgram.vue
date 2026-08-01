<template lang="pug">
.films-wrapper
  template(v-if="hasSections")
    template(v-for="section in populatedSections" :key="section.program")
      h2 {{ section.title }}
      p.lead-text(v-if="section.description") {{ section.description }}
      FilmGrid(:films="section.films")
  FilmGrid(v-else :films="films")
</template>

<script setup lang="ts">
interface Section {
  title: string
  program: string
  description?: string
}

interface Edition {
  sections?: Section[]
}

interface Film {
  _path: string
  title: string
  program?: string
  [key: string]: any
}

const props = defineProps<{ edition: Edition | null, films: Film[] }>()

const hasSections = computed(() => (props.edition?.sections?.length ?? 0) > 0)

/**
 * Sections with no films are dropped rather than rendered as an empty heading —
 * program line-ups differ per edition (2023 has none at all, 2024 had no music program).
 */
const populatedSections = computed(() =>
  (props.edition?.sections ?? [])
    .map(section => ({
      ...section,
      films: props.films.filter(film => film.program === section.program)
    }))
    .filter(section => section.films.length > 0)
)
</script>

<style scoped>
.films-wrapper h2 {
  font-size: 2rem;
  margin-bottom: .5rem;
}

.films-wrapper p.lead-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.films-wrapper :deep(.film-grid) {
  margin-bottom: 4rem;
}
</style>
