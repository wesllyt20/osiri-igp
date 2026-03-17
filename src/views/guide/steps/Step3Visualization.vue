<script setup>
import { ref, computed } from 'vue'
import SeismicChart from '@/components/molecules/SeismicChart.vue'
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

// Generate realistic mock seismic waveform data
function generateSeismicSignal(samples = 1000, sRate = 100) {
  const time = []
  const amplitude = []
  const dt = 1 / sRate

  for (let i = 0; i < samples; i++) {
    const t = i * dt
    time.push(t)

    let a = 0
    // Background noise
    a += (Math.random() - 0.5) * 0.02

    // P-wave arrival at ~2s
    if (t >= 2 && t < 3.5) {
      const env = Math.exp(-2 * (t - 2)) * Math.sin(2 * Math.PI * 8 * (t - 2))
      a += env * 0.3
    }

    // S-wave arrival at ~4s (larger amplitude)
    if (t >= 4 && t < 7) {
      const env = Math.exp(-0.8 * (t - 4)) * Math.sin(2 * Math.PI * 4 * (t - 4))
      a += env * 0.8
    }

    // Coda (gradual decay)
    if (t >= 7) {
      const env = Math.exp(-0.5 * (t - 7)) * Math.sin(2 * Math.PI * 2 * (t - 7))
      a += env * 0.15
    }

    amplitude.push(a)
  }
  return { time, amplitude }
}

const signal = generateSeismicSignal()

const traces = computed(() => [
  {
    x: signal.time,
    y: signal.amplitude,
    type: 'scatter',
    mode: 'lines',
    name: 'Señal sísmica',
    line: { color: '#00214f', width: 1.2 },
    hovertemplate: 'Tiempo: %{x:.2f}s<br>Amplitud: %{y:.4f}<extra></extra>',
  },
])

const layout = computed(() => ({
  title: {
    text: 'Sismograma — Señal Sísmica de Ejemplo',
    font: { size: 15, color: '#00214f' },
  },
  xaxis: {
    title: { text: 'Tiempo (s)', font: { size: 12 } },
    gridcolor: '#e5e7eb',
    range: [0, 10],
  },
  yaxis: {
    title: { text: 'Amplitud', font: { size: 12 } },
    gridcolor: '#e5e7eb',
  },
  shapes: [
    // P-wave marker
    {
      type: 'line',
      x0: 2,
      x1: 2,
      y0: -1,
      y1: 1,
      line: { color: '#0099ff', width: 2, dash: 'dash' },
    },
    // S-wave marker
    {
      type: 'line',
      x0: 4,
      x1: 4,
      y0: -1,
      y1: 1,
      line: { color: '#ff8d3a', width: 2, dash: 'dash' },
    },
  ],
  annotations: [
    {
      x: 2,
      y: 0.85,
      text: '<b>Onda P</b>',
      showarrow: true,
      arrowhead: 2,
      ax: -40,
      ay: -30,
      font: { color: '#0099ff', size: 12 },
      arrowcolor: '#0099ff',
    },
    {
      x: 4,
      y: 0.85,
      text: '<b>Onda S</b>',
      showarrow: true,
      arrowhead: 2,
      ax: 40,
      ay: -30,
      font: { color: '#ff8d3a', size: 12 },
      arrowcolor: '#ff8d3a',
    },
  ],
}))

const chartFeatures = [
  { icon: 'crosshair', label: 'Zoom', desc: 'Selecciona un área para hacer zoom' },
  { icon: 'activity', label: 'Pan', desc: 'Desplázate por la señal' },
  { icon: 'info', label: 'Hover', desc: 'Pasa el cursor para ver valores' },
  { icon: 'download', label: 'Exportar', desc: 'Descarga la gráfica como imagen' },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Description -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-3">Visualización Interactiva</h3>
      <p class="text-gray-600 leading-relaxed">
        A continuación se muestra un sismograma de ejemplo generado con datos simulados.
        Utiliza las herramientas de la gráfica para explorar la señal: puedes hacer zoom,
        desplazarte, y pasar el cursor sobre la traza para ver los valores exactos de
        tiempo y amplitud en cada punto.
      </p>
    </div>

    <!-- Chart -->
    <SeismicChart :traces="traces" :layout="layout" height="450px" />

    <!-- Chart tools description -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="feature in chartFeatures"
        :key="feature.label"
        class="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm"
      >
        <AppIcon :name="feature.icon" :size="22" class="text-igp-sky-blue-600 mx-auto mb-2" />
        <p class="text-sm font-semibold text-gray-700">{{ feature.label }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ feature.desc }}</p>
      </div>
    </div>

    <!-- Anatomy -->
    <AlertBox icon="info" variant="info">
      <p class="font-semibold mb-1">Anatomía del sismograma</p>
      <p>
        En esta gráfica puedes observar: la <strong class="text-igp-sky-blue-600">línea azul punteada</strong>
        marca la llegada de la <strong>onda P</strong> (≈ 2.0 s), y la
        <strong class="text-[#ff8d3a]">línea naranja punteada</strong> marca la llegada de la
        <strong>onda S</strong> (≈ 4.0 s). La diferencia S-P es de aproximadamente 2.0 segundos.
      </p>
    </AlertBox>

    <!-- Key elements to observe -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-4 flex items-center gap-2">
        <AppIcon name="crosshair" :size="20" class="text-igp-sky-blue-600" />
        Elementos a observar
      </h3>
      <div class="space-y-3">
        <div class="flex items-start gap-3 p-3 bg-igp-sky-blue-50 rounded-xl">
          <div class="w-3 h-3 rounded-full bg-igp-sky-blue-600 flex-shrink-0 mt-1.5" />
          <div>
            <p class="text-sm font-semibold text-igp-dark-blue-500">Llegada de Onda P</p>
            <p class="text-xs text-gray-500">Primera perturbación visible. La amplitud es menor pero marca el inicio del evento.</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-igp-orange-50 rounded-xl">
          <div class="w-3 h-3 rounded-full bg-igp-orange-500 flex-shrink-0 mt-1.5" />
          <div>
            <p class="text-sm font-semibold text-igp-dark-blue-500">Llegada de Onda S</p>
            <p class="text-xs text-gray-500">Llegada posterior con mayor amplitud. Es crucial para el cálculo de distancia.</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <div class="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
          <div>
            <p class="text-sm font-semibold text-igp-dark-blue-500">Amplitud Máxima</p>
            <p class="text-xs text-gray-500">El punto de mayor desplazamiento, utilizado para calcular la magnitud del evento.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
