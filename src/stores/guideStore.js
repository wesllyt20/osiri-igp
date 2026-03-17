import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGuideStore = defineStore('guide', () => {
  const totalSteps = 8

  const currentStep = ref(1)
  const completedSteps = ref(new Set())
  const sidebarOpen = ref(true)

  const steps = ref([
    {
      id: 1,
      title: 'Introducción al Análisis Sísmico',
      shortTitle: 'Introducción',
      icon: 'book-open',
      description: 'Conceptos fundamentales del análisis sísmico',
    },
    {
      id: 2,
      title: 'Lectura de Ondas Sísmicas',
      shortTitle: 'Ondas Sísmicas',
      icon: 'activity',
      description: 'Diferencia entre ondas P y ondas S',
    },
    {
      id: 3,
      title: 'Visualización de Señal',
      shortTitle: 'Visualización',
      icon: 'bar-chart-2',
      description: 'Gráficas interactivas con Plotly.js',
    },
    {
      id: 4,
      title: 'Identificación de Onda P y S',
      shortTitle: 'Identificación P/S',
      icon: 'crosshair',
      description: 'Identificar llegadas de ondas P y S',
    },
    {
      id: 5,
      title: 'Cálculos Básicos',
      shortTitle: 'Cálculos',
      icon: 'calculator',
      description: 'Diferencias de tiempo y distancia epicentral',
    },
    {
      id: 6,
      title: 'Cálculos Vectoriales',
      shortTitle: 'Vectores',
      icon: 'git-branch',
      description: 'Operaciones vectoriales para localización',
    },
    {
      id: 7,
      title: 'Determinación de Parámetros',
      shortTitle: 'Parámetros',
      icon: 'globe',
      description: 'Magnitud, latitud, longitud, profundidad',
    },
    {
      id: 8,
      title: 'Reporte Sísmico Final',
      shortTitle: 'Reporte Final',
      icon: 'file-text',
      description: 'Resumen completo del evento sísmico',
    },
  ])

  const progress = computed(() => {
    return Math.round((completedSteps.value.size / totalSteps) * 100)
  })

  const currentStepData = computed(() => {
    return steps.value.find((s) => s.id === currentStep.value)
  })

  function setStep(step) {
    const num = Number(step)
    if (num >= 1 && num <= totalSteps) {
      currentStep.value = num
    }
  }

  function markCompleted(step) {
    completedSteps.value.add(Number(step))
  }

  function isCompleted(step) {
    return completedSteps.value.has(Number(step))
  }

  function nextStep() {
    markCompleted(currentStep.value)
    if (currentStep.value < totalSteps) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return {
    totalSteps,
    currentStep,
    completedSteps,
    sidebarOpen,
    steps,
    progress,
    currentStepData,
    setStep,
    markCompleted,
    isCompleted,
    nextStep,
    prevStep,
    toggleSidebar,
  }
})
