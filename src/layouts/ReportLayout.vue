<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import SeismicDetailTabs from '@/components/organisms/SeismicDetailTabs.vue'
import { useReportStore } from '@/stores/reportStore'

const store = useReportStore()
const mainContentRef = ref(null)
const selectedQuake = ref(null)
const steps = computed(() => store.steps)
const currentStep = computed(() => store.currentStep)
const records = computed(() => store.records)

watch(() => store.currentStep, () => nextTick(() => {
  if (mainContentRef.value) mainContentRef.value.scrollTop = 0
}))

watch(() => store.selectedRecordId, (id) => {
  selectedQuake.value = id ? records.value.find((record) => record.id === id) || null : null
}, { immediate: true })

function selectQuake(record) {
  selectedQuake.value = record
  store.selectRecord(record.id)
  store.setStep(1)
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getEpicentroUrl(recordId) {
  const number = recordId.split('_')[0]
  return `./records/${recordId}/epicentro_${number}.PNG`
}

function getEpicentroFallback(recordId) {
  const number = recordId.split('_')[0]
  return `./records/${recordId}/epicentro_${number}.JPG`
}

function handleNextStep() {
  store.markCompleted(store.currentStep)
  store.nextStep()
}
</script>

<template>
  <div class="h-screen min-h-screen flex flex-col overflow-hidden bg-[#eaf4f8] border-l-[6px] border-[#4d879b]">
    <AppHeader />

    <div class="flex-1 min-h-0 p-1 lg:p-2">
      <section class="h-full flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="shrink-0 border-b border-slate-200 bg-white px-3 py-2">
          <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div class="lg:w-68 xl:w-86 shrink-0">
              <h1 class="font-semibold leading-tight text-igp-blue text-base sm:text-xl">Creando tu reporte sísmico IGP</h1>
              <p class="mt-0.5 text-xs leading-tight text-igp-black-950">Completa correctamente los siguientes pasos.</p>
            </div>

            <nav class="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto py-2 sm:py-4" aria-label="Progreso del reporte">
              <template v-for="(step, index) in steps" :key="step.id">
                <div class="step-pill shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors sm:px-4"
                  :class="currentStep === step.id ? 'bg-igp-blue text-white' : store.isCompleted(step.id) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-white'">
                  <span class="flex h-5 w-5 items-center justify-center rounded-full bg-white"
                    :class="currentStep === step.id ? 'text-igp-blue' : store.isCompleted(step.id) ? 'text-emerald-600' : 'text-igp-black-950/10'">
                    {{ step.id }}
                  </span>
                  <span>PASO {{ step.id }}: {{ step.shortTitle }}</span>
                </div>
                <span v-if="index < steps.length - 1" class="h-px min-w-4 flex-1 bg-slate-300" />
              </template>
            </nav>
          </div>
        </div>

        <div class="flex-1 min-h-0 flex">
          <aside v-if="currentStep === 1" class="hidden lg:flex w-52 xl:w-85 shrink-0 flex-col border-r border-slate-200 bg-white">
            <div class="px-3 pt-3 pb-2">
              <h2 class="text-sm sm:text-base font-semibold text-igp-blue">Historial de eventos</h2>
              <p class="mt-1 text-[10px] text-slate-400">{{ records.length }} registros disponibles</p>
            </div>
            <div class="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
              <button v-for="record in records" :key="record.id" class="w-full rounded-lg border p-2 text-left transition-all"
                :class="selectedQuake?.id === record.id ? 'border-igp-blue bg-white shadow-sm ring-1 ring-igp-blue' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'"
                @click="selectQuake(record)">
                <div class="flex items-center gap-2">
                  <div class="h-18 w-18 shrink-0 overflow-hidden rounded bg-slate-100">
                    <img :src="getEpicentroUrl(record.id)" :alt="record.title" class="h-full w-full object-cover" loading="lazy"
                      @error="(event) => { event.target.src = getEpicentroFallback(record.id) }" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate  text-xs sm:text-sm font-semibold text-slate-800">{{ record.title }}</p>
                    <p class="event-date text-xs text-igp-black-950">{{ record.info.dateTime }}</p>
                  </div>
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center transition-colors"
                    :class="selectedQuake?.id === record.id ? 'text-igp-blue' : 'text-transparent'">
                    <AppIcon name="arrow2" :size="26" class="fill-current stroke-0" />
                  </span>
                </div>
              </button>
            </div>
          </aside>

          <main class="flex-1 min-w-0 overflow-hidden flex flex-col bg-white">
            <div class="lg:hidden shrink-0 border-b border-slate-200 p-3" v-if="currentStep === 1 && !selectedQuake">
              <p class="text-xs font-semibold text-igp-blue">Historial de eventos</p>
              <div class="mt-2 flex gap-2 overflow-x-auto">
                <button v-for="record in records" :key="record.id" class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-left" @click="selectQuake(record)">
                  <p class="text-[11px] font-semibold">{{ record.title }}</p>
                  <p class="text-[9px] text-slate-400">{{ formatDateShort(record.date) }}</p>
                </button>
              </div>
            </div>

            <SeismicDetailTabs v-if="currentStep === 1" :record="selectedQuake" @next-step="handleNextStep"
              @select-record="selectQuake" class="flex-1 min-h-0" />
            <div v-else ref="mainContentRef" class="report-step-content flex-1 overflow-y-auto">
              <slot />
            </div>
          </main>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.report-step-content h1,
.report-step-content h2,
.report-step-content h3,
.report-step-content h4 {
  color: #222222 !important;
}

.report-step-content h1 + p,
.report-step-content h2 + p,
.report-step-content h3 + p,
.report-step-content h4 + p {
  color: #222222 !important;
}
</style>

<style scoped>
.step-pill { white-space: nowrap; }

.event-date {
  display: -webkit-box;
  line-height: 1.2;
  overflow: hidden;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 1399px) {
  .step-pill { padding-inline: 0.55rem; }
  .step-pill span:last-child { max-width: 88px; overflow: hidden; text-overflow: ellipsis; }
}
</style>
