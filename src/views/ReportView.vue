<script setup>
import { onUnmounted } from 'vue'
import ReportLayout from '@/layouts/ReportLayout.vue'
import { useReportStore } from '@/stores/reportStore'
import ReportStepWaveforms from '@/views/report/ReportStepWaveforms.vue'
import ReportStepAnalysis from '@/views/report/ReportStepAnalysis.vue'
import ReportStepDistance from '@/views/report/ReportStepDistance.vue'
import ReportStepSPChart from '@/views/report/ReportStepSPChart.vue'
import ReportStepEpicenter from '@/views/report/ReportStepEpicenter.vue'
import ReportStepMagnitude from '@/views/report/ReportStepMagnitude.vue'
import ReportStepReport from '@/views/report/ReportStepReport.vue'

const store = useReportStore()

// Clear waveform cache when leaving the report module
onUnmounted(() => {
  store.clearWaveformCache()
})
</script>

<template>
  <ReportLayout>
    <div class="p-3 sm:p-6 lg:p-8">
      <Transition name="step-fade" mode="out-in">
        <ReportStepWaveforms v-if="store.currentStep === 2" key="step-2" />
        <ReportStepAnalysis v-else-if="store.currentStep === 3" key="step-3" />
        <ReportStepDistance v-else-if="store.currentStep === 4" key="step-4" />
        <ReportStepSPChart v-else-if="store.currentStep === 5" key="step-5" />
        <ReportStepEpicenter v-else-if="store.currentStep === 6" key="step-6" />
        <ReportStepMagnitude v-else-if="store.currentStep === 7" key="step-7" />
        <ReportStepReport v-else-if="store.currentStep === 8" key="step-8" />
      </Transition>
    </div>
  </ReportLayout>
</template>

<style scoped>
.step-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.step-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
