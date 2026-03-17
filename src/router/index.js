import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/guia',
    name: 'Guide',
    component: () => import('@/views/GuideView.vue'),
    meta: { layout: 'guide' },
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.APP_BASE || '/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
