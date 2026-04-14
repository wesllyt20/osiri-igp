<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
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

const mapReady = ref(false)
const epicenterPlaced = ref(!!store.userEpicenter)

// Station visibility toggles - default all visible
const stationCircleVisibility = ref({})

const STATION_COLORS = ['#0032ff', '#0099ff', '#ff8d3a', '#04b363', '#e20000', '#9333ea']

let map = null
let L = null
let circleGroup = null
let markerGroup = null
let epicenterGroup = null
let dashAnimationIntervals = []

watch(stations, (s) => {
  const vis = {}
  s.forEach((st) => { vis[st] = true })
  stationCircleVisibility.value = vis
}, { immediate: true })

const stationDistances = computed(() => {
  return stations.value
    .map((s, idx) => {
      const a = analysis.value[s]
      const coords = STATIONS_CATALOG[s]
      if (!a || !coords) return null
      const deltaSP = a.tS - a.tP
      const distance = (deltaSP * VP * VS) / (VP - VS)
      return { station: s, lat: coords.lat, lng: coords.lng, name: coords.name, distance, color: STATION_COLORS[idx % STATION_COLORS.length] }
    })
    .filter(Boolean)
})

function toggleStationCircle(station) {
  stationCircleVisibility.value = { ...stationCircleVisibility.value, [station]: !stationCircleVisibility.value[station] }
  redrawCircles()
}

async function initMap() {
  const leaflet = await import('leaflet')
  L = leaflet.default || leaflet

  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  await nextTick()
  await new Promise((r) => setTimeout(r, 100))

  const el = document.getElementById('epicenter-map')
  if (!el) return

  const center = stationDistances.value.length > 0
    ? [
        stationDistances.value.reduce((s, d) => s + d.lat, 0) / stationDistances.value.length,
        stationDistances.value.reduce((s, d) => s + d.lng, 0) / stationDistances.value.length,
      ]
    : [-12, -76]

  map = L.map(el).setView(center, 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)
  circleGroup = L.layerGroup().addTo(map)
  epicenterGroup = L.layerGroup().addTo(map)

  drawStations()
  redrawCircles()

  // Map click handler for epicenter placement
  map.on('click', onMapClick)

  // Restore epicenter if previously placed
  if (store.userEpicenter) {
    epicenterPlaced.value = true
    drawEpicenterAnimated(store.userEpicenter)
  }

  mapReady.value = true
}

function drawStations() {
  if (!L || !markerGroup) return
  markerGroup.clearLayers()

  stationDistances.value.forEach((sd) => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${sd.color};width:fit-content;color:white;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${sd.station}</div>`,
      iconSize: [0, 0],
      iconAnchor: [-8, 10],
    })

    const marker = L.marker([sd.lat, sd.lng], { icon })
    marker.bindPopup(
      `<b>${sd.station}</b> (${sd.name})<br>` +
      `Lat: ${sd.lat.toFixed(4)}, Lng: ${sd.lng.toFixed(4)}<br>` +
      `Distancia: ${sd.distance.toFixed(1)} km`
    )
    markerGroup.addLayer(marker)

    const dot = L.circleMarker([sd.lat, sd.lng], {
      radius: 6,
      color: sd.color,
      fillColor: sd.color,
      fillOpacity: 1,
      weight: 2,
    })
    markerGroup.addLayer(dot)
  })
}

function redrawCircles() {
  if (!L || !circleGroup) return
  circleGroup.clearLayers()

  stationDistances.value.forEach((sd) => {
    if (!stationCircleVisibility.value[sd.station]) return

    const circle = L.circle([sd.lat, sd.lng], {
      radius: sd.distance * 1000,
      color: sd.color,
      fillColor: sd.color,
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '8 4',
      interactive: false,
    })
    circleGroup.addLayer(circle)
  })
}

async function onMapClick(e) {
  if (epicenterPlaced.value) return

  const { lat, lng } = e.latlng
  const result = await Swal.fire({
    title: '¿Graficar epicentro aquí?',
    html: `
      <div style="text-align:left;font-size:14px;line-height:1.8">
        <p><strong>Latitud:</strong> ${lat.toFixed(4)}°</p>
        <p><strong>Longitud:</strong> ${lng.toFixed(4)}°</p>
      </div>
      <p style="margin-top:12px;color:#666;font-size:12px">Se marcará el epicentro en esta ubicación.</p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirmar epicentro',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0032ff',
    cancelButtonColor: '#6b7280',
  })

  if (result.isConfirmed) {
    const epicenter = { lat, lng }
    store.setUserEpicenter(epicenter)
    epicenterPlaced.value = true
    drawEpicenterAnimated(epicenter)
  }
}

function drawEpicenterAnimated(epicenter) {
  if (!L || !map || !epicenterGroup) return
  clearEpicenter()

  const ep = epicenter

  // Draw animated dashed lines from each station to epicenter
  stationDistances.value.forEach((sd, idx) => {
    if (!stationCircleVisibility.value[sd.station]) return

    // Animated dashed line
    const line = L.polyline([[sd.lat, sd.lng], [ep.lat, ep.lng]], {
      color: sd.color,
      weight: 2,
      dashArray: '8 6',
      opacity: 0.8,
      className: 'animated-dash',
    })
    epicenterGroup.addLayer(line)

    // Animate the dash offset
    const lineEl = line.getElement?.()
    if (lineEl) {
      lineEl.style.animation = `dashMove 1.5s linear infinite`
    }
  })

  // Inject CSS for dash animation if not present
  if (!document.getElementById('epicenter-anim-css')) {
    const style = document.createElement('style')
    style.id = 'epicenter-anim-css'
    style.textContent = `
      @keyframes dashMove {
        to { stroke-dashoffset: -28; }
      }
      .animated-dash { animation: dashMove 1.5s linear infinite; }
      @keyframes epicenterPulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(2.5); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  // Epicenter marker with pulse — use fixed pixel sizes and center with iconAnchor
  const size = 60
  const starSize = 28
  const pulseHtml = `
    <div style="position:relative;width:${size}px;height:${size}px;pointer-events:none">
      <div style="position:absolute;top:${(size - 50) / 2}px;left:${(size - 50) / 2}px;width:50px;height:50px;border-radius:50%;background:rgba(226,0,0,0.25);animation:epicenterPulse 2s ease-out infinite"></div>
      <div style="position:absolute;top:${(size - 36) / 2}px;left:${(size - 36) / 2}px;width:36px;height:36px;border-radius:50%;background:rgba(226,0,0,0.15);animation:epicenterPulse 2s ease-out 0.6s infinite"></div>
      <div style="position:absolute;top:${(size - starSize) / 2}px;left:${(size - starSize) / 2}px;background:#e20000;color:white;width:${starSize}px;height:${starSize}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;border:3px solid white;box-shadow:0 2px 8px rgba(226,0,0,0.5);z-index:10">★</div>
    </div>
  `

  const icon = L.divIcon({
    className: '',
    html: pulseHtml,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

  const marker = L.marker([ep.lat, ep.lng], { icon })
  marker.bindPopup(`<b>Epicentro</b><br>Lat: ${ep.lat.toFixed(4)}°<br>Lng: ${ep.lng.toFixed(4)}°`)
  epicenterGroup.addLayer(marker)
}

function clearEpicenter() {
  dashAnimationIntervals.forEach(clearInterval)
  dashAnimationIntervals = []
  if (epicenterGroup) epicenterGroup.clearLayers()
}

function changeEpicenter() {
  clearEpicenter()
  store.setUserEpicenter(null)
  epicenterPlaced.value = false
}

function fitMapBounds() {
  if (!L || !map || !stationDistances.value.length) return
  const bounds = L.latLngBounds(
    stationDistances.value.map((sd) => [sd.lat, sd.lng])
  )
  if (store.userEpicenter) {
    bounds.extend([store.userEpicenter.lat, store.userEpicenter.lng])
  }
  map.fitBounds(bounds.pad(0.3))
}

function goBack() {
  store.prevStep()
}

function goNext() {
  store.nextStep()
}

onMounted(async () => {
  await initMap()
  await nextTick()
  fitMapBounds()
})

onUnmounted(() => {
  dashAnimationIntervals.forEach(clearInterval)
  dashAnimationIntervals = []
  if (map) {
    map.off('click', onMapClick)
    map.remove()
    map = null
  }
  L = null
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between flex-wrap gap-4">
      <div>
        <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Paso 6
        </span>
        <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
          Localización del Epicentro
        </h1>
        <p class="text-gray-500" v-if="selectedRecord">
          {{ selectedRecord.title }} — Haz clic en el mapa para ubicar el epicentro
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
      <p class="font-semibold mb-1">Método de localización</p>
      <p>
        Observa la intersección de los círculos de distancia en el mapa. Haz clic en el punto donde convergen
        para ubicar el epicentro. Puedes activar o desactivar cada estación con los botones.
      </p>
    </div>

    <!-- Station toggle buttons -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="sd in stationDistances"
        :key="sd.station"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer"
        :class="stationCircleVisibility[sd.station]
          ? 'text-white shadow-md'
          : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'"
        :style="stationCircleVisibility[sd.station] ? { backgroundColor: sd.color } : {}"
        @click="toggleStationCircle(sd.station)"
      >
        <span
          class="w-3 h-3 rounded-full border-2 transition-all"
          :style="{ borderColor: stationCircleVisibility[sd.station] ? 'white' : sd.color, backgroundColor: stationCircleVisibility[sd.station] ? 'white' : 'transparent' }"
        />
        {{ sd.station }}
        <span class="text-xs opacity-75">({{ sd.distance.toFixed(0) }} km)</span>
      </button>

      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200 hover:border-igp-blue transition-all cursor-pointer"
        @click="fitMapBounds"
      >
        <AppIcon name="compass" :size="16" />
        Ajustar vista
      </button>

      <button
        v-if="epicenterPlaced"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
        @click="changeEpicenter"
      >
        <AppIcon name="x" :size="16" />
        Cambiar epicentro
      </button>
    </div>

    <!-- Epicenter status -->
    <div v-if="!epicenterPlaced" class="bg-igp-orange-50 border border-igp-orange-200 rounded-xl p-3 mb-4 text-sm text-igp-orange-800 flex items-center gap-2">
      <AppIcon name="target" :size="18" class="text-igp-orange-500" />
      <span class="font-semibold">Haz clic en el mapa</span> donde observes la intersección de los círculos para ubicar el epicentro.
    </div>

    <div v-else class="bg-igp-green-100 border border-igp-green-200 rounded-xl p-3 mb-4 text-sm text-igp-green-800 flex items-center gap-2">
      <AppIcon name="check-circle" :size="18" class="text-igp-green-700" />
      <span>Epicentro ubicado en <strong>{{ store.userEpicenter?.lat?.toFixed(4) }}°, {{ store.userEpicenter?.lng?.toFixed(4) }}°</strong></span>
    </div>

    <!-- Map -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div id="epicenter-map" class="w-full" style="height: 500px" />
    </div>

    <!-- Station info table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-gray-100 flex items-center gap-2">
        <AppIcon name="map-pin" :size="20" class="text-igp-sky-blue-600" />
        <h2 class="text-lg font-bold text-igp-blue">Estaciones y distancias</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Latitud</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Longitud</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Distancia (km)</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Visible</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sd in stationDistances"
              :key="sd.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
              :class="{ 'opacity-40': !stationCircleVisibility[sd.station] }"
            >
              <td class="px-4 py-3 font-bold" :style="{ color: sd.color }">
                <span class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full inline-block" :style="{ backgroundColor: sd.color }" />
                  {{ sd.station }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ sd.name }}</td>
              <td class="px-4 py-3 font-mono text-sm">{{ sd.lat.toFixed(4) }}°</td>
              <td class="px-4 py-3 font-mono text-sm">{{ sd.lng.toFixed(4) }}°</td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold text-igp-blue">{{ sd.distance.toFixed(1) }}</span>
              </td>
              <td class="px-4 py-3">
                <button
                  class="w-8 h-5 rounded-full transition-all cursor-pointer relative"
                  :class="stationCircleVisibility[sd.station] ? 'bg-igp-green-700' : 'bg-gray-300'"
                  @click="toggleStationCircle(sd.station)"
                >
                  <span
                    class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    :class="stationCircleVisibility[sd.station] ? 'left-3.5' : 'left-0.5'"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Seismic Info -->
    <div class="bg-igp-blue rounded-2xl p-6 text-white mb-8">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <AppIcon name="target" :size="20" class="text-igp-sky-blue-300" />
        Información del Sismo
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Magnitud</p>
          <p class="text-lg font-bold text-gray-400 italic">Siguiente paso</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Profundidad</p>
          <p class="text-lg font-bold text-gray-400 italic">Siguiente paso</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Latitud</p>
          <p class="text-lg font-bold">{{ store.userEpicenter ? store.userEpicenter.lat.toFixed(4) + '°' : '---' }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Longitud</p>
          <p class="text-lg font-bold">{{ store.userEpicenter ? store.userEpicenter.lng.toFixed(4) + '°' : '---' }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3 col-span-2">
          <p class="text-xs text-gray-300 mb-1">Referencia</p>
          <p class="text-sm font-semibold">{{ selectedRecord?.info?.referencia || '---' }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3 col-span-2">
          <p class="text-xs text-gray-300 mb-1">Observaciones</p>
          <p class="text-sm">{{ selectedRecord?.info?.observaciones || '---' }}</p>
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
        Hallar Magnitud
        <AppIcon name="arrow-right" :size="16" class="ml-1" />
      </AppButton>
    </div>
  </div>
</template>
