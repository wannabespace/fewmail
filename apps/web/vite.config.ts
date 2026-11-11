import process from 'node:process'

import { setupPortlessEnvs } from '@fewmail/shared/portless-env'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

setupPortlessEnvs({ API_URL: 'api.local.fewmail' })

export default defineConfig({
  envDir: '../..',
  envPrefix: ['VITE_', 'API_URL'],
  plugins: [
    tailwindcss(),
    tanstackRouter({
      autoCodeSplitting: true,
      generatedRouteTree: 'src/routeTree.gen.ts',
      routesDirectory: 'src/routes',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  preview: {
    allowedHosts: ['fewmail.app'],
    host: true,
    port: Number(process.env.PORT) || undefined,
  },
  resolve: { tsconfigPaths: true },
})
