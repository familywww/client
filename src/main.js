import Vue from 'vue'
import KeepRatio from 'vue-keep-ratio'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import api from './plugins/request.js'
import App from './App'

// 阻止启动生产消息
Vue.config.productionTip = false
// Vue 保持 Dom 元素宽高比例
Vue.use(KeepRatio)
Vue.prototype.$api = api
new Vue({
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')
