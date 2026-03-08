/**
 * 游戏主场景 - 核心游戏玩法
 */

import Phaser from 'phaser';
import Matter from 'matter-js';

interface GameSceneData {
  level: number;
}

export class GameScene extends Phaser.Scene {
  private level!: number;
  private score: number = 0;
  private isPaused: boolean = false;

  // Matter.js 实体
  private matterWorld!: Matter.World;
  private matterRunner!: Matter.Runner;

  // 游戏对象组
  private playerGroup!: Phaser.Physics.Matter.MatterBody[];
  private obstacleGroup!: Phaser.GameObjects.Container[];
  private goalGroup!: Phaser.GameObjects.Container[];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.level = data.level || 1;
    this.score = 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 获取 Matter.js 世界
    this.matterWorld = this.matter.world;

    // 设置世界边界
    this.createWorldBoundaries(width, height);

    // 初始化游戏对象组
    this.playerGroup = [];
    this.obstacleGroup = [];
    this.goalGroup = [];

    // 加载关卡
    this.loadLevel(this.level);

    // 设置碰撞检测
    this.setupCollisions();

    // 启动物理引擎
    this.startPhysics();

    // 创建 UI
    this.createUI();

    // 输入控制
    this.setupInput();

    console.log(`游戏场景创建 - 关卡 ${this.level}`);
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    // 游戏主循环逻辑
    this.updateGameLogic(time, delta);
  }

  /**
   * 创建世界边界
   */
  private createWorldBoundaries(width: number, height: number): void {
    const wallThickness = 100;
    
    this.matterWorld.setBounds(0, 0, width, height);
    
    // 添加额外的边界墙（如果需要）
    const walls = [
      this.matter.add.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }),
      this.matter.add.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }),
      this.matter.add.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
      this.matter.add.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
    ];
  }

  /**
   * 加载关卡
   */
  private loadLevel(levelNum: number): void {
    // 根据关卡编号加载不同的关卡配置
    // TODO: 实现关卡数据加载系统
    const levelData = this.getLevelData(levelNum);
    this.buildLevel(levelData);
  }

  /**
   * 获取关卡数据
   */
  private getLevelData(levelNum: number): any {
    // 示例关卡数据 - 实际应从文件或服务端加载
    return {
      player: { x: 100, y: 300, type: 'circle' },
      obstacles: [
        { x: 400, y: 400, type: 'rectangle', width: 200, height: 20 },
        { x: 600, y: 300, type: 'triangle' },
      ],
      goal: { x: 700, y: 200 },
    };
  }

  /**
   * 构建关卡
   */
  private buildLevel(levelData: any): void {
    const { width, height } = this.cameras.main;

    // 创建玩家
    this.createPlayer(levelData.player.x, levelData.player.y);

    // 创建障碍物
    levelData.obstacles.forEach((obs: any) => {
      this.createObstacle(obs.x, obs.y, obs.type, obs.width, obs.height);
    });

    // 创建目标
    this.createGoal(levelData.goal.x, levelData.goal.y);
  }

  /**
   * 创建玩家
   */
  private createPlayer(x: number, y: number): void {
    const player = this.matter.add.image(x, y, 'circle');
    this.matter.setCircle(player, 25);
    this.matter.setBounce(player, 0.5);
    this.matter.setFriction(player, 0.1);
    
    player.setInteractive();
    this.playerGroup.push(player);
  }

  /**
   * 创建障碍物
   */
  private createObstacle(x: number, y: number, type: string, width?: number, height?: number): void {
    let obstacle: Phaser.GameObjects.Container;

    if (type === 'rectangle') {
      const rect = this.add.rectangle(0, 0, width || 100, height || 20, 0x888888);
      obstacle = this.add.container(x, y, [rect]);
      
      const body = this.matter.add.gameObject(rect, {
        isStatic: true,
        friction: 0.8,
      });
    } else if (type === 'triangle') {
      const triangle = this.add.polygon(0, 0, 3, 40, 0x884444);
      obstacle = this.add.container(x, y, [triangle]);
      
      const body = this.matter.add.gameObject(triangle, {
        isStatic: true,
        friction: 0.8,
      });
    }

    if (obstacle) {
      this.obstacleGroup.push(obstacle);
    }
  }

  /**
   * 创建目标
   */
  private createGoal(x: number, y: number): void {
    const goal = this.add.circle(x, y, 30, 0x00ff00, 0.8);
    goal.setInteractive();
    
    const body = this.matter.add.gameObject(goal, {
      isSensor: true, // 传感器，不产生物理碰撞
    });

    this.goalGroup.push(goal);
  }

  /**
   * 设置碰撞检测
   */
  private setupCollisions(): void {
    this.matterWorld.on('collisionstart', (event: Matter.Types.CollisionStartEvent) => {
      const pairs = event.pairs;

      pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        
        // 检测玩家与目标的碰撞
        this.checkGoalCollision(bodyA, bodyB);
      });
    });
  }

  /**
   * 检查目标碰撞
   */
  private checkGoalCollision(bodyA: Matter.Body, bodyB: Matter.Body): void {
    // TODO: 实现碰撞逻辑
  }

  /**
   * 启动物理引擎
   */
  private startPhysics(): void {
    // Matter.js runner 已由 Phaser 自动管理
  }

  /**
   * 创建 UI
   */
  private createUI(): void {
    const { width } = this.cameras.main;

    // 分数显示
    this.add.text(20, 20, `分数：${this.score}`, {
      font: '24px Arial',
      color: '#ffffff',
    });

    // 关卡显示
    this.add.text(width - 120, 20, `关卡：${this.level}`, {
      font: '24px Arial',
      color: '#ffffff',
    });

    // 暂停按钮
    const pauseBtn = this.add.text(width - 60, 20, '⏸', {
      font: '24px Arial',
      color: '#ffffff',
    });
    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.togglePause());
  }

  /**
   * 设置输入控制
   */
  private setupInput(): void {
    // 键盘控制
    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause();
    });

    // 触摸/鼠标控制
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    this.input.on('pointerup', () => {
      this.handlePointerUp();
    });
  }

  /**
   * 处理指针按下
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    // TODO: 实现玩家控制逻辑
  }

  /**
   * 处理指针移动
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    // TODO: 实现拖拽逻辑
  }

  /**
   * 处理指针释放
   */
  private handlePointerUp(): void {
    // TODO: 实现释放逻辑
  }

  /**
   * 切换暂停状态
   */
  private togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.matterWorld.pause();
    } else {
      this.matterWorld.resume();
    }
  }

  /**
   * 更新游戏逻辑
   */
  private updateGameLogic(time: number, delta: number): void {
    // 检查玩家是否掉落
    this.checkPlayerFall();
  }

  /**
   * 检查玩家掉落
   */
  private checkPlayerFall(): void {
    const { height } = this.cameras.main;
    
    this.playerGroup.forEach((player) => {
      if (player.position.y > height + 100) {
        // 玩家掉落，重置关卡
        this.scene.restart();
      }
    });
  }

  /**
   * 增加分数
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * 完成关卡
   */
  completeLevel(): void {
    this.scene.start('LevelCompleteScene', {
      level: this.level,
      score: this.score,
    });
  }
}
