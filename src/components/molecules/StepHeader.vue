<script setup>
defineProps({
  title: { type: String, required: true },
  stepNumber: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 8 },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-2">
      <span
        class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-igp-dark-blue-500 text-white text-sm font-bold shadow-md"
      >
        {{ stepNumber }}
      </span>
      <div>
        <p class="text-xs font-medium text-igp-sky-blue-600 uppercase tracking-wider">
          Paso {{ stepNumber }} de {{ totalSteps }}
        </p>
        <h1 class="text-2xl lg:text-3xl font-bold text-igp-dark-blue-500">
          {{ title }}
        </h1>
      </div>
    </div>
    <p v-if="description" class="text-gray-500 mt-2 ml-13 text-sm leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
