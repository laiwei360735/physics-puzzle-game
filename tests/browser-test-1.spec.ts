/**
 * 浏览器测试 - 物理益智小游戏
 * 测试任务：
 * 1. 打开游戏页面，记录所有控制台错误和警告
 * 2. 测试新手教程 3 关（-3, -2, -1）是否能正常加载
 * 3. 测试正式关卡 1-5 是否能正常加载
 * 4. 记录所有 UI 问题、交互问题、性能问题
 */

import { test, expect, Page } from '@playwright/test';

// 测试结果收集
const testResults = {
  consoleErrors: [] as string[],
  consoleWarnings: [] as string[],
  uiIssues: [] as string[],
  interactionIssues: [] as string[],
  performanceIssues: [] as string[],
  levelResults: {} as Record<string, { loaded: boolean; canvasVisible: boolean; issues: string[] }>,
  startTime: Date.now(),
};

// 设置控制台监听
function setupConsoleListeners(page: Page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      testResults.consoleErrors.push(`[ERROR] ${text}`);
    } else if (type === 'warning') {
      testResults.consoleWarnings.push(`[WARNING] ${text}`);
    }
  });

  page.on('pageerror', error => {
    testResults.consoleErrors.push(`[PAGE ERROR] ${error.message}`);
  });
}

// 等待游戏加载
async function waitForGameLoad(page: Page, timeout = 15000) {
  try {
    // 等待画布出现
    await page.waitForSelector('canvas', { timeout, state: 'visible' });
    // 等待加载文本消失（如果有）
    try {
      await page.waitForSelector('text="加载中..."', { timeout: 10000, state: 'hidden' });
    } catch (e) {
      // 加载文本可能不存在，继续
    }
    // 额外等待让游戏完全初始化
    await page.waitForTimeout(3000);
    return true;
  } catch (error) {
    const issue = `游戏加载超时：${error}`;
    testResults.uiIssues.push(issue);
    console.log(`⚠️ ${issue}`);
    return false;
  }
}

// 通过 URL 参数加载关卡
async function loadLevelViaURL(page: Page, levelId: number): Promise<boolean> {
  try {
    await page.goto(`http://localhost:3000/?level=${levelId}`, { waitUntil: 'networkidle', timeout: 30000 });
    const loaded = await waitForGameLoad(page);
    
    testResults.levelResults[`level-${levelId}`] = {
      loaded,
      canvasVisible: loaded,
      issues: loaded ? [] : ['加载失败或超时'],
    };
    
    return loaded;
  } catch (error) {
    const issue = `关卡 ${levelId} 加载失败：${error}`;
    testResults.levelResults[`level-${levelId}`] = {
      loaded: false,
      canvasVisible: false,
      issues: [issue],
    };
    testResults.uiIssues.push(issue);
    return false;
  }
}

// 检查关卡元素
async function checkLevelElements(page: Page, levelId: number) {
  try {
    const canvas = page.locator('canvas').first();
    const isVisible = await canvas.isVisible().catch(() => false);
    
    if (!isVisible) {
      testResults.interactionIssues.push(`关卡 ${levelId}: 游戏画布不可见`);
    }
    
    // 截图
    try {
      await page.screenshot({ path: `screenshots/level-${levelId}.png` });
    } catch (e) {
      testResults.uiIssues.push(`关卡 ${levelId} 截图失败：${e}`);
    }
    
    return isVisible;
  } catch (error) {
    testResults.interactionIssues.push(`关卡 ${levelId} 检查失败：${error}`);
    return false;
  }
}

// 测试基本交互
async function testBasicInteraction(page: Page, levelId: number) {
  try {
    const canvas = page.locator('canvas').first();
    
    if (!(await canvas.isVisible())) {
      return false;
    }

    // 简单点击
    await canvas.click({ timeout: 5000 });
    await page.waitForTimeout(500);

    return true;
  } catch (error) {
    testResults.interactionIssues.push(`关卡 ${levelId} 交互失败：${error}`);
    return false;
  }
}

// 检查性能
async function checkPerformance(page: Page, levelId: number) {
  try {
    const metrics = await page.metrics();
    
    if (metrics.JSHeapUsedSize > 150 * 1024 * 1024) {
      testResults.performanceIssues.push(
        `关卡 ${levelId}: JS 堆内存使用过高 (${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB)`
      );
    }
  } catch (error) {
    // 忽略性能检查错误
  }
}

test.describe('物理益智小游戏 - 浏览器测试', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });
    
    setupConsoleListeners(page);
    testResults.startTime = Date.now();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('游戏主页应该正常加载', async () => {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
    
    const loaded = await waitForGameLoad(page);
    expect(loaded).toBe(true);
    
    const title = await page.title();
    console.log(`✅ 页面标题：${title}`);
    
    await page.screenshot({ path: 'screenshots/game-main.png' });
  });

  test('检查控制台状态', async () => {
    await page.waitForTimeout(2000);
    
    console.log(`📊 控制台错误：${testResults.consoleErrors.length}`);
    console.log(`📊 控制台警告：${testResults.consoleWarnings.length}`);
    
    await page.screenshot({ path: 'screenshots/console-check.png' });
  });

  test('测试基本交互', async () => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    await canvas.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ 基本交互测试通过');
  });

  test.describe('新手教程关卡测试', () => {
    const tutorialLevels = [
      { id: -3, name: '教程 3: 练习' },
      { id: -2, name: '教程 2: 物理' },
      { id: -1, name: '教程 1: 拖拽' },
    ];
    
    for (const level of tutorialLevels) {
      test(`教程关卡 ${level.id} (${level.name}) 应该能正常加载`, async () => {
        console.log(`\n🎮 测试教程关卡 ${level.id}: ${level.name}`);
        
        const loaded = await loadLevelViaURL(page, level.id);
        expect(loaded).toBe(true);
        
        const visible = await checkLevelElements(page, level.id);
        await testBasicInteraction(page, level.id);
        await checkPerformance(page, level.id);
        
        console.log(`✅ 教程关卡 ${level.id}: 加载=${loaded}, 可见=${visible}`);
      });
    }
  });

  test.describe('正式关卡测试', () => {
    const formalLevels = [
      { id: 1, name: '初次见面' },
      { id: 2, name: '重力朋友' },
      { id: 3, name: '摇摆糖果' },
      { id: 4, name: '双绳挑战' },
      { id: 5, name: '糖果雨' },
    ];
    
    for (const level of formalLevels) {
      test(`正式关卡 ${level.id} (${level.name}) 应该能正常加载`, async () => {
        console.log(`\n🎮 测试正式关卡 ${level.id}: ${level.name}`);
        
        const loaded = await loadLevelViaURL(page, level.id);
        expect(loaded).toBe(true);
        
        const visible = await checkLevelElements(page, level.id);
        await testBasicInteraction(page, level.id);
        await checkPerformance(page, level.id);
        
        console.log(`✅ 正式关卡 ${level.id}: 加载=${loaded}, 可见=${visible}`);
      });
    }
  });

  test('生成测试报告', async () => {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/final.png' });
    
    const duration = Date.now() - testResults.startTime;
    
    let report = `# 浏览器测试报告 - 物理益智小游戏\n\n`;
    report += `**测试时间:** ${new Date().toISOString()}\n`;
    report += `**测试时长:** ${Math.round(duration / 1000)}秒\n\n`;
    
    report += `## 📊 测试概览\n\n`;
    report += `- 控制台错误：${testResults.consoleErrors.length}\n`;
    report += `- 控制台警告：${testResults.consoleWarnings.length}\n`;
    report += `- UI 问题：${testResults.uiIssues.length}\n`;
    report += `- 交互问题：${testResults.interactionIssues.length}\n`;
    report += `- 性能问题：${testResults.performanceIssues.length}\n\n`;
    
    report += `## 🎮 关卡测试结果\n\n`;
    for (const [level, result] of Object.entries(testResults.levelResults)) {
      report += `### ${level}\n`;
      report += `- 加载：${result.loaded ? '✅' : '❌'}\n`;
      report += `- 画布可见：${result.canvasVisible ? '✅' : '❌'}\n`;
      if (result.issues.length > 0) {
        report += `- 问题:\n`;
        for (const issue of result.issues) {
          report += `  - ${issue}\n`;
        }
      }
      report += `\n`;
    }
    
    if (testResults.consoleErrors.length > 0) {
      report += `## ❌ 控制台错误\n\n`;
      for (const error of testResults.consoleErrors) {
        report += `- ${error}\n`;
      }
      report += `\n`;
    }
    
    if (testResults.consoleWarnings.length > 0) {
      report += `## ⚠️ 控制台警告\n\n`;
      for (const warning of testResults.consoleWarnings) {
        report += `- ${warning}\n`;
      }
      report += `\n`;
    }
    
    if (testResults.uiIssues.length > 0) {
      report += `## 🖼️ UI 问题\n\n`;
      for (const issue of testResults.uiIssues) {
        report += `- ${issue}\n`;
      }
      report += `\n`;
    }
    
    if (testResults.interactionIssues.length > 0) {
      report += `## 🎯 交互问题\n\n`;
      for (const issue of testResults.interactionIssues) {
        report += `- ${issue}\n`;
      }
      report += `\n`;
    }
    
    if (testResults.performanceIssues.length > 0) {
      report += `## ⚡ 性能问题\n\n`;
      for (const issue of testResults.performanceIssues) {
        report += `- ${issue}\n`;
      }
      report += `\n`;
    }
    
    report += `## 📝 总结\n\n`;
    const totalLevels = Object.keys(testResults.levelResults).length;
    const loadedLevels = Object.values(testResults.levelResults).filter(r => r.loaded).length;
    const visibleLevels = Object.values(testResults.levelResults).filter(r => r.canvasVisible).length;
    
    report += `- 测试关卡总数：${totalLevels}\n`;
    report += `- 成功加载：${loadedLevels}/${totalLevels}\n`;
    report += `- 画布可见：${visibleLevels}/${totalLevels}\n`;
    report += `- 总体状态：${testResults.consoleErrors.length === 0 && loadedLevels === totalLevels ? '✅ 全部通过' : '⚠️ 存在问题'}\n`;
    
    console.log('\n' + report);
    
    // 写入报告文件
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'browser-test-1.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 测试报告已写入：${reportPath}`);
  });
});
