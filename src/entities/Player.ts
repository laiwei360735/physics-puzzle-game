/**
 * 玩家实体
 */

import Phaser from 'phaser';
import Matter from 'matter-js';

export class Player extends Phaser.GameObjects.Container {
  private body!: Phaser.Physics.Matter.MatterBody;
  private isDragging: boolean = false;
  private dragConstraint: Matter.Constraint | null = null;
  
  // 玩家属性
  private speed: number = 5;
  private jumpForce: number = 0.3;
  private maxVelocity: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.createPlayer();
  }

  /**
   * 创建玩家
   */
  private createPlayer(): void {
    // 创建圆形身体
    const radius = 25;
    
    const matterPhysics = (this.scene.physics as any);
    this.body = matterPhysics.add.circle(this.x, this.y, radius, {
      density: 0.001,
      friction: 0.1,
      restitution: 0.5, // 弹性
      label: 'player',
    });

    // 创建可视化图形
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x00aaff);
    graphics.fillCircle(0, 0, radius);
    
    this.add(graphics);

    // 设置物理属性
    matterPhysics.setGameObject(this, this.body);
  }

  /**
   * 更新玩家
   */
  update(delta: number): void {
    if (!this.isDragging) {
      this.applyPhysics(delta);
    }
  }

  /**
   * 获取 Matter.js 物理实例
   */
  private getMatterPhysics(): any {
    // 直接访问 scene 的 matter 属性
    const scene = this.scene as any;
    if (scene.matter) {
      return scene.matter;
    }
    // 回退到 physics.matter
    if (scene.physics && scene.physics.matter) {
      return scene.physics.matter;
    }
    console.error('❌ Matter.js 未初始化');
    return null;
  }

  /**
   * 应用物理
   */
  private applyPhysics(delta: number): void {
    // 限制最大速度
    const velocity = this.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    if (speed > this.maxVelocity) {
      const scale = this.maxVelocity / speed;
      const matter = this.getMatterPhysics();
      matter.setVelocity(this.body, {
        x: velocity.x * scale,
        y: velocity.y * scale,
      });
    }
  }

  /**
   * 开始拖拽
   */
  startDrag(pointer: Phaser.Input.Pointer): void {
    this.isDragging = true;
    
    // 创建拖拽约束
    const matter = this.getMatterPhysics();
    this.dragConstraint = matter.add.constraint(
      this.body,
      { x: pointer.x, y: pointer.y },
      0,
      0.9,
      {
        stiffness: 0.1,
        length: 0,
      }
    );
  }

  /**
   * 更新拖拽位置
   */
  updateDrag(pointer: Phaser.Input.Pointer): void {
    if (this.isDragging && this.dragConstraint) {
      const matter = this.getMatterPhysics();
      matter.setPosition(
        this.dragConstraint.pointB as Matter.Vector,
        { x: pointer.x, y: pointer.y }
      );
    }
  }

  /**
   * 结束拖拽
   */
  endDrag(): void {
    this.isDragging = false;
    
    if (this.dragConstraint) {
      const matter = this.getMatterPhysics();
      matter.world.removeConstraint(this.dragConstraint);
      this.dragConstraint = null;
    }
  }

  /**
   * 施加力
   */
  applyForce(x: number, y: number): void {
    const matter = this.getMatterPhysics();
    matter.applyForce(this.body, this.body.position, { x, y });
  }

  /**
   * 跳跃
   */
  jump(): void {
    if (this.isOnGround()) {
      const matter = this.getMatterPhysics();
      matter.applyForce(this.body, this.body.position, {
        x: 0,
        y: -this.jumpForce,
      });
    }
  }

  /**
   * 检查是否在地面
   */
  private isOnGround(): boolean {
    // 简化实现 - 实际应检测碰撞
    return this.body.velocity.y >= 0;
  }

  /**
   * 获取玩家位置
   */
  getPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.body.position.x, this.body.position.y);
  }

  /**
   * 设置玩家位置
   */
  setPosition(x: number, y: number): void {
    const matter = this.getMatterPhysics();
    matter.setPosition(this.body, { x, y });
  }

  /**
   * 重置玩家
   */
  reset(x: number, y: number): void {
    this.setPosition(x, y);
    const matter = this.getMatterPhysics();
    matter.setVelocity(this.body, { x: 0, y: 0 });
    matter.setAngularVelocity(this.body, 0);
  }

  /**
   * 销毁玩家
   */
  destroy(fromScene?: boolean): void {
    if (this.dragConstraint) {
      const matter = this.getMatterPhysics();
      matter.world.removeConstraint(this.dragConstraint);
    }
    super.destroy(fromScene);
  }
}
