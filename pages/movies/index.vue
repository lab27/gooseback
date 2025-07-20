<template lang="pug">
  main
    header.films-header
      h1 {{ filmPage?.heading }}
    .sort-by.mb-8(v-if="filmPage?.isAnnounced")
      label Sort by:
      select(v-model="sortBy")
        option(value="title") Title
        option(value="dateTime") Screening Date
    .films-wrapper(v-if="filmPage?.isAnnounced")

      //- Features
      h2 Features
      p.lead-text {{ filmPage?.featuresDescription }}
      ul.film-grid
        li(v-for="film in featuresFilms" :key="film.slug")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(v-if="film.thumbnail" :src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ film.screenings?.[0]?.dateTime ? formattedDate(film.screenings[0].dateTime) : 'TBA' }}

      //- Shorts 1
      h2 Shorts Program 1
      p.lead-text {{ filmPage?.shorts1Description }}
      ul.film-grid
        li(v-for="film in shorts1Films" :key="film.slug")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(v-if="film.thumbnail" :src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ film.screenings?.[0]?.dateTime ? formattedDate(film.screenings[0].dateTime) : 'TBA' }}

      //- Helsingborg Program
      h2 Helsingborg Special
      p.lead-text {{ filmPage?.helsingborgDescription }}
      ul.film-grid
        li(v-for="film in helsingborgFilms" :key="film.slug")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(v-if="film.thumbnail" :src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ film.screenings?.[0]?.dateTime ? formattedDate(film.screenings[0].dateTime) : 'TBA' }}

      //- Music Program
      h2 Music Program
      p.lead-text {{ filmPage?.musicDescription }}
      ul.film-grid
        li(v-for="film in musicFilms" :key="film.slug")
          NuxtLink(:to="`/movies/${film.slug}`")
            .film-thumbnail-wrapper
              .thumbnail-arrow-wrapper
                //- img(src="/img/arrow.svg")
                Arrow
              .thumbnail-gauze
              NuxtImg(v-if="film.thumbnail" :src="staticRemover(film.thumbnail)" :alt="film.title" :placeholder="[160, 90, 10]" format="webp" fit="cover" width="1600" height="900" sizes="sm:100vw md:50vw lg:400px xl:800px" preload).thumbnail-image
            .film-details-wrapper
              span.film-title {{ film.title }}
              span.film-date {{ film.screenings?.[0]?.dateTime ? formattedDate(film.screenings[0].dateTime) : 'TBA' }}

      //- Shorts 2


    section(v-else)
      ContentDoc(path="/pages/movies")

</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useStaticRemover } from '~/composables/useStaticRemover'

interface Film {
  _path: string
  _stem: string
  slug?: string  // We'll compute this from _path
  title: string
  thumbnail: string
  program: 'features' | 'shorts1' | 'shorts2' | 'helsingborg' | 'music'
  screenings: Array<{
    dateTime: string  // Human-readable format like "Saturday, August 31 21:00"
    venue: string
  }>
}

interface FilmPage {
  heading: string
  isAnnounced: boolean
  featuresDescription: string
  shorts1Description: string
  helsingborgDescription: string
  musicDescription: string
}

useHead({
  title: 'Movies',
  bodyAttrs: {
    class: 'page-movies'
  }
})

const { staticRemover } = useStaticRemover()
const sortBy = ref('title')

// Fetch data
const { data: films } = await useAsyncData('films', () =>
  queryContent<Film>('films').find()
)

const { data: filmPage } = await useAsyncData('filmPage', () =>
  queryContent<FilmPage>('pages/movies').findOne()
)

// Computed
const sortedFilms = computed(() => {
  try {
    if (!films.value) return []

    // Filter out any undefined films and ensure they have required properties
    const validFilms = films.value.filter((film): film is Film => 
      film !== null && 
      film !== undefined &&
      typeof film._path === 'string' && 
      typeof film.title === 'string' && 
      typeof film.program === 'string' && 
      Array.isArray(film.screenings) && 
      film.screenings.length > 0
    ).map(film => ({
      ...film,
      slug: film._path.split('/').pop() || film._stem?.split('/').pop() || 'unknown'
    }))

    if (sortBy.value === 'dateTime') {
      return [...validFilms].sort((a, b) => {
        try {
          // Parse dates using the same logic as formattedDate function
          const parseDate = (dateString: string) => {
            let date = new Date(dateString)
            if (isNaN(date.getTime())) {
              const parts = dateString.match(/(\w+),?\s+(\w+)\s+(\d{1,2})\s+(\d{1,2}):(\d{2})/)
              if (parts) {
                const [, dayName, monthName, day, hour, minute] = parts
                const currentYear = new Date().getFullYear()
                const dateStr = `${monthName} ${day}, ${currentYear} ${hour}:${minute}:00`
                date = new Date(dateStr)
              }
            }
            return date.getTime() || 0
          }
          
          return parseDate(a.screenings[0].dateTime) - parseDate(b.screenings[0].dateTime)
        } catch (error) {
          console.warn('Error sorting by date:', error)
          return 0
        }
      })
    }

    // Default to title sorting
    return [...validFilms].sort((a, b) =>
      a.title.localeCompare(b.title)
    )
  } catch (error) {
    console.error('Error in sortedFilms computed:', error)
    return []
  }
})

const featuresFilms = computed(() => {
  return sortedFilms.value.filter(film => film.program === 'features')
})

const shorts1Films = computed(() => {
  return sortedFilms.value.filter(film => film.program === 'shorts1')
})

const shorts2Films = computed(() => {
  return sortedFilms.value.filter(film => film.program === 'shorts2')
})

const helsingborgFilms = computed(() => {
  return sortedFilms.value.filter(film => film.program === 'helsingborg')
})

const musicFilms = computed(() => {
  return sortedFilms.value.filter(film => film.program === 'music')
})

// Methods
const formattedDate = (dateString: string) => {
  // Handle the format: "Saturday, August 31 21:00" or "Sunday, September 01 18:00"
  try {
    if (!dateString || typeof dateString !== 'string') {
      return 'TBA'
    }

    // First try to parse as-is (in case it's already a valid date string)
    let date = new Date(dateString)
    
    // If that fails, try to parse the custom format
    if (isNaN(date.getTime())) {
      // Parse format like "Saturday, August 31 21:00"
      const parts = dateString.match(/(\w+),?\s+(\w+)\s+(\d{1,2})\s+(\d{1,2}):(\d{2})/)
      if (parts) {
        const [, dayName, monthName, day, hour, minute] = parts
        // Create a date string that JavaScript can parse
        // Assuming current year since it's not specified
        const currentYear = new Date().getFullYear()
        const dateStr = `${monthName} ${day}, ${currentYear} ${hour}:${minute}:00`
        date = new Date(dateStr)
      }
    }
    
    // If still invalid, return the original string
    if (isNaN(date.getTime())) {
      return dateString
    }
    
    return format(date, 'dd.MM HH:mm')
  } catch (error) {
    console.warn('Error formatting date:', error, 'for input:', dateString)
    // If all parsing fails, return the original string or fallback
    return dateString || 'TBA'
  }
}
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

.film-grid {
  margin-bottom: 4rem;
}

h2 span {
  display: inline-block;
}
h2 span.flop {
  transform: scaleX(-1);
}

h2 span.flip {
  transform: scaleY(-1) translateY(-1px) translateX(1px);
}

.film-details-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.films-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
</style>
