import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { SEISMIC_RECORDS, STATIONS_CATALOG, SEISMIC_CONSTANTS, VALIDATION_TOLERANCE } from '@/data/seismicData'

export const useReportStore = defineStore('report', () => {
  const currentStep = ref(1)
  const completedSteps = ref(new Set())
  const selectedRecordId = ref(null)

  const waveformCache = shallowRef({})
  const stationAnalysis = ref({})

  const totalSteps = 6

  const steps = [
    { id: 1, title: 'Seleccionar Sismo', icon: 'target', shortTitle: 'Selección' },
    { id: 2, title: 'Visualizar Ondas', icon: 'activity', shortTitle: 'Ondas' },
    { id: 3, title: 'Resumen de Datos', icon: 'file-text', shortTitle: 'Resumen' },
    { id: 4, title: 'Distancia Epicentral', icon: 'crosshair', shortTitle: 'Distancia' },
    { id: 5, title: 'Gráfico S-P', icon: 'trending-up', shortTitle: 'Gráfico S-P' },
    { id: 6, title: 'Epicentro', icon: 'map-pin', shortTitle: 'Epicentro' },
  ]

  const records = computed(() => SEISMIC_RECORDS)

  const selectedRecord = computed(() => {
    if (!selectedRecordId.value) return null
    return SEISMIC_RECORDS.find((r) => r.id === selectedRecordId.value) || null
  })

  const stations = computed(() => {
    if (!selectedRecord.value) return []
    return selectedRecord.value.stations || []
  })

  const progress = computed(() => {
    return Math.round((completedSteps.value.size / totalSteps) * 100)
  })

  function getStationCoords(stationName) {
    return STATIONS_CATALOG[stationName] || null
  }

  function getCorrectValues(stationName) {
    if (!selectedRecord.value) return null
    return selectedRecord.value.correctValues?.[stationName] || null
  }

  function selectRecord(id) {
    if (selectedRecordId.value !== id) {
      waveformCache.value = {}
      stationAnalysis.value = {}
    }
    selectedRecordId.value = id
  }

  function setStep(step) {
    const num = Number(step)
    if (num >= 1 && num <= totalSteps) {
      currentStep.value = num
    }
  }

  function canGoToStep(step) {
    if (step === 1) return true
    for (let i = 1; i < step; i++) {
      if (!completedSteps.value.has(i)) return false
    }
    return true
  }

  function markCompleted(step) {
    const newSet = new Set(completedSteps.value)
    newSet.add(Number(step))
    completedSteps.value = newSet
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

  async function loadWaveformData(stationName) {
    if (!selectedRecordId.value) return null
    const currentCache = waveformCache.value
    if (currentCache[stationName]) return currentCache[stationName]

    const url = `./records/${selectedRecordId.value}/Formas_onda_SAC_TXT/${stationName}_WA_mm.txt`
    try {
      const response = await fetch(url)
      const text = await response.text()
      const lines = text.split('\n')
      const meta = {}
      const time = []
      const amplitude = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (trimmed.startsWith('Tiempo')) continue
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^#\s*(\w+)=(.+)/)
          if (match) meta[match[1]] = match[2].trim()
          continue
        }
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 2) {
          time.push(parseFloat(parts[0]))
          amplitude.push(parseFloat(parts[1]))
        }
      }

      let maxAmp = 0, maxAmpTime = 0
      for (let i = 0; i < amplitude.length; i++) {
        const absAmp = Math.abs(amplitude[i])
        if (absAmp > maxAmp) { maxAmp = absAmp; maxAmpTime = time[i] }
      }

      const data = { time, amplitude, meta, stationName, maxAmplitude: maxAmp, maxAmplitudeTime: maxAmpTime }
      waveformCache.value = { ...currentCache, [stationName]: data }
      return data
    } catch (err) {
      console.error(`Error loading waveform for ${stationName}:`, err)
      return null
    }
  }

  function clearWaveformCache() {
    waveformCache.value = {}
  }

  function setStationAnalysis(stationName, data) {
    stationAnalysis.value = { ...stationAnalysis.value, [stationName]: data }
  }

  function getPreviewImages(recordId) {
    const rec = SEISMIC_RECORDS.find((r) => r.id === recordId)
    const stns = rec?.stations || []
    return {
      ascii: stns.map((s) => ({ station: s, url: `./records/${recordId}/graficas_formato_ascii/${s}_ASCII_WA_mm.png` })),
      sac: stns.map((s) => ({ station: s, url: `./records/${recordId}/graficas_formato_mm.SAC/${s}_WA_mm.png` })),
    }
  }

  function resetReport() {
    currentStep.value = 1
    completedSteps.value = new Set()
    selectedRecordId.value = null
    waveformCache.value = {}
    stationAnalysis.value = {}
  }

  return {
    currentStep, completedSteps, selectedRecordId, waveformCache, stationAnalysis,
    totalSteps, steps, records, selectedRecord, stations, progress,
    selectRecord, setStep, canGoToStep, markCompleted, isCompleted, nextStep, prevStep,
    loadWaveformData, clearWaveformCache, setStationAnalysis,
    getPreviewImages, getStationCoords, getCorrectValues, resetReport,
    SEISMIC_CONSTANTS, VALIDATION_TOLERANCE,
  }
})
