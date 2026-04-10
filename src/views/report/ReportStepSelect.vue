<script setup>
import { computed } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import AppIcon from '@/components/atoms/AppIcon.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const store = useReportStore()
const records = computed(() => store.records)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const formatted = d.toLocaleDateString('es-PE', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function getPreviewImage(recordId) {
  const images = store.getPreviewImages(recordId)
  return images.sac.length > 0 ? images.sac[0].url : null
}

function selectAndNext(recordId) {
  store.selectRecord(recordId)
  store.nextStep()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <span class="inline-block px-3 py-1 bg-igp-blue-50 text-igp-blue text-xs font-bold uppercase tracking-wider rounded-full mb-3">
        Paso 1
      </span>
      <h1 class="text-2xl lg:text-3xl font-extrabold text-igp-blue mb-2">
        Seleccionar Evento Sísmico
      </h1>
      <p class="text-gray-500">
        Selecciona uno de los {{ records.length }} registros sísmicos disponibles para comenzar tu reporte.
      </p>
    </div>

    <!-- Records Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <button
        v-for="record in records"
        :key="record.id"
        class="bg-white rounded-2xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-lg group cursor-pointer"
        :class="
          store.selectedRecordId === record.id
            ? 'border-igp-sky-blue-500 shadow-lg ring-2 ring-igp-sky-blue-200'
            : 'border-gray-100 hover:border-igp-sky-blue-300'
        "
        @click="selectAndNext(record.id)"
      >
        <div class="flex items-start gap-4 p-4">
          <!-- Preview thumbnail -->
          <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
            <img
              :src="getPreviewImage(record.id)"
              :alt="'Sismo ' + record.number"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="(e) => e.target.style.display = 'none'"
            />
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="text-xs text-gray-400 mb-1">
              {{ formatDate(record.date) }} a las {{ record.time }} horas
            </p>
            <p class="text-base font-bold text-igp-blue group-hover:text-igp-sky-blue-600 transition-colors">
              {{ record.title }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ record.subtitle }}
            </p>
          </div>

          <!-- Arrow -->
          <div class="flex-shrink-0 mt-2">
            <AppIcon
              name="chevron-right"
              :size="20"
              class="text-gray-300 group-hover:text-igp-sky-blue-500 transition-colors"
            />
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
