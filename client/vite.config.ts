import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import * as path from "path"

export default defineConfig({
  assetsInclude: ["src/assets/**/*.png"],
  test: {
    globals: true,
    setupFiles: ["./setupFilesAfterEnv.ts"]
  },
  plugins: [react()],
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
