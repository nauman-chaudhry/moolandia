import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { 
        target: "https://moolandia-mern-app.onrender.com",// Your backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
