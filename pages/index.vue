<template lang="pug">
main.relative.min-h-screen.overflow-hidden
  .video-background-container
    iframe(
      src="https://player.vimeo.com/video/1075508239?background=1&autoplay=1&loop=1&muted=1&transparent=0&app_id=58479"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
      class="video-background-iframe"
      title="Gåsebäck Film Festival Background Video"
    )
  .mobile-info-block.relative.z-10.flex.flex-col.items-center.justify-center.min-h-screen.text-white.p-4
    h1.text-center.mb-2.title-g Gåsebäck
      br
      span.title-ff Film Festival
    p.mobile-dates.text-center August 28 — August 31, 2025
    p.mobile-location.text-center Gåsebäck, Helsingborg
</template>

<script setup>
useHead({
  script: [{ src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' }],
  title: 'Home',
  bodyAttrs: {
    class: 'page-home'
  }
})
</script>

<style scoped>
/* Ensure text is readable over the video */
.mobile-info-block h1,
.mobile-info-block p {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.video-background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Behind content */
  overflow: hidden;
  background-color: black; /* Fallback color */
}

.video-background-iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; /* Disable interactions */

  /* Ensure the iframe is AT LEAST the size of the viewport */
  min-width: 100vw;
  min-height: 100vh;

  /* Calculate dimensions based on 1920:1446 aspect ratio (~1.3278) */
  width: 132.78vh; /* 100 * (1920/1446) */
  height: 75.31vw; /* 100 * (1446/1920) */

  /* The browser uses the MAX value between width/min-width and height/min-height. */
  /* This guarantees the viewport is always covered. */
}
</style>

