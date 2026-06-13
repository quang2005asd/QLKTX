<template>
  <div class="d-flex align-center justify-space-between flex-wrap mb-6">
    <div>
      <h1 class="text-h5 font-weight-bold">{{ title }}</h1>
      <p v-if="subtitle" class="text-body-2 text-grey mt-1">{{ subtitle }}</p>
    </div>
    <div class="d-flex ga-2 mt-2 mt-sm-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
