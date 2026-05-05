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
      // Fórmula correcta: ML = log₁₀(A) + 3×log₁₀(8×Δt_SP) − 2.92
      const ml = maxAmp > 0 && deltaSP > 0
        ? Math.log10(maxAmp) + 3 * Math.log10(8 * deltaSP) - 2.92
        : null
      return { station: s, deltaSP, distance, maxAmp, magnitude: ml, color: STATION_COLORS[idx % STATION_COLORS.length] }
    })
    .filter(Boolean)
})

const avgMagnitude = computed(() => {
  const mags = stationData.value.filter((d) => d.magnitude !== null).map((d) => d.magnitude)
  if (!mags.length) return null
  return mags.reduce((a, b) => a + b, 0) / mags.length
})

// ── Nomograma de Richter (Clásico) ──
// Fórmula: ML = log₁₀(A) + 3×log₁₀(8×Δt_SP) − 2.92
//        = log₁₀(A) + 3×log₁₀(Δt_SP) + 3×log₁₀(8) − 2.92
//        = log₁₀(A) + 3×log₁₀(Δt_SP) − 0.211
//
// Tres ejes paralelos (misma altura en px):
//   Izquierdo: S-P (seg) — escala logarítmica
//   Centro: Magnitud Richter — escala lineal
//   Derecho: Amplitud (mm) — escala logarítmica
//
// Una recta desde S-P (izq) a Amplitud (der) cruza el eje central en la Magnitud.
// α = posición del eje central desde la izquierda = logA_range / M_range

const NOMO = (() => {
  // Rangos de ejes según nomograma de referencia INPRES
  const spMin = 2, spMax = 50 // S-P en segundos
  const ampMin = 0.1, ampMax = 100 // Amplitud en mm

  const logSPMin = Math.log10(spMin) // 0.301
  const logSPMax = Math.log10(spMax) // 1.699
  const logSPRange = logSPMax - logSPMin // 1.398

  const logAmpMin = Math.log10(ampMin) // -1
  const logAmpMax = Math.log10(ampMax) // 2
  const logAmpRange = logAmpMax - logAmpMin // 3

  // Rango total de magnitud determinado por la geometría del nomograma
  const M_range = 3 * logSPRange + logAmpRange // 3×1.398 + 3 = 7.194

  // α: posición del eje central desde la izquierda
  const alpha = logAmpRange / M_range // 3/7.194 ≈ 0.417

  // Magnitud mínima (cuando S-P=min y A=min están en el fondo)
  // ML = log₁₀(A_min) + 3×log₁₀(SP_min) + 3×log₁₀(8) − 2.92
  const magMin_eff = Math.log10(ampMin) + 3 * Math.log10(spMin) + 3 * Math.log10(8) - 2.92 // ≈ -0.308
  const magMax_eff = magMin_eff + M_range // ≈ 6.886

  // Rango visible de ticks
  const magMin = 0, magMax = 7

  return {
    magMin, magMax,
    magMin_eff, magMax_eff, M_range,
    ampMin, ampMax, logAmpMin, logAmpMax, logAmpRange,
    spMin, spMax, logSPMin, logSPMax, logSPRange,
    alpha,
    padTop: 50, padBottom: 60, padLeft: 80, padRight: 80,
  }
})()

// ── Funciones de mapeo valor → pixel Y ──
// Los 3 ejes comparten la misma altura en px pero cubren diferentes rangos lógicos.
// Normalización a [0,1]: 0 = fondo (bot), 1 = tope (top).
function normToY(t, top, bot) { return bot - t * (bot - top) }

// S-P: log₁₀(Δt) normalizado sobre logSPRange → [0, 1]
function normSP(sp) { return (Math.log10(sp) - NOMO.logSPMin) / NOMO.logSPRange }
function spToY(sp, top, bot) { return normToY(normSP(sp), top, bot) }

// Amplitud: log₁₀(A) normalizado sobre logAmpRange → [0, 1]
function normAmp(A) { return (Math.log10(A) - NOMO.logAmpMin) / NOMO.logAmpRange }
function ampToY(A, top, bot) { return normToY(normAmp(A), top, bot) }

// Magnitud: lineal, M ∈ [magMin_eff, magMax_eff] → [0, 1]
function normMag(M) { return (M - NOMO.magMin_eff) / NOMO.M_range }
function magToY(M, top, bot) { return normToY(normMag(M), top, bot) }

// Pixel Y → Magnitud (inversa para clicks en el eje central)
function yToMag(y, top, bot) {
  const t = (bot - y) / (bot - top)
  return NOMO.magMin_eff + t * NOMO.M_range
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
  for (let m = 1; m <= 6; m++) {
    const y = magToY(m, top, bot)
    ctx.beginPath(); ctx.moveTo(xLeft, y); ctx.lineTo(xRight, y); ctx.stroke()
  }
  ctx.setLineDash([])

  // ── Dibujar los tres ejes verticales ──
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 2
  // Izquierdo – S-P (seg)
  ctx.beginPath(); ctx.moveTo(xLeft, top); ctx.lineTo(xLeft, bot); ctx.stroke()
  // Centro – Magnitud
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(xMid, top); ctx.lineTo(xMid, bot); ctx.stroke()
  ctx.lineWidth = 2
  // Derecho – Amplitud
  ctx.beginPath(); ctx.moveTo(xRight, top); ctx.lineTo(xRight, bot); ctx.stroke()

  // ── Títulos de ejes ──
  ctx.textAlign = 'center'
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillStyle = '#1f2937'
  ctx.fillText('S - P', xLeft, top - 22)
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillText('(seg)', xLeft, top - 8)
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillText('Magnitud', xMid, top - 22)
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillText('Richter', xMid, top - 8)
  ctx.font = 'bold 13px Poppins, sans-serif'
  ctx.fillText('Amplitud', xRight, top - 22)
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillText('(mm)', xRight, top - 8)

  // ── Ticks de S-P (eje izquierdo, log₁₀) ──
  const spTicks = [2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50]
  ctx.font = '11px Poppins, sans-serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'right'
  spTicks.forEach((sp) => {
    if (sp < NOMO.spMin || sp > NOMO.spMax) return
    const y = spToY(sp, top, bot)
    ctx.beginPath(); ctx.moveTo(xLeft - 6, y); ctx.lineTo(xLeft, y); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.stroke()
    ctx.fillText(sp.toString(), xLeft - 10, y + 4)
    ctx.beginPath(); ctx.moveTo(xLeft, y); ctx.lineTo(xLeft + 6, y); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5; ctx.stroke()
  })

  // ── Ticks de Magnitud (eje central, lineal 0–7) ──
  ctx.textAlign = 'center'
  for (let m = 0; m <= 7.0; m += 0.5) {
    const y = magToY(m, top, bot)
    if (y < top || y > bot) continue
    const isInt = Number.isInteger(m)
    ctx.beginPath()
    ctx.moveTo(xMid - (isInt ? 8 : 4), y)
    ctx.lineTo(xMid + (isInt ? 8 : 4), y)
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = isInt ? 1.5 : 0.8
    ctx.stroke()
    if (isInt) {
      ctx.font = 'bold 12px Poppins, sans-serif'
      ctx.fillStyle = '#1f2937'
      ctx.fillText(m.toFixed(0), xMid - 22, y + 4)
    }
  }

  // ── Ticks de Amplitud (eje derecho, log₁₀) ──
  const ampTicks = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]
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

  // ── Dibujar líneas de estaciones (línea recta de S-P a Amplitud) ──
  stationData.value.forEach((d) => {
    if (!stationVisibility.value[d.station]) return
    if (!d.magnitude || d.maxAmp <= 0 || d.deltaSP <= 0) return

    // Clamp to axis range
    const cSP = Math.min(Math.max(d.deltaSP, NOMO.spMin), NOMO.spMax)
    const cAmp = Math.min(Math.max(d.maxAmp, NOMO.ampMin), NOMO.ampMax)

    const ySP = spToY(cSP, top, bot)
    const yAmp = ampToY(cAmp, top, bot)

    // La magnitud es donde la línea recta cruza el eje central
    const yMag = ySP + NOMO.alpha * (yAmp - ySP)

    // Línea recta de S-P a Amplitud
    ctx.beginPath()
    ctx.moveTo(xLeft, ySP)
    ctx.lineTo(xRight, yAmp)
    ctx.strokeStyle = d.color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.8
    ctx.stroke()
    ctx.globalAlpha = 1

    // Puntos en cada eje
    const dotR = 5
    // S-P
    ctx.beginPath(); ctx.arc(xLeft, ySP, dotR, 0, Math.PI * 2); ctx.fillStyle = d.color; ctx.fill()
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
    ctx.fillText(d.station, xLeft - 10, ySP - 8)

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
      <p class="mb-2">
        El nomograma tiene tres ejes verticales: <strong>S-P (seg)</strong> a la izquierda, <strong>Magnitud Richter</strong> al centro y <strong>Amplitud (mm)</strong> a la derecha.
        Una línea recta desde el valor S-P de cada estación hasta su amplitud cruza el eje central en la magnitud correspondiente.
      </p>
      <p class="font-semibold text-igp-blue">
        👉 Para seleccionar la magnitud del sismo, haz clic directamente sobre el <strong>eje central de Magnitud</strong> en el nomograma, en el valor que consideres correcto.
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
        @click="selectedMagnitude = null; store.setUserMagnitude(null); renderNomogram()"
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
              <th class="px-4 py-3 text-left font-semibold text-gray-600">S-P (seg)</th>
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
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ d.deltaSP.toFixed(2) }}</td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ d.distance.toFixed(1) }}</td>
              <td class="px-4 py-3 font-mono font-semibold text-igp-blue">{{ d.maxAmp.toFixed(3) }}</td>
              <td class="px-4 py-3">
                <span v-if="d.magnitude" class="font-mono font-bold text-red-600">{{ d.magnitude.toFixed(2) }}</span>
                <span v-else class="text-gray-400">---</span>
              </td>
            </tr>
            <tr v-if="avgMagnitude != null" class="border-t-2 border-gray-200 bg-gray-50">
              <td class="px-4 py-3 font-bold text-igp-blue" colspan="4">Promedio</td>
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
          ML = log₁₀(A) + 3×log₁₀(8×Δt<sub>S-P</sub>) − 2.92
        </p>
        <p class="text-sm text-gray-300 mt-2">
          A = Amplitud máxima (mm) | Δt<sub>S-P</sub> = Diferencia de tiempo S - P (seg)
        </p>
      </div>
      <div class="mt-3 text-xs text-white/60">
        <p>Fuente: Instituto Nacional de Prevención Sísmica (INPRES)</p>
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
