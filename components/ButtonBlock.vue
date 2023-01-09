<template lang="pug">
.button-section
  .button-block
    nuxt-link(:to="button" v-for="button in buttons" :key="button" @mouseenter.native="handleMouseEnter(button)" :class="button" @mouseleave.native="handleMouseLeave(button)").button-block__button
      .button-content 
        //- (@mouseenter="handleMouseEnter(button)" @mouseleave="handleMouseLeave(button)")
        span.button-text {{ button }}
        span.button-arrow-wrapper
          Arrow
  .tickets-button-wrapper
    a(:href="ticketLink" target="_blank").tickets-button
      span.tickets-button__text Buy Tickets
      span &#8599;

      
</template>

<script>
export default {
  props: {
    buttons: {
      type: Array,
      required: true
    },
    ticketLink: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      active: ''
    }
  },
  methods: {
    handleMouseEnter(btn) {
      console.log('hovering', btn)
      this.active = btn
      this.$gsap.to(`.${btn} .button-text`, { color: 'var(--c-gold)', x: 0, duration: 0.5, ease: 'power2.out' })
      this.$gsap.to(`.${btn} svg`, { stroke: 'var(--c-gold)', x: 0, duration: 0.5, ease: 'power2.out' })
    },
    handleMouseLeave(btn) {
      console.log('leaving', btn)
      this.active = ''
      this.$gsap.to(`.${btn} .button-text`, { color: 'var(--c-black)', x: 0, duration: 0.2, ease: 'power2.out' })
      this.$gsap.to(`.${btn} svg`, { stroke: 'var(--c-black)', x: 0, duration: 0.2, ease: 'power2.out' }, '-=0.2')
      // this.$gsap.to('.button-text', { x: 0, duration: 0.5, ease: 'power2.out' })
    }
  }
}
</script>