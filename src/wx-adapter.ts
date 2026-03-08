/**
 * 微信小游戏适配器
 * 处理微信小游戏的特殊 API 和环境适配
 * 
 * 修复说明：
 * - 微信小游戏环境没有 DOM，不能使用 document.getElementById
 * - 需要使用 wx.getSystemInfoSync() 获取屏幕信息
 * - Canvas 由微信自动提供，通过 wx.createCanvas() 或直接使用 game.canvas
 */

declare const wx: any;

export class WxAdapter {
  private static instance: WxAdapter;
  private systemInfo: any = null;
  private canvas: any = null;
  private isInitialized: boolean = false;

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
        
        // 获取 Canvas 上下文
        this.canvas = wx.createCanvas ? wx.createCanvas() : null;
        
        // 适配屏幕
        this.adaptScreen();
        
        // 初始化音频
        this.initAudio();
        
        // 监听屏幕旋转
        this.listenToScreenResize();
        
        this.isInitialized = true;
      } catch (error) {
        console.error('微信环境初始化失败:', error);
        throw error;
      }
    } else {
      // 非微信环境（浏览器开发模式）
      console.log('非微信环境，使用浏览器模式');
      this.isInitialized = true;
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
   * 修复：不再使用 document.getElementById，而是使用 Phaser 的 scale manager
   */
  adaptScreen(): void {
    if (!this.systemInfo) return;

    const { windowWidth, windowHeight, pixelRatio } = this.systemInfo;
    
    // 微信小游戏 Canvas 由引擎自动管理
    // Phaser 会自动处理 Canvas 尺寸
    // 这里只记录屏幕信息供游戏使用
    
    console.log(`屏幕适配：${windowWidth}x${windowHeight}, pixelRatio: ${pixelRatio}`);
    
    // 如果需要手动设置 Canvas，使用 wx.createSelectorQuery
    // 但推荐让 Phaser 自动管理
    if (this.canvas) {
      this.canvas.width = windowWidth * pixelRatio;
      this.canvas.height = windowHeight * pixelRatio;
    }
  }

  /**
   * 监听屏幕旋转/尺寸变化
   */
  private listenToScreenResize(): void {
    if (this.isWeChat() && wx.onWindowResize) {
      wx.onWindowResize((res: any) => {
        console.log('屏幕尺寸变化:', res);
        this.systemInfo = wx.getSystemInfoSync();
        this.adaptScreen();
      });
    }
  }

  /**
   * 初始化音频系统
   */
  initAudio(): void {
    if (this.isWeChat()) {
      try {
        // 微信小游戏音频 API
        const audio = wx.createInnerAudioContext();
        if (audio) {
          audio.obeyMuteSwitch = false;
          console.log('音频上下文创建成功');
        }
      } catch (error) {
        console.error('音频初始化失败:', error);
      }
    }
  }

  /**
   * 获取系统信息
   */
  getSystemInfo(): any {
    return this.systemInfo;
  }

  /**
   * 获取 Canvas
   * 返回 Phaser 游戏实例的 canvas 或微信创建的 canvas
   */
  getCanvas(): any {
    return this.canvas;
  }

  /**
   * 获取屏幕宽度
   */
  getScreenWidth(): number {
    return this.systemInfo ? this.systemInfo.windowWidth : 750;
  }

  /**
   * 获取屏幕高度
   */
  getScreenHeight(): number {
    return this.systemInfo ? this.systemInfo.windowHeight : 1334;
  }

  /**
   * 获取像素比
   */
  getPixelRatio(): number {
    return this.systemInfo ? this.systemInfo.pixelRatio : 2;
  }

  /**
   * 震动反馈
   */
  vibrate(type: 'short' | 'long' = 'short'): void {
    if (this.isWeChat()) {
      try {
        if (type === 'short') {
          wx.vibrateShort({ type: 'medium' });
        } else {
          wx.vibrateLong();
        }
      } catch (error) {
        console.error('震动失败:', error);
      }
    }
  }

  /**
   * 加载子域消息（用于排行榜等功能）
   */
  postMessageToOpenDataContext(data: any): void {
    if (this.isWeChat() && wx.openDataContext) {
      try {
        wx.openDataContext.postMessage(data);
      } catch (error) {
        console.error('发送子域消息失败:', error);
      }
    }
  }

  /**
   * 微信登录
   */
  async login(): Promise<string> {
    if (!this.isWeChat()) {
      return 'guest-user-' + Date.now();
    }

    try {
      const res = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        });
      });

      return (res as any).code;
    } catch (error) {
      console.error('微信登录失败:', error);
      throw error;
    }
  }

  /**
   * 分享功能
   */
  share(title: string, imageUrl?: string): void {
    if (this.isWeChat() && wx.shareAppMessage) {
      wx.shareAppMessage({
        title: title,
        imageUrl: imageUrl || '',
      });
    }
  }

  /**
   * 显示加载进度
   */
  showLoadingProgress(progress: number, text?: string): void {
    if (this.isWeChat() && wx.setTopBarText) {
      wx.setTopBarText({
        text: text || `加载中 ${Math.round(progress)}%`,
      });
    }
  }

  /**
   * 检查是否已初始化
   */
  checkInitialized(): boolean {
    return this.isInitialized;
  }
}

export const wxAdapter = WxAdapter.getInstance();
