<script setup>
import AlertBox from '@/components/molecules/AlertBox.vue'
import AppIcon from '@/components/atoms/AppIcon.vue'
import InfoCard from '@/components/molecules/InfoCard.vue'
</script>

<template>
  <div class="space-y-8">
    <!-- Intro -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-3">Operaciones Vectoriales en Sismología</h3>
      <p class="text-gray-600 leading-relaxed">
        En la localización sísmica, se utilizan conceptos vectoriales para determinar
        la dirección y posición del epicentro. Cada estación sísmica define un círculo
        de distancia alrededor de su ubicación, y la intersección de múltiples círculos
        permite triangular el epicentro.
      </p>
    </div>

    <!-- Concept cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoCard
        icon="compass"
        title="Vectores de Posición"
        description="Cada estación sísmica tiene una posición (lat, lon) que se expresa como un vector. La distancia epicentral define un radio desde esa posición."
      />
      <InfoCard
        icon="target"
        title="Triangulación"
        description="Con al menos 3 estaciones, los círculos de distancia se intersecan en un punto que corresponde al epicentro del evento."
      />
      <InfoCard
        icon="layers"
        title="Componentes del Vector"
        description="En coordenadas cartesianas, la posición se descompone en componentes Norte (Y) y Este (X) para simplificar los cálculos numéricos."
      />
      <InfoCard
        icon="git-branch"
        title="Diferencias Vectoriales"
        description="La diferencia entre vectores de posición de estaciones permite establecer las ecuaciones del sistema para resolver la localización."
      />
    </div>

    <!-- Triangulation visual -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-4 flex items-center gap-2">
        <AppIcon name="target" :size="20" class="text-igp-sky-blue-600" />
        Principio de Triangulación
      </h3>

      <!-- SVG illustration -->
      <div class="bg-gray-50 rounded-xl p-6 flex justify-center mb-4">
        <svg viewBox="0 0 400 300" class="w-full max-w-md" xmlns="http://www.w3.org/2000/svg">
          <!-- Grid -->
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />

          <!-- Station circles -->
          <circle cx="100" cy="120" r="90" fill="none" stroke="#0099ff" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.5" />
          <circle cx="280" cy="100" r="110" fill="none" stroke="#ff8d3a" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.5" />
          <circle cx="200" cy="250" r="100" fill="none" stroke="#04b363" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.5" />

          <!-- Station markers -->
          <circle cx="100" cy="120" r="6" fill="#0099ff" />
          <text x="75" y="110" font-size="10" fill="#00214f" font-weight="bold">EST-1</text>

          <circle cx="280" cy="100" r="6" fill="#ff8d3a" />
          <text x="255" y="90" font-size="10" fill="#00214f" font-weight="bold">EST-2</text>

          <circle cx="200" cy="250" r="6" fill="#04b363" />
          <text x="175" y="275" font-size="10" fill="#00214f" font-weight="bold">EST-3</text>

          <!-- Epicenter -->
          <circle cx="190" cy="150" r="8" fill="#e20000" opacity="0.3" />
          <circle cx="190" cy="150" r="4" fill="#e20000" />
          <text x="200" y="145" font-size="10" fill="#e20000" font-weight="bold">Epicentro</text>

          <!-- Distance vectors (dashed) -->
          <line x1="100" y1="120" x2="190" y2="150" stroke="#0099ff" stroke-width="1" stroke-dasharray="4,2" />
          <line x1="280" y1="100" x2="190" y2="150" stroke="#ff8d3a" stroke-width="1" stroke-dasharray="4,2" />
          <line x1="200" y1="250" x2="190" y2="150" stroke="#04b363" stroke-width="1" stroke-dasharray="4,2" />

          <!-- Distance labels -->
          <text x="130" y="125" font-size="9" fill="#0099ff">D₁</text>
          <text x="235" y="118" font-size="9" fill="#ff8d3a">D₂</text>
          <text x="205" y="205" font-size="9" fill="#04b363">D₃</text>
        </svg>
      </div>

      <p class="text-sm text-gray-600 leading-relaxed">
        Cada estación (EST-1, EST-2, EST-3) establece un círculo cuyo radio es la distancia epicentral
        calculada a partir de la diferencia S-P. El epicentro se ubica en la intersección de los tres círculos.
      </p>
    </div>

    <!-- Mathematical concept -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 class="text-lg font-bold text-igp-blue mb-4">Formulación Matemática</h3>
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 mb-2">Ecuación del Círculo para cada estación:</p>
          <p class="font-mono text-center text-igp-blue font-semibold">
            (x - xᵢ)² + (y - yᵢ)² = Dᵢ²
          </p>
        </div>
        <div class="bg-gray-50 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 mb-2">Donde:</p>
          <ul class="space-y-1 text-sm text-gray-600">
            <li><span class="font-mono font-semibold">(x, y)</span> = Coordenadas del epicentro (incógnita)</li>
            <li><span class="font-mono font-semibold">(xᵢ, yᵢ)</span> = Coordenadas de la estación i</li>
            <li><span class="font-mono font-semibold">Dᵢ</span> = Distancia epicentral desde la estación i</li>
          </ul>
        </div>
        <div class="bg-gray-50 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 mb-2">Sistema de ecuaciones (restando pares):</p>
          <p class="font-mono text-center text-igp-blue font-semibold text-sm">
            2(x₂ - x₁)x + 2(y₂ - y₁)y = D₁² - D₂² + x₂² - x₁² + y₂² - y₁²
          </p>
        </div>
      </div>
    </div>

    <AlertBox icon="info" variant="tip">
      <p class="font-semibold mb-1">Nota</p>
      <p>
        En la práctica, estos cálculos se realizan con software especializado que utiliza
        métodos iterativos de mínimos cuadrados. Aquí presentamos la base teórica para
        entender el proceso de localización.
      </p>
    </AlertBox>
  </div>
</template>
