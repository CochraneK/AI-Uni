import type { LifeEventCategory, LifeSeasonId } from './types';

export type P003EffectMap = Partial<{
  stress: number;
  energy: number;
  support: number;
  autonomy: number;
  competence: number;
  relatedness: number;
  materialSecurity: number;
  learningOpportunity: number;
}>;

export type P003EventChoice = {
  id: string;
  label: string;
  summary: string;
  immediate: P003EffectMap;
  historyFlags?: string[];
  relationshipEffects?: Array<{
    targetRole: string;
    trust?: number;
    closeness?: number;
    reliability?: number;
    conflictRepair?: number;
  }>;
};

export type P003LifeEventDefinition = {
  id: string;
  title: string;
  category: LifeEventCategory;
  seasons: LifeSeasonId[];
  ageRange: [number, number];
  setup: string;
  visibleQuestion: string;
  choices: P003EventChoice[];
  delayedHooks?: string[];
  designNote: string;
};

export const p003StarterEvents: P003LifeEventDefinition[] = [
  {
    id: 'toddler_forbidden_drawer',
    title: '那个不能打开的抽屉',
    category: 'caregiving',
    seasons: ['early_childhood'],
    ageRange: [2, 4],
    setup: '你对一个总被大人关上的抽屉越来越好奇。今天照护者正忙着做别的事。',
    visibleQuestion: '你会怎么做？',
    choices: [
      {
        id: 'open_it',
        label: '偷偷打开看看',
        summary: '满足好奇，但也可能碰到边界和后果。',
        immediate: { autonomy: 0.08, stress: 0.03 },
        historyFlags: ['tests_household_boundary'],
      },
      {
        id: 'ask_first',
        label: '跑去问为什么不能开',
        summary: '把好奇变成一次协商。',
        immediate: { autonomy: 0.05, relatedness: 0.04 },
        historyFlags: ['asks_about_boundary'],
      },
      {
        id: 'move_on',
        label: '先去玩别的',
        summary: '没有哪一种选择天然更“成熟”；它只留下不同经历。',
        immediate: { energy: 0.02 },
      },
    ],
    delayedHooks: ['caregiver_boundary_response', 'future_curiosity_pattern'],
    designNote: '同一选择的后果由照护者风格与家庭环境共同决定，不直接给人格加分。',
  },
  {
    id: 'first_school_lunch',
    title: '午饭时旁边还有一个空位',
    category: 'school',
    seasons: ['school_age'],
    ageRange: [6, 9],
    setup: '开学不久，你端着饭，看到熟悉同学那桌很挤，另一边坐着一个还不认识的人。',
    visibleQuestion: '今天坐哪里？',
    choices: [
      {
        id: 'familiar_group',
        label: '挤到熟人那边',
        summary: '维持已有连接。',
        immediate: { relatedness: 0.05 },
      },
      {
        id: 'new_peer',
        label: '去空位，和陌生同学坐',
        summary: '可能形成新的关系，也可能只是吃完一顿饭。',
        immediate: { autonomy: 0.03, stress: 0.02 },
        historyFlags: ['cross_group_contact'],
      },
      {
        id: 'eat_alone',
        label: '找个安静位置自己吃',
        summary: '独处可能是舒服、恢复精力，也可能只是今天不想说话。',
        immediate: { energy: 0.04, relatedness: -0.01 },
      },
    ],
    delayedHooks: ['peer_network_branch', 'school_belonging_episode'],
    designNote: '避免把主动社交或独处简单解释为外向/内向优劣。',
  },
  {
    id: 'exam_result_comparison',
    title: '成绩单发下来了',
    category: 'exam',
    seasons: ['school_age', 'adolescence'],
    ageRange: [10, 17],
    setup: '你的成绩和预想不完全一样，同学开始互相问分数，家里也会看到结果。',
    visibleQuestion: '你先处理哪件事？',
    choices: [
      {
        id: 'review_errors',
        label: '先看错在哪里',
        summary: '把注意力放在可处理的问题上。',
        immediate: { competence: 0.05, stress: -0.03, energy: -0.02 },
        historyFlags: ['problem_focused_school'],
      },
      {
        id: 'compare_peers',
        label: '先问别人考了多少',
        summary: '获得社会参照，但情绪后果取决于关系与期待。',
        immediate: { stress: 0.03, relatedness: 0.01 },
      },
      {
        id: 'put_away',
        label: '先收起来，晚点再说',
        summary: '短期降低刺激，但事情仍会回来。',
        immediate: { stress: -0.02 },
      },
    ],
    delayedHooks: ['family_achievement_response', 'study_strategy_update'],
    designNote: '结果受学校资源、家庭期待、能力经验和偶然波动共同影响。',
  },
  {
    id: 'post_school_crossroads',
    title: '毕业以后先去哪',
    category: 'education',
    seasons: ['emerging_adulthood'],
    ageRange: [17, 20],
    setup: '身边的人开始把“下一步”说得像一道只有一个正确答案的题，但你看到的不止一条路。',
    visibleQuestion: '你准备先投入哪条路线？',
    choices: [
      {
        id: 'university',
        label: '申请大学或继续升学',
        summary: '打开校园、专业、同伴和教育资源路线，也带来时间与成本。',
        immediate: { learningOpportunity: 0.12, materialSecurity: -0.04 },
        historyFlags: ['path_higher_education'],
      },
      {
        id: 'work',
        label: '先进入工作',
        summary: '更早接触收入、组织和职业关系。',
        immediate: { materialSecurity: 0.06, autonomy: 0.06 },
        historyFlags: ['path_direct_work'],
      },
      {
        id: 'vocational',
        label: '学一门更具体的技能',
        summary: '走职业教育、培训或学徒路线。',
        immediate: { competence: 0.07, learningOpportunity: 0.06 },
        historyFlags: ['path_vocational'],
      },
      {
        id: 'pause',
        label: '先停一下，探索或处理家庭事务',
        summary: '这不自动是“落后”；时间的代价和收益由资源与情境决定。',
        immediate: { autonomy: 0.04, materialSecurity: -0.02 },
        historyFlags: ['path_pause_or_care'],
      },
    ],
    delayedHooks: ['education_work_branch', 'network_opportunity_branch', 'family_expectation_response'],
    designNote: '大学不是默认主线；不同路线都有独立机会结构和代价。',
  },
  {
    id: 'first_bad_manager',
    title: '第一次遇到很难合作的上司',
    category: 'career',
    seasons: ['early_adulthood'],
    ageRange: [22, 34],
    setup: '对方最近反复临时改要求，又在公开场合把责任推给团队。你需要决定下一步怎么处理。',
    visibleQuestion: '你会先做什么？',
    choices: [
      {
        id: 'document_and_talk',
        label: '留记录，再约一次正式沟通',
        summary: '尝试改变具体工作关系。',
        immediate: { stress: 0.02, autonomy: 0.04, competence: 0.03 },
        historyFlags: ['work_boundary_attempt'],
      },
      {
        id: 'seek_allies',
        label: '先找可信同事或制度资源了解情况',
        summary: '把问题放回组织环境，而不是全归因于自己。',
        immediate: { support: 0.05, stress: -0.02 },
        historyFlags: ['institutional_support_use'],
      },
      {
        id: 'prepare_exit',
        label: '开始悄悄找下一份机会',
        summary: '减少改变当前关系的投入，转向退出策略。',
        immediate: { autonomy: 0.05, energy: -0.04 },
        historyFlags: ['career_exit_preparation'],
      },
    ],
    delayedHooks: ['manager_response', 'job_market_opportunity', 'career_transition'],
    designNote: '组织条件是独立因果层，不把糟糕工作环境解释成玩家人格问题。',
  },
  {
    id: 'midlife_parent_call',
    title: '那通开始变频繁的电话',
    category: 'family',
    seasons: ['middle_adulthood'],
    ageRange: [40, 60],
    setup: '家里长辈最近需要越来越多帮助，而你的工作、伴侣、孩子或个人生活也都占着时间。',
    visibleQuestion: '这次你怎么安排？',
    choices: [
      {
        id: 'take_more_care',
        label: '自己多承担一些',
        summary: '增加照护投入，也会挤压其他资源。',
        immediate: { relatedness: 0.05, energy: -0.08, stress: 0.05 },
        historyFlags: ['caregiving_load_increase'],
      },
      {
        id: 'share_care',
        label: '和家人重新分工',
        summary: '尝试把照护从个人义务变成系统协商。',
        immediate: { autonomy: 0.03, stress: 0.01 },
        historyFlags: ['family_care_negotiation'],
      },
      {
        id: 'seek_services',
        label: '看看社区或专业服务能不能接一部分',
        summary: '调用制度资源，但是否可得取决于环境。',
        immediate: { support: 0.05, materialSecurity: -0.03 },
        historyFlags: ['formal_care_resource_use'],
      },
    ],
    delayedHooks: ['caregiver_burden', 'family_role_revision', 'work_family_spillover'],
    designNote: '照护选择受钱、时间、制度和关系历史共同约束。',
  },
  {
    id: 'retirement_first_monday',
    title: '不用上班的第一个星期一',
    category: 'retirement',
    seasons: ['retirement'],
    ageRange: [60, 78],
    setup: '闹钟没有必须响的理由。过去几十年的时间结构突然空出了一大块。',
    visibleQuestion: '你最先想把时间放在哪里？',
    choices: [
      {
        id: 'old_interest',
        label: '捡回一个很久没做的兴趣',
        summary: '重新连接曾被工作挤掉的自我部分。',
        immediate: { energy: 0.04, competence: 0.03, autonomy: 0.06 },
        historyFlags: ['reopened_old_interest'],
      },
      {
        id: 'people',
        label: '约重要的人见面',
        summary: '把时间投入关系。',
        immediate: { relatedness: 0.07, support: 0.03 },
      },
      {
        id: 'new_role',
        label: '找个新的长期角色',
        summary: '社区、兼职、照护、指导或创作都可能成为新结构。',
        immediate: { competence: 0.04, autonomy: 0.03 },
        historyFlags: ['retirement_role_reconstruction'],
      },
    ],
    delayedHooks: ['later_life_network_change', 'meaning_reconstruction'],
    designNote: '退休不是数值下降阶段，而是时间、角色和关系结构的重组。',
  },
  {
    id: 'life_review_old_message',
    title: '很久以前的一条消息',
    category: 'relationship',
    seasons: ['life_review'],
    ageRange: [72, 100],
    setup: '整理旧东西时，你看到一段几十年前没有继续下去的关系记录。那时你做过一个决定，后来人生就走向了别处。',
    visibleQuestion: '现在你想怎么面对它？',
    choices: [
      {
        id: 'reconnect',
        label: '如果还能联系，就发一条消息',
        summary: '不是为了改写过去，而是允许历史重新进入现在。',
        immediate: { stress: 0.02, relatedness: 0.04 },
        historyFlags: ['late_life_reconnection_attempt'],
      },
      {
        id: 'reflect',
        label: '不联系，只认真回想那段经历',
        summary: '把未完成的故事重新放进自己的人生叙事。',
        immediate: { stress: -0.02 },
        historyFlags: ['life_review_reflection'],
      },
      {
        id: 'leave_it',
        label: '把东西收好，继续整理',
        summary: '并非所有遗憾都需要“解决”。',
        immediate: { autonomy: 0.03 },
      },
    ],
    delayedHooks: ['life_review_callback', 'regret_integration'],
    designNote: '终章不计算人生总分，而是回调真实发生过的历史。',
  },
  {
    id: 'first_favorite_object',
    title: '你总想抓住的那样东西',
    category: 'milestone',
    seasons: ['origin'],
    ageRange: [0, 1],
    setup: '你还不会解释“喜欢”，但某个颜色、声音或触感总能让你安静下来。',
    visibleQuestion: '今天，你的注意力停在哪里？',
    choices: [
      {
        id: 'soft_object',
        label: '一块柔软的布',
        summary: '熟悉的触感慢慢成了安全感的一部分。',
        immediate: { stress: -0.03, relatedness: 0.02 },
        historyFlags: ['early_comfort_object'],
      },
      {
        id: 'window_light',
        label: '窗边变化的光',
        summary: '你一次次追着光线看，世界开始有了细节。',
        immediate: { learningOpportunity: 0.03, energy: -0.01 },
        historyFlags: ['early_visual_curiosity'],
      },
      {
        id: 'caregiver_voice',
        label: '照护者的声音',
        summary: '熟悉的声音让周围重新变得可预测。',
        immediate: { relatedness: 0.04, stress: -0.02 },
        historyFlags: ['early_voice_soothing'],
      },
    ],
    delayedHooks: ['comfort_memory_callback'],
    designNote: '婴儿期不呈现人格化选项；重点是环境回应和早期经验如何进入历史。',
  },
  {
    id: 'first_public_meltdown',
    title: '商店地板上的五分钟',
    category: 'caregiving',
    seasons: ['early_childhood'],
    ageRange: [2, 4],
    setup: '你很想要一件东西，但大人说今天不买。你已经又累又饿，情绪一下子冲上来了。',
    visibleQuestion: '这一刻更像什么？',
    choices: [
      {
        id: 'cry_loudly',
        label: '直接哭出来',
        summary: '情绪先冲出去，之后发生什么取决于大人的回应。',
        immediate: { stress: 0.03, energy: -0.05 },
        historyFlags: ['strong_public_expression'],
      },
      {
        id: 'keep_asking',
        label: '一直追问“为什么”',
        summary: '你试图把限制变成可以讨论的东西。',
        immediate: { autonomy: 0.04, stress: 0.02 },
        historyFlags: ['boundary_negotiation_attempt'],
      },
      {
        id: 'hold_it_in',
        label: '忍住，不再说了',
        summary: '冲突短暂停下，但感受并不一定就消失。',
        immediate: { stress: 0.01, energy: -0.02 },
        historyFlags: ['early_expression_inhibition'],
      },
    ],
    delayedHooks: ['caregiver_emotion_response', 'future_conflict_script'],
    designNote: '没有“正确情绪反应”；关键在后续照护、修复和重复模式。',
  },
  {
    id: 'playground_turn',
    title: '秋千只有一个空位',
    category: 'play',
    seasons: ['early_childhood'],
    ageRange: [3, 5],
    setup: '你刚跑到秋千旁，另一个孩子也同时伸手抓住了链子。',
    visibleQuestion: '你怎么处理这个“都是我先看到”的时刻？',
    choices: [
      {
        id: 'take_it',
        label: '先坐上去再说',
        summary: '你把自己的需要放在最前面。',
        immediate: { autonomy: 0.04, relatedness: -0.02 },
        historyFlags: ['playground_assertion'],
      },
      {
        id: 'propose_turns',
        label: '说“一人五下”',
        summary: '你尝试发明一个双方都能接受的规则。',
        immediate: { competence: 0.04, relatedness: 0.03 },
        historyFlags: ['peer_rule_negotiation'],
      },
      {
        id: 'choose_slide',
        label: '算了，去玩滑梯',
        summary: '你换了目标；这可能是灵活，也可能只是今天不想争。',
        immediate: { stress: -0.02, autonomy: 0.02 },
        historyFlags: ['goal_switch_in_play'],
      },
    ],
    delayedHooks: ['early_peer_reputation', 'same_peer_return'],
    designNote: '同伴关系从重复互动中形成，而不是一次选择决定“社交能力”。',
  },
  {
    id: 'caregiver_late_pickup',
    title: '天快黑了，熟悉的人还没来',
    category: 'caregiving',
    seasons: ['early_childhood'],
    ageRange: [4, 6],
    setup: '其他孩子陆续被接走，你在门口等着。老师说照护者可能只是堵在路上。',
    visibleQuestion: '等待的时候，你会做什么？',
    choices: [
      {
        id: 'ask_teacher',
        label: '反复问老师“什么时候来”',
        summary: '你通过成年人获得确认。',
        immediate: { relatedness: 0.02, stress: 0.01 },
        historyFlags: ['reassurance_request'],
      },
      {
        id: 'keep_playing',
        label: '继续玩手边的玩具',
        summary: '你暂时把注意力放到还能控制的事情上。',
        immediate: { stress: -0.01, energy: -0.01 },
        historyFlags: ['waiting_distraction'],
      },
      {
        id: 'watch_door',
        label: '一直盯着门口',
        summary: '你把大部分注意力留在“什么时候出现”这件事上。',
        immediate: { stress: 0.03 },
        historyFlags: ['waiting_vigilance'],
      },
    ],
    delayedHooks: ['caregiver_arrival_explanation', 'reliability_history_update'],
    designNote: '一次晚接不能定义依恋；只有关系中特定模式的长期历史才会缓慢更新信任。',
  },
  {
    id: 'moving_house_childhood',
    title: '纸箱把房间一点点装走',
    category: 'relocation',
    seasons: ['early_childhood'],
    ageRange: [4, 6],
    setup: '家里准备搬去另一个地方。熟悉的路线、楼下的人和你认识的小店都可能消失。',
    visibleQuestion: '你最在意先留下什么？',
    choices: [
      {
        id: 'take_objects',
        label: '把最喜欢的东西先装进自己的小包',
        summary: '你先保存可以带走的熟悉感。',
        immediate: { autonomy: 0.03, stress: -0.01 },
        historyFlags: ['relocation_keeps_objects'],
      },
      {
        id: 'say_goodbye',
        label: '去和熟悉的人道别',
        summary: '你把离开变成一个关系事件。',
        immediate: { relatedness: 0.04, stress: 0.02 },
        historyFlags: ['relocation_goodbye'],
      },
      {
        id: 'ask_new_place',
        label: '一直问新家会是什么样',
        summary: '你用信息把未知变得更具体。',
        immediate: { learningOpportunity: 0.02, stress: -0.01 },
        historyFlags: ['relocation_information_seeking'],
      },
    ],
    delayedHooks: ['new_neighborhood_opportunity', 'old_tie_callback'],
    designNote: '迁居既可能带来损失，也可能带来机会；结果取决于新旧环境与关系是否延续。',
  },
  {
    id: 'first_school_gate',
    title: '校门第一次在你身后关上',
    category: 'school',
    seasons: ['school_age'],
    ageRange: [6, 7],
    setup: '新的教室、新的规则、新的同学。熟悉的大人不会一直在你旁边。',
    visibleQuestion: '进教室前，你最想先做哪件事？',
    choices: [
      {
        id: 'find_seat',
        label: '先找到自己的座位和东西放哪',
        summary: '把陌生环境变成一个可以掌握的空间。',
        immediate: { competence: 0.04, stress: -0.02 },
        historyFlags: ['school_orientation'],
      },
      {
        id: 'look_for_peer',
        label: '看看有没有认识的人',
        summary: '你先寻找关系上的锚点。',
        immediate: { relatedness: 0.04 },
        historyFlags: ['school_peer_anchor'],
      },
      {
        id: 'watch_everything',
        label: '先站一会儿，把周围看清楚',
        summary: '你选择先观察再加入。',
        immediate: { learningOpportunity: 0.02, stress: 0.01 },
        historyFlags: ['school_observe_first'],
      },
    ],
    delayedHooks: ['first_teacher_relationship', 'first_school_friendship'],
    designNote: '正式进入儿童期，并把家庭世界扩展成家庭 × 学校 × 同伴的生态网络。',
  }
];

export const p003EventDesignBoundary =
  'Choices create history, trade-offs and changing probabilities. They are not covert clinical items and must not be scored as diagnoses.';
