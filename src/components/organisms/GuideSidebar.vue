<script setup>
import { useRouter } from 'vue-router'
import { useGuideStore } from '@/stores/guideStore'
import StepItem from '@/components/molecules/StepItem.vue'
import ProgressBar from '@/components/atoms/ProgressBar.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

const router = useRouter()
const guideStore = useGuideStore()

function goToStep(stepId) {
  guideStore.setStep(stepId)
  router.push({ name: 'GuideStep', params: { step: String(stepId) } })
}
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside
    class="hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden"
    :class="guideStore.sidebarOpen ? 'w-72' : 'w-0'"
  >
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-bold text-igp-dark-blue-500 uppercase tracking-wide">
          Pasos de la Guía
        </h2>
        <button
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          @click="guideStore.toggleSidebar()"
        >
          <AppIcon name="chevron-left" :size="18" />
        </button>
      </div>
      <ProgressBar :value="guideStore.progress" :show-label="true" />
    </div>

    <nav class="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
      <StepItem
        v-for="step in guideStore.steps"
        :key="step.id"
        :step="step"
        :step-number="step.id"
        :is-active="guideStore.currentStep === step.id"
        :is-completed="guideStore.isCompleted(step.id)"
        @select="goToStep"
      />
    </nav>

    <div class="p-4 border-t border-gray-100">
      <router-link
        to="/"
        class="flex items-center gap-2 text-xs text-gray-400 hover:text-igp-dark-blue-500 transition-colors"
      >
        <AppIcon name="arrow-left" :size="14" />
        Volver al inicio
      </router-link>
    </div>
  </aside>

  <!-- Collapsed sidebar toggle (desktop) -->
  <button
    v-if="!guideStore.sidebarOpen"
    class="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-igp-dark-blue-500 text-white p-2 rounded-r-xl shadow-lg hover:bg-igp-dark-blue-600 transition-colors"
    @click="guideStore.toggleSidebar()"
  >
    <AppIcon name="chevron-right" :size="20" />
  </button>

  <!-- Mobile Bottom Nav -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
    <div class="flex items-center justify-between p-3">
      <button
        :disabled="guideStore.currentStep <= 1"
        class="p-2.5 rounded-xl transition-colors disabled:opacity-30"
        :class="guideStore.currentStep > 1 ? 'hover:bg-gray-100 text-gray-600' : ''"
        @click="guideStore.prevStep(); router.push({ name: 'GuideStep', params: { step: String(guideStore.currentStep) } })"
      >
        <AppIcon name="chevron-left" :size="20" />
      </button>

      <div class="flex-1 text-center">
        <p class="text-xs text-gray-400">Paso {{ guideStore.currentStep }} de {{ guideStore.totalSteps }}</p>
        <p class="text-sm font-semibold text-igp-dark-blue-500 truncate px-2">
          {{ guideStore.currentStepData?.shortTitle }}
        </p>
      </div>

      <button
        :disabled="guideStore.currentStep >= guideStore.totalSteps"
        class="p-2.5 rounded-xl transition-colors disabled:opacity-30"
        :class="guideStore.currentStep < guideStore.totalSteps ? 'hover:bg-gray-100 text-gray-600' : ''"
        @click="guideStore.nextStep(); router.push({ name: 'GuideStep', params: { step: String(guideStore.currentStep) } })"
      >
        <AppIcon name="chevron-right" :size="20" />
      </button>
    </div>
    <ProgressBar :value="guideStore.progress" height="h-1" class="px-0" />
  </div>
</template>
