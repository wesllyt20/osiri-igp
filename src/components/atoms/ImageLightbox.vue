<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
})

const emit = defineEmits(['close'])

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-fade">
      <div
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        @click.self="$emit('close')"
      >
        <div class="relative max-w-5xl w-full">
          <!-- Close button -->
          <button
            class="absolute -top-11 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
            @click="$emit('close')"
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Cerrar
          </button>

          <!-- Image -->
          <img
            :src="src"
            :alt="alt"
            class="max-w-full max-h-[85vh] w-auto mx-auto object-contain rounded-2xl shadow-2xl"
          />

          <!-- Caption -->
          <p v-if="alt" class="text-center text-white/60 text-xs mt-3">{{ alt }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lb-fade-enter-active,
.lb-fade-leave-active {
  transition: opacity 0.25s ease;
}
.lb-fade-enter-from,
.lb-fade-leave-to {
  opacity: 0;
}
</style>
