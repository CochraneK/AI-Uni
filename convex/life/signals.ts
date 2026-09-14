import type { LifeResearchSignalId } from './types';

export type LifeResearchSignalDefinition = {
  id: LifeResearchSignalId;
  label: string;
  description: string;
  observableCandidates: string[];
  boundary: string;
};

export const lifeResearchSignals: Record<LifeResearchSignalId, LifeResearchSignalDefinition> = {
  'identity.exploration': {
    id: 'identity.exploration',
    label: '身份探索',
    description: '尝试新的教育、职业、群体、价值或生活选项。',
    observableCandidates: ['new_option_sampling', 'cross_domain_exploration', 'information_seeking', 'revisits_previous_choice'],
    boundary: '探索多或少都不自动代表成熟、健康或优劣。',
  },
  'identity.commitment': {
    id: 'identity.commitment',
    label: '身份承诺',
    description: '在探索后持续投入某个方向或角色。',
    observableCandidates: ['sustained_goal_investment', 'consistent_role_choice', 'commitment_after_comparison'],
    boundary: '承诺不是永久锁定；后续可以重新打开。',
  },
  'identity.flexibility': {
    id: 'identity.flexibility',
    label: '身份修正弹性',
    description: '在获得新经验后调整自我定义和长期方向。',
    observableCandidates: ['goal_revision', 'belief_revision', 'role_redefinition'],
    boundary: '变化并不自动等于不稳定，稳定也不自动等于僵化。',
  },
  'family.autonomy_negotiation': {
    id: 'family.autonomy_negotiation',
    label: '家庭自主性协商',
    description: '在家庭期待与个人选择之间沟通、设边界和协商。',
    observableCandidates: ['states_preference', 'seeks_compromise', 'boundary_setting', 'delays_decision_for_family'],
    boundary: '不得把文化差异或家庭紧密程度直接病理化。',
  },
  'family.conflict_repair': {
    id: 'family.conflict_repair',
    label: '家庭冲突修复',
    description: '冲突后重新沟通、道歉、澄清或建立新规则。',
    observableCandidates: ['reinitiates_contact', 'apology_or_acknowledgment', 'rule_revision', 'accepts_repair_attempt'],
    boundary: '在不安全关系中保持距离也可能是合理选择。',
  },
  'family.intergenerational_repetition': {
    id: 'family.intergenerational_repetition',
    label: '代际模式重复',
    description: '在新家庭或关系中出现与上一代类似的互动脚本。',
    observableCandidates: ['repeats_control_pattern', 'repeats_conflict_script', 'repeats_emotional_avoidance'],
    boundary: '只能描述行为相似性，不能声称因果宿命。',
  },
  'family.intergenerational_revision': {
    id: 'family.intergenerational_revision',
    label: '代际模式修正',
    description: '识别旧脚本并发展不同的边界、沟通或照护方式。',
    observableCandidates: ['explicit_rule_change', 'new_repair_strategy', 'autonomy_support', 'emotionally_open_response'],
    boundary: '修正是长期过程，不应由一次“正确选择”判定完成。',
  },
  'relationship.trust_update': {
    id: 'relationship.trust_update',
    label: '关系信任更新',
    description: '根据可靠回应、失约、背叛和修复逐步调整信任。',
    observableCandidates: ['trust_after_reliability', 'trust_after_breach', 'checks_before_relying', 'restores_access_after_repair'],
    boundary: '信任需要结合具体关系历史解释。',
  },
  'relationship.support_reciprocity': {
    id: 'relationship.support_reciprocity',
    label: '支持互惠',
    description: '长期关系中给予和接受帮助的平衡与变化。',
    observableCandidates: ['offers_support', 'accepts_support', 'returns_support', 'support_imbalance_duration'],
    boundary: '不能只按次数判断关系质量。',
  },
  'relationship.conflict_repair': {
    id: 'relationship.conflict_repair',
    label: '关系冲突修复',
    description: '重要关系发生 rupture 后如何恢复、重订边界或结束关系。',
    observableCandidates: ['repair_attempt', 'accepts_repair', 'boundary_revision', 'relationship_termination'],
    boundary: '结束有害关系也是可能的适应结果。',
  },
  'relationship.proximity_seeking': {
    id: 'relationship.proximity_seeking',
    label: '压力下的靠近/确认',
    description: '在不确定或压力情境中向特定重要关系寻求联系、确认或安慰。',
    observableCandidates: ['contact_attempts', 'reassurance_requests', 'support_target_selection'],
    boundary: '这是关系特异信号，不是全局依恋类型。',
  },
  'relationship.withdrawal': {
    id: 'relationship.withdrawal',
    label: '关系撤退',
    description: '冲突或压力后减少接触、缩短沟通或延迟回应。',
    observableCandidates: ['contact_reduction', 'conversation_exit', 'delayed_reply', 'avoids_specific_person'],
    boundary: '撤退可能是自我保护、休息或回避，需要上下文解释。',
  },
  'network.social_support': {
    id: 'network.social_support',
    label: '社会支持可得性',
    description: '玩家是否拥有可提供实际、信息或情感支持的人。',
    observableCandidates: ['available_supporters', 'successful_support_requests', 'support_domain_coverage'],
    boundary: '网络规模不等同于支持质量。',
  },
  'network.bridge_ties': {
    id: 'network.bridge_ties',
    label: '桥接关系',
    description: '把玩家连接到新群体、新信息或机会的关系。',
    observableCandidates: ['cross_group_contacts', 'referral_events', 'new_opportunity_via_contact'],
    boundary: '用于机会结构分析，不等同于操纵关系。',
  },
  'network.isolation': {
    id: 'network.isolation',
    label: '社会孤立风险',
    description: '长期缺少可联系的重要关系或支持渠道。',
    observableCandidates: ['low_active_ties', 'failed_support_access', 'long_gap_without_meaningful_contact'],
    boundary: '独处偏好不等同于孤独或病理。',
  },
  'adaptation.appraisal': {
    id: 'adaptation.appraisal',
    label: '压力事件评价',
    description: '事件被理解为挑战、威胁、损失、可管理或不确定。',
    observableCandidates: ['stated_appraisal', 'information_search', 'risk_estimation', 'perceived_control'],
    boundary: '同一事件对不同人和不同阶段意义可能不同。',
  },
  'adaptation.recovery': {
    id: 'adaptation.recovery',
    label: '恢复过程',
    description: '事件后重新投入日常活动、关系或任务的速度和方式。',
    observableCandidates: ['time_to_resume', 'return_to_routine', 'persistent_disruption', 'support_assisted_recovery'],
    boundary: '恢复速度不是心理健康排名。',
  },
  'adaptation.strategy_flexibility': {
    id: 'adaptation.strategy_flexibility',
    label: '应对策略灵活性',
    description: '在策略无效或情境变化时切换应对方式。',
    observableCandidates: ['strategy_switch', 'abandons_failed_strategy', 'combines_support_and_planning'],
    boundary: '不同情境需要不同策略，不设唯一最佳方式。',
  },
  'resilience.resource_use': {
    id: 'resilience.resource_use',
    label: '复原资源使用',
    description: '压力下是否利用个人、关系、制度或环境资源。',
    observableCandidates: ['mentor_contact', 'peer_support', 'institutional_help', 'rest_and_recovery', 'problem_solving'],
    boundary: '复原不意味着没有痛苦，也不能作为责怪受困者的依据。',
  },
  'meaning.purpose': {
    id: 'meaning.purpose',
    label: '目的感',
    description: '长期目标是否与玩家认为重要的方向相连接。',
    observableCandidates: ['value_consistent_goal', 'sustained_meaningful_project', 'goal_prioritization'],
    boundary: '不规定统一的人生目标。',
  },
  'meaning.generativity': {
    id: 'meaning.generativity',
    label: 'Generativity / 对下一代的贡献',
    description: '通过养育、指导、工作、社区或创造对他人和未来产生影响。',
    observableCandidates: ['mentoring', 'caregiving', 'knowledge_transfer', 'community_contribution'],
    boundary: '不等同于是否生育。',
  },
  'meaning.life_satisfaction': {
    id: 'meaning.life_satisfaction',
    label: '生活满意相关体验',
    description: '对当前生活结构和重要领域的主观评价。',
    observableCandidates: ['self_report_reflection', 'domain_satisfaction_changes', 'goal_life_alignment'],
    boundary: '需要独立自陈或研究测量，不能只从行为推断。',
  },
  'meaning.regret_integration': {
    id: 'meaning.regret_integration',
    label: '遗憾整合',
    description: '对过去未实现目标和重大选择进行重新理解与整合。',
    observableCandidates: ['reframes_past_choice', 'reengages_unfinished_goal', 'accepts_irreversibility', 'repair_attempt'],
    boundary: '不把“无遗憾”定义为理想人生。',
  },
};
