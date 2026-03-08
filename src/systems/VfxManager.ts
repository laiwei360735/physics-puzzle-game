/**
 * 视觉特效管理器
 * 管理所有游戏视觉特效：拖拽轨迹、碰撞粒子、成功/失败动画、UI 动效、切割效果
 * 
 * 技术要点:
 * - 使用 Phaser 3 粒子系统
 * - 使用 Tweens 做动画
 * - 对象池优化性能
 * - 适配微信小游戏
 */

import Phaser from 'phaser';

// ==================== 类型定义 ====================

export interface VfxConfig {
  maxDragTrailPoints: number;
  maxParticles: number;
  particleLifetime: number;
  enableShake: boolean;
  enableSlowMo: boolean;
}

export interface DragTrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface ParticlePool {
  particles: Phaser.GameObjects.Arc[];
  available: number[];
}

// ==================== 特效管理器 ====================

export class VfxManager {
  private scene: Phaser.Scene;
  private config: VfxConfig;
  
  // 拖拽轨迹
  private dragTrail: DragTrailPoint[] = [];
  private dragTrailGraphics: Phaser.GameObjects.Graphics | null = null;
  
  // 粒子池（性能优化）
  private particlePool: ParticlePool;
  private particleContainer: Phaser.GameObjects.Container | null = null;
  
  // 成功/失败特效容器
  private vfxContainer: Phaser.GameObjects.Container | null = null;
  
  // UI 动效状态
  private uiTweenCache: Map<string, Phaser.Tweens.Tween> = new Map();
  
  // 屏幕滤镜
  private grayscaleFilter: Phaser.Renderer.WebGL.Pipelines.PostFX.PipelineStage | null = null;
  
  constructor(scene: Phaser.Scene, config?: Partial<VfxConfig>) {
    this.scene = scene;
    this.config = {
      maxDragTrailPoints: 20,
      maxParticles: 100,
      particleLifetime: 600,
      enableShake: true,
      enableSlowMo: false,
      ...config,
    };
    
    this.particlePool = {
      particles: [],
      available: [],
    };
    
    this.init();
  }
  
  /**
   * 初始化特效系统
   */
  private init(): void {
    // 创建特效容器
    this.vfxContainer = this.scene.add.container(0, 0);
    this.vfxContainer.setDepth(1000); // 最高层级
    
    // 创建粒子容器
    this.particleContainer = this.scene.add.container(0, 0);
    this.particleContainer.setDepth(999);
    
    // 创建拖拽轨迹图形
    this.dragTrailGraphics = this.scene.add.graphics();
    this.dragTrailGraphics.setDepth(998);
    
    // 预分配粒子池
    this.allocateParticles();
    
    console.log('✨ VfxManager 初始化完成');
  }
  
  /**
   * 预分配粒子（对象池）
   */
  private allocateParticles(): void {
    for (let i = 0; i < this.config.maxParticles; i++) {
      const particle = this.scene.add.arc(0, 0, 3, 0xffffff, 0);
      particle.setVisible(false);
      this.particleContainer?.add(particle);
      this.particlePool.particles.push(particle);
      this.particlePool.available.push(i);
    }
  }
  
  /**
   * 获取可用粒子
   */
  private getParticle(): Phaser.GameObjects.Arc | null {
    if (this.particlePool.available.length === 0) {
      // 池耗尽，返回 null（性能保护）
      return null;
    }
    
    const index = this.particlePool.available.pop()!;
    const particle = this.particlePool.particles[index];
    particle.setVisible(true);
    particle.setAlpha(1);
    return particle;
  }
  
  /**
   * 回收粒子
   */
  private recycleParticle(particle: Phaser.GameObjects.Arc): void {
    particle.setVisible(false);
    const index = this.particlePool.particles.indexOf(particle);
    if (index !== -1 && !this.particlePool.available.includes(index)) {
      this.particlePool.available.push(index);
    }
  }
  
  // ==================== 拖拽轨迹效果 ====================
  
  /**
   * 开始拖拽轨迹
   */
  startDragTrail(): void {
    this.dragTrail = [];
    this.dragTrailGraphics?.clear();
  }
  
  /**
   * 更新拖拽轨迹位置
   */
  updateDragTrail(x: number, y: number): void {
    // 添加轨迹点
    this.dragTrail.push({
      x,
      y,
      alpha: 1,
    });
    
    // 限制轨迹点数量
    if (this.dragTrail.length > this.config.maxDragTrailPoints) {
      this.dragTrail.shift();
    }
    
    // 绘制轨迹
    this.renderDragTrail();
  }
  
  /**
   * 渲染拖拽轨迹
   */
  private renderDragTrail(): void {
    if (!this.dragTrailGraphics || this.dragTrail.length < 2) return;
    
    this.dragTrailGraphics.clear();
    
    // 绘制渐变轨迹线
    for (let i = 0; i < this.dragTrail.length - 1; i++) {
      const point = this.dragTrail[i];
      const nextPoint = this.dragTrail[i + 1];
      
      const alpha = point.alpha;
      const width = 2 + (i / this.dragTrail.length) * 6; // 前端细，后端粗
      
      this.dragTrailGraphics.lineStyle(width, 0x00a8ff, alpha * 0.6);
      this.dragTrailGraphics.lineBetween(point.x, point.y, nextPoint.x, nextPoint.y);
    }
    
    // 绘制轨迹点
    this.dragTrailGraphics.fillStyle(0x00a8ff, 0.3);
    this.dragTrail.forEach((point, index) => {
      const radius = 2 + (index / this.dragTrail.length) * 4;
      this.dragTrailGraphics!.fillCircle(point.x, point.y, radius);
    });
  }
  
  /**
   * 结束拖拽轨迹（渐隐）
   */
  endDragTrail(): void {
    if (this.dragTrail.length === 0) return;
    
    // 渐隐动画
    this.scene.tweens.add({
      targets: this.dragTrailGraphics,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.dragTrailGraphics?.clear();
        this.dragTrailGraphics?.setAlpha(1);
        this.dragTrail = [];
      },
    });
  }
  
  // ==================== 碰撞粒子效果 ====================
  
  /**
   * 创建碰撞粒子效果
   */
  createCollisionParticles(
    x: number,
    y: number,
    count: number = 8,
    color: number = 0xffaa00
  ): void {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break; // 池耗尽
      
      // 随机方向和速度
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.3, 0.3);
      const speed = Phaser.Math.FloatBetween(100, 200);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      particle.setPosition(x, y);
      particle.setFillStyle(color, 1);
      particle.setRadius(Phaser.Math.FloatBetween(2, 5));
      
      // 粒子动画
      this.scene.tweens.add({
        targets: particle,
        x: x + velocityX * 0.5,
        y: y + velocityY * 0.5,
        alpha: 0,
        scale: 0,
        duration: this.config.particleLifetime,
        ease: 'Power2',
        onComplete: () => {
          this.recycleParticle(particle);
        },
      });
    }
  }
  
  /**
   * 玩家碰撞特效
   */
  onPlayerCollision(x: number, y: number): void {
    // 创建碰撞粒子
    this.createCollisionParticles(x, y, 12, 0xff6600);
    
    // 屏幕震动
    if (this.config.enableShake) {
      this.scene.cameras.main.shake(100, 0.005);
    }
  }
  
  // ==================== 成功/失败动画 ====================
  
  /**
   * 成功特效（星星闪烁 + 彩带粒子）
   */
  playSuccessEffect(x?: number, y?: number): void {
    const centerX = x ?? this.scene.cameras.main.centerX;
    const centerY = y ?? this.scene.cameras.main.centerY;
    
    // 1. 星星闪烁效果
    this.createStarBurst(centerX, centerY);
    
    // 2. 彩带粒子
    this.createConfetti(centerX, centerY);
    
    // 3. 屏幕闪光
    this.scene.cameras.main.flash(300, 255, 255, 200);
    
    console.log('🎉 成功特效播放');
  }
  
  /**
   * 创建星星爆发效果
   */
  private createStarBurst(x: number, y: number): void {
    const starCount = 8;
    const radius = 100;
    
    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount;
      const starX = x + Math.cos(angle) * radius;
      const starY = y + Math.sin(angle) * radius;
      
      // 创建星星
      const star = this.scene.add.text(starX, starY, '⭐', {
        fontSize: '32px',
      });
      star.setOrigin(0.5);
      star.setAlpha(0);
      this.vfxContainer?.add(star);
      
      // 星星动画：出现 → 闪烁 → 消失
      this.scene.tweens.add({
        targets: star,
        alpha: 1,
        scale: 1.5,
        duration: 200,
        ease: 'Back.out',
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          star.destroy();
        },
      });
    }
  }
  
  /**
   * 创建彩带粒子效果
   */
  private createConfetti(x: number, y: number): void {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    
    for (let i = 0; i < 30; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Phaser.Math.DegToRad(Phaser.Math.FloatBetween(-90, -30));
      const speed = Phaser.Math.FloatBetween(150, 300);
      
      particle.setPosition(x, y);
      particle.setFillStyle(color, 1);
      particle.setRadius(Phaser.Math.FloatBetween(3, 6));
      
      // 彩带飘落动画
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 0.8 + Phaser.Math.FloatBetween(-50, 50),
        y: y + Math.sin(angle) * speed * 0.8 + 200, // 向下飘落
        alpha: 0,
        rotation: Phaser.Math.FloatBetween(-Math.PI, Math.PI),
        duration: 1500,
        ease: 'Power1',
        onComplete: () => {
          this.recycleParticle(particle);
        },
      });
    }
  }
  
  /**
   * 失败特效（灰色滤镜 + 下沉动画）
   */
  playFailEffect(target?: Phaser.GameObjects.GameObject): void {
    // 1. 添加灰色滤镜
    this.applyGrayscaleFilter();
    
    // 2. 如果有目标对象，播放下沉动画
    if (target) {
      this.scene.tweens.add({
        targets: target,
        y: target.y + 50,
        alpha: 0.5,
        duration: 500,
        ease: 'Power2',
      });
    }
    
    // 3. 屏幕震动（轻微）
    if (this.config.enableShake) {
      this.scene.cameras.main.shake(200, 0.003);
    }
    
    console.log('💔 失败特效播放');
  }
  
  /**
   * 应用灰色滤镜
   */
  private applyGrayscaleFilter(): void {
    // 注意：微信小游戏可能不支持后处理滤镜
    // 这里使用简单的颜色叠加替代方案
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.5
    );
    overlay.setDepth(9999);
    overlay.setOrigin(0.5);
    
    // 3 秒后移除
    this.scene.time.delayedCall(3000, () => {
      overlay.destroy();
    });
  }
  
  /**
   * 移除灰色滤镜
   */
  removeGrayscaleFilter(): void {
    // 滤镜会在 3 秒后自动移除
  }
  
  // ==================== UI 动效 ====================
  
  /**
   * 按钮悬停效果（放大 + 变色）
   */
  onButtonHover(button: Phaser.GameObjects.GameObject, hover: boolean = true): void {
    const tweenKey = `button-hover-${button.id}`;
    
    // 移除现有悬停动画
    const existingTween = this.uiTweenCache.get(tweenKey);
    if (existingTween) {
      existingTween.remove();
      this.uiTweenCache.delete(tweenKey);
    }
    
    if (hover) {
      // 悬停：放大 + 变亮
      const tween = this.scene.tweens.add({
        targets: button,
        scale: 1.1,
        tint: 0xdddddd,
        duration: 150,
        ease: 'Power2',
      });
      this.uiTweenCache.set(tweenKey, tween);
    } else {
      // 取消悬停：恢复
      const tween = this.scene.tweens.add({
        targets: button,
        scale: 1,
        tint: 0xffffff,
        duration: 150,
        ease: 'Power2',
      });
      this.uiTweenCache.set(tweenKey, tween);
    }
  }
  
  /**
   * 按钮点击效果（缩小 + 恢复）
   */
  onButtonClick(button: Phaser.GameObjects.GameObject): void {
    const tweenKey = `button-click-${button.id}`;
    
    // 移除现有点按动画
    const existingTween = this.uiTweenCache.get(tweenKey);
    if (existingTween) {
      existingTween.remove();
      this.uiTweenCache.delete(tweenKey);
    }
    
    // 点击动画：缩小 → 恢复
    const tween = this.scene.tweens.add({
      targets: button,
      scale: 0.9,
      duration: 80,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.uiTweenCache.delete(tweenKey);
      },
    });
    this.uiTweenCache.set(tweenKey, tween);
  }
  
  /**
   * 界面过渡（淡入淡出）
   */
  fadeIn(container: Phaser.GameObjects.Container, duration: number = 300): void {
    container.setAlpha(0);
    container.setVisible(true);
    
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      duration,
      ease: 'Power2',
    });
  }
  
  fadeOut(container: Phaser.GameObjects.Container, duration: number = 300): void {
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => {
        container.setVisible(false);
      },
    });
  }
  
  // ==================== 切割效果 ====================
  
  /**
   * 切割轨迹光效
   */
  createCutTrail(startX: number, startY: number, endX: number, endY: number): void {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(998);
    
    // 绘制切割线（发光效果）
    graphics.lineStyle(4, 0x00ffff, 0.8);
    graphics.lineBetween(startX, startY, endX, endY);
    
    // 内层亮线
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.lineBetween(startX, startY, endX, endY);
    
    // 渐隐消失
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        graphics.destroy();
      },
    });
  }
  
  /**
   * 断口火花粒子
   */
  createCutSparks(x: number, y: number, count: number = 15): void {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(80, 150);
      
      particle.setPosition(x, y);
      particle.setFillStyle(0xffaa00, 1);
      particle.setRadius(Phaser.Math.FloatBetween(2, 4));
      
      // 火花飞溅动画
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 0.6,
        y: y + Math.sin(angle) * speed * 0.6,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.recycleParticle(particle);
        },
      });
    }
  }
  
  /**
   * 完整切割效果
   */
  playCutEffect(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    breakPointX?: number,
    breakPointY?: number
  ): void {
    // 切割轨迹
    this.createCutTrail(startX, startY, endX, endY);
    
    // 断口火花
    const sparkX = breakPointX ?? endX;
    const sparkY = breakPointY ?? endY;
    this.createCutSparks(sparkX, sparkY);
    
    console.log('✂️ 切割特效播放');
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 清理所有特效
   */
  clearAll(): void {
    // 清理拖拽轨迹
    this.dragTrail = [];
    this.dragTrailGraphics?.clear();
    
    // 清理所有粒子
    this.particlePool.particles.forEach(particle => {
      particle.setVisible(false);
    });
    this.particlePool.available = this.particlePool.particles.map((_, i) => i);
    
    // 清理 UI 动画
    this.uiTweenCache.forEach(tween => tween.remove());
    this.uiTweenCache.clear();
    
    console.log('🧹 清理所有特效');
  }
  
  /**
   * 销毁特效管理器
   */
  destroy(): void {
    this.clearAll();
    
    this.dragTrailGraphics?.destroy();
    this.vfxContainer?.destroy();
    this.particleContainer?.destroy();
    
    this.particlePool.particles.forEach(particle => particle.destroy());
    this.particlePool.particles = [];
    this.particlePool.available = [];
    
    console.log('💥 VfxManager 销毁');
  }
}
