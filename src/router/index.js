import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/reportes',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { 
      layout: 'default',
      title: 'Inicio' 
    },
  },
  {
    path: '/guia',
    name: 'Guide',
    component: () => import('@/views/GuideView.vue'),
    meta: { 
      layout: 'guide',
      title: 'Guía de Usuario' 
    },
    children: [
      {
        path: '',
        redirect: { name: 'GuideStep', params: { step: '1' } },
      },
      {
        path: 'paso-:step(\\d+)',
        name: 'GuideStep',
        component: () => import('@/views/guide/StepContent.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/reportes',
    name: 'Reports',
    component: () => import('@/views/ReportView.vue'),
    meta: { 
      layout: 'report',
      title: 'Reportes Sísmicos' 
    },
  },
]

const router = createRouter({
  // Usamos el BASE_URL que viene de Vite según tu .env
  history: createWebHistory(import.meta.env.VITE_APP_BASE || '/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Guard para actualizar el título de la página dinámicamente
router.beforeEach((to, from, next) => {
  const baseTitle = 'IGP | Operador de Reportes Sismicos - OSIRI'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
  next()
})

export default router