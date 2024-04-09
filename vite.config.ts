import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'snackbarMessage',
      formats: ['es'],
      fileName: (format) => `index.js`
    },
    rollupOptions: {
      // Externalize Vue to not bundle it with your plugin
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
