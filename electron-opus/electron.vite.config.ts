import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    root: resolve("../frontend"),
    build: {
      rollupOptions: {
        input: resolve("../frontend/index.html"),
      },
    },
    resolve: {
      alias: {
        "@": resolve("../frontend/src"),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
