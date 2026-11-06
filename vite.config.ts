import { defineConfig, loadEnv } from "vite";
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
  '/experience',
  '/about',
  '/services',
  '/contact',
  '/privacy',
  '/stories'
];

/** Published, non-system Story URLs for the sitemap; build continues without them if the database is unreachable. */
async function storyRoutes(env: Record<string, string>): Promise<string[]> {
  const url = env.VITE_SUPABASE_URL; const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/gallery_stories?select=slug,status,is_system&status=eq.published`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) return [];
    const rows = (await res.json()) as { slug: string | null; status: string; is_system: boolean | null }[];
    return rows.filter((r) => r.status === 'published' && !r.is_system && r.slug).map((r) => `/stories/${r.slug}`);
  } catch { return []; }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const stories = mode === "development" ? [] : await storyRoutes(env);
  return {
  //// Use root-relative asset paths in all environments
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: 'https://jimmyhada.com',
      dynamicRoutes: [...routes, ...stories],
      readable: true,
      changefreq: 'weekly',
      priority: 0.8,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // the mozjpeg wasm binary must be served as-is, not pre-bundled
  optimizeDeps: {
    exclude: ["@jsquash/jpeg"],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
};
});
