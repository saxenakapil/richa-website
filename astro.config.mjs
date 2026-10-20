import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://richasaxena.in',
  server: { port: 3000 },
  // Keep the spaces between words that sit on separate lines in the markup.
  compressHTML: false,
});
