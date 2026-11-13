import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Հստակ նշում ենք, որ ռեսուրսները բեռնվեն արմատից (root)
})