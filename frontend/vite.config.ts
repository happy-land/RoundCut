import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
// import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // svgr({
    //   svgrOptions: {},
    // }),
  ],
  server: {
    // bind explicitly to 127.0.0.1 to avoid VPN network adapters intercepting localhost
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
});
