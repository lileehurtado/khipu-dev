import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  output: 'server',
  integrations: [react(), svelte()],
  vite: {
    define: {
      'import.meta.env.KHIPU_RECEIVER_ID': JSON.stringify(process.env.KHIPU_RECEIVER_ID),
      'import.meta.env.KHIPU_SECRET': JSON.stringify(process.env.KHIPU_SECRET),
    }
  }
});