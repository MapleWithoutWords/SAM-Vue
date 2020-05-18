import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () =>
  import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
const Home = () =>
  import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
const Welcome = () =>
  import(
    /* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue'
  )

const UserIndex = () =>
  import(/* webpackChunkName:"user_org" */ '../components/User/Index.vue')
const OrgIndex = () =>
  import(/* webpackChunkName:"user_org" */ '../components/Org/OrgIndex.vue')

const AppIndex = () =>
  import(/* webpackChunkName:"app_role" */ '../components/App/AppIndex.vue')
const AppModule = () =>
  import(/* webpackChunkName:"app_role" */ '../components/App/AppModule.vue')
const AppOperation = () =>
  import(/* webpackChunkName:"app_role" */ '../components/App/AppOperation.vue')
const RoleIndex = () =>
  import(/* webpackChunkName:"app_role" */ '../components/Role/RoleIndex.vue')
const UserGroupIndex = () =>
  import(
    /* webpackChunkName:"app_role" */ '../components/UserGroup/UserGroupIndex.vue'
  )

const ResourceIndex = () =>
  import(
    /* webpackChunkName:"resource_setting" */ '../components/Resource/ResourceIndex.vue'
  )
const ResourceTypeIndex = () =>
  import(
    /* webpackChunkName:"resource_setting" */ '../components/Resource/ResourceTypeIndex.vue'
  )
const DicItem = () =>
  import(
    /* webpackChunkName:"resource_setting" */ '../components/Setting/DicItem.vue'
  )

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
  if (to.path === '/login') {
    if (token) {
      return next('/home')
    }
  }

  console.log(to)
  if (to.path !== '/login') {
    if (token === undefined || token === null) {
      return next('/login')
    }
  }
  return next()
})

export default router
