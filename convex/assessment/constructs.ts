export type ConstructDomain =
  | 'personality'
  | 'psychosis_like_experience'
  | 'trauma_associated'
  | 'social'
  | 'coping'
  | 'emotion'
  | 'attachment'
  | 'decision';

export type ConstructId =
  | `big5.${'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'}`
  | `cape.${'persecutory_ideation' | 'bizarre_experiences' | 'perceptual_abnormalities'}`
  | `pcl5_associated.${'intrusion' | 'avoidance' | 'negative_mood_cognition' | 'arousal_reactivity'}`
  | `social.${'rejection_sensitivity' | 'trust' | 'support_seeking'}`
  | `coping.${'avoidance' | 'problem_focused' | 'emotion_focused'}`
  | `emotion.${'regulation' | 'reappraisal' | 'suppression'}`
  | `attachment.${'anxiety' | 'avoidance'}`
  | `decision.${'risk_taking' | 'delay_discounting'}`;

export type ConstructDefinition = {
  id: ConstructId;
  label: string;
  domain: ConstructDomain;
  description: string;
  interpretation: 'candidate_behavioral_feature' | 'exploratory_only';
  calibration: string;
};

const defineConstruct = (definition: ConstructDefinition) => definition;

export const constructRegistry: Record<ConstructId, ConstructDefinition> = {
  'big5.openness': defineConstruct({
    id: 'big5.openness',
    label: '开放性',
    domain: 'personality',
    description: '探索新体验、接受新信息与尝试陌生活动的行为倾向。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '使用独立、合规的大五人格量表进行校准与效度验证。',
  }),
  'big5.conscientiousness': defineConstruct({
    id: 'big5.conscientiousness',
    label: '尽责性',
    domain: 'personality',
    description: '计划、组织、持续完成任务与遵守约定的行为倾向。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '使用独立、合规的大五人格量表进行校准与效度验证。',
  }),
  'big5.extraversion': defineConstruct({
    id: 'big5.extraversion',
    label: '外向性',
    domain: 'personality',
    description: '主动接触他人、参与群体活动与寻求社交刺激的行为倾向。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '使用独立、合规的大五人格量表进行校准与效度验证。',
  }),
  'big5.agreeableness': defineConstruct({
    id: 'big5.agreeableness',
    label: '宜人性',
    domain: 'personality',
    description: '合作、体谅、协商、边界设置与帮助他人的行为倾向。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '使用独立、合规的大五人格量表进行校准与效度验证。',
  }),
  'big5.neuroticism': defineConstruct({
    id: 'big5.neuroticism',
    label: '神经质相关倾向',
    domain: 'personality',
    description: '在压力、不确定性或评价情境中的负性情绪反应与恢复模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '使用独立、合规的大五人格量表进行校准与效度验证。',
  }),
  'cape.persecutory_ideation': defineConstruct({
    id: 'cape.persecutory_ideation',
    label: 'CAPE-P15：被害/猜疑相关体验',
    domain: 'psychosis_like_experience',
    description: '与模糊社会信息中的自我指涉、威胁归因和证据更新有关的探索性行为信号。',
    interpretation: 'exploratory_only',
    calibration: '只能研究行为特征与正式 CAPE-P15 得分之间的统计关系，不得由游戏行为换算条目分数。',
  }),
  'cape.bizarre_experiences': defineConstruct({
    id: 'cape.bizarre_experiences',
    label: 'CAPE-P15：奇异体验',
    domain: 'psychosis_like_experience',
    description: '与非常规解释、异常信念形成和现实检验有关的探索性行为信号。',
    interpretation: 'exploratory_only',
    calibration: '只能研究行为特征与正式 CAPE-P15 得分之间的统计关系，不得由游戏行为换算条目分数。',
  }),
  'cape.perceptual_abnormalities': defineConstruct({
    id: 'cape.perceptual_abnormalities',
    label: 'CAPE-P15：知觉异常',
    domain: 'psychosis_like_experience',
    description: '与模糊知觉信息的确认、复核和确信程度有关的探索性行为信号。',
    interpretation: 'exploratory_only',
    calibration: '只能研究行为特征与正式 CAPE-P15 得分之间的统计关系，不得由游戏行为换算条目分数。',
  }),
  'pcl5_associated.intrusion': defineConstruct({
    id: 'pcl5_associated.intrusion',
    label: 'PCL-5 相关：侵入反应',
    domain: 'trauma_associated',
    description: '与被提醒后的非自愿回想及相关行为反应有关的探索性信号。',
    interpretation: 'exploratory_only',
    calibration: '不得直接计算 PCL-5 分数；需要真实创伤暴露背景与正式 PCL-5 量表进行独立校准。',
  }),
  'pcl5_associated.avoidance': defineConstruct({
    id: 'pcl5_associated.avoidance',
    label: 'PCL-5 相关：回避',
    domain: 'trauma_associated',
    description: '与回避压力线索、场景或讨论相关的探索性行为信号。',
    interpretation: 'exploratory_only',
    calibration: '不得直接计算 PCL-5 分数；需要真实创伤暴露背景与正式 PCL-5 量表进行独立校准。',
  }),
  'pcl5_associated.negative_mood_cognition': defineConstruct({
    id: 'pcl5_associated.negative_mood_cognition',
    label: 'PCL-5 相关：负性认知/情绪',
    domain: 'trauma_associated',
    description: '与压力情境中的负性解释、兴趣下降或社交退缩相关的探索性信号。',
    interpretation: 'exploratory_only',
    calibration: '不得直接计算 PCL-5 分数；需要真实创伤暴露背景与正式 PCL-5 量表进行独立校准。',
  }),
  'pcl5_associated.arousal_reactivity': defineConstruct({
    id: 'pcl5_associated.arousal_reactivity',
    label: 'PCL-5 相关：警觉/反应性',
    domain: 'trauma_associated',
    description: '与警觉、惊跳、易激惹或压力后恢复速度相关的探索性信号。',
    interpretation: 'exploratory_only',
    calibration: '不得直接计算 PCL-5 分数；需要真实创伤暴露背景与正式 PCL-5 量表进行独立校准。',
  }),
  'social.rejection_sensitivity': defineConstruct({
    id: 'social.rejection_sensitivity',
    label: '拒绝敏感',
    domain: 'social',
    description: '面对含糊拒绝、被忽略或计划变化时的解释、确认和后续互动模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '在选定正式量表前仅作为研究构念，不继承任何现成量表阈值。',
  }),
  'social.trust': defineConstruct({
    id: 'social.trust',
    label: '社会信任',
    domain: 'social',
    description: '在合作、承诺和信息不完全场景中给予信任、复核与修正判断的模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '需要预先指定并验证独立 criterion measure。',
  }),
  'social.support_seeking': defineConstruct({
    id: 'social.support_seeking',
    label: '社会支持寻求',
    domain: 'social',
    description: '遇到困难时是否、何时以及向谁主动寻求信息性或情感性支持。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '需要预先指定并验证独立 criterion measure。',
  }),
  'coping.avoidance': defineConstruct({
    id: 'coping.avoidance',
    label: '回避型应对',
    domain: 'coping',
    description: '压力事件中推迟、离开、转移或减少接触问题的行为模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '后续接入应对方式量表时独立校准，不从单次情境直接下结论。',
  }),
  'coping.problem_focused': defineConstruct({
    id: 'coping.problem_focused',
    label: '问题导向应对',
    domain: 'coping',
    description: '搜集信息、制定计划、分解任务和直接处理问题的行为模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '后续接入应对方式量表时独立校准。',
  }),
  'coping.emotion_focused': defineConstruct({
    id: 'coping.emotion_focused',
    label: '情绪导向应对',
    domain: 'coping',
    description: '通过交流、安抚、转移或其他方式调节压力体验的行为模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '后续接入应对方式量表时独立校准。',
  }),
  'emotion.regulation': defineConstruct({
    id: 'emotion.regulation',
    label: '情绪调节',
    domain: 'emotion',
    description: '在冲突、评价和意外事件中的反应强度、策略变化与恢复速度。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '后续接入情绪调节相关量表或实验任务时独立校准。',
  }),
  'emotion.reappraisal': defineConstruct({
    id: 'emotion.reappraisal',
    label: '认知重评',
    domain: 'emotion',
    description: '获得新信息后重新解释事件并调整情绪/行为反应的模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '后续接入情绪调节相关量表时独立校准。',
  }),
  'emotion.suppression': defineConstruct({
    id: 'emotion.suppression',
    label: '表达抑制',
    domain: 'emotion',
    description: '在人际情境中隐藏、压低或延迟表达情绪的行为模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '后续接入情绪调节相关量表时独立校准。',
  }),
  'attachment.anxiety': defineConstruct({
    id: 'attachment.anxiety',
    label: '依恋焦虑相关行为',
    domain: 'attachment',
    description: '亲密关系中对回应、关系稳定性和被拒绝线索的关注与确认模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '仅在后续有明确研究设计、适龄样本和独立量表时启用。',
  }),
  'attachment.avoidance': defineConstruct({
    id: 'attachment.avoidance',
    label: '依恋回避相关行为',
    domain: 'attachment',
    description: '亲密关系中对靠近、依赖和情感交流的距离调节模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '仅在后续有明确研究设计、适龄样本和独立量表时启用。',
  }),
  'decision.risk_taking': defineConstruct({
    id: 'decision.risk_taking',
    label: '风险选择',
    domain: 'decision',
    description: '在收益、不确定性与潜在损失并存时的选择模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '优先使用独立行为任务验证，不与人格或临床量表直接等同。',
  }),
  'decision.delay_discounting': defineConstruct({
    id: 'decision.delay_discounting',
    label: '延迟折扣',
    domain: 'decision',
    description: '即时较小收益与延迟较大收益之间的选择模式。',
    interpretation: 'candidate_behavioral_feature',
    calibration: '优先使用独立行为任务验证，不与人格或临床量表直接等同。',
  }),
};

export const getConstruct = (id: ConstructId) => constructRegistry[id];

export const interpretationBoundary = {
  general: '任何游戏行为都应先视为待验证行为特征；不能因为一个场景中的一次反应就给玩家贴人格、症状或临床标签。',
  big5: '游戏行为只能形成待验证的人格行为特征。正式人格结论应与独立、合规的大五量表进行校准。',
  cape: '不得把单个游戏行为换算为 CAPE-P15 条目或临床结论。只能研究行为特征与正式 CAPE-P15 得分之间的统计关系。',
  pcl5: '不得由游戏中的惊跳、回避或压力反应直接计算 PCL-5 分数或判断 PTSD。PCL-5 相关行为仅用于探索性关联，并需结合真实创伤暴露背景与正式量表。',
  llm: 'LLM 可以驱动 NPC、生成受控剧情或把自由文本映射到预注册行为 rubric，但不应直接输出诊断或未经验证的心理分数。',
};
