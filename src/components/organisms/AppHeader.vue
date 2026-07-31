<script setup>
</script>

<template>
  <header
    class="h-14 shrink-0 z-50 bg-white border-b border-slate-200"
  >
    <div class="h-full px-4 lg:px-5 flex items-center gap-3">

      <!-- Logos -->
      <div class="flex items-center gap-3 shrink-0">
        <img
          src="/logo_minam.png"
          alt="Perú - Ministerio del Ambiente"
          class="h-9 object-contain"
        />
        <img
          src="/logo_igp.png"
          alt="IGP"
          class="h-8 object-contain"
        />
      </div>

      <!-- Separator -->
      <div class="h-7 w-px bg-gray-200 shrink-0" />

      <!-- App title -->
      <p class="hidden sm:block text-base sm:text-lg font-medium text-igp-blue truncate">
        <span class="font-semibold"> OSIDI:</span> Operador Sísmico Digital IGP
      </p>

      <div class="flex-1" />
    </div>

  </header>
</template>
