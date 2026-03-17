<script setup>
import AppIcon from '@/components/atoms/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'info' },
  variant: { type: String, default: 'default' },
})

const variantStyles = {
  default: 'bg-white border border-gray-100',
  highlighted: 'bg-igp-blue-ocean-50 border border-igp-blue-ocean-200',
  dark: 'bg-igp-dark-blue-500 text-white',
}
</script>

<template>
  <div
    :class="[
      'rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group',
      variantStyles[variant] || variantStyles.default,
    ]"
  >
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
      :class="
        variant === 'dark'
          ? 'bg-white/15'
          : 'bg-igp-dark-blue-500/10'
      "
    >
      <AppIcon
        :name="icon"
        :size="24"
        :class="variant === 'dark' ? 'text-white' : 'text-igp-dark-blue-500'"
      />
    </div>
    <h3
      class="text-lg font-bold mb-2"
      :class="variant === 'dark' ? 'text-white' : 'text-igp-dark-blue-500'"
    >
      {{ title }}
    </h3>
    <p
      class="text-sm leading-relaxed"
      :class="variant === 'dark' ? 'text-gray-200' : 'text-gray-600'"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>
