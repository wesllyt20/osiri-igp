<script setup>
import AppHeader from '@/components/organisms/AppHeader.vue'
import GuideSidebar from '@/components/organisms/GuideSidebar.vue'
import { useGuideStore } from '@/stores/guideStore'

const guideStore = useGuideStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppHeader />
    <div class="flex flex-1 overflow-hidden" style="height: calc(100vh - 4rem)">
      <!-- Sidebar -->
      <GuideSidebar />

      <!-- Main Content Area -->
      <main
        class="flex-1 overflow-y-auto transition-all duration-300"
        :class="guideStore.sidebarOpen ? 'ml-0' : 'ml-0'"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
