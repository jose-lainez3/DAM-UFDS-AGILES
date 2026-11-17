const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // Solo la edición GitHub Pages utiliza el prefijo /DAM-UFDS-AGILES/admin/.
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/'
})
