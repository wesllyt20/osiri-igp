<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/atoms/AppIcon.vue'

const route = useRoute()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const navLinks = [
  { label: 'Inicio', to: '/', disabled: true },
  { label: 'Guía Operador Sísmico', to: '/guia', disabled: true },
  { label: 'Reportes Sísmicos', to: '/reportes', disabled: false },
]

// Only the Home route gets the transparent→white scroll effect
const isHome = computed(() => route.path === '/')

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
    class="h-16 flex-shrink-0 sticky top-0 z-50 transition-all duration-300"
    :class="showLight ? 'bg-white shadow-sm' : 'bg-transparent'"
  >
    <div class="h-full max-w-screen-2xl mx-auto px-4 lg:px-6 flex items-center justify-between">
      <!-- Logos -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- MINAM -->
        <img
          v-if="!showLight"
          src="/dark-minam.webp"
          alt="Perú - Ministerio del Ambiente"
          class="sm:h-10 h-9 brightness-0 invert"
        />
        <img
          v-else
          src="/logo_minam.png"
          alt="Perú - Ministerio del Ambiente"
          class="sm:h-10 h-8.5"
        />

        <!-- IGP -->
        <img
          v-if="!showLight"
          src="/dark-igp.webp"
          alt="IGP"
          class="sm:h-10 h-8"
        />
        <img
          v-else
          src="/logo_igp.png"
          alt="IGP"
          class="sm:h-10 h-8"
        />
      </div>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <template v-for="link in navLinks" :key="link.to">
          <!-- Disabled link -->
          <span
            v-if="link.disabled"
            class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed select-none"
          >
            {{ link.label }}
          </span>
          <!-- Active link -->
          <router-link
            v-else
            :to="link.to"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="
              (route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)))
                ? (showLight ? 'bg-slate-100 text-igp-blue font-bold rounded-lg' : 'bg-white/15 text-white font-bold')
                : (showLight ? 'text-gray-600 hover:text-igp-blue' : 'text-white/80 hover:text-white hover:bg-white/10')
            "
          >
            {{ link.label }}
          </router-link>
        </template>
      </nav>

      <!-- Right side placeholder -->
      <div class="hidden lg:block w-20" />

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-lg transition-colors"
        :class="showLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <AppIcon :name="mobileMenuOpen ? 'x' : 'menu'" :size="24" />
      </button>
    </div>

    <!-- Mobile Nav -->
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
        class="md:hidden absolute top-16 left-0 right-0 shadow-xl"
        :class="showLight ? 'bg-white border-t border-gray-200' : 'bg-igp-blue-900 border-t border-white/10'"
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
              class="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              :class="
                (route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)))
                  ? (showLight ? 'bg-slate-100 text-igp-blue' : 'bg-white/15 text-white')
                  : (showLight ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300 hover:text-white hover:bg-white/10')
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
