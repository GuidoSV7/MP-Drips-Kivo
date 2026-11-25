import { defineConfig } from 'vitest/config'

// Vitest 3 bundles its own Vite, which does not apply @vitejs/plugin-react 6's JSX transform.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
})
