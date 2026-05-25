<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/atoms/AppIcon.vue'

const route = useRoute()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const navLinks = [
  { label: 'Inicio', to: '/home', disabled: false },
  { label: 'Guía Operador Sísmico', to: '/guia', disabled: false },
  { label: 'Reportes Sísmicos', to: '/reportes', disabled: false },
]

// Only the Home route gets the transparent→white scroll effect
const isHome = computed(() => route.path === '/' || route.path === '/home')

// When NOT home, header is always light (white bg, colored logos)
const showLight = computed(() => !isHome.value || scrolled.value)

function handleScroll() {
  scrolled.value = window.scrollY > 80
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="h-16 shrink-0 sticky top-0 z-50 bg-white shadow-sm"
  >
    <div class="h-full px-[50px] flex items-center gap-4">

      <!-- Logos -->
      <div class="flex items-center gap-3 shrink-0">
        <img
          src="/logo_minam.png"
          alt="Perú - Ministerio del Ambiente"
          class="h-9 sm:h-10 object-contain"
        />
        <img
          src="/logo_igp.png"
          alt="IGP"
          class="h-8 sm:h-9 object-contain"
        />
      </div>

      <!-- Separator -->
      <div class="h-7 w-px bg-gray-200 shrink-0" />

      <!-- App title -->
      <span class="hidden sm:block text-sm font-medium text-gray-800 truncate">
        OSIDI: Operador Sísmico Digital IGP
      </span>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <template v-for="link in navLinks" :key="link.to">
          <span
            v-if="link.disabled"
            class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed select-none"
          >
            {{ link.label }}
          </span>
          <router-link
            v-else
            :to="link.to"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-igp-blue"
            :class="
              (route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)))
                ? 'bg-slate-100 text-igp-blue font-bold'
                : 'hover:bg-gray-50'
            "
          >
            {{ link.label }}
          </router-link>
        </template>
      </nav>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <AppIcon :name="mobileMenuOpen ? 'x' : 'menu'" :size="22" />
      </button>
    </div>

    <!-- Mobile Nav Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50"
      >
        <nav class="p-4 flex flex-col gap-1">
          <template v-for="link in navLinks" :key="link.to">
            <span
              v-if="link.disabled"
              class="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed"
            >
              {{ link.label }}
            </span>
            <router-link
              v-else
              :to="link.to"
              class="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-igp-blue"
              :class="
                (route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)))
                  ? 'bg-slate-100 text-igp-blue font-bold'
                  : ''
              "
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </router-link>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>
