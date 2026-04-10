<script setup>
import { onUnmounted } from 'vue'
import ReportLayout from '@/layouts/ReportLayout.vue'
import { useReportStore } from '@/stores/reportStore'
import ReportStepWaveforms from '@/views/report/ReportStepWaveforms.vue'
import ReportStepAnalysis from '@/views/report/ReportStepAnalysis.vue'
import ReportStepDistance from '@/views/report/ReportStepDistance.vue'
import ReportStepSPChart from '@/views/report/ReportStepSPChart.vue'
import ReportStepEpicenter from '@/views/report/ReportStepEpicenter.vue'

const store = useReportStore()

// Clear waveform cache when leaving the report module
onUnmounted(() => {
  store.clearWaveformCache()
})
</script>

<template>
  <ReportLayout>
    <div class="p-6 lg:p-8">
      <ReportStepWaveforms v-if="store.currentStep === 2" />
      <ReportStepAnalysis v-else-if="store.currentStep === 3" />
      <ReportStepDistance v-else-if="store.currentStep === 4" />
      <ReportStepSPChart v-else-if="store.currentStep === 5" />
      <ReportStepEpicenter v-else-if="store.currentStep === 6" />
    </div>
  </ReportLayout>
</template>
