import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  },
  resolve: {
    alias: [
      {find: "@shared", replacement: path.resolve(__dirname, "../shared")}
    ],
},
})
