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
  }, 1000)
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
    zoomControl: false,
    minZoom: 5,
    maxZoom: 18,
  }).setView([centerLat, centerLng], 7)

  L.control.zoom({ position: 'bottomleft' }).addTo(map)

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
    const tooltipContent =
      `<b>${st.code}</b> — ${st.name}<br>Lat: ${st.lat.toFixed(1)}, Lng: ${st.lng.toFixed(1)}`
    const stationIcon = L.divIcon({
      className: 'seismic-active-station-icon',
      html: '<span class="seismic-station-wave"></span><span class="seismic-station-dot"></span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    })
    const dot = L.marker([st.lat, st.lng], {
      icon: stationIcon,
      zIndexOffset: 100,
    })
    dot.bindTooltip(tooltipContent, { permanent: false, direction: 'top', offset: [0, -8] })
    dot.addTo(markerGroup)
    activeMarkers.push(dot)

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#0032ff;color:white;width:fit-content;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap;border:1.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)">${st.code}</div>`,
      iconSize: [52, 22],
      iconAnchor: [-12, 10],
    })
    const labelMarker = L.marker([st.lat, st.lng], { icon })
    labelMarker.bindTooltip(tooltipContent, { permanent: false, direction: 'top', offset: [16, -12] })
    labelMarker.addTo(markerGroup)
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

const eventInfoIcons = {
  reference: {
    viewBox: '0 0 1024 1024',
    paths: [
      {
        d: 'M456.8 994.4c27.2 30.4 72.8 30.4 100-.8 2.4-2.4 7.2-8 14.4-16 12-12.8 24.8-28 38.4-44.8 40-47.2 80-98.4 117.6-150.4s70.4-103.2 96.8-151.2c49.6-88.8 76.8-165.6 76.8-228.8C901.6 180 724.8 0 506.4 0S112 180 112 402.4c0 63.2 27.2 140.8 76.8 229.6 27.2 48 60 99.2 96.8 151.2 37.6 52 77.6 103.2 117.6 150.4 14.4 16.8 27.2 32 38.4 44.8 8 8 12.8 13.6 15.2 16m35.2-32.8c-2.4-2.4-7.2-8-14.4-16-11.2-12.8-24-28-37.6-44-39.2-46.4-78.4-96.8-115.2-147.2-36.8-51.2-68.8-100-94.4-146.4-45.6-82.4-70.4-152.8-70.4-205.6 0-195.2 155.2-353.6 346.4-353.6s347.2 158.4 347.2 353.6c0 52.8-24.8 123.2-70.4 204.8-25.6 46.4-57.6 96-94.4 146.4-36.8 51.2-76 100.8-115.2 147.2-13.6 16-26.4 31.2-37.6 44-7.2 8-12 12.8-14.4 16-8.8 9.6-20.8 10.4-29.6.8',
        fill: 'currentColor',
      },
      {
        d: 'M506.4 578.4c-108 0-196-88-196-196s88-196 196-196 196 88 196 196-88 196-196 196m0-344c-81.6 0-148 66.4-148 148s66.4 148 148 148 148-66.4 148-148-66.4-148-148-148',
        fill: 'currentColor',
      },
    ],
  },
  calendar: {
    viewBox: '0 0 33 30',
    paths: [
      {
        d: 'M25.6975 24.3741C25.691 24.68 25.5565 24.9714 25.3228 25.186C25.0891 25.4006 24.7748 25.5214 24.447 25.5226H4.43806C4.11023 25.5214 3.7959 25.4006 3.56222 25.186C3.32854 24.9714 3.19405 24.68 3.1875 24.3741V5.68037C3.1875 5.37081 3.31925 5.07394 3.55378 4.85504C3.78831 4.63615 4.10639 4.51318 4.43806 4.51318H24.447C24.7787 4.51318 25.0967 4.63615 25.3313 4.85504C25.5658 5.07394 25.6975 5.37081 25.6975 5.68037V24.3741Z',
        stroke: 'currentColor',
        strokeWidth: 1.5067,
      },
      {
        d: 'M3.1875 9.66895H25.6975',
        stroke: 'currentColor',
        strokeWidth: 1.5067,
      },
      {
        d: 'M8.26562 4.51318V2.16943',
        stroke: 'currentColor',
        strokeWidth: 1.5067,
      },
      {
        d: 'M20.3008 4.51318V2.16943',
        stroke: 'currentColor',
        strokeWidth: 1.5067,
      },
    ],
  },
  clock: {
    viewBox: '0 0 33 30',
    paths: [
      {
        d: 'M16.5 26.5C23.1274 26.5 28.5 21.3513 28.5 15C28.5 8.64873 23.1274 3.5 16.5 3.5C9.87258 3.5 4.5 8.64873 4.5 15C4.5 21.3513 9.87258 26.5 16.5 26.5Z',
        stroke: 'currentColor',
        strokeWidth: 1.7,
      },
      {
        d: 'M16.5 8.6V15.2L20.9 18.4',
        stroke: 'currentColor',
        strokeWidth: 1.7,
      },
    ],
  },
  coordinates: {
    viewBox: '0 0 31 31',
    paths: [
      {
        d: 'm17.927 13.183-8.92-5.434c-.397-.224-.957.318-.741.723l5.295 9.094 9.094 5.295a.568.568 0 0 0 .723-.74zm-3.444 3.444 2.583-2.583 3.918 6.406z',
        fill: 'currentColor',
      },
      {
        d: 'M15.498 1.723a13.778 13.778 0 1 0 0 27.556 13.778 13.778 0 0 0 0-27.556m.861 25.79V25.43h-1.722v2.084A12.056 12.056 0 0 1 3.486 16.362h2.083V14.64H3.486a12.056 12.056 0 0 1 11.15-11.15v2.084h1.723V3.489A12.055 12.055 0 0 1 27.51 14.64h-2.083v1.722h2.084a12.056 12.056 0 0 1-11.152 11.152',
        fill: 'currentColor',
      },
    ],
  },
  depth: {
    viewBox: '0 0 30 24',
    paths: [
      {
        d: 'M18.9599 18.0188L15.1088 21.872V16.2868C15.1088 15.9805 14.8884 16.012 14.5884 15.9691C14.2088 15.9139 13.8843 16.208 13.8843 16.5755V21.8781L10.0332 18.0188C9.78828 17.7861 9.40255 17.7921 9.16992 18.0311C8.94336 18.27 8.94336 18.6437 9.16992 18.8826L14.0679 23.7832C14.3067 24.0221 14.6925 24.0221 14.9312 23.7832L19.8293 18.8826C20.0619 18.6375 20.0558 18.2516 19.817 18.0188C19.5783 17.7922 19.1987 17.7922 18.9599 18.0188Z',
        fill: 'currentColor',
      },
      {
        d: 'M29.375 0H0.625018C0.281249 0 0 0.428011 0 0.951166V14.267C0 14.7902 0.281249 15.2182 0.625018 15.2182H29.375C29.7188 15.2182 30 14.7902 30 14.267V0.951166C29.9999 0.428011 29.7187 0 29.375 0ZM28.75 13.3159H1.25004V1.90224H28.75V13.3159Z',
        fill: 'currentColor',
      },
    ],
  },
  magnitude: {
    viewBox: '0 0 32 32',
    paths: [
      {
        d: 'M27.317 4.685c-6.244-6.243-16.391-6.243-22.634 0s-6.244 16.39 0 22.634a.89.89 0 1 0 1.259-1.259c-5.548-5.548-5.548-14.573 0-20.121s14.573-5.548 20.12 0c5.549 5.548 5.549 14.573 0 20.121a.89.89 0 0 0 0 1.26c.333.331.865.363 1.26 0 6.238-6.244 6.238-16.392-.005-22.635',
        fill: 'currentColor',
      },
      {
        d: 'M24.262 7.74c-4.552-4.552-11.965-4.552-16.523 0-4.552 4.553-4.552 11.971 0 16.528A.89.89 0 1 0 9 23.01C5.043 19.18 5.159 12.852 9 8.995c3.861-3.862 10.152-3.862 14.014 0 3.699 3.683 3.973 9.99 0 14.015a.89.89 0 1 0 1.26 1.26c4.541-4.558 4.541-11.976-.011-16.528',
        fill: 'currentColor',
      },
      {
        d: 'M19.955 21.213a.895.895 0 0 0 1.26 0c2.87-2.872 2.87-7.545 0-10.417-2.872-2.871-7.546-2.871-10.417 0s-2.871 7.545 0 10.417a.89.89 0 1 0 1.26-1.26 5.59 5.59 0 0 1 0-7.903c2.18-2.176 5.726-2.181 7.902 0s2.182 5.727 0 7.903a.876.876 0 0 0-.005 1.26m-3.957 2.254c-2.353 0-4.267 1.797-4.267 4.007s1.914 4.007 4.267 4.007c2.352 0 4.266-1.797 4.266-4.007s-1.914-4.007-4.266-4.007m0 6.506c-1.468 0-2.661-1.12-2.661-2.5 0-1.377 1.193-2.498 2.66-2.498s2.662 1.12 2.662 2.499c0 1.378-1.194 2.5-2.661 2.5',
        fill: 'currentColor',
      },
    ],
  },
}

const eventInfoItems = computed(() => {
  if (!props.record?.info) return []
  const info = props.record.info

  return [
    { label: 'Magnitud:', value: 'Por determinar ...', icon: eventInfoIcons.magnitude },
    { label: 'Latitud:', value: 'Por determinar...', icon: eventInfoIcons.coordinates },
    { label: 'Longitud:', value: 'Por determinar...', icon: eventInfoIcons.coordinates, iconRotate: 180 },
    { label: 'Referencia:', value: 'Por determinar...', icon: eventInfoIcons.reference },
    { label: 'Profundidad:', value: info.profundidad || 'Por determinar...', icon: eventInfoIcons.depth },
    { label: 'Fecha:', value: props.record.date || 'Por determinar...', icon: eventInfoIcons.calendar },
    { label: 'Hora:', value: props.record.time || 'Por determinar...', icon: eventInfoIcons.clock },
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
    <div class="flex-1 overflow-y-auto p-4">
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">

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
          <h3 class="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-igp-dark-blue text-lg">1.</span>
            Datos del evento:
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              v-for="item in eventInfoItems"
              :key="item.label"
              class="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div
                class="w-11 h-11 flex items-center justify-center shrink-0 text-black"
              >
                <svg
                  :viewBox="item.icon.viewBox"
                  class="w-8 h-8 flex-none"
                  :style="item.iconRotate ? { transform: 'rotate(' + item.iconRotate + 'deg)' } : null"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path
                    v-for="path in item.icon.paths"
                    :key="path.d"
                    :d="path.d"
                    :fill="path.fill || 'none'"
                    :stroke="path.stroke || 'none'"
                    :stroke-width="path.strokeWidth"
                  />
                </svg>
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
                <p class="text-sm font-medium text-gray-700 mt-1 leading-snug">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. FORMAS DE ONDA (graficas_formato_mm.SAC) -->
        <section>
          <h3 class="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
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
                <span class="text-xs font-medium text-igp-dark-blue">{{ img.station }}</span>
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
    </div>

    <!-- Boton Siguiente (sticky) -->
    <div class="shrink-0 px-5 py-3 bg-white border-t border-gray-200 flex justify-end">
      <button
        class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#1a7a3c] border border-[#1a7a3c] font-bold text-sm shadow-sm transition-all duration-200 cursor-pointer active:scale-95 hover:bg-[#1a7a3c] hover:text-white hover:shadow-md"
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
          <span class="font-medium">Sistema de Reportes</span>
        </div>
        <h2 class="text-2xl font-medium text-gray-800">Reportes Sismicos del IGP</h2>
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

:deep(.seismic-active-station-icon) {
  background: transparent;
  border: 0;
}

:deep(.seismic-station-wave) {
  position: absolute;
  left: 50%;
  top: 50%;
  display: block;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 50, 255, 0.5);
  border-radius: 9999px;
  background: rgba(59, 107, 255, 0.2);
  animation: stationWave 1.65s ease-out infinite;
}

:deep(.seismic-station-dot) {
  position: absolute;
  left: 50%;
  top: 50%;
  display: block;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 9999px;
  background: #1f55ff;
  box-shadow: 0 1px 5px rgba(0, 38, 150, 0.45);
  animation: stationHeartbeat 1.35s ease-in-out infinite;
}

@keyframes stationWave {
  0% {
    opacity: 0.58;
    transform: translate(-50%, -50%) scale(0.45);
  }
  75% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.45);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.45);
  }
}

@keyframes stationHeartbeat {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.9);
  }
  18% {
    transform: translate(-50%, -50%) scale(1.13);
  }
  34% {
    transform: translate(-50%, -50%) scale(0.96);
  }
  52% {
    transform: translate(-50%, -50%) scale(1.08);
  }
  70% {
    transform: translate(-50%, -50%) scale(0.92);
  }
}

.card-preview {
  border: 2px solid rgb(226, 232, 240);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.card-preview:hover {
  border-color: rgb(99, 160, 255);
}
</style>
