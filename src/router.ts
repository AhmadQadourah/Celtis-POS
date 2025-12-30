import { createRouter, createWebHistory } from 'vue-router'
import SellView from './views/SellView.vue'
import ParkedView from './views/ParkedView.vue'
import HistoryView from './views/HistoryView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/sell' },
    { path: '/sell', component: SellView },
    { path: '/parked', component: ParkedView },
    { path: '/history', component: HistoryView },
  ],
})

export default router


