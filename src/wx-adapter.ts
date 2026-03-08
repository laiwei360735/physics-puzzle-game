/**
 * 微信小游戏适配器
 * 处理微信小游戏的特殊 API 和环境适配
 */

declare const wx: any;

export class WxAdapter {
  private static instance: WxAdapter;
  private systemInfo: any = null;

  private constructor() {}

  static getInstance(): WxAdapter {
    if (!WxAdapter.instance) {
      WxAdapter.instance = new WxAdapter();
    }
    return WxAdapter.instance;
  }

  /**
   * 初始化微信环境
   */
  async init(): Promise<void> {
    if (this.isWeChat()) {
      try {
        this.systemInfo = wx.getSystemInfoSync();
        console.log('微信环境初始化成功', this.systemInfo);
        
        // 适配屏幕
        this.adaptScreen();
        
        // 初始化音频
        this.initAudio();
      } catch (error) {
        console.error('微信环境初始化失败:', error);
      }
    }
  }

  /**
   * 判断是否在微信小游戏环境
   */
  isWeChat(): boolean {
    return typeof wx !== 'undefined' && wx.getSystemInfoSync;
  }

  /**
   * 适配屏幕
   */
  adaptScreen(): void {
    if (!this.systemInfo) return;

    const { windowWidth, windowHeight, pixelRatio } = this.systemInfo;
    
    // 设置 Canvas 尺寸
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.width = windowWidth * pixelRatio;
      canvas.height = windowHeight * pixelRatio;
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowHeight}px`;
    }
  }

  /**
   * 初始化音频系统
   */
  initAudio(): void {
    if (this.isWeChat()) {
      // 微信小游戏音频 API
      const audio = wx.createInnerAudioContext();
      audio.obeyMuteSwitch = false;
    }
  }

  /**
   * 获取系统信息
   */
  getSystemInfo(): any {
    return this.systemInfo;
  }

  /**
   * 震动反馈
   */
  vibrate(type: 'short' | 'long' = 'short'): void {
    if (this.isWeChat()) {
      if (type === 'short') {
        wx.vibrateShort({ type: 'medium' });
      } else {
        wx.vibrateLong();
      }
    }
  }

  /**
   * 加载子域消息（用于排行榜等功能）
   */
  postMessageToOpenDataContext(data: any): void {
    if (this.isWeChat() && wx.openDataContext) {
      wx.openDataContext.postMessage(data);
    }
  }
}

export const wxAdapter = WxAdapter.getInstance();
