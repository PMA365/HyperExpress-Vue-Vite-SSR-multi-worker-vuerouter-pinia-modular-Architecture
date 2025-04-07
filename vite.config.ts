import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";// for recognising .vue format files

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), sentryVitePlugin({
        org: "freelancer-0vv",
        project: "hyperexpress-vite-ssr"
    })],

    build: {
        sourcemap: true
    }
});