<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <router-view v-slot="{ Component }">
    <Transition name="route-fade" appear>
      <div :key="route.fullPath" class="route-page-shell">
        <component :is="Component" />
      </div>
    </Transition>
  </router-view>
</template>
