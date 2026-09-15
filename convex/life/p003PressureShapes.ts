export type P003PressureShapeId =
  | 'loss'
  | 'danger'
  | 'humiliation'
  | 'entrapment'
  | 'role_overload'
  | 'uncertainty'
  | 'conflict'
  | 'belonging'
  | 'opportunity'
  | 'achievement'
  | 'transition'
  | 'caregiving'
  | 'neutral';

export type P003PressureShape = {
  id: P003PressureShapeId;
  label: string;
  description: string;
  negativeByDefinition: boolean;
};

export const p003PressureShapes: Record<P003PressureShapeId, P003PressureShape> = {
  loss: { id: 'loss', label: '失去', description: '重要关系、角色、资源、机会或熟悉生活的减少与结束。', negativeByDefinition: true },
  danger: { id: 'danger', label: '危险', description: '真实或感知到的身体、关系、经济或身份安全威胁。', negativeByDefinition: true },
  humiliation: { id: 'humiliation', label: '羞辱 / 地位受损', description: '公开评价、比较、拒绝或社会位置受损。', negativeByDefinition: true },
  entrapment: { id: 'entrapment', label: '被困', description: '重要压力持续存在，而行动、退出或改变的选项受到限制。', negativeByDefinition: true },
  role_overload: { id: 'role_overload', label: '角色过载', description: '多个责任、照护、学习或工作角色同时争夺有限资源。', negativeByDefinition: false },
  uncertainty: { id: 'uncertainty', label: '不确定', description: '结果、规则、关系或未来路线尚未确定。', negativeByDefinition: false },
  conflict: { id: 'conflict', label: '冲突', description: '目标、价值、利益或关系期待之间出现直接张力。', negativeByDefinition: false },
  belonging: { id: 'belonging', label: '归属', description: '进入、离开、被接纳、被排除或重新连接一个群体。', negativeByDefinition: false },
  opportunity: { id: 'opportunity', label: '机会', description: '新的资源、路线或关系入口出现，但往往伴随选择成本。', negativeByDefinition: false },
  achievement: { id: 'achievement', label: '成就 / 评价', description: '能力、表现、竞争、进步或失败被显著看见。', negativeByDefinition: false },
  transition: { id: 'transition', label: '转变', description: '生活角色、地点、阶段或日常结构发生转换。', negativeByDefinition: false },
  caregiving: { id: 'caregiving', label: '照护', description: '照顾他人、被照顾以及责任分配带来的关系与资源变化。', negativeByDefinition: false },
  neutral: { id: 'neutral', label: '日常', description: '没有明显压力形状，主要用于建立世界、习惯或关系基线。', negativeByDefinition: false },
};

export const p003PressureShapePrinciple =
  'Borrowed from AI-persona event modeling: events need a stress/affordance shape beyond positive-vs-negative valence. P003 uses shapes to diversify consequences and callbacks, never to calculate diagnosis risk automatically.';
