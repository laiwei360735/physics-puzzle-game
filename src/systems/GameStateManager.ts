/**
 * 游戏状态管理系统
 * 管理游戏的整体状态和流程
 */

import Phaser from 'phaser';

export type GameState = 'boot' | 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';

export interface GameStats {
  totalScore: number;
  currentScore: number;
  level: number;
  timePlayed: number;
  goalsCollected: number;
  deaths: number;
  stars: number;
}

export class GameStateManager {
  private scene: Phaser.Scene;
  private currentState: GameState = 'boot';
  private stats: GameStats = {
    totalScore: 0,
    currentScore: 0,
    level: 1,
    timePlayed: 0,
    goalsCollected: 0,
    deaths: 0,
    stars: 0,
  };
  private stateHistory: GameState[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 设置游戏状态
   */
  setState(state: GameState): void {
    const previousState = this.currentState;
    this.currentState = state;
    this.stateHistory.push(state);

    console.log(`游戏状态变更：${previousState} -> ${state}`);

    // 状态变更事件
    this.scene.events.emit('stateChange', {
      from: previousState,
      to: state,
    });

    // 状态特定处理
    this.onStateEnter(state);
  }

  /**
   * 状态进入处理
   */
  private onStateEnter(state: GameState): void {
    switch (state) {
      case 'playing':
        this.onResume();
        break;
      case 'paused':
        this.onPause();
        break;
      case 'levelComplete':
        this.onLevelComplete();
        break;
    }
  }

  /**
   * 获取当前状态
   */
  getState(): GameState {
    return this.currentState;
  }

  /**
   * 检查是否是某个状态
   */
  isState(state: GameState): boolean {
    return this.currentState === state;
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    if (this.currentState === 'playing') {
      this.setState('paused');
      this.scene.matter.world.pause();
    }
  }

  /**
   * 恢复游戏
   */
  resume(): void {
    if (this.currentState === 'paused') {
      this.setState('playing');
      this.scene.matter.world.resume();
    }
  }

  /**
   * 暂停处理
   */
  private onPause(): void {
    // 显示暂停菜单
    console.log('游戏暂停');
  }

  /**
   * 恢复处理
   */
  private onResume(): void {
    console.log('游戏恢复');
  }

  /**
   * 关卡完成处理
   */
  private onLevelComplete(): void {
    // 保存进度
    this.saveProgress();
  }

  /**
   * 开始新游戏
   */
  startNewGame(): void {
    this.resetStats();
    this.stats.level = 1;
    this.setState('playing');
  }

  /**
   * 开始关卡
   */
  startLevel(level: number): void {
    this.stats.level = level;
    this.stats.currentScore = 0;
    this.setState('playing');
  }

  /**
   * 完成关卡
   */
  completeLevel(score: number, stars: number): void {
    this.stats.currentScore = score;
    this.stats.totalScore += score;
    this.stats.stars += stars;
    this.setState('levelComplete');
  }

  /**
   * 游戏结束
   */
  gameOver(): void {
    this.setState('gameOver');
  }

  /**
   * 重置统计
   */
  private resetStats(): void {
    this.stats = {
      totalScore: 0,
      currentScore: 0,
      level: 1,
      timePlayed: 0,
      goalsCollected: 0,
      deaths: 0,
      stars: 0,
    };
  }

  /**
   * 增加分数
   */
  addScore(points: number): void {
    this.stats.currentScore += points;
    this.stats.totalScore += points;
    this.scene.events.emit('scoreChange', this.stats.currentScore);
  }

  /**
   * 收集目标
   */
  collectGoal(points: number): void {
    this.stats.goalsCollected++;
    this.addScore(points);
  }

  /**
   * 玩家死亡
   */
  playerDeath(): void {
    this.stats.deaths++;
    this.scene.events.emit('playerDeath');
  }

  /**
   * 获取统计
   */
  getStats(): GameStats {
    return { ...this.stats };
  }

  /**
   * 获取当前分数
   */
  getCurrentScore(): number {
    return this.stats.currentScore;
  }

  /**
   * 获取当前关卡
   */
  getCurrentLevel(): number {
    return this.stats.level;
  }

  /**
   * 设置时间
   */
  setTime(time: number): void {
    this.stats.timePlayed = time;
  }

  /**
   * 保存进度
   */
  saveProgress(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('totalScore', this.stats.totalScore.toString());
      localStorage.setItem('level', this.stats.level.toString());
      localStorage.setItem('stars', this.stats.stars.toString());
    }
  }

  /**
   * 加载进度
   */
  loadProgress(): void {
    if (typeof localStorage !== 'undefined') {
      const totalScore = localStorage.getItem('totalScore');
      const level = localStorage.getItem('level');
      const stars = localStorage.getItem('stars');

      if (totalScore) {
        this.stats.totalScore = parseInt(totalScore, 10);
      }
      if (level) {
        this.stats.level = parseInt(level, 10);
      }
      if (stars) {
        this.stats.stars = parseInt(stars, 10);
      }
    }
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): GameState[] {
    return [...this.stateHistory];
  }
}
