<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'

import { SEISMIC_CONSTANTS } from '@/data/seismicData'

const store = useReportStore()
let Plotly = null
let resizeObserver = null

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const VP = SEISMIC_CONSTANTS.VP
const VS = SEISMIC_CONSTANTS.VS
const STATION_COLORS = ['#D97706', '#0B8F63', '#0032ff', '#8B5E3C', '#e20000', '#0099ff', '#d97706', '#059669']

// User inputs for epicentral distance (can verify/correct)
const distInputs = reactive({})
const savedDistanceState = store.getSavedDistanceState()

function initInputs() {
  stations.value.forEach((s) => {
    const a = analysis.value[s]
    if (a && !distInputs[s]) {
      if (savedDistanceState.inputs[s]) {
        distInputs[s] = { ...savedDistanceState.inputs[s] }
        return
      }
      const deltaSP = a.tS - a.tP
      const dist = (deltaSP * VP * VS) / (VP - VS)
      distInputs[s] = {
        deltaSP: deltaSP.toFixed(2),
        distance: dist.toFixed(1),
        answerValidated: false,
        validated: false,
        error: '',
      }
    }
  })
}
initInputs()

function persistDistanceState() {
  store.saveDistanceState(distInputs, stationVisibility.value, stationDrawn.value)
}

const distRows = computed(() => {
  return stations.value
    .map((s) => {
      const a = analysis.value[s]
      const d = distInputs[s]
      if (!a || !d) return null
      return {
        station: s,
        tP: a.tP.toFixed(2),
        tS: a.tS.toFixed(2),
        deltaSP: d.deltaSP,
        distance: d.distance,
        maxAmp: a.maxAmp.toFixed(4),
        answerValidated: d.answerValidated,
        validated: d.validated,
      }
    })
    .filter(Boolean)
})

function validateDistance(station) {
  const d = distInputs[station]
  if (!d) return

  const val = parseFloat(d.distance)
  if (isNaN(val) || val <= 0) {
    d.error = 'Ingresa un valor numérico positivo'
    d.answerValidated = false
    return
  }

  // Recalculate expected
  const deltaSP = parseFloat(d.deltaSP)
  const expected = (deltaSP * VP * VS) / (VP - VS)
  const tolerance = expected * 0.15 // 15% tolerance

  if (Math.abs(val - expected) > tolerance) {
    d.error = `Valor fuera del rango esperado (≈ ${expected.toFixed(1)} km). Revisa tu cálculo.`
    d.answerValidated = false
    return
  }

  d.error = ''
  d.answerValidated = true
  persistDistanceState()
}

function resetDistance(station) {
  const d = distInputs[station]
  if (d) {
    d.validated = false
    d.answerValidated = false
    d.error = ''
    stationDrawn.value = { ...stationDrawn.value, [station]: false }
    stationVisibility.value = { ...stationVisibility.value, [station]: false }
    persistDistanceState()
    renderChart()
  }
}

// Station selected for the calculation details modal
const selectedExampleStation = ref(null)
const showCalculationModal = ref(false)

const exampleRow = computed(() => {
  if (selectedExampleStation.value) {
    return distRows.value.find((r) => r.station === selectedExampleStation.value) || distRows.value[0]
  }
  return distRows.value[0]
})

function openCalculationInfo(station) {
  selectedExampleStation.value = station
  showCalculationModal.value = true
}

function closeCalculationInfo() {
  showCalculationModal.value = false
}

function validateDistanceFromModal() {
  if (!exampleRow.value) return
  validateDistance(exampleRow.value.station)
}

async function submitDistanceFromModal() {
  if (!exampleRow.value) return
  const station = exampleRow.value.station
  const d = distInputs[station]
  if (!d?.answerValidated) return
  d.validated = true
  persistDistanceState()
  closeCalculationInfo()
}

async function drawStation(station) {
  if (!distInputs[station]?.validated) return
  stationDrawn.value = { ...stationDrawn.value, [station]: true }
  stationVisibility.value = { ...stationVisibility.value, [station]: true }
  persistDistanceState()
  await nextTick()
  renderChart()
}

const allValidated = computed(() => {
  return stations.value.length > 0 && stations.value.every((s) => distInputs[s]?.validated)
})

const stationVisibility = ref({})
const stationDrawn = ref({})

watch(stations, (s) => {
  const vis = {}
  const drawn = {}
  s.forEach((st) => {
    vis[st] = Boolean(savedDistanceState.visibility[st])
    drawn[st] = Boolean(savedDistanceState.drawn[st])
  })
  stationVisibility.value = vis
  stationDrawn.value = drawn
}, { immediate: true })

const chartData = computed(() => {
  return stations.value
    .map((s, idx) => {
      const a = analysis.value[s]
      const d = distInputs[s]
      if (!a || !d?.validated) return null
      const deltaSP = a.tS - a.tP
      const distance = parseFloat(d.distance)
      return { station: s, deltaSP, distance, color: STATION_COLORS[idx % STATION_COLORS.length] }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
})

const chartScaleData = computed(() => {
  return stations.value
    .map((s) => {
      const a = analysis.value[s]
      if (!a) return null
      const deltaSP = a.tS - a.tP
      const distance = (deltaSP * VP * VS) / (VP - VS)
      return { deltaSP, distance }
    })
    .filter(Boolean)
})

const hasDrawnStations = computed(() => chartData.value.some((d) => stationDrawn.value[d.station]))

function toggleStation(station) {
  stationVisibility.value = { ...stationVisibility.value, [station]: !stationVisibility.value[station] }
  persistDistanceState()
  renderChart()
}

async function renderChart() {
  if (!Plotly) return
  const el = document.getElementById('distance-sp-chart')
  if (!el) return

  const scaleData = chartScaleData.value.length ? chartScaleData.value : chartData.value
  const maxDist = scaleData.length ? Math.max(...scaleData.map((d) => d.distance)) * 1.3 : 100
  const lineDist = [0, maxDist]
  const lineSP = lineDist.map((d) => (d * (VP - VS)) / (VP * VS))

  const traces = [
    {
      x: lineDist,
      y: lineSP,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#d1d5db', width: 2, dash: 'dash' },
      name: 'Curva teórica',
      hoverinfo: 'skip',
    },
  ]

  chartData.value.forEach((d) => {
    if (!stationVisibility.value[d.station]) return

    traces.push({
      x: [d.distance, d.distance],
      y: [0, d.deltaSP],
      type: 'scatter',
      mode: 'lines',
      line: { color: d.color, width: 1.5, dash: 'dot' },
      showlegend: false,
      hoverinfo: 'skip',
    })

    traces.push({
      x: [0, d.distance],
      y: [d.deltaSP, d.deltaSP],
      type: 'scatter',
      mode: 'lines',
      line: { color: d.color, width: 1.5, dash: 'dot' },
      showlegend: false,
      hoverinfo: 'skip',
    })

    traces.push({
      x: [d.distance],
      y: [d.deltaSP],
      type: 'scatter',
      mode: 'markers+text',
      marker: { size: 14, color: d.color, symbol: 'circle', line: { color: 'white', width: 2 } },
      text: [d.station],
      textposition: 'top right',
      textfont: { size: 12, color: d.color, family: 'Poppins', weight: 700 },
      name: d.station,
      hovertemplate: `<b>${d.station}</b><br>Distancia: ${d.distance.toFixed(1)} km<br>S-P: ${d.deltaSP.toFixed(2)} s<extra></extra>`,
    })
  })

  await Plotly.newPlot(el, traces, {
    title: { text: 'Gráfico S-P vs Distancia Epicentral', font: { size: 16, color: '#222222', family: 'Poppins' } },
    xaxis: { title: { text: 'Distancia Epicentral (km)', font: { size: 13, family: 'Poppins' } }, gridcolor: '#e5e7eb', zeroline: true, zerolinecolor: '#d1d5db', rangemode: 'tozero' },
    yaxis: { title: { text: 'Ts - Tp (s)', font: { size: 13, family: 'Poppins' } }, gridcolor: '#e5e7eb', zeroline: true, zerolinecolor: '#d1d5db', rangemode: 'tozero' },
    margin: { l: 70, r: 30, t: 60, b: 60 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)', bordercolor: '#e5e7eb', borderwidth: 1 },
    hovermode: 'closest',
  }, {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
    displaylogo: false,
  })
}

function goBack() {
  persistDistanceState()
  store.prevStep()
}

function goNext() {
  if (allValidated.value) {
    persistDistanceState()
    store.nextStep()
  }
}

onMounted(async () => {
  const mod = await import('plotly.js-dist-min')
  Plotly = mod.default || mod
  await nextTick()
  await renderChart()

  const el = document.getElementById('distance-sp-chart')
  if (el && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (Plotly && el) Plotly.Plots.resize(el)
    })
    resizeObserver.observe(el)
  }
})

onUnmounted(() => {
  persistDistanceState()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (Plotly) {
    const el = document.getElementById('distance-sp-chart')
    if (el) try { Plotly.purge(el) } catch {}
  }
  Plotly = null
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span
          class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 3
        </span>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Validación de datos y gráfico S-P
        </h1>
        <p class="text-sm text-gray-500" v-if="selectedRecord">
          Sismo: {{ selectedRecord.title }} — Valida las distancias y revisa la relación tiempo-distancia
        </p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="ghost" size="sm" @click="goBack">
          <AppIcon name="arrow-left" :size="16" class="mr-1" />
          Atrás
        </AppButton>
        <AppButton variant="primary" size="sm" :disabled="!allValidated" @click="goNext"
          :class="{ 'opacity-50 cursor-not-allowed': !allValidated }">
          Siguiente
          <AppIcon name="arrow-right" :size="16" class="ml-1" />
        </AppButton>
      </div>
    </div>

    <!-- Station distance table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="crosshair" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Cálculo por estación</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Tp (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ts (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">ΔT (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Amplitud Máx. (mm)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Distancia (km)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in distRows" :key="row.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-bold text-igp-blue">{{ row.station }}</td>
              <td class="px-4 py-3 font-mono text-sm">{{ row.tP }}</td>
              <td class="px-4 py-3 font-mono text-sm">{{ row.tS }}</td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ row.deltaSP }}</td>
              <td class="px-4 py-3 font-mono text-red-600">{{ row.maxAmp }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="w-16 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-center font-mono text-sm text-gray-500">
                    {{ row.validated ? row.distance : '--' }}
                  </span>
                  <button
                    v-if="!row.validated"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-igp-sky-blue-50 text-igp-sky-blue-700 hover:bg-igp-sky-blue-100 transition-colors cursor-pointer"
                    @click="openCalculationInfo(row.station)"
                    title="Cómo hallar esta distancia">
                    <AppIcon name="calculator" :size="14" />
                    Hallar
                  </button>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button v-if="row.validated"
                    class="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    @click="resetDistance(row.station)">
                    Corregir
                  </button>
                  <button v-if="row.validated && !stationDrawn[row.station]"
                    class="px-3 py-1 text-xs font-semibold bg-igp-blue text-white rounded-lg hover:bg-igp-blue-800 transition-colors cursor-pointer"
                    @click="drawStation(row.station)">
                    Dibujar
                  </button>
                  <span class="inline-flex items-center gap-1 text-igp-green-700 text-xs font-semibold"
                    :class="row.validated ? 'opacity-100' : 'opacity-0'">
                    <AppIcon name="check-circle" :size="14" />
                    OK
                  </span>

                </div>
                <p v-if="distInputs[row.station]?.error" class="text-xs text-red-500 mt-1">
                  {{ distInputs[row.station].error }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Calculation details modal -->
    <div
      v-if="showCalculationModal && exampleRow"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      @click.self="closeCalculationInfo"
    >
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div class="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h3 class="text-lg font-bold text-igp-blue flex items-center gap-2">
              <AppIcon name="calculator" :size="20" class="text-igp-sky-blue-600" />
              Cómo hallar la distancia
            </h3>
            <p class="mt-1 text-sm text-gray-500">Estación {{ exampleRow.station }}</p>
          </div>
          <button
            class="p-2 rounded-lg text-gray-400 hover:text-igp-blue hover:bg-gray-100 transition-colors cursor-pointer"
            @click="closeCalculationInfo"
            title="Cerrar"
          >
            <AppIcon name="x" :size="18" />
          </button>
        </div>
        <div class="p-5 space-y-3">
          <div class="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
            <div class="w-8 h-8 rounded-lg bg-igp-blue-50 text-igp-blue text-sm font-bold flex items-center justify-center shrink-0">1</div>
            <p class="text-sm text-gray-700">Leer Tp = {{ exampleRow.tP }} s y Ts = {{ exampleRow.tS }} s.</p>
          </div>
          <div class="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
            <div class="w-8 h-8 rounded-lg bg-igp-blue-50 text-igp-blue text-sm font-bold flex items-center justify-center shrink-0">2</div>
            <p class="text-sm text-gray-700">Calcular ΔT = Ts - Tp = {{ exampleRow.tS }} - {{ exampleRow.tP }} = {{ exampleRow.deltaSP }} s.</p>
          </div>
          <div class="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
            <div class="w-8 h-8 rounded-lg bg-igp-blue-50 text-igp-blue text-sm font-bold flex items-center justify-center shrink-0">3</div>
            <p class="text-sm text-gray-700">Aplicar fórmula: D ≈ {{ exampleRow.deltaSP }} × ({{ VP }} × {{ VS.toFixed(2) }}) / ({{ VP }} - {{ VS.toFixed(2) }}).</p>
          </div>
          <div class="flex flex-col gap-3 rounded-xl bg-green-50 border border-green-100 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-lg bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center shrink-0">4</div>
              <label class="text-sm font-semibold text-green-700" :for="`distance-answer-${exampleRow.station}`">
                Respuesta (km)
              </label>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                :id="`distance-answer-${exampleRow.station}`"
                v-model="distInputs[exampleRow.station].distance"
                type="number"
                step="0.1"
                min="0"
                class="w-full sm:w-28 px-3 py-2 text-sm border border-green-200 rounded-lg bg-white font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <button
                class="px-4 py-2 text-xs font-semibold bg-igp-blue text-white rounded-lg hover:bg-igp-blue-800 transition-colors cursor-pointer whitespace-nowrap"
                @click="validateDistanceFromModal"
              >
                Validar respuesta
              </button>
              <button
                class="px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                :class="distInputs[exampleRow.station]?.answerValidated ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                :disabled="!distInputs[exampleRow.station]?.answerValidated"
                @click="submitDistanceFromModal"
              >
                Enviar
              </button>
            </div>
          </div>
          <p v-if="distInputs[exampleRow.station]?.error" class="text-xs text-red-500 px-1">
            {{ distInputs[exampleRow.station].error }}
          </p>
          <div v-if="distInputs[exampleRow.station]?.validated" class="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
            <AppIcon name="check-circle" :size="14" />
            Respuesta validada y registrada en la tabla.
          </div>
          <div v-else-if="distInputs[exampleRow.station]?.answerValidated" class="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-igp-blue">
            <AppIcon name="check-circle" :size="14" />
            Respuesta correcta. Presiona Enviar para mostrarla en la tabla.
          </div>
        </div>
      </div>
    </div>

    <!-- S-P chart -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="trending-up" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Gráfico S-P vs Distancia</h2>
      </div>
      <div class="p-4">
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="row in distRows"
            :key="row.station"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
            :class="row.validated && stationDrawn[row.station] && stationVisibility[row.station]
              ? 'text-white shadow-md'
              : row.validated && stationDrawn[row.station]
                ? 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 cursor-pointer'
                : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'"
            :disabled="!row.validated || !stationDrawn[row.station]"
            :style="row.validated && stationDrawn[row.station] && stationVisibility[row.station] ? { backgroundColor: STATION_COLORS[distRows.findIndex((item) => item.station === row.station) % STATION_COLORS.length] } : {}"
            @click="row.validated && stationDrawn[row.station] && toggleStation(row.station)"
          >
            <span
              class="w-3 h-3 rounded-full border-2 transition-all"
              :style="{ borderColor: row.validated && stationDrawn[row.station] && stationVisibility[row.station] ? 'white' : STATION_COLORS[distRows.findIndex((item) => item.station === row.station) % STATION_COLORS.length], backgroundColor: row.validated && stationDrawn[row.station] && stationVisibility[row.station] ? 'white' : 'transparent' }"
            />
            {{ row.station }}
            <span v-if="row.validated" class="text-xs opacity-75">({{ Number(row.deltaSP).toFixed(2) }}s / {{ Number(row.distance).toFixed(0) }}km)</span>
            <span v-else class="text-xs opacity-75">sin hallar</span>
          </button>
        </div>
        <div class="relative rounded-xl border border-gray-100 bg-white">
          <div id="distance-sp-chart" class="w-full" style="height: 350px; min-height: 300px" />
        </div>
      </div>
    </div>

    <!-- Bottom navigation -->
    <div class="mt-8 flex justify-between">
      <AppButton variant="ghost" size="md" @click="goBack">
        <AppIcon name="arrow-left" :size="16" class="mr-1" />
        Anterior
      </AppButton>
      <AppButton variant="primary" size="md" :disabled="!allValidated" @click="goNext"
        :class="{ 'opacity-50 cursor-not-allowed': !allValidated }">
        Siguiente paso
        <AppIcon name="arrow-right" :size="16" class="ml-1" />
      </AppButton>
    </div>
  </div>
</template>

