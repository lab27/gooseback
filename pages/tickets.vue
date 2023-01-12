<template lang="pug">
  main
    h1 {{ page.heading }}
    .tickets-grid
      nuxt-content(:document="page")
      a(:href="page.link" target="_blank" ref="button").tickets-button
        span.tickets-button__text Buy Tickets&nbsp;&#8599;
</template>

<script>
export default {
  async asyncData({ $content }) {
    const page = await $content('pages/tickets').fetch()
    return { page }
  },
  data() {
    return {
      buttonPos: { x: 0, y: 0 },
      buttonSize: { width: 0, height: 0 }
    };
  },
  computed: {
    buttonTransform() {
      return `translate(${this.buttonPos.x}px, ${this.buttonPos.y}px)`;
    }
  },
  mounted() {
    this.buttonSize = {
      width: this.$refs.button.clientWidth,
      height: this.$refs.button.clientHeight
    };
  },  
  methods: {
    updateButtonPosition(event) {
      let pos = {
        x: event.clientX - event.target.offsetLeft,
        y: 0
      };
      this.buttonPos = pos;
      console.log(this.buttonPos.x);
    }
  },

}
</script>