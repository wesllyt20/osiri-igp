<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/atoms/AppIcon.vue'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Guía Operador Sísmico', to: '/guia' },
]
</script>

<template>
  <header class="bg-igp-dark-blue-500 text-white h-16 flex-shrink-0 sticky top-0 z-50 shadow-lg">
    <div class="h-full max-w-screen-2xl mx-auto px-4 lg:px-6 flex items-center justify-between">
      <!-- Logo + Brand -->
      <router-link to="/" class="flex items-center gap-3 group">
        <img
          src="/logo_igp.png"
          alt="Logo IGP"
          class="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
        />
        <div class="hidden sm:block leading-tight">
          <p class="text-sm font-bold tracking-wide">IGP</p>
          <p class="text-[10px] text-gray-300 font-medium">Instituto Geofísico del Perú</p>
        </div>
      </router-link>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="
            route.path === link.to || route.path.startsWith(link.to + '/')
              ? 'bg-white/15 text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          "
        >
          {{ link.label }}
        </router-link>
      </nav>

      <!-- MINAM Logo -->
      <div class="hidden lg:flex items-center gap-3">
        <img
          src="/logo_minam.png"
          alt="Logo MINAM"
          class="h-9 w-auto opacity-90"
        />
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
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
        class="md:hidden absolute top-16 left-0 right-0 bg-igp-dark-blue-600 border-t border-white/10 shadow-xl"
      >
        <nav class="p-4 flex flex-col gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            :class="
              route.path === link.to
                ? 'bg-white/15 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            "
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </router-link>
        </nav>
      </div>
    </Transition>
  </header>
</template>
