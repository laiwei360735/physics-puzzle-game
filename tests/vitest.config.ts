import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试框架全局 API
    globals: true,
    
    // 测试文件匹配模式
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // 排除的目录
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/reports/**'
    ],
    
    // 测试超时时间（毫秒）
    testTimeout: 10000,
    
    // 钩子超时时间（毫秒）
    hookTimeout: 10000,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['../src/**/*.{js,ts}'],
      exclude: [
        '../src/**/*.d.ts',
        '../src/**/*.{test,spec}.{js,ts}'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    
    // 环境配置
    environment: 'node',
    
    // 模拟配置
    mockReset: true,
    clearMocks: true,
    
    // 报告器
    reporters: ['default'],
    
    // 输出文件
    outputFile: {
      junit: './reports/junit.xml'
    },
    
    // 设置文件
    setupFiles: ['./setup.ts'],
    
    // 全局设置
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4
      }
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': '../src',
      '@tests': '.'
    }
  }
});
