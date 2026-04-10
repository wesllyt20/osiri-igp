<script setup>
import AppIcon from "@/components/atoms/AppIcon.vue";

defineProps({
  sticky: { type: Boolean, default: false },
});

const links = [
  { label: "Portal IGP", href: "https://www.igp.gob.pe", external: true },
  {
    label: "Servicios",
    href: "https://www.igp.gob.pe/servicios",
    external: true,
  },
  {
    label: "Epicentro IGP",
    href: "https://ultimosismo.igp.gob.pe",
    external: true,
  },
];
</script>

<template>
  <div
    class="bg-gray-50 border-b border-gray-200  z-40 py-1"
    :class="{ 'sticky top-16': sticky }"
  >
    <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
      <div class="flex items-center gap-0 h-6 text-xs">
        <router-link
          to="/"
          class="text-gray-500 hover:text-igp-blue transition-colors p-1"
        >
          <AppIcon name="home" :size="14" />
        </router-link>
        <template v-for="link in links" :key="link.label">
          <AppIcon name="chevron-right" :size="12" class="text-gray-300 mx-1" />
          <a
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="text-gray-500 hover:text-igp-blue transition-colors px-2 font-medium"
          >
            {{ link.label }}
          </a>
        </template>
      </div>
    </div>
  </div>
</template>
