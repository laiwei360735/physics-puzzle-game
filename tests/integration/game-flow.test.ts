/**
 * 游戏流程集成测试
 * 测试游戏核心流程的集成情况
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// 模拟游戏状态
interface GameSession {
  userId: string;
  currentLevel: string | null;
  progress: Map<string, LevelProgress>;
  settings: GameSettings;
  isPaused: boolean;
}

interface LevelProgress {
  stars: number;
  bestTime?: number;
  completed: boolean;
}

interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
}

// 模拟游戏管理器
class GameManager {
  private session: GameSession | null = null;
  private levelManager: any;
  private saveManager: any;

  constructor() {
    this.levelManager = new LevelManagerMock();
    this.saveManager = new SaveManagerMock();
  }

  // 初始化游戏
  initialize(userId: string): boolean {
    try {
      this.session = {
        userId,
        currentLevel: null,
        progress: new Map(),
        settings: {
          musicVolume: 0.5,
          sfxVolume: 0.5,
          difficulty: 'normal'
        },
        isPaused: false
      };
      return true;
    } catch (e) {
      return false;
    }
  }

  // 开始游戏
  startGame(): boolean {
    if (!this.session) return false;
    // 加载用户进度
    const savedProgress = this.saveManager.load(this.session.userId);
    if (savedProgress) {
      this.session.progress = savedProgress;
    }
    return true;
  }

  // 选择关卡
  selectLevel(levelId: string): boolean {
    if (!this.session) return false;
    if (!this.levelManager.isLevelUnlocked(levelId, this.session.progress)) {
      return false;
    }
    this.session.currentLevel = levelId;
    return true;
  }

  // 完成关卡
  completeLevel(stars: number, time: number): boolean {
    if (!this.session || !this.session.currentLevel) return false;
    
    const progress: LevelProgress = {
      stars,
      bestTime: time,
      completed: true
    };
    this.session.progress.set(this.session.currentLevel, progress);
    
    // 自动保存
    this.saveManager.save(this.session.userId, this.session.progress);
    
    // 解锁下一关
    this.levelManager.unlockNextLevel(this.session.currentLevel);
    
    return true;
  }

  // 暂停游戏
  pause(): boolean {
    if (!this.session) return false;
    this.session.isPaused = true;
    return true;
  }

  // 继续游戏
  resume(): boolean {
    if (!this.session) return false;
    this.session.isPaused = false;
    return true;
  }

  // 退出关卡
  exitLevel(): boolean {
    if (!this.session) return false;
    this.session.currentLevel = null;
    return true;
  }

  // 获取当前状态
  getSession(): GameSession | null {
    return this.session;
  }
}

// 模拟关卡管理器 - 使用静态存储实现跨实例持久化
class LevelManagerMock {
  private static unlockedLevels: Set<string> = new Set(['level-1']);

  static reset(): void {
    LevelManagerMock.unlockedLevels = new Set(['level-1']);
  }

  isLevelUnlocked(levelId: string, progress: Map<string, LevelProgress>): boolean {
    return LevelManagerMock.unlockedLevels.has(levelId);
  }

  unlockNextLevel(currentLevelId: string): void {
    const levelNum = parseInt(currentLevelId.split('-')[1]);
    if (!isNaN(levelNum)) {
      LevelManagerMock.unlockedLevels.add(`level-${levelNum + 1}`);
    }
  }
}

// 模拟存档管理器 - 使用静态存储实现跨实例持久化
class SaveManagerMock {
  private static storage: Map<string, Map<string, LevelProgress>> = new Map();

  static reset(): void {
    SaveManagerMock.storage = new Map();
  }

  save(userId: string, progress: Map<string, LevelProgress>): boolean {
    try {
      SaveManagerMock.storage.set(userId, new Map(progress));
      return true;
    } catch (e) {
      return false;
    }
  }

  load(userId: string): Map<string, LevelProgress> | null {
    const data = SaveManagerMock.storage.get(userId);
    return data ? new Map(data) : null;
  }
}

describe('游戏流程集成测试', () => {
  let gameManager: GameManager;

  beforeEach(() => {
    // 重置静态存储，确保测试隔离
    LevelManagerMock.reset();
    SaveManagerMock.reset();
    gameManager = new GameManager();
  });

  describe('IT-GAME-001: 启动流程', () => {
    it('应该成功初始化游戏', () => {
      const success = gameManager.initialize('user-123');
      expect(success).toBe(true);
      
      const session = gameManager.getSession();
      expect(session).not.toBeNull();
      expect(session!.userId).toBe('user-123');
    });

    it('应该设置默认配置', () => {
      gameManager.initialize('user-123');
      const session = gameManager.getSession();
      
      expect(session!.settings.musicVolume).toBe(0.5);
      expect(session!.settings.sfxVolume).toBe(0.5);
      expect(session!.settings.difficulty).toBe('normal');
    });
  });

  describe('IT-GAME-002: 开始游戏', () => {
    beforeEach(() => {
      gameManager.initialize('user-123');
    });

    it('应该成功开始游戏', () => {
      const success = gameManager.startGame();
      expect(success).toBe(true);
    });

    it('未初始化不能开始游戏', () => {
      const newGameManager = new GameManager();
      const success = newGameManager.startGame();
      expect(success).toBe(false);
    });
  });

  describe('IT-GAME-003: 选择关卡', () => {
    beforeEach(() => {
      gameManager.initialize('user-123');
      gameManager.startGame();
    });

    it('应该成功选择已解锁的关卡', () => {
      const success = gameManager.selectLevel('level-1');
      expect(success).toBe(true);
      
      const session = gameManager.getSession();
      expect(session!.currentLevel).toBe('level-1');
    });

    it('不能选择未解锁的关卡', () => {
      const success = gameManager.selectLevel('level-2');
      expect(success).toBe(false);
      
      const session = gameManager.getSession();
      expect(session!.currentLevel).toBe(null);
    });
  });

  describe('IT-GAME-005: 通关流程', () => {
    beforeEach(() => {
      gameManager.initialize('user-123');
      gameManager.startGame();
      gameManager.selectLevel('level-1');
    });

    it('应该成功完成关卡', () => {
      const success = gameManager.completeLevel(3, 120);
      expect(success).toBe(true);
    });

    it('完成后应该解锁下一关', () => {
      gameManager.completeLevel(3, 120);
      
      // 现在应该可以选择 level-2 了
      const canSelectLevel2 = gameManager.selectLevel('level-2');
      expect(canSelectLevel2).toBe(true);
    });
  });

  describe('IT-GAME-007: 暂停/继续', () => {
    beforeEach(() => {
      gameManager.initialize('user-123');
      gameManager.startGame();
      gameManager.selectLevel('level-1');
    });

    it('应该成功暂停游戏', () => {
      const success = gameManager.pause();
      expect(success).toBe(true);
      
      const session = gameManager.getSession();
      expect(session!.isPaused).toBe(true);
    });

    it('应该成功继续游戏', () => {
      gameManager.pause();
      const success = gameManager.resume();
      expect(success).toBe(true);
      
      const session = gameManager.getSession();
      expect(session!.isPaused).toBe(false);
    });
  });

  describe('IT-GAME-007: 返回流程', () => {
    beforeEach(() => {
      gameManager.initialize('user-123');
      gameManager.startGame();
      gameManager.selectLevel('level-1');
    });

    it('应该成功退出关卡', () => {
      const success = gameManager.exitLevel();
      expect(success).toBe(true);
      
      const session = gameManager.getSession();
      expect(session!.currentLevel).toBe(null);
    });

    it('退出后可以选择其他关卡', () => {
      gameManager.exitLevel();
      const success = gameManager.selectLevel('level-1');
      expect(success).toBe(true);
    });
  });

  describe('IT-SAVE-001: 存档系统', () => {
    beforeEach(() => {
      gameManager.initialize('user-123');
      gameManager.startGame();
    });

    it('应该自动保存进度', () => {
      gameManager.selectLevel('level-1');
      gameManager.completeLevel(3, 120);
      
      // 重新初始化并加载
      const newGameManager = new GameManager();
      newGameManager.initialize('user-123');
      newGameManager.startGame();
      
      const session = newGameManager.getSession();
      const progress = session!.progress.get('level-1');
      expect(progress).toBeDefined();
      expect(progress!.stars).toBe(3);
      expect(progress!.bestTime).toBe(120);
    });
  });

  describe('边界情况', () => {
    it('应该处理重复初始化', () => {
      gameManager.initialize('user-123');
      const success = gameManager.initialize('user-456');
      expect(success).toBe(true);
      
      const session = gameManager.getSession();
      expect(session!.userId).toBe('user-456');
    });

    it('应该处理未完成关卡就退出的情况', () => {
      gameManager.initialize('user-123');
      gameManager.startGame();
      gameManager.selectLevel('level-1');
      gameManager.exitLevel();
      
      // 不保存进度，下次进入还是未解锁
      const newGameManager = new GameManager();
      newGameManager.initialize('user-123');
      newGameManager.startGame();
      
      const canSelectLevel2 = newGameManager.selectLevel('level-2');
      expect(canSelectLevel2).toBe(false);
    });
  });
});

describe('完整游戏流程 E2E', () => {
  it('IT-GAME-001~005: 完整的新用户流程', () => {
    const gameManager = new GameManager();
    
    // 1. 初始化
    expect(gameManager.initialize('new-user')).toBe(true);
    
    // 2. 开始游戏
    expect(gameManager.startGame()).toBe(true);
    
    // 3. 选择第一关
    expect(gameManager.selectLevel('level-1')).toBe(true);
    
    // 4. 完成关卡
    expect(gameManager.completeLevel(3, 100)).toBe(true);
    
    // 5. 解锁并选择下一关
    expect(gameManager.selectLevel('level-2')).toBe(true);
    
    // 6. 暂停
    expect(gameManager.pause()).toBe(true);
    
    // 7. 继续
    expect(gameManager.resume()).toBe(true);
    
    // 8. 完成第二关
    expect(gameManager.completeLevel(2, 150)).toBe(true);
    
    // 验证进度
    const session = gameManager.getSession();
    expect(session!.progress.get('level-1')?.stars).toBe(3);
    expect(session!.progress.get('level-2')?.stars).toBe(2);
  });

  it('IT-GAME-002: 老用户加载存档流程', () => {
    // 第一次游戏，创建存档
    const gameManager1 = new GameManager();
    gameManager1.initialize('returning-user');
    gameManager1.startGame();
    gameManager1.selectLevel('level-1');
    gameManager1.completeLevel(3, 100);
    
    // 第二次游戏，加载存档
    const gameManager2 = new GameManager();
    gameManager2.initialize('returning-user');
    gameManager2.startGame();
    
    // 验证进度已恢复
    const session = gameManager2.getSession();
    expect(session!.progress.get('level-1')?.completed).toBe(true);
    
    // 可以直接选择第二关（已解锁）
    expect(gameManager2.selectLevel('level-2')).toBe(true);
  });
});
