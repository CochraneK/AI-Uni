# AI-Uni

**大学生活世界 × LLM NPC × 情境行为研究 × 长期人生模拟**

AI-Uni 是一个基于多智能体虚拟世界的大学生活、人生发展与心理行为研究原型。第一阶段以北京交通大学风格的校园生活为起点，之后逐步扩展到校外生活、考试、放假、升年级、毕业、实习、工作、亲密关系、家庭、中年、退休和生命回顾。

项目的核心原则是：**先让它像一个真实、可玩的生活世界，再把心理测量作为后台研究层。**

> AI-Uni 基于 a16z 的开源项目 [AI Town](https://github.com/a16z-infra/ai-town) 扩展。仓库中保留的 `aiTown` 模块名、上游链接和 `AI Town` 归因均指原始上游项目，不是当前产品名称。

## 当前方向

```text
AI-Uni
│
├── 人生世界
│   ├── 大学第一周（7 个完整可玩日）
│   ├── 大一 / 大二 / 大三 / 大四 / 毕业
│   ├── 实习 / 求职 / 第一份工作 / 跳槽 / 转行
│   ├── 亲密关系 / 婚姻或其他长期关系 / 家庭
│   ├── 中年 / 照护 / 职业后期
│   └── 退休 / 晚年 / 生命回顾
│
├── LLM NPC
│   ├── 同学 / 室友 / 老师 / 社团成员
│   ├── 朋友 / 伴侣 / 家庭成员
│   ├── 同事 / 上司 / 导师
│   └── 可以跨越多年持续存在的重要关系
│
├── Life-Course Layer
│   ├── 发展阶段与任务
│   ├── 家庭系统与代际传递
│   ├── 关系特异的依恋动态
│   ├── 身份 / 价值 / 自我概念
│   ├── 生态系统与社会环境
│   ├── 压力 / 应对 / 复原
│   ├── 社会网络与社会支持
│   └── 意义 / generativity / life review
│
├── Content Packs
│   ├── campus-life
│   ├── social-friction
│   ├── city-life
│   ├── life-course
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

## 人生模拟层

AI-Uni 不把整个游戏做成一次短测验。第一章是 **大学第一周，共 7 个完整游戏日**；之后逐渐压缩时间尺度，让一个存档可以跨越几十年。

```text
第一周       1 unit = 1 天
大一         1 unit ≈ 1 周
大二～大四   1 unit ≈ 1 月
初入职场     1 unit ≈ 1 季度
成年阶段     1 unit ≈ 1 年
中晚年       1 unit ≈ 数年
```

重要人生事件仍然可以展开成完整可玩章节，而不是全部跳过。

当前人生心理架构整合了：

- Erikson-inspired 生命周期发展主题；
- life-course：时机、转折点、路径依赖、累积效应、linked lives；
- Bronfenbrenner-inspired 生态系统；
- 家庭系统与代际传递；
- 关系特异的依恋动态；
- 身份探索与承诺；
- 压力评价、应对与复原；
- 自主 / 胜任 / 联结等长期动机需要；
- 社会网络 / social convoy；
- 中晚年的选择、优化与补偿；
- 意义、generativity、遗憾与生命回顾。

这些理论用于**设计状态、事件和概率**，而不是直接生成“成熟度”“依恋型”“人生成功分”等标签。

详见 [`docs/LIFE_COURSE_MODEL.md`](docs/LIFE_COURSE_MODEL.md)。

## 研究边界

游戏行为首先是**待验证的行为特征**，不能直接等同于正式心理量表结果。

- 大五人格：通过重复日常行为形成候选特征，再与独立、合规的大五量表校准。
- CAPE-P15：模糊社会/知觉情境只用于探索性行为研究，不把游戏选择直接换算成 CAPE-P15 条目或临床标签。
- PCL-5：游戏中的惊跳、回避或压力反应不能直接计算 PCL-5 分数或判断 PTSD；只能在合适研究方案中作为探索性关联信号。
- LLM：可用于 NPC、受控剧情生成和自由文本 rubric 分类，但不直接输出未经验证的诊断或心理分数。
- 家庭、依恋与发展理论：用于长期关系与剧情建模，不把童年、家庭或一次关系行为写成成年命运。

## 内容架构

场景不再维护为一个巨大的硬编码列表，而是使用 Content Pack：

- `campus-life`：普通校园日常，默认启用。
- `social-friction`：讨厌的人、失约、插队、室友冲突、小组分工不公等现实摩擦，默认启用。
- `city-life`：聚餐、KTV、地铁、实习等校外内容，目前已注册，等待地图/传送系统接入。
- `life-course`：毕业、实习、第一份工作、长期关系、家庭照护、退休、生命回顾等长期人生内容，目前作为 planned pack。
- `sensitive-research`：CAPE/PCL 相关探索性研究内容，默认关闭并要求独立研究方案。

场景现在可以通过 `lifeContext` 限定年龄、人生 season、章节、职业阶段、发展任务和关系类型。普通生活内容也可以明确使用 `researchUse: 'none'`，避免所有剧情都偷偷变成心理测试。

详见：

- [`docs/BJTU_CAMPUS_V1.md`](docs/BJTU_CAMPUS_V1.md)
- [`docs/CONTENT_PACKS.md`](docs/CONTENT_PACKS.md)
- [`docs/LIFE_COURSE_MODEL.md`](docs/LIFE_COURSE_MODEL.md)

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

构念注册表与正式问卷注册表分离，因此以后新增量表不需要重写场景系统，也不需要把人生模拟状态直接当成心理得分。

`convex/life/signals.ts` 另行登记身份、家庭、关系、社会网络、适应/复原、意义等长期候选行为信号；这些同样不是正式量表得分。

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
├── scenarios/       # 场景统一查询入口 + lifeContext 过滤
├── life/            # 生命周期 / 家庭 / 关系 / 生态 / 长期人生状态
├── assessment/      # 构念 + 正式测验注册
└── research/        # session / telemetry / calibration

data/
├── characters.ts
├── gentle.js        # 当前 legacy starter map，之后替换 BJTU map
└── convertMap.js
```

`convex/life/` 当前包含：

```text
types.ts         生命周期领域类型
model.ts         默认状态与长期机制
development.ts   发展阶段 + 长期章节
firstWeek.ts     第一章 7 天
transitions.ts   跨章节 / 跨人生阶段默认过渡
schema.ts        持久化表
state.ts         生命周期状态 API
theories.ts      理论目录与误用边界
signals.ts       长期候选行为信号
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
