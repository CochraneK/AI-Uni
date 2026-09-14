# AI-Uni

**大学生活世界 × LLM NPC × 情境行为研究**

AI-Uni 是一个基于多智能体虚拟世界的大学生活与心理行为研究原型。第一阶段以北京交通大学风格的校园生活为起点，之后可以扩展到校外聚餐、KTV、通勤、实习、旅行、社交网络等更广泛的大学生日常场景。

项目的核心原则是：**先让它像一个真实、可玩的大学生活世界，再把心理测量作为后台研究层。**

> AI-Uni 基于 a16z 的开源项目 [AI Town](https://github.com/a16z-infra/ai-town) 扩展。仓库中保留的 `aiTown` 模块名、上游链接和 `AI Town` 归因均指原始上游项目，不是当前产品名称。

## 当前方向

```text
AI-Uni
│
├── 大学校园与城市生活世界
│   ├── 上课 / 自习 / 宿舍 / 食堂
│   ├── 社团 / 朋友 / 人际摩擦
│   ├── 聚餐 / KTV / 出行 / 实习
│   └── 未来：旅行 / 家庭 / 网络社交
│
├── LLM NPC
│   ├── 普通同学
│   ├── 室友
│   ├── 老师
│   ├── 社团成员
│   └── 各类校内外角色
│
├── Content Packs
│   ├── campus-life
│   ├── social-friction
│   ├── city-life
│   └── sensitive-research
│
├── Behavioral Telemetry
│   ├── movement
│   ├── dialogue
│   ├── decisions
│   └── response latency
│
└── Assessment Layer
    ├── Big Five
    ├── CAPE-P15 related constructs
    ├── PCL-5 associated constructs
    └── future measures
```

## 研究边界

游戏行为首先是**待验证的行为特征**，不能直接等同于正式心理量表结果。

- 大五人格：通过重复日常行为形成候选特征，再与独立、合规的大五量表校准。
- CAPE-P15：模糊社会/知觉情境只用于探索性行为研究，不把游戏选择直接换算成 CAPE-P15 条目或临床标签。
- PCL-5：游戏中的惊跳、回避或压力反应不能直接计算 PCL-5 分数或判断 PTSD；只能在合适研究方案中作为探索性关联信号。
- LLM：可用于 NPC、受控剧情生成和自由文本 rubric 分类，但不直接输出未经验证的诊断或心理分数。

## 内容架构

场景不再维护为一个巨大的硬编码列表，而是使用 Content Pack：

- `campus-life`：普通校园日常，默认启用。
- `social-friction`：讨厌的人、失约、插队、室友冲突、小组分工不公等现实摩擦，默认启用。
- `city-life`：聚餐、KTV、地铁、实习等校外内容，目前已注册，等待地图/传送系统接入。
- `sensitive-research`：CAPE/PCL 相关探索性研究内容，默认关闭并要求独立研究方案。

详见：

- [`docs/BJTU_CAMPUS_V1.md`](docs/BJTU_CAMPUS_V1.md)
- [`docs/CONTENT_PACKS.md`](docs/CONTENT_PACKS.md)

## 当前心理构念注册表

```text
big5.*
cape.*
pcl5_associated.*
social.*
coping.*
emotion.*
attachment.*
decision.*
```

构念注册表与正式问卷注册表分离，因此以后新增量表不需要重写场景系统，也不需要修改核心 Convex schema。

## 技术栈

- Simulation engine / backend / database / vector search: Convex
- Frontend: React + Vite
- Rendering: PixiJS
- LLM: Ollama、OpenAI、Together.ai 或 OpenAI-compatible API
- Auth: Clerk（可选）

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

当前 GitHub Actions CI 会执行：

```bash
npm ci
npm run build
```

## LLM 配置

AI-Uni 继承上游 AI Town 的 LLM provider 抽象。可以使用 Ollama，也可以配置 OpenAI、Together.ai 或 OpenAI-compatible API。

OpenAI-compatible provider 使用的环境变量包括：

```bash
LLM_API_URL
LLM_API_KEY
LLM_MODEL
LLM_EMBEDDING_MODEL
```

Embedding model 的维度必须与 `convex/util/llm.ts` 中配置一致。

## 地图与素材

当前第一目标是制作一张小型、可玩的北交大风格像素地图：

```text
南门
 ↓
思源教学区 ── 图书馆
 ↓              ↓
食堂 ── 明湖 ── 学生活动中心
 ↓              ↓
宿舍 ───────── 体育场
```

地图继续使用 Tiled → JSON → `data/convertMap.js` 的工作流。

AI-Uni 的 Web base path 为：

```text
/ai-uni
```

新的公开素材应使用类似：

```text
/ai-uni/assets/...
```

## 目录重点

```text
convex/
├── aiTown/          # 上游 AI Town 游戏逻辑（继承命名）
├── engine/          # 上游 simulation engine
├── campus/          # 校园配置
├── world/           # 校内外地点注册
├── content/         # Content Packs + 校验
├── scenarios/       # 场景统一查询入口
├── assessment/      # 构念 + 正式测验注册
└── research/        # session / telemetry / calibration

data/
├── characters.ts
├── gentle.js        # 当前 legacy starter map，之后替换 BJTU map
└── convertMap.js
```

## 安全与研究要求

正式用于参与者研究前，应根据具体研究方案完成：

- 伦理审批 / IRB（如适用）
- 知情同意
- 数据最小化
- 对话数据留存与去标识化规则
- 敏感场景 opt-out
- 风险处置与人工转介流程
- 目标语言量表版本、授权和效度核对

AI-Uni 当前是研究原型，不提供医学诊断或治疗建议。

## License / upstream

本项目继承并修改自 [a16z-infra/ai-town](https://github.com/a16z-infra/ai-town)。请继续保留并遵守仓库中的 `LICENSE` 与上游归因要求。
