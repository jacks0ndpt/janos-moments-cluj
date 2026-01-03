import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";

// Define routes for sitemap generation
const routes = [
  '/',
  '/portfolio',
  '/portfolio/weddings',
  '/portfolio/events',
  '/about',
  '/services',
  '/contact',
  '/privacy'
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      jsxruntime: "automatic",
    }),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: 'https://janoshada.com',
      dynamicRoutes: routes,
      readable: true,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
}));
