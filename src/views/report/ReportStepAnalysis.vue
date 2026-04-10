<script setup>
import { computed } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const store = useReportStore()

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const analysisRows = computed(() => {
  return stations.value
    .map((s) => {
      const a = analysis.value[s]
      if (!a) return null
      const deltaSP = (a.tS - a.tP).toFixed(2)
      return {
        station: s,
        tP: a.tP.toFixed(2),
        tS: a.tS.toFixed(2),
        deltaSP,
        maxAmp: a.maxAmp.toFixed(4),
      }
    })
    .filter(Boolean)
})

function goBack() {
  store.prevStep()
}

function goNext() {
  store.nextStep()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 3
        </span>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Resumen de Datos Obtenidos
        </h1>
        <p class="text-gray-500" v-if="selectedRecord">
          Sismo: {{ selectedRecord.title }} — Datos recopilados de {{ analysisRows.length }} estaciones
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

    <!-- Resumen tabla -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="file-text" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Tabla de parámetros por estación</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Tp (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ts (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ts - Tp (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Amplitud Máx. (mm)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in analysisRows"
              :key="row.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-400">{{ idx + 1 }}</td>
              <td class="px-4 py-3 font-bold text-igp-blue">{{ row.station }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-igp-sky-blue-50 text-igp-sky-blue-700 rounded font-mono text-xs font-semibold">
                  {{ row.tP }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-igp-orange-50 text-igp-orange-700 rounded font-mono text-xs font-semibold">
                  {{ row.tS }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold text-igp-blue">{{ row.deltaSP }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold text-red-600">{{ row.maxAmp }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Station detail cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="row in analysisRows"
        :key="row.station"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-igp-blue flex items-center justify-center">
            <AppIcon name="activity" :size="20" class="text-white" />
          </div>
          <div>
            <h3 class="font-bold text-igp-blue">{{ row.station }}</h3>
            <p class="text-xs text-gray-400">Estación sismológica</p>
          </div>
          <div class="ml-auto">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-igp-green-50 text-igp-green-800 text-xs font-semibold rounded-full">
              <AppIcon name="check" :size="12" />
              Validado
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-igp-sky-blue-50 rounded-xl p-3">
            <p class="text-xs text-igp-sky-blue-600 mb-1 font-medium">Onda P</p>
            <p class="text-lg font-extrabold text-igp-blue">
              {{ row.tP }} <span class="text-xs font-normal text-gray-400">s</span>
            </p>
          </div>
          <div class="bg-igp-orange-50 rounded-xl p-3">
            <p class="text-xs text-igp-orange-600 mb-1 font-medium">Onda S</p>
            <p class="text-lg font-extrabold text-igp-blue">
              {{ row.tS }} <span class="text-xs font-normal text-gray-400">s</span>
            </p>
          </div>
          <div class="bg-gray-50 rounded-xl p-3">
            <p class="text-xs text-gray-500 mb-1 font-medium">ΔT (S - P)</p>
            <p class="text-lg font-extrabold text-igp-blue">
              {{ row.deltaSP }} <span class="text-xs font-normal text-gray-400">s</span>
            </p>
          </div>
          <div class="bg-red-50 rounded-xl p-3">
            <p class="text-xs text-red-500 mb-1 font-medium">Amplitud Máx.</p>
            <p class="text-lg font-extrabold text-igp-blue">
              {{ row.maxAmp }} <span class="text-xs font-normal text-gray-400">mm</span>
            </p>
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
      <AppButton variant="primary" size="md" @click="goNext">
        Calcular Distancia Epicentral
        <AppIcon name="arrow-right" :size="16" class="ml-1" />
      </AppButton>
    </div>
  </div>
</template>
