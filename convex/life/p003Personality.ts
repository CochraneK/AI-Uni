export type P003PersonalityDimensionId =
  | 'big5.openness'
  | 'big5.conscientiousness'
  | 'big5.extraversion'
  | 'big5.agreeableness'
  | 'big5.neuroticism'
  | 'behavior.autonomy'
  | 'behavior.support_seeking'
  | 'behavior.risk_taking'
  | 'coping.problem_focused'
  | 'coping.emotion_focused'
  | 'coping.avoidance'
  | 'coping.reappraisal';

export type P003ChoiceSignal = {
  scores: Partial<Record<P003PersonalityDimensionId, number>>;
  interpretation: string;
};

export type P003DecisionRecord = {
  eventId: string;
  choiceId: string;
  eventTitle: string;
  choiceLabel: string;
  age: number;
};

export type P003PersonalityEvidence = P003DecisionRecord & {
  signal: number;
  interpretation: string;
};

export type P003PersonalityDimensionResult = {
  id: P003PersonalityDimensionId;
  label: string;
  score: number;
  band: 'low' | 'middle' | 'high';
  confidence: number;
  evidenceCount: number;
  evidence: P003PersonalityEvidence[];
  summary: string;
};

export type P003PersonalityReport = {
  title: string;
  subtitle: string;
  dimensions: P003PersonalityDimensionResult[];
  strongestPatterns: P003PersonalityDimensionResult[];
  caution: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const p003PersonalityDimensions: Record<
  P003PersonalityDimensionId,
  { label: string; low: string; middle: string; high: string }
> = {
  'big5.openness': {
    label: '开放性',
    low: '更偏好熟悉、具体和可预测的路径；面对新环境时通常先确认边界。',
    middle: '在熟悉与探索之间切换，会根据风险和资源决定是否尝试新路线。',
    high: '更常主动接近新经验、新信息和替代路线，也愿意重新理解旧选择。',
  },
  'big5.conscientiousness': {
    label: '尽责性',
    low: '更容易根据当下状态调整计划，不太执着于预先结构和持续执行。',
    middle: '会在结构、责任与灵活调整之间寻找平衡。',
    high: '更常使用计划、复盘、记录和持续投入来处理任务与长期责任。',
  },
  'big5.extraversion': {
    label: '外向性',
    low: '更常保留独处和观察空间，不会因为机会出现就立即进入社交互动。',
    middle: '社交投入随情境变化；既能靠近人群，也会主动保留恢复空间。',
    high: '更常主动接近他人、建立新联系，并从互动中获得信息或支持。',
  },
  'big5.agreeableness': {
    label: '宜人性',
    low: '更重视自我边界和直接表达，不会优先以关系和谐作为唯一目标。',
    middle: '会在维护自己与照顾关系之间协商，而不是固定偏向某一端。',
    high: '更常考虑互惠、协商和他人的需要，倾向通过合作维持关系。',
  },
  'big5.neuroticism': {
    label: '情绪反应敏感度',
    low: '在这些游戏情境中较少持续聚焦威胁或不确定性，恢复和转移注意较快。',
    middle: '压力反应会随关系、资源和事件强度变化，没有稳定落在单一方向。',
    high: '在不确定、评价或关系风险中更容易保持警觉，并投入更多注意处理潜在威胁。',
  },
  'behavior.autonomy': {
    label: '自主取向',
    low: '更常借助已有规则、关系或环境安排来降低决策成本。',
    middle: '会根据情境在自主决定与借助他人之间切换。',
    high: '更常主动设定边界、选择路线或重新安排自己的时间与角色。',
  },
  'behavior.support_seeking': {
    label: '支持寻求',
    low: '压力下更常先自己处理，或延迟向他人和制度资源求助。',
    middle: '会根据问题性质决定自己处理还是调用关系和制度支持。',
    high: '更常识别可用支持，并愿意向关系、同事或制度资源发出明确请求。',
  },
  'behavior.risk_taking': {
    label: '风险偏好',
    low: '更常保留安全边界、先观察或选择较可逆的方案。',
    middle: '会综合收益、成本和可逆性后决定是否冒险。',
    high: '更常愿意承担不确定性，以换取探索、机会或更强的自主空间。',
  },
  'coping.problem_focused': {
    label: '问题导向应对',
    low: '遇到压力时不一定马上拆解问题或直接行动，可能先处理情绪或等待信息。',
    middle: '会在直接解决、等待和情绪调节之间切换。',
    high: '更常搜集信息、复盘、协商、记录或寻找具体可执行的解决办法。',
  },
  'coping.emotion_focused': {
    label: '情绪导向应对',
    low: '较少把表达、安抚或情绪恢复放在第一步。',
    middle: '会在需要时处理感受，但通常与其他策略搭配。',
    high: '较常先处理情绪体验、寻求安抚或通过关系恢复，再继续行动。',
  },
  'coping.avoidance': {
    label: '回避型应对',
    low: '较少通过拖延、撤离或切断接触来处理压力，更愿意继续接触问题。',
    middle: '会在短暂退出与继续处理之间切换，取决于当前资源和压力。',
    high: '在压力上升时更常选择暂时退出、推迟或把注意转向其他事情。',
  },
  'coping.reappraisal': {
    label: '重评与修正',
    low: '更倾向维持原判断，除非有很明确的新信息或外部变化。',
    middle: '会在证据足够时修正判断，但不会为了变化而变化。',
    high: '更常主动重新解释过去、比较替代方案，并允许旧目标和旧关系获得新意义。',
  },
};

const s = (
  interpretation: string,
  scores: P003ChoiceSignal['scores'],
): P003ChoiceSignal => ({ interpretation, scores });

export const p003ChoiceSignals: Record<string, P003ChoiceSignal> = {
  'first_favorite_object:soft_object': s('更依赖熟悉感和感官稳定来恢复状态。', {
    'big5.openness': -0.2,
    'big5.neuroticism': -0.1,
    'coping.emotion_focused': 0.3,
  }),
  'first_favorite_object:window_light': s('对变化和新刺激表现出持续探索。', {
    'big5.openness': 0.6,
    'behavior.risk_taking': 0.1,
  }),
  'first_favorite_object:caregiver_voice': s('优先借助重要关系获得稳定和确认。', {
    'big5.agreeableness': 0.2,
    'behavior.support_seeking': 0.4,
    'coping.emotion_focused': 0.4,
  }),

  'toddler_forbidden_drawer:open_it': s('面对明确边界时仍优先满足探索欲。', {
    'big5.openness': 0.6,
    'behavior.autonomy': 0.5,
    'behavior.risk_taking': 0.6,
    'big5.agreeableness': -0.2,
  }),
  'toddler_forbidden_drawer:ask_first': s('通过提问和协商同时处理好奇与边界。', {
    'big5.openness': 0.4,
    'big5.agreeableness': 0.4,
    'behavior.autonomy': 0.3,
    'coping.problem_focused': 0.4,
  }),
  'toddler_forbidden_drawer:move_on': s('在限制出现后快速切换目标。', {
    'behavior.risk_taking': -0.3,
    'coping.avoidance': 0.2,
    'big5.neuroticism': -0.2,
  }),

  'first_public_meltdown:cry_loudly': s('压力达到阈值后更直接表达情绪。', {
    'big5.neuroticism': 0.5,
    'big5.extraversion': 0.2,
    'coping.emotion_focused': 0.6,
    'coping.avoidance': -0.2,
  }),
  'first_public_meltdown:keep_asking': s('在冲突里持续追问信息和理由。', {
    'behavior.autonomy': 0.5,
    'coping.problem_focused': 0.5,
    'big5.openness': 0.2,
    'big5.neuroticism': 0.1,
  }),
  'first_public_meltdown:hold_it_in': s('为了停止冲突而压低外显反应。', {
    'big5.extraversion': -0.3,
    'coping.emotion_focused': -0.3,
    'coping.avoidance': 0.3,
    'big5.neuroticism': 0.2,
  }),

  'playground_turn:take_it': s('在资源冲突时优先保护自己的即时需要。', {
    'behavior.autonomy': 0.5,
    'behavior.risk_taking': 0.3,
    'big5.agreeableness': -0.5,
    'big5.extraversion': 0.2,
  }),
  'playground_turn:propose_turns': s('主动构造规则来同时保留自己和他人的机会。', {
    'big5.agreeableness': 0.6,
    'big5.conscientiousness': 0.3,
    'coping.problem_focused': 0.5,
    'behavior.autonomy': 0.2,
  }),
  'playground_turn:choose_slide': s('冲突出现时愿意放弃当前目标并转向替代方案。', {
    'big5.agreeableness': 0.2,
    'coping.avoidance': 0.4,
    'behavior.risk_taking': -0.2,
    'coping.reappraisal': 0.2,
  }),

  'caregiver_late_pickup:ask_teacher': s('在不确定中主动寻找可用成年人确认情况。', {
    'behavior.support_seeking': 0.7,
    'big5.extraversion': 0.2,
    'big5.neuroticism': 0.3,
    'coping.problem_focused': 0.2,
  }),
  'caregiver_late_pickup:keep_playing': s('通过把注意力转向可控活动降低等待压力。', {
    'big5.neuroticism': -0.3,
    'coping.emotion_focused': 0.2,
    'coping.avoidance': 0.2,
  }),
  'caregiver_late_pickup:watch_door': s('面对不确定关系线索时持续保持注意和等待。', {
    'big5.neuroticism': 0.6,
    'behavior.support_seeking': -0.1,
    'coping.avoidance': -0.2,
  }),

  'moving_house_childhood:take_objects': s('优先保存可携带的熟悉感和个人控制。', {
    'behavior.autonomy': 0.3,
    'big5.openness': -0.2,
    'coping.emotion_focused': 0.2,
  }),
  'moving_house_childhood:say_goodbye': s('把变化处理成关系事件，并主动完成告别。', {
    'big5.agreeableness': 0.4,
    'big5.extraversion': 0.3,
    'behavior.support_seeking': 0.2,
    'coping.emotion_focused': 0.4,
  }),
  'moving_house_childhood:ask_new_place': s('通过获取新环境信息来降低不确定性。', {
    'big5.openness': 0.5,
    'coping.problem_focused': 0.5,
    'big5.neuroticism': 0.1,
  }),

  'first_school_gate:find_seat': s('先建立结构和秩序，再进入新的社会环境。', {
    'big5.conscientiousness': 0.5,
    'coping.problem_focused': 0.3,
    'behavior.risk_taking': -0.1,
  }),
  'first_school_gate:look_for_peer': s('进入陌生环境时优先寻找熟悉关系作为锚点。', {
    'big5.extraversion': 0.2,
    'behavior.support_seeking': 0.5,
    'big5.agreeableness': 0.2,
  }),
  'first_school_gate:watch_everything': s('更倾向先观察和理解场域，再决定如何加入。', {
    'big5.openness': 0.3,
    'big5.extraversion': -0.3,
    'behavior.risk_taking': -0.2,
    'coping.problem_focused': 0.2,
  }),

  'first_school_lunch:familiar_group': s('在社交资源可用时优先巩固已有关系。', {
    'big5.extraversion': 0.2,
    'big5.agreeableness': 0.2,
    'behavior.risk_taking': -0.2,
  }),
  'first_school_lunch:new_peer': s('愿意为潜在新关系承担一定社交不确定性。', {
    'big5.openness': 0.4,
    'big5.extraversion': 0.5,
    'behavior.risk_taking': 0.3,
  }),
  'first_school_lunch:eat_alone': s('主动保留独处空间，并不把每次社交机会都当作必须抓住。', {
    'big5.extraversion': -0.6,
    'behavior.autonomy': 0.3,
    'behavior.support_seeking': -0.2,
  }),

  'exam_result_comparison:review_errors': s('评价事件后优先拆解可修正的问题。', {
    'big5.conscientiousness': 0.6,
    'coping.problem_focused': 0.7,
    'big5.neuroticism': -0.1,
  }),
  'exam_result_comparison:compare_peers': s('先使用社会参照理解自己的结果。', {
    'big5.extraversion': 0.2,
    'big5.neuroticism': 0.3,
    'behavior.support_seeking': 0.1,
  }),
  'exam_result_comparison:put_away': s('压力上来时先与刺激保持距离。', {
    'coping.avoidance': 0.6,
    'big5.neuroticism': 0.2,
    'coping.problem_focused': -0.3,
  }),

  'post_school_crossroads:university': s('愿意延迟收益并投入结构化学习路线。', {
    'big5.conscientiousness': 0.4,
    'big5.openness': 0.2,
    'behavior.risk_taking': 0.1,
  }),
  'post_school_crossroads:work': s('更早进入现实组织和收入结构，强调自主与即时经验。', {
    'behavior.autonomy': 0.5,
    'behavior.risk_taking': 0.2,
    'big5.conscientiousness': 0.2,
  }),
  'post_school_crossroads:vocational': s('偏好具体技能、可观察进步与直接能力积累。', {
    'big5.conscientiousness': 0.4,
    'coping.problem_focused': 0.4,
    'behavior.risk_taking': 0.1,
  }),
  'post_school_crossroads:pause': s('愿意暂缓主流时间表，为探索或家庭情境留下空间。', {
    'big5.openness': 0.3,
    'behavior.autonomy': 0.4,
    'behavior.risk_taking': 0.4,
    'big5.conscientiousness': -0.1,
  }),

  'first_bad_manager:document_and_talk': s('在组织冲突中先建立证据并尝试直接沟通。', {
    'big5.conscientiousness': 0.6,
    'behavior.autonomy': 0.4,
    'coping.problem_focused': 0.7,
    'big5.agreeableness': 0.1,
  }),
  'first_bad_manager:seek_allies': s('把组织问题放回关系和制度网络中处理。', {
    'behavior.support_seeking': 0.7,
    'big5.extraversion': 0.2,
    'coping.problem_focused': 0.4,
    'big5.agreeableness': 0.2,
  }),
  'first_bad_manager:prepare_exit': s('判断当前环境改变成本过高后，转向退出和替代路线。', {
    'behavior.autonomy': 0.6,
    'behavior.risk_taking': 0.4,
    'coping.avoidance': 0.2,
    'coping.reappraisal': 0.4,
  }),

  'midlife_parent_call:take_more_care': s('面对家庭责任时倾向直接增加自己的投入。', {
    'big5.agreeableness': 0.6,
    'big5.conscientiousness': 0.4,
    'behavior.support_seeking': -0.2,
  }),
  'midlife_parent_call:share_care': s('倾向通过边界和分工协商长期责任。', {
    'big5.agreeableness': 0.4,
    'behavior.autonomy': 0.3,
    'behavior.support_seeking': 0.4,
    'coping.problem_focused': 0.6,
  }),
  'midlife_parent_call:seek_services': s('愿意把制度资源纳入家庭问题解决方案。', {
    'behavior.support_seeking': 0.7,
    'coping.problem_focused': 0.6,
    'big5.openness': 0.2,
  }),

  'retirement_first_monday:old_interest': s('重新打开过去被搁置的兴趣和身份部分。', {
    'big5.openness': 0.5,
    'behavior.autonomy': 0.5,
    'coping.reappraisal': 0.5,
  }),
  'retirement_first_monday:people': s('在角色变化后优先把时间重新投入重要关系。', {
    'big5.extraversion': 0.4,
    'big5.agreeableness': 0.4,
    'behavior.support_seeking': 0.3,
  }),
  'retirement_first_monday:new_role': s('通过新角色重新建立结构、贡献和胜任体验。', {
    'big5.conscientiousness': 0.4,
    'big5.openness': 0.4,
    'behavior.autonomy': 0.3,
    'coping.reappraisal': 0.4,
  }),

  'life_review_old_message:reconnect': s('愿意重新进入旧关系的不确定性，以获得新的现实信息。', {
    'big5.openness': 0.4,
    'big5.extraversion': 0.4,
    'behavior.risk_taking': 0.4,
    'coping.reappraisal': 0.5,
  }),
  'life_review_old_message:reflect': s('通过重新理解旧事件，把遗憾纳入更完整的人生叙事。', {
    'big5.openness': 0.3,
    'coping.reappraisal': 0.7,
    'coping.emotion_focused': 0.3,
  }),
  'life_review_old_message:leave_it': s('接受某些历史不必重新打开，并主动保留边界。', {
    'behavior.autonomy': 0.4,
    'behavior.risk_taking': -0.3,
    'coping.reappraisal': 0.2,
  }),
};

const bandForScore = (score: number): P003PersonalityDimensionResult['band'] =>
  score >= 60 ? 'high' : score <= 40 ? 'low' : 'middle';

const summaryFor = (
  id: P003PersonalityDimensionId,
  band: P003PersonalityDimensionResult['band'],
) => p003PersonalityDimensions[id][band];

export const buildP003PersonalityReport = (
  decisions: P003DecisionRecord[],
): P003PersonalityReport => {
  const dimensions = (Object.keys(p003PersonalityDimensions) as P003PersonalityDimensionId[]).map(
    (id): P003PersonalityDimensionResult => {
      const evidence: P003PersonalityEvidence[] = [];
      for (const decision of decisions) {
        const signal = p003ChoiceSignals[`${decision.eventId}:${decision.choiceId}`];
        const value = signal?.scores[id];
        if (value === undefined) continue;
        evidence.push({
          ...decision,
          signal: value,
          interpretation: signal.interpretation,
        });
      }

      const average =
        evidence.length === 0
          ? 0
          : evidence.reduce((sum, item) => sum + item.signal, 0) / evidence.length;
      // Keep game-derived scores deliberately conservative. Even perfectly
      // consistent choices do not produce extreme 0/100 psychometric claims.
      const score = Math.round(clamp(50 + average * 28, 22, 78));
      const band = bandForScore(score);
      const confidence = Number(clamp(0.2 + evidence.length * 0.13, 0.2, 0.92).toFixed(2));

      return {
        id,
        label: p003PersonalityDimensions[id].label,
        score,
        band,
        confidence,
        evidenceCount: evidence.length,
        evidence,
        summary: summaryFor(id, band),
      };
    },
  );

  const strongestPatterns = [...dimensions]
    .filter((item) => item.evidenceCount >= 2)
    .sort((a, b) => {
      const aDistance = Math.abs(a.score - 50) * a.confidence;
      const bDistance = Math.abs(b.score - 50) * b.confidence;
      return bDistance - aDistance;
    })
    .slice(0, 5);

  return {
    title: '这一生的人格与行为画像',
    subtitle: `基于 ${decisions.length} 个跨人生阶段的决策模式生成`,
    dimensions,
    strongestPatterns,
    caution:
      '这是一份基于游戏选择的行为画像，不是正式人格测验、临床评估或诊断。它更适合用来回看“你在这个世界里反复怎样选择”，而不是定义现实中的你。',
  };
};
