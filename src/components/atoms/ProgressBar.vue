<script setup>
defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  height: { type: String, default: 'h-2' },
  showLabel: { type: Boolean, default: false },
  color: { type: String, default: 'bg-igp-sky-blue-600' },
})
</script>

<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex items-center justify-between mb-1.5">
      <span class="text-xs font-medium text-gray-500">Progreso</span>
      <span class="text-xs font-bold text-igp-blue">{{ Math.round(value) }}%</span>
    </div>
    <div :class="['w-full bg-gray-200 rounded-full overflow-hidden', height]">
      <div
        :class="['rounded-full transition-all duration-500 ease-out', height, color]"
        :style="{ width: `${Math.min((value / max) * 100, 100)}%` }"
      />
    </div>
  </div>
</template>
