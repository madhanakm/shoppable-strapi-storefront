import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false, // Disable error overlay
    },
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'https://api.dharaniherbbals.com',
          changeOrigin: true,
          secure: true,
          timeout: 30000,
          proxyTimeout: 30000,
          on: {
            error: (err: any, _req: any, res: any) => {
              console.warn('[proxy] API error:', err.message);
              if (res && !res.headersSent) {
                res.writeHead(503);
                res.end('API unavailable');
              }
            }
          }
        }
      }
    })
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['html2canvas'],
    exclude: ['jspdf'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-radix': [
            '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select',
            '@radix-ui/react-toast', '@radix-ui/react-tooltip', '@radix-ui/react-label',
            '@radix-ui/react-checkbox', '@radix-ui/react-radio-group', '@radix-ui/react-slot',
            '@radix-ui/react-separator', '@radix-ui/react-tabs', '@radix-ui/react-accordion',
            '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-switch'
          ],
          'vendor-icons': ['lucide-react'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns'],
          'vendor-misc': ['react-helmet-async', 'sonner', 'next-themes', 'embla-carousel-react'],
          'pdf': ['jspdf', 'html2canvas', 'jspdf-autotable'],
        }
      }
    },
    chunkSizeWarningLimit: 300,
  },
  publicDir: 'public',
  assetsInclude: ['**/.htaccess'],
}));