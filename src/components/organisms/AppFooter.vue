<script setup>
</script>

<template>
  <footer class="bg-igp-dark-blue-500 text-white py-8">
    <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <img src="/logo_igp.png" alt="Logo IGP" class="h-10 w-auto" />
            <div>
              <p class="font-bold text-sm">Instituto Geofísico del Perú</p>
              <p class="text-xs text-gray-300">Dirección de Ciencias y Tecnologías Sismológicas</p>
            </div>
          </div>
          <p class="text-xs text-gray-400 leading-relaxed">
            Plataforma formativa para la capacitación de operadores sísmicos.
            Aprende a analizar, interpretar y reportar eventos sísmicos de manera profesional.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold text-sm mb-3">Enlaces</h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-xs text-gray-300 hover:text-white transition-colors">
                Inicio
              </router-link>
            </li>
            <li>
              <router-link to="/guia" class="text-xs text-gray-300 hover:text-white transition-colors">
                Guía del Operador Sísmico
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-semibold text-sm mb-3">Contacto</h4>
          <ul class="space-y-2 text-xs text-gray-300">
            <li>Calle Badajoz 169, Mayorazgo IV Etapa</li>
            <li>Ate, Lima - Perú</li>
            <li>
              <a href="https://www.igp.gob.pe" target="_blank" class="hover:text-white transition-colors">
                www.igp.gob.pe
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <p class="text-xs text-gray-400">
          &copy; {{ new Date().getFullYear() }} Instituto Geofísico del Perú. Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-3">
          <img src="/logo_minam.png" alt="MINAM" class="h-7 w-auto opacity-70" />
        </div>
      </div>
    </div>
  </footer>
</template>
