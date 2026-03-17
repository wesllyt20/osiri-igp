<script setup>
import InfoCard from '@/components/molecules/InfoCard.vue'
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
</script>

<template>
  <div class="space-y-8">
    <!-- Intro -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-3">¿Qué son las ondas sísmicas?</h3>
      <p class="text-gray-600 leading-relaxed">
        Las ondas sísmicas son perturbaciones que se propagan a través de la Tierra, generadas por la
        liberación de energía durante un terremoto. Se dividen en dos tipos principales que viajan a
        distintas velocidades y con diferentes características: las <strong>ondas P</strong> (primarias)
        y las <strong>ondas S</strong> (secundarias).
      </p>
    </div>

    <!-- P and S waves comparison -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Onda P -->
      <div class="bg-white rounded-2xl border-2 border-igp-sky-blue-200 p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-igp-sky-blue-100 rounded-xl flex items-center justify-center">
            <span class="text-lg font-bold text-igp-sky-blue-600">P</span>
          </div>
          <div>
            <h4 class="font-bold text-igp-dark-blue-500">Onda Primaria (P)</h4>
            <p class="text-xs text-gray-400">Onda compresional / longitudinal</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-sky-blue-600 flex-shrink-0 mt-0.5" />
            <span><strong>Velocidad:</strong> 5-8 km/s en la corteza terrestre</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-sky-blue-600 flex-shrink-0 mt-0.5" />
            <span><strong>Movimiento:</strong> Compresión y dilatación en la dirección de propagación</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-sky-blue-600 flex-shrink-0 mt-0.5" />
            <span><strong>Medio:</strong> Se propaga en sólidos, líquidos y gases</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-sky-blue-600 flex-shrink-0 mt-0.5" />
            <span><strong>Llegada:</strong> Es la primera onda en ser registrada</span>
          </li>
        </ul>
        <!-- Visual representation -->
        <div class="mt-4 p-3 bg-igp-sky-blue-50 rounded-xl">
          <p class="text-xs text-igp-sky-blue-700 font-medium mb-2">Representación del movimiento:</p>
          <div class="flex items-center justify-center gap-1 py-2">
            <div v-for="i in 20" :key="'p-'+i" class="w-2 h-2 rounded-full bg-igp-sky-blue-400"
              :style="{ transform: `translateX(${Math.sin(i * 0.8) * 6}px)` }" />
          </div>
          <p class="text-[10px] text-center text-igp-sky-blue-500 mt-1">→ Dirección de propagación →</p>
        </div>
      </div>

      <!-- Onda S -->
      <div class="bg-white rounded-2xl border-2 border-igp-orange-200 p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-igp-orange-50 rounded-xl flex items-center justify-center">
            <span class="text-lg font-bold text-igp-orange-500">S</span>
          </div>
          <div>
            <h4 class="font-bold text-igp-dark-blue-500">Onda Secundaria (S)</h4>
            <p class="text-xs text-gray-400">Onda de cizalla / transversal</p>
          </div>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-orange-500 flex-shrink-0 mt-0.5" />
            <span><strong>Velocidad:</strong> 3-5 km/s en la corteza terrestre</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-orange-500 flex-shrink-0 mt-0.5" />
            <span><strong>Movimiento:</strong> Perpendicular a la dirección de propagación</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-orange-500 flex-shrink-0 mt-0.5" />
            <span><strong>Medio:</strong> Solo se propaga en medios sólidos</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="check" :size="16" class="text-igp-orange-500 flex-shrink-0 mt-0.5" />
            <span><strong>Llegada:</strong> Llega después de la onda P</span>
          </li>
        </ul>
        <!-- Visual representation -->
        <div class="mt-4 p-3 bg-igp-orange-50 rounded-xl">
          <p class="text-xs text-igp-orange-600 font-medium mb-2">Representación del movimiento:</p>
          <div class="flex items-center justify-center gap-1 py-2">
            <div v-for="i in 20" :key="'s-'+i" class="w-2 h-2 rounded-full bg-igp-orange-400"
              :style="{ transform: `translateY(${Math.sin(i * 0.8) * 8}px)` }" />
          </div>
          <p class="text-[10px] text-center text-igp-orange-500 mt-1">→ Dirección de propagación →</p>
        </div>
      </div>
    </div>

    <!-- Key difference -->
    <AlertBox icon="zap" variant="tip">
      <p class="font-semibold mb-1">Dato clave</p>
      <p>
        La diferencia de tiempo entre la llegada de la onda P y la onda S
        (<strong>Ts - Tp</strong>) es fundamental para calcular la distancia
        epicentral. A mayor diferencia de tiempo, mayor es la distancia al epicentro.
      </p>
    </AlertBox>

    <!-- Importance -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-dark-blue-500 mb-3 flex items-center gap-2">
        <AppIcon name="target" :size="20" class="text-igp-sky-blue-600" />
        Importancia en la Localización
      </h3>
      <p class="text-gray-600 leading-relaxed mb-4">
        Las ondas P y S son esenciales para la localización del epicentro porque:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <AppIcon name="clock" :size="18" class="text-igp-dark-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-gray-600">El tiempo S-P permite estimar la <strong>distancia epicentral</strong></p>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <AppIcon name="compass" :size="18" class="text-igp-dark-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-gray-600">Con 3+ estaciones se puede <strong>triangular el epicentro</strong></p>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <AppIcon name="layers" :size="18" class="text-igp-dark-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-gray-600">La relación Vp/Vs ayuda a estimar la <strong>profundidad focal</strong></p>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <AppIcon name="bar-chart-2" :size="18" class="text-igp-dark-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-gray-600">La amplitud de las ondas es clave para calcular la <strong>magnitud</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>
