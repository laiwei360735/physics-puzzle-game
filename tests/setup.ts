/**
 * Vitest 全局设置文件
 * 在所有测试文件执行前运行
 */

import { beforeAll, afterAll } from 'vitest';

// 全局设置
beforeAll(() => {
  // 模拟微信小游戏全局对象
  global.wx = {
    getSystemInfoSync: () => ({
      brand: 'Apple',
      model: 'iPhone 14',
      system: 'iOS 16.0',
      systemVersion: '16.0',
      windowWidth: 375,
      windowHeight: 812,
      pixelRatio: 3,
      benchmarkLevel: 3
    }),
    getAccountInfoSync: () => ({
      miniProgram: {
        version: '1.0.0'
      }
    }),
    getLaunchOptionsSync: () => ({
      scene: 1001
    }),
    createInnerAudioContext: () => ({
      src: '',
      onCanplay: () => {},
      onError: () => {},
      play: () => {},
      pause: () => {},
      stop: () => {},
      destroy: () => {}
    }),
    getNetworkType: ({ success, fail }) => {
      success({ networkType: 'wifi' });
    },
    onShow: () => {},
    onHide: () => {}
  };

  // 模拟 performance API
  if (!global.performance) {
    global.performance = {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
      }
    };
  }

  // 模拟 requestAnimationFrame
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  }

  console.log('[Vitest Setup] 测试环境初始化完成');
});

afterAll(() => {
  console.log('[Vitest Setup] 测试环境清理完成');
});

// 导出空对象以符合模块要求
export {};
