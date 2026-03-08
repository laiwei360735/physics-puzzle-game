/**
 * 障碍物实体基类
 */

import Phaser from 'phaser';

export type ObstacleType = 'static' | 'dynamic' | 'moving' | 'rotating';

export interface ObstacleConfig {
  x: number;
  y: number;
  type: ObstacleType;
  shape: 'rectangle' | 'circle' | 'triangle' | 'polygon';
  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  color?: number;
  isStatic?: boolean;
  friction?: number;
  restitution?: number;
  // 移动障碍物属性
  moveRange?: number;
  moveSpeed?: number;
  moveAxis?: 'x' | 'y';
  // 旋转障碍物属性
  rotationSpeed?: number;
}

export class Obstacle extends Phaser.GameObjects.Container {
  protected config: ObstacleConfig;
  protected body!: Phaser.Physics.Matter.MatterBody;
  protected graphics!: Phaser.GameObjects.Graphics;
  
  // 移动状态
  protected moveOffset: number = 0;
  protected moveDirection: number = 1;

  constructor(scene: Phaser.Scene, config: ObstacleConfig) {
    super(scene, config.x, config.y);
    this.config = config;
    this.createObstacle();
  }

  /**
   * 获取 Matter.js 物理实例
   */
  protected getMatterPhysics(): any {
    const scene = this.scene as any;
    if (scene.matter) {
      return scene.matter;
    }
    if (scene.physics && scene.physics.matter) {
      return scene.physics.matter;
    }
    console.error('❌ Matter.js 未初始化');
    return null;
  }

  /**
   * 创建障碍物
   */
  protected createObstacle(): void {
    const { shape, color = 0x888888 } = this.config;

    // 创建图形
    this.graphics = this.scene.add.graphics();
    this.graphics.fillStyle(color);

    // 根据形状创建不同的障碍物
    switch (shape) {
      case 'rectangle':
        this.createRectangle();
        break;
      case 'circle':
        this.createCircle();
        break;
      case 'triangle':
        this.createTriangle();
        break;
      case 'polygon':
        this.createPolygon();
        break;
    }

    this.add(this.graphics);

    // 设置物理身体
    this.setupPhysics();
  }

  /**
   * 创建矩形
   */
  private createRectangle(): void {
    const { width = 100, height = 20 } = this.config;
    this.graphics.fillRect(-width / 2, -height / 2, width, height);
  }

  /**
   * 创建圆形
   */
  private createCircle(): void {
    const { radius = 30 } = this.config;
    this.graphics.fillCircle(0, 0, radius);
  }

  /**
   * 创建三角形
   */
  private createTriangle(): void {
    const size = 50;
    this.graphics.fillTriangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
  }

  /**
   * 创建多边形
   */
  private createPolygon(): void {
    const { sides = 6, radius = 40 } = this.config;
    this.graphics.fillPoints(this.createPolygonPoints(sides, radius));
  }

  /**
   * 创建多边形点
   */
  private createPolygonPoints(sides: number, radius: number): Phaser.Math.Vector2[] {
    const points: Phaser.Math.Vector2[] = [];
    const angleStep = (Math.PI * 2) / sides;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep;
      points.push(
        new Phaser.Math.Vector2(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius
        )
      );
    }

    return points;
  }

  /**
   * 设置物理
   */
  protected setupPhysics(): void {
    const { isStatic = true, friction = 0.8, restitution = 0.2 } = this.config;
    const { shape } = this.config;

    let bodyOptions: any = {
      isStatic,
      friction,
      restitution,
      label: 'obstacle',
    };

    // 根据形状创建对应的物理身体
    if (shape === 'rectangle') {
      const { width = 100, height = 20 } = this.config;
      this.body = this.getMatterPhysics().add.rectangle(
        this.x,
        this.y,
        width,
        height,
        bodyOptions
      );
    } else if (shape === 'circle') {
      const { radius = 30 } = this.config;
      this.body = this.getMatterPhysics().add.circle(this.x, this.y, radius, bodyOptions);
    } else if (shape === 'triangle') {
      const size = 50;
      this.body = this.getMatterPhysics().add.polygon(
        this.x,
        this.y,
        3,
        size / 2,
        bodyOptions
      );
    } else if (shape === 'polygon') {
      const { sides = 6, radius = 40 } = this.config;
      this.body = this.getMatterPhysics().add.polygon(
        this.x,
        this.y,
        sides,
        radius,
        bodyOptions
      );
    }

    // 关联游戏对象
    if (this.body) {
      this.getMatterPhysics().setGameObject(this, this.body);
    }
  }

  /**
   * 更新障碍物
   */
  update(delta: number, time: number): void {
    const { type, moveRange = 100, moveSpeed = 2, moveAxis = 'x', rotationSpeed = 0 } = this.config;

    if (type === 'moving') {
      this.updateMoving(time, moveRange, moveSpeed, moveAxis);
    } else if (type === 'rotating') {
      this.updateRotating(delta, rotationSpeed);
    }
  }

  /**
   * 更新移动障碍物
   */
  protected updateMoving(
    time: number,
    range: number,
    speed: number,
    axis: 'x' | 'y'
  ): void {
    const offset = Math.sin(time * 0.001 * speed) * range;
    
    if (axis === 'x') {
      this.getMatterPhysics().setPosition(this.body, {
        x: this.config.x + offset,
        y: this.config.y,
      });
    } else {
      this.getMatterPhysics().setPosition(this.body, {
        x: this.config.x,
        y: this.config.y + offset,
      });
    }
  }

  /**
   * 更新旋转障碍物
   */
  protected updateRotating(delta: number, speed: number): void {
    if (speed !== 0) {
      const rotation = this.body.angle + speed * delta * 0.001;
      this.getMatterPhysics().setRotation(this.body, rotation);
    }
  }

  /**
   * 获取障碍物身体
   */
  getBody(): Phaser.Physics.Matter.MatterBody {
    return this.body;
  }

  /**
   * 设置障碍物为传感器（不产生物理碰撞）
   */
  setSensor(isSensor: boolean): void {
    this.getMatterPhysics().setSensor(this.body, isSensor);
  }

  /**
   * 销毁障碍物
   */
  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }
}
