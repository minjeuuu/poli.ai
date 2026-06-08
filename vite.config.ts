import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg'],
          workbox: {
            maximumFileSizeToCacheInBytes: 5000000
          },
          manifest: {
            name: 'POLI',
            short_name: 'POLI',
            description: 'Political Academic Tool',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: '/icon.svg',
                sizes: '192x192 512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ],
            shortcuts: [
              { name: "Global Hub", short_name: "Hub", description: "Open Data Hub", url: "/?tab=hub", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Live Markets", short_name: "Markets", description: "Political Markets", url: "/?tab=rates", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Explore Nations", short_name: "Nations", description: "Database of Nations", url: "/?tab=countries", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Learn Theory", short_name: "Theory", description: "Political Theory", url: "/?tab=theory", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Daily Almanac", short_name: "Almanac", description: "Daily Events", url: "/?tab=almanac", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Comparative DB", short_name: "Compare", description: "Compare Entities", url: "/?tab=comparative", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Political Sim", short_name: "Sim", description: "Simulation", url: "/?tab=sim", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Policy Games", short_name: "Games", description: "Interactive Games", url: "/?tab=games", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Flashcards", short_name: "Learn", description: "Learn Terms", url: "/?tab=learn", icons: [{ src: "/icon.svg", sizes: "192x192" }] },
              { name: "Library", short_name: "Read", description: "Document Library", url: "/?tab=read", icons: [{ src: "/icon.svg", sizes: "192x192" }] }
            ]
          } as any
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
