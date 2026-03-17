<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import InfoCard from '@/components/molecules/InfoCard.vue'

const heroImages = [
  { src: '/images/ultimosismo.png', alt: 'Monitoreo sísmico en tiempo real' },
  { src: '/images/perusismico.png', alt: 'Mapa sísmico del Perú' },
  { src: '/images/zonificaperu.png', alt: 'Zonificación sísmica' },
]

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
    <!-- ====== HERO SECTION ====== -->
    <section class="relative bg-igp-dark-blue-500 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div
          class="absolute inset-0"
          style="
            background-image: repeating-linear-gradient(
              90deg,
              transparent,
              transparent 60px,
              rgba(255, 255, 255, 0.03) 60px,
              rgba(255, 255, 255, 0.03) 61px
            );
          "
        />
        <!-- Seismic wave decoration -->
        <svg class="absolute bottom-0 left-0 w-full h-32 opacity-20" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path
            d="M0,60 Q50,10 100,60 T200,60 T300,60 T400,60 T500,60 T600,60 T700,60 T800,60 T900,60 T1000,60 T1100,60 T1200,60"
            stroke="white"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M0,80 Q30,30 60,80 T120,80 T180,80 T240,80 T300,80 T360,80 T420,80 T480,80 T540,80 T600,80 T660,80 T720,80 T780,80 T840,80 T900,80 T960,80 T1020,80 T1080,80 T1140,80 T1200,80"
            stroke="white"
            stroke-width="1.5"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>

      <div class="relative max-w-screen-2xl mx-auto px-4 lg:px-6 py-20 lg:py-28">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Text Content -->
          <div class="text-white">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <AppIcon name="zap" :size="14" class="text-igp-sky-blue-400" />
              <span class="text-xs font-semibold text-igp-sky-blue-300 uppercase tracking-wider">
                Plataforma de Formación Sísmica
              </span>
            </div>

            <h1 class="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
              Guía para convertirte en
              <span class="text-igp-sky-blue-400">Operador Sísmico</span>
            </h1>

            <p class="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              Aprende paso a paso a interpretar ondas sísmicas, analizar señales
              y elaborar reportes completos de eventos sísmicos. Una experiencia
              formativa profesional e interactiva.
            </p>

            <div class="flex flex-wrap gap-4">
              <AppButton to="/guia" variant="accent" size="lg">
                <AppIcon name="play" :size="18" class="mr-2" />
                Comenzar guía
              </AppButton>
              <AppButton variant="secondary" size="lg" class="!text-white !border-white/30 hover:!bg-white/10">
                <AppIcon name="info" :size="18" class="mr-2" />
                Saber más
              </AppButton>
            </div>

            <!-- Stats -->
            <div class="flex gap-8 mt-10 pt-8 border-t border-white/10">
              <div>
                <p class="text-3xl font-extrabold text-igp-sky-blue-400">8</p>
                <p class="text-xs text-gray-400 mt-1">Pasos formativos</p>
              </div>
              <div>
                <p class="text-3xl font-extrabold text-igp-sky-blue-400">6</p>
                <p class="text-xs text-gray-400 mt-1">Parámetros sísmicos</p>
              </div>
              <div>
                <p class="text-3xl font-extrabold text-igp-sky-blue-400">∞</p>
                <p class="text-xs text-gray-400 mt-1">Práctica interactiva</p>
              </div>
            </div>
          </div>

          <!-- Hero Images Grid -->
          <div class="hidden lg:grid grid-cols-2 gap-4">
            <!-- Main large image -->
            <div class="col-span-2 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                :src="heroImages[0].src"
                :alt="heroImages[0].alt"
                class="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <!-- Two smaller images -->
            <div class="rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <img
                :src="heroImages[1].src"
                :alt="heroImages[1].alt"
                class="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <img
                :src="heroImages[2].src"
                :alt="heroImages[2].alt"
                class="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== WHAT YOU WILL LEARN ====== -->
    <section class="py-20 bg-white">
      <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
        <div class="text-center max-w-2xl mx-auto mb-14">
          <span class="inline-block px-4 py-1.5 bg-igp-sky-blue-50 text-igp-sky-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Objetivos de Aprendizaje
          </span>
          <h2 class="text-3xl lg:text-4xl font-extrabold text-igp-dark-blue-500 mb-4">
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
          <span class="inline-block px-4 py-1.5 bg-igp-dark-blue-50 text-igp-dark-blue-500 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Proceso Paso a Paso
          </span>
          <h2 class="text-3xl lg:text-4xl font-extrabold text-igp-dark-blue-500 mb-4">
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
          <div class="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-igp-dark-blue-500 via-igp-sky-blue-600 to-igp-green-700" />

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-2">
            <div
              v-for="step in processSteps"
              :key="step.number"
              class="flex flex-col items-center group"
            >
              <div
                class="relative z-10 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white shadow-md border-2 border-gray-100 flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:border-igp-sky-blue-300 transition-all duration-300 group-hover:-translate-y-1 cursor-pointer"
              >
                <AppIcon :name="step.icon" :size="28" class="text-igp-dark-blue-500 group-hover:text-igp-sky-blue-600 transition-colors" />
                <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-igp-dark-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {{ step.number }}
                </span>
              </div>
              <p class="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-igp-dark-blue-500 transition-colors">
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
    <section class="py-20 bg-igp-dark-blue-500 text-white relative overflow-hidden">
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
          class="bg-gradient-to-br from-igp-dark-blue-500 to-igp-blue-ocean-900 rounded-3xl p-10 lg:p-16 text-white text-center relative overflow-hidden"
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
  </DefaultLayout>
</template>
