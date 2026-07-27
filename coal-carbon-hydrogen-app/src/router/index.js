import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: '/carbon',
  },
  {
    path: '/',
    redirect: '/carbon',
  },
  {
    path: '/carbon',
    name: 'Carbon',
    component: () => import('@/views/Carbon.vue'),
    meta: { title: '碳测定' },
  },
  {
    path: '/hydrogen',
    name: 'Hydrogen',
    component: () => import('@/views/Hydrogen.vue'),
    meta: { title: '氢测定' },
  },
  {
    path: '/furnace',
    name: 'Furnace',
    component: () => import('@/views/Furnace.vue'),
    meta: { title: '炉布局' },
  },
  {
    path: '/blank',
    name: 'Blank',
    component: () => import('@/views/Blank.vue'),
    meta: { title: '空白值' },
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
