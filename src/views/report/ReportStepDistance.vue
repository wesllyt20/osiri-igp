<script setup>
import { computed, reactive, ref } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'

import { SEISMIC_CONSTANTS } from '@/data/seismicData'

const store = useReportStore()

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const VP = SEISMIC_CONSTANTS.VP
const VS = SEISMIC_CONSTANTS.VS

// User inputs for epicentral distance (can verify/correct)
const distInputs = reactive({})

function initInputs() {
  stations.value.forEach((s) => {
    const a = analysis.value[s]
    if (a && !distInputs[s]) {
      const deltaSP = a.tS - a.tP
      const dist = (deltaSP * VP * VS) / (VP - VS)
      distInputs[s] = {
        deltaSP: deltaSP.toFixed(2),
        distance: dist.toFixed(1),
        validated: false,
        error: '',
      }
    }
  })
}
initInputs()

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
    d.validated = false
    return
  }

  // Recalculate expected
  const deltaSP = parseFloat(d.deltaSP)
  const expected = (deltaSP * VP * VS) / (VP - VS)
  const tolerance = expected * 0.15 // 15% tolerance

  if (Math.abs(val - expected) > tolerance) {
    d.error = `Valor fuera del rango esperado (≈ ${expected.toFixed(1)} km). Revisa tu cálculo.`
    d.validated = false
    return
  }

  d.error = ''
  d.validated = true
}

function resetDistance(station) {
  const d = distInputs[station]
  if (d) {
    d.validated = false
    d.error = ''
  }
}

// Station selected for the calculation example
const selectedExampleStation = ref(null)
const darkExampleStyle = ref(true)

const exampleRow = computed(() => {
  if (selectedExampleStation.value) {
    return distRows.value.find((r) => r.station === selectedExampleStation.value) || distRows.value[0]
  }
  return distRows.value[0]
})

function viewExample(station) {
  selectedExampleStation.value = station
}

function toggleExampleStyle() {
  darkExampleStyle.value = !darkExampleStyle.value
}

const allValidated = computed(() => {
  return stations.value.length > 0 && stations.value.every((s) => distInputs[s]?.validated)
})

function goBack() {
  store.prevStep()
}

function goNext() {
  if (allValidated.value) {
    store.nextStep()
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span
          class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 4
        </span>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Distancia Epicentral
        </h1>
        <p class="text-sm text-gray-500" v-if="selectedRecord">
          Sismo: {{ selectedRecord.title }} — Cálculo de distancia epicentral por estación
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

    <!-- Formula explanation -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h4 class="font-bold text-igp-blue mb-2 text-base">Diferencia S - P</h4>
        <p class="text-sm text-gray-500 mb-4">
          Diferencia de tiempo entre la llegada de la onda S y la onda P.
        </p>
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-lg font-mono font-semibold text-igp-blue">
            ΔT = Ts - Tp
          </p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h4 class="font-bold text-igp-blue mb-2 text-base">Distancia Epicentral (Wadati)</h4>
        <p class="text-sm text-gray-500 mb-4">
          Estimación usando las velocidades promedio de ondas P ({{ VP }} km/s) y S ({{ VS.toFixed(2) }} km/s).
        </p>
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-lg font-mono font-semibold text-igp-blue">
            D ≈ ΔT × (Vp × Vs) / (Vp - Vs)
          </p>
        </div>
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
                <input v-model="distInputs[row.station].distance" type="number" step="0.1" min="0"
                  class="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-igp-sky-blue-400 font-mono"
                  :disabled="row.validated" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button class="p-1.5 rounded-lg transition-colors cursor-pointer"
                    :class="selectedExampleStation === row.station ? 'bg-igp-sky-blue-100 text-igp-sky-blue-600' : 'text-gray-400 hover:text-igp-sky-blue-600 hover:bg-gray-100'"
                    @click="viewExample(row.station)" title="Visualizar cálculo">
                    <AppIcon name="eye" :size="16" />
                  </button>
                  <button v-if="!row.validated"
                    class="px-4 py-1 text-xs font-semibold bg-igp-blue text-white rounded-lg hover:bg-igp-blue-800 transition-colors cursor-pointer"
                    @click="validateDistance(row.station)">
                    Validar
                  </button>
                  <button v-else
                    class="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    @click="resetDistance(row.station)">
                    Corregir
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

    <!-- Calculation example -->
    <div class="rounded-2xl p-4 sm:p-6 mb-8 border transition-colors duration-300"
      :class="darkExampleStyle ? 'bg-igp-blue text-white border-transparent' : 'bg-white text-gray-800 border-gray-100 shadow-sm'">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <AppIcon name="calculator" :size="20" :class="darkExampleStyle ? 'text-igp-sky-blue-400' : 'text-igp-blue'" />
          Ejemplo de cálculo
          <span v-if="exampleRow" class="ml-2 px-2 py-0.5 rounded-lg text-xs font-medium"
            :class="darkExampleStyle ? 'bg-white/20' : 'bg-igp-blue-50 text-igp-blue'">
            Estación: {{ exampleRow.station }}
          </span>
        </h3>
        <!-- Style toggle -->
        <button
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          :class="darkExampleStyle ? 'bg-white/15 text-white/80 hover:bg-white/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="toggleExampleStyle" title="Cambiar estilo">
          <div class="relative w-8 h-4 rounded-full transition-colors"
            :class="darkExampleStyle ? 'bg-igp-sky-blue-400' : 'bg-gray-300'">
            <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
              :class="darkExampleStyle ? 'translate-x-4.5' : 'translate-x-0.5'"></div>
          </div>
          <span>{{ darkExampleStyle ? 'Oscuro' : 'Claro' }}</span>
        </button>
      </div>
      <p class="text-xs mb-3" :class="darkExampleStyle ? 'text-white/60' : 'text-gray-400'">Haz clic en el ícono
        <AppIcon name="eye" :size="12" class="inline" /> de una estación para ver su cálculo detallado.
      </p>
      <div v-if="exampleRow" class="space-y-3">
        <div class="flex items-center gap-4 p-3 rounded-xl" :class="darkExampleStyle ? 'bg-white/10' : 'bg-gray-50'">
          <div class="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0"
            :class="darkExampleStyle ? 'bg-white/20 text-white' : 'bg-igp-blue-50 text-igp-blue'">1</div>
          <p class="text-sm">Leer Tp = {{ exampleRow.tP }} s y Ts = {{ exampleRow.tS }} s</p>
        </div>
        <div class="flex items-center gap-4 p-3 rounded-xl" :class="darkExampleStyle ? 'bg-white/10' : 'bg-gray-50'">
          <div class="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0"
            :class="darkExampleStyle ? 'bg-white/20 text-white' : 'bg-igp-blue-50 text-igp-blue'">2</div>
          <p class="text-sm">Calcular ΔT = Ts - Tp = {{ exampleRow.tS }} - {{ exampleRow.tP }} = {{ exampleRow.deltaSP
            }} s</p>
        </div>
        <div class="flex items-center gap-4 p-3 rounded-xl" :class="darkExampleStyle ? 'bg-white/10' : 'bg-gray-50'">
          <div class="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0"
            :class="darkExampleStyle ? 'bg-white/20 text-white' : 'bg-igp-blue-50 text-igp-blue'">3</div>
          <p class="text-sm">Aplicar fórmula: D ≈ {{ exampleRow.deltaSP }} × ({{ VP }} × {{ VS.toFixed(2) }}) / ({{ VP
            }} - {{ VS.toFixed(2) }})</p>
        </div>
        <div class="flex items-center gap-4 p-3 rounded-xl"
          :class="darkExampleStyle ? 'bg-igp-sky-blue-500/20' : 'bg-green-50 border border-green-100'">
          <div class="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0"
            :class="darkExampleStyle ? 'bg-igp-sky-blue-400/30 text-white' : 'bg-green-100 text-green-700'">4</div>
          <p class="text-sm font-semibold" :class="darkExampleStyle ? '' : 'text-green-700'">D ≈ {{ exampleRow.distance
            }} km</p>
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
