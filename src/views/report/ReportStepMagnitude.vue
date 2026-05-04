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
        ? Math.log10(maxAmp) + Math.log10(distance)
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

// ── Nomograma de Richter (Clásico) ──
// Fórmula: ML = log₁₀(A) + 2.76 × log₁₀(D) − 2.48
//
// Geometría: los 3 ejes comparten UN MISMO factor de escala k (px por unidad lógica).
// Se define un punto de referencia (refY) y cada valor se posiciona relativo a él:
//   yAmp = refY − k × log₁₀(A)
//   yDist = refY − k × 2.76 × log₁₀(D)
//   yMag = refY − k × (M + 2.48)
//
// Alineaciones de la imagen de referencia:
//   Fondo: D=20, A=0.1, M≈1.0 están al mismo nivel
//   D=100 alineado con A=1.0 (verificación: 2.76×log₁₀(100) = 5.52, log₁₀(1) = 0... no)
//
// En realidad la alineación correcta es por la LÍNEA RECTA del nomograma:
// una recta de D en el eje izq a A en el eje der cruza el eje central en M.
// Los ejes NO necesitan estar alineados horizontalmente en los mismos valores.
//
// El truco geométrico: α = coefDist×logDistRange / (coefDist×logDistRange + logAmpRange)
// define la posición del eje central DESDE LA IZQUIERDA.
// Así, la interpolación lineal y = yDist + α×(yAmp − yDist) da yMag correctamente.
//
// Para que la imagen se vea como la referencia, los ejes deben tener alturas
// proporcionales a sus rangos lógicos escalados:
//   Altura lógica Distancia: coefDist × logDistRange = 2.76 × 1.602 = 4.42
//   Altura lógica Amplitud: logAmpRange = 3.699
//   Altura lógica Magnitud (eje central): Mrange = 4.42 + 3.699 = 8.12
//
// Todos los ejes ocupan la MISMA altura en px, pero cubren diferentes rangos lógicos.
// La normalización a [0,1] para cada eje es independiente.

const NOMO = (() => {
  const coefDist = 2.76
  const calibConst = -2.48

  // Rangos de ejes según imagen de referencia
  const distMin = 20, distMax = 800
  const ampMin = 0.1, ampMax = 500

  const logDistMin = Math.log10(distMin) // 1.301
  const logDistMax = Math.log10(distMax) // 2.903
  const logDistRange = logDistMax - logDistMin // 1.602

  const logAmpMin = Math.log10(ampMin) // -1
  const logAmpMax = Math.log10(ampMax) // 2.699
  const logAmpRange = logAmpMax - logAmpMin // 3.699

  // Alturas lógicas escaladas
  const hDist = coefDist * logDistRange // 4.42
  const hAmp = logAmpRange // 3.699
  const hMag = hDist + hAmp // 8.12 = Mrange total del eje central

  // α: posición del eje central (desde la izquierda) para que la regla funcione
  const alpha = hDist / hMag // ≈ 0.544

  // Magnitud efectiva mínima y máxima (determinada por la geometría)
  // Cuando D=Dmin (fondo izq) y A=Amin (fondo der):
  // ML = log₁₀(Amin) + coefDist×log₁₀(Dmin) + calibConst
  const magMin_eff = logAmpMin + coefDist * logDistMin + calibConst // ≈ 0.11
  const magMax_eff = magMin_eff + hMag // ≈ 8.23

  // Rango visible de ticks de magnitud
  const magMin = 1.0, magMax = 8.0

  return {
    magMin, magMax,
    magMin_eff, magMax_eff, hMag, hDist, hAmp,
    coefDist, calibConst,
    ampMin, ampMax, logAmpMin, logAmpMax, logAmpRange,
    distMin, distMax, logDistMin, logDistMax, logDistRange,
    alpha,
    padTop: 50, padBottom: 60, padLeft: 80, padRight: 80,
  }
})()

// ── Funciones de mapeo valor → pixel Y ──
// Los 3 ejes comparten la misma altura en px pero cubren diferentes rangos lógicos.
// Cada eje se normaliza a [0,1] independientemente: 0 = fondo (bot), 1 = tope (top).
function normToY(t, top, bot) { return bot - t * (bot - top) }

// Magnitud: lineal, M ∈ [magMin_eff, magMax_eff] → [0, 1]
function normMag(M) { return (M - NOMO.magMin_eff) / NOMO.hMag }
function magToY(M, top, bot) { return normToY(normMag(M), top, bot) }

// Amplitud: log₁₀(A) normalizado sobre logAmpRange → [0, 1]
function normAmp(A) { return (Math.log10(A) - NOMO.logAmpMin) / NOMO.logAmpRange }
function ampToY(A, top, bot) { return normToY(normAmp(A), top, bot) }

// Distancia: log₁₀(D) normalizado sobre logDistRange → [0, 1]
function normDist(D) { return (Math.log10(D) - NOMO.logDistMin) / NOMO.logDistRange }
function distToY(D, top, bot) { return normToY(normDist(D), top, bot) }

// Pixel Y → Magnitud (inversa para clicks en el eje central)
function yToMag(y, top, bot) {
  const t = (bot - y) / (bot - top)
  return NOMO.magMin_eff + t * NOMO.hMag
}

function renderNomogram() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement.getBoundingClientRect()
  const W = rect.width
  const isMobile = W < 500
  const H = isMobile ? 420 : 560

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

  const padTop = isMobile ? 40 : NOMO.padTop
  const padBottom = isMobile ? 40 : NOMO.padBottom
  const padLeft = isMobile ? 50 : NOMO.padLeft
  const padRight = isMobile ? 50 : NOMO.padRight
  const top = padTop
  const bot = H - padBottom
  const xLeft = padLeft
  const xRight = W - padRight
  // Eje central a la posición α derivada de la fórmula
  const xMid = xLeft + NOMO.alpha * (xRight - xLeft)

  // ── Líneas de referencia horizontales para magnitudes enteras ──
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 0.7
  for (let m = 2; m <= 7; m++) {
    const y = magToY(m, top, bot)
    ctx.beginPath(); ctx.moveTo(xLeft, y); ctx.lineTo(xRight, y); ctx.stroke()
  }
  ctx.setLineDash([])

  // ── Dibujar los tres ejes verticales (misma altura) ──
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 2
  // Izquierdo – Distancia
  ctx.beginPath(); ctx.moveTo(xLeft, top); ctx.lineTo(xLeft, bot); ctx.stroke()
  // Centro – Magnitud (ligeramente más grueso)
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(xMid, top); ctx.lineTo(xMid, bot); ctx.stroke()
  ctx.lineWidth = 2
  // Derecho – Amplitud
  ctx.beginPath(); ctx.moveTo(xRight, top); ctx.lineTo(xRight, bot); ctx.stroke()

  // ── Títulos de ejes ──
  ctx.textAlign = 'center'
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillStyle = '#1f2937'
  ctx.fillText('Distancia', xLeft, top - 22)
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillText('(km)', xLeft, top - 8)
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillText('Magnitud', xMid, top - 22)
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillText('Richter', xMid, top - 8)
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillText('Amplitud', xRight, top - 22)
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillText('(mm)', xRight, top - 8)

  // Title
  ctx.font = 'bold 18px Poppins, sans-serif'
  ctx.fillStyle = '#00214f'

  // ── Ticks de Distancia (eje izquierdo, log₁₀) ──
  const distTicks = [20, 30, 40, 50, 60, 80, 100, 150, 200, 300, 400, 500, 600, 700, 800]
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'right'
  distTicks.forEach((d) => {
    if (d < NOMO.distMin || d > NOMO.distMax) return
    const y = distToY(d, top, bot)
    ctx.beginPath(); ctx.moveTo(xLeft - 6, y); ctx.lineTo(xLeft, y); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillText(d.toString(), xLeft - 10, y + 4)
    ctx.beginPath(); ctx.moveTo(xLeft, y); ctx.lineTo(xLeft + 6, y); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5; ctx.stroke()
  })

  // ── Ticks de Magnitud (eje central, lineal 1.0–8.0) ──
  ctx.textAlign = 'center'
  for (let m = 1.0; m <= 8.0; m += 0.5) {
    const y = magToY(m, top, bot)
    const isInt = Number.isInteger(m)
    ctx.beginPath()
    ctx.moveTo(xMid - (isInt ? 8 : 4), y)
    ctx.lineTo(xMid + (isInt ? 8 : 4), y)
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = isInt ? 1.5 : 0.8
    ctx.stroke()
    if (isInt || m === 1.5 || m === 2.5) {
      ctx.font = isInt ? 'bold 12px Poppins, sans-serif' : '10px Poppins, sans-serif'
      ctx.fillStyle = '#1f2937'
      ctx.fillText(m.toFixed(1), xMid - 22, y + 4)
    }
  }

  // ── Ticks de Amplitud (eje derecho, log₁₀) ──
  const ampTicks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]
  ctx.textAlign = 'left'
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillStyle = '#374151'
  ampTicks.forEach((a) => {
    if (a < NOMO.ampMin || a > NOMO.ampMax) return
    const y = ampToY(a, top, bot)
    ctx.beginPath(); ctx.moveTo(xRight, y); ctx.lineTo(xRight + 6, y); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillText(a >= 1 ? a.toString() : a.toFixed(1), xRight + 10, y + 4)
    ctx.beginPath(); ctx.moveTo(xRight - 6, y); ctx.lineTo(xRight, y); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5; ctx.stroke()
  })

  // ── Dibujar líneas de estaciones (línea recta única de D a A) ──
  stationData.value.forEach((d) => {
    if (!stationVisibility.value[d.station]) return
    if (!d.magnitude || d.maxAmp <= 0 || d.distance <= 0) return

    // Clamp to axis range
    const cDist = Math.min(Math.max(d.distance, NOMO.distMin), NOMO.distMax)
    const cAmp = Math.min(Math.max(d.maxAmp, NOMO.ampMin), NOMO.ampMax)

    const yDist = distToY(cDist, top, bot)
    const yAmp = ampToY(cAmp, top, bot)

    // La magnitud es DONDE la línea recta cruza el eje central
    // yMag = yDist + α·(yAmp − yDist) por interpolación lineal
    const yMag = yDist + NOMO.alpha * (yAmp - yDist)

    // Línea recta ÚNICA de distancia a amplitud
    ctx.beginPath()
    ctx.moveTo(xLeft, yDist)
    ctx.lineTo(xRight, yAmp)
    ctx.strokeStyle = d.color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.8
    ctx.stroke()
    ctx.globalAlpha = 1

    // Puntos en cada eje
    const dotR = 5
    // Distancia
    ctx.beginPath(); ctx.arc(xLeft, yDist, dotR, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()
    // Magnitud (intersección con el eje central)
    ctx.beginPath(); ctx.arc(xMid, yMag, dotR + 1, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()
    // Amplitud
    ctx.beginPath(); ctx.arc(xRight, yAmp, dotR, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()

    // Etiqueta de estación
    ctx.font = 'bold 11px Poppins, sans-serif'
    ctx.fillStyle = d.color
    ctx.textAlign = 'right'
    ctx.fillText(d.station, xLeft - 10, yDist - 8)

    // Etiqueta de magnitud junto al punto central
    const magVal = yToMag(yMag, top, bot)
    ctx.textAlign = 'left'
    ctx.fillText(magVal.toFixed(1) + ' ML', xMid + 10, yMag - 8)

    // Etiqueta de amplitud
    ctx.fillText(cAmp.toFixed(1), xRight + 10, yAmp - 8)
  })

  // ── Marca de magnitud seleccionada ──
  if (selectedMagnitude.value != null) {
    const yMag = magToY(selectedMagnitude.value, top, bot)
    ctx.beginPath()
    ctx.moveTo(xMid - 20, yMag)
    ctx.lineTo(xMid + 20, yMag)
    ctx.strokeStyle = '#e20000'
    ctx.lineWidth = 3
    ctx.stroke()

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
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const W = rect.width
  const isMobile = W < 500
  const H = isMobile ? 420 : 560
  const top = isMobile ? 40 : NOMO.padTop
  const bot = H - (isMobile ? 40 : NOMO.padBottom)
  const xLeft = isMobile ? 50 : NOMO.padLeft
  const xRight = W - (isMobile ? 50 : NOMO.padRight)
  const xMid = xLeft + NOMO.alpha * (xRight - xLeft)

  // Solo responde a clicks cerca del eje de Magnitud (centro ± 40px)
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
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Magnitud en la Escala de Richter
        </h1>
        <p class="text-sm text-gray-500" v-if="selectedRecord">
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
    <div class="bg-igp-sky-blue-50 border border-igp-sky-blue-200 rounded-xl p-3 sm:p-4 mb-6 text-xs sm:text-sm text-igp-sky-blue-800">
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
    <div class="w-full max-w-250 mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="zap" :size="20" class="text-red-500" />
        <h2 class="text-lg font-bold text-igp-blue">Nomograma de Richter</h2>
      </div>
      <div class="p-2">
        <canvas
          ref="canvasRef"
          class="w-full cursor-crosshair"
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
    <div class="bg-igp-blue rounded-2xl p-4 sm:p-6 text-white mb-8">
      <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
        <AppIcon name="info" :size="20" class="text-igp-sky-blue-300" />
        Fórmula de Richter
      </h3>
      <div class="bg-white/10 rounded-xl p-4 text-center">
        <p class="text-lg font-mono font-semibold">
          ML = log₁₀(A) + log₁₀(D)
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
