<template lang="pug">
  main
    h1 {{ page?.heading }}
    .tickets-grid
      ContentDoc(path="/pages/tickets").mb-12
      a(:href="page?.link" target="_blank" ref="buttonRef").tickets-button
        span.tickets-button__text Buy Tickets&nbsp;&#8599;
</template>

<script setup lang="ts">
interface TicketsPage {
  heading: string
  link: string
}

interface ButtonPosition {
  x: number
  y: number
}

interface ButtonSize {
  width: number
  height: number
}

useHead({
  title: 'Tickets',
  bodyAttrs: {
    class: 'page-tickets'
  }
})

const buttonRef = ref<HTMLElement | null>(null)
const buttonPos = ref<ButtonPosition>({ x: 0, y: 0 })
const buttonSize = ref<ButtonSize>({ width: 0, height: 0 })

const { data: page } = await useAsyncData('ticketsPage', () =>
  queryContent<TicketsPage>('pages/tickets').findOne()
)

const buttonTransform = computed(() =>
  `translate(${buttonPos.value.x}px, ${buttonPos.value.y}px)`
)

const updateButtonPosition = (event: MouseEvent) => {
  if (!buttonRef.value) return

  buttonPos.value = {
    x: event.clientX - buttonRef.value.offsetLeft,
    y: 0
  }
}

onMounted(() => {
  if (!buttonRef.value) return

  buttonSize.value = {
    width: buttonRef.value.clientWidth,
    height: buttonRef.value.clientHeight
  }
})
</script>
