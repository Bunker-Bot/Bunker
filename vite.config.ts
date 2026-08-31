import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

function shareEntryDevPlugin(): Plugin {
  return {
    name: 'share-entry-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (req.url && (req.url.startsWith('/s/') || req.url.startsWith('/api/share-entry'))) {
            const mod = await server.ssrLoadModule('./api/share-entry.ts');
            return mod.default(req, res);
          }
          if (req.url && req.url.startsWith('/api/og/share')) {
            const mod = await server.ssrLoadModule('./api/og/share.ts');
            return mod.default(req, res);
          }
        } catch (e) {
          console.error('[share-entry-dev-plugin] Error:', e);
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), shareEntryDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
})