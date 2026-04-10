<script setup>
import InfoCard from '@/components/molecules/InfoCard.vue'
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Block -->
    <div class="bg-linear-to-br from-igp-blue to-igp-blue-ocean-800 rounded-2xl p-8 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-48 h-48 bg-igp-sky-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div class="relative">
        <h2 class="text-2xl font-bold mb-3">Bienvenido a la Guía del Operador Sísmico</h2>
        <p class="text-gray-200 leading-relaxed max-w-2xl">
          Esta plataforma te guiará paso a paso a través del proceso completo de análisis sísmico,
          desde la lectura de ondas hasta la elaboración de un reporte sísmico profesional.
          Al finalizar, tendrás las competencias necesarias para operar como analista sísmico.
        </p>
      </div>
    </div>

    <!-- Key Concepts -->
    <div>
      <h3 class="text-xl font-bold text-igp-blue mb-4">Conceptos Fundamentales</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InfoCard
          icon="zap"
          title="¿Qué es un evento sísmico?"
          description="Un sismo es una vibración de la Tierra producida por la liberación súbita de energía acumulada en las fallas geológicas. Los sismos pueden variar en magnitud desde imperceptibles hasta devastadores."
        />
        <InfoCard
          icon="activity"
          title="¿Qué es una señal sísmica?"
          description="Es el registro de las vibraciones del suelo captadas por un sismómetro. Estas señales contienen información sobre las ondas (P y S), amplitud, frecuencia y tiempo, fundamentales para el análisis."
        />
        <InfoCard
          icon="monitor"
          title="¿Qué es una estación sísmica?"
          description="Es una instalación equipada con sismómetros y sistemas de registro que detectan y almacenan las vibraciones del terreno de forma continua, transmitiendo datos a centros de monitoreo en tiempo real."
        />
        <InfoCard
          icon="layers"
          title="¿Qué información obtenemos?"
          description="Del registro sísmico podemos obtener: tiempos de llegada de ondas, amplitudes, frecuencias, duración del evento y, con análisis avanzados, la magnitud, localización y profundidad del sismo."
        />
      </div>
    </div>

    <!-- What you'll learn -->
    <AlertBox icon="info" variant="info">
      <p class="font-semibold mb-1">¿Qué aprenderás en esta guía?</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Reconocer y leer ondas sísmicas en sismogramas</li>
        <li>Diferenciar entre ondas primarias (P) y secundarias (S)</li>
        <li>Utilizar herramientas de visualización interactiva</li>
        <li>Realizar cálculos para determinar distancia epicentral</li>
        <li>Aplicar conceptos vectoriales en la localización sísmica</li>
        <li>Determinar los parámetros fundamentales del evento</li>
        <li>Elaborar un reporte sísmico completo y profesional</li>
      </ul>
    </AlertBox>

    <!-- Overview of seismic monitoring process -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-4 flex items-center gap-2">
        <AppIcon name="trending-up" :size="20" class="text-igp-sky-blue-600" />
        El Proceso de Monitoreo Sísmico
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-xl">
          <div class="w-12 h-12 bg-igp-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AppIcon name="monitor" :size="24" class="text-igp-blue" />
          </div>
          <p class="text-sm font-semibold text-gray-700">1. Detección</p>
          <p class="text-xs text-gray-500 mt-1">Las estaciones detectan las vibraciones del terreno</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-xl">
          <div class="w-12 h-12 bg-igp-sky-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AppIcon name="bar-chart-2" :size="24" class="text-igp-sky-blue-600" />
          </div>
          <p class="text-sm font-semibold text-gray-700">2. Análisis</p>
          <p class="text-xs text-gray-500 mt-1">El operador analiza las señales y calcula parámetros</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-xl">
          <div class="w-12 h-12 bg-igp-green-700/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AppIcon name="file-text" :size="24" class="text-igp-green-700" />
          </div>
          <p class="text-sm font-semibold text-gray-700">3. Reporte</p>
          <p class="text-xs text-gray-500 mt-1">Se genera y difunde el reporte sísmico oficial</p>
        </div>
      </div>
    </div>
  </div>
</template>
