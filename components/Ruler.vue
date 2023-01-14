<template lang="pug">
  .rulers
    p.top-credit GSBK FILM FESTIVAL MMXXIII
    .ruler-container.ruler-container-top
      .ruler
    .ruler-container.ruler-container-bottom
      .ruler
</template>

<script>
export default {
  name: 'Ruler',
  methods: {
    drawRuler() {
      const topRulerContainer = document.querySelector(".rulers .ruler-container-top");
      const bottomRulerContainer = document.querySelector(".rulers .ruler-container-bottom");
      topRulerContainer.innerHTML = ""
      bottomRulerContainer.innerHTML = ""

      const markerWidth = 1;
      const markerHeight = 8;
      const markerSpacing = 5;

      // const markerCount = Math.floor(topRulerContainer.clientWidth / markerSpacing);
      const markerCount = 100;

      let markerCounter = 0;

      for (let i = 0; i < markerCount; i++) {
        // Create top marker
        const topMarker = document.createElement("div");
        topMarker.style.width = `${markerWidth}px`;
        topMarker.style.position = "absolute";
        topMarker.style.top = `-${(markerHeight / 2) - 24}px`;
        topMarker.style.left = `${i * markerSpacing}px`;

        // Create bottom marker
        const bottomMarker = document.createElement("div");
        bottomMarker.style.width = `${markerWidth}px`;
        bottomMarker.style.position = "absolute";
        bottomMarker.style.bottom = `-${markerHeight / 2}px`;
        bottomMarker.style.left = `${i * markerSpacing}px`;

        if (markerCounter % 5 === 0) {
          topMarker.style.height = `${markerHeight * 1.5}px`;
          topMarker.style.background = "var(--c-black)";
          bottomMarker.style.height = `${markerHeight * 2}px`;
          bottomMarker.style.background = "var(--c-black)";
        } else if (markerCounter % 10 === 0) {
          topMarker.style.height = `${markerHeight * 2}px`;
          topMarker.style.background = "var(--c-black)";
          bottomMarker.style.height = `${markerHeight}px`;
          bottomMarker.style.background = "var(--c-black)";
        } else {
          topMarker.style.height = `${markerHeight}px`;
          topMarker.style.background = "var(--c-black)";
          bottomMarker.style.height = `${markerHeight}px`;
          bottomMarker.style.background = "var(--c-black)";
        }
        markerCounter++;
        topRulerContainer.appendChild(topMarker)
        bottomRulerContainer.appendChild(bottomMarker)
      }
    }
  },
  mounted() {
    this.drawRuler();
    // add resize handler
    window.addEventListener('resize', () => {
      this.drawRuler();
    })
  }
}
</script>

<style>
.rulers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.ruler-container.ruler-container-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
}

.ruler-container.ruler-container-top {
    position: absolute;
    background: url(/img/sprocket-brown.svg);
    background-repeat: repeat-x;
    background-position: -9px 9px;
      top: 0;
      padding-top: 1.5rem;
      left: 1rem;
      right: 0;
      height: 30px;
}

.top-credit {
  font-weight: 700;
  background-color: var(--background-color);
  position: absolute;
  z-index: 10;
  margin-top: 4px;
  left: 4.25rem;
  color: var(--c-brown);
  font-size: 0.8125rem;
}
</style>


