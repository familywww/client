import axios from 'axios'
import qs from 'qs'

// 创建axios实例
const instance = axios.create()
instance.defaults.timeout = 30000
instance.defaults.baseURL = process.env.VUE_APP_BASE_API
instance.defaults.withCredentials = false // 表示跨域请求时候是否需要携带凭证
instance.interceptors.request.use(
  // config => {
  //   if (getToken()) {
  //     config.headers['Authorization'] = getToken()
  //   }
  //   config.headers['Content-Type'] = 'application/json'
  //   return config
  // },
  // error => {
  //   console.log(error) // for debug
  //   Promise.reject(error)
  // }
)
instance.interceptors.response.use(
  // response => {
  //   const code = response.status
  //   if (code < 200 || code > 300) {
  //     Notification.error({
  //       title: response.message
  //     })
  //     return Promise.reject('error')
  //   } else {
  //     return response.data
  //   }
  // },
  // error => {
  //   let code = 0
  //   try {
  //     code = error.response.data.status
  //   } catch (e) {
  //     if (error.toString().indexOf('Error: timeout') !== -1) {
  //       Notification.error({
  //         title: this.$t('util.timeOutMsg'),
  //         duration: 5000
  //       })
  //       return Promise.reject(error)
  //     }
  //   }
  //   if (code) {
  //     if (code === 401) {
  //       MessageBox.confirm(
  //         this.$t('util.reLoginMsg'),
  //         this.$t('util.systemNotice'),
  //         {
  //           confirmButtonText: this.$t('util.confirmButtonText'),
  //           cancelButtonText: this.$t('util.cancelButtonText'),
  //           type: 'warning'
  //         }
  //       ).then(() => {
  //         store.dispatch('LogOut').then(() => {
  //           location.reload()
  //         })
  //       })
  //     } else if (code === 403) {
  //       router.push({ path: '/401' })
  //     } else {
  //       const errorMsg = error.response.data.message
  //       if (errorMsg !== undefined) {
  //         Notification.error({
  //           title: errorMsg,
  //           duration: 5000
  //         })
  //       }
  //     }
  //   } else {
  //     Notification.error({
  //       title: this.$t('util.noticeTitle'),
  //       duration: 5000
  //     })
  //   }
  //   return Promise.reject(error)
  // }
)

export default {
  get: function (url) {
    return instance.get(url)
  },
  post: function (url, data) {
    return instance.post(url, qs.stringify(data))
  },
  upload: function (url, file, data) {
    let formData = new window.FormData()
    formData.append('file', file)
    if (data) {
      for (const i in data) {
        formData.append(i, data[i])
      }
    }
    return instance.post(url, formData)
  },
  pushTo: function (toData, responseData) {
    for (const key in toData) {
      if (responseData.hasOwnProperty(key)) {
        toData[key] = responseData[key]
      }
    }
    return toData
  },
}
