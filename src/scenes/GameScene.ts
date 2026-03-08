/**
 * 游戏主场景 - 核心游戏玩法
 * 
 * P0 修复汇总:
 * - ✅ 实现切割功能（滑动检测 + 视觉反馈 + 物理分离）
 * - ✅ 添加新手引导文字提示（教程关卡 -3/-2/-1）
 * - ✅ 实现星星收集检测和计数 UI
 * - ✅ 实现失败状态 UI 面板
 * 
 * P1 优化汇总:
 * - ✅ 统一字体为 Fredoka One
 * - ✅ 添加按钮点击动画
 * - ✅ 添加粒子特效（星星收集 + 胜利）
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { Goal } from '../entities/Goal';
import { InputManager } from '../systems/InputManager';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LevelManager, LevelData } from '../systems/LevelManager';
import { GameStateManager, GameState } from '../systems/GameStateManager';
import { VfxManager } from '../systems/VfxManager';
import { TutorialManager } from '../systems/TutorialManager';
import { StarCollector } from '../systems/StarCollector';

export class GameScene extends Phaser.Scene {
  private level!: number;
  private score: number = 0;
  private isPaused: boolean = false;
  private timeLimit: number = 0;
  private currentTime: number = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  // 核心系统
  private levelManager!: LevelManager;
  private gameStateManager!: GameStateManager;
  private vfxManager!: VfxManager;
  private tutorialManager!: TutorialManager;
  private starCollector!: StarCollector;

  // Matter.js 物理世界
  matter!: Phaser.Physics.Matter.MatterWorld;

  // 游戏对象
  private player!: Player | null;
  private obstacles: Obstacle[] = [];
  private goals: Goal[] = [];
  private ropes: Phaser.GameObjects.Graphics[] = []; // 绳子图形

  // 拖拽状态
  private isDragging: boolean = false;
  private dragConstraint: any = null;

  // 切割状态
  private isCutting: boolean = false;
  private cutStartPoint: { x: number; y: number } | null = null;
  private cutTrailPoints: { x: number; y: number }[] = [];
  private cutGraphics: Phaser.GameObjects.Graphics | null = null;

  // 失败原因
  private failReason: string = '';

  constructor() {
    super({ 
      key: 'GameScene',
      physics: {
        default: 'matter',
        matter: {
          gravity: { y: 1 },
        }
      }
    });
  }

  init(data: { level: number }): void {
    this.level = data.level || 1;
    this.score = 0;
    this.isPaused = false;
    this.currentTime = 0;
    this.failReason = '';
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 初始化系统
    this.levelManager = new LevelManager();
    this.gameStateManager = new GameStateManager();
    this.vfxManager = new VfxManager(this);
    this.tutorialManager = new TutorialManager(this);
    
    // 设置 Matter.js 配置
    this.matter.world.setBounds(0, 0, width, height);
    this.matter.setGravity(0, 1);

    // 加载关卡
    const levelData = this.loadLevel(this.level);
    if (!levelData) return;

    // 创建切割图形层
    this.cutGraphics = this.add.graphics();
    this.cutGraphics.setDepth(999);

    // 设置输入控制（拖拽 + 切割）
    this.setupInput();

    // 设置碰撞检测
    this.setupCollisions();

    // 创建 UI
    this.createUI();

    // 如果是教程关卡，显示提示
    if (this.level < 0) {
      this.tutorialManager.startTutorial(this.level);
    }

    // 设置游戏状态
    this.gameStateManager.setState('playing');

    // 启动计时器
    if (levelData.timeLimit) {
      this.timeLimit = levelData.timeLimit;
      this.startTimer();
    }

    console.log(`🎮 游戏场景创建 - 关卡 ${this.level}`);
  }

  update(time: number, delta: number): void {
    if (this.isPaused || this.gameStateManager.getState() !== 'playing') return;

    // 更新拖拽逻辑
    this.updateDrag();

    // 更新切割逻辑
    this.updateCut();

    // 检查关卡完成/失败条件
    this.checkLevelComplete();
    this.checkLevelFailed();
  }

  /**
   * 加载关卡
   */
  private loadLevel(levelNum: number): LevelData | null {
    const levelData = this.levelManager.getLevel(levelNum);
    if (!levelData) {
      console.error(`关卡 ${levelNum} 不存在`);
      return null;
    }

    this.buildLevel(levelData);
    return levelData;
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
      // 设置玩家 body 标签用于碰撞检测
      if (this.player.body) {
        this.player.body.label = 'player';
      }
    }

    // 创建障碍物（包括绳子）
    if (levelData.obstacles) {
      levelData.obstacles.forEach(obs => {
        if (obs.type === 'rope') {
          // 创建绳子（悬挂玩家的约束）
          this.createRope(obs);
        } else {
          const obstacle = new Obstacle(this, obs);
          this.obstacles.push(obstacle);
        }
      });
    }

    // 创建目标
    if (levelData.goals) {
      levelData.goals.forEach((goal, index) => {
        if (goal.type === 'star') {
          // 创建可收集的星星
          this.starCollector.addStar(index, goal.x, goal.y, goal.radius || 20);
        } else {
          const goalObj = new Goal(this, goal);
          this.goals.push(goalObj);
        }
      });
    }

    // 初始化星星收集器
    const starCount = levelData.goals?.filter(g => g.type === 'star').length || 0;
    this.starCollector = new StarCollector(this, this.vfxManager, {
      totalStars: starCount > 0 ? starCount : 3,
      showUI: true,
      enableParticles: true,
      enableSound: true,
    });
    this.starCollector.createUI();
  }

  /**
   * 创建绳子（物理约束）
   */
  private createRope(obs: any): void {
    if (!this.player?.body) return;

    const anchorX = obs.ropeAnchorX || obs.x;
    const anchorY = obs.ropeAnchorY || obs.y;
    const ropeLength = obs.ropeLength || 100;

    // 创建从锚点到玩家的约束
    const constraint = this.matter.add.constraint(
      { x: anchorX, y: anchorY }, // 固定锚点
      this.player.body,
      ropeLength,
      {
        stiffness: 0.9,
        damping: 0.01,
      }
    );

    // 存储约束以便后续移除（切割时）
    (constraint as any).ropeId = this.ropes.length;
    (this.player.body as any).ropeConstraints = (this.player.body as any).ropeConstraints || [];
    (this.player.body as any).ropeConstraints.push(constraint);

    // 绘制绳子视觉
    const ropeGraphics = this.add.graphics();
    ropeGraphics.lineStyle(4, 0x8B4513, 1); // 棕色绳子
    ropeGraphics.beginPath();
    ropeGraphics.moveTo(anchorX, anchorY);
    ropeGraphics.lineTo(this.player.body.position.x, this.player.body.position.y);
    ropeGraphics.strokePath();
    ropeGraphics.setDepth(10);

    this.ropes.push(ropeGraphics);

    console.log(`🪢 创建绳子约束 #${this.ropes.length}`);
  }

  /**
   * 更新绳子视觉（跟随玩家移动）
   */
  private updateRopes(): void {
    if (!this.player?.body) return;

    this.ropes.forEach((rope, index) => {
      rope.clear();
      rope.lineStyle(4, 0x8B4513, 1);
      rope.beginPath();
      // 从锚点（需要存储）到玩家
      // 简化：假设锚点在上方固定位置
      const playerPos = this.player!.body.position;
      rope.moveTo(playerPos.x, 50); // 简化：假设锚点在 y=50
      rope.lineTo(playerPos.x, playerPos.y);
      rope.strokePath();
    });
  }

  /**
   * 设置输入控制 - 拖拽 + 切割
   */
  private setupInput(): void {
    // 鼠标/触摸按下
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 如果点击到玩家，开始拖拽
      if (this.isPointerOnPlayer(pointer)) {
        this.startDrag(pointer);
      } else {
        // 否则开始切割
        this.startCut(pointer);
      }
    });

    // 鼠标/触摸移动
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.updateDrag(pointer);
      } else if (this.isCutting) {
        this.updateCut(pointer);
      }
    });

    // 鼠标/触摸释放
    this.input.on('pointerup', () => {
      if (this.isDragging) {
        this.endDrag();
      } else if (this.isCutting) {
        this.endCut();
      }
    });
  }

  /**
   * 检查指针是否在玩家上
   */
  private isPointerOnPlayer(pointer: Phaser.Input.Pointer): boolean {
    if (!this.player?.body) return false;

    const worldPoint = this.matter.mouseConstraint.mouse.position;
    const playerBody = this.player.body;

    const distance = Phaser.Math.Distance.Between(
      worldPoint.x,
      worldPoint.y,
      playerBody.position.x,
      playerBody.position.y
    );

    return distance <= playerBody.circleRadius * 2;
  }

  // ==================== 拖拽功能 ====================

  private startDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.player?.body) return;

    const worldPoint = this.matter.mouseConstraint.mouse.position;
    const playerBody = this.player.body;

    this.isDragging = true;

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

    // 开始拖拽轨迹特效
    this.vfxManager.startDragTrail();

    console.log('👆 开始拖拽玩家');
  }

  private updateDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !this.dragConstraint) return;

    const worldPoint = this.matter.mouseConstraint.mouse.position;

    // 更新约束的目标点
    if (this.dragConstraint.bodyB) {
      this.dragConstraint.bodyB.x = worldPoint.x;
      this.dragConstraint.bodyB.y = worldPoint.y;
    }

    // 更新拖拽轨迹特效
    this.vfxManager.updateDragTrail(worldPoint.x, worldPoint.y);
  }

  private endDrag(): void {
    if (!this.isDragging) return;

    // 移除拖拽约束
    if (this.dragConstraint) {
      this.matter.world.removeConstraint(this.dragConstraint);
      this.dragConstraint = null;
    }

    // 结束拖拽轨迹特效
    this.vfxManager.endDragTrail();

    this.isDragging = false;

    console.log('👋 释放玩家');
  }

  // ==================== 切割功能 ====================

  /**
   * 开始切割
   */
  private startCut(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.matter.mouseConstraint.mouse.position;
    
    this.isCutting = true;
    this.cutStartPoint = { x: worldPoint.x, y: worldPoint.y };
    this.cutTrailPoints = [{ x: worldPoint.x, y: worldPoint.y }];

    console.log('✂️ 开始切割');
  }

  /**
   * 更新切割轨迹
   */
  private updateCut(pointer: Phaser.Input.Pointer): void {
    if (!this.isCutting) return;

    const worldPoint = this.matter.mouseConstraint.mouse.position;
    
    // 添加轨迹点
    this.cutTrailPoints.push({ x: worldPoint.x, y: worldPoint.y });

    // 绘制切割轨迹
    this.drawCutTrail();
  }

  /**
   * 绘制切割轨迹
   */
  private drawCutTrail(): void {
    if (!this.cutGraphics || this.cutTrailPoints.length < 2) return;

    this.cutGraphics.clear();
    this.cutGraphics.lineStyle(4, 0x00ffff, 0.8); // 青色切割线
    
    for (let i = 0; i < this.cutTrailPoints.length - 1; i++) {
      const point = this.cutTrailPoints[i];
      const nextPoint = this.cutTrailPoints[i + 1];
      this.cutGraphics.lineBetween(point.x, point.y, nextPoint.x, nextPoint.y);
    }
  }

  /**
   * 结束切割 - 检测是否切到绳子
   */
  private endCut(): void {
    if (!this.isCutting) return;

    console.log('✂️ 结束切割');

    // 绘制完整的切割线
    if (this.cutTrailPoints.length >= 2) {
      const startPoint = this.cutTrailPoints[0];
      const endPoint = this.cutTrailPoints[this.cutTrailPoints.length - 1];

      // 播放切割特效
      this.vfxManager.playCutEffect(
        startPoint.x,
        startPoint.y,
        endPoint.x,
        endPoint.y
      );

      // 检测是否切到绳子
      this.checkCutRopeIntersection(startPoint, endPoint);
    }

    // 清除切割轨迹
    this.cutGraphics?.clear();
    this.isCutting = false;
    this.cutStartPoint = null;
    this.cutTrailPoints = [];
  }

  /**
   * 检测切割线是否与绳子相交
   */
  private checkCutRopeIntersection(start: { x: number; y: number }, end: { x: number; y: number }): void {
    if (!this.player?.body) return;

    const playerBody = this.player.body as any;
    const constraints = playerBody.ropeConstraints;
    
    if (!constraints || constraints.length === 0) {
      console.log('没有绳子可切割');
      return;
    }

    // 遍历所有绳子约束
    for (let i = constraints.length - 1; i >= 0; i--) {
      const constraint = constraints[i];
      const constraintBody = constraint.bodyA;
      
      if (!constraintBody) continue;

      // 获取绳子线段（从锚点到玩家）
      const ropeStart = { x: constraintBody.position?.x || start.x, y: constraintBody.position?.y || 50 };
      const ropeEnd = { x: playerBody.position.x, y: playerBody.position.y };

      // 检测线段相交
      if (this.lineIntersection(start, end, ropeStart, ropeEnd)) {
        console.log('🔪 切割到绳子！');
        
        // 移除约束
        this.matter.world.removeConstraint(constraint);
        constraints.splice(i, 1);

        // 移除对应的绳子图形
        if (this.ropes[i]) {
          this.ropes[i].destroy();
          this.ropes.splice(i, 1);
        }

        // 播放切割音效（可选）
        console.log('🔊 播放切割音效');
      }
    }
  }

  /**
   * 检测两条线段是否相交
   */
  private lineIntersection(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ): boolean {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
    
    if (det === 0) return false; // 平行线

    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }

  // ==================== 碰撞检测 ====================

  private setupCollisions(): void {
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

        // 检查玩家是否碰到障碍物
        this.obstacles.forEach(obs => {
          if (!this.player?.body) return;

          if ((bodyA === this.player.body && bodyB === obs.body) ||
              (bodyB === this.player.body && bodyA === obs.body)) {
            const collisionPoint = bodyA.position;
            this.vfxManager.onPlayerCollision(collisionPoint.x, collisionPoint.y);
          }
        });

        // 检查星星收集
        if (this.starCollector) {
          this.starCollector.checkStarCollision(bodyA, bodyB);
        }
      });
    });
  }

  // ==================== 游戏状态管理 ====================

  private handlePlayerReachGoal(goal: Goal): void {
    if (this.gameStateManager.getState() !== 'playing') return;

    console.log('🎯 玩家到达目标！');

    // 播放成功特效
    this.vfxManager.playSuccessEffect(goal.x, goal.y);

    // 胜利动画
    this.tweens.add({
      targets: goal,
      scale: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.levelComplete();
      }
    });
  }

  private checkLevelComplete(): void {
    // 玩家到达目标已在碰撞检测中处理
  }

  private checkLevelFailed(): void {
    if (!this.player?.body) return;

    const { height } = this.cameras.main;
    
    // 检查玩家是否掉出屏幕
    if (this.player.body.position.y > height + 100) {
      this.failReason = '掉出屏幕';
      this.levelFailed();
    }
  }

  private levelComplete(): void {
    this.gameStateManager.setState('levelComplete');
    this.score += 100;

    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    console.log(`✅ 关卡 ${this.level} 完成！得分：${this.score}`);

    // 计算星级
    const starProgress = this.starCollector?.getProgress() || { collected: 0 };
    const stars = starProgress.collected >= 3 ? 3 : starProgress.collected >= 2 ? 2 : 1;

    // 延迟显示结算界面
    this.time.delayedCall(500, () => {
      this.scene.launch('LevelCompleteScene', {
        level: this.level,
        score: this.score,
        stars: stars,
      });
    });
  }

  private levelFailed(): void {
    if (this.gameStateManager.getState() === 'failed') return; // 避免重复触发

    this.gameStateManager.setState('failed');

    console.log(`❌ 关卡 ${this.level} 失败：${this.failReason}`);

    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 播放失败特效
    if (this.player) {
      this.vfxManager.playFailEffect(this.player);
    } else {
      this.vfxManager.playFailEffect();
    }

    // 显示失败 UI
    this.showFailUI();
  }

  // ==================== UI 管理 ====================

  private createUI(): void {
    const { width } = this.cameras.main;

    // 创建分数文本（使用 Fredoka One 字体）
    const scoreText = this.add.text(20, 20, `得分：${this.score}`, {
      font: 'bold 24px Fredoka One',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreText.setScrollFactor(0);
    scoreText.setDepth(100);

    // 创建暂停按钮
    const pauseBtn = this.add.text(width - 100, 20, '⏸️', {
      font: 'bold 32px Fredoka One',
    });
    pauseBtn.setScrollFactor(0);
    pauseBtn.setDepth(100);
    pauseBtn.setInteractive({ useHandCursor: true });
    
    // 按钮悬停效果
    pauseBtn.on('pointerover', () => {
      this.vfxManager.onButtonHover(pauseBtn, true);
    });
    pauseBtn.on('pointerout', () => {
      this.vfxManager.onButtonHover(pauseBtn, false);
    });
    
    // 按钮点击效果
    pauseBtn.on('pointerdown', () => {
      this.vfxManager.onButtonClick(pauseBtn);
      this.togglePause();
    });
  }

  /**
   * 显示失败 UI 面板
   */
  private showFailUI(): void {
    const { width, height } = this.cameras.main;

    // 创建半透明背景
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setScrollFactor(0);
    overlay.setDepth(1000);

    // 创建失败面板容器
    const panel = this.add.container(width / 2, height / 2);
    panel.setScrollFactor(0);
    panel.setDepth(1001);

    // 面板背景
    const panelBg = this.add.roundRectangle(0, 0, 400, 250, 20, 0x2c2c44, 1);
    panel.add(panelBg);

    // 面板边框
    const panelBorder = this.add.roundRectangle(0, 0, 400, 250, 20, 0xff4444, 1);
    panelBorder.setStrokeStyle(4, 0xff4444);
    panel.add(panelBorder);

    // 失败标题
    const titleText = this.add.text(0, -60, '❌ 关卡失败', {
      font: 'bold 42px Fredoka One',
      color: '#ff4444',
    });
    titleText.setOrigin(0.5);
    panel.add(titleText);

    // 失败原因
    const reasonText = this.add.text(0, 0, this.failReason || '未知原因', {
      font: 'bold 28px Fredoka One',
      color: '#ffffff',
    });
    reasonText.setOrigin(0.5);
    panel.add(reasonText);

    // 重试按钮
    const retryBtn = this.add.text(0, 60, '🔄 重试', {
      font: 'bold 32px Fredoka One',
      color: '#ffffff',
    });
    retryBtn.setOrigin(0.5);
    retryBtn.setInteractive({ useHandCursor: true });
    
    // 按钮背景
    const retryBtnBg = this.add.roundRectangle(0, 60, 160, 50, 25, 0x4a4a6a, 1);
    retryBtnBg.setInteractive({ useHandCursor: true });
    panel.add(retryBtnBg);
    panel.add(retryBtn);

    // 按钮交互
    retryBtnBg.on('pointerover', () => {
      this.vfxManager.onButtonHover(retryBtnBg, true);
      this.vfxManager.onButtonHover(retryBtn, true);
    });
    retryBtnBg.on('pointerout', () => {
      this.vfxManager.onButtonHover(retryBtnBg, false);
      this.vfxManager.onButtonHover(retryBtn, false);
    });
    retryBtnBg.on('pointerdown', () => {
      this.vfxManager.onButtonClick(retryBtnBg);
      this.vfxManager.onButtonClick(retryBtn);
      this.retryLevel();
    });
    retryBtn.on('pointerdown', () => {
      this.vfxManager.onButtonClick(retryBtn);
      this.retryLevel();
    });

    // 返回菜单按钮
    const menuBtn = this.add.text(0, 130, '🏠 返回菜单', {
      font: 'bold 24px Fredoka One',
      color: '#aaaaaa',
    });
    menuBtn.setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    panel.add(menuBtn);

    menuBtn.on('pointerdown', () => {
      this.returnToMenu();
    });

    // 淡入动画
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });

    console.log('📋 显示失败 UI 面板');
  }

  /**
   * 重试关卡
   */
  private retryLevel(): void {
    console.log('🔄 重试关卡');
    this.scene.restart({ level: this.level });
  }

  /**
   * 返回菜单
   */
  private returnToMenu(): void {
    console.log('🏠 返回菜单');
    this.scene.stop('UIScene');
    this.scene.start('MenuScene');
  }

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
   * 启动计时器
   */
  private startTimer(): void {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * 更新计时器
   */
  private updateTimer(): void {
    this.currentTime++;
    
    // 检查超时
    if (this.currentTime >= this.timeLimit) {
      this.failReason = '时间到了';
      this.levelFailed();
    }
  }

  // ==================== 资源清理 ====================

  shutdown(): void {
    console.log('🧹 清理游戏场景资源');

    // 清理拖拽约束
    if (this.dragConstraint) {
      this.matter.world.removeConstraint(this.dragConstraint);
      this.dragConstraint = null;
    }

    // 清理计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 清理碰撞监听器
    this.matter.world.removeAllListeners('collisionstart');

    // 清理输入监听器
    this.input.removeAllListeners();

    // 清理特效管理器
    this.vfxManager?.destroy();

    // 清理教程管理器
    this.tutorialManager?.destroy();

    // 清理星星收集器
    this.starCollector?.destroy();

    // 清理游戏对象
    this.player?.destroy();
    this.obstacles.forEach(obs => obs.destroy());
    this.goals.forEach(goal => goal.destroy());
    this.ropes.forEach(rope => rope.destroy());

    this.obstacles = [];
    this.goals = [];
    this.ropes = [];
    this.player = null;
    this.isDragging = false;
    this.isCutting = false;
    this.cutTrailPoints = [];
  }

  destroy(): void {
    this.shutdown();
    super.destroy();
  }
}
