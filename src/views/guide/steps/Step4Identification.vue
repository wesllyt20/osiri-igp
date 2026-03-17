<script setup>
import { ref, computed } from 'vue'
import SeismicChart from '@/components/molecules/SeismicChart.vue'
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

// Simulated seismic signal data
function generateSignal() {
  const time = []
  const amp = []
  for (let i = 0; i < 800; i++) {
    const t = i * 0.0125
    time.push(t)
    let a = (Math.random() - 0.5) * 0.015
    // Onda P at ~2.0s
    if (t >= 2.0 && t < 3.2) {
      a += Math.exp(-2.5 * (t - 2.0)) * Math.sin(2 * Math.PI * 9 * (t - 2.0)) * 0.25
    }
    // Onda S at ~3.8s
    if (t >= 3.8 && t < 6.5) {
      a += Math.exp(-0.7 * (t - 3.8)) * Math.sin(2 * Math.PI * 3.5 * (t - 3.8)) * 0.7
    }
    if (t >= 6.5) {
      a += Math.exp(-0.6 * (t - 6.5)) * Math.sin(2 * Math.PI * 2 * (t - 6.5)) * 0.1
    }
    amp.push(a)
  }
  return { time, amp }
}

const data = generateSignal()
const showPMarker = ref(true)
const showSMarker = ref(true)

const traces = computed(() => [
  {
    x: data.time,
    y: data.amp,
    type: 'scatter',
    mode: 'lines',
    name: 'Señal sísmica',
    line: { color: '#00214f', width: 1.3 },
  },
])

const layout = computed(() => {
  const shapes = []
  const annotations = []

  if (showPMarker.value) {
    shapes.push({
      type: 'line', x0: 2.0, x1: 2.0, y0: -1, y1: 1,
      line: { color: '#0099ff', width: 2.5, dash: 'dash' },
    })
    shapes.push({
      type: 'rect', x0: 2.0, x1: 3.2, y0: -1, y1: 1,
      fillcolor: 'rgba(0,153,255,0.06)', line: { width: 0 },
    })
    annotations.push({
      x: 2.0, y: 0.75, text: '<b>Tp = 2.0 s</b>', showarrow: true,
      arrowhead: 2, ax: -50, ay: -25, font: { color: '#0099ff', size: 11 }, arrowcolor: '#0099ff',
    })
  }

  if (showSMarker.value) {
    shapes.push({
      type: 'line', x0: 3.8, x1: 3.8, y0: -1, y1: 1,
      line: { color: '#ff8d3a', width: 2.5, dash: 'dash' },
    })
    shapes.push({
      type: 'rect', x0: 3.8, x1: 6.5, y0: -1, y1: 1,
      fillcolor: 'rgba(255,141,58,0.06)', line: { width: 0 },
    })
    annotations.push({
      x: 3.8, y: 0.75, text: '<b>Ts = 3.8 s</b>', showarrow: true,
      arrowhead: 2, ax: 50, ay: -25, font: { color: '#ff8d3a', size: 11 }, arrowcolor: '#ff8d3a',
    })
  }

  return {
    title: { text: 'Identificación de Ondas P y S', font: { size: 14, color: '#00214f' } },
    xaxis: { title: { text: 'Tiempo (s)' }, gridcolor: '#e5e7eb', range: [0, 10] },
    yaxis: { title: { text: 'Amplitud' }, gridcolor: '#e5e7eb' },
    shapes,
    annotations,
  }
})

const criteria = [
  {
    wave: 'P',
    color: 'igp-sky-blue',
    items: [
      'Primer movimiento visible respecto al ruido de fondo',
      'Amplitud inicial relativamente pequeña',
      'Frecuencia más alta que la onda S',
      'Movimiento compresional (push-pull)',
    ],
  },
  {
    wave: 'S',
    color: 'igp-orange',
    items: [
      'Incremento significativo de amplitud tras la onda P',
      'Frecuencia generalmente más baja que la onda P',
      'Mayor duración de la fase',
      'Movimiento transversal (perpendicular)',
    ],
  },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Controls -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-4">Visualización con marcadores</h3>
      <p class="text-gray-600 text-sm mb-4 leading-relaxed">
        Activa o desactiva los marcadores de las ondas P y S para entender visualmente
        dónde comienza cada fase en el sismograma.
      </p>
      <div class="flex flex-wrap gap-4">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="showPMarker"
            type="checkbox"
            class="w-4 h-4 text-igp-sky-blue-600 rounded focus:ring-igp-sky-blue-400"
          />
          <span class="text-sm font-medium text-gray-700">Mostrar Onda P</span>
          <span class="w-3 h-3 rounded-full bg-igp-sky-blue-600" />
        </label>
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="showSMarker"
            type="checkbox"
            class="w-4 h-4 text-igp-orange-500 rounded focus:ring-igp-orange-400"
          />
          <span class="text-sm font-medium text-gray-700">Mostrar Onda S</span>
          <span class="w-3 h-3 rounded-full bg-igp-orange-500" />
        </label>
      </div>
    </div>

    <!-- Chart -->
    <SeismicChart :traces="traces" :layout="layout" height="420px" />

    <!-- Identification criteria -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="c in criteria"
        :key="c.wave"
        class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            :class="c.wave === 'P' ? 'bg-igp-sky-blue-600' : 'bg-igp-orange-500'"
          >
            {{ c.wave }}
          </div>
          <h4 class="font-bold text-igp-dark-blue-500">
            Criterios para identificar la Onda {{ c.wave }}
          </h4>
        </div>
        <ul class="space-y-2">
          <li v-for="(item, i) in c.items" :key="i" class="flex items-start gap-2 text-sm text-gray-600">
            <AppIcon
              name="check-circle"
              :size="16"
              class="flex-shrink-0 mt-0.5"
              :class="c.wave === 'P' ? 'text-igp-sky-blue-600' : 'text-igp-orange-500'"
            />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Tip -->
    <AlertBox icon="alert-circle" variant="warning">
      <p class="font-semibold mb-1">Consejo práctico</p>
      <p>
        En señales con bajo ratio señal/ruido, la identificación de la onda P puede ser difícil.
        Intenta hacer zoom en la región previa al evento y busca el primer cambio consistente
        en la forma de onda respecto al ruido de fondo.
      </p>
    </AlertBox>
  </div>
</template>
