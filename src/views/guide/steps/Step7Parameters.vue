<script setup>
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

const parameters = [
  {
    icon: 'zap',
    label: 'Magnitud',
    value: '4.5 ML',
    description: 'Se calcula a partir de la amplitud máxima registrada y la distancia epicentral, usando la escala de Richter local (ML).',
    formula: 'ML = log₁₀(A) + B(Δ)',
    color: 'bg-red-50 border-red-200 text-red-700',
    iconColor: 'text-red-500',
  },
  {
    icon: 'map-pin',
    label: 'Latitud',
    value: '-12.45°',
    description: 'Coordenada geográfica norte-sur del epicentro, obtenida mediante triangulación de la intersección de círculos de distancia.',
    formula: 'Triangulación ≥ 3 estaciones',
    color: 'bg-igp-sky-blue-50 border-igp-sky-blue-200 text-igp-sky-blue-700',
    iconColor: 'text-igp-sky-blue-600',
  },
  {
    icon: 'compass',
    label: 'Longitud',
    value: '-76.89°',
    description: 'Coordenada geográfica este-oeste del epicentro, determinada junto con la latitud en el proceso de localización.',
    formula: 'Triangulación ≥ 3 estaciones',
    color: 'bg-igp-blue-ocean-50 border-igp-blue-ocean-200 text-igp-blue-ocean-700',
    iconColor: 'text-igp-blue-ocean-600',
  },
  {
    icon: 'layers',
    label: 'Profundidad',
    value: '35 km',
    description: 'Profundidad focal del evento. Se determina mediante el ajuste de los tiempos de viaje observados vs. teóricos.',
    formula: 'Inversión de tiempos de viaje',
    color: 'bg-igp-green-100 border-igp-green-200 text-igp-green-800',
    iconColor: 'text-igp-green-700',
  },
  {
    icon: 'clock',
    label: 'Hora del Evento',
    value: '14:23:15 UTC',
    description: 'Hora origen del sismo. Se calcula restando el tiempo de viaje teórico al tiempo de llegada de la onda P.',
    formula: 'T₀ = Tp_obs - TT_P(Δ, h)',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    iconColor: 'text-purple-500',
  },
  {
    icon: 'target',
    label: 'Epicentro',
    value: '60 km al SO de Lima',
    description: 'Ubicación geográfica de referencia más cercana al punto sobre la superficie directamente encima del foco.',
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
              <p class="text-xl font-bold font-mono">{{ param.value }}</p>
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
          'Localizar epicentro por triangulación (lat, lon)',
          'Estimar profundidad focal por ajuste de tiempos de viaje',
          'Calcular hora origen restando el tiempo de viaje teórico',
          'Determinar magnitud a partir de la amplitud máxima',
          'Identificar la referencia geográfica del epicentro',
        ]" :key="i" class="flex items-center gap-4 p-3 rounded-xl" :class="i % 2 === 0 ? 'bg-gray-50' : ''">
          <div class="w-7 h-7 rounded-lg bg-igp-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {{ i + 1 }}
          </div>
          <p class="text-sm text-gray-700">{{ item }}</p>
        </div>
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
