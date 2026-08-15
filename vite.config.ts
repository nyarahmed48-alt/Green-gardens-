import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** The site is a single page; the server and functions are built by their
 *  own hosts, so Vite only ever builds src/ into dist/. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist" },
});
