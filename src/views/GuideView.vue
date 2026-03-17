<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GuideLayout from '@/layouts/GuideLayout.vue'
import { useGuideStore } from '@/stores/guideStore'

const route = useRoute()
const router = useRouter()
const guideStore = useGuideStore()

// Sync route param to store
watch(
  () => route.params.step,
  (newStep) => {
    if (newStep) {
      guideStore.setStep(Number(newStep))
    }
  },
  { immediate: true }
)
</script>

<template>
  <GuideLayout>
    <router-view />
  </GuideLayout>
</template>
