<script setup>
import { ref, computed } from "vue";
import AlertBox from "@/components/molecules/AlertBox.vue";
import AppIcon from "@/components/atoms/AppIcon.vue";

// Example calculation data
const tP = ref(2.0);
const tS = ref(3.8);
const vpVsRatio = 1.73; // Typical Vp/Vs ratio

const deltaSP = computed(() => (tS.value - tP.value).toFixed(2));

// Simplified Wadati method: D ≈ (Ts - Tp) × Vp × Vs / (Vp - Vs)
// With Vp = 6.0 km/s and Vs = 3.46 km/s (ratio 1.73)
const vp = 6.0;
const vs = vp / vpVsRatio;
const distanceEpicentral = computed(() => {
  const sp = tS.value - tP.value;
  return ((sp * vp * vs) / (vp - vs)).toFixed(1);
});

const formulas = [
  {
    title: "Diferencia S - P",
    formula: "ΔT = Ts - Tp",
    description:
      "Diferencia de tiempo entre la llegada de la onda S y la onda P.",
    result: `ΔT = ${tS.value} - ${tP.value} = ${deltaSP.value} s`,
    color: "igp-sky-blue",
  },
  {
    title: "Distancia Epicentral (simplificada)",
    formula: "D ≈ ΔT × (Vp × Vs) / (Vp - Vs)",
    description:
      "Estimación de la distancia al epicentro usando las velocidades promedio de ondas P y S.",
    result: `D ≈ ${deltaSP.value} × (${vp} × ${vs.toFixed(
      2
    )}) / (${vp} - ${vs.toFixed(2)}) ≈ ${distanceEpicentral.value} km`,
    color: "igp-orange",
  },
];

const exerciseSteps = [
  {
    label: "Leer el tiempo de llegada de la Onda P",
    value: `Tp = ${tP.value} s`,
  },
  {
    label: "Leer el tiempo de llegada de la Onda S",
    value: `Ts = ${tS.value} s`,
  },
  {
    label: "Calcular la diferencia S - P",
    value: `ΔT = Ts - Tp = ${deltaSP.value} s`,
  },
  {
    label: "Aplicar fórmula de distancia epicentral",
    value: `D ≈ ${distanceEpicentral.value} km`,
  },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Introduction -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-3">
        Cálculos Fundamentales
      </h3>
      <p class="text-gray-600 leading-relaxed">
        Una vez identificadas las llegadas de las ondas P y S, el siguiente paso
        es realizar cálculos que nos permitan obtener la distancia epicentral.
        Estos cálculos son la base para la localización del evento sísmico.
      </p>
    </div>

    <!-- Formulas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="f in formulas"
        :key="f.title"
        class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
      >
        <h4 class="font-bold text-igp-blue mb-2 text-base">
          {{ f.title }}
        </h4>
        <p class="text-sm text-gray-500 mb-4">{{ f.description }}</p>

        <!-- Formula display -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4 text-center">
          <p class="text-lg font-mono font-semibold text-igp-blue">
            {{ f.formula }}
          </p>
        </div>

        <!-- Result -->
        <div
          class="rounded-xl p-3 text-sm font-medium text-center"
          :class="
            f.color === 'igp-sky-blue'
              ? 'bg-igp-sky-blue-50 text-igp-sky-blue-700'
              : 'bg-igp-orange-50 text-igp-orange-700'
          "
        >
          {{ f.result }}
        </div>
      </div>
    </div>

    <!-- Interactive exercise -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3
        class="text-lg font-bold text-igp-blue mb-2 flex items-center gap-2"
      >
        <AppIcon name="calculator" :size="20" class="text-igp-sky-blue-600" />
        Ejercicio guiado
      </h3>
      <p class="text-sm text-gray-500 mb-6">
        Sigue estos pasos para calcular la distancia epicentral:
      </p>

      <div class="space-y-3">
        <div
          v-for="(step, index) in exerciseSteps"
          :key="index"
          class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
        >
          <div
            class="w-8 h-8 rounded-lg bg-igp-blue text-white text-sm font-bold flex items-center justify-center shrink-0"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-700">{{ step.label }}</p>
          </div>
          <div
            class="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-mono font-semibold text-igp-blue"
          >
            {{ step.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input experimentation -->
    <div class="bg-igp-blue rounded-2xl p-6 text-white">
      <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <AppIcon name="zap" :size="20" class="text-igp-sky-blue-400" />
        Experimenta con los valores
      </h3>
      <p class="text-sm text-gray-300 mb-6">
        Modifica los tiempos de llegada para ver cómo cambian los resultados:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="text-xs font-medium text-gray-300 mb-1 block"
            >Tiempo Onda P (Tp) en segundos</label
          >
          <input
            v-model.number="tP"
            type="number"
            step="0.1"
            min="0"
            class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-igp-sky-blue-400 text-sm"
          />
        </div>
        <div>
          <label class="text-xs font-medium text-gray-300 mb-1 block"
            >Tiempo Onda S (Ts) en segundos</label
          >
          <input
            v-model.number="tS"
            type="number"
            step="0.1"
            min="0"
            class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-igp-sky-blue-400 text-sm"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white/10 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Diferencia S - P</p>
          <p class="text-2xl font-bold text-igp-sky-blue-400">
            {{ deltaSP }} s
          </p>
        </div>
        <div class="bg-white/10 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Distancia Epicentral</p>
          <p class="text-2xl font-bold text-igp-sky-blue-400">
            {{ distanceEpicentral }} km
          </p>
        </div>
      </div>
    </div>

    <AlertBox icon="info" variant="success">
      <p class="font-semibold mb-1">Nota importante</p>
      <p>
        Estas fórmulas son simplificaciones educativas. En la práctica
        profesional, se utilizan tablas de viaje (travel-time tables) y modelos
        de velocidad más complejos para obtener distancias epicentrales
        precisas.
      </p>
    </AlertBox>
  </div>
</template>
