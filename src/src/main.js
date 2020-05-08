import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import nprogress from 'nprogress'
import './plugins/querydata.js'

axios.defaults.baseURL = 'http://127.0.0.1:5000'

// 添加请求拦截
axios.interceptors.request.use(config => {
  nprogress.start()
  var tokenRes = JSON.parse(window.sessionStorage.getItem('token'))
  if (tokenRes) {
    config.headers.Authorization = 'Bearer ' + tokenRes.access_token
  }
  return config
})

// 添加响应拦截器
axios.interceptors.response.use(
  function(response) {
    nprogress.done()
    // 对响应数据做点什么
    var data = response.data
    return data
  },
  function(error) {
    nprogress.done()
    console.debug(error)
    // 对响应错误做点什么
    // eslint-disable-next-line prefer-promise-reject-errors
    return null
  }
)

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
