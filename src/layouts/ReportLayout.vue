<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppCintillo from '@/components/organisms/AppCintillo.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import SeismicDetailTabs from '@/components/organisms/SeismicDetailTabs.vue'
import { useReportStore } from '@/stores/reportStore'

const store = useReportStore()
const mainContentRef = ref(null)

watch(() => store.currentStep, () => {
  nextTick(() => {
    if (mainContentRef.value) {
      mainContentRef.value.scrollTop = 0
    }
  })
})

const steps = computed(() => store.steps)
const currentStep = computed(() => store.currentStep)
const records = computed(() => store.records)

const selectedQuake = ref(null)

function selectQuake(record) {
  selectedQuake.value = record
  store.selectRecord(record.id)
  // When selecting a sismo, always go to step 1
  store.setStep(1)
}

// Keep selectedQuake in sync if store.selectedRecord changes
watch(() => store.selectedRecordId, (id) => {
  if (id) {
    selectedQuake.value = records.value.find(r => r.id === id) || null
  } else {
    selectedQuake.value = null
  }
})

function handleChangeSeismo() {
  selectedQuake.value = null
  store.goToStep1()
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getEpicentroUrl(recordId) {
  const num = recordId.split('_')[0]
  return `./records/${recordId}/epicentro_${num}.PNG`
}
function getEpicentroFallback(recordId) {
  const num = recordId.split('_')[0]
  return `./records/${recordId}/epicentro_${num}.JPG`
}

function handleNextStep() {
  store.markCompleted(store.currentStep)
  store.nextStep()
}
</script>

<template>
  <div class="min-h-screen h-screen flex flex-col bg-gray-50 overflow-hidden">
    <AppHeader />
    <AppCintillo :sticky="true" />
    <div class="flex-1 flex overflow-hidden">
      <!-- Column 1: Steps Sidebar -->
      <aside class="w-60 bg-white border-r border-gray-200 shrink-0 hidden lg:flex flex-col animate-slideRight">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-[10px] font-bold text-igp-dark-blue uppercase tracking-wider">
            Pasos del Reporte
          </h3>
          <div class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-igp-green-700 rounded-full transition-all duration-500"
              :style="{ width: store.progress + '%' }"
            />
          </div>
          <p class="text-[10px] text-gray-400 mt-1">{{ store.progress }}% completado</p>
        </div>

        <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div
            v-for="(step, idx) in steps"
            :key="step.id"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 animate-fadeSlideIn select-none"
            :style="{ animationDelay: (idx * 60) + 'ms' }"
            :class="[
              currentStep === step.id
                ? 'bg-igp-dark-blue text-white shadow-md'
                : store.isCompleted(step.id)
                  ? 'bg-igp-green-50 text-igp-green-800'
                  : 'text-gray-300'
            ]"
          >
            <div
              class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold"
              :class="[
                currentStep === step.id
                  ? 'bg-white/20 text-white'
                  : store.isCompleted(step.id)
                    ? 'bg-igp-green-700 text-white'
                    : 'bg-gray-100 text-gray-400'
              ]"
            >
              <AppIcon
                v-if="store.isCompleted(step.id) && currentStep !== step.id"
                name="check"
                :size="12"
              />
              <span v-else>{{ step.id }}</span>
            </div>
            <p class="text-[11px] font-semibold truncate">{{ step.title }}</p>
          </div>
        </nav>

        <!-- Change sismo option (visible when on step >= 2) -->
        <div v-if="currentStep >= 2" class="p-3 border-t border-gray-100">
          <button
            class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200 bg-igp-orange-50 text-igp-orange-700 hover:bg-igp-orange-100 cursor-pointer"
            @click="handleChangeSeismo"
          >
            <AppIcon name="refresh-cw" :size="14" />
            <p class="text-[11px] font-semibold">Cambiar sismo</p>
          </button>
        </div>
      </aside>

      <!-- Column 2: Earthquake List (only visible on step 1) -->
      <aside v-if="currentStep === 1" class="w-72 bg-white border-r border-gray-200 shrink-0 hidden lg:flex flex-col animate-slideRight" style="animation-delay: 100ms">
        <div class="p-4 border-b border-gray-100">
          <h3 class="text-[10px] font-bold text-igp-dark-blue uppercase tracking-wider flex items-center gap-2">
            <AppIcon name="activity" :size="14" />
            Eventos Sísmicos
          </h3>
          <p class="text-[10px] text-gray-400 mt-1">{{ records.length }} registros disponibles</p>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            v-for="(record, idx) in records"
            :key="record.id"
            class="w-full text-left px-2 py-2 rounded-xl transition-all duration-200 group cursor-pointer animate-fadeSlideIn"
            :style="{ animationDelay: (idx * 50 + 200) + 'ms' }"
            :class="
              selectedQuake?.id === record.id
                ? 'bg-igp-dark-blue text-white shadow-md'
                : 'hover:bg-gray-50 text-gray-700'
            "
            @click="selectQuake(record)"
          >
            <div class="flex items-center gap-2.5">
              <!-- Epicentro thumbnail -->
              <div
                class="w-11 h-11 rounded-lg overflow-hidden shrink-0 border"
                :class="selectedQuake?.id === record.id ? 'border-white/30' : 'border-gray-200'"
              >
                <img
                  :src="getEpicentroUrl(record.id)"
                  :alt="record.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  @error="(e) => { e.target.src = getEpicentroFallback(record.id) }"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="text-[11px] font-bold truncate"
                  :class="selectedQuake?.id === record.id ? 'text-white' : 'text-gray-800'"
                >
                  {{ record.title }}
                </p>
                <p
                  class="text-[10px] truncate"
                  :class="selectedQuake?.id === record.id ? 'text-white/70' : 'text-gray-400'"
                >
                  {{ record.info.region }}
                </p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span
                    class="text-[9px] font-medium"
                    :class="selectedQuake?.id === record.id ? 'text-white/60' : 'text-gray-400'"
                  >
                    {{ formatDateShort(record.date) }}
                  </span>
                  <!-- <span
                    v-if="record.info?.magnitud"
                    class="text-[9px] font-bold px-1 py-0.5 rounded"
                    :class="
                      selectedQuake?.id === record.id
                        ? 'bg-white/20 text-white'
                        : 'bg-igp-orange-50 text-igp-orange-600'
                    "
                  >
                    {{ record.info.magnitud }}
                  </span> -->
                </div>
              </div>
            </div>
          </button>
        </div>
      </aside>

      <!-- Column 3: Main Content (Tabs) -->
      <main class="flex-1 overflow-hidden flex flex-col">
        <!-- Mobile header -->
        <div class="lg:hidden bg-white border-b border-gray-200 px-3 py-2.5">
          <div class="flex items-center gap-2">
            <!-- Step progress dots -->
            <div class="flex items-center gap-1 overflow-x-auto flex-1 py-0.5">
              <div
                v-for="step in steps"
                :key="step.id"
                class="flex items-center gap-1 shrink-0"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="[
                    currentStep === step.id
                      ? 'bg-igp-dark-blue text-white'
                      : store.isCompleted(step.id)
                        ? 'bg-igp-green-700 text-white'
                        : 'bg-gray-200 text-gray-400'
                  ]"
                >
                  <AppIcon
                    v-if="store.isCompleted(step.id) && currentStep !== step.id"
                    name="check"
                    :size="12"
                  />
                  <span v-else>{{ step.id }}</span>
                </div>
                <span
                  v-if="step.id < steps.length"
                  class="w-3 h-0.5 bg-gray-200"
                  :class="{ 'bg-igp-green-700': store.isCompleted(step.id) }"
                />
              </div>
            </div>
            <!-- Mobile: Cambiar sismo button (step >= 2) -->
            <button
              v-if="currentStep >= 2"
              class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-igp-orange-50 text-igp-orange-700 hover:bg-igp-orange-100 transition-colors cursor-pointer"
              @click="handleChangeSeismo"
            >
              <AppIcon name="refresh-cw" :size="12" />
              <span class="hidden sm:inline">Cambiar sismo</span>
            </button>
          </div>
          <!-- Mobile: Current step label -->
          <p v-if="currentStep >= 2" class="text-[10px] text-gray-400 mt-1 truncate">
            Paso {{ currentStep }}: {{ steps.find(s => s.id === currentStep)?.title }}
          </p>
        </div>

        <!-- Mobile: Back to earthquake list (step 1, quake selected) -->
        <div v-if="currentStep === 1 && selectedQuake" class="lg:hidden bg-white border-b border-gray-100 px-3 py-2">
          <button
            class="flex items-center gap-1.5 text-sm font-semibold text-igp-blue hover:text-igp-dark-blue transition-colors cursor-pointer"
            @click="selectedQuake = null; store.selectRecord(null)"
          >
            <AppIcon name="arrow-left" :size="14" />
            <span>Volver a la lista de eventos</span>
          </button>
        </div>

        <!-- Mobile earthquake list (step 1, no quake selected) -->
        <div v-if="currentStep === 1 && !selectedQuake" class="lg:hidden flex-1 overflow-y-auto bg-gray-50">
          <div class="p-4">
            <!-- Header -->
            <div class="text-center mb-5">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-igp-dark-blue/10 text-igp-dark-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                <AppIcon name="activity" :size="14" />
                <span>Sistema de Reportes</span>
              </div>
              <h2 class="text-xl font-extrabold text-gray-800">Selecciona un evento sísmico</h2>
              <p class="text-sm text-gray-500 mt-1">{{ records.length }} registros disponibles</p>
            </div>
            <!-- Earthquake cards -->
            <div class="space-y-2">
              <button
                v-for="(record, idx) in records"
                :key="record.id"
                class="w-full text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-igp-blue hover:shadow-md transition-all duration-200 group cursor-pointer animate-fadeSlideIn"
                :style="{ animationDelay: (idx * 50) + 'ms' }"
                @click="selectQuake(record)"
              >
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    <img
                      :src="getEpicentroUrl(record.id)"
                      :alt="record.title"
                      class="w-full h-full object-cover"
                      loading="lazy"
                      @error="(e) => { e.target.src = getEpicentroFallback(record.id) }"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-bold text-gray-800 truncate">{{ record.title }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ record.subtitle }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] text-gray-400">{{ formatDateShort(record.date) }}</span>
                      <span
                        v-if="record.info?.magnitud"
                        class="text-[10px] font-bold px-1.5 py-0.5 bg-igp-orange-50 text-igp-orange-600 rounded"
                      >
                        {{ record.info.magnitud }}
                      </span>
                    </div>
                  </div>
                  <AppIcon name="chevron-right" :size="16" class="text-gray-300 group-hover:text-igp-blue shrink-0 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- SeismicDetailTabs: hidden on mobile when no quake selected, always on desktop -->
        <SeismicDetailTabs
          v-if="currentStep === 1"
          :record="selectedQuake"
          @next-step="handleNextStep"
          @select-record="selectQuake"
          class="flex-1"
          :class="{ 'hidden lg:flex': !selectedQuake }"
        />
        <div v-if="currentStep !== 1" ref="mainContentRef" class="flex-1 overflow-y-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.animate-slideRight {
  animation: slideRight 0.4s ease-out both;
}
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeSlideIn {
  animation: fadeSlideIn 0.35s ease-out both;
}
</style>
