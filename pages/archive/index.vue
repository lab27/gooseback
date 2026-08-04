<template lang="pug">
  main
    h1 The Archive
    ul.archive-list
      li.archive-row(v-for="edition in editions" :key="edition.year")
        NuxtLink(:to="`/movies/${edition.year}`")
          .archive-thumbnail
            .thumbnail-gauze
            NuxtImg(v-if="edition.image" :src="staticRemover(edition.image)" :alt="`${edition.year} festival`" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="800" height="450" sizes="sm:40vw md:30vw lg:240px").thumbnail-image
          .archive-details
            .archive-year
              span {{ edition.year }}
            .archive-meta {{ edition.dates }} · {{ edition.filmCount }} films
          .archive-arrow
            Arrow
</template>

<script setup lang="ts">
import { useStaticRemover } from '~/composables/useStaticRemover'

interface Edition {
  year: number
  dates?: string
  featuredImage?: string
}

interface Film {
  _path: string
  year: number
  thumbnail?: string
}

useHead({
  title: 'Archive',
  bodyAttrs: {
    class: 'page-archive'
  }
})

const { staticRemover } = useStaticRemover()

const { data: editionDocs } = await useAsyncData('editions', () =>
  queryContent<Edition>('editions').find()
)

const { data: films } = await useAsyncData('all-films', () =>
  queryContent<Film>('films').find()
)

const { data: settings } = await useAsyncData('settings-archive', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

/**
 * The archive is strictly past editions: year < currentEdition. The current edition is
 * the live programme and belongs at /movies, not filed under history; a future edition is
 * a draft being prepared in the CMS and must not be advertised at all (its page stays
 * reachable by direct link for previewing).
 *
 * This keeps one definition of "archived" — before the current edition — shared with the
 * programme page, which uses it to decide whether `isAnnounced` still applies.
 */
const editions = computed(() =>
  [...(editionDocs.value ?? [])]
    .filter(edition => !settings.value?.currentEdition || edition.year < settings.value.currentEdition)
    .sort((a, b) => b.year - a.year)
    .map(edition => {
      const yearFilms = (films.value ?? []).filter(film => film.year === edition.year)
      return {
        year: edition.year,
        dates: edition.dates ?? '',
        filmCount: yearFilms.length,
        // Fall back to the first film's still when an edition has no chosen image.
        image: edition.featuredImage ?? yearFilms.find(f => f.thumbnail)?.thumbnail ?? '',
      }
    })
)
</script>

<style scoped>
.archive-list {
  margin-top: 2rem;
}

.page-wrapper .archive-list li {
  margin-left: 0;
  list-style: none;
}

.archive-row a {
  display: grid;
  grid-template-columns: 12rem 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 2px solid var(--color-sky-blue);
}

.archive-thumbnail {
  position: relative;
  overflow: hidden;
}

.archive-year {
  display: flex;
  align-items: baseline;
  gap: .75rem;
  font-size: 2.5rem;
  line-height: 1;
}

.archive-meta {
  margin-top: .5rem;
  font-size: 1rem;
}

.archive-arrow {
  width: 3rem;
}

.archive-row a:hover .thumbnail-gauze {
  opacity: .1;
}

@media (max-width: 640px) {
  .archive-row a {
    grid-template-columns: 6rem 1fr;
    gap: 1rem;
  }

  .archive-arrow {
    display: none;
  }

  .archive-year {
    font-size: 1.75rem;
  }
}
</style>
