<script setup>
import AppIcon from '@/components/atoms/AppIcon.vue'

defineProps({
  step: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  stepNumber: { type: Number, required: true },
})

defineEmits(['select'])
</script>

<template>
  <button
    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group cursor-pointer"
    :class="{
      'bg-igp-blue text-white shadow-md shadow-igp-blue/20': isActive,
      'bg-igp-green-100 text-igp-green-800 hover:bg-igp-green-200': isCompleted && !isActive,
      'hover:bg-gray-100 text-gray-600': !isActive && !isCompleted,
    }"
    @click="$emit('select', step.id)"
  >
    <!-- Step Number / Check -->
    <div
      class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-200"
      :class="{
        'bg-white/20 text-white': isActive,
        'bg-igp-green-600 text-white': isCompleted && !isActive,
        'bg-gray-200 text-gray-500 group-hover:bg-gray-300': !isActive && !isCompleted,
      }"
    >
      <AppIcon v-if="isCompleted && !isActive" name="check" :size="16" />
      <span v-else>{{ stepNumber }}</span>
    </div>

    <!-- Step Info -->
    <div class="min-w-0 flex-1">
      <p
        class="text-sm font-semibold truncate"
        :class="{
          'text-white': isActive,
          'text-igp-green-800': isCompleted && !isActive,
          'text-gray-700': !isActive && !isCompleted,
        }"
      >
        {{ step.shortTitle }}
      </p>
    </div>

    <!-- Active indicator -->
    <div
      v-if="isActive"
      class="w-1.5 h-8 bg-white/40 rounded-full flex-shrink-0"
    />
  </button>
</template>
