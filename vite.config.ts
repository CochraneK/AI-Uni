import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ai-uni',
  plugins: [react()],
  server: {
    allowedHosts: ['ai-uni-your-app-name.fly.dev', 'localhost', '127.0.0.1'],
  },
});
