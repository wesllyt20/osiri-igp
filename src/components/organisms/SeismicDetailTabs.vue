<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import ImageLightbox from '@/components/atoms/ImageLightbox.vue'
import { STATIONS_CATALOG, SEISMIC_RECORDS } from '@/data/seismicData'

const props = defineProps({
  record: { type: Object, default: null },
})

const emit = defineEmits(['next-step', 'select-record'])

// ─────────────────────────────────────────
// EMPTY STATE — Slideshow de preview cards
// ─────────────────────────────────────────

const previewRecords = computed(() => SEISMIC_RECORDS.slice(0, 6))
const slideshowIndexes = ref({})
const slideshowTimers = {}

function getSlideshowImages(rec) {
  const num = rec.id.split('_')[0]
  return [
    {
      url: `./records/${rec.id}/epicentro_${num}.PNG`,
      fallback: `./records/${rec.id}/epicentro_${num}.JPG`,
    },
    ...rec.stations.map((s) => ({
      url: `./records/${rec.id}/graficas_formato_mm.SAC/${s}_WA_mm.png`,
    })),
  ]
}

function currentSlideIdx(recId) {
  return slideshowIndexes.value[recId] ?? 0
}

function startSlideshow(rec) {
  const id = rec.id
  if (slideshowTimers[id]) clearInterval(slideshowTimers[id])
  slideshowIndexes.value = { ...slideshowIndexes.value, [id]: 0 }
  slideshowTimers[id] = setInterval(() => {
    const total = getSlideshowImages(rec).length
    const next = ((slideshowIndexes.value[id] ?? 0) + 1) % total
    slideshowIndexes.value = { ...slideshowIndexes.value, [id]: next }
  }, 2000)
}

function stopSlideshow(recId) {
  if (slideshowTimers[recId]) {
    clearInterval(slideshowTimers[recId])
    delete slideshowTimers[recId]
  }
  const updated = { ...slideshowIndexes.value }
  delete updated[recId]
  slideshowIndexes.value = updated
}

// ─────────────────────────────────────────
// SELECTED STATE — Modal de imagenes
// ─────────────────────────────────────────

const modalSrc = ref(null)
const modalAlt = ref('')

function openModal(url, alt) {
  modalSrc.value = url
  modalAlt.value = alt || ''
}

// ─────────────────────────────────────────
// SELECTED STATE — Mapa Leaflet
// ─────────────────────────────────────────

let map = null
let L = null
let markerGroup = null
let layerControl = null
let tooltipTimer = null
let activeMarkers = []

const recordStations = computed(() => {
  if (!props.record) return []
  return props.record.stations.map((code) => ({
    code,
    ...(STATIONS_CATALOG[code] || { name: code, lat: -12, lng: -76 }),
  }))
})

const allStations = computed(() =>
  Object.entries(STATIONS_CATALOG).map(([code, data]) => ({ code, ...data })),
)

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

  const el = document.getElementById('seismic-detail-map')
  if (!el) return

  if (map) {
    map.remove()
    map = null
  }

  const stns = recordStations.value
  const centerLat = stns.reduce((s, st) => s + st.lat, 0) / stns.length
  const centerLng = stns.reduce((s, st) => s + st.lng, 0) / stns.length

  map = L.map(el, {
    zoomControl: true,
    minZoom: 5,
    maxZoom: 18,
  }).setView([centerLat, centerLng], 7)

  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  })
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri', maxZoom: 18 },
  )
  const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
  })

  osm.addTo(map)
  layerControl = L.control
    .layers({ 'Estandar': osm, 'Satelite': satellite, 'Terreno': terrain }, null, {
      position: 'topright',
    })
    .addTo(map)

  markerGroup = L.layerGroup().addTo(map)

  allStations.value.forEach((st) => {
    if (props.record.stations.includes(st.code)) return
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

  activeMarkers = []
  stns.forEach((st) => {
    const dot = L.circleMarker([st.lat, st.lng], {
      radius: 8,
      color: '#0032ff',
      fillColor: '#3b6bff',
      fillOpacity: 1,
      weight: 2,
    })
    dot.bindTooltip(
      `<b>${st.code}</b> — ${st.name}<br>Lat: ${st.lat.toFixed(1)}, Lng: ${st.lng.toFixed(1)}`,
      { permanent: false, direction: 'top', offset: [0, -8] },
    )
    markerGroup.addLayer(dot)
    activeMarkers.push(dot)

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#0032ff;color:white;width:fit-content;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap;border:1.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)">${st.code}</div>`,
      iconSize: [0, 0],
      iconAnchor: [-12, 10],
    })
    L.marker([st.lat, st.lng], { icon }).addTo(markerGroup)
  })

  if (tooltipTimer) clearTimeout(tooltipTimer)
  setTimeout(() => {
    activeMarkers.forEach((m) => m.openTooltip())
    tooltipTimer = setTimeout(() => activeMarkers.forEach((m) => m.closeTooltip()), 5000)
  }, 500)

  if (stns.length > 0) {
    map.fitBounds(L.latLngBounds(stns.map((s) => [s.lat, s.lng])).pad(0.5))
  }
}

watch(
  () => props.record?.id,
  () => nextTick(() => initMap()),
)

onMounted(() => {
  if (props.record) initMap()
})

onUnmounted(() => {
  Object.values(slideshowTimers).forEach((t) => clearInterval(t))
  if (tooltipTimer) clearTimeout(tooltipTimer)
  if (map) {
    map.remove()
    map = null
  }
})

// ─────────────────────────────────────────
// SELECTED STATE — Datos del evento
// ─────────────────────────────────────────

const eventInfoItems = computed(() => {
  if (!props.record?.info) return []
  const info = props.record.info
  return [
    { label: 'Referencia:', value: 'Por determinar...', icon: 'map-pin' },
    {
      label: 'Fecha y hora origen local:',
      value: `${props.record.date} ${props.record.time}`,
      icon: 'clock',
    },
    { label: 'Latitud y Longitud (grados):', value: 'Por determinar...', icon: 'compass' },
    { label: 'Profundidad:', value: info.profundidad, icon: 'layers' },
    ...props.record.stations.map((st) => ({
      label: 'Intensidad maxima (MM):',
      value: 'Por determinar...',
      icon: 'activity',
      badge: st,
    })),
  ]
})

// ─────────────────────────────────────────
// SELECTED STATE — Imagenes SAC
// ─────────────────────────────────────────

const sacImages = computed(() => {
  if (!props.record) return []
  return props.record.stations.map((code) => ({
    station: code,
    name: STATIONS_CATALOG[code]?.name || code,
    url: `./records/${props.record.id}/graficas_formato_mm.SAC/${code}_WA_mm.png`,
  }))
})

function handleNextStep() {
  emit('next-step')
}
</script>

<template>
  <!-- ESTADO SELECCIONADO: vista unica sin pestanas -->
  <div v-if="record" class="h-full flex flex-col bg-gray-50 overflow-hidden">

    <!-- Contenido scrolleable -->
    <div class="flex-1 overflow-y-auto">

      <!-- 1. MAPA centrado en las estaciones -->
      <div class="relative bg-gray-200 shrink-0" style="height: 320px">
        <div id="seismic-detail-map" class="absolute inset-0 z-0" />
        <div class="absolute top-3 left-3 z-[400] pointer-events-none">
          <span
            class="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-igp-dark-blue text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-white/60"
          >
            <AppIcon name="activity" :size="12" />
            {{ record.title }} &mdash; {{ record.subtitle }}
          </span>
        </div>
      </div>

      <div class="p-5 space-y-7">

        <!-- 2. DATOS DEL EVENTO -->
        <section>
          <h3 class="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-igp-dark-blue text-lg">1.</span>
            Datos del evento:
          </h3>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              v-for="(item, idx) in eventInfoItems"
              :key="idx"
              class="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style="background: rgba(0, 40, 120, 0.08)"
              >
                <AppIcon :name="item.icon" :size="22" class="text-igp-dark-blue" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[10px] font-semibold text-gray-400 leading-snug uppercase tracking-wide">
                  {{ item.label }}
                  <span
                    v-if="item.badge"
                    class="ml-1 text-[9px] font-black text-igp-blue normal-case tracking-normal px-1.5 py-0.5 rounded-full"
                    style="background: rgba(0, 100, 255, 0.1)"
                  >{{ item.badge }}</span>
                </p>
                <p class="text-sm font-bold text-gray-700 mt-1 leading-snug">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. FORMAS DE ONDA (graficas_formato_mm.SAC) -->
        <section>
          <h3 class="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <AppIcon name="activity" :size="18" class="text-igp-dark-blue" />
            Formas de Onda &mdash; mm.SAC
          </h3>

          <div
            class="grid grid-cols-2 gap-3"
            :class="sacImages.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'"
          >
            <button
              v-for="(img, idx) in sacImages"
              :key="img.station"
              class="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-igp-sky-blue-300 transition-all duration-200 group cursor-zoom-in text-left animate-fadeSlideIn"
              :style="{ animationDelay: idx * 60 + 'ms' }"
              @click="openModal(img.url, record.title + ' — ' + img.station + ' (' + img.name + ')')"
            >
              <div class="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                <AppIcon name="activity" :size="13" class="text-igp-dark-blue shrink-0" />
                <span class="text-xs font-extrabold text-igp-dark-blue">{{ img.station }}</span>
                <span class="text-[10px] text-gray-400 truncate">{{ img.name }}</span>
              </div>

              <div class="relative overflow-hidden bg-gray-50">
                <img
                  :src="img.url"
                  :alt="'Onda sismica ' + img.station"
                  class="w-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                  style="max-height: 170px; min-height: 110px"
                  loading="lazy"
                />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div
                    class="bg-white text-igp-dark-blue text-xs font-bold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5"
                  >
                    <AppIcon name="eye" :size="13" />
                    Ver ampliado
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>

      </div>
    </div>

    <!-- Boton Siguiente (sticky) -->
    <div class="shrink-0 px-5 py-3 bg-white border-t border-gray-200 flex justify-end">
      <button
        class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all duration-200 cursor-pointer active:scale-95 hover:opacity-90"
        style="background: #1a7a3c"
        @click="handleNextStep"
      >
        Siguiente paso
        <AppIcon name="arrow-right" :size="16" />
      </button>
    </div>

    <!-- Modal de imagen ampliada -->
    <ImageLightbox
      v-if="modalSrc"
      :src="modalSrc"
      :alt="modalAlt"
      @close="modalSrc = null"
    />
  </div>

  <!-- ESTADO VACIO: pantalla de seleccion de sismo -->
  <div v-else class="h-full overflow-y-auto bg-gray-50">
    <div class="flex flex-col items-center px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full">

      <!-- Header -->
      <div class="mb-8 text-center animate-fadeSlideIn">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 text-igp-dark-blue text-xs font-bold uppercase tracking-wider rounded-full mb-4"
          style="background: rgba(0, 40, 120, 0.08)"
        >
          <AppIcon name="activity" :size="14" />
          <span>Sistema de Reportes</span>
        </div>
        <h2 class="text-2xl font-extrabold text-gray-800">Reportes Sismicos del IGP</h2>
        <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          Visualiza la informacion completa de cada evento sismico: estaciones de monitoreo,
          formas de onda y datos tecnicos detallados.
        </p>
      </div>

      <!-- 6 Preview cards (Sismo A-F) con hover slideshow -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mb-8">
        <button
          v-for="(rec, cardIdx) in previewRecords"
          :key="rec.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left group cursor-pointer animate-fadeSlideIn card-preview"
          :style="{ animationDelay: cardIdx * 80 + 'ms' }"
          @mouseenter="startSlideshow(rec)"
          @mouseleave="stopSlideshow(rec.id)"
          @click="$emit('select-record', rec)"
        >
          <!-- Area de imagen con slideshow -->
          <div class="relative overflow-hidden bg-gray-100" style="height: 180px">
            <img
              v-for="(img, imgIdx) in getSlideshowImages(rec)"
              :key="imgIdx"
              :src="img.url"
              :alt="rec.title"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              :class="imgIdx === currentSlideIdx(rec.id) ? 'opacity-100' : 'opacity-0'"
              loading="lazy"
              @error="(e) => { if (img.fallback) e.target.src = img.fallback }"
            />

            <!-- Gradiente inferior -->
            <div
              class="absolute inset-0 pointer-events-none"
              style="background: linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)"
            />

            <!-- Indicadores de diapositiva -->
            <div class="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              <span
                v-for="(_, dotIdx) in getSlideshowImages(rec)"
                :key="dotIdx"
                class="rounded-full transition-all duration-300"
                :style="{
                  width: dotIdx === currentSlideIdx(rec.id) ? '14px' : '6px',
                  height: '6px',
                  background: dotIdx === currentSlideIdx(rec.id) ? 'white' : 'rgba(255,255,255,0.4)',
                }"
              />
            </div>

            <!-- Badge Auto (hover) -->
            <div
              class="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
              <span
                class="text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style="background: rgba(0,0,0,0.55)"
              >
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Auto
              </span>
            </div>
          </div>

          <!-- Info del card -->
          <div class="px-4 py-3">
            <p class="text-sm font-extrabold text-igp-dark-blue group-hover:text-igp-blue transition-colors leading-snug">
              {{ rec.title }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5 truncate">{{ rec.subtitle }}</p>
            <p class="text-[10px] mt-0.5" style="color: #bbb">{{ rec.info?.region }}</p>
          </div>
        </button>
      </div>

      <!-- Iconos de caracteristicas -->
      <div
        class="grid grid-cols-3 gap-3 w-full max-w-lg mb-7 animate-fadeSlideIn"
        style="animation-delay: 550ms"
      >
        <div class="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <AppIcon name="map-pin" :size="24" class="text-igp-dark-blue mx-auto mb-1.5" />
          <p class="text-[11px] font-semibold text-gray-600">Estaciones</p>
        </div>
        <div class="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <AppIcon name="activity" :size="24" class="text-igp-dark-blue mx-auto mb-1.5" />
          <p class="text-[11px] font-semibold text-gray-600">Ondas Sismicas</p>
        </div>
        <div class="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <AppIcon name="info" :size="24" class="text-igp-dark-blue mx-auto mb-1.5" />
          <p class="text-[11px] font-semibold text-gray-600">Informacion</p>
        </div>
      </div>

      <!-- CTA desktop -->
      <div
        class="hidden lg:flex items-center gap-3 px-6 py-3.5 rounded-2xl animate-fadeSlideIn"
        style="background: rgba(0,40,120,0.05); animation-delay: 650ms"
      >
        <svg
          class="w-7 h-7 text-igp-dark-blue animate-bounce-left shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <div>
          <p class="text-sm font-extrabold text-igp-dark-blue">Selecciona un evento sismico</p>
          <p class="text-[10px] text-gray-500">Elige un sismo de la lista para comenzar</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeSlideIn {
  animation: fadeSlideIn 0.4s ease-out both;
}

@keyframes bounceLeft {
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(-5px); }
}
.animate-bounce-left {
  animation: bounceLeft 1.6s ease-in-out infinite;
}

.card-preview {
  border: 2px solid rgb(226, 232, 240);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.card-preview:hover {
  border-color: rgb(99, 160, 255);
}
</style>
