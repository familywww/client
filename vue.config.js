console.log('BASE_API: ' + process.env.VUE_APP_BASE_API)
console.log('OUTPUT_DIR: ' + process.env.VUE_APP_OUTPUT_DIR)
module.exports = {
  publicPath: "/client",
  outputDir: process.env.VUE_APP_OUTPUT_DIR,
  assetsDir: "./aassets",
  devServer: {
    port: 81,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '^/': {
        target:  process.env.VUE_APP_BASE_API,
        changeOrigin: true,
        pathRewrite: {
          '^/': '/api'
        }
      },
    }
  },
  transpileDependencies: [
    "vuetify"
  ]
}
