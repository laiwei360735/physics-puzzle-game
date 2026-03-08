/**
 * 目标实体 - 玩家需要到达的目标点
 */

import Phaser from 'phaser';

export interface GoalConfig {
  x: number;
  y: number;
  radius?: number;
  color?: number;
  type?: 'normal' | 'star' | 'bonus';
}

export class Goal extends Phaser.GameObjects.Container {
  private config: GoalConfig;
  private body!: Phaser.Physics.Matter.MatterBody;
  private graphics!: Phaser.GameObjects.Graphics;
  private glowEffect!: Phaser.GameObjects.Graphics;
  private isCollected: boolean = false;

  constructor(scene: Phaser.Scene, config: GoalConfig) {
    super(scene, config.x, config.y);
    this.config = config;
    this.createGoal();
  }

  /**
   * 创建目标
   */
  private createGoal(): void {
    const { radius = 30, color = 0x00ff00, type = 'normal' } = this.config;
    const scene = this.scene as any;

    // 创建发光效果
    this.glowEffect = this.scene.add.graphics();
    this.add(this.glowEffect);

    // 创建目标图形
    this.graphics = this.scene.add.graphics();
    this.add(this.graphics);

    // 根据类型设置不同外观
    switch (type) {
      case 'normal':
        this.drawNormalGoal(radius, color);
        break;
      case 'star':
        this.drawStarGoal(radius, 0xffff00);
        break;
      case 'bonus':
        this.drawBonusGoal(radius, 0xff00ff);
        break;
    }

    // 创建物理身体（传感器）- 使用 scene.matter
    this.body = scene.matter.add.circle(this.x, this.y, radius, {
      isSensor: true,
      label: 'goal',
    });

    // 关联游戏对象
    scene.matter.setGameObject(this, this.body);
  }

  /**
   * 绘制普通目标
   */
  private drawNormalGoal(radius: number, color: number): void {
    // 外圈
    this.graphics.lineStyle(3, color, 0.8);
    this.graphics.strokeCircle(0, 0, radius);
    
    // 内圈
    this.graphics.fillStyle(color, 0.3);
    this.graphics.fillCircle(0, 0, radius - 5);
  }

  /**
   * 绘制星星目标
   */
  private drawStarGoal(radius: number, color: number): void {
    this.graphics.fillStyle(color, 0.8);
    
    // 绘制五角星
    const points = this.createStarPoints(radius, 5);
    this.graphics.fillPoints(points);
  }

  /**
   * 绘制奖励目标
   */
  private drawBonusGoal(radius: number, color: number): void {
    this.graphics.fillStyle(color, 0.8);
    this.graphics.fillCircle(0, 0, radius);
    
    // 添加钻石效果
    this.graphics.lineStyle(2, 0xffffff, 0.8);
    this.graphics.strokeCircle(0, 0, radius * 0.6);
  }

  /**
   * 创建星星点
   */
  private createStarPoints(radius: number, points: number): Phaser.Math.Vector2[] {
    const starPoints: Phaser.Math.Vector2[] = [];
    const step = Math.PI / points;
    let angle = -Math.PI / 2;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.5;
      starPoints.push(
        new Phaser.Math.Vector2(
          Math.cos(angle) * r,
          Math.sin(angle) * r
        )
      );
      angle += step;
    }

    return starPoints;
  }

  /**
   * 更新目标
   */
  update(delta: number, time: number): void {
    if (this.isCollected) return;

    // 旋转动画
    this.rotation += 0.02;

    // 发光效果动画
    this.glowEffect.clear();
    const glowRadius = 35 + Math.sin(time * 0.005) * 5;
    this.glowEffect.lineStyle(2, 0x00ff00, 0.3 + Math.sin(time * 0.005) * 0.2);
    this.glowEffect.strokeCircle(0, 0, glowRadius);
  }

  /**
   * 收集目标
   */
  collect(): void {
    if (this.isCollected) return;

    this.isCollected = true;

    // 收集动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    // 触发收集事件
    this.emit('collected', this);
  }

  /**
   * 检查是否已收集
   */
  getIsCollected(): boolean {
    return this.isCollected;
  }

  /**
   * 获取目标类型
   */
  getType(): string {
    return this.config.type || 'normal';
  }

  /**
   * 获取目标分数
   */
  getScore(): number {
    switch (this.config.type) {
      case 'star':
        return 100;
      case 'bonus':
        return 200;
      default:
        return 50;
    }
  }

  /**
   * 销毁目标
   */
  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
