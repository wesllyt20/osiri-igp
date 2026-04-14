<script setup>
import { computed } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { SEISMIC_CONSTANTS, STATIONS_CATALOG } from '@/data/seismicData'
import Swal from 'sweetalert2'

const store = useReportStore()

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const VP = SEISMIC_CONSTANTS.VP
const VS = SEISMIC_CONSTANTS.VS

// Compute depths estimate: use average S-P to estimate depth
// Simplified: h ≈ (avgDistance^2 - D_surface^2)^0.5 where D_surface ~ avgDistance * 0.9
// Or use the record's known depth
const estimatedDepth = computed(() => {
  const info = selectedRecord.value?.info
  if (info?.profundidad) return info.profundidad
  return '---'
})

const reportFields = computed(() => {
  const info = selectedRecord.value?.info || {}
  const ep = store.userEpicenter
  const mag = store.userMagnitude

  return [
    { label: 'Fecha', value: selectedRecord.value?.date || '---', icon: 'clock' },
    { label: 'Hora', value: selectedRecord.value?.time ? `${selectedRecord.value.time} UTC` : '---', icon: 'clock' },
    { label: 'Magnitud', value: mag != null ? `${mag.toFixed(1)} ML` : '---', icon: 'zap', highlight: mag != null },
    { label: 'Latitud', value: ep ? `${ep.lat.toFixed(4)}°` : '---', icon: 'map-pin', highlight: !!ep },
    { label: 'Longitud', value: ep ? `${ep.lng.toFixed(4)}°` : '---', icon: 'compass', highlight: !!ep },
    { label: 'Profundidad', value: estimatedDepth.value, icon: 'layers' },
    { label: 'Referencia', value: info.referencia || '---', icon: 'target' },
    { label: 'Región', value: info.region || '---', icon: 'globe' },
  ]
})

const stationSummary = computed(() => {
  return stations.value
    .map((s) => {
      const a = analysis.value[s]
      const coords = STATIONS_CATALOG[s]
      if (!a || !coords) return null
      const deltaSP = a.tS - a.tP
      const distance = (deltaSP * VP * VS) / (VP - VS)
      return { station: s, name: coords.name, tP: a.tP, tS: a.tS, deltaSP, distance, maxAmp: a.maxAmp }
    })
    .filter(Boolean)
})

function goBack() {
  store.prevStep()
}

async function finishReport() {
  store.markCompleted(8)
  await Swal.fire({
    title: '¡Reporte completado!',
    html: `
      <p style="color:#666;font-size:14px;line-height:1.8">
        Has completado todos los pasos del análisis sísmico.<br>
        El reporte del <strong>${selectedRecord.value?.title || 'sismo'}</strong> ha sido generado exitosamente.
      </p>
    `,
    icon: 'success',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#04b363',
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 8
        </span>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Reporte Sísmico
        </h1>
        <p class="text-gray-500" v-if="selectedRecord">
          {{ selectedRecord.title }} — Resumen final del análisis
        </p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="ghost" size="sm" @click="goBack">
          <AppIcon name="arrow-left" :size="16" class="mr-1" />
          Atrás
        </AppButton>
        <AppButton variant="success" size="sm" @click="finishReport">
          <AppIcon name="check" :size="16" class="mr-1" />
          Finalizar Reporte
        </AppButton>
      </div>
    </div>

    <!-- Report header card -->
    <div class="bg-linear-to-br from-igp-blue to-igp-blue-ocean-800 rounded-2xl p-8 text-white relative overflow-hidden mb-6">
      <div class="absolute top-0 right-0 w-40 h-40 bg-igp-sky-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-igp-sky-blue-600/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div class="relative">
        <div class="flex items-center gap-3 mb-4">
          <div>
            <p class="text-lg font-bold">Reporte Sísmico</p>
            <p class="text-xs text-gray-300">Instituto Geofísico del Perú — Operador Sísmico</p>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 flex-wrap">
          <div class="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-extrabold">{{ store.userMagnitude != null ? store.userMagnitude.toFixed(1) : '---' }}</p>
            <p class="text-[10px] text-red-200">Magnitud ML</p>
          </div>
          <div class="bg-white/10 rounded-xl px-4 py-2 text-center">
            <p class="text-lg font-bold">{{ estimatedDepth }}</p>
            <p class="text-[10px] text-gray-300">Profundidad</p>
          </div>
          <div class="bg-white/10 rounded-xl px-4 py-2">
            <p class="text-sm font-semibold">{{ selectedRecord?.info?.referencia || '---' }}</p>
            <p class="text-[10px] text-gray-300">Ubicación referencial</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Data Grid -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-5 border-b border-gray-100">
        <h3 class="text-lg font-bold text-igp-blue flex items-center gap-2">
          <AppIcon name="file-text" :size="20" class="text-igp-sky-blue-600" />
          Parámetros del Evento
        </h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 divide-x-0 sm:divide-x divide-y sm:divide-y divide-gray-100">
        <div
          v-for="field in reportFields"
          :key="field.label"
          class="flex items-center gap-3 px-5 py-4"
          :class="{ 'bg-igp-green-50': field.highlight }"
        >
          <AppIcon :name="field.icon" :size="18" class="text-igp-sky-blue-600 shrink-0" />
          <div>
            <p class="text-xs text-gray-400 font-medium">{{ field.label }}</p>
            <p class="text-sm font-semibold text-igp-blue">{{ field.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Station analysis summary table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="activity" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Resumen de estaciones analizadas</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Tp (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ts (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ts-Tp (s)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Distancia (km)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Amp. Máx (mm)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in stationSummary"
              :key="s.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-bold text-igp-blue">{{ s.station }} <span class="text-xs text-gray-400 font-normal">({{ s.name }})</span></td>
              <td class="px-4 py-3 font-mono">{{ s.tP.toFixed(2) }}</td>
              <td class="px-4 py-3 font-mono">{{ s.tS.toFixed(2) }}</td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-sky-blue-700">{{ s.deltaSP.toFixed(2) }}</td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ s.distance.toFixed(1) }}</td>
              <td class="px-4 py-3 font-mono">{{ s.maxAmp.toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Observations -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
      <h3 class="text-lg font-bold text-igp-blue mb-3">Observaciones</h3>
      <p class="text-gray-600 leading-relaxed">
        {{ selectedRecord?.info?.observaciones || 'Sin observaciones disponibles.' }}
      </p>
    </div>

    <!-- Epicenter info -->
    <div v-if="store.userEpicenter" class="bg-igp-sky-blue-50 rounded-2xl border border-igp-sky-blue-200 p-6 mb-6">
      <h3 class="text-base font-bold text-igp-blue mb-2 flex items-center gap-2">
        <AppIcon name="map-pin" :size="18" class="text-igp-sky-blue-600" />
        Epicentro determinado
      </h3>
      <p class="text-sm text-igp-sky-blue-800">
        Latitud: <strong>{{ store.userEpicenter.lat.toFixed(4) }}°</strong> |
        Longitud: <strong>{{ store.userEpicenter.lng.toFixed(4) }}°</strong>
      </p>
    </div>

    <!-- Bottom navigation -->
    <div class="mt-8 flex justify-between">
      <AppButton variant="ghost" size="md" @click="goBack">
        <AppIcon name="arrow-left" :size="16" class="mr-1" />
        Anterior
      </AppButton>
      <AppButton variant="success" size="md" @click="finishReport">
        <AppIcon name="check" :size="16" class="mr-1" />
        Finalizar Reporte
      </AppButton>
    </div>
  </div>
</template>
