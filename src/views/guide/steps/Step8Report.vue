<script setup>
import { computed } from 'vue'
import SeismicChart from '@/components/molecules/SeismicChart.vue'
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

// Mock report data
const report = {
  date: '2026-03-06',
  time: '14:23:15',
  timeZone: 'UTC',
  magnitude: '4.5',
  magnitudeType: 'ML',
  latitude: '-12.45°',
  longitude: '-76.89°',
  depth: '35',
  depthUnit: 'km',
  location: '60 km al Suroeste de Lima',
  region: 'Costa Central del Perú',
  stationsUsed: 5,
  rmsResidual: '0.42 s',
  gap: '120°',
  felt: 'Sí, reportado en Lima Metropolitana',
  observations: 'Evento de tipo cortical, registrado en 5 estaciones de la red sísmica nacional. No se reportaron daños. Intensidad máxima estimada: III (MM).',
}

// Mini chart for report
function generateMiniSignal() {
  const time = []
  const amp = []
  for (let i = 0; i < 600; i++) {
    const t = i * 0.015
    time.push(t)
    let a = (Math.random() - 0.5) * 0.01
    if (t >= 1.5 && t < 2.5) a += Math.exp(-3 * (t - 1.5)) * Math.sin(2 * Math.PI * 10 * (t - 1.5)) * 0.2
    if (t >= 3.0 && t < 6.0) a += Math.exp(-0.8 * (t - 3.0)) * Math.sin(2 * Math.PI * 3.5 * (t - 3.0)) * 0.65
    if (t >= 6.0) a += Math.exp(-0.5 * (t - 6.0)) * Math.sin(2 * Math.PI * 2 * (t - 6.0)) * 0.08
    amp.push(a)
  }
  return { time, amp }
}

const signal = generateMiniSignal()

const reportTraces = computed(() => [
  {
    x: signal.time,
    y: signal.amp,
    type: 'scatter',
    mode: 'lines',
    name: 'Señal registrada',
    line: { color: '#00214f', width: 1 },
  },
])

const reportLayout = computed(() => ({
  title: { text: 'Forma de Onda Representativa', font: { size: 13, color: '#00214f' } },
  xaxis: { title: { text: 'Tiempo (s)', font: { size: 11 } }, gridcolor: '#e5e7eb' },
  yaxis: { title: { text: 'Amplitud', font: { size: 11 } }, gridcolor: '#e5e7eb' },
  margin: { t: 40, r: 15, b: 45, l: 55 },
  shapes: [
    { type: 'line', x0: 1.5, x1: 1.5, y0: -0.8, y1: 0.8, line: { color: '#0099ff', width: 1.5, dash: 'dot' } },
    { type: 'line', x0: 3.0, x1: 3.0, y0: -0.8, y1: 0.8, line: { color: '#ff8d3a', width: 1.5, dash: 'dot' } },
  ],
}))

const reportFields = [
  { label: 'Fecha', value: report.date, icon: 'clock' },
  { label: 'Hora', value: `${report.time} ${report.timeZone}`, icon: 'clock' },
  { label: 'Magnitud', value: `${report.magnitude} ${report.magnitudeType}`, icon: 'zap' },
  { label: 'Latitud', value: report.latitude, icon: 'map-pin' },
  { label: 'Longitud', value: report.longitude, icon: 'compass' },
  { label: 'Profundidad', value: `${report.depth} ${report.depthUnit}`, icon: 'layers' },
  { label: 'Ubicación', value: report.location, icon: 'target' },
  { label: 'Región', value: report.region, icon: 'globe' },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Report Header -->
    <div class="bg-gradient-to-br from-igp-dark-blue-500 to-igp-blue-ocean-800 rounded-2xl p-8 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-40 h-40 bg-igp-sky-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-igp-sky-blue-600/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div class="relative flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <img src="/logo_igp.png" alt="IGP" class="h-12 w-auto" />
            <div>
              <p class="text-lg font-bold">Reporte Sísmico</p>
              <p class="text-xs text-gray-300">Instituto Geofísico del Perú - DCTS</p>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-4 flex-wrap">
            <div class="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 text-center">
              <p class="text-2xl font-extrabold">{{ report.magnitude }}</p>
              <p class="text-[10px] text-red-200">Magnitud {{ report.magnitudeType }}</p>
            </div>
            <div class="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p class="text-lg font-bold">{{ report.depth }} km</p>
              <p class="text-[10px] text-gray-300">Profundidad</p>
            </div>
            <div class="bg-white/10 rounded-xl px-4 py-2">
              <p class="text-sm font-semibold">{{ report.location }}</p>
              <p class="text-[10px] text-gray-300">Ubicación referencial</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Data Grid -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h3 class="text-lg font-bold text-igp-dark-blue-500 flex items-center gap-2">
          <AppIcon name="file-text" :size="20" class="text-igp-sky-blue-600" />
          Parámetros del Evento
        </h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 divide-x-0 sm:divide-x divide-y sm:divide-y divide-gray-100">
        <div
          v-for="field in reportFields"
          :key="field.label"
          class="flex items-center gap-3 px-5 py-4"
        >
          <AppIcon :name="field.icon" :size="18" class="text-igp-sky-blue-600 flex-shrink-0" />
          <div>
            <p class="text-xs text-gray-400 font-medium">{{ field.label }}</p>
            <p class="text-sm font-semibold text-igp-dark-blue-500">{{ field.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart in report -->
    <SeismicChart :traces="reportTraces" :layout="reportLayout" height="320px" />

    <!-- Technical details -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-4 flex items-center gap-2">
        <AppIcon name="info" :size="20" class="text-igp-sky-blue-600" />
        Información Técnica
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Estaciones Utilizadas</p>
          <p class="text-2xl font-bold text-igp-dark-blue-500">{{ report.stationsUsed }}</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">RMS Residual</p>
          <p class="text-2xl font-bold text-igp-dark-blue-500">{{ report.rmsResidual }}</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">GAP Azimutal</p>
          <p class="text-2xl font-bold text-igp-dark-blue-500">{{ report.gap }}</p>
        </div>
      </div>
    </div>

    <!-- Observations -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-3">Observaciones</h3>
      <p class="text-gray-600 leading-relaxed">{{ report.observations }}</p>
    </div>

    <!-- Felt reports -->
    <div class="bg-igp-sky-blue-50 rounded-2xl border border-igp-sky-blue-200 p-6">
      <h3 class="text-base font-bold text-igp-dark-blue-500 mb-2 flex items-center gap-2">
        <AppIcon name="alert-circle" :size="18" class="text-igp-sky-blue-600" />
        Percepción
      </h3>
      <p class="text-sm text-igp-sky-blue-800">{{ report.felt }}</p>
    </div>

    <!-- Completion message -->
    <AlertBox icon="check-circle" variant="success">
      <p class="font-semibold mb-1">¡Has completado la guía!</p>
      <p>
        Felicitaciones. Has recorrido todos los pasos necesarios para analizar un evento sísmico
        y generar un reporte completo. Este conocimiento es la base para operar como analista
        sísmico profesional en un centro de monitoreo.
      </p>
    </AlertBox>
  </div>
</template>
