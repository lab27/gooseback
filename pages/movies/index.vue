<script setup lang="ts">
/**
 * /movies is the permanent, never-changing entry point for "this year's program" — it is
 * what the nav links to and what any printed or externally shared link points at. It
 * forwards to the current edition's own URL, which is the canonical page for that program.
 *
 * The redirect is deliberately 302, never 301. The target changes every year, and a 301
 * is cached by browsers indefinitely — anyone who hit /movies during the 2026 festival
 * would still be sent to /movies/2026 in 2027, with no way for us to correct it.
 */
const { data: settings } = await useAsyncData('settings-movies-root', () =>
  queryContent<{ currentEdition: number }>('settings').findOne()
)

const currentEdition = settings.value?.currentEdition

if (!currentEdition) {
  throw createError({
    statusCode: 500,
    statusMessage: 'No currentEdition set in content/settings.yml',
    fatal: true
  })
}

await navigateTo(`/movies/${currentEdition}`, { redirectCode: 302, replace: true })
</script>

<template lang="pug">
  main
</template>
