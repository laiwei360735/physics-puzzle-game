/**
 * 游戏主场景 - 核心游戏玩法
 * 
 * 已修复 P0 Bug:
 * - ✅ 实现拖拽功能
 * - ✅ 实现碰撞检测回调
 * - ✅ 添加 shutdown/destroy 方法清理资源
 * - ✅ 移除重复的世界边界创建
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { Goal } from '../entities/Goal';
import { InputManager } from '../systems/InputManager';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LevelManager, LevelData } from '../systems/LevelManager';
import { GameStateManager, GameState } from '../systems/GameStateManager';

export class GameScene extends Phaser.Scene {
  private level!: number;
  private score: number = 0;
  private isPaused: boolean = false;

  // 核心系统
  private inputManager!: InputManager;
  private collisionSystem!: CollisionSystem;
  private levelManager!: LevelManager;
  private gameStateManager!: GameStateManager;

  // 游戏对象
  private player!: Player | null;
  private obstacles: Obstacle[] = [];
  private goals: Goal[] = [];

  // 拖拽状态
  private isDragging: boolean = false;
  private dragConstraint: any = null;
  private dragObject: Phaser.Physics.Matter.MatterBody | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level: number }): void {
    this.level = data.level || 1;
    this.score = 0;
    this.isPaused = false;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 初始化系统
    this.levelManager = new LevelManager();
    this.gameStateManager = new GameStateManager();
    this.inputManager = new InputManager(this);
    this.collisionSystem = new CollisionSystem(this);

    // 设置 Matter.js 配置 - 只使用 setBounds，不重复创建墙壁
    this.matter.world.setBounds(0, 0, width, height);
    this.matter.setGravity(0, 1); // 标准重力

    // 加载关卡
    this.loadLevel(this.level);

    // 设置输入控制（拖拽功能）
    this.setupInput();

    // 设置碰撞检测
    this.setupCollisions();

    // 创建 UI
    this.createUI();

    // 设置游戏状态
    this.gameStateManager.setState('playing');

    console.log(`🎮 游戏场景创建 - 关卡 ${this.level}`);
  }

  update(time: number, delta: number): void {
    if (this.isPaused || this.gameStateManager.getState() !== 'playing') return;

    // 更新拖拽逻辑
    this.updateDrag();

    // 检查关卡完成条件
    this.checkLevelComplete();
  }

  /**
   * 加载关卡
   */
  private loadLevel(levelNum: number): void {
    const levelData = this.levelManager.getLevel(levelNum);
    if (!levelData) {
      console.error(`关卡 ${levelNum} 不存在`);
      return;
    }

    this.buildLevel(levelData);
  }

  /**
   * 构建关卡
   */
  private buildLevel(levelData: LevelData): void {
    // 创建玩家
    if (levelData.player) {
      this.player = new Player(
        this,
        levelData.player.x,
        levelData.player.y,
        levelData.player.radius || 25
      );
    }

    // 创建障碍物
    if (levelData.obstacles) {
      levelData.obstacles.forEach(obs => {
        const obstacle = new Obstacle(this, obs);
        this.obstacles.push(obstacle);
      });
    }

    // 创建目标
    if (levelData.goals) {
      levelData.goals.forEach(goal => {
        const goalObj = new Goal(this, goal);
        this.goals.push(goalObj);
      });
    }
  }

  /**
   * 设置输入控制 - 实现拖拽功能
   */
  private setupInput(): void {
    // 鼠标/触摸按下
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });

    // 鼠标/触摸移动
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    // 鼠标/触摸释放
    this.input.on('pointerup', () => {
      this.handlePointerUp();
    });
  }

  /**
   * 处理按下事件 - 开始拖拽
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.player || !this.player.body) return;

    const worldPoint = this.matter.mouseConstraint.mouse.position;
    const playerBody = this.player.body;

    // 检查是否点击到玩家
    const distance = Phaser.Math.Distance.Between(
      worldPoint.x,
      worldPoint.y,
      playerBody.position.x,
      playerBody.position.y
    );

    if (distance <= playerBody.circleRadius * 2) {
      this.isDragging = true;
      this.dragObject = playerBody;

      // 创建拖拽约束
      this.dragConstraint = this.matter.add.constraint(
        playerBody,
        { x: worldPoint.x, y: worldPoint.y },
        0,
        {
          stiffness: 0.05,
          damping: 0.1,
          length: 0
        }
      );

      console.log('👆 开始拖拽玩家');
    }
  }

  /**
   * 处理移动事件 - 更新拖拽位置
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !this.dragConstraint) return;

    const worldPoint = this.matter.mouseConstraint.mouse.position;

    // 更新约束的目标点
    if (this.dragConstraint.bodyB) {
      this.dragConstraint.bodyB.x = worldPoint.x;
      this.dragConstraint.bodyB.y = worldPoint.y;
    }
  }

  /**
   * 处理释放事件 - 结束拖拽
   */
  private handlePointerUp(): void {
    if (!this.isDragging) return;

    // 移除拖拽约束
    if (this.dragConstraint) {
      this.matter.world.removeConstraint(this.dragConstraint);
      this.dragConstraint = null;
    }

    this.isDragging = false;
    this.dragObject = null;

    console.log('👋 释放玩家');
  }

  /**
   * 更新拖拽逻辑
   */
  private updateDrag(): void {
    if (this.isDragging && this.dragConstraint && this.player?.body) {
      // 拖拽中，物理引擎会自动处理
    }
  }

  /**
   * 设置碰撞检测
   */
  private setupCollisions(): void {
    // 玩家与目标碰撞
    this.matter.world.on('collisionstart', (event: Matter.Events.CollisionStart) => {
      event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 检查玩家是否碰到目标
        this.goals.forEach(goal => {
          if (!this.player?.body) return;

          if ((bodyA === this.player.body && bodyB === goal.body) ||
              (bodyB === this.player.body && bodyA === goal.body)) {
            this.handlePlayerReachGoal(goal);
          }
        });
      });
    });
  }

  /**
   * 处理玩家到达目标
   */
  private handlePlayerReachGoal(goal: Goal): void {
    if (this.gameStateManager.getState() !== 'playing') return;

    console.log('🎯 玩家到达目标！');

    // 播放成功效果
    this.tweens.add({
      targets: goal.sprite,
      scale: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.levelComplete();
      }
    });
  }

  /**
   * 检查关卡完成
   */
  private checkLevelComplete(): void {
    // 额外检查：玩家是否掉出世界
    if (this.player?.body) {
      const { height } = this.cameras.main;
      if (this.player.body.position.y > height + 100) {
        this.levelFailed();
      }
    }
  }

  /**
   * 关卡完成
   */
  private levelComplete(): void {
    this.gameStateManager.setState('levelComplete');
    this.score += 100;

    console.log(`✅ 关卡 ${this.level} 完成！得分：${this.score}`);

    // 延迟显示结算界面
    this.time.delayedCall(500, () => {
      this.scene.launch('LevelCompleteScene', {
        level: this.level,
        score: this.score,
        stars: 3 // TODO: 根据表现计算星级
      });
    });
  }

  /**
   * 关卡失败
   */
  private levelFailed(): void {
    this.gameStateManager.setState('failed');

    console.log(`❌ 关卡 ${this.level} 失败`);

    // TODO: 显示失败界面
  }

  /**
   * 创建 UI
   */
  private createUI(): void {
    // 创建分数文本
    const scoreText = this.add.text(20, 20, `得分：${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreText.setScrollFactor(0);
    scoreText.setDepth(100);

    // 创建暂停按钮
    const pauseBtn = this.add.text(this.cameras.main.width - 100, 20, '⏸️', {
      fontSize: '32px'
    });
    pauseBtn.setScrollFactor(0);
    pauseBtn.setDepth(100);
    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.togglePause());
  }

  /**
   * 切换暂停状态
   */
  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.matter.world.pause(this.isPaused);

    if (this.isPaused) {
      this.gameStateManager.setState('paused');
    } else {
      this.gameStateManager.setState('playing');
    }
  }

  /**
   * 场景关闭时清理资源 - 修复内存泄漏
   */
  shutdown(): void {
    console.log('🧹 清理游戏场景资源');

    // 清理拖拽约束
    if (this.dragConstraint) {
      this.matter.world.removeConstraint(this.dragConstraint);
      this.dragConstraint = null;
    }

    // 清理碰撞监听器
    this.matter.world.removeAllListeners('collisionstart');

    // 清理输入监听器
    this.input.removeAllListeners();

    // 清理游戏对象
    this.player?.destroy();
    this.obstacles.forEach(obs => obs.destroy());
    this.goals.forEach(goal => goal.destroy());

    this.obstacles = [];
    this.goals = [];
    this.player = null;
    this.isDragging = false;
    this.dragObject = null;
  }

  /**
   * 场景销毁时彻底清理 - 修复内存泄漏
   */
  destroy(): void {
    this.shutdown();
    super.destroy();
  }
}
