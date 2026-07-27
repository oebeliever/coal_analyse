import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: '/moisture',
  },
  {
    path: '/',
    redirect: '/moisture',
  },
  {
    path: '/moisture',
    name: 'Moisture',
    component: () => import('@/views/Moisture.vue'),
    meta: { title: '水分测定' },
  },
  {
    path: '/ash',
    name: 'Ash',
    component: () => import('@/views/Ash.vue'),
    meta: { title: '灰分测定' },
  },
  {
    path: '/volatile',
    name: 'Volatile',
    component: () => import('@/views/Volatile.vue'),
    meta: { title: '挥发分测定' },
  },
  {
    path: '/reference',
    name: 'Reference',
    component: () => import('@/views/Reference.vue'),
    meta: { title: '标准参考' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
