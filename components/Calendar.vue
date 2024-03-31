<template lang="pug">
.calendar

</template>

<style scoped>
.calendar {
  @apply grid grid-cols-1 lg:grid-cols-3;
  grid-template-rows: repeat(12, 100px);
}
</style>