/**
 * 全局类型定义
 */

// 微信小游戏全局对象
declare const wx: {
  getSystemInfoSync: () => {
    windowWidth: number;
    windowHeight: number;
    pixelRatio: number;
    platform: string;
    system: string;
    version: string;
  };
  createInnerAudioContext: () => any;
  vibrateShort: (options?: { type?: 'short' | 'medium' | 'long' }) => void;
  vibrateLong: () => void;
  openDataContext: any;
};

// 模块声明
declare module 'phaser' {
  export * from 'phaser';
}

declare module 'matter-js' {
  export * from 'matter-js';
}

// 全局事件接口
interface GameEventMap {
  stateChange: { from: string; to: string };
  scoreChange: number;
  playerDeath: void;
  goalCollected: any;
  pause: void;
  reset: void;
  keyUp: void;
  keyDown: void;
  keyLeft: void;
  keyRight: void;
  keySpace: void;
  dragStart: { object: any; pointer: any };
  swipe: { direction: string; start: any; end: any };
}

// 加载界面全局函数
interface Window {
  hideLoading: () => void;
  updateLoading: (progress: number) => void;
}
