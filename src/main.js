import Vue from 'vue'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import api from './plugins/request.js'
import App from './App'
import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap, { ak: '4bXcXxVicWQAuBnXwkfZDykL', })

// 阻止启动生产消息
Vue.config.productionTip = false
Vue.prototype.$api = api
new Vue({
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')
