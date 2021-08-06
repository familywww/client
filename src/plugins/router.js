import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    { name: '谷歌地图', path: '/', component: () => import('../pages/LeafletMap.vue'), },
    { name: '百度地图', path: '/baidu', component: () => import('../pages/LeafletBaiduMap'), },
    { name: '文件浏览', path: '/browser', component: () => import('../pages/NginxBrowser'), },
  ],
})
