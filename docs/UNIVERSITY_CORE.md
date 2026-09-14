# AI-Uni Generic University Core

AI-Uni 的默认大学阶段不绑定任何一所真实大学。核心目标是模拟广泛意义上的大学生活，并允许后期加载特定大学模板。

## Core vs. Template

```text
Generic University Core
├── 稳定地点 ID
├── 通用大学生活事件
├── 学年 / 学期 / 考试 / 假期
├── 关系与 NPC 系统
├── Life-Course 人生状态
├── 研究与 telemetry
└── 场景调度

University Template
├── 学校名称与视觉主题
├── 地图 / 建筑显示名
├── 校园制度与日历覆盖
├── 住宿 / 通勤结构
├── 学校特有传统与事件
├── 学校特有 NPC / 组织
└── 可选内容包
```

模板不能改变核心心理学解释规则，也不能把某所学校的制度假定成所有大学的默认制度。

## Stable generic locations

通用核心使用稳定 ID：

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

它们表达的是功能，而不是具体学校地名。

例如通用场景写：

```ts
location: 'teaching_building'
```

启用某个学校模板后，UI 可以显示：

```text
teaching_building → 某校具体教学楼名称
```

但场景代码、研究数据和人生状态仍使用 `teaching_building`。

## UniversityProfile

`convex/campus/profiles.ts` 定义大学配置，包括：

- institution model
- residential / commuter / hybrid / distributed campus form
- urbanicity
- semester / quarter / trimester / custom calendar
- undergraduate program length
- housing availability
- commuter share
- campus openness
- cultural context tags
- enabled locations
- location display-name overrides
- map id
- theme/content pack ids

默认配置是：

```text
generic_university
```

## Supporting different kinds of university life

通用核心必须兼容：

- 住宿型大学
- 走读型大学
- 混合住宿/通勤大学
- 城市分散型校园
- 研究型大学
- 教学型大学
- 文理学院
- 应用/职业型高校
- 社区学院或其他高等教育形式

因此“宿舍”不能成为所有玩家必经剧情；对于通勤生，第一天可以变成通勤、家庭居住或校外合租版本。

类似地：

- 四年本科只是默认，不是硬编码；
- 两学期制只是默认，可以覆盖为 quarter / trimester / custom；
- 社团、课程形式、考试压力、住宿文化、校园开放程度都可以由 profile 改写。

## Template registry

模板注册在：

```text
convex/campus/registry.ts
```

当前：

```text
generic_university  → core / default
bjtu_inspired       → planned / optional
```

未来可以继续增加：

```text
templates/
├── bjtu.ts
├── another_university.ts
└── ...
```

也可以增加不对应真实学校的类型模板，例如：

```text
large_urban_research_university
small_residential_college
commuter_city_university
international_exchange_campus
```

这些类型模板有时比真实大学模板更容易用于研究，因为能控制环境变量而不依赖学校品牌。

## Specific-university template rules

如果以后做真实大学模板，应做到：

1. 核心机制仍使用通用 ID。
2. 学校特有信息与通用场景分离。
3. 明确哪些内容是公开事实，哪些是为了游戏体验而虚构。
4. 不把地图当作权威校园导航。
5. 官方 logo、校徽、照片、建筑图像和品牌素材需要单独确认授权。
6. 学校特有事件放进独立 theme/content pack，而不是改通用包。
7. 模板必须可关闭；关闭后 AI-Uni 仍然完整可玩。

## Optional BJTU-inspired template

`convex/campus/templates/bjtu.ts` 保留了此前积累的北交大风格地点映射，但它现在只是一个 planned 模板，不再是默认世界。

示例：

```text
campus_gate       → 南门
teaching_building → 思源教学区
campus_green      → 明湖与校园绿地
```

这意味着之前的设计工作不会浪费，同时产品定位已经从“北交大模拟器”升级成“大学人生模拟平台”。

## First playable world

第一版仍然只需要做一张小地图，但它应该是**原创、通用的大学校园**：

```text
校园入口
   ↓
教学楼 ───── 图书馆
   ↓            ↓
校园餐厅 ─ 公共空间 ─ 学生活动中心
   ↓            ↓
住宿区 ─────── 运动场地
```

后期再通过模板替换成具体学校地图。

## Product principle

AI-Uni 的顺序应当是：

```text
先验证“大学生活 + 人生模拟”核心是否好玩
        ↓
再验证心理研究层
        ↓
再加入不同大学类型模板
        ↓
最后扩展高精度真实大学模板
```

这样真实大学模板会成为内容扩展能力，而不是产品的技术债务。
