import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ai-uni',
  plugins: [react()],
  server: {
    allowedHosts: ['ai-uni-your-app-name.fly.dev', 'localhost', '127.0.0.1'],
  },
});
