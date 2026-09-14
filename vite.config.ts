import { defineConfig } from 'vite';

// Vite/esbuild can compile this React + TSX application without the optional
// @vitejs/plugin-react package. Keeping the base build independent of that
// development-only plugin also makes the repository's historical lockfile less
// fragile in CI. We can re-enable Fast Refresh tooling later after refreshing
// the dependency lock cleanly.
export default defineConfig({
  base: '/ai-uni',
  server: {
    allowedHosts: ['ai-uni-your-app-name.fly.dev', 'localhost', '127.0.0.1'],
  },
});
