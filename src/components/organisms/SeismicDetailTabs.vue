<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import { STATIONS_CATALOG, SEISMIC_RECORDS } from '@/data/seismicData'
import { useReportStore } from '@/stores/reportStore'

const props = defineProps({
  record: { type: Object, default: null },
})

const emit = defineEmits(['next-step'])

const store = useReportStore()

const activeTab = ref(0)
const viewedTabs = ref(new Set())
const contentVisible = ref(false)
let map = null
let L = null
let markerGroup = null
let layerControl = null

const tabs = [
  { id: 0, label: 'Estaciones', icon: 'map-pin' },
  { id: 1, label: 'Ondas Sísmicas', icon: 'activity' },
  { id: 2, label: 'Información', icon: 'info' },
]

const allTabsViewed = computed(() => {
  return viewedTabs.value.has(0) && viewedTabs.value.has(1) && viewedTabs.value.has(2)
})

function selectTab(tabId) {
  activeTab.value = tabId
  const newSet = new Set(viewedTabs.value)
  newSet.add(tabId)
  viewedTabs.value = newSet
}

function isUnviewed(tabId) {
  return !viewedTabs.value.has(tabId)
}

function handleNextStep() {
  if (allTabsViewed.value) {
    emit('next-step')
  }
}

// Animate content on record change
watch(() => props.record?.id, () => {
  contentVisible.value = false
  viewedTabs.value = new Set()
  activeTab.value = 0
  const newSet = new Set()
  newSet.add(0)
  viewedTabs.value = newSet
  nextTick(() => {
    setTimeout(() => { contentVisible.value = true }, 50)
    if (activeTab.value === 0) initMap()
  })
})

// ── Map (Tab 0) ──
const recordStations = computed(() => {
  if (!props.record) return []
  return props.record.stations.map((code) => ({
    code,
    ...(STATIONS_CATALOG[code] || { name: code, lat: -12, lng: -76 }),
  }))
})

const allStations = computed(() => {
  return Object.entries(STATIONS_CATALOG).map(([code, data]) => ({
    code,
    ...data,
  }))
})

async function initMap() {
  if (!props.record) return

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
  await new Promise((r) => setTimeout(r, 150))

  const el = document.getElementById('stations-map')
  if (!el) return

  if (map) {
    map.remove()
    map = null
  }

  const stns = recordStations.value
  const centerLat = stns.reduce((s, st) => s + st.lat, 0) / stns.length
  const centerLng = stns.reduce((s, st) => s + st.lng, 0) / stns.length

  map = L.map(el, { zoomControl: true }).setView([centerLat, centerLng], 7)

  // Base layers
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  })
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 18,
  })
  const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
  })
  const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB',
    maxZoom: 19,
  })

  osm.addTo(map)

  const baseLayers = {
    'Estándar': osm,
    'Satélite': satellite,
    'Terreno': terrain,
    'Oscuro': dark,
  }
  layerControl = L.control.layers(baseLayers, null, { position: 'topright' }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)

  // Draw ALL stations as gray dots
  allStations.value.forEach((st) => {
    const isActive = props.record.stations.includes(st.code)
    if (isActive) return

    const dot = L.circleMarker([st.lat, st.lng], {
      radius: 4,
      color: '#94a3b8',
      fillColor: '#cbd5e1',
      fillOpacity: 0.7,
      weight: 1,
    })
    dot.bindPopup(`<b>${st.code}</b><br>${st.name}`)
    markerGroup.addLayer(dot)
  })

  // Draw ACTIVE stations
  stns.forEach((st) => {
    const dot = L.circleMarker([st.lat, st.lng], {
      radius: 7,
      color: '#0032ff',
      fillColor: '#3b6bff',
      fillOpacity: 1,
      weight: 2,
    })
    dot.bindPopup(
      `<b>${st.code}</b> — ${st.name}<br>Lat: ${st.lat.toFixed(4)}, Lng: ${st.lng.toFixed(4)}`
    )
    markerGroup.addLayer(dot)

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#0032ff;color:white;width:fit-content;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)">${st.code}</div>`,
      iconSize: [0, 0],
      iconAnchor: [-10, 8],
    })
    L.marker([st.lat, st.lng], { icon }).addTo(markerGroup)
  })

  if (stns.length > 0) {
    const bounds = L.latLngBounds(stns.map((s) => [s.lat, s.lng]))
    map.fitBounds(bounds.pad(0.5))
  }
}

watch(activeTab, (tab) => {
  if (tab === 0) {
    nextTick(() => {
      if (map) {
        map.invalidateSize()
      } else {
        initMap()
      }
    })
  }
})

onMounted(() => {
  const newSet = new Set()
  newSet.add(0)
  viewedTabs.value = newSet
  if (props.record) {
    contentVisible.value = true
    initMap()
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// ── Epicentro image URL ──
function getEpicentroUrl(recordId) {
  const num = recordId.split('_')[0]
  return `./records/${recordId}/epicentro_${num}.PNG`
}
function getEpicentroFallback(recordId) {
  const num = recordId.split('_')[0]
  return `./records/${recordId}/epicentro_${num}.JPG`
}

// Random epicentro images for empty state
const previewRecords = computed(() => {
  return SEISMIC_RECORDS.slice(0, 4)
})

// ── Waveform images (Tab 1) ──
const waveformImages = computed(() => {
  if (!props.record) return []
  return props.record.stations.map((code) => ({
    station: code,
    name: STATIONS_CATALOG[code]?.name || code,
    asciiUrl: `./records/${props.record.id}/graficas_formato_ascii/${code}_ASCII_WA_mm.png`,
    sacUrl: `./records/${props.record.id}/graficas_formato_mm.SAC/${code}_WA_mm.png`,
  }))
})

// ── Info (Tab 2) — list-style like the reference image ──
const infoItems = computed(() => {
  if (!props.record?.info) return []
  const info = props.record.info
  return [
    { label: 'Referencia:', value: info.referencia, icon: 'map-pin' },
    { label: 'Fecha y hora origen local:', value: `${props.record.date} a las ${props.record.time} hrs`, icon: 'clock' },
    { label: 'Latitud y Longitud (°):', value: `${info.latitud}, ${info.longitud}`, icon: 'compass' },
    { label: 'Profundidad:', value: info.profundidad, icon: 'layers' },
    { label: 'Intensidad máxima (MM):', value: `${info.intensidadMaxima} — ${info.areasAfectadas}`, icon: 'activity' },
    { label: 'Magnitud:', value: info.magnitud, icon: 'zap' },
    { label: 'Región:', value: info.region, icon: 'globe' },
    { label: 'Población en zona de influencia:', value: info.poblacion, icon: 'target' },
  ]
})
</script>

<template>
  <!-- ═══ RECORD SELECTED ═══ -->
  <div v-if="record" class="h-full flex flex-col" :class="contentVisible ? 'animate-fadeSlideIn' : 'opacity-0'">
    <!-- Tab header + Next step button -->
    <div class="flex items-end border-b border-gray-200 bg-white px-2 pt-2 shrink-0">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200 cursor-pointer"
          :class="
            activeTab === tab.id
              ? 'bg-igp-blue text-white shadow-md -mb-px z-10'
              : 'text-gray-500 hover:text-igp-dark-blue hover:bg-gray-50'
          "
          @click="selectTab(tab.id)"
        >
          <AppIcon :name="tab.icon" :size="16" />
          <span>{{ tab.label }}</span>
          <span
            v-if="isUnviewed(tab.id)"
            class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-igp-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle"
          >
            !
          </span>
        </button>
      </div>
      <!-- Siguiente paso button -->
      <div class="ml-auto pb-1.5 pr-1">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300"
          :class="
            allTabsViewed
              ? 'bg-igp-green-700 text-white hover:bg-igp-green-800 shadow-md cursor-pointer'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          "
          :disabled="!allTabsViewed"
          @click="handleNextStep"
        >
          <span>Siguiente paso</span>
          <AppIcon name="arrow-right" :size="16" />
        </button>
      </div>
    </div>

    <!-- Tab content — scroll only here -->
    <div class="flex-1 overflow-y-auto bg-gray-50">
      <!-- ── Tab 0: Mapa de Estaciones ── -->
      <div v-show="activeTab === 0" class="h-full flex flex-col">
        <div class="flex-1 relative rounded-lg overflow-hidden m-3 border border-gray-200 shadow-sm">
          <div id="stations-map" class="absolute inset-0 z-0"></div>
        </div>
        <div class="px-4 pb-4 pt-2 shrink-0">
          <h4 class="text-sm font-bold text-igp-dark-blue mb-1">Red de Estaciones Sísmicas</h4>
          <p class="text-xs text-gray-500 leading-relaxed">
            Mapa del Perú mostrando la red de estaciones sísmicas del IGP.
            Las estaciones en <span class="font-bold text-igp-blue">azul</span> corresponden a las
            que registraron el evento <span class="font-semibold">{{ record.title }}</span>
            ({{ record.stations.length }} estaciones activas).
            Las estaciones en <span class="text-gray-400">gris</span> son las demás estaciones de la red.
            Use el selector de capas <span class="font-medium">(esquina superior derecha)</span> para cambiar el mapa base.
          </p>
        </div>
      </div>

      <!-- ── Tab 1: Ondas Sísmicas — 2x2 grid ── -->
      <div v-show="activeTab === 1" class="h-full flex flex-col p-4">
        <div
          class="flex-1 grid gap-3"
          :class="[
            waveformImages.length <= 2 ? 'grid-cols-2' : 'grid-cols-2',
            waveformImages.length === 1 ? 'grid-cols-1' : ''
          ]"
          :style="waveformImages.length <= 2 ? 'grid-template-rows: 1fr' : 'grid-template-rows: 1fr 1fr'"
        >
          <div
            v-for="(img, idx) in waveformImages"
            :key="img.station"
            class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col animate-fadeSlideIn"
            :style="{ animationDelay: (idx * 80) + 'ms' }"
            :class="[
              waveformImages.length === 3 && idx === 2 ? 'col-span-2 max-w-[50%] mx-auto w-full' : ''
            ]"
          >
            <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2 shrink-0">
              <AppIcon name="activity" :size="12" class="text-igp-dark-blue" />
              <span class="text-xs font-bold text-igp-dark-blue">{{ img.station }}</span>
              <span class="text-[10px] text-gray-400">{{ img.name }}</span>
            </div>
            <div class="flex-1 p-1.5 flex items-center justify-center">
              <img
                :src="img.asciiUrl"
                :alt="'Onda sísmica ' + img.station"
                class="max-w-full max-h-full object-contain rounded-lg"
                loading="lazy"
                @error="(e) => { e.target.src = img.sacUrl }"
              />
            </div>
          </div>
        </div>
        <div class="pt-3 shrink-0">
          <h4 class="text-sm font-bold text-igp-dark-blue mb-1">Formas de Onda</h4>
          <p class="text-xs text-gray-500 leading-relaxed">
            Registros gráficos de las ondas sísmicas captadas por cada estación durante el evento
            <span class="font-semibold">{{ record.title }}</span> del {{ record.date }}.
            Estas gráficas muestran la amplitud de las ondas en función del tiempo, permitiendo
            identificar las fases P y S del sismo.
          </p>
        </div>
      </div>

      <!-- ── Tab 2: Información del Sismo — 2 columns ── -->
      <div v-show="activeTab === 2" class="h-full flex flex-col p-4 overflow-y-auto">
        <!-- Section Title -->
        <div class="mb-3 animate-fadeSlideIn">
          <h3 class="text-base font-extrabold text-gray-800 flex items-center gap-2">
            <span class="text-igp-dark-blue">1.</span> Datos del evento
          </h3>
        </div>

        <!-- Info grid — 2 columns -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div
            v-for="(item, idx) in infoItems"
            :key="item.label"
            class="flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 animate-fadeSlideIn"
            :style="{ animationDelay: (idx * 50) + 'ms' }"
          >
            <div class="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
              <AppIcon :name="item.icon" :size="14" class="text-gray-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-gray-800">{{ item.label }}</p>
              <p class="text-sm text-gray-500 mt-0.5">{{ item.value }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
          <!-- Observaciones -->
          <div v-if="record.info?.observaciones" class="bg-igp-sky-blue-50 rounded-xl p-4 border border-igp-sky-blue-100 animate-fadeSlideIn" style="animation-delay: 400ms">
            <h4 class="text-sm font-bold text-igp-dark-blue mb-1 flex items-center gap-2">
              <AppIcon name="file-text" :size="14" />
              Observaciones
            </h4>
            <p class="text-xs text-gray-600 leading-relaxed">{{ record.info.observaciones }}</p>
          </div>

          <!-- Stations used -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 animate-fadeSlideIn" style="animation-delay: 500ms">
            <h4 class="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <AppIcon name="target" :size="14" class="text-gray-400" />
              Estaciones que Registraron el Evento
            </h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="st in record.stations"
                :key="st"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg"
              >
                <span class="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                {{ st }} — {{ STATIONS_CATALOG[st]?.name || st }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ EMPTY STATE ═══ -->
  <div v-else class="h-full flex items-center justify-center bg-gray-50 overflow-hidden">
    <div class="max-w-2xl w-full px-8 animate-fadeSlideIn">
      <div class="flex flex-col items-center">
        <!-- Header -->
        <div class="mb-6 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-igp-dark-blue/10 text-igp-dark-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3 animate-fadeSlideIn">
            <AppIcon name="activity" :size="14" />
            <span>Sistema de Reportes</span>
          </div>
          <h2 class="text-2xl font-extrabold text-gray-800 animate-fadeSlideIn" style="animation-delay: 100ms">Reportes Sísmicos del IGP</h2>
          <p class="text-sm text-gray-500 mt-2 leading-relaxed max-w-md mx-auto animate-fadeSlideIn" style="animation-delay: 150ms">
            Visualiza la información completa de cada evento sísmico: estaciones de monitoreo,
            formas de onda y datos técnicos detallados.
          </p>
        </div>

        <!-- Epicentro images carousel -->
        <div class="grid grid-cols-3 gap-3 mb-6 w-full max-w-lg">
          <div
            v-for="(rec, idx) in previewRecords.slice(0, 3)"
            :key="rec.id"
            class="rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-fadeSlideIn"
            :style="{ animationDelay: (idx * 100 + 200) + 'ms' }"
          >
            <img
              :src="getEpicentroUrl(rec.id)"
              :alt="rec.title"
              class="w-full h-28 object-cover"
              loading="lazy"
              @error="(e) => { e.target.src = getEpicentroFallback(rec.id) }"
            />
            <div class="px-2 py-1.5 bg-white">
              <p class="text-[10px] font-bold text-gray-700 truncate">{{ rec.title }}</p>
              <p class="text-[9px] text-gray-400">{{ rec.info?.magnitud }}</p>
            </div>
          </div>
        </div>

        <!-- Features row -->
        <div class="grid grid-cols-3 gap-3 mb-6 w-full max-w-lg animate-fadeSlideIn" style="animation-delay: 500ms">
          <div class="text-center p-3 bg-white rounded-xl border border-gray-100">
            <AppIcon name="map-pin" :size="20" class="text-igp-dark-blue mx-auto mb-1" />
            <p class="text-[10px] font-semibold text-gray-600">Estaciones</p>
          </div>
          <div class="text-center p-3 bg-white rounded-xl border border-gray-100">
            <AppIcon name="activity" :size="20" class="text-igp-dark-blue mx-auto mb-1" />
            <p class="text-[10px] font-semibold text-gray-600">Ondas Sísmicas</p>
          </div>
          <div class="text-center p-3 bg-white rounded-xl border border-gray-100">
            <AppIcon name="info" :size="20" class="text-igp-dark-blue mx-auto mb-1" />
            <p class="text-[10px] font-semibold text-gray-600">Información</p>
          </div>
        </div>

        <!-- CTA arrow -->
        <div class="flex items-center gap-3 bg-igp-dark-blue/5 px-5 py-3 rounded-xl animate-fadeSlideIn" style="animation-delay: 600ms">
          <svg class="w-7 h-7 text-igp-dark-blue animate-bounce-left shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <div>
            <p class="text-sm font-extrabold text-igp-dark-blue">Selecciona un evento sísmico</p>
            <p class="text-[10px] text-gray-500">Elige un sismo de la lista para comenzar</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeSlideIn {
  animation: fadeSlideIn 0.4s ease-out both;
}
@keyframes bounceLeft {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-8px); }
}
.animate-bounce-left {
  animation: bounceLeft 1.2s ease-in-out infinite;
}
@keyframes bounceGentle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.animate-bounce-gentle {
  animation: bounceGentle 1.5s ease-in-out infinite;
}
</style>
