import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import * as path from "path"

export default defineConfig({
  test: {
    globals: true
  }
})
