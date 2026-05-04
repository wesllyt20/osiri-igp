<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppCintillo from '@/components/organisms/AppCintillo.vue'
import HelpSidebar from '@/components/organisms/HelpSidebar.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

useScrollReveal()

const cintilloSticky = ref(false)
const heroRef = ref(null)
const heroLoaded = ref(false)

// Help sidebars state
const learningHelpOpen = ref(false)
const learningHelpData = ref({ title: '', description: '', items: [], image: '' })
const stepsHelpOpen = ref(false)
const stepsHelpData = ref({ title: '', description: '', items: [], image: '' })
const paramsHelpOpen = ref(false)
const paramsHelpData = ref({ title: '', description: '', items: [], image: '' })

function handleScroll() {
  if (heroRef.value) {
    const heroBottom = heroRef.value.getBoundingClientRect().bottom
    cintilloSticky.value = heroBottom <= 64
  }
}

function scrollToContent() {
  const el = document.getElementById('home-content')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  setTimeout(() => { heroLoaded.value = true }, 150)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const learningTopics = [
  {
    icon: 'activity',
    title: 'Lectura de Ondas Sísmicas',
    description: 'Aprende a reconocer y diferenciar los distintos tipos de ondas sísmicas registradas en los sismogramas.',
    helpItems: [
      { icon: 'radio', title: 'Sismogramas', text: 'Registros gráficos del movimiento del suelo captado por un sismómetro.' },
      { icon: 'trending-up', title: 'Amplitud', text: 'Mide la intensidad del movimiento. A mayor amplitud, mayor energía liberada.' },
      { icon: 'clock', title: 'Periodo', text: 'Tiempo entre ciclos completos de la onda. Define la frecuencia de la señal.' },
    ],
  },
  {
    icon: 'crosshair',
    title: 'Identificación de Ondas P y S',
    description: 'Identifica con precisión las llegadas de las ondas primarias y secundarias en registros sísmicos.',
    helpItems: [
      { icon: 'zap', title: 'Ondas P (Primarias)', text: 'Ondas longitudinales que llegan primero. Son las más rápidas (~6 km/s).' },
      { icon: 'activity', title: 'Ondas S (Secundarias)', text: 'Ondas transversales más lentas (~3.5 km/s). Tienen mayor amplitud.' },
      { icon: 'minus', title: 'Diferencia S-P', text: 'La diferencia de tiempo entre P y S permite calcular la distancia al epicentro.' },
    ],
  },
  {
    icon: 'bar-chart-2',
    title: 'Visualización Interactiva',
    description: 'Utiliza gráficas interactivas para analizar señales, hacer zoom y explorar datos sísmicos.',
    helpItems: [
      { icon: 'zoom-in', title: 'Zoom y Navegación', text: 'Explora regiones específicas del sismograma para identificar fases.' },
      { icon: 'sliders', title: 'Filtros', text: 'Aplica filtros para separar señales de interés del ruido de fondo.' },
      { icon: 'maximize-2', title: 'Comparación', text: 'Compara registros de múltiples estaciones simultáneamente.' },
    ],
  },
  {
    icon: 'calculator',
    title: 'Cálculos Sismológicos',
    description: 'Realiza cálculos de diferencia de tiempo, distancia epicentral y otros parámetros fundamentales.',
    helpItems: [
      { icon: 'divide', title: 'Fórmula de Distancia', text: 'D = (ΔT × Vp × Vs) / (Vp - Vs), usando velocidades de ondas P y S.' },
      { icon: 'bar-chart', title: 'Magnitud Local', text: 'ML = log₁₀(A) + log₁₀(D), basada en amplitud máxima y distancia.' },
      { icon: 'clock', title: 'Hora Origen', text: 'T₀ = Tp - D/Vp, calculada a partir de la llegada de la onda P.' },
    ],
  },
  {
    icon: 'globe',
    title: 'Localización del Epicentro',
    description: 'Determina la ubicación geográfica del epicentro utilizando datos de múltiples estaciones.',
    helpItems: [
      { icon: 'circle', title: 'Método de Círculos', text: 'Cada estación define un círculo con radio = distancia epicentral.' },
      { icon: 'crosshair', title: 'Trilateración', text: 'La intersección de 3 o más círculos determina el epicentro.' },
      { icon: 'map', title: 'Coordenadas', text: 'Se obtiene latitud y longitud del punto de intersección.' },
    ],
  },
  {
    icon: 'file-text',
    title: 'Reporte Sísmico Completo',
    description: 'Genera un reporte sísmico profesional con magnitud, coordenadas, profundidad y hora del evento.',
    helpItems: [
      { icon: 'clipboard', title: 'Formato Oficial', text: 'El reporte sigue el formato utilizado por el IGP para comunicados oficiales.' },
      { icon: 'download', title: 'Exportación', text: 'Descarga el reporte en formato PDF con todos los datos y gráficos.' },
      { icon: 'share-2', title: 'Datos Completos', text: 'Incluye magnitud, coordenadas, profundidad, hora y referencia geográfica.' },
    ],
  },
]

const processSteps = [
  {
    number: 1, title: 'Introducción', icon: 'book-open',
    helpDesc: 'Conoce los conceptos básicos de sismología y el funcionamiento de la red sísmica del IGP.',
    helpItems: [
      { icon: 'info', text: 'Introducción a la sismología y tipos de ondas sísmicas.' },
      { icon: 'radio', text: 'Funcionamiento de las estaciones sísmicas.' },
      { icon: 'globe', text: 'La red sísmica nacional del Perú.' },
    ],
  },
  {
    number: 2, title: 'Lectura de Ondas', icon: 'activity',
    helpDesc: 'Aprende a leer e interpretar los registros sísmicos (sismogramas) de las estaciones.',
    helpItems: [
      { icon: 'activity', text: 'Componentes de un sismograma: tiempo, amplitud y periodo.' },
      { icon: 'eye', text: 'Identificación visual de señales vs ruido.' },
      { icon: 'layers', text: 'Diferentes componentes: vertical, N-S, E-W.' },
    ],
  },
  {
    number: 3, title: 'Visualización', icon: 'bar-chart-2',
    helpDesc: 'Utiliza herramientas gráficas interactivas para explorar datos sísmicos.',
    helpItems: [
      { icon: 'zoom-in', text: 'Herramientas de zoom y selección de ventanas de tiempo.' },
      { icon: 'sliders', text: 'Filtrado de frecuencias para mejorar la señal.' },
      { icon: 'maximize-2', text: 'Vista comparativa multi-estación.' },
    ],
  },
  {
    number: 4, title: 'Identificación P/S', icon: 'crosshair',
    helpDesc: 'Marca con precisión los tiempos de llegada de las ondas P y S.',
    helpItems: [
      { icon: 'zap', text: 'La onda P llega primero y tiene menor amplitud.' },
      { icon: 'activity', text: 'La onda S tiene mayor amplitud y llega después.' },
      { icon: 'edit-3', text: 'Marcado interactivo sobre el sismograma.' },
    ],
  },
  {
    number: 5, title: 'Cálculos Básicos', icon: 'calculator',
    helpDesc: 'Calcula distancia epicentral y magnitud usando fórmulas sismológicas.',
    helpItems: [
      { icon: 'minus', text: 'Cálculo del tiempo diferencial S-P (ΔT).' },
      { icon: 'map-pin', text: 'Distancia epicentral: D = (ΔT × Vp × Vs) / (Vp - Vs).' },
      { icon: 'zap', text: 'Magnitud local: ML = log₁₀(A) + log₁₀(D).' },
    ],
  },
  {
    number: 6, title: 'Cálculos Vectoriales', icon: 'git-branch',
    helpDesc: 'Determina la dirección y posición del epicentro usando geometría vectorial.',
    helpItems: [
      { icon: 'navigation', text: 'Azimut (dirección) desde cada estación al epicentro.' },
      { icon: 'circle', text: 'Círculos de distancia alrededor de cada estación.' },
      { icon: 'crosshair', text: 'Intersección de círculos para ubicar el epicentro.' },
    ],
  },
  {
    number: 7, title: 'Parámetros', icon: 'globe',
    helpDesc: 'Determina todos los parámetros del evento: hora, coordenadas, profundidad.',
    helpItems: [
      { icon: 'clock', text: 'Hora origen UTC del evento sísmico.' },
      { icon: 'map-pin', text: 'Coordenadas geográficas (latitud/longitud).' },
      { icon: 'layers', text: 'Estimación de la profundidad focal.' },
    ],
  },
  {
    number: 8, title: 'Reporte Final', icon: 'file-text',
    helpDesc: 'Genera el reporte sísmico completo en formato profesional del IGP.',
    helpItems: [
      { icon: 'file-text', text: 'Compilación de todos los parámetros calculados.' },
      { icon: 'image', text: 'Mapa de localización y gráficos de ondas.' },
      { icon: 'download', text: 'Exportación en formato PDF para distribución.' },
    ],
  },
]

const reportParams = [
  { icon: 'zap', label: 'Magnitud', value: 'ML / Mw', helpDesc: 'Medida de la energía liberada por el sismo. Se calcula a partir de la amplitud máxima del sismograma y la distancia epicentral.', helpItems: [{ icon: 'bar-chart', text: 'ML = log₁₀(A) + log₁₀(D)' }, { icon: 'info', text: 'Escala logarítmica: cada unidad = 10x más amplitud.' }] },
  { icon: 'map-pin', label: 'Latitud', value: '° Sur', helpDesc: 'Coordenada geográfica norte-sur del epicentro del sismo.', helpItems: [{ icon: 'globe', text: 'En Perú, siempre en grados Sur (valores negativos).' }, { icon: 'crosshair', text: 'Se obtiene de la trilateración de estaciones.' }] },
  { icon: 'compass', label: 'Longitud', value: '° Oeste', helpDesc: 'Coordenada geográfica este-oeste del epicentro del sismo.', helpItems: [{ icon: 'globe', text: 'En Perú, siempre en grados Oeste (valores negativos).' }, { icon: 'crosshair', text: 'Se determina junto con la latitud por trilateración.' }] },
  { icon: 'layers', label: 'Profundidad', value: 'km', helpDesc: 'Distancia vertical desde la superficie hasta el foco o hipocentro del sismo.', helpItems: [{ icon: 'arrow-down', text: 'Superficial: < 70 km | Intermedio: 70-300 km | Profundo: > 300 km.' }, { icon: 'info', text: 'Los sismos superficiales suelen ser más destructivos.' }] },
  { icon: 'clock', label: 'Hora UTC', value: 'hh:mm:ss', helpDesc: 'Momento exacto en que ocurrió el sismo (hora origen), expresado en tiempo universal coordinado.', helpItems: [{ icon: 'clock', text: 'Se calcula: T₀ = Tp - D/Vp.' }, { icon: 'globe', text: 'UTC = hora local de Perú + 5 horas.' }] },
  { icon: 'target', label: 'Epicentro', value: 'Ubicación', helpDesc: 'Punto en la superficie terrestre directamente sobre el foco del sismo.', helpItems: [{ icon: 'map', text: 'Se expresa como referencia geográfica (distancia a ciudad más cercana).' }, { icon: 'circle', text: 'Determinado por intersección de círculos de distancia.' }] },
]

function openLearningHelp(topic) {
  learningHelpData.value = {
    title: topic.title,
    description: topic.description,
    items: topic.helpItems || [],
    image: '',
  }
  learningHelpOpen.value = true
}

function openStepHelp(step) {
  stepsHelpData.value = {
    title: `Paso ${step.number}: ${step.title}`,
    description: step.helpDesc || '',
    items: step.helpItems || [],
    image: '',
  }
  stepsHelpOpen.value = true
}

function openParamHelp(param) {
  paramsHelpData.value = {
    title: param.label,
    description: param.helpDesc || '',
    items: param.helpItems || [],
    image: '',
  }
  paramsHelpOpen.value = true
}
</script>

<template>
  <DefaultLayout>
    <!-- ====== HERO SECTION ====== -->
    <section ref="heroRef" class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background image with parallax effect -->
      <div class="absolute inset-0">
        <img
          src="/bg-images/hero.png"
          alt="Sismógrafo registrando ondas sísmicas"
          class="w-full h-full object-cover scale-105 transition-transform duration-2000"
          :class="heroLoaded ? 'scale-100' : 'scale-110'"
        />
        <div class="absolute inset-0 bg-linear-to-br from-igp-blue-950/90 via-igp-blue-900/80 to-igp-blue-950/85" />
        <!-- Animated grid overlay -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px); background-size: 60px 60px;" />
      </div>

      <!-- Floating seismic wave decoration -->
      <div class="absolute bottom-0 left-0 right-0 h-28 pointer-events-none overflow-hidden">
        <svg class="seismic-line-svg" viewBox="0 0 2400 100" preserveAspectRatio="none" style="position:absolute;bottom:20px;left:0;width:200%;height:60px;opacity:0.25">
          <path d="M0,50 L40,50 L45,20 L50,80 L55,15 L60,85 L65,25 L70,75 L75,35 L80,65 L85,45 L90,50 L130,50 L135,30 L140,70 L145,20 L150,80 L155,10 L160,90 L165,30 L170,70 L175,45 L180,50 L220,50 L225,25 L230,75 L235,15 L240,85 L245,20 L250,80 L255,35 L260,65 L265,45 L270,50 L350,50 L355,30 L360,70 L365,20 L370,80 L375,25 L380,75 L385,40 L390,60 L395,50 L450,50 L455,20 L460,80 L465,10 L470,90 L475,20 L480,80 L485,35 L490,65 L495,50 L560,50 L565,30 L570,70 L575,25 L580,75 L585,35 L590,65 L595,45 L600,50 L700,50 L705,25 L710,75 L715,15 L720,85 L725,25 L730,75 L735,40 L740,60 L745,50 L820,50 L825,20 L830,80 L835,15 L840,85 L845,30 L850,70 L855,45 L860,50 L950,50 L955,30 L960,70 L965,20 L970,80 L975,25 L980,75 L985,40 L990,50 L1050,50 L1055,20 L1060,80 L1065,10 L1070,90 L1075,30 L1080,70 L1085,45 L1090,50 L1200,50 L1240,50 L1245,20 L1250,80 L1255,15 L1260,85 L1265,25 L1270,75 L1275,35 L1280,65 L1285,45 L1290,50 L1330,50 L1335,30 L1340,70 L1345,20 L1350,80 L1355,10 L1360,90 L1365,30 L1370,70 L1375,45 L1380,50 L1420,50 L1425,25 L1430,75 L1435,15 L1440,85 L1445,20 L1450,80 L1455,35 L1460,65 L1465,45 L1470,50 L1550,50 L1555,30 L1560,70 L1565,20 L1570,80 L1575,25 L1580,75 L1585,40 L1590,60 L1595,50 L1650,50 L1655,20 L1660,80 L1665,10 L1670,90 L1675,20 L1680,80 L1685,35 L1690,65 L1695,50 L1760,50 L1765,30 L1770,70 L1775,25 L1780,75 L1785,35 L1790,65 L1795,45 L1800,50 L1900,50 L1905,25 L1910,75 L1915,15 L1920,85 L1925,25 L1930,75 L1935,40 L1940,60 L1945,50 L2020,50 L2025,20 L2030,80 L2035,15 L2040,85 L2045,30 L2050,70 L2055,45 L2060,50 L2150,50 L2155,30 L2160,70 L2165,20 L2170,80 L2175,25 L2180,75 L2185,40 L2190,50 L2250,50 L2255,20 L2260,80 L2265,10 L2270,90 L2275,30 L2280,70 L2285,45 L2290,50 L2400,50" stroke="white" stroke-width="2" fill="none" class="animate-seismic-scroll" />
        </svg>
        <svg class="seismic-line-svg" viewBox="0 0 2400 100" preserveAspectRatio="none" style="position:absolute;bottom:40px;left:0;width:200%;height:50px;opacity:0.12">
          <path d="M0,50 L80,50 L85,30 L90,70 L95,25 L100,75 L105,35 L110,65 L115,50 L200,50 L205,25 L210,75 L215,20 L220,80 L225,30 L230,70 L235,50 L350,50 L355,35 L360,65 L365,25 L370,75 L375,30 L380,70 L385,50 L500,50 L505,20 L510,80 L515,30 L520,70 L525,40 L530,60 L535,50 L650,50 L655,30 L660,70 L665,20 L670,80 L675,35 L680,65 L685,50 L800,50 L805,25 L810,75 L815,30 L820,70 L825,40 L830,60 L835,50 L1000,50 L1005,30 L1010,70 L1015,20 L1020,80 L1025,35 L1030,65 L1035,50 L1200,50 L1280,50 L1285,30 L1290,70 L1295,25 L1300,75 L1305,35 L1310,65 L1315,50 L1400,50 L1405,25 L1410,75 L1415,20 L1420,80 L1425,30 L1430,70 L1435,50 L1550,50 L1555,35 L1560,65 L1565,25 L1570,75 L1575,30 L1580,70 L1585,50 L1700,50 L1705,20 L1710,80 L1715,30 L1720,70 L1725,40 L1730,60 L1735,50 L1850,50 L1855,30 L1860,70 L1865,20 L1870,80 L1875,35 L1880,65 L1885,50 L2000,50 L2005,25 L2010,75 L2015,30 L2020,70 L2025,40 L2030,60 L2035,50 L2200,50 L2205,30 L2210,70 L2215,20 L2220,80 L2225,35 L2230,65 L2235,50 L2400,50" stroke="white" stroke-width="1.5" fill="none" class="animate-seismic-scroll-slow" />
        </svg>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center text-white px-4 max-w-4xl mx-auto pt-16">
        <div
          class="inline-flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full mb-8 backdrop-blur-md border border-white/10 transition-all duration-700"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <span class="w-2 h-2 rounded-full bg-igp-green-500 animate-pulse" />
          <span class="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Instituto Geofísico del Perú
          </span>
        </div>

        <h1
          class="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 transition-all duration-700 delay-100"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          Operador<br />
          <span class="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">Sísmico</span>
        </h1>

        <p
          class="text-lg md:text-xl text-gray-200 leading-relaxed mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          Plataforma interactiva para la formación de operadores sísmicos. Analiza registros, identifica ondas P y S, localiza epicentros y genera reportes profesionales.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <AppButton to="/reportes" variant="primary" size="lg">
            <AppIcon name="file-text" :size="18" class="mr-2" />
            Generar Reporte Sísmico
          </AppButton>
          <AppButton to="/guia" variant="ghost" size="lg" class="text-white! hover:bg-white/10! border border-white/30 rounded-lg">
            <AppIcon name="book-open" :size="18" class="mr-2" />
            Guía del Operador
          </AppButton>
        </div>

        <!-- Stats row -->
        <div
          class="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto transition-all duration-700 delay-400"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <div class="text-center">
            <p class="text-2xl lg:text-3xl font-extrabold text-white">8</p>
            <p class="text-[11px] text-gray-300 mt-1">Pasos Formativos</p>
          </div>
          <div class="text-center border-x border-white/15">
            <p class="text-2xl lg:text-3xl font-extrabold text-white">13+</p>
            <p class="text-[11px] text-gray-300 mt-1">Eventos Sísmicos</p>
          </div>
          <div class="text-center">
            <p class="text-2xl lg:text-3xl font-extrabold text-white">6</p>
            <p class="text-[11px] text-gray-300 mt-1">Parámetros Clave</p>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <button
        class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer transition-all duration-700 delay-500"
        :class="heroLoaded ? 'opacity-100' : 'opacity-0'"
        @click="scrollToContent"
      >
        <div class="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center animate-bounce backdrop-blur-sm">
          <AppIcon name="chevron-down" :size="20" class="text-white/70" />
        </div>
      </button>
    </section>

    <!-- ====== CINTILLO ====== -->
    <AppCintillo :sticky="cintilloSticky" />

    <!-- ====== CONTENT BELOW HERO ====== -->
    <div id="home-content">
      <!-- ====== WHAT YOU WILL LEARN ====== -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="text-center max-w-2xl mx-auto mb-14" data-reveal>
            <span class="inline-block px-4 py-1.5 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Objetivos de Aprendizaje
            </span>
            <h2 class="text-3xl lg:text-4xl font-extrabold text-igp-blue mb-4">
              ¿Qué aprenderás?
            </h2>
            <p class="text-gray-500 leading-relaxed">
              Esta guía te capacitará en las competencias fundamentales que todo
              operador sísmico necesita para interpretar y reportar eventos sísmicos
              de manera profesional.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(topic, i) in learningTopics"
              :key="i"
              data-reveal
              :data-reveal-delay="i"
              class="reveal-item group relative rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:border-igp-blue-300 transition-all duration-300 cursor-pointer"
              :class="i === learningTopics.length - 1 ? 'bg-igp-blue-950 border-igp-blue-950! text-white' : 'bg-white'"
              @click="openLearningHelp(topic)"
            >
              <!-- Help indicator -->
              <div class="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                :class="i === learningTopics.length - 1 ? 'bg-white/20!' : ''">
                <AppIcon name="help-circle" :size="14" :class="i === learningTopics.length - 1 ? 'text-white' : 'text-gray-400'" />
              </div>

              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md"
                :class="i === learningTopics.length - 1 ? 'bg-white/15' : 'bg-igp-blue-50 group-hover:bg-igp-blue-100'"
              >
                <AppIcon :name="topic.icon" :size="24" :class="i === learningTopics.length - 1 ? 'text-white' : 'text-igp-blue'" />
              </div>
              <h3 class="text-lg font-bold mb-2" :class="i === learningTopics.length - 1 ? 'text-white' : 'text-gray-800'">
                {{ topic.title }}
              </h3>
              <p class="text-sm leading-relaxed" :class="i === learningTopics.length - 1 ? 'text-gray-200' : 'text-gray-600'">
                {{ topic.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ====== PROCESS STEPS ====== -->
      <section class="py-20 bg-white">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="text-center max-w-2xl mx-auto mb-14" data-reveal>
            <span class="inline-block px-4 py-1.5 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Proceso Paso a Paso
            </span>
            <h2 class="text-3xl lg:text-4xl font-extrabold text-igp-blue mb-4">
              Etapas del proceso formativo
            </h2>
            <p class="text-gray-500 leading-relaxed">
              Desde los conceptos fundamentales hasta la elaboración de un reporte
              sísmico completo, recorrerás cada etapa de forma progresiva y guiada.
              <span class="font-medium text-igp-blue">Haz clic en cada paso</span> para más información.
            </p>
          </div>

          <!-- Steps Timeline -->
          <div class="relative">
            <!-- Connection line -->
            <div class="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-linear-to-r from-igp-blue-900 via-igp-blue to-igp-blue-900" data-reveal />

            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-2">
              <div
                v-for="step in processSteps"
                :key="step.number"
                data-reveal
                :data-reveal-delay="step.number - 1"
                class="reveal-item flex flex-col items-center group cursor-pointer"
                @click="openStepHelp(step)"
              >
                <div
                  class="relative z-10 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white shadow-md border-2 border-gray-200 flex items-center justify-center mb-3 group-hover:shadow-xl group-hover:border-igp-blue-300 transition-all duration-300 group-hover:-translate-y-2"
                >
                  <AppIcon :name="step.icon" :size="28" class="text-igp-blue group-hover:text-igp-blue-800 transition-all duration-300 group-hover:-translate-y-0.5" />
                  <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-igp-blue text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {{ step.number }}
                  </span>
                </div>
                <p class="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-igp-blue transition-colors">
                  {{ step.title }}
                </p>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14" data-reveal data-reveal-delay="8">
            <AppButton to="/guia" variant="primary" size="lg">
              <AppIcon name="book-open" :size="18" class="mr-2" />
              Iniciar aprendizaje
            </AppButton>
            <AppButton to="/reportes" variant="primary" size="lg">
              <AppIcon name="file-text" :size="18" class="mr-2" />
              Generar reporte sísmico
            </AppButton>
          </div>
        </div>
      </section>

      <!-- ====== KEY PARAMETERS SECTION ====== -->
      <section class="py-20 bg-igp-blue-950 text-white relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 opacity-5">
          <svg class="absolute top-10 left-10 w-96 h-96" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="white" stroke-width="0.5" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="white" stroke-width="0.5" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="white" stroke-width="0.5" fill="none" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="white" stroke-width="0.5" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="white" stroke-width="0.5" />
          </svg>
          <svg class="absolute bottom-10 right-10 w-72 h-72" viewBox="0 0 200 200">
            <path d="M0,100 Q50,60 100,100 T200,100" stroke="white" stroke-width="1" fill="none" />
            <path d="M0,120 Q50,80 100,120 T200,120" stroke="white" stroke-width="0.7" fill="none" />
          </svg>
        </div>

        <div class="relative max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="text-center max-w-2xl mx-auto mb-14" data-reveal>
            <span class="inline-block px-4 py-1.5 bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-full mb-4 backdrop-blur-sm">
              Reporte Sísmico
            </span>
            <h2 class="text-3xl lg:text-4xl font-extrabold mb-4">
              Parámetros del Reporte Sísmico
            </h2>
            <p class="text-gray-300 leading-relaxed">
              Al completar la guía, serás capaz de determinar y reportar cada uno de
              estos parámetros fundamentales. <span class="font-medium text-white">Haz clic</span> en cada uno para más detalles.
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="(param, idx) in reportParams"
              :key="param.label"
              data-reveal
              :data-reveal-delay="idx"
              class="reveal-item bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-white/5 hover:border-white/20 cursor-pointer group"
              @click="openParamHelp(param)"
            >
              <AppIcon :name="param.icon" :size="28" class="text-white/80 mx-auto mb-3 transition-transform duration-300 group-hover:-translate-y-1" />
              <p class="text-sm font-bold mb-1">{{ param.label }}</p>
              <p class="text-xs text-gray-400">{{ param.value }}</p>
            </div>
          </div>

          <!-- CTA for reports -->
          <div class="text-center mt-12" data-reveal data-reveal-delay="6">
            <AppButton to="/reportes" variant="primary" size="lg" class="bg-white! text-igp-blue-950! hover:bg-gray-100!">
              <AppIcon name="file-text" :size="18" class="mr-2" />
              Crear mi reporte sísmico
            </AppButton>
          </div>
        </div>
      </section>

      <!-- ====== FEATURES SHOWCASE ====== -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Left: Image -->
            <div data-reveal class="reveal-item">
              <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src="/bg-images/monitoreo.png"
                  alt="Estación sismológica de monitoreo"
                  class="w-full h-auto object-cover"
                />
                <div class="absolute inset-0 bg-linear-to-t from-igp-blue/20 to-transparent" />
              </div>
            </div>

            <!-- Right: Content -->
            <div data-reveal data-reveal-delay="2">
              <span class="inline-block px-4 py-1.5 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Módulo de Reportes
              </span>
              <h2 class="text-3xl lg:text-4xl font-extrabold text-igp-blue mb-4">
                Genera Reportes Sísmicos Profesionales
              </h2>
              <p class="text-gray-500 leading-relaxed mb-6">
                Selecciona un evento sísmico real del catálogo del IGP, analiza las ondas registradas por cada estación, marca las fases P y S, y obtén automáticamente un reporte completo con magnitud, coordenadas y localización del epicentro.
              </p>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-6 h-6 rounded-full bg-igp-green-100 flex items-center justify-center shrink-0">
                    <AppIcon name="check" :size="14" class="text-igp-green-700" />
                  </span>
                  Catálogo con eventos sísmicos reales del IGP
                </li>
                <li class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-6 h-6 rounded-full bg-igp-green-100 flex items-center justify-center shrink-0">
                    <AppIcon name="check" :size="14" class="text-igp-green-700" />
                  </span>
                  Gráficas interactivas con marcado de ondas P y S
                </li>
                <li class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-6 h-6 rounded-full bg-igp-green-100 flex items-center justify-center shrink-0">
                    <AppIcon name="check" :size="14" class="text-igp-green-700" />
                  </span>
                  Cálculo automático de magnitud y distancia epicentral
                </li>
                <li class="flex items-center gap-3 text-sm text-gray-600">
                  <span class="w-6 h-6 rounded-full bg-igp-green-100 flex items-center justify-center shrink-0">
                    <AppIcon name="check" :size="14" class="text-igp-green-700" />
                  </span>
                  Nomograma de Richter interactivo
                </li>
              </ul>
              <AppButton to="/reportes" variant="primary" size="lg">
                <AppIcon name="arrow-right" :size="18" class="mr-2" />
                Ir a Reportes Sísmicos
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      <!-- ====== CALL TO ACTION ====== -->
      <section class="py-20 bg-white">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div
            data-reveal
            class="reveal-item bg-linear-to-br from-igp-blue-950 to-igp-blue-900 rounded-3xl p-10 lg:p-16 text-white text-center relative overflow-hidden"
          >
            <!-- Decorative elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/3 rounded-full" />

            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                <AppIcon name="rocket" :size="14" class="text-gray-300" />
                <span class="text-xs font-semibold text-gray-300 uppercase tracking-wider">Comienza ahora</span>
              </div>

              <h2 class="text-3xl lg:text-4xl font-extrabold mb-4">
                ¿Listo para comenzar?
              </h2>
              <p class="text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                Inicia tu formación como operador sísmico y domina el proceso completo de análisis y reporte de eventos sísmicos. Aprende paso a paso o genera directamente tu primer reporte.
              </p>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AppButton to="/guia" variant="ghost" size="xl" class="bg-white! text-igp-blue-950! hover:bg-gray-100! shadow-md">
                  <AppIcon name="book-open" :size="20" class="mr-2" />
                  Comenzar guía ahora
                </AppButton>
                <AppButton to="/reportes" variant="ghost" size="xl" class="text-white! border border-white/30 hover:bg-white/10!">
                  <AppIcon name="file-text" :size="20" class="mr-2" />
                  Generar reporte sísmico
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ====== HELP SIDEBARS ====== -->
    <HelpSidebar
      :open="learningHelpOpen"
      :title="learningHelpData.title"
      :description="learningHelpData.description"
      :items="learningHelpData.items"
      :image="learningHelpData.image"
      link-to="/guia"
      link-label="Ir a la Guía del Operador Sísmico"
      @close="learningHelpOpen = false"
    />
    <HelpSidebar
      :open="stepsHelpOpen"
      :title="stepsHelpData.title"
      :description="stepsHelpData.description"
      :items="stepsHelpData.items"
      :image="stepsHelpData.image"
      link-to="/guia"
      link-label="Ir a la Guía del Operador Sísmico"
      @close="stepsHelpOpen = false"
    />
    <HelpSidebar
      :open="paramsHelpOpen"
      :title="paramsHelpData.title"
      :description="paramsHelpData.description"
      :items="paramsHelpData.items"
      :image="paramsHelpData.image"
      link-to="/reportes"
      link-label="Ir a Reportes Sísmicos"
      @close="paramsHelpOpen = false"
    />
  </DefaultLayout>
</template>

<style scoped>
/* ── Scroll reveal base styles ── */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ── Seismic wave animation ── */
@keyframes seismic-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes seismic-scroll-slow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-seismic-scroll {
  animation: seismic-scroll 12s linear infinite;
}
.animate-seismic-scroll-slow {
  animation: seismic-scroll-slow 18s linear infinite;
}
</style>
