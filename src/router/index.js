import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Gear from '@/components/Gear.vue'
import Timeline from '@/components/Timeline.vue'
import GuildCard from '@/components/GuildCard.vue'
import HuntingPhotography from '@/components/HuntingPhotography.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/gear',
    name: 'Gear',
    component: Gear,
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: Timeline,
  },
  {
    path: '/guildcard',
    name: 'GuildCard',
    component: GuildCard,
  },
  {
    path: '/photography',
    name: 'Photography',
    component: HuntingPhotography,
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
