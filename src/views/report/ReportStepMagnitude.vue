<script setup>
import { computed, onMounted, onUnmounted, nextTick, ref, watch } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { SEISMIC_CONSTANTS } from '@/data/seismicData'
import Swal from 'sweetalert2'

const store = useReportStore()
const chartReady = ref(false)
const canvasRef = ref(null)

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const VP = SEISMIC_CONSTANTS.VP
const VS = SEISMIC_CONSTANTS.VS

const selectedMagnitude = ref(store.userMagnitude)

// Station visibility toggles
const stationVisibility = ref({})

watch(stations, (s) => {
  const vis = {}
  s.forEach((st) => { vis[st] = true })
  stationVisibility.value = vis
}, { immediate: true })

const STATION_COLORS = ['#0032ff', '#ff8d3a', '#04b363', '#9333ea', '#e20000', '#0099ff']

const stationData = computed(() => {
  return stations.value
    .map((s, idx) => {
      const a = analysis.value[s]
      if (!a) return null
      const deltaSP = a.tS - a.tP
      const distance = (deltaSP * VP * VS) / (VP - VS)
      const maxAmp = a.maxAmp || 0
      const ml = maxAmp > 0 && distance > 0
        ? Math.log10(maxAmp) + 2.76 * Math.log10(distance) - 2.48
        : null
      return { station: s, distance, maxAmp, magnitude: ml, color: STATION_COLORS[idx % STATION_COLORS.length] }
    })
    .filter(Boolean)
})

const avgMagnitude = computed(() => {
  const mags = stationData.value.filter((d) => d.magnitude !== null).map((d) => d.magnitude)
  if (!mags.length) return null
  return mags.reduce((a, b) => a + b, 0) / mags.length
})

// ── Nomogram drawing ──
// Three vertical log axes: Distance (left), Magnitude (center), Amplitude (right)
// Distance: 20-800 km (log)
// Magnitude: 1.0-8.0 (linear)
// Amplitude: 0.1-500 mm (log)

const NOMO = {
  distMin: 20, distMax: 800,
  magMin: 1.0, magMax: 8.0,
  ampMin: 0.1, ampMax: 500,
  padTop: 50, padBottom: 60, padLeft: 70, padRight: 70,
  axisSpacing: 0, // computed at render
}

function logPos(val, min, max, pxTop, pxBottom) {
  const logMin = Math.log10(min)
  const logMax = Math.log10(max)
  const frac = (Math.log10(val) - logMin) / (logMax - logMin)
  return pxBottom - frac * (pxBottom - pxTop)
}

function linPos(val, min, max, pxTop, pxBottom) {
  const frac = (val - min) / (max - min)
  return pxBottom - frac * (pxBottom - pxTop)
}

function yToMag(y, pxTop, pxBottom) {
  const frac = (pxBottom - y) / (pxBottom - pxTop)
  return NOMO.magMin + frac * (NOMO.magMax - NOMO.magMin)
}

function renderNomogram() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement.getBoundingClientRect()
  const W = rect.width
  const H = 560

  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  const top = NOMO.padTop
  const bot = H - NOMO.padBottom
  const xLeft = NOMO.padLeft
  const xRight = W - NOMO.padRight
  const xMid = (xLeft + xRight) / 2

  // ── Draw three vertical axes ──
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 2

  // Left axis - Distance
  ctx.beginPath(); ctx.moveTo(xLeft, top); ctx.lineTo(xLeft, bot); ctx.stroke()
  // Center axis - Magnitude
  ctx.beginPath(); ctx.moveTo(xMid, top); ctx.lineTo(xMid, bot); ctx.stroke()
  // Right axis - Amplitude
  ctx.beginPath(); ctx.moveTo(xRight, top); ctx.lineTo(xRight, bot); ctx.stroke()

  ctx.textAlign = 'center'
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillStyle = '#1f2937'
  ctx.fillText('Distancia', xLeft, H - 10)
  ctx.fillText('(kilómetros)', xLeft, H - 0)
  ctx.fillText('Magnitud', xMid, H - 10)
  ctx.fillText('Richter', xMid, H - 0)
  ctx.fillText('Amplitud', xRight, H - 10)
  ctx.fillText('(milímetros)', xRight, H - 0)

  // Title
  ctx.font = 'bold 18px Poppins, sans-serif'
  ctx.fillStyle = '#00214f'
  ctx.fillText('El Nomograma de Richter', W / 2, 28)

  // ── Distance ticks (left axis, log) ──
  const distTicks = [20, 30, 40, 60, 80, 100, 200, 300, 400, 500, 600, 700, 800]
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'right'
  distTicks.forEach((d) => {
    const y = logPos(d, NOMO.distMin, NOMO.distMax, top, bot)
    ctx.beginPath(); ctx.moveTo(xLeft - 6, y); ctx.lineTo(xLeft, y); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillText(d.toString(), xLeft - 10, y + 4)
    // Light grid line
    ctx.beginPath(); ctx.moveTo(xLeft, y); ctx.lineTo(xLeft + 8, y); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5; ctx.stroke()
  })

  // ── Magnitude ticks (center axis, linear) ──
  ctx.textAlign = 'center'
  for (let m = 1.0; m <= 8.0; m += 0.5) {
    const y = linPos(m, NOMO.magMin, NOMO.magMax, top, bot)
    const isInt = Number.isInteger(m)
    ctx.beginPath()
    ctx.moveTo(xMid - (isInt ? 6 : 4), y)
    ctx.lineTo(xMid + (isInt ? 6 : 4), y)
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = isInt ? 1.5 : 0.8
    ctx.stroke()
    if (isInt) {
      ctx.font = 'bold 12px Poppins, sans-serif'
      ctx.fillStyle = '#1f2937'
      ctx.fillText(m.toFixed(1), xMid - 20, y + 4)
    }
  }

  // ── Amplitude ticks (right axis, log) ──
  const ampTicks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]
  ctx.textAlign = 'left'
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillStyle = '#374151'
  ampTicks.forEach((a) => {
    const y = logPos(a, NOMO.ampMin, NOMO.ampMax, top, bot)
    ctx.beginPath(); ctx.moveTo(xRight, y); ctx.lineTo(xRight + 6, y); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillText(a >= 1 ? a.toString() : a.toFixed(1), xRight + 10, y + 4)
    ctx.beginPath(); ctx.moveTo(xRight - 8, y); ctx.lineTo(xRight, y); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5; ctx.stroke()
  })

  // ── Draw station lines ──
  stationData.value.forEach((d) => {
    if (!stationVisibility.value[d.station]) return
    if (!d.magnitude || d.maxAmp <= 0 || d.distance < NOMO.distMin) return

    const yDist = logPos(Math.min(Math.max(d.distance, NOMO.distMin), NOMO.distMax), NOMO.distMin, NOMO.distMax, top, bot)
    const yAmp = logPos(Math.min(Math.max(d.maxAmp, NOMO.ampMin), NOMO.ampMax), NOMO.ampMin, NOMO.ampMax, top, bot)
    const yMag = linPos(Math.min(Math.max(d.magnitude, NOMO.magMin), NOMO.magMax), NOMO.magMin, NOMO.magMax, top, bot)

    // Line from distance to amplitude passing through magnitude
    ctx.beginPath()
    ctx.moveTo(xLeft, yDist)
    ctx.lineTo(xMid, yMag)
    ctx.lineTo(xRight, yAmp)
    ctx.strokeStyle = d.color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.8
    ctx.stroke()
    ctx.globalAlpha = 1

    // Dots on each axis
    const dotR = 5
    // distance dot
    ctx.beginPath(); ctx.arc(xLeft, yDist, dotR, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()
    // magnitude dot
    ctx.beginPath(); ctx.arc(xMid, yMag, dotR + 1, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()
    // amplitude dot
    ctx.beginPath(); ctx.arc(xRight, yAmp, dotR, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()

    // Label at distance side
    ctx.font = 'bold 11px Poppins, sans-serif'
    ctx.fillStyle = d.color
    ctx.textAlign = 'right'
    ctx.fillText(d.station, xLeft - 10, yDist - 8)

    // Amplitude value label
    ctx.textAlign = 'left'
    ctx.fillText(d.maxAmp.toFixed(1), xRight + 10, yAmp - 8)
  })

  // ── Draw selected magnitude line (horizontal on center axis) ──
  if (selectedMagnitude.value != null) {
    const yMag = linPos(selectedMagnitude.value, NOMO.magMin, NOMO.magMax, top, bot)
    ctx.beginPath()
    ctx.moveTo(xMid - 20, yMag)
    ctx.lineTo(xMid + 20, yMag)
    ctx.strokeStyle = '#e20000'
    ctx.lineWidth = 3
    ctx.stroke()

    // Red label
    ctx.font = 'bold 14px Poppins, sans-serif'
    ctx.fillStyle = '#e20000'
    ctx.textAlign = 'left'
    ctx.fillText(`→ ${selectedMagnitude.value.toFixed(1)} ML`, xMid + 24, yMag + 5)
  }

  chartReady.value = true
}

function onCanvasClick(e) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const W = rect.width
  const H = 560
  const top = NOMO.padTop
  const bot = H - NOMO.padBottom
  const xLeft = NOMO.padLeft
  const xRight = W - NOMO.padRight
  const xMid = (xLeft + xRight) / 2

  // Only respond to clicks near the magnitude axis (center ± 40px)
  if (Math.abs(x - xMid) > 40) return

  const mag = yToMag(y, top, bot)
  if (mag < NOMO.magMin || mag > NOMO.magMax) return

  const rounded = parseFloat(mag.toFixed(1))
  confirmMagnitude(rounded)
}

function toggleStation(station) {
  stationVisibility.value = { ...stationVisibility.value, [station]: !stationVisibility.value[station] }
  renderNomogram()
}

async function confirmMagnitude(mag) {
  const result = await Swal.fire({
    title: 'Magnitud seleccionada',
    html: `
      <div style="text-align:center">
        <p style="font-size:48px;font-weight:900;color:#e20000;margin:16px 0">${mag.toFixed(1)}</p>
        <p style="color:#666;font-size:14px">Magnitud Local (ML) en la Escala de Richter</p>
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Usar esta magnitud',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e20000',
    cancelButtonColor: '#6b7280',
  })

  if (result.isConfirmed) {
    selectedMagnitude.value = mag
    store.setUserMagnitude(mag)
    renderNomogram()
  }
}

function useSuggestedMagnitude() {
  if (avgMagnitude.value != null) {
    confirmMagnitude(parseFloat(avgMagnitude.value.toFixed(1)))
  }
}

function goBack() {
  store.prevStep()
}

function goNext() {
  store.nextStep()
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  renderNomogram()

  const container = canvasRef.value?.parentElement
  if (container && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => renderNomogram())
    resizeObserver.observe(container)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 7
        </span>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Magnitud en la Escala de Richter
        </h1>
        <p class="text-gray-500" v-if="selectedRecord">
          {{ selectedRecord.title }} — Nomograma de Richter
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
      <p class="font-semibold mb-1">¿Cómo funciona el Nomograma de Richter?</p>
      <p>
        El nomograma tiene tres ejes verticales: Distancia (izquierda), Magnitud (centro) y Amplitud (derecha).
        Una línea recta desde la distancia de la estación hasta su amplitud cruza el eje central en la magnitud correspondiente.
        Haz clic sobre el eje de Magnitud para seleccionar el valor del sismo.
      </p>
    </div>

    <!-- Station toggle buttons -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="d in stationData"
        :key="d.station"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer"
        :class="stationVisibility[d.station]
          ? 'text-white shadow-md'
          : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'"
        :style="stationVisibility[d.station] ? { backgroundColor: d.color } : {}"
        @click="toggleStation(d.station)"
      >
        <span
          class="w-3 h-3 rounded-full border-2 transition-all"
          :style="{ borderColor: stationVisibility[d.station] ? 'white' : d.color, backgroundColor: stationVisibility[d.station] ? 'white' : 'transparent' }"
        />
        {{ d.station }}
        <span v-if="d.magnitude" class="text-xs opacity-75">(ML={{ d.magnitude.toFixed(1) }})</span>
      </button>

      <button
        v-if="avgMagnitude != null && selectedMagnitude == null"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
        @click="useSuggestedMagnitude"
      >
        <AppIcon name="zap" :size="16" />
        Usar sugerida: {{ avgMagnitude.toFixed(1) }} ML
      </button>
    </div>

    <!-- Magnitude result display -->
    <div v-if="selectedMagnitude != null" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-xl bg-red-600 text-white flex items-center justify-center text-2xl font-extrabold">
          {{ selectedMagnitude.toFixed(1) }}
        </div>
        <div>
          <p class="font-bold text-red-800">Magnitud seleccionada</p>
          <p class="text-sm text-red-600">Escala de Richter (ML)</p>
        </div>
      </div>
      <button
        class="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50 cursor-pointer transition-all"
        @click="selectedMagnitude = null; store.setUserMagnitude(null); renderChart()"
      >
        Cambiar
      </button>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="zap" :size="20" class="text-red-500" />
        <h2 class="text-lg font-bold text-igp-blue">Nomograma de Richter</h2>
      </div>
      <div class="p-2">
        <canvas
          ref="canvasRef"
          class="w-full cursor-crosshair"
          style="height: 560px"
          @click="onCanvasClick"
        />
      </div>
    </div>

    <!-- Station magnitude table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="file-text" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Datos por estación</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Distancia (km)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Amplitud (mm)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Magnitud (ML)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="d in stationData"
              :key="d.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
              :class="{ 'opacity-40': !stationVisibility[d.station] }"
            >
              <td class="px-4 py-3 font-bold" :style="{ color: d.color }">
                <span class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full inline-block" :style="{ backgroundColor: d.color }" />
                  {{ d.station }}
                </span>
              </td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ d.distance.toFixed(1) }}</td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ d.maxAmp.toFixed(3) }}</td>
              <td class="px-4 py-3">
                <span v-if="d.magnitude" class="font-mono font-bold text-red-600">{{ d.magnitude.toFixed(2) }}</span>
                <span v-else class="text-gray-400">---</span>
              </td>
            </tr>
            <tr v-if="avgMagnitude != null" class="border-t-2 border-gray-200 bg-gray-50">
              <td class="px-4 py-3 font-bold text-igp-blue" colspan="3">Promedio</td>
              <td class="px-4 py-3 font-mono font-bold text-red-600 text-lg">{{ avgMagnitude.toFixed(2) }} ML</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formula -->
    <div class="bg-igp-blue rounded-2xl p-6 text-white mb-8">
      <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
        <AppIcon name="info" :size="20" class="text-igp-sky-blue-300" />
        Fórmula de Richter
      </h3>
      <div class="bg-white/10 rounded-xl p-4 text-center">
        <p class="text-lg font-mono font-semibold">
          ML = log₁₀(A) + 2.76 × log₁₀(D) - 2.48
        </p>
        <p class="text-sm text-gray-300 mt-2">
          A = Amplitud máxima (mm) | D = Distancia epicentral (km)
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
        Ver Reporte Sísmico
        <AppIcon name="arrow-right" :size="16" class="ml-1" />
      </AppButton>
    </div>
  </div>
</template>
