import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import UserIndex from '../components/User/Index.vue'
import AppIndex from '../components/App/AppIndex.vue'
import AppOperation from '../components/App/AppOperation.vue'
import AppModule from '../components/App/AppModule.vue' // UserGroupIndex
import RoleIndex from '../components/Role/RoleIndex.vue'
import UserGroupIndex from '../components/UserGroup/UserGroupIndex.vue'
import OrgIndex from '../components/Org/OrgIndex.vue'

import ResourceIndex from '../components/Resource/ResourceIndex.vue'
import ResourceTypeIndex from '../components/Resource/ResourceTypeIndex.vue'

import DicItem from '../components/Setting/DicItem.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/userIndex',
        component: UserIndex
      },
      {
        path: '/AppIndex',
        component: AppIndex
      },
      {
        path: '/ResourceIndex',
        component: ResourceIndex
      },
      {
        path: '/ResourceTypeIndex',
        component: ResourceTypeIndex
      },
      {
        path: '/DicItem',
        component: DicItem
      },
      {
        path: '/AppOperation',
        component: AppOperation
      },
      {
        path: '/AppModule',
        component: AppModule
      },
      {
        path: '/RoleIndex',
        component: RoleIndex
      },
      {
        path: '/UserGroupIndex',
        component: UserGroupIndex
      },
      {
        path: '/orgIndex',
        component: OrgIndex
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, form, next) => {
  const token = window.sessionStorage.getItem('token')
  console.log(to)
  if (to.path !== '/login') {
    if (token === undefined || token === null) {
      return next('/login')
    }
  }
  return next()
})

export default router
