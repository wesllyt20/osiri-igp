<script setup>
import { computed, onMounted, onUnmounted, nextTick, ref } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { SEISMIC_CONSTANTS } from '@/data/seismicData'

const store = useReportStore()
let Plotly = null
const chartReady = ref(false)

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const VP = SEISMIC_CONSTANTS.VP
const VS = SEISMIC_CONSTANTS.VS

// Compute S-P vs epicentral distance data per station
const chartData = computed(() => {
  return stations.value
    .map((s) => {
      const a = analysis.value[s]
      if (!a) return null
      const deltaSP = a.tS - a.tP
      const distance = (deltaSP * VP * VS) / (VP - VS)
      return { station: s, deltaSP, distance }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
})

async function renderChart() {
  if (!Plotly || !chartData.value.length) return
  const el = document.getElementById('sp-chart')
  if (!el) return

  const stationNames = chartData.value.map((d) => d.station)
  const distances = chartData.value.map((d) => d.distance)
  const deltaSPs = chartData.value.map((d) => d.deltaSP)

  // Theoretical line: deltaSP = D * (VP - VS) / (VP * VS)
  const maxDist = Math.max(...distances) * 1.2
  const lineDist = [0, maxDist]
  const lineSP = lineDist.map((d) => (d * (VP - VS)) / (VP * VS))

  const traces = [
    {
      x: distances,
      y: deltaSPs,
      type: 'scatter',
      mode: 'markers+text',
      marker: { size: 12, color: '#0032ff', symbol: 'circle' },
      text: stationNames,
      textposition: 'top right',
      textfont: { size: 11, color: '#0032ff', family: 'Poppins' },
      name: 'Estaciones',
      hovertemplate: '<b>%{text}</b><br>Distancia: %{x:.1f} km<br>S-P: %{y:.2f} s<extra></extra>',
    },
    {
      x: lineDist,
      y: lineSP,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ff0000', width: 2, dash: 'dash' },
      name: 'Curva teórica',
      hoverinfo: 'skip',
    },
  ]

  const layout = {
    title: {
      text: 'Gráfico S-P vs Distancia Epicentral',
      font: { size: 16, color: '#0032ff', family: 'Poppins' },
    },
    xaxis: {
      title: { text: 'Distancia Epicentral (km)', font: { size: 13, family: 'Poppins' } },
      gridcolor: '#e5e7eb',
      zeroline: true,
      zerolinecolor: '#d1d5db',
      rangemode: 'tozero',
    },
    yaxis: {
      title: { text: 'Ts - Tp (s)', font: { size: 13, family: 'Poppins' } },
      gridcolor: '#e5e7eb',
      zeroline: true,
      zerolinecolor: '#d1d5db',
      rangemode: 'tozero',
    },
    margin: { l: 70, r: 30, t: 60, b: 60 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)', bordercolor: '#e5e7eb', borderwidth: 1 },
    hovermode: 'closest',
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
    displaylogo: false,
  }

  Plotly.newPlot(el, traces, layout, config)
}

function goBack() {
  store.prevStep()
}

function goNext() {
  store.nextStep()
}

onMounted(async () => {
  const mod = await import('plotly.js-dist-min')
  Plotly = mod.default || mod
  chartReady.value = true
  await nextTick()
  renderChart()
})

onUnmounted(() => {
  if (Plotly) {
    const el = document.getElementById('sp-chart')
    if (el) try { Plotly.purge(el) } catch {}
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 5
        </span>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Gráfico S-P vs Distancia
        </h1>
        <p class="text-gray-500" v-if="selectedRecord">
          {{ selectedRecord.title }} — Relación tiempo-distancia
        </p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="ghost" size="sm" @click="goBack">
          <AppIcon name="arrow-left" :size="16" class="mr-1" />
          Atrás
        </AppButton>
        <AppButton variant="primary" size="sm" @click="goNext">
          Siguiente
          <AppIcon name="arrow-right" :size="16" class="ml-1" />
        </AppButton>
      </div>
    </div>

    <!-- Info box -->
    <div class="bg-igp-sky-blue-50 border border-igp-sky-blue-200 rounded-xl p-4 mb-6 text-sm text-igp-sky-blue-800">
      <p class="font-semibold mb-1">¿Qué muestra este gráfico?</p>
      <p>
        La relación entre la diferencia de tiempos de llegada de las ondas S y P (ΔT = Ts - Tp) y la distancia epicentral.
        Los puntos deben alinearse sobre la curva teórica (línea roja), confirmando la consistencia de tus mediciones.
      </p>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="trending-up" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Gráfico S-P vs Distancia</h2>
      </div>
      <div id="sp-chart" class="w-full" style="height: 450px" />
    </div>

    <!-- Data table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="file-text" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Datos del gráfico</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ts - Tp (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Distancia (km)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in chartData"
              :key="row.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-400">{{ idx + 1 }}</td>
              <td class="px-4 py-3 font-bold text-igp-blue">{{ row.station }}</td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold text-igp-blue">{{ row.deltaSP.toFixed(2) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold text-igp-blue">{{ row.distance.toFixed(1) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formula reminder -->
    <div class="bg-igp-blue rounded-2xl p-6 text-white mb-8">
      <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
        <AppIcon name="info" :size="20" class="text-igp-sky-blue-300" />
        Fórmula utilizada
      </h3>
      <div class="bg-white/10 rounded-xl p-4 text-center">
        <p class="text-lg font-mono font-semibold">
          ΔT = D × (Vp - Vs) / (Vp × Vs)
        </p>
        <p class="text-sm text-gray-300 mt-2">
          Vp = {{ VP }} km/s | Vs = {{ VS.toFixed(2) }} km/s
        </p>
      </div>
    </div>

    <!-- Bottom navigation -->
    <div class="mt-8 flex justify-between">
      <AppButton variant="ghost" size="md" @click="goBack">
        <AppIcon name="arrow-left" :size="16" class="mr-1" />
        Anterior
      </AppButton>
      <AppButton variant="primary" size="md" @click="goNext">
        Localizar Epicentro
        <AppIcon name="arrow-right" :size="16" class="ml-1" />
      </AppButton>
    </div>
  </div>
</template>
