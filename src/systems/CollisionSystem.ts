/**
 * 碰撞管理系统
 * 处理游戏中的各种碰撞事件
 * 
 * 已修复 P0 Bug:
 * - ✅ 保存事件监听器引用以便清理
 * - ✅ 添加 destroy 方法清理资源
 */

import Phaser from 'phaser';
import Matter from 'matter-js';

export type CollisionHandler = (pair: Matter.Types.CollisionPair) => void;

export class CollisionSystem {
  private scene: Phaser.Scene;
  private handlers: Map<string, CollisionHandler> = new Map();
  
  // 保存事件监听器引用以便清理
  private collisionStartListener: ((event: Matter.Types.CollisionStartEvent) => void) | null = null;
  private collisionActiveListener: ((event: Matter.Types.CollisionActiveEvent) => void) | null = null;
  private collisionEndListener: ((event: Matter.Types.CollisionEndEvent) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupCollisionEvents();
  }

  /**
   * 获取 Matter.js 物理实例
   */

  /**
   * 设置碰撞事件
   */
  private setupCollisionEvents(): void {
    const matterWorld = (this.scene as any).matter.world;

    // 碰撞开始 - 保存监听器引用
    this.collisionStartListener = (event: Matter.Types.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        this.handleCollision('start', pair);
      });
    };
    matterWorld.on('collisionstart', this.collisionStartListener);

    // 碰撞持续 - 保存监听器引用
    this.collisionActiveListener = (event: Matter.Types.CollisionActiveEvent) => {
      event.pairs.forEach((pair) => {
        this.handleCollision('active', pair);
      });
    };
    matterWorld.on('collisionactive', this.collisionActiveListener);

    // 碰撞结束 - 保存监听器引用
    this.collisionEndListener = (event: Matter.Types.CollisionEndEvent) => {
      event.pairs.forEach((pair) => {
        this.handleCollision('end', pair);
      });
    };
    matterWorld.on('collisionend', this.collisionEndListener);
  }

  /**
   * 处理碰撞
   */
  private handleCollision(
    phase: 'start' | 'active' | 'end',
    pair: Matter.Types.CollisionPair
  ): void {
    const { bodyA, bodyB } = pair;
    const labelA = bodyA.label;
    const labelB = bodyB.label;

    // 生成碰撞键
    const key = this.getCollisionKey(labelA, labelB);

    // 调用对应的处理器
    const handler = this.handlers.get(key);
    if (handler) {
      handler(pair);
    }

    // 特殊碰撞处理
    this.handleSpecialCollisions(phase, pair);
  }

  /**
   * 获取碰撞键
   */
  private getCollisionKey(labelA: string, labelB: string): string {
    const labels = [labelA, labelB].sort();
    return `${labels[0]}-${labels[1]}`;
  }

  /**
   * 处理特殊碰撞
   */
  private handleSpecialCollisions(
    phase: 'start' | 'active' | 'end',
    pair: Matter.Types.CollisionPair
  ): void {
    if (phase !== 'start') return;

    const { bodyA, bodyB } = pair;

    // 玩家与目标碰撞
    if (
      (bodyA.label === 'player' && bodyB.label === 'goal') ||
      (bodyA.label === 'goal' && bodyB.label === 'player')
    ) {
      this.handlePlayerGoalCollision(
        bodyA.label === 'player' ? bodyA : bodyB,
        bodyA.label === 'goal' ? bodyA : bodyB
      );
    }

    // 玩家与危险物碰撞
    if (
      (bodyA.label === 'player' && bodyB.label === 'hazard') ||
      (bodyA.label === 'hazard' && bodyB.label === 'player')
    ) {
      this.handlePlayerHazardCollision();
    }
  }

  /**
   * 处理玩家与目标碰撞
   */
  private handlePlayerGoalCollision(
    playerBody: Matter.Body,
    goalBody: Matter.Body
  ): void {
    // 获取目标游戏对象
    const goal = (goalBody as any).gameObject;
    if (goal && typeof goal.collect === 'function') {
      goal.collect();
      
      // 触发事件
      this.scene.events.emit('goalCollected', goal);
    }
  }

  /**
   * 处理玩家与危险物碰撞
   */
  private handlePlayerHazardCollision(): void {
    // 触发玩家受伤事件
    this.scene.events.emit('playerHit');
  }

  /**
   * 注册碰撞处理器
   */
  registerHandler(
    labelA: string,
    labelB: string,
    handler: CollisionHandler
  ): void {
    const key = this.getCollisionKey(labelA, labelB);
    this.handlers.set(key, handler);
  }

  /**
   * 移除碰撞处理器
   */
  unregisterHandler(labelA: string, labelB: string): void {
    const key = this.getCollisionKey(labelA, labelB);
    this.handlers.delete(key);
  }

  /**
   * 清除所有处理器
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * 检测两个物体是否碰撞
   */
  isColliding(gameObjectA: Phaser.GameObjects.GameObject, gameObjectB: Phaser.GameObjects.GameObject): boolean {
    const bodyA = (gameObjectA as any).body as Matter.Body;
    const bodyB = (gameObjectB as any).body as Matter.Body;

    if (!bodyA || !bodyB) return false;

    return Matter.Collision.collides(bodyA, bodyB).collided;
  }

  /**
   * 获取碰撞点
   */
  getCollisionPoint(gameObjectA: Phaser.GameObjects.GameObject, gameObjectB: Phaser.GameObjects.GameObject): Phaser.Math.Vector2 | null {
    const bodyA = (gameObjectA as any).body as Matter.Body;
    const bodyB = (gameObjectB as any).body as Matter.Body;

    if (!bodyA || !bodyB) return null;

    const collision = Matter.Collision.collides(bodyA, bodyB);
    if (collision.collided && collision.supports.length > 0) {
      const support = collision.supports[0];
      return new Phaser.Math.Vector2(support.x, support.y);
    }

    return null;
  }

  /**
   * 清理所有资源 - 修复内存泄漏
   */
  destroy(): void {
    const matterWorld = (this.scene as any).matter.world;

    // 移除所有事件监听器
    if (this.collisionStartListener) {
      matterWorld.off('collisionstart', this.collisionStartListener);
      this.collisionStartListener = null;
    }

    if (this.collisionActiveListener) {
      matterWorld.off('collisionactive', this.collisionActiveListener);
      this.collisionActiveListener = null;
    }

    if (this.collisionEndListener) {
      matterWorld.off('collisionend', this.collisionEndListener);
      this.collisionEndListener = null;
    }

    // 清理所有处理器
    this.clearHandlers();
  }
}
