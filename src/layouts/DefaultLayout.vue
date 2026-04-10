<script setup>
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppFooter from '@/components/organisms/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-igp-white-50">
    <AppHeader />
    <main class="flex-1 -mt-16">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
