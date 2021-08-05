import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    { name: '谷歌地图', path: '/', component: () => import('../pages/LeafletGoogleMap'), },
    { name: '文件浏览', path: '/browser', component: () => import('../pages/NginxBrowser'), },
  ],
})
