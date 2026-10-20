import { defineConfig } from 'vitest/config';
export default defineConfig({base: '/crypto-lab-log-forge/', test:{include:['src/**/*.test.ts'], testTimeout:30000}});
