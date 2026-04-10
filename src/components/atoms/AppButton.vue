<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  to: { type: [String, Object], default: null },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const router = useRouter()

const baseClasses =
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer'

const variantClasses = computed(() => {
  const variants = {
    primary:
      'bg-igp-blue text-white hover:bg-igp-blue-800 focus:ring-igp-blue-400 shadow-md hover:shadow-lg',
    secondary:
      'bg-white text-igp-blue border-2 border-igp-blue hover:bg-igp-blue-50 focus:ring-igp-blue-400',
    accent:
      'bg-igp-sky-blue-600 text-white hover:bg-igp-sky-blue-700 focus:ring-igp-sky-blue-400 shadow-md hover:shadow-lg',
    ghost:
      'bg-transparent text-igp-blue hover:bg-igp-blue-50 focus:ring-igp-blue-400',
    success:
      'bg-igp-green-700 text-white hover:bg-igp-green-800 focus:ring-igp-green-600 shadow-md hover:shadow-lg',
  }
  return variants[props.variant] || variants.primary
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }
  return sizes[props.size] || sizes.md
})

const classes = computed(() => [
  baseClasses,
  variantClasses.value,
  sizeClasses.value,
  props.block ? 'w-full' : '',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
])

function handleClick(e) {
  if (props.disabled) return
  if (props.to) {
    router.push(props.to)
  }
  emit('click', e)
}
</script>

<template>
  <button :class="classes" :disabled="disabled" @click="handleClick">
    <slot />
  </button>
</template>
