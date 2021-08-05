import Vue from 'vue'
import router from './router/index'
import App from './App'
import vuetify from './plugins/vuetify'
import api from './plugins/request.js'
import KeepRatio from 'vue-keep-ratio'

Vue.config.productionTip = false
Vue.use(KeepRatio)
Vue.prototype.$api = api
new Vue({
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')
