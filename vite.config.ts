import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "CashPilot",
        short_name: "CashPilot",
        description:
          "A modern manual budget tracker for accounts, transactions, bills, goals, and free spending limits.",
        theme_color: "#020617",
        background_color: "#F6F7FB",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Add Transaction",
            short_name: "Transaction",
            description: "Go directly to transactions.",
            url: "/transactions",
            icons: [
              {
                src: "/icons/pwa-192x192.png",
                sizes: "192x192",
              },
            ],
          },
          {
            name: "Budget",
            short_name: "Budget",
            description: "View your monthly budget.",
            url: "/budget",
            icons: [
              {
                src: "/icons/pwa-192x192.png",
                sizes: "192x192",
              },
            ],
          },
          {
            name: "Bills",
            short_name: "Bills",
            description: "View recurring bills.",
            url: "/bills",
            icons: [
              {
                src: "/icons/pwa-192x192.png",
                sizes: "192x192",
              },
            ],
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});