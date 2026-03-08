/**
 * 启动场景 - 资源预加载
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 显示加载进度条
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      this.cameras.main.width / 2 - 160,
      this.cameras.main.height / 2 - 25,
      320,
      50
    );

    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      '加载中...',
      {
        font: '20px Arial',
        color: '#ffffff',
      }
    );
    loadingText.setOrigin(0.5);

    // 加载进度事件
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 - 15,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 加载游戏资源
    this.loadAssets();
  }

  create(): void {
    console.log('✅ BootScene 创建，准备进入 MenuScene');
    
    // 延迟进入菜单，确保资源完全加载
    this.time.delayedCall(100, () => {
      try {
        // 隐藏加载界面
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
          loadingEl.classList.add('hidden');
        }
        
        // 调用全局函数（如果存在）
        if (typeof (window as any).hideLoading === 'function') {
          (window as any).hideLoading();
        }
        
        // 进入菜单场景
        this.scene.start('MenuScene');
        console.log('✅ 成功进入 MenuScene');
      } catch (error) {
        console.error('❌ 场景切换失败:', error);
        // 强制进入菜单
        this.scene.start('MenuScene');
      }
    });
  }

  /**
   * 加载游戏资源
   * 已修复 P0: 添加错误处理和超时保护
   */
  private loadAssets(): void {
    // 添加资源加载错误处理
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('❌ 资源加载失败:', file.key, file.url);
      // 使用占位符纹理，避免游戏卡住
      this.createPlaceholderTexture(file.key);
    });

    // 添加加载完成事件
    this.load.on('complete', () => {
      console.log('✅ 所有资源加载完成');
    });

    // 添加加载进度事件（用于调试）
    this.load.on('progress', (value: number) => {
      console.log(`📊 加载进度：${Math.round(value * 100)}%`);
    });

    // 示例资源 - 实际使用时替换为真实资源
    try {
      const graphics = this.make.graphics();
      graphics.fillStyle(0x00ff00);
      graphics.fillCircle(50, 50, 50);
      graphics.generateTexture('circle', 100, 100);
      graphics.clear();
      
      graphics.fillStyle(0xff0000);
      graphics.fillRect(0, 0, 100, 100);
      graphics.generateTexture('square', 100, 100);
      graphics.destroy();
      
      console.log('✅ 示例纹理生成成功');
    } catch (error) {
      console.error('❌ 纹理生成失败:', error);
    }
  }

  /**
   * 创建占位符纹理（资源加载失败时使用）
   */
  private createPlaceholderTexture(key: string): void {
    try {
      const graphics = this.make.graphics();
      graphics.fillStyle(0xffff00); // 黄色占位符
      graphics.fillRect(0, 0, 100, 100);
      graphics.generateTexture(key, 100, 100);
      graphics.destroy();
      console.log(`✅ 已创建占位符纹理：${key}`);
    } catch (error) {
      console.error('❌ 创建占位符失败:', error);
    }
  }
}
