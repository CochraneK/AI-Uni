# Optional BJTU-inspired University Template

AI-Uni 的默认大学世界是 `generic_university`。本文件记录一个**可选、非默认**的北京交通大学风格模板，用来验证特定大学如何挂载到通用核心上。

## Template mapping

核心场景仍使用稳定的通用地点 ID：

```text
campus_gate       → 南门
teaching_building → 思源教学区
library           → 图书馆
student_center    → 学生活动中心
cafeteria         → 食堂
campus_green      → 明湖与校园绿地
sports_field      → 体育场
dormitory         → 学生宿舍
```

对应代码：`convex/campus/templates/bjtu.ts`。

## What a specific template may override

- 地图和 tileset
- 地点显示名称
- 校园视觉主题
- 学校特有日历与制度
- 住宿 / 通勤结构
- 校园传统、组织与活动
- 学校特有 NPC 角色
- 学校特有 Content Pack

它不应该修改：

- Life-Course 核心状态
- 家庭 / 依恋 / 身份 / 生态等人生模型
- 研究测量边界
- 通用行为 telemetry 语义
- 通用场景的稳定 location ID

## Map pipeline

如果以后正式制作 BJTU-inspired 地图，仍可使用上游 AI Town 的 Tiled → JSON → `data/convertMap.js` 工作流。

示例：

```bash
node data/convertMap.js data/bjtu-map.json /ai-uni/assets/templates/bjtu/bjtu_tileset.png <widthPx> <heightPx>
```

建议模板资产独立存放：

```text
assets/templates/bjtu/
  bjtu_tileset.png
  ...
```

而不是让通用核心依赖 `assets/bjtu/`。

## Publication boundary

如果模板使用真实大学的名称、建筑特征、校徽、logo、照片、地图或官方视觉元素，应分别核实事实与授权。

游戏化地图应明确是模拟/主题化表达，不应冒充官方校园导航。

## Status

当前模板状态：`planned`。

它不会进入默认运行时，也不会改变 AI-Uni 的通用大学产品定位。
