import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// host: true lets phones on the same WiFi reach the dev server via the
// host laptop's LAN IP (e.g. http://192.168.1.23:5173), not just localhost.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
