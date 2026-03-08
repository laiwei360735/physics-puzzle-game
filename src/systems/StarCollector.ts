/**
 * 星星收集系统
 * 负责星星碰撞检测、计数显示、粒子特效和音效
 * 
 * 功能:
 * - 星星碰撞检测（玩家接触星星）
 * - 星星收集计数显示（UI: ⭐ 0/3）
 * - 收集时播放粒子特效 + 音效
 * - 星星从场景中移除
 */

import Phaser from 'phaser';
import { VfxManager } from './VfxManager';

export interface StarData {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  gameObject?: Phaser.GameObjects.Container | Phaser.GameObjects.Text;
  body?: MatterJS.BodyType;
}

export interface StarCollectorConfig {
  totalStars: number;
  showUI: boolean;
  enableParticles: boolean;
  enableSound: boolean;
}

export class StarCollector {
  private scene: Phaser.Scene;
  private vfxManager: VfxManager;
  private config: StarCollectorConfig;
  
  private stars: Map<number, StarData> = new Map();
  private collectedCount: number = 0;
  private starUI: Phaser.GameObjects.Text | null = null;
  private starContainer: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    vfxManager: VfxManager,
    config?: Partial<StarCollectorConfig>
  ) {
    this.scene = scene;
    this.vfxManager = vfxManager;
    this.config = {
      totalStars: 3,
      showUI: true,
      enableParticles: true,
      enableSound: true,
      ...config,
    };
  }

  /**
   * 获取 Matter.js 物理实例
   */

  /**
   * 添加星星到关卡
   */
  addStar(id: number, x: number, y: number, radius: number = 20): StarData {
    const starData: StarData = {
      id,
      x,
      y,
      collected: false,
    };

    // 创建星星视觉对象（使用 emoji ⭐）
    const starContainer = this.scene.add.container(x, y);
    const starText = this.scene.add.text(0, 0, '⭐', {
      fontSize: '40px',
    });
    starText.setOrigin(0.5);
    starContainer.add(starText);
    starContainer.setDepth(50);

    // 添加轻微浮动动画
    this.scene.tweens.add({
      targets: starContainer,
      y: y - 10,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // 创建物理 body（用于碰撞检测）
    const starBody = (this.scene as any).matter.bodies.circle(x, y, radius, {
      isSensor: true, // 传感器，不产生物理碰撞
      label: 'star',
    });

    starContainer.setData('body', starBody);
    starData.gameObject = starContainer;
    starData.body = starBody;

    this.stars.set(id, starData);
    
    console.log(`⭐ 添加星星 ${id} 在 (${x}, ${y})`);
    return starData;
  }

  /**
   * 创建星星收集 UI
   */
  createUI(): void {
    if (!this.config.showUI) return;

    const { width } = this.scene.cameras.main;
    
    // 创建星星计数显示（右上角）
    this.starUI = this.scene.add.text(width - 150, 20, '⭐ 0/3', {
      font: 'bold 32px Fredoka One',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.starUI.setScrollFactor(0);
    this.starUI.setDepth(100);

    this.updateUI();
    console.log('📊 星星收集 UI 创建完成');
  }

  /**
   * 更新 UI 显示
   */
  private updateUI(): void {
    if (this.starUI) {
      this.starUI.setText(`⭐ ${this.collectedCount}/${this.config.totalStars}`);
    }
  }

  /**
   * 检测星星碰撞（在 GameScene 的 collisionstart 中调用）
   */
  checkStarCollision(playerBody: MatterJS.BodyType, otherBody: MatterJS.BodyType): boolean {
    // 查找对应的星星
    let collectedStar: StarData | null = null;
    
    this.stars.forEach((star, id) => {
      if (star.collected || !star.body) return;
      
      if (otherBody === star.body || playerBody === star.body) {
        // 确认是玩家和星星的碰撞
        const isPlayerStarCollision = 
          (playerBody === star.body && otherBody.label === 'player') ||
          (otherBody === star.body && playerBody.label === 'player');
        
        if (isPlayerStarCollision) {
          collectedStar = star;
        }
      }
    });

    if (collectedStar) {
      this.collectStar(collectedStar);
      return true;
    }

    return false;
  }

  /**
   * 收集星星
   */
  collectStar(star: StarData): void {
    if (star.collected) return;

    star.collected = true;
    this.collectedCount++;

    console.log(`⭐ 收集星星 ${star.id}！进度：${this.collectedCount}/${this.config.totalStars}`);

    // 1. 播放粒子特效
    if (this.config.enableParticles && star.gameObject) {
      this.vfxManager.createCollisionParticles(
        star.x,
        star.y,
        15,
        0xffd700 // 金色粒子
      );
    }

    // 2. 星星消失动画
    if (star.gameObject) {
      this.scene.tweens.add({
        targets: star.gameObject,
        scale: 1.5,
        alpha: 0,
        rotation: Math.PI * 2,
        duration: 400,
        ease: 'Back.out',
        onComplete: () => {
          star.gameObject?.destroy();
        },
      });
    }

    // 3. 更新 UI
    this.updateUI();

    // 4. 播放音效（如果有）
    if (this.config.enableSound) {
      this.playCollectSound();
    }

    // 5. 检查是否收集完所有星星
    if (this.collectedCount >= this.config.totalStars) {
      this.onAllStarsCollected();
    }
  }

  /**
   * 播放收集音效
   */
  private playCollectSound(): void {
    // 使用 Phaser 音效系统
    // 注意：实际项目中需要预加载音效文件
    // this.scene.sound.play('star_collect');
    
    // 临时使用简单的提示音
    console.log('🔊 播放星星收集音效');
  }

  /**
   * 所有星星收集完成
   */
  private onAllStarsCollected(): void {
    console.log('🎉 所有星星收集完成！');
    
    // 播放特殊特效
    const { width, height } = this.scene.cameras.main;
    this.vfxManager.playSuccessEffect(width / 2, height / 2);
  }

  /**
   * 获取当前收集进度
   */
  getProgress(): { collected: number; total: number; percentage: number } {
    return {
      collected: this.collectedCount,
      total: this.config.totalStars,
      percentage: (this.collectedCount / this.config.totalStars) * 100,
    };
  }

  /**
   * 检查是否达到三星标准
   */
  hasThreeStars(): boolean {
    return this.collectedCount >= 3;
  }

  /**
   * 重置收集状态（用于关卡重试）
   */
  reset(): void {
    this.collectedCount = 0;
    
    // 重新显示所有星星
    this.stars.forEach((star) => {
      star.collected = false;
      if (star.gameObject) {
        star.gameObject.setAlpha(1);
        star.gameObject.setScale(1);
        star.gameObject.setVisible(true);
      }
    });

    this.updateUI();
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stars.forEach((star) => {
      star.gameObject?.destroy();
    });
    this.stars.clear();
    
    this.starUI?.destroy();
    this.starContainer?.destroy();
    
    this.collectedCount = 0;
  }
}
