import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/onechain-rpc': {
        target: 'https://rpc-testnet.onelabs.cc:443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/onechain-rpc/, ''),
        secure: false
      }
    }
  }
})
