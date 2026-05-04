<script setup>
import { ref, watch } from 'vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  image: { type: String, default: '' },
  linkTo: { type: String, default: '' },
  linkLabel: { type: String, default: 'Ver más' },
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-9998"
        @click="close"
      />
    </Transition>

    <!-- Sidebar panel -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-9999 flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-igp-blue-950 to-igp-blue-900">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <AppIcon name="info" :size="20" class="text-gray-300" />
            {{ title }}
          </h3>
          <button
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            @click="close"
          >
            <AppIcon name="x" :size="18" class="text-white" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Description -->
          <p v-if="description" class="text-sm text-gray-600 leading-relaxed">
            {{ description }}
          </p>

          <!-- Image -->
          <div v-if="image" class="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <img :src="image" alt="" class="w-full h-auto object-cover" />
          </div>

          <!-- Items list -->
          <div v-if="items.length" class="space-y-3">
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div class="w-8 h-8 rounded-lg bg-igp-blue/10 flex items-center justify-center shrink-0">
                <AppIcon :name="item.icon || 'check'" :size="16" class="text-igp-blue" />
              </div>
              <div>
                <p v-if="item.title" class="text-sm font-semibold text-gray-800">{{ item.title }}</p>
                <p class="text-xs text-gray-500 leading-relaxed">{{ item.text }}</p>
              </div>
            </div>
          </div>

          <!-- Slot for extra content -->
          <slot />
        </div>

        <!-- Footer CTA -->
        <div v-if="linkTo" class="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <AppButton :to="linkTo" variant="primary" size="md" block>
            {{ linkLabel }}
            <AppIcon name="arrow-right" :size="16" class="ml-2" />
          </AppButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.7, 0, 0.84, 0);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
