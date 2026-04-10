<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppCintillo from '@/components/organisms/AppCintillo.vue'
import InfoCard from '@/components/molecules/InfoCard.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const cintilloSticky = ref(false)
const heroRef = ref(null)

function handleScroll() {
  if (heroRef.value) {
    const heroBottom = heroRef.value.getBoundingClientRect().bottom
    cintilloSticky.value = heroBottom <= 64 // 64px = header height
  }
}

function scrollToContent() {
  const el = document.getElementById('home-content')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const learningTopics = [
  {
    icon: 'activity',
    title: 'Lectura de Ondas Sísmicas',
    description:
      'Aprende a reconocer y diferenciar los distintos tipos de ondas sísmicas registradas en los sismogramas.',
  },
  {
    icon: 'crosshair',
    title: 'Identificación de Ondas P y S',
    description:
      'Identifica con precisión las llegadas de las ondas primarias y secundarias en registros sísmicos.',
  },
  {
    icon: 'bar-chart-2',
    title: 'Visualización Interactiva',
    description:
      'Utiliza gráficas interactivas para analizar señales, hacer zoom y explorar datos sísmicos.',
  },
  {
    icon: 'calculator',
    title: 'Cálculos Sismológicos',
    description:
      'Realiza cálculos de diferencia de tiempo, distancia epicentral y otros parámetros fundamentales.',
  },
  {
    icon: 'globe',
    title: 'Localización del Epicentro',
    description:
      'Determina la ubicación geográfica del epicentro utilizando datos de múltiples estaciones.',
  },
  {
    icon: 'file-text',
    title: 'Reporte Sísmico Completo',
    description:
      'Genera un reporte sísmico profesional con magnitud, coordenadas, profundidad y hora del evento.',
  },
]

const processSteps = [
  { number: 1, title: 'Introducción', icon: 'book-open' },
  { number: 2, title: 'Lectura de Ondas', icon: 'activity' },
  { number: 3, title: 'Visualización', icon: 'bar-chart-2' },
  { number: 4, title: 'Identificación P/S', icon: 'crosshair' },
  { number: 5, title: 'Cálculos Básicos', icon: 'calculator' },
  { number: 6, title: 'Cálculos Vectoriales', icon: 'git-branch' },
  { number: 7, title: 'Parámetros', icon: 'globe' },
  { number: 8, title: 'Reporte Final', icon: 'file-text' },
]
</script>

<template>
  <DefaultLayout>
    <!-- ====== HERO SECTION (full viewport, background image) ====== -->
    <section ref="heroRef" class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background image -->
      <div class="absolute inset-0">
        <img
          src="/bg-images/background_igp.jpg"
          alt="Fondo sismología"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-igp-blue/70 via-igp-blue/50 to-igp-blue/80" />
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center text-white px-4 max-w-3xl mx-auto pt-16">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
          <span class="text-xs font-semibold text-igp-sky-blue-300 uppercase tracking-wider">
            Plataforma de Reportes Sísmicos
          </span>
        </div>

        <h1 class="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
          Reportes<br />
          <span class="text-igp-sky-blue-400">Sísmicos</span>
        </h1>

        <p class="text-lg text-gray-200 leading-relaxed mb-10 max-w-xl mx-auto">
          Analiza registros sísmicos, visualiza formas de onda e identifica
          parámetros clave para generar reportes profesionales de eventos sísmicos.
        </p>

        <AppButton to="/reportes" variant="accent" size="lg">
          Crea tu reporte
          <AppIcon name="arrow-right" :size="18" class="ml-2" />
        </AppButton>
      </div>

      <!-- Scroll indicator -->
      <button
        class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        @click="scrollToContent"
      >
        <div class="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center animate-bounce">
          <AppIcon name="chevron-down" :size="20" class="text-white/60" />
        </div>
      </button>
    </section>

    <!-- ====== CINTILLO ====== -->
    <AppCintillo :sticky="cintilloSticky" />

    <!-- ====== CONTENT BELOW HERO ====== -->
    <div id="home-content">
      <!-- ====== WHAT YOU WILL LEARN ====== -->
      <section class="py-20 bg-white">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <span class="inline-block px-4 py-1.5 bg-igp-sky-blue-50 text-igp-sky-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
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
            <InfoCard
              v-for="(topic, i) in learningTopics"
              :key="i"
              :icon="topic.icon"
              :title="topic.title"
              :description="topic.description"
              :variant="i === learningTopics.length - 1 ? 'dark' : 'default'"
            />
          </div>
        </div>
      </section>

      <!-- ====== PROCESS STEPS ====== -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <span class="inline-block px-4 py-1.5 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Proceso Paso a Paso
            </span>
            <h2 class="text-3xl lg:text-4xl font-extrabold text-igp-blue mb-4">
              Etapas del proceso formativo
            </h2>
            <p class="text-gray-500 leading-relaxed">
              Desde los conceptos fundamentales hasta la elaboración de un reporte
              sísmico completo, recorrerás cada etapa de forma progresiva y guiada.
            </p>
          </div>

          <!-- Steps Timeline -->
          <div class="relative">
            <!-- Connection line -->
            <div class="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-igp-blue via-igp-sky-blue-600 to-igp-green-700" />

            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-2">
              <div
                v-for="step in processSteps"
                :key="step.number"
                class="flex flex-col items-center group"
              >
                <div
                  class="relative z-10 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white shadow-md border-2 border-gray-100 flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:border-igp-sky-blue-300 transition-all duration-300 group-hover:-translate-y-1 cursor-pointer"
                >
                  <AppIcon :name="step.icon" :size="28" class="text-igp-blue group-hover:text-igp-sky-blue-600 transition-colors" />
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
          <div class="text-center mt-14">
            <AppButton to="/guia" variant="primary" size="lg">
              <AppIcon name="arrow-right" :size="18" class="mr-2" />
              Iniciar aprendizaje
            </AppButton>
          </div>
        </div>
      </section>

      <!-- ====== KEY PARAMETERS SECTION ====== -->
      <section class="py-20 bg-igp-blue text-white relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 opacity-5">
          <svg class="absolute top-10 left-10 w-96 h-96" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="white" stroke-width="0.5" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="white" stroke-width="0.5" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="white" stroke-width="0.5" fill="none" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="white" stroke-width="0.5" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="white" stroke-width="0.5" />
          </svg>
        </div>

        <div class="relative max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <h2 class="text-3xl lg:text-4xl font-extrabold mb-4">
              Parámetros del Reporte Sísmico
            </h2>
            <p class="text-gray-300 leading-relaxed">
              Al completar la guía, serás capaz de determinar y reportar cada uno de
              estos parámetros fundamentales de un evento sísmico.
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="param in [
                { icon: 'zap', label: 'Magnitud', value: 'ML / Mw' },
                { icon: 'map-pin', label: 'Latitud', value: '° Sur' },
                { icon: 'compass', label: 'Longitud', value: '° Oeste' },
                { icon: 'layers', label: 'Profundidad', value: 'km' },
                { icon: 'clock', label: 'Hora UTC', value: 'hh:mm:ss' },
                { icon: 'target', label: 'Epicentro', value: 'Ubicación' },
              ]"
              :key="param.label"
              class="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center hover:bg-white/15 transition-all duration-300 border border-white/5"
            >
              <AppIcon :name="param.icon" :size="28" class="text-igp-sky-blue-400 mx-auto mb-3" />
              <p class="text-sm font-bold mb-1">{{ param.label }}</p>
              <p class="text-xs text-gray-400">{{ param.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ====== CALL TO ACTION ====== -->
      <section class="py-20 bg-white">
        <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div
            class="bg-gradient-to-br from-igp-blue to-igp-blue-950 rounded-3xl p-10 lg:p-16 text-white text-center relative overflow-hidden"
          >
            <!-- Decorative circles -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-igp-sky-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-igp-sky-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div class="relative z-10">
              <h2 class="text-3xl lg:text-4xl font-extrabold mb-4">
                ¿Listo para comenzar?
              </h2>
              <p class="text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
                Inicia tu formación como operador sísmico y domina el proceso
                completo de análisis y reporte de eventos sísmicos.
              </p>
              <AppButton to="/guia" variant="accent" size="xl">
                <AppIcon name="arrow-right" :size="20" class="mr-2" />
                Comenzar guía ahora
              </AppButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DefaultLayout>
</template>
