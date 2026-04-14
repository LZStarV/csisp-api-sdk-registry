import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    timeout: 10000, // 10秒超时
    retry: 2, // 失败时重试2次
    env: {
      NODE_ENV: 'test',
      API_BASE_URL: 'http://localhost:3000',
    },
  },
});
