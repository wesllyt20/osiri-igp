<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  rounded: { type: Boolean, default: false },
  shadow: { type: Boolean, default: false },
  aspectRatio: { type: String, default: '' },
})
</script>

<template>
  <div class="overflow-hidden" :class="[rounded ? 'rounded-2xl' : '', shadow ? 'shadow-lg' : '']">
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      :style="aspectRatio ? `aspect-ratio: ${aspectRatio}` : ''"
      loading="lazy"
    />
  </div>
</template>
