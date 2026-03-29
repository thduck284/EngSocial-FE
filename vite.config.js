import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, 'src')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useDevHttps =
    env.VITE_USE_DEV_HTTPS === '1' ||
    env.VITE_USE_DEV_HTTPS === 'true'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      ...(useDevHttps ? { https: true } : {}),
    },
    resolve: {
      alias: {
        '@': srcDir,
        '@data': path.resolve(srcDir, 'data'),
        '@vocabulary': path.resolve(srcDir, 'data/vocabulary'),
      },
    },
  }
})
