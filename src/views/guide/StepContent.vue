<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGuideStore } from '@/stores/guideStore'
import StepHeader from '@/components/molecules/StepHeader.vue'
import StepNavigation from '@/components/molecules/StepNavigation.vue'

/* Step components – lazy loaded */
import { defineAsyncComponent } from 'vue'

const Step1Introduction = defineAsyncComponent(() => import('@/views/guide/steps/Step1Introduction.vue'))
const Step2Waves = defineAsyncComponent(() => import('@/views/guide/steps/Step2Waves.vue'))
const Step3Visualization = defineAsyncComponent(() => import('@/views/guide/steps/Step3Visualization.vue'))
const Step4Identification = defineAsyncComponent(() => import('@/views/guide/steps/Step4Identification.vue'))
const Step5Calculations = defineAsyncComponent(() => import('@/views/guide/steps/Step5Calculations.vue'))
const Step6Vectors = defineAsyncComponent(() => import('@/views/guide/steps/Step6Vectors.vue'))
const Step7Parameters = defineAsyncComponent(() => import('@/views/guide/steps/Step7Parameters.vue'))
const Step8Report = defineAsyncComponent(() => import('@/views/guide/steps/Step8Report.vue'))

const route = useRoute()
const router = useRouter()
const guideStore = useGuideStore()

const stepComponents = {
  1: Step1Introduction,
  2: Step2Waves,
  3: Step3Visualization,
  4: Step4Identification,
  5: Step5Calculations,
  6: Step6Vectors,
  7: Step7Parameters,
  8: Step8Report,
}

const currentStepComponent = computed(() => {
  return stepComponents[guideStore.currentStep] || Step1Introduction
})

watch(
  () => route.params.step,
  (newStep) => {
    if (newStep) {
      guideStore.setStep(Number(newStep))
    }
  },
  { immediate: true }
)

function handleNext() {
  guideStore.nextStep()
  router.push({ name: 'GuideStep', params: { step: String(guideStore.currentStep) } })
}

function handlePrev() {
  guideStore.prevStep()
  router.push({ name: 'GuideStep', params: { step: String(guideStore.currentStep) } })
}
</script>

<template>
  <div class="p-6 lg:p-10 pb-24 lg:pb-10 max-w-5xl mx-auto">
    <StepHeader
      :title="guideStore.currentStepData?.title || ''"
      :step-number="guideStore.currentStep"
      :total-steps="guideStore.totalSteps"
      :description="guideStore.currentStepData?.description || ''"
    />

    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <component :is="currentStepComponent" :key="guideStore.currentStep" />
    </Transition>

    <StepNavigation
      :current-step="guideStore.currentStep"
      :total-steps="guideStore.totalSteps"
      @prev="handlePrev"
      @next="handleNext"
    />
  </div>
</template>
