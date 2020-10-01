import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Site from '../views/Site.vue'


const routes = [
  {
    path: '/brainstorm',
    name: 'Brainstorm',
    component: () => import(/* webpackChunkName: "brainstorm" */ '../views/Brainstorm.vue')
  },
  {
    path: '/',
    name: 'Site',
    component: Site,
    children: [
      {
        path: '/',
        name: 'Home',
        component: Home,},
      {
        path: '/about',
        name: 'About',
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
      },
      {
        path: '/projects',
        name: 'Projects',
        component: () => import(/* webpackChunkName: "projects" */ '../views/Projects.vue')
      },
      {
        path: '/contact',
        name: 'Contact',
        component: () => import(/* webpackChunkName: "contact" */ '../views/Contact.vue')
      },

      {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: () => import(/* webpackChunkName: "not found" */ '../views/NotFound.vue')
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
