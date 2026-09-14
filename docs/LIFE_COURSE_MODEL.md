# AI-Uni Lifespan Psychology / Life-Course Model

AI-Uni 的长期目标不是把大学生活包装成量表，而是做一个从大学第一周开始、可以跨越毕业、实习、工作、亲密关系、家庭、中年、退休直到生命回顾的长期人生模拟世界。

心理学理论在这里主要负责三件事：

1. 帮助设计更真实的人生阶段、关系和事件；
2. 决定哪些状态值得长期保存、哪些事件可能产生延迟影响；
3. 为研究提出可验证的行为信号，而不是直接输出临床或人格结论。

## 1. 总体分层

```text
时代 / 社会 / 文化 / 经济
        ↓
生态系统与机会结构
        ↓
生命历程：路径、时机、转折点、linked lives
        ↓
发展阶段与发展任务
        ↓
家庭系统与代际历史
        ↓
身份 / 价值 / 自我概念
        ↓
社会网络与重要关系
        ↓
关系特异的依恋动态
        ↓
压力评价 / 应对 / 资源 / 复原
        ↓
人格与个体差异
        ↓
当前状态：情绪、疲劳、压力、动机
        ↓
具体行为：选择、对话、探索、回避、求助、修复
        ↓
短期结果
        ↓
长期轨迹再次被更新
```

上层只影响机会、解释和概率，不直接决定行为。

## 2. 第一章：大学第一周

第一章固定 **7 个完整可玩日**，不做时间压缩。

- Day 1：报到、宿舍、第一次逛校园
- Day 2：第一次正式上课
- Day 3：第一次小组合作
- Day 4：社团、兴趣和身份探索
- Day 5：第一次明显人际摩擦
- Day 6：周末聚会 / 校外活动
- Day 7：自由安排、重要关系回访、第一周结束

第一章结束后不显示人格或症状分数，只保留：关系、任务、选择、事件史、家庭状态、身份状态和研究 telemetry。

代码：`convex/life/firstWeek.ts`。

## 3. 时间尺度

第一周之后逐渐压缩时间，避免真的模拟两万多个自然日：

```text
大学第一周        1 playable unit = 1 天
大一              1 unit ≈ 1 周
大二 / 大三 / 大四 1 unit ≈ 1 月
初入职场          1 unit ≈ 1 季度
25–35 岁          1 unit ≈ 1 年
中年以后          1 unit ≈ 数年
退休 / 晚年        1 unit ≈ 数年
```

压缩的是“无重大变化的时间”，不是把重要事件黑屏跳过。考试、毕业、第一次实习、重要恋爱、失业、结婚、照护、重大关系修复、退休等仍可以展开成完整 playable episode。

## 4. Erikson-inspired 发展主轴

埃里克森适合作为人生阶段的主题框架，而不是评分系统。

AI-Uni 当前使用：

- 晚期青春期：身份、独立、归属
- 成年初显期：探索教育、职业与关系方向
- 成年早期：亲密、工作与承诺
- 成年中期：generativity、照护、职业再评价
- 成年后期：退休和社会角色重构
- 晚年：意义整合与生命回顾

每个发展任务允许：

```text
not_active
active
settled_for_now
reopened
```

使用 `settled_for_now` 而不是 `completed`，因为人生任务可能在离婚、转行、退休、迁居或丧失后重新出现。

## 5. 生命历程视角

AI-Uni 需要长期保存事件史，而不只是当前属性。

核心机制：

- **timing**：同一事件发生在不同年龄/角色下意义不同；
- **turning point**：机会、关系、失败、迁居、健康变化可能改变方向；
- **path dependence**：过去的决定影响未来可见的选项；
- **accumulation**：长期的小优势/劣势会累积；
- **linked lives**：玩家的人生与父母、朋友、伴侣、孩子、导师和同事相互连接；
- **plasticity**：早期轨迹可以被后来的关系、资源和选择修正。

因此：

```text
大一参加社团
→ 认识学长
→ 大二进入项目
→ 大三获得实习推荐
→ 求职路径改变
```

是一条可能的轨迹，而不是硬编码结果。

## 6. Bronfenbrenner-inspired 生态层

避免把所有结果都心理化到玩家本人。

AI-Uni 区分：

- individual：个人当前状态和能力
- microsystem：宿舍、班级、家庭、伴侣、团队
- mesosystem：家庭 × 学校、家庭 × 工作、伴侣 × 朋友圈
- exosystem：学校制度、公司、就业市场、医疗服务、城市资源
- macrosystem：文化规范、成功标准、婚恋/家庭期待、经济结构
- chronosystem：时代变化、技术变化、经济周期、公共事件

例如失业可以来自行业衰退而不是“尽责性低”；考试表现也可能受课程安排、资源和生活压力共同影响。

## 7. 家庭系统与代际传递

家庭不是简单的“原生家庭好/坏”。长期保存的维度包括：

- 沟通开放度
- 情绪表达
- 自主支持
- 心理控制
- 成就压力
- 边界灵活性
- 冲突修复
- 照护可靠性
- 经济安全
- 代际亲密

跨代变化至少允许三种模式：

```text
repetition  模式重复
reversal    反向补偿
revision    整合修正
```

例如一个人在高控制家庭长大，未来可能复制这种模式，也可能极端反向，也可能逐渐形成新的平衡。系统不得把童年背景写成成年命运。

## 8. 依恋作为关系动力，不作为永久标签

依恋相关状态维护在每一段重要关系内部，而不是玩家全局标签。

每段关系可保存：

- trust
- closeness
- reciprocity
- reliability
- conflict repair
- comfort with dependence
- fear of rejection
- reassurance seeking
- withdrawal
- boundary clarity

玩家可能对父母比较回避、对长期朋友很安全、对某段恋爱更焦虑。这比把一个人永久标成“焦虑型依恋”更符合 AI-Uni 的长期关系设计。

重复的稳定回应、背叛、失约、冲突和修复都可以缓慢改变关系状态。

## 9. 身份发展

AI-Uni 的身份不是一个职业字符串，而是多个并行领域：

- education
- career
- relationships
- family
- community
- values
- competence
- lifestyle

大学阶段主要是探索；之后可能形成承诺，也允许重新打开。

例如：

```text
“成绩就是我的价值”
→ 实习失败
→ 重新认识能力与价值
→ 发展出工作之外的身份
```

这种变化适合通过长期事件史表现，而不是一次对话后立刻改写。

## 10. 压力—评价—应对—复原

重大事件统一使用类似流程：

```text
stressor
→ appraisal
→ coping strategy
→ resource use
→ social response
→ short-term outcome
→ recovery
→ learning / carryover
```

可用于：

- 考试
- 挂科
- 分手
- 失业
- 实习评价
- 财务压力
- 家庭冲突
- 照护父母
- 健康事件
- 丧失

“复原力”不意味着完全不难受，而是关注资源使用、策略灵活性、恢复和后续适应。

## 11. Self-Determination：自主、胜任、联结

这一层适合解释长期动机质量。

AI-Uni 可以区分：

- autonomy：这个选择是否像是“我自己的选择”；
- competence：玩家是否感到自己有办法学会、处理或改善；
- relatedness：是否感到和重要的人有连接。

例如同样是考研：

```text
“我真的想做研究”
```

和

```text
“父母说不考研就没出息”
```

在剧情意义上应不同，即使最终行为相同。

## 12. 社会网络 / Social Convoy

不能只做 NPC 好感度。

长期网络建议记录：

- network size
- tie strength
- support availability
- reciprocity
- mentor access
- bridge ties
- relationship diversity
- isolation risk
- conflict spillover

一个大学朋友、导师或实习同事可以在十年后重新成为关键节点。

同一个 NPC 可以：

```text
18 岁：室友
22 岁：毕业好友
28 岁：参加彼此婚礼或重要人生事件
35 岁：联系变少
48 岁：重新联系
65 岁：同学会 / 共同回忆
```

## 13. 工作与职业

工作线不应只是“找到工作”。

长期可包含：

```text
实习
→ 求职
→ 第一份工作
→ 团队/上司
→ 晋升/停滞
→ 跳槽
→ 失业
→ 转行
→ 创业
→ 职业倦怠
→ mentoring 下一代
→ 职业退出
→ 退休
```

职业结果受个人、网络、家庭责任、经济环境和随机机会共同影响。

## 14. 亲密关系、婚姻与家庭

婚姻不是必选终点。

一段关系可以经历：

```text
认识
→ 熟悉
→ 靠近
→ 承诺或保持距离
→ 冲突
→ rupture / repair
→ 同居 / 分开 / 婚姻 / 其他形式
→ 长期家庭协商
```

是否生育也应是独立分支。

如果玩家成为父母，家庭代际层开始真正发挥作用：上一代脚本如何被复制、反转或修正。

## 15. 中年以后

中年和晚年不能只写成“数值下降”。

应加入：

- generativity
- mentoring
- 照护父母
- 子女离家（如果有）
- 职业重新评价
- 关系长期修复或疏远
- 健康与资源适应
- 社会角色变化
- 选择、优化与补偿（SOC）

## 16. 退休与晚年

退休不等于游戏结束。

退休后可以重新组织：

- 日常时间结构
- 社会网络
- 兴趣和社区参与
- 伴侣关系
- 财务决策
- 身体能力变化后的替代策略
- mentoring / generativity

随着时间视野变化，玩家可能减少低价值关系、加强少数重要关系；这可以作为 later-life 事件生成逻辑，但不能假设所有老年人都会社交收缩。

## 17. 意义、遗憾与生命回顾

晚年终章不需要告诉玩家“你的人生得分 82”。

更适合回调几十年前真正发生过的事件：

- 当初没有去的城市
- 大一认识的人
- 一段修复或没有修复的关系
- 一次职业选择
- 对下一代产生过的影响
- 失去的人
- 重新找到的兴趣

最终目标是让玩家看到一条**有历史的生命轨迹**，而不是综合心理分数。

## 18. 理论目录

`convex/life/theories.ts` 当前登记：

- Erikson-inspired development
- life-course perspective
- ecological systems
- family systems / intergenerational transmission
- relationship-specific attachment
- identity development
- stress / coping / resilience
- self-determination
- social convoy / networks
- socioemotional selectivity
- selection-optimization-compensation
- meaning / generativity / life review

以后增加理论时，先定义它适合驱动什么机制，以及禁止怎样误用。

## 19. 持久化状态

`convex/life/schema.ts` 新增：

```text
lifeProfiles
familySystemStates
relationshipStates
ecologicalContextStates
lifeEvents
developmentalTaskStates
```

这些状态与 `researchSessions / telemetryEvents / behavioralFeatures` 分开。

原因：**玩家的人生世界状态 != 研究测量结果。**

即使未来关闭所有心理研究，AI-Uni 的人生模拟仍然应该成立。

## 20. 第一原则

AI-Uni 长期开发应始终保持：

```text
历史影响现在，但不决定现在。
关系可以修复，也可以恶化。
家庭模式可以复制，也可以改变。
人格相对稳定，但行为随情境变化。
环境和机会与个人同样重要。
人生不存在唯一正确路线。
研究信号不是诊断。
```
