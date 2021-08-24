import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  // mode: 'history',
  routes: [
    { name: '传单地图', meta: { requiresAuth: true, }, path: '/', component: () => import('../pages/LeafletMap'), },
    { name: '百度地图', meta: { requiresAuth: true, }, path: '/baidu', component: () => import('../pages/BaiduMap'), },
    { name: '文件浏览', meta: { requiresAuth: true, }, path: '/file', component: () => import('../pages/NginxBrowser'), },
  ],
})

// router.beforeEach((to, from, next) => {
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // this route requires auth, check if logged in
//     // if not, redirect to login page.
//     if (!auth.loggedIn()) {
//       next({
//         path: '/login',
//         query: { redirect: to.fullPath, },
//       })
//     } else {
//       next()
//     }
//   } else {
//     next() // 确保一定要调用 next()
//   }
// })
export default router
