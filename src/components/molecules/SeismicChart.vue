<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import Plotly from 'plotly.js-dist-min'

const props = defineProps({
  traces: { type: Array, required: true },
  layout: { type: Object, default: () => ({}) },
  config: { type: Object, default: () => ({}) },
  height: { type: String, default: '400px' },
})

const chartRef = ref(null)

const defaultLayout = {
  margin: { t: 40, r: 20, b: 50, l: 60 },
  font: { family: 'Poppins, sans-serif', size: 12 },
  paper_bgcolor: 'transparent',
  plot_bgcolor: '#fafbfd',
  xaxis: {
    gridcolor: '#e5e7eb',
    zerolinecolor: '#d1d5db',
  },
  yaxis: {
    gridcolor: '#e5e7eb',
    zerolinecolor: '#d1d5db',
  },
  hoverlabel: {
    bgcolor: '#00214f',
    font: { color: '#fff', family: 'Poppins, sans-serif', size: 12 },
    bordercolor: '#00214f',
  },
}

const defaultConfig = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'sismograma',
    height: 600,
    width: 1200,
    scale: 2,
  },
}

async function renderChart() {
  if (!chartRef.value) return
  await nextTick()
  const mergedLayout = { ...defaultLayout, ...props.layout }
  const mergedConfig = { ...defaultConfig, ...props.config }
  Plotly.react(chartRef.value, props.traces, mergedLayout, mergedConfig)
}

onMounted(renderChart)

watch(
  () => [props.traces, props.layout],
  renderChart,
  { deep: true }
)
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div ref="chartRef" :style="{ height }" class="w-full" />
  </div>
</template>
