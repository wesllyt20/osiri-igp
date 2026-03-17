<script setup>
import AppButton from '@/components/atoms/AppButton.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'

defineProps({
  currentStep: { type: Number, required: true },
  totalSteps: { type: Number, required: true },
})

defineEmits(['prev', 'next'])
</script>

<template>
  <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
    <AppButton
      v-if="currentStep > 1"
      variant="ghost"
      size="md"
      @click="$emit('prev')"
    >
      <AppIcon name="arrow-left" :size="18" class="mr-2" />
      Paso anterior
    </AppButton>
    <div v-else />

    <AppButton
      v-if="currentStep < totalSteps"
      variant="primary"
      size="md"
      @click="$emit('next')"
    >
      Siguiente paso
      <AppIcon name="arrow-right" :size="18" class="ml-2" />
    </AppButton>
    <AppButton
      v-else
      variant="success"
      size="md"
      @click="$emit('next')"
    >
      <AppIcon name="check-circle" :size="18" class="mr-2" />
      Finalizar guía
    </AppButton>
  </div>
</template>
