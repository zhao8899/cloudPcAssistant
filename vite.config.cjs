const { defineConfig, loadEnv } = require('vite')
const uni = require('@dcloudio/vite-plugin-uni').default
const uniRouter = require('unplugin-uni-router/vite').default
const path = require('path')

module.exports = defineConfig(({ mode }) => {
    const env = loadEnv(mode, path.resolve(__dirname), '')

    return {
        plugins: [uni(), uniRouter()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },
        define: {
            'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || mode),
            'process.env.UNI_PLATFORM': JSON.stringify(process.env.UNI_PLATFORM || 'h5')
        }
    }
})
