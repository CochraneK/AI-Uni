export const assessmentConstructs = {
  big5: {
    openness: '开放性：探索新体验、接受新信息与尝试陌生活动的行为倾向。',
    conscientiousness: '尽责性：计划、组织、持续完成任务与遵守约定的行为倾向。',
    extraversion: '外向性：主动接触他人、参与群体活动与寻求社交刺激的行为倾向。',
    agreeableness: '宜人性：合作、体谅、协商与帮助他人的行为倾向。',
    neuroticism: '神经质相关倾向：在压力、不确定性或评价情境中的负性情绪反应与恢复模式。',
  },
  cape: {
    persecutory_ideation: '与模糊社会信息中的自我指涉、威胁归因和证据更新有关的探索性行为信号。',
    bizarre_experiences: '与非常规解释、异常信念形成和现实检验有关的探索性行为信号。',
    perceptual_abnormalities: '与模糊知觉信息的确认、复核和确信程度有关的探索性行为信号。',
  },
  pcl5Associated: {
    intrusion: '与非自愿回想或被提醒后的行为反应相关的探索性信号。',
    avoidance: '与回避压力线索、场景或讨论相关的探索性信号。',
    negative_mood_cognition: '与压力情境中的负性解释、兴趣下降或社交退缩相关的探索性信号。',
    arousal_reactivity: '与警觉、惊跳、易激惹或压力后恢复速度相关的探索性信号。',
  },
};

export const interpretationBoundary = {
  big5: '游戏行为只能形成待验证的人格行为特征。正式人格结论应与独立、合规的大五量表进行校准。',
  cape: '不得把单个游戏行为换算为 CAPE-P15 条目或临床结论。只能研究行为特征与正式 CAPE-P15 得分之间的统计关系。',
  pcl5: '不得由游戏中的惊跳、回避或压力反应直接计算 PCL-5 分数或判断 PTSD。PCL-5 相关行为仅用于探索性关联，并需结合真实创伤暴露背景与正式量表。',
  llm: 'LLM 可以驱动 NPC、生成受控剧情或把自由文本映射到预注册行为 rubric，但不应直接输出诊断或未经验证的心理分数。',
};
