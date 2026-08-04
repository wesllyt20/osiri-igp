import { defineStore } from 'pinia'
import { ref, computed, shallowRef, reactive } from 'vue'
import { SEISMIC_RECORDS, STATIONS_CATALOG, SEISMIC_CONSTANTS, VALIDATION_TOLERANCE } from '@/data/seismicData'

export const useReportStore = defineStore('report', () => {
  const currentStep = ref(1)
  const completedSteps = ref(new Set())
  const selectedRecordId = ref(SEISMIC_RECORDS[0]?.id || null)

  const waveformCache = shallowRef({})
  const stationAnalysis = ref({})

  // Persisted station inputs for step 2 (survives navigation between steps)
  const savedStationInputs = reactive({})
  const savedDistanceInputs = reactive({})
  const savedDistanceVisibility = reactive({})
  const savedDistanceDrawn = reactive({})

  // User-selected epicenter on map
  const userEpicenter = ref(null)
  // User-selected Richter magnitude
  const userMagnitude = ref(null)

  const totalSteps = 5

  const steps = [
    { id: 1, title: 'Seleccionar evento sísmico', icon: 'target', shortTitle: 'Selecciona evento' },
    { id: 2, title: 'Lectura de ondas P y S', icon: 'activity', shortTitle: 'Halla Ondas P y S' },
    { id: 3, title: 'Validar distancia epicentral', icon: 'trending-up', shortTitle: 'Calcula Distancia' },
    { id: 4, title: 'Ubicar epicentro en el mapa', icon: 'map-pin', shortTitle: 'Ubica epicentro' },
    { id: 5, title: 'Calcular magnitud Richter', icon: 'zap', shortTitle: 'Calcula Magnitud Richter' },
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

  function setUserEpicenter(latlng) {
    userEpicenter.value = latlng ? { lat: latlng.lat, lng: latlng.lng } : null
  }

  function setUserMagnitude(mag) {
    userMagnitude.value = mag
  }

  function selectRecord(id) {
    if (selectedRecordId.value !== id) {
      waveformCache.value = {}
      stationAnalysis.value = {}
      userEpicenter.value = null
      userMagnitude.value = null
      // Clear saved station inputs when selecting a new sismo
      Object.keys(savedStationInputs).forEach((k) => delete savedStationInputs[k])
      Object.keys(savedDistanceInputs).forEach((k) => delete savedDistanceInputs[k])
      Object.keys(savedDistanceVisibility).forEach((k) => delete savedDistanceVisibility[k])
      Object.keys(savedDistanceDrawn).forEach((k) => delete savedDistanceDrawn[k])
      // Reset completed steps
      completedSteps.value = new Set()
    }
    selectedRecordId.value = id
  }

  function setStep(step) {
    const num = Number(step)
    if (num >= 1 && num <= totalSteps + 1) {
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
    if (currentStep.value < totalSteps + 1) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      // Remove completed state for current step and all future steps when going back
      const newSet = new Set(completedSteps.value)
      for (let i = currentStep.value; i <= totalSteps; i++) {
        newSet.delete(i)
      }
      completedSteps.value = newSet
      currentStep.value--
    }
  }

  // When going back to step 1, clear all data (user is choosing a new sismo)
  function goToStep1() {
    currentStep.value = 1
    completedSteps.value = new Set()
    stationAnalysis.value = {}
    Object.keys(savedStationInputs).forEach((k) => delete savedStationInputs[k])
    Object.keys(savedDistanceInputs).forEach((k) => delete savedDistanceInputs[k])
    Object.keys(savedDistanceVisibility).forEach((k) => delete savedDistanceVisibility[k])
    Object.keys(savedDistanceDrawn).forEach((k) => delete savedDistanceDrawn[k])
    waveformCache.value = {}
    userEpicenter.value = null
    userMagnitude.value = null
    selectedRecordId.value = SEISMIC_RECORDS[0]?.id || null
  }

  function saveStationInputs(inputs) {
    Object.keys(inputs).forEach((k) => {
      savedStationInputs[k] = { ...inputs[k] }
    })
  }

  function getSavedStationInputs() {
    return { ...savedStationInputs }
  }

  function saveDistanceState(inputs, visibility, drawn) {
    Object.keys(savedDistanceInputs).forEach((k) => delete savedDistanceInputs[k])
    Object.keys(inputs).forEach((k) => {
      savedDistanceInputs[k] = { ...inputs[k] }
    })

    Object.keys(savedDistanceVisibility).forEach((k) => delete savedDistanceVisibility[k])
    Object.keys(visibility).forEach((k) => {
      savedDistanceVisibility[k] = Boolean(visibility[k])
    })

    Object.keys(savedDistanceDrawn).forEach((k) => delete savedDistanceDrawn[k])
    Object.keys(drawn).forEach((k) => {
      savedDistanceDrawn[k] = Boolean(drawn[k])
    })
  }

  function getSavedDistanceState() {
    return {
      inputs: Object.fromEntries(Object.entries(savedDistanceInputs).map(([key, value]) => [key, { ...value }])),
      visibility: { ...savedDistanceVisibility },
      drawn: { ...savedDistanceDrawn },
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
    selectedRecordId.value = SEISMIC_RECORDS[0]?.id || null
    waveformCache.value = {}
    stationAnalysis.value = {}
    Object.keys(savedStationInputs).forEach((k) => delete savedStationInputs[k])
    Object.keys(savedDistanceInputs).forEach((k) => delete savedDistanceInputs[k])
    Object.keys(savedDistanceVisibility).forEach((k) => delete savedDistanceVisibility[k])
    Object.keys(savedDistanceDrawn).forEach((k) => delete savedDistanceDrawn[k])
    userEpicenter.value = null
    userMagnitude.value = null
  }

  return {
    currentStep, completedSteps, selectedRecordId, waveformCache, stationAnalysis,
    userEpicenter, userMagnitude,
    totalSteps, steps, records, selectedRecord, stations, progress,
    selectRecord, setStep, canGoToStep, markCompleted, isCompleted, nextStep, prevStep,
    loadWaveformData, clearWaveformCache, setStationAnalysis,
    getPreviewImages, getStationCoords, getCorrectValues, resetReport,
    goToStep1, saveStationInputs, getSavedStationInputs, savedStationInputs,
    saveDistanceState, getSavedDistanceState,
    setUserEpicenter, setUserMagnitude,
    SEISMIC_CONSTANTS, VALIDATION_TOLERANCE,
  }
})
