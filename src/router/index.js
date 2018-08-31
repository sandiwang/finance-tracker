import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import firebase from 'firebase'
import NotFound from '@/pages/NotFound'

const routerOptions = [
  { path: '/', component: 'Landing' },
  { path: '/signin', component: 'Signin' },
  { path: '/signup', component: 'Signup' },
  { path: '/profile', component: 'Profile', meta: { equiresAuth: true } },
  { path: '/home', component: 'Home', meta: { requiresAuth: true } },
  { path: '/spendings', component: 'Spendings', meta: { requiresAuth: true } },
  { path: '/summary', component: 'Summary', meta: {requiresAuth: true } },
  { path: '/deposit', component: 'Deposit', meta: {requiresAuth: true} },
  { path: '/bills', component: 'Bills', meta: {requiresAuth: true} },
  { path: '/coins/:id', component: 'Coins'}
]

const routes = routerOptions.map(route => {
  return {
    path: route.path,
    component: () => import(`@/pages/${route.component}.vue`),
    meta: route.meta
  }
})

Vue.use(Router)
Vue.use(Meta)

const router = new Router({
  mode: 'history',
  routes: [
    ...routes,
    { path: '*', component: NotFound }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
        // , offset: { x: 0, y: 10 }
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const user = firebase.auth().currentUser
  
  if (requiresAuth && !user) {
    next('/signin')
  } else if (to.path === '/' && from.path === '/' && user) {
    next('/home')
  }
  next()
})

export default router
