import type { P003DecisionRecord } from './p003Personality';
import type { LifeOriginSnapshot } from './types';

export type P003NarrativeContext = {
  callback?: string;
  contextNote?: string;
};

const choice = (decisions: P003DecisionRecord[], eventId: string) =>
  decisions.find((item) => item.eventId === eventId)?.choiceId;

export const buildP003NarrativeContext = (
  eventId: string,
  decisions: P003DecisionRecord[],
  origin: LifeOriginSnapshot,
): P003NarrativeContext => {
  const schoolGate = choice(decisions, 'first_school_gate');
  const lunch = choice(decisions, 'first_school_lunch');
  const exam = choice(decisions, 'exam_result_comparison');
  const crossroads = choice(decisions, 'post_school_crossroads');
  const manager = choice(decisions, 'first_bad_manager');
  const caregiverWait = choice(decisions, 'caregiver_late_pickup');
  const moving = choice(decisions, 'moving_house_childhood');
  const playground = choice(decisions, 'playground_turn');

  if (eventId === 'first_school_lunch') {
    if (schoolGate === 'look_for_peer') {
      return {
        callback: '开学那天你第一件事就是寻找熟悉的人。几周后，午饭时间又一次把“要不要靠近别人”摆到你面前。',
      };
    }
    if (schoolGate === 'watch_everything') {
      return {
        callback: '开学第一天你选择先观察环境。现在你已经知道食堂最安静的角落，也认得几张脸。',
      };
    }
    if (schoolGate === 'find_seat') {
      return {
        callback: '你很快适应了教室的座位、物品和规则，但午饭没有固定座位，也没有老师替你安排和谁坐。',
      };
    }
  }

  if (eventId === 'exam_result_comparison') {
    if (lunch === 'new_peer') {
      return {
        callback: '很多年前午饭时坐到你旁边的陌生同学，后来真的留在了你的同伴网络里。今天，TA 也在讨论成绩。',
      };
    }
    if (lunch === 'eat_alone') {
      return {
        callback: '你一直保留着独处整理状态的习惯。成绩单发下来的这天，周围的比较声却很难完全隔开。',
      };
    }
    if (lunch === 'familiar_group') {
      return {
        callback: '你和几位熟悉同学一路读到了现在。成绩出来以后，熟人之间的比较既更自然，也更难完全回避。',
      };
    }
  }

  if (eventId === 'post_school_crossroads') {
    const context: string[] = [];
    if (origin.householdMaterialSecurity < 0.4) {
      context.push('家庭能承担的试错成本有限，钱和时间都会进入这次选择。');
    } else if (origin.householdMaterialSecurity > 0.7) {
      context.push('家庭目前有一定缓冲，让你拥有比“立刻赚钱”更多的选择空间。');
    }

    if (origin.learningAccess > 0.68) {
      context.push('这些年你接触过较多教育信息和学习资源，路线之间的差异对你并不陌生。');
    } else if (origin.learningAccess < 0.4) {
      context.push('很多路线的信息并不会自动来到你面前，你需要比别人更主动去弄清楚它们。');
    }

    if (exam === 'review_errors') {
      context.push('你习惯在结果之后先看“下一步能改什么”，这次也很难只把选择交给一句“大家都这么走”。');
    } else if (exam === 'put_away') {
      context.push('面对重大评价时，你曾经选择先把压力放远一点；但毕业这道题不会永远留在抽屉里。');
    }

    return { contextNote: context.join(' ') };
  }

  if (eventId === 'first_bad_manager') {
    const pathText: Record<string, string> = {
      university: '你走过高等教育路线后进入了现在的组织。',
      work: '你很早就进入工作世界，已经见过不止一种“职场规则”。',
      vocational: '你靠一项具体技能进入行业，工作中的专业判断对你很重要。',
      pause: '你并没有按身边人的标准时间表进入工作，但最终还是来到了一个真实组织里。',
    };

    return {
      callback: crossroads ? pathText[crossroads] : undefined,
      contextNote:
        exam === 'review_errors'
          ? '过去遇到结果不理想时，你常先找具体原因；但这一次，问题可能不只在任务本身，也在组织关系。'
          : undefined,
    };
  }

  if (eventId === 'midlife_parent_call') {
    const memories: string[] = [];
    if (caregiverWait === 'watch_door') {
      memories.push('你忽然想起五岁那年自己盯着门口等人来接的傍晚。');
    } else if (caregiverWait === 'ask_teacher') {
      memories.push('你还记得五岁那年等待照护者时，一遍遍向老师确认“什么时候来”。');
    } else if (caregiverWait === 'keep_playing') {
      memories.push('你曾在五岁那次漫长等待里，用继续玩耍让时间先过去。');
    }

    if (moving === 'say_goodbye') {
      memories.push('童年搬家时，你曾认真和熟悉的人道别；关系的变化对你从来不只是物流问题。');
    }

    return {
      callback: memories.join(' '),
      contextNote:
        manager === 'seek_allies'
          ? '工作时期你学会过把问题放回系统和资源网络里处理，但家庭责任往往更难划清边界。'
          : manager === 'document_and_talk'
            ? '你过去习惯通过明确沟通和分工处理复杂问题，这次对象换成了家人。'
            : manager === 'prepare_exit'
              ? '你曾经在无法改变的工作环境里选择退出；但面对家人衰老，“换一个环境”不再是同一种答案。'
              : undefined,
    };
  }

  if (eventId === 'retirement_first_monday') {
    const pathLabels: Record<string, string> = {
      university: '十八岁时你选择继续升学',
      work: '十八岁时你选择先进入工作',
      vocational: '十八岁时你选择学习一门具体技能',
      pause: '十八岁时你选择先停下来',
    };

    return {
      callback: crossroads
        ? `${pathLabels[crossroads]}。几十年过去，那个决定曾经决定你的时间怎样被工作、学习和关系切分；现在，一整块时间重新回到你手上。`
        : undefined,
      contextNote:
        playground === 'choose_slide'
          ? '很早以前，当一个目标需要争抢时，你曾经转身去玩别的。退休后的“换目标”却是一件更大的事。'
          : undefined,
    };
  }

  if (eventId === 'life_review_old_message') {
    const callbacks: string[] = [];

    if (lunch === 'new_peer') {
      callbacks.push('八岁那顿午饭，你曾经坐到一个陌生同学旁边。后来很多关系都是从这种很小的靠近开始的。');
    } else if (lunch === 'eat_alone') {
      callbacks.push('八岁那顿午饭，你曾经主动选择自己坐。几十年后，你仍然记得独处并不总等于孤单。');
    }

    if (moving === 'say_goodbye') {
      callbacks.push('五岁搬家时，你曾经认真去道别。不是每一次离开都能这样完整结束。');
    }

    if (crossroads === 'pause') {
      callbacks.push('十八岁时，你曾经允许自己不按标准时间表往前走。');
    }

    return {
      callback: callbacks.join(' '),
      contextNote:
        decisions.length > 10
          ? '这一次，问题不再是“哪个选择会让我未来更好”，而是“我愿意怎样理解已经发生过的一生”。'
          : undefined,
    };
  }

  return {};
};
