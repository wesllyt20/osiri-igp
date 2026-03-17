<script setup>
import AppIcon from '@/components/atoms/AppIcon.vue'

defineProps({
  icon: { type: String, default: 'info' },
  variant: { type: String, default: 'info' },
})

const variants = {
  info: {
    bg: 'bg-igp-sky-blue-50 border-igp-sky-blue-200',
    icon: 'text-igp-sky-blue-600',
    text: 'text-igp-sky-blue-800',
  },
  warning: {
    bg: 'bg-igp-orange-50 border-igp-orange-200',
    icon: 'text-igp-orange-500',
    text: 'text-igp-orange-800',
  },
  success: {
    bg: 'bg-igp-green-100 border-igp-green-200',
    icon: 'text-igp-green-700',
    text: 'text-igp-green-900',
  },
  tip: {
    bg: 'bg-purple-50 border-purple-200',
    icon: 'text-purple-500',
    text: 'text-purple-800',
  },
}
</script>

<template>
  <div
    :class="[
      'rounded-xl border p-4 flex gap-3 items-start',
      variants[variant]?.bg || variants.info.bg,
    ]"
  >
    <AppIcon
      :name="icon"
      :size="20"
      :class="['flex-shrink-0 mt-0.5', variants[variant]?.icon || variants.info.icon]"
    />
    <div :class="['text-sm leading-relaxed', variants[variant]?.text || variants.info.text]">
      <slot />
    </div>
  </div>
</template>
