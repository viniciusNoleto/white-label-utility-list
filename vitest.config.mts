import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const rootDir = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    globals: true,
    css: false,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['components/**', 'resources/**', 'utils/**', 'app/**/_components/**'],
    },
  },
  resolve: {
    alias: [
      { find: '@/src', replacement: path.resolve(rootDir, '.') },
      { find: '@', replacement: path.resolve(rootDir, '.') },
    ],
  },
});
