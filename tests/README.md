# 物理益智微信小游戏 - 测试套件

本目录包含物理益智微信小游戏的完整测试方案和测试代码。

## 📁 目录结构

```
tests/
├── README.md                    # 本文件
├── 测试计划.md                   # 总体测试计划
├── 测试用例.md                   # 详细测试用例
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript 配置
├── vitest.config.ts             # Vitest 配置
├── setup.ts                     # 测试环境设置
├── .eslintrc.json               # ESLint 配置
│
├── unit/                        # 单元测试
│   ├── physics.test.ts          # 物理引擎测试
│   └── level.test.ts            # 关卡系统测试
│
├── integration/                 # 集成测试
│   └── game-flow.test.ts        # 游戏流程测试
│
├── e2e/                         # E2E 测试
│   └── gameplay.test.ts         # 游戏玩法测试
│
├── performance/                 # 性能测试
│   └── 性能测试方案.md           # 性能测试文档
│
├── compatibility/               # 兼容性测试
│   └── 兼容性测试方案.md         # 兼容性测试文档
│
└── reports/                     # 测试报告
    ├── Bug 报告模板.md            # Bug 报告模板
    └── 用户反馈收集方案.md         # 用户反馈方案
```

## 🚀 快速开始

### 安装依赖

```bash
cd tests
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行特定类型测试
npm run test:unit        # 单元测试
npm run test:integration # 集成测试
npm run test:e2e         # E2E 测试
npm run test:all         # 全部测试
```

### 代码检查

```bash
# 代码风格检查
npm run lint

# 自动修复
npm run lint:fix
```

## 📋 测试框架

### Vitest

我们使用 [Vitest](https://vitest.dev/) 作为测试框架，原因：

- ⚡ 极速：基于 Vite，测试启动快
- 🔧 内置：支持 TypeScript、覆盖率等
- 📦 兼容：兼容 Jest API，迁移成本低
- 🎯 专注：针对 Vite 项目优化

### 测试类型

| 类型 | 位置 | 覆盖率目标 | 说明 |
|-----|------|-----------|-----|
| 单元测试 | `unit/` | ≥80% | 测试独立模块功能 |
| 集成测试 | `integration/` | 关键路径 100% | 测试模块间交互 |
| E2E 测试 | `e2e/` | 核心流程 100% | 测试完整用户流程 |
| 性能测试 | `performance/` | 持续监控 | 测试性能指标 |
| 兼容性测试 | `compatibility/` | 主流设备 100% | 测试设备兼容性 |

## 📊 测试重点

### 物理引擎稳定性

- [x] 重力模拟测试
- [x] 碰撞检测测试
- [x] 碰撞响应测试
- [x] 摩擦力测试
- [x] 弹性系数测试
- [x] 质量影响测试
- [ ] 连续碰撞稳定性测试

### 关卡逻辑正确性

- [x] 关卡加载测试
- [x] 关卡验证测试
- [x] 胜利条件检测
- [x] 失败条件检测
- [x] 关卡进度管理
- [ ] 关卡重置测试

### 性能优化

- [ ] 帧率监控（目标：≥50fps）
- [ ] 内存监控（目标：≤200MB）
- [ ] 加载时间监控（目标：≤3s）
- [ ] 资源使用优化
- [ ] 渲染性能优化

### 微信小游戏平台兼容性

- [ ] iOS 设备兼容（iPhone 12-15）
- [ ] Android 设备兼容（主流品牌）
- [ ] 微信版本兼容（8.0.30+）
- [ ] 网络环境兼容
- [ ] 系统权限兼容

## 📝 测试文档

### 测试计划

详见 [`测试计划.md`](./测试计划.md)，包含：

- 项目概述
- 测试策略
- 测试阶段
- 测试资源
- 风险管理

### 测试用例

详见 [`测试用例.md`](./测试用例.md)，包含：

- 单元测试用例
- 集成测试用例
- E2E 测试用例
- 边界测试用例
- 异常测试用例

### 性能测试方案

详见 [`performance/性能测试方案.md`](./performance/性能测试方案.md)，包含：

- 性能指标目标
- 性能监控脚本
- 性能测试执行计划
- 性能优化建议

### 兼容性测试方案

详见 [`compatibility/兼容性测试方案.md`](./compatibility/兼容性测试方案.md)，包含：

- 兼容性测试矩阵
- 兼容性测试用例
- 测试工具推荐
- 问题处理流程

### Bug 报告模板

详见 [`reports/Bug 报告模板.md`](./reports/Bug 报告模板.md)，包含：

- Bug 报告模板
- Bug 分级标准
- Bug 管理流程
- Bug 统计报表

### 用户反馈收集方案

详见 [`reports/用户反馈收集方案.md`](./reports/用户反馈收集方案.md)，包含：

- 反馈收集渠道
- 用户测试计划
- 反馈处理流程
- 数据分析方案

## 🔧 配置说明

### Vitest 配置

```typescript
// vitest.config.ts
{
  test: {
    globals: true,      // 全局测试 API
    environment: 'node', // 测试环境
    coverage: {         // 覆盖率配置
      thresholds: {
        global: {
          statements: 80, // 语句覆盖率≥80%
          branches: 80,   // 分支覆盖率≥80%
          functions: 80,  // 函数覆盖率≥80%
          lines: 80       // 行覆盖率≥80%
        }
      }
    }
  }
}
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,           // 严格模式
    "noUnusedLocals": true,   // 检查未使用变量
    "noImplicitReturns": true // 检查隐式返回
  }
}
```

## 📈 测试报告

### 生成测试报告

```bash
# 运行测试并生成报告
npm run test:coverage

# 查看 HTML 报告
open coverage/index.html
```

### 报告内容

- 测试通过率
- 代码覆盖率
- 性能指标
- Bug 统计

## 🤝 贡献指南

### 添加新测试

1. 在对应目录创建测试文件
2. 遵循命名规范：`*.test.ts`
3. 编写测试用例
4. 运行测试验证
5. 提交代码

### 测试编写规范

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('模块名称', () => {
  let instance: any;

  beforeEach(() => {
    // 每个测试前的准备工作
    instance = createInstance();
  });

  it('测试用例描述', () => {
    // 测试代码
    const result = instance.method();
    expect(result).toBe(expected);
  });
});
```

### 测试用例命名

- 使用中文描述测试目的
- 包含测试场景和预期结果
- 参考测试用例文档中的 ID

## 📞 联系方式

如有问题，请联系：

- 测试负责人：[待填写]
- 开发负责人：[待填写]
- 项目仓库：[待填写]

---

**最后更新**: 2024 年 3 月 8 日
