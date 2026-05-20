# user-rule

[**English**](./README.en.md) | [**中文**](./README.md)

**根治 AI 三大顽疾：隔轮即忘、上下文冲淡、惯性走老路。**

## AI 顽疾 — 此技能要根治的三大问题

### 问题 1：AI 隔轮即忘

| 时刻 | AI 表现 | 原因 |
|------|---------|------|
| 对话开始 | "好的，我会遵循领域组织、就近原则" | 刚读完 requirement |
| 第 10 轮 | 开始创建 `components/` 目录 | 早期约束被后续内容挤压出上下文窗口 |
| 第 20 轮 | 把所有代码塞一个文件 "先实现再说" | 用户要求完全丢失 |
| 新会话 | 完全不记得上次的架构约定 | 无持久化记录，从零开始 |

### 问题 2：上下文冲淡

AI 上下文窗口有限。每轮对话新增的内容会挤占早期内容。**50 轮后，对话前 10 轮的要求基本消失。** 无 `user-rule.md` 时，AI 会：

- 选择"看起来简单"的方案，而非"符合要求"的方案
- 顺着当前 Prompt 的"局部最优"行动，忘记全局约束
- 用户反复纠正同一问题，陷入死循环

### 问题 3：AI 惯性地走老路

即使明确指导过，AI 在下一轮仍倾向回到训练数据中的"默认模式"（技术分层、大文件、全局目录）。这不是恶意，是模型先验分布太强。

**根因：** AI 上下文有限 + 无持久化约束 = 每次对话都相当于从零开始。

**解决思路：** 每一次交互第一件事就是读 `user-rule.md`，让 AI 在行动前被"强制对齐"一次，对抗遗忘和惯性。

## 方案

每次交互自动读 `user-rule.md`，让 AI 行动前强制对齐，跨会话持久化所有要求。

```
对话 1:   创建 features/auth/ → 写入 user-rule.md
对话 50:  仍读 user-rule.md → 仍用 features/auth/
新会话:   读 user-rule.md → 从上次终点继续 → 零遗忘
```

## 安装

### 1. 安装 Skill

```bash
cp -r skill "$HOME/.claude/skills/user-rule"
```

### 2. 安装 Hook

```bash
cp -r hook "$HOME/.claude/hooks/user-rule"
```

### 3. 配置 settings.json

编辑 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/user-rule/user-rule-session-start.js\"",
            "async": false
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/user-rule/user-rule-reminder.js\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

> Windows：`"node \"C:/Users/xxx/.claude/hooks/user-rule/user-rule-session-start.js\""`

### 4. 生效

新开会话自动加载，无需手动干预。

## 工作流程

```
SessionStart  → 加载 skill 到上下文
自动创建/更新 user-rule.md（无需询问）
UserPromptSubmit → 每次消息 reminder 提醒
违规自动检测 → 红标志触发则删除重做
```

## 核心原则（强制遵守）

| 原则 | 做法 |
|------|------|
| **按领域组织** | `features/{domain}/` 为一级目录，禁止 `components/` 顶层 |
| **就近原则** | 子组件、样式、类型、测试必须与父级同目录 |
| **专文件专功能** | 一文件一核心职责，层之间独立文件 |
| **内聚优先于拆分** | 被 ≥2 领域消费才提取独立 |
| **索引文件** | 外部引用 `index.ts`，内部引用真实路径 |
| **禁止跨领域引用** | 只能通过 `index.ts` 通信 |
| **可测试性内建** | 与 UI 解耦，测试同目录就近放置 |
| **扩展性** | 插件化/策略模式注册，新增不改现有 |

完整原则见 [SKILL.md](skill/SKILL.md) 架构原则表。

## 优先级

```
用户明确要求 > 用户隐含意图 > 架构原则 > 代码简洁性 > 代码量少
```

违反用户要求的方案都是错误的。最符合要求的方案 > 最简单的方案。

## 红标志 — 立即停止

- 单文件堆砌多个不相关功能
- 用 `components/`/`utils/` 技术分层
- 选择"简单但不满足要求"的方案
- 没有创建/更新 `user-rule.md`
- "这次特殊"、"先凑合"、"后续再改"
- 跨领域直接 import 内部文件
- 强行拆分强内聚代码

**以上任意一条 = 删除重做。**

## 项目结构

```
user-rule/
├── skill/
│   └── SKILL.md              # AI skill — 定义行为与约束
├── hook/
│   ├── user-rule-session-start.js  # 启动注入
│   └── user-rule-reminder.js       # 每次消息提醒
└── README.md
```

## 要求

- [Claude Code](https://claude.ai) 2.1.88+
- Node.js（hook 脚本）

## 许可

MIT
