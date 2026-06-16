<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  class?: string
  speed?: number
}>(), {
  class: '',
  speed: 28,
})

const rootRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const isOverflowing = ref(false)
const distance = ref(0)

function measureOverflow() {
  const root = rootRef.value
  const content = contentRef.value
  if (!root || !content) return

  const availableWidth = root.clientWidth
  const contentWidth = content.scrollWidth
  const overflow = contentWidth > availableWidth + 4

  isOverflowing.value = overflow
  distance.value = overflow ? contentWidth - availableWidth + 28 : 0
}

async function syncMeasurement() {
  await nextTick()
  measureOverflow()
}

function handleResize() {
  measureOverflow()
}

const duration = computed(() => {
  if (!distance.value) return '0s'
  const seconds = Math.max(4, distance.value / props.speed)
  return `${seconds}s`
})

const marqueeStyle = computed(() => ({
  '--marquee-distance': `${distance.value}px`,
  '--marquee-duration': duration.value,
}))

watch(() => props.text, syncMeasurement)

onMounted(async () => {
  await syncMeasurement()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div ref="rootRef" class="marquee-text" :class="[props.class, { 'marquee-text-overflow': isOverflowing }]" :title="props.text">
    <div v-if="isOverflowing" class="marquee-track" :style="marqueeStyle">
      <span ref="contentRef" class="marquee-copy">{{ props.text }}</span>
      <span class="marquee-gap" aria-hidden="true"></span>
      <span class="marquee-copy" aria-hidden="true">{{ props.text }}</span>
    </div>
    <span v-else ref="contentRef" class="marquee-static">{{ props.text }}</span>
  </div>
</template>

<style scoped>
.marquee-text {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.marquee-track {
  display: inline-flex;
  align-items: center;
  min-width: max-content;
  animation: marquee-slide var(--marquee-duration) linear infinite;
  will-change: transform;
}

.marquee-copy,
.marquee-static {
  display: inline-block;
}

.marquee-gap {
  width: 28px;
  flex: 0 0 28px;
}

@keyframes marquee-slide {
  0%, 10% {
    transform: translateX(0);
  }
  45%, 55% {
    transform: translateX(calc(var(--marquee-distance) * -1));
  }
  100% {
    transform: translateX(calc(var(--marquee-distance) * -1));
  }
}
</style>
