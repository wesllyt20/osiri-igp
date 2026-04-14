<script setup>
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

const parameters = [
  {
    icon: 'zap',
    label: 'Magnitud (Escala de Richter)',
    value: 'ML',
    description: 'Se calcula con el nomograma de Richter usando la amplitud máxima registrada y la distancia epicentral. La fórmula es ML = log₁₀(A) + 2.76 × log₁₀(D) - 2.48.',
    formula: 'ML = log₁₀(A) + 2.76·log₁₀(D) - 2.48',
    color: 'bg-red-50 border-red-200 text-red-700',
    iconColor: 'text-red-500',
  },
  {
    icon: 'map-pin',
    label: 'Latitud',
    description: 'Coordenada norte-sur del epicentro. En el reporte, se determina haciendo clic en el mapa donde se intersecan los círculos de distancia de al menos 3 estaciones.',
    formula: 'Triangulación ≥ 3 estaciones',
    color: 'bg-igp-sky-blue-50 border-igp-sky-blue-200 text-igp-sky-blue-700',
    iconColor: 'text-igp-sky-blue-600',
  },
  {
    icon: 'compass',
    label: 'Longitud',
    description: 'Coordenada este-oeste del epicentro. Se determina junto con la latitud al identificar visualmente la intersección de los círculos de distancia epicentral en el mapa.',
    formula: 'Triangulación ≥ 3 estaciones',
    color: 'bg-igp-blue-ocean-50 border-igp-blue-ocean-200 text-igp-blue-ocean-700',
    iconColor: 'text-igp-blue-ocean-600',
  },
  {
    icon: 'layers',
    label: 'Profundidad',
    description: 'Profundidad focal del evento. Se determina mediante el ajuste de los tiempos de viaje observados vs. teóricos usando modelos de velocidad de la corteza.',
    formula: 'Inversión de tiempos de viaje',
    color: 'bg-igp-green-100 border-igp-green-200 text-igp-green-800',
    iconColor: 'text-igp-green-700',
  },
  {
    icon: 'clock',
    label: 'Hora del Evento',
    description: 'Hora origen del sismo. Se calcula restando el tiempo de viaje teórico de la onda P al tiempo observado de llegada en la estación más cercana.',
    formula: 'T₀ = Tp_obs - TT_P(Δ, h)',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    iconColor: 'text-purple-500',
  },
  {
    icon: 'target',
    label: 'Epicentro',
    description: 'Punto sobre la superficie directamente encima del foco sísmico. Se describe con una referencia geográfica cercana (ej: "40 km al SO de Piura").',
    formula: 'Referencia geográfica cercana',
    color: 'bg-igp-orange-50 border-igp-orange-200 text-igp-orange-700',
    iconColor: 'text-igp-orange-500',
  },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Intro -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-3">Determinación de Parámetros</h3>
      <p class="text-gray-600 leading-relaxed">
        Con los datos recopilados en los pasos anteriores, el operador sísmico puede determinar
        los parámetros fundamentales del evento. Cada parámetro se obtiene mediante procedimientos
        específicos que combinan las lecturas de las estaciones con modelos teóricos.
      </p>
    </div>

    <!-- Parameter cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="param in parameters"
        :key="param.label"
        :class="['rounded-2xl border p-5 shadow-sm', param.color]"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <AppIcon :name="param.icon" :size="22" :class="param.iconColor" />
            <div>
              <p class="font-bold text-igp-blue text-base">{{ param.label }}</p>
            </div>
          </div>
        </div>
        <p class="text-sm opacity-80 leading-relaxed mb-3">{{ param.description }}</p>
        <div class="bg-white/50 rounded-lg px-3 py-1.5 inline-block">
          <p class="text-xs font-mono font-semibold opacity-70">{{ param.formula }}</p>
        </div>
      </div>
    </div>

    <!-- Process summary -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-4 flex items-center gap-2">
        <AppIcon name="trending-up" :size="20" class="text-igp-sky-blue-600" />
        Flujo de Determinación
      </h3>
      <div class="flex flex-col gap-3">
        <div v-for="(item, i) in [
          'Leer tiempos de llegada P y S en cada estación',
          'Calcular diferencias S-P y distancias epicentrales',
          'Graficar S-P vs Distancia para verificar consistencia',
          'Localizar epicentro por triangulación en el mapa (lat, lon)',
          'Determinar magnitud con el nomograma de Richter (ML = log₁₀(A) + 2.76·log₁₀(D) - 2.48)',
          'Estimar profundidad focal por ajuste de tiempos de viaje',
          'Calcular hora origen restando el tiempo de viaje teórico',
          'Generar el reporte sísmico con todos los parámetros',
        ]" :key="i" class="flex items-center gap-4 p-3 rounded-xl" :class="i % 2 === 0 ? 'bg-gray-50' : ''">
          <div class="w-7 h-7 rounded-lg bg-igp-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {{ i + 1 }}
          </div>
          <p class="text-sm text-gray-700">{{ item }}</p>
        </div>
      </div>
    </div>

    <!-- Richter Nomogram explanation -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-4 flex items-center gap-2">
        <AppIcon name="zap" :size="20" class="text-red-500" />
        Nomograma de Richter
      </h3>
      <p class="text-gray-600 leading-relaxed mb-4">
        El nomograma de Richter es una herramienta gráfica que permite estimar visualmente la magnitud local (ML)
        de un sismo. Relaciona tres escalas: distancia epicentral, amplitud máxima registrada y magnitud.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-xs font-medium text-gray-500 mb-2">Eje X</p>
          <p class="font-bold text-igp-blue">Distancia (km)</p>
          <p class="text-xs text-gray-400">Escala logarítmica</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-4 text-center">
          <p class="text-xs font-medium text-gray-500 mb-2">Eje Y</p>
          <p class="font-bold text-igp-blue">Amplitud (mm)</p>
          <p class="text-xs text-gray-400">Escala logarítmica</p>
        </div>
        <div class="bg-red-50 rounded-xl p-4 text-center">
          <p class="text-xs font-medium text-red-400 mb-2">Resultado</p>
          <p class="font-bold text-red-600">Magnitud ML</p>
          <p class="text-xs text-red-400">Líneas de contorno</p>
        </div>
      </div>
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs font-medium text-gray-500 mb-2">Fórmula de Richter:</p>
        <p class="font-mono text-center text-red-600 font-bold text-lg">
          ML = log₁₀(A) + 2.76 × log₁₀(D) - 2.48
        </p>
        <p class="text-xs text-gray-500 text-center mt-2">Donde A = Amplitud máxima en mm, D = Distancia epicentral en km</p>
      </div>
    </div>

    <AlertBox icon="alert-circle" variant="warning">
      <p class="font-semibold mb-1">Precisión de los datos</p>
      <p>
        Los valores mostrados son de ejemplo. En un escenario real, la precisión depende de la
        calidad de las lecturas, el número de estaciones y la calidad del modelo de velocidades
        utilizado. Un mínimo de 3 estaciones es necesario, pero se recomienda usar cuantas más
        sea posible.
      </p>
    </AlertBox>
  </div>
</template>
