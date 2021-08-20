import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    { name: 'vue地图', path: '/', component: () => import('../pages/LeafletMap'), },
    { name: '传单地图', path: '/leaflet', component: () => import('../pages/LeafletNativeMap'), },
    { name: '百度地图', path: '/baidu', component: () => import('../pages/BaiduMap'), },
    { name: '文件浏览', path: '/browser', component: () => import('../pages/NginxBrowser'), },
  ],
})
