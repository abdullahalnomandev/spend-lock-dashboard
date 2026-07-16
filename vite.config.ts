import { defineConfig } from 'vite'
// @ts-ignore
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
// @ts-ignore
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Expose server to network for external access
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
