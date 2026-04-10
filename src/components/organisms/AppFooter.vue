<script setup>
</script>

<template>
  <footer class="bg-[#283343] text-slate-300 pt-10 md:pt-16 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 mb-10 md:mb-16">
        <!-- Col 1: Brand -->
        <div class="space-y-6">
          <img
            src="/logos/dark-igp.webp"
            alt="IGP Logo"
            class="h-12 w-auto brightness-0 invert"
          />
          <div
            class="text-sm space-y-1 font-medium tracking-wide opacity-80 text-igp-white"
          >
            <p>Ciencia para <span class="font-semibold">protegernos</span>,</p>
            <p>Ciencia para <span class="font-bold">avanzar</span>.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <!-- Facebook -->
            <a
              href="https://www.facebook.com/igp.peru"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  d="M504 256C504 119 393 8 256 8S8 119 8 256c0 121.1 87.7 221.7 203.4 240.2v-170h-61.2v-70.2h61.2v-53.1c0-60.6 36-94.1 91.3-94.1 26.5 0 53.9 4.8 53.9 4.8v59.3h-30.4c-30.1 0-39.6 18.7-39.6 37.9v45.2h67l-10.7 70.2h-56.3v170c115.7-18.6 203.4-119.1 203.4-240.2z"
                />
              </svg>
            </a>
            <!-- X (Twitter) -->
            <a
              href="https://twitter.com/igp_peru"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                />
              </svg>
            </a>
            <!-- Instagram -->
            <a
              href="https://www.instagram.com/igp.peru/"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                />
              </svg>
            </a>
            <!-- LinkedIn -->
            <a
              href="https://www.linkedin.com/company/igpperuoficial/"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
                />
              </svg>
            </a>
            <!-- YouTube -->
            <a
              href="https://www.youtube.com/igp_videos"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
              >
                <path
                  d="M549.655 124.396c-4.735-31.294-28-55.934-58.46-60.835C438.406 54.395 288 54.395 288 54.395s-150.406 0-203.195 9.166c-30.46 4.901-53.725 29.541-58.46 60.835C16.94 179.313 16.94 256 16.94 256s0 76.688 9.394 131.604c4.735 31.294 28 55.934 58.46 60.835C137.594 457.605 288 457.605 288 457.605s150.406 0 203.195-9.166c30.46-4.901 53.725-29.541 58.46-60.835C559.06 332.688 559.06 256 559.06 256s0-76.687-9.394-131.604zM232 337.747V174.253l144 81.747L232 337.747z"
                />
              </svg>
            </a>
            <!-- TikTok -->
            <a
              href="https://www.tiktok.com/@igp_peru"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"
                />
              </svg>
            </a>
            <!-- WhatsApp -->
            <a
              href="https://whatsapp.com/channel/0029Va4K0PZ5a245NkngBA2M"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                />
              </svg>
            </a>
            <!-- Flickr -->
            <a
              href="https://www.flickr.com/people/156092703@N08/"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all duration-300"
            >
              <svg
                class="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path
                  d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM144.5 319c-35.1 0-63.5-28.4-63.5-63.5s28.4-63.5 63.5-63.5 63.5 28.4 63.5 63.5-28.4 63.5-63.5 63.5zm159 0c-35.1 0-63.5-28.4-63.5-63.5s28.4-63.5 63.5-63.5 63.5 28.4 63.5 63.5-28.4 63.5-63.5 63.5z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Contact -->
        <div>
          <h4
            class="text-white font-bold text-sm tracking-widest mb-6 uppercase"
          >
            Contáctanos
          </h4>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <div class="w-8 flex justify-center mt-1">
                <svg
                  class="w-5 h-5 text-white/90"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    fill="currentColor"
                    d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"
                  />
                </svg>
              </div>
              <div class="text-sm">
                <span class="block text-white/90"
                  >Calle Calatrava N° 216, Urb. Camino Real</span
                >
                <span class="block text-white/90">La Molina - Lima - Perú</span>
              </div>
            </li>
            <li class="flex items-center gap-3">
              <div class="w-8 flex justify-center">
                <svg
                  class="w-5 h-5 text-white/90"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"
                  />
                </svg>
              </div>
              <a
                href="mailto:comunicacione@igp.gob.pe"
                class="text-sm hover:text-white transition-colors"
                >comunicacione@igp.gob.pe</a
              >
            </li>
            <li class="flex items-center gap-3">
              <div class="w-8 flex justify-center">
                <svg
                  class="w-5 h-5 text-white/90"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"
                  />
                </svg>
              </div>
              <a
                href="tel:5154369212"
                class="text-sm hover:text-white transition-colors"
                >(51) 54 369212</a
              >
            </li>
          </ul>
        </div>

        <!-- Col 3: Links -->
        <div>
          <h4
            class="text-white font-bold text-sm tracking-widest mb-6 uppercase"
          >
            Enlaces de interés
          </h4>
          <ul class="space-y-3">
            <li>
              <a
                href="#"
                class="text-sm flex items-center gap-2 hover:text-white transition-colors group"
                ><span
                  class="text-slate-500 group-hover:text-white transition-colors"
                  >›</span
                >
                Consultas del ciudadano</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-sm flex items-center gap-2 hover:text-white transition-colors group"
                ><span
                  class="text-slate-500 group-hover:text-white transition-colors"
                  >›</span
                >
                Reporte de inquietudes</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-sm flex items-center gap-2 hover:text-white transition-colors group"
                ><span
                  class="text-slate-500 group-hover:text-white transition-colors"
                  >›</span
                >
                Denuncias de corrupción</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-sm flex items-center gap-2 hover:text-white transition-colors group"
                ><span
                  class="text-slate-500 group-hover:text-white transition-colors"
                  >›</span
                >
                Certificaciones ISO's</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-sm flex items-center gap-2 hover:text-white transition-colors group"
                ><span
                  class="text-slate-500 group-hover:text-white transition-colors"
                  >›</span
                >
                Portal de transparencia</a
              >
            </li>
          </ul>
        </div>

        <!-- Col 4: Apps -->
        <div class="pt-2">
          <h4
            class="text-white font-bold text-sm tracking-widest mb-6 uppercase"
          >
            Descarga nuestra App
          </h4>
          <div class="flex flex-col gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=app.igps.igpservicios&hl=es_PE"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-4 bg-transparent hover:bg-white/5 border border-slate-600 hover:border-slate-400 rounded-lg px-4 py-2.5 transition-all group w-full max-w-[240px]"
            >
              <div class="w-6 h-6 flex items-center justify-center shrink-0">
                <!-- Play Store Icon -->
                <svg
                  class="w-5 h-5 fill-current text-white"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                  />
                </svg>
              </div>
              <div class="leading-tight">
                <span
                  class="block text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-slate-300"
                  >DISPONIBLE EN</span
                >
                <span class="block text-sm font-bold text-white"
                  >Google Play</span
                >
              </div>
            </a>

            <a
              href="https://apps.apple.com/pe/app/igp/id6748286605"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-4 bg-transparent hover:bg-white/5 border border-slate-600 hover:border-slate-400 rounded-lg px-4 py-2.5 transition-all group w-full max-w-[240px]"
            >
              <div class="w-6 h-6 flex items-center justify-center shrink-0">
                <!-- Apple Icon -->
                <svg
                  class="w-5 h-5 fill-current text-white"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.37 12.36,4.26 13,3.5Z"
                  />
                </svg>
              </div>
              <div class="leading-tight">
                <span
                  class="block text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-slate-300"
                  >DESCARGA EN</span
                >
                <span class="block text-sm font-bold text-white"
                  >App Store</span
                >
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    <!-- Copyright -->
    <div
      class="mt-8 md:mt-16 py-6 border-t bg-[#1F2937] border-slate-700/50 text-sm  text-igp-white"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left"
      >
        <p>
          &copy; {{ new Date().getFullYear() }} Instituto Geofísico del Perú.
          Todos los derechos reservados.
        </p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-slate-300 transition-colors text-xs"
            >Política de privacidad</a
          >
          <a href="#" class="hover:text-slate-300 transition-colors text-xs"
            >Términos de uso</a
          >
          <a href="#" class="hover:text-slate-300 transition-colors text-xs"
            >Accesibilidad</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
