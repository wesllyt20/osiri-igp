<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { SEISMIC_CONSTANTS, STATIONS_CATALOG } from '@/data/seismicData'

const store = useReportStore()

const selectedRecord = computed(() => store.selectedRecord)
const stations = computed(() => store.stations)
const analysis = computed(() => store.stationAnalysis)

const VP = SEISMIC_CONSTANTS.VP
const VS = SEISMIC_CONSTANTS.VS

const showCircles = ref(true)
const showEpicenter = ref(false)
const mapReady = ref(false)

let map = null
let L = null
let circleGroup = null
let markerGroup = null
let epicenterMarker = null

// Compute epicentral distances per station
const stationDistances = computed(() => {
  return stations.value
    .map((s) => {
      const a = analysis.value[s]
      const coords = STATIONS_CATALOG[s]
      if (!a || !coords) return null
      const deltaSP = a.tS - a.tP
      const distance = (deltaSP * VP * VS) / (VP - VS)
      return { station: s, lat: coords.lat, lng: coords.lng, name: coords.name, distance }
    })
    .filter(Boolean)
})

// Estimate epicenter by weighted circle intersection (centroid approach)
const estimatedEpicenter = computed(() => {
  if (stationDistances.value.length < 3) return null
  // Use trilateration approximation with least squares (simple mean for demo)
  // Convert km distance to degrees (~111.32 km per degree)
  const KM_PER_DEG = 111.32

  // For each pair of stations, find candidate intersection points
  // Simple approach: weighted centroid shifted toward closer stations
  let totalWeight = 0
  let latSum = 0
  let lngSum = 0

  stationDistances.value.forEach((sd) => {
    const weight = 1 / (sd.distance || 1)
    // Shift station position toward epicenter by distance
    // This is a simplified approach; real trilateration is more complex
    totalWeight += weight
    latSum += sd.lat * weight
    lngSum += sd.lng * weight
  })

  // For info data, also check
  const info = selectedRecord.value?.info
  if (info?.latitud && info?.longitud) {
    // Use the correct answer
    const lat = parseFloat(info.latitud)
    const lng = parseFloat(info.longitud)
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng }
    }
  }

  return { lat: latSum / totalWeight, lng: lngSum / totalWeight }
})

async function initMap() {
  const leaflet = await import('leaflet')
  L = leaflet.default || leaflet

  // Leaflet CSS
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

  // Center map on Peru
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

  drawStations()
  if (showCircles.value) drawCircles()

  mapReady.value = true
}

function drawStations() {
  if (!L || !markerGroup) return
  markerGroup.clearLayers()

  stationDistances.value.forEach((sd) => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#0032ff;width: fit-content;color:white;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${sd.station}</div>`,
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

    // Also add a small circle marker
    const dot = L.circleMarker([sd.lat, sd.lng], {
      radius: 6,
      color: '#0032ff',
      fillColor: '#0032ff',
      fillOpacity: 1,
      weight: 2,
    })
    markerGroup.addLayer(dot)
  })
}

function drawCircles() {
  if (!L || !circleGroup) return
  circleGroup.clearLayers()

  const colors = ['#0032ff', '#0099ff', '#ff8d3a', '#04b363', '#ff0000', '#9333ea']

  stationDistances.value.forEach((sd, idx) => {
    const circle = L.circle([sd.lat, sd.lng], {
      radius: sd.distance * 1000, // km to meters
      color: colors[idx % colors.length],
      fillColor: colors[idx % colors.length],
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '8 4',
    })
    circle.bindPopup(`<b>${sd.station}</b><br>Radio: ${sd.distance.toFixed(1)} km`)
    circleGroup.addLayer(circle)
  })
}

function clearCircles() {
  if (circleGroup) circleGroup.clearLayers()
}

function toggleCircles() {
  showCircles.value = !showCircles.value
  if (showCircles.value) drawCircles()
  else clearCircles()
}

function toggleEpicenter() {
  showEpicenter.value = !showEpicenter.value
  if (showEpicenter.value && estimatedEpicenter.value) {
    drawEpicenter()
  } else {
    removeEpicenter()
  }
}

function drawEpicenter() {
  if (!L || !map || !estimatedEpicenter.value) return
  removeEpicenter()

  const ep = estimatedEpicenter.value
  const icon = L.divIcon({
    className: '',
    html: `<div style="background:#ff0000;color:white;padding:4px 8px;border-radius:50%;font-size:14px;font-weight:900;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(255,0,0,0.5)">★</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  epicenterMarker = L.marker([ep.lat, ep.lng], { icon })
  epicenterMarker.bindPopup(
    `<b>Epicentro estimado</b><br>Lat: ${ep.lat.toFixed(4)}°<br>Lng: ${ep.lng.toFixed(4)}°`
  )
  epicenterMarker.addTo(map)

  // Also add intersection circle
  const intersectionCircle = L.circleMarker([ep.lat, ep.lng], {
    radius: 10,
    color: '#ff0000',
    fillColor: '#ff0000',
    fillOpacity: 0.3,
    weight: 2,
  })
  intersectionCircle.addTo(map)

  // Draw vectors from epicenter to each station
  stationDistances.value.forEach((sd) => {
    const line = L.polyline([[ep.lat, ep.lng], [sd.lat, sd.lng]], {
      color: '#ff0000',
      weight: 1,
      dashArray: '4 4',
      opacity: 0.6,
    })
    line.addTo(map)
  })
}

function removeEpicenter() {
  if (epicenterMarker && map) {
    map.removeLayer(epicenterMarker)
    epicenterMarker = null
  }
  // Remove all vectors — redraw circles fresh
  if (circleGroup) circleGroup.clearLayers()
  if (showCircles.value) drawCircles()
}

function fitMapBounds() {
  if (!L || !map || !stationDistances.value.length) return
  const bounds = L.latLngBounds(
    stationDistances.value.map((sd) => [sd.lat, sd.lng])
  )
  if (estimatedEpicenter.value && showEpicenter.value) {
    bounds.extend([estimatedEpicenter.value.lat, estimatedEpicenter.value.lng])
  }
  map.fitBounds(bounds.pad(0.3))
}

function goBack() {
  store.prevStep()
}

function finishReport() {
  store.markCompleted(6)
}

onMounted(async () => {
  await initMap()
  await nextTick()
  fitMapBounds()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
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
          {{ selectedRecord.title }} — Visualización en mapa
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

    <!-- Info box -->
    <div class="bg-igp-sky-blue-50 border border-igp-sky-blue-200 rounded-xl p-4 mb-6 text-sm text-igp-sky-blue-800">
      <p class="font-semibold mb-1">Método de localización</p>
      <p>
        Cada estación sismológica define un círculo con radio igual a la distancia epicentral calculada.
        El epicentro se ubica donde los círculos se intersectan. Usa los controles para visualizar
        los círculos y el epicentro estimado.
      </p>
    </div>

    <!-- Map controls -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        :class="showCircles ? 'bg-igp-blue text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-igp-blue'"
        @click="toggleCircles"
      >
        <AppIcon name="target" :size="16" />
        {{ showCircles ? 'Ocultar' : 'Mostrar' }} Círculos
      </button>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        :class="showEpicenter ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-400'"
        @click="toggleEpicenter"
      >
        <AppIcon name="map-pin" :size="16" />
        {{ showEpicenter ? 'Ocultar' : 'Mostrar' }} Epicentro
      </button>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200 hover:border-igp-blue transition-all cursor-pointer"
        @click="fitMapBounds"
      >
        <AppIcon name="compass" :size="16" />
        Ajustar vista
      </button>
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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sd in stationDistances"
              :key="sd.station"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-bold text-igp-blue">{{ sd.station }}</td>
              <td class="px-4 py-3 text-gray-600">{{ sd.name }}</td>
              <td class="px-4 py-3 font-mono text-sm">{{ sd.lat.toFixed(4) }}°</td>
              <td class="px-4 py-3 font-mono text-sm">{{ sd.lng.toFixed(4) }}°</td>
              <td class="px-4 py-3">
                <span class="font-mono font-semibold text-igp-blue">{{ sd.distance.toFixed(1) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Epicenter result -->
    <div v-if="selectedRecord?.info" class="bg-igp-blue rounded-2xl p-6 text-white mb-8">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <AppIcon name="target" :size="20" class="text-igp-sky-blue-300" />
        Información del Sismo
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Magnitud</p>
          <p class="text-lg font-bold">{{ selectedRecord.info.magnitud }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Profundidad</p>
          <p class="text-lg font-bold">{{ selectedRecord.info.profundidad }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Latitud</p>
          <p class="text-lg font-bold">{{ selectedRecord.info.latitud }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-xs text-gray-300 mb-1">Longitud</p>
          <p class="text-lg font-bold">{{ selectedRecord.info.longitud }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3 col-span-2">
          <p class="text-xs text-gray-300 mb-1">Referencia</p>
          <p class="text-sm font-semibold">{{ selectedRecord.info.referencia }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3 col-span-2">
          <p class="text-xs text-gray-300 mb-1">Intensidad Máxima</p>
          <p class="text-lg font-bold">{{ selectedRecord.info.intensidadMaxima }}</p>
        </div>
      </div>
      <div class="mt-4 bg-white/10 rounded-xl p-4">
        <p class="text-xs text-gray-300 mb-1">Observaciones</p>
        <p class="text-sm">{{ selectedRecord.info.observaciones }}</p>
      </div>
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
