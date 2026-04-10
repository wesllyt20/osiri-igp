<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, shallowRef, reactive } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const store = useReportStore()

const stations = computed(() => store.stations)
const selectedRecord = computed(() => store.selectedRecord)
const loading = ref(true)
const waveformData = shallowRef([])
let Plotly = null

// User inputs per station: { stationName: { tP, tS, maxAmp, validated } }
const stationInputs = reactive({})

function initInputs() {
  stations.value.forEach((s) => {
    if (!stationInputs[s]) {
      stationInputs[s] = { tP: '', tS: '', maxAmp: '', validated: false, error: '' }
    }
  })
}

// Downsample data for performance
function downsample(time, amplitude, targetPoints = 2000) {
  if (time.length <= targetPoints) return { time, amplitude }
  const step = Math.ceil(time.length / targetPoints)
  const t = []
  const a = []
  for (let i = 0; i < time.length; i += step) {
    t.push(time[i])
    a.push(amplitude[i])
  }
  return { time: t, amplitude: a }
}

async function loadAllWaveforms() {
  loading.value = true
  waveformData.value = []

  const results = await Promise.all(
    stations.value.map((s) => store.loadWaveformData(s))
  )

  waveformData.value = results.filter(Boolean)
  initInputs()
  loading.value = false

  await nextTick()
  renderCharts()
}

function renderCharts() {
  if (!Plotly || !waveformData.value.length) return

  waveformData.value.forEach((data, idx) => {
    renderSingleChart(data, idx)
  })
}

function renderSingleChart(data, idx) {
  const el = document.getElementById(`chart-${idx}`)
  if (!el || !Plotly) return

  const ds = downsample(data.time, data.amplitude)
  const input = stationInputs[data.stationName]

  const traces = [
    {
      x: ds.time,
      y: ds.amplitude,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#0032ff', width: 1 },
      name: data.stationName,
      hovertemplate: 'Tiempo: %{x:.2f}s<br>Amplitud: %{y:.4f}mm<extra></extra>',
    },
  ]

  const shapes = []
  const annotations = []

  // If validated, show markers
  if (input && input.validated) {
    const tP = parseFloat(input.tP)
    const tS = parseFloat(input.tS)
    const amp = parseFloat(input.maxAmp)

    if (!isNaN(tP)) {
      shapes.push({
        type: 'line', x0: tP, x1: tP, y0: -amp * 1.3 || -data.maxAmplitude * 1.3, y1: amp * 1.3 || data.maxAmplitude * 1.3,
        line: { color: '#0099ff', width: 2, dash: 'dash' },
      })
      annotations.push({
        x: tP, y: data.maxAmplitude * 1.1,
        text: `Onda P (${tP}s)`, showarrow: true, arrowhead: 2,
        font: { color: '#0099ff', size: 11 }, arrowcolor: '#0099ff',
      })
    }

    if (!isNaN(tS)) {
      shapes.push({
        type: 'line', x0: tS, x1: tS, y0: -amp * 1.3 || -data.maxAmplitude * 1.3, y1: amp * 1.3 || data.maxAmplitude * 1.3,
        line: { color: '#ff8d3a', width: 2, dash: 'dash' },
      })
      annotations.push({
        x: tS, y: data.maxAmplitude * 0.9,
        text: `Onda S (${tS}s)`, showarrow: true, arrowhead: 2,
        font: { color: '#ff8d3a', size: 11 }, arrowcolor: '#ff8d3a',
      })
    }

    if (!isNaN(amp)) {
      // Horizontal line at max amplitude
      shapes.push({
        type: 'line', x0: 0, x1: data.time[data.time.length - 1],
        y0: amp, y1: amp,
        line: { color: '#ff0000', width: 1, dash: 'dot' },
      })
      shapes.push({
        type: 'line', x0: 0, x1: data.time[data.time.length - 1],
        y0: -amp, y1: -amp,
        line: { color: '#ff0000', width: 1, dash: 'dot' },
      })
    }
  }

  const layout = {
    title: {
      text: `Estación ${data.stationName}`,
      font: { size: 14, color: '#0032ff', family: 'Poppins' },
    },
    xaxis: {
      title: { text: 'Tiempo (s)', font: { size: 11 } },
      gridcolor: '#f0f0f0',
    },
    yaxis: {
      title: { text: 'Amplitud (mm)', font: { size: 11 } },
      gridcolor: '#f0f0f0',
    },
    margin: { l: 60, r: 20, t: 40, b: 50 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    showlegend: false,
    hovermode: 'closest',
    dragmode: 'zoom',
    shapes,
    annotations,
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
    displaylogo: false,
  }

  Plotly.newPlot(el, traces, layout, config)
}

function validateStation(stationName, idx) {
  const input = stationInputs[stationName]
  const data = waveformData.value.find((d) => d.stationName === stationName)
  if (!input || !data) return

  const tP = parseFloat(input.tP)
  const tS = parseFloat(input.tS)
  const amp = parseFloat(input.maxAmp)

  if (isNaN(tP) || isNaN(tS) || isNaN(amp)) {
    input.error = 'Completa todos los campos con valores numéricos'
    input.validated = false
    return
  }

  if (tP < 0 || tS < 0 || amp < 0) {
    input.error = 'Los valores deben ser positivos'
    input.validated = false
    return
  }

  if (tS <= tP) {
    input.error = 'El tiempo de la onda S debe ser mayor al de la onda P'
    input.validated = false
    return
  }

  const maxTime = data.time[data.time.length - 1]
  if (tP > maxTime || tS > maxTime) {
    input.error = `Los tiempos deben estar dentro del rango (0 - ${maxTime.toFixed(1)}s)`
    input.validated = false
    return
  }

  input.error = ''
  input.validated = true

  // Save to store for the next steps
  store.setStationAnalysis(stationName, { tP, tS, maxAmp: amp })

  // Re-render chart with markers
  renderSingleChart(data, idx)
}

function resetValidation(stationName, idx) {
  const input = stationInputs[stationName]
  if (input) {
    input.validated = false
    input.error = ''
  }
  const data = waveformData.value.find((d) => d.stationName === stationName)
  if (data) renderSingleChart(data, idx)
}

const allValidated = computed(() => {
  return stations.value.length > 0 && stations.value.every((s) => stationInputs[s]?.validated)
})

function destroyCharts() {
  if (!Plotly) return
  waveformData.value.forEach((_, idx) => {
    const el = document.getElementById(`chart-${idx}`)
    if (el) {
      try { Plotly.purge(el) } catch {}
    }
  })
}

function goBack() {
  destroyCharts()
  store.prevStep()
}

function goNext() {
  if (allValidated.value) {
    store.nextStep()
  }
}

onMounted(async () => {
  const mod = await import('plotly.js-dist-min')
  Plotly = mod.default || mod

  if (stations.value.length) {
    await loadAllWaveforms()
  }
})

onUnmounted(() => {
  destroyCharts()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 2
        </span>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Formas de Onda Sísmicas
        </h1>
        <p class="text-gray-500" v-if="selectedRecord">
          Sismo #{{ selectedRecord.title }} — {{ selectedRecord.date }} a las {{ selectedRecord.time }}
        </p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="ghost" size="sm" @click="goBack">
          <AppIcon name="arrow-left" :size="16" class="mr-1" />
          Atrás
        </AppButton>
        <AppButton
          variant="primary"
          size="sm"
          :disabled="!allValidated"
          @click="goNext"
          :class="{ 'opacity-50 cursor-not-allowed': !allValidated }"
        >
          Siguiente
          <AppIcon name="arrow-right" :size="16" class="ml-1" />
        </AppButton>
      </div>
    </div>

    <!-- Info box -->
    <div class="bg-igp-sky-blue-50 border border-igp-sky-blue-200 rounded-xl p-4 mb-6 text-sm text-igp-sky-blue-800">
      <p class="font-semibold mb-1">Instrucciones:</p>
      <p>Observa cada gráfico y usa el zoom para identificar las ondas P y S. Luego ingresa el tiempo de la Onda P, el tiempo de la Onda S y la amplitud máxima en los campos de la derecha. Haz clic en <strong>Validar</strong> para verificar y marcar las ondas en el gráfico.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-igp-sky-blue-200 border-t-igp-sky-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-gray-500 text-sm">Cargando formas de onda...</p>
      </div>
    </div>

    <!-- Charts + Inputs -->
    <div v-else class="space-y-6">
      <div
        v-for="(data, idx) in waveformData"
        :key="data.stationName"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Station header -->
        <div class="p-4 border-b border-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              :class="stationInputs[data.stationName]?.validated ? 'bg-igp-green-700' : 'bg-gray-300'"
            />
            <span class="text-sm font-bold text-igp-blue">{{ data.stationName }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">
              {{ data.meta.npts || '—' }} puntos | {{ data.meta.fs || '—' }}
            </span>
            <span
              v-if="stationInputs[data.stationName]?.validated"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-igp-green-50 text-igp-green-800 text-xs font-semibold rounded-full"
            >
              <AppIcon name="check" :size="12" />
              Validado
            </span>
          </div>
        </div>

        <!-- Chart + Input panel side by side -->
        <div class="flex flex-col lg:flex-row">
          <!-- Chart -->
          <div class="flex-1 min-w-0">
            <div :id="'chart-' + idx" class="w-full" style="height: 300px" />
          </div>

          <!-- Input panel -->
          <div class="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 p-4 bg-gray-50 flex flex-col gap-3">
            <h4 class="text-sm font-bold text-igp-blue">Parámetros de la onda</h4>

            <!-- Tiempo Onda P -->
            <div>
              <label class="text-xs font-medium text-gray-600 mb-1 block">
                Tiempo Onda P (s)
              </label>
              <input
                v-model="stationInputs[data.stationName].tP"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 25.50"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-igp-sky-blue-400 focus:border-transparent"
                :disabled="stationInputs[data.stationName]?.validated"
                @input="stationInputs[data.stationName].error = ''"
              />
            </div>

            <!-- Tiempo Onda S -->
            <div>
              <label class="text-xs font-medium text-gray-600 mb-1 block">
                Tiempo Onda S (s)
              </label>
              <input
                v-model="stationInputs[data.stationName].tS"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 45.20"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-igp-sky-blue-400 focus:border-transparent"
                :disabled="stationInputs[data.stationName]?.validated"
                @input="stationInputs[data.stationName].error = ''"
              />
            </div>

            <!-- Amplitud Máxima -->
            <div>
              <label class="text-xs font-medium text-gray-600 mb-1 block">
                Amplitud Máxima (mm)
              </label>
              <input
                v-model="stationInputs[data.stationName].maxAmp"
                type="number"
                step="0.0001"
                min="0"
                placeholder="Ej: 0.1234"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-igp-sky-blue-400 focus:border-transparent"
                :disabled="stationInputs[data.stationName]?.validated"
                @input="stationInputs[data.stationName].error = ''"
              />
            </div>

            <!-- Error -->
            <p v-if="stationInputs[data.stationName]?.error" class="text-xs text-red-600">
              {{ stationInputs[data.stationName].error }}
            </p>

            <!-- Buttons -->
            <div class="flex gap-2 mt-auto">
              <AppButton
                v-if="!stationInputs[data.stationName]?.validated"
                variant="primary"
                size="sm"
                class="flex-1"
                @click="validateStation(data.stationName, idx)"
              >
                <AppIcon name="check" :size="14" class="mr-1" />
                Validar
              </AppButton>
              <AppButton
                v-else
                variant="ghost"
                size="sm"
                class="flex-1"
                @click="resetValidation(data.stationName, idx)"
              >
                Corregir
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom navigation -->
    <div class="mt-8 flex justify-between">
      <AppButton variant="ghost" size="md" @click="goBack">
        <AppIcon name="arrow-left" :size="16" class="mr-1" />
        Anterior
      </AppButton>
      <AppButton
        variant="primary"
        size="md"
        :disabled="!allValidated"
        @click="goNext"
        :class="{ 'opacity-50 cursor-not-allowed': !allValidated }"
      >
        Siguiente paso
        <AppIcon name="arrow-right" :size="16" class="ml-1" />
      </AppButton>
    </div>
  </div>
</template>
