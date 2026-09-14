# AI-Uni

**大学生活世界 × LLM NPC × 人生历程 × 情境行为研究**

AI-Uni 是一个基于多智能体虚拟世界的大学生活、人生发展与心理行为研究原型。默认世界不绑定任何一所真实大学，而是模拟广泛意义上的大学生活；之后再通过可插拔的 University Template 加载特定大学地图、地点显示名、校园文化和专属事件。

项目的核心原则是：**先让它像一个真实、可玩的生活世界，再把心理测量作为后台研究层。**

> AI-Uni 基于 a16z 的开源项目 [AI Town](https://github.com/a16z-infra/ai-town) 扩展。仓库中保留的 `aiTown` 模块名、上游链接和 `AI Town` 归因均指原始上游项目，不是当前产品名称。

## 现在已经能做什么

当前分支已经形成第一条可玩的大学生活闭环：

```text
原创 generic_campus_v1 地图
        ↓
玩家移动到校园功能区
        ↓
WorldLocationId / 第一周日程 / 安全规则过滤
        ↓
普通生活事件或任务事件
        ↓
NPC 角色分配 + LLM 对话
        ↓
对话推进 / 手动完成事件
        ↓
没有事件时做本地日常活动
        ↓
结束一天
        ↓
第 7 天真实完成门槛
        ↓
freshman_year
```

第一周不是演示页，而是 **7 个完整可玩日**。Day 7 只有满足以下游戏条件才能进入下一章：

- 完成 7 个可玩日；
- 完成至少 3 个核心生活事件；
- 与至少 4 位不同 NPC 有真实玩家发言互动；
- 至少完成一次普通生活体验。

普通生活体验既可以来自纯日常场景，也可以来自自由校园活动。自由活动**不会**拿来凑 3 个核心事件，也不会直接换算人格或症状分数。

## Generic University Core

AI-Uni 的场景逻辑使用稳定、跨学校的功能地点 ID：

```text
campus_gate
teaching_building
library
student_center
cafeteria
campus_green
sports_field
dormitory
```

场景只需要知道“这是图书馆”或“这是校园公共空间”，不需要知道某所真实学校的建筑名。University Template 可以覆盖玩家看到的地点名称、地图、主题内容和校园文化，但底层剧情、人生状态和研究数据仍使用稳定语义 ID。

`convex/campus/profiles.ts` 可描述：

- institution model；
- residential / commuter / hybrid / distributed campus；
- urban / suburban / town / rural；
- semester / quarter / trimester / custom calendar；
- 学制长度；
- 住宿与通勤结构；
- 校园开放程度；
- 地点显示名覆盖；
- map/theme content packs。

当前模板注册：

```text
generic_university  core / default
bjtu_inspired       planned / optional
```

BJTU-inspired 内容只是可选模板示例，不是 AI-Uni 默认世界。详见 [`docs/UNIVERSITY_CORE.md`](docs/UNIVERSITY_CORE.md) 和 [`docs/templates/BJTU_TEMPLATE.md`](docs/templates/BJTU_TEMPLATE.md)。

## 原创通用校园地图

默认新世界现在使用 **`generic_campus_v1`**，不是上游 AI Town 的 starter map。

- 地图模块：`data/genericCampus.ts`
- 尺寸：48 × 36 tiles
- tile size：32 px
- 原创 tileset：`assets/generic-campus-v1.png`
- Web 资产路径：`/ai-uni/assets/generic-campus-v1.png`

地图包含教学楼、图书馆、活动中心、食堂、公共绿地、运动场、住宿区和校园入口，并带真实碰撞几何与连通路径。

测试会检查：

- tile 尺寸与索引合法；
- 八个功能区 anchor 与语义位置一致；
- 功能区可走；
- 每个功能区都能通过可行走路径到达校门；
- 场景物体不会把地图堵成不可玩。

`data/gentle.js` 仍保留作为 inherited / legacy map 资产，但不再是新世界默认地图。

## 普通校园活动

当当前地点没有必须处理的事件时，右侧栏会出现该地点的普通活动。当前共有 **16 个活动，每个校园功能区 2 个**，例如：

- 食堂：吃顿饭、买点喝的；
- 图书馆：安静自习、随便翻书；
- 活动中心：看看活动海报、坐下来歇会儿；
- 公共空间：散步、坐一会儿；
- 运动场：慢跑、看会儿球；
- 宿舍：整理自己的位置、休息。

规则：

```text
同一个活动每天最多一次
每天最多 3 个不同自由活动
有正在处理的核心事件时不能用自由活动绕过去
必须真的在对应地点才能执行
```

完成活动会写入人生历史。若参与者已明确开启研究记录且存在开放 research session，才会额外写最小化活动 telemetry；普通游玩模式不会因此开启研究记录。

## LLM NPC 与场景

NPC 的可见行为围绕普通大学生活：课程、吃饭、室友、社团、小组作业、朋友和日常计划。

场景启动时会：

1. 根据地点、人生阶段、第一周日数、content pack 和安全规则选场景；
2. 给适合的 NPC 分配叙事角色；
3. 把**普通叙事上下文**传给 NPC；
4. 通过玩家与相关 NPC 的真实对话推进事件。

NPC 不会收到：

- `hiddenTargets`；
- CAPE/PCL/Big Five 问卷名称；
- 内部 selector 权重；
- 研究特征 key。

当前对话自动完成阈值只是剧情节奏规则：

```text
纯日常场景     1 次有效玩家回复
普通任务场景   2 次
轻压力场景     3 次
敏感场景       永不自动完成
```

这些数字不参与心理计分。

## 人生模拟层

AI-Uni 不把整个游戏做成一次短测验。第一章之后逐渐压缩时间尺度，让同一个存档最终可以跨越几十年。

```text
第一周       1 unit = 1 天
大一         1 unit ≈ 1 周
大二～大四   1 unit ≈ 1 月
初入职场     1 unit ≈ 1 季度
成年阶段     1 unit ≈ 1 年
中晚年       1 unit ≈ 数年
```

长期架构目前整合：

- Erikson-inspired 生命周期发展主题；
- life-course timing / turning points / linked lives / cumulative effects；
- Bronfenbrenner-inspired 生态系统；
- 家庭系统与代际传递；
- 关系特异的依恋动态；
- 身份探索与承诺；
- 压力评价、应对与复原；
- 自主 / 胜任 / 联结等长期需要；
- social convoy / 社会支持；
- 中晚年选择、优化与补偿；
- 意义、generativity、遗憾与 life review。

这些理论用于**状态、事件和概率**，不是直接生成“成熟度”“依恋型”“人生成功分”等标签。详见 [`docs/LIFE_COURSE_MODEL.md`](docs/LIFE_COURSE_MODEL.md)。

## Content Packs

当前 content packs：

- `campus-life`：普通大学日常，默认启用；
- `social-friction`：失约、插队、同住冲突、小组分工不公等现实摩擦；
- `city-life`：聚餐、KTV、交通、实习等校外内容，已注册、等待校外地图接入；
- `life-course`：毕业、工作、长期关系、家庭照护、退休等长期内容；
- `sensitive-research`：CAPE/PCL 相关探索性研究内容，默认关闭并要求独立研究方案与额外 consent。

场景可以通过 `lifeContext` 限定年龄、season、章节、第一周日数、职业阶段、发展任务与关系类型。普通生活内容可以明确使用：

```ts
researchUse: 'none'
hiddenTargets: []
observableFeatures: []
```

详见 [`docs/CONTENT_PACKS.md`](docs/CONTENT_PACKS.md) 与 [`docs/RUNTIME_V1.md`](docs/RUNTIME_V1.md)。

## 研究与心理测量边界

游戏行为首先是**待验证的行为特征**，不能直接等同于正式心理量表结果。

- 大五：需要跨多个情境的重复行为特征，并与独立有效量表校准；
- CAPE-P15：只允许探索模糊归因、证据检查、社会确认等候选行为，不把选择直接换算 CAPE 条目；
- PCL-5：游戏中的惊跳、回避或压力反应不能直接计算 PCL-5 或判断 PTSD；
- LLM：可用于 NPC、受控剧情生成或预注册 rubric 分类，不直接输出未经验证的诊断/心理分数；
- 家庭、依恋与发展理论：用于长期剧情和关系动态，不把一次行为或童年历史写成成年命运。

研究 telemetry 与游戏状态分离。默认：

```text
behavioralResearchConsent = false
sensitiveResearchConsent = false
```

关闭研究记录时，游戏仍完整可玩。只有存在开放 research session 且参与者明确开启 behavioral research consent 时，才会写最小化 telemetry，例如地点转换、场景生命周期、活动 ID/地点/时长、对话方向和字符数。默认不把原始对话文本复制进 research telemetry，也不逐帧记录精确移动。

敏感研究还必须额外开启 `sensitiveResearchConsent`。

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

构念注册表与正式问卷注册表分离；新增量表不需要重写场景系统，也不能把人生模拟状态直接当作心理得分。

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

单元测试：

```bash
npm test -- --runInBand
```

生产构建：

```bash
npm run build
```

GitHub Actions CI 当前执行：

```bash
npm ci
npm test -- --runInBand
npm run build
```

## LLM 配置

AI-Uni 继承上游 AI Town 的 provider 抽象，可使用 Ollama、OpenAI、Together.ai 或 OpenAI-compatible API。

OpenAI-compatible provider 的环境变量包括：

```bash
LLM_API_URL
LLM_API_KEY
LLM_MODEL
LLM_EMBEDDING_MODEL
```

Embedding model 维度必须与 `convex/util/llm.ts` 中配置一致。

## 目录重点

```text
convex/
├── aiTown/          # 上游 AI Town 游戏逻辑（继承命名）
├── engine/          # simulation engine
├── campus/          # generic university profiles/templates
├── world/           # 校内外地点 + zone 语义
├── content/         # Content Packs + 校验
├── scenarios/       # 场景选择 / runtime / NPC context / progress
├── life/            # 生命周期 + first-week + daily activities
├── assessment/      # 构念 + 正式测验注册
└── research/        # session / telemetry / calibration

data/
├── genericCampus.ts # 当前默认 generic_campus_v1
├── npcProfiles.ts   # 后端轻量 NPC 语义资料
├── characters.ts    # 前端角色/精灵资料
├── gentle.js        # inherited legacy map
└── convertMap.js    # Tiled JSON 转换工具

assets/
└── generic-campus-v1.png
```

`convex/life/` 的关键文件：

```text
firstWeek.ts          第一章 7 天定义
firstWeekProgress.ts  首周完成门槛
activities.ts         普通校园自由活动
 day.ts                活动执行 + 日结
state.ts              长期人生状态 API
transitions.ts        跨章节 / 跨人生阶段过渡
signals.ts            长期候选行为信号
influence.ts          有上限的概率影响机制
```

## 安全与研究要求

正式用于参与者研究前，应根据具体研究方案完成：

- 伦理审批 / IRB（如适用）；
- 知情同意；
- 数据最小化；
- 对话数据留存与去标识化规则；
- 敏感场景 opt-out；
- 风险处置与人工转介流程；
- 目标语言量表版本、授权和效度核对。

AI-Uni 当前是研究原型，不提供医学诊断或治疗建议。

## 下一步

当前主线已从“搭架构”进入“提高可玩性”：

```text
地图上的可见交互提示 / object hotspots
→ 更丰富的校园对象交互
→ 校外城市与交通空间
→ 更完整的大一到毕业内容
→ 职业、关系、家庭、中晚年章节
```

研究者 dashboard/export、正式 questionnaire delivery、production consent UI 和经验证的 behavioral-feature model 仍属于后续研究基础设施。

## License / upstream

本项目继承并修改自 [a16z-infra/ai-town](https://github.com/a16z-infra/ai-town)。请继续保留并遵守仓库中的 `LICENSE` 与上游归因要求。
