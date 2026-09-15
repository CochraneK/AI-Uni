import { useEffect, useMemo, useState } from 'react';
import { campusActivities } from '../../convex/life/activities';
import { universityFirstWeek } from '../../convex/life/firstWeek';
import { npcProfiles } from '../../data/npcProfiles';

type LocationId =
  | 'campus_gate'
  | 'teaching_building'
  | 'library'
  | 'student_center'
  | 'cafeteria'
  | 'campus_green'
  | 'sports_field'
  | 'dormitory';

type DemoState = {
  day: number;
  minute: number;
  locationId: LocationId;
  completedActivities: string[];
  completedEvents: string[];
  interactedNpcs: string[];
  ordinaryLifeDone: boolean;
  log: string[];
  finished: boolean;
};

const STORAGE_KEY = 'ai-uni-browser-demo-v1';
const DAY_START = 8 * 60;
const DAY_END = 23 * 60;

const locations: { id: LocationId; name: string; icon: string; blurb: string }[] = [
  { id: 'campus_gate', name: '校园入口', icon: '🚪', blurb: '报到、公告、出入校园' },
  { id: 'teaching_building', name: '教学楼', icon: '🏫', blurb: '课程、展示、找教室' },
  { id: 'library', name: '图书馆', icon: '📚', blurb: '自习、小组任务、安静空间' },
  { id: 'student_center', name: '活动中心', icon: '🎪', blurb: '社团、讲座、学生组织' },
  { id: 'cafeteria', name: '食堂', icon: '🍜', blurb: '吃饭、偶遇、日常闲聊' },
  { id: 'campus_green', name: '校园公共空间', icon: '🌳', blurb: '散步、休息、碰见熟人' },
  { id: 'sports_field', name: '运动场', icon: '🏃', blurb: '跑步、看球、活动' },
  { id: 'dormitory', name: '住处', icon: '🛏️', blurb: '休息、整理、室友生活' },
];

const eventScripts = [
  {
    id: 'arrival',
    day: 1,
    locationId: 'campus_gate' as LocationId,
    npc: '陈曦',
    title: '新生报到',
    description: '你刚到校园，陈曦在入口处帮忙确认报到流程。',
    choices: ['先把手续办完', '先问问校园怎么走'],
    outcome: '你完成了报到，也第一次把这个地方和“接下来几年”联系起来。',
    minutes: 40,
  },
  {
    id: 'first_class',
    day: 2,
    locationId: 'teaching_building' as LocationId,
    npc: '何老师',
    title: '第一次正式上课',
    description: '教室有些陌生，何老师正在说明课程安排和第一次作业。',
    choices: ['坐前面认真听', '找同学旁边坐下'],
    outcome: '第一节正式课结束，你开始知道这里的学习节奏是什么样。',
    minutes: 60,
  },
  {
    id: 'group_work',
    day: 3,
    locationId: 'library' as LocationId,
    npc: '高远',
    title: '第一次小组分工',
    description: '高远很快给出了一套分工方案，但几乎没问其他人的意见。',
    choices: ['直接提出自己的想法', '先听完再补充'],
    outcome: '分工暂时定下来了。你也第一次感到，同学之间的合作不会总是顺滑。',
    minutes: 45,
  },
  {
    id: 'club_day',
    day: 4,
    locationId: 'student_center' as LocationId,
    npc: '许一鸣',
    title: '社团说明会',
    description: '许一鸣正在介绍社团活动。你可以加入，也可以只是看看。',
    choices: ['报名试试看', '先留个联系方式'],
    outcome: '你对课堂之外的大学生活多了一点具体想象。',
    minutes: 35,
  },
  {
    id: 'friction',
    day: 5,
    locationId: 'cafeteria' as LocationId,
    npc: '林然',
    title: '第一次明显摩擦',
    description: '一件原本说好的小事临时变了，林然也觉得有些尴尬。',
    choices: ['把不舒服说清楚', '先解决眼前的问题'],
    outcome: '事情没有完美解决，但关系开始有了真正的边界和差异。',
    minutes: 30,
  },
  {
    id: 'weekend',
    day: 6,
    locationId: 'campus_green' as LocationId,
    npc: '周野',
    title: '周末怎么过',
    description: '周野问你要不要一起出去，也有人打算留在校园。',
    choices: ['一起出去转转', '留在校园自由安排'],
    outcome: '周末让这段生活第一次不像“新生流程”，而像真正属于自己的时间。',
    minutes: 60,
  },
  {
    id: 'week_review',
    day: 7,
    locationId: 'dormitory' as LocationId,
    npc: '唐悦',
    title: '第一周收尾',
    description: '唐悦问起你这一周过得怎么样，也聊到了下周的小组安排。',
    choices: ['聊聊印象最深的人和事', '先把下周安排理一遍'],
    outcome: '第一周结束了。关系、习惯和选择会被带进下一章，而不是被结算成一个人格分数。',
    minutes: 30,
  },
];

const initialState: DemoState = {
  day: 1,
  minute: DAY_START,
  locationId: 'campus_gate',
  completedActivities: [],
  completedEvents: [],
  interactedNpcs: [],
  ordinaryLifeDone: false,
  log: ['Day 1 · 08:00 你来到一所没有特定校名的大学。'],
  finished: false,
};

function loadInitialState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

function formatMinute(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function locationName(id: string) {
  return locations.find((location) => location.id === id)?.name ?? id;
}

export default function DemoApp() {
  const [state, setState] = useState<DemoState>(loadInitialState);
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentDay = universityFirstWeek[Math.min(state.day, 7) - 1];
  const currentEvent = eventScripts.find((event) => event.day === state.day);
  const activitiesHere = useMemo(
    () => campusActivities.filter((activity) => activity.locationId === state.locationId),
    [state.locationId],
  );
  const coreEvents = state.completedEvents.length;
  const npcCount = new Set(state.interactedNpcs).size;
  const canFinishWeek = state.day === 7 && coreEvents >= 3 && npcCount >= 4 && state.ordinaryLifeDone;

  const appendLog = (entry: string) =>
    setState((prev) => ({ ...prev, log: [entry, ...prev.log].slice(0, 16) }));

  const travelTo = (locationId: LocationId) => {
    if (locationId === state.locationId) return;
    const minutes = 10;
    setState((prev) => ({
      ...prev,
      locationId,
      minute: Math.min(DAY_END, prev.minute + minutes),
      log: [`${formatMinute(Math.min(DAY_END, prev.minute + minutes))} 走到${locationName(locationId)}（约 ${minutes} 分钟）`, ...prev.log].slice(0, 16),
    }));
  };

  const doActivity = (activity: (typeof campusActivities)[number]) => {
    if (state.completedActivities.includes(`${state.day}:${activity.id}`)) {
      setMessage('这个活动今天已经做过了。');
      return;
    }
    if (state.minute + activity.estimatedMinutes > DAY_END) {
      setMessage('今天剩余时间不够完成这个活动。');
      return;
    }
    const key = `${state.day}:${activity.id}`;
    setState((prev) => ({
      ...prev,
      minute: prev.minute + activity.estimatedMinutes,
      ordinaryLifeDone: true,
      completedActivities: [...prev.completedActivities, key],
      log: [`${formatMinute(prev.minute + activity.estimatedMinutes)} ${activity.completionText}`, ...prev.log].slice(0, 16),
    }));
    setMessage(activity.completionText);
  };

  const completeEvent = (choice: string) => {
    if (!currentEvent || state.completedEvents.includes(currentEvent.id)) return;
    if (state.locationId !== currentEvent.locationId) {
      setMessage(`先去${locationName(currentEvent.locationId)}。`);
      return;
    }
    if (state.minute + currentEvent.minutes > DAY_END) {
      setMessage('今天剩余时间不够处理这个事件。');
      return;
    }
    setState((prev) => ({
      ...prev,
      minute: prev.minute + currentEvent.minutes,
      completedEvents: [...prev.completedEvents, currentEvent.id],
      interactedNpcs: Array.from(new Set([...prev.interactedNpcs, currentEvent.npc])),
      log: [
        `${formatMinute(prev.minute + currentEvent.minutes)} ${currentEvent.title}：${choice}。${currentEvent.outcome}`,
        ...prev.log,
      ].slice(0, 16),
    }));
    setMessage(currentEvent.outcome);
  };

  const chatWithNpc = (name: string) => {
    if (state.minute + 10 > DAY_END) return;
    const replies: Record<string, string> = {
      林然: '“我也还在适应。要不等会儿一起吃饭？顺便聊聊课程。”',
      高远: '“小组的事我想先推进起来，你要是有不同意见直接说就行。”',
      何老师: '“第一周不用急着把所有东西弄明白，先把课程节奏找到。”',
      周野: '“我晚点可能去运动，你要是想一起就叫我。”',
      唐悦: '“图书馆这边挺安静的。小组信息最好再确认一下，别只看一条消息。”',
      陈曦: '“课程通知我会转到群里，有变化我会标清楚哪些已经确认。”',
      许一鸣: '“活动很多，不用都参加。挑一个你真觉得有意思的就行。”',
      苏晴: '“我先看看大家怎么想。如果有什么明显不合理的，我会说。”',
    };
    const reply = replies[name] ?? '“刚开学，大家都还在慢慢熟悉。”';
    setState((prev) => ({
      ...prev,
      minute: prev.minute + 10,
      interactedNpcs: Array.from(new Set([...prev.interactedNpcs, name])),
      log: [`${formatMinute(prev.minute + 10)} 你和${name}聊了几句。${reply}`, ...prev.log].slice(0, 16),
    }));
    setMessage(reply);
  };

  const endDay = () => {
    if (state.day < 7) {
      const nextDay = state.day + 1;
      setState((prev) => ({
        ...prev,
        day: nextDay,
        minute: DAY_START,
        locationId: nextDay === 2 ? 'dormitory' : prev.locationId,
        log: [`Day ${nextDay} · 08:00 ${universityFirstWeek[nextDay - 1].title}`, ...prev.log].slice(0, 16),
      }));
      setMessage(universityFirstWeek[nextDay - 1].closingBeat);
      return;
    }
    if (!canFinishWeek) {
      setMessage('第一周还不能结束：至少完成 3 个主线事件、与 4 位不同 NPC 真正互动，并做过至少一次普通生活活动。');
      return;
    }
    setState((prev) => ({ ...prev, finished: true }));
    setMessage('大学第一周完成。下一章将进入大一阶段。');
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setMessage('试玩存档已重置。');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-body px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">浏览器试玩 Demo · 无需下载</div>
            <h1 className="mt-2 text-5xl font-bold tracking-tight md:text-7xl">AI-Uni</h1>
            <p className="mt-2 max-w-3xl text-slate-300">广泛意义上的大学生活 × 人生历程。当前网页 Demo 使用脚本化 NPC；完整 LLM 多智能体版将在 Convex 云端后端接入后启用。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button onClick={reset} className="rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">重置试玩</button>
            <a href="https://github.com/CochraneK/ai-uni" className="rounded-lg bg-slate-100 px-3 py-2 text-slate-950">GitHub</a>
          </div>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="章节" value={`第一周 · Day ${state.day}/7`} />
          <Stat label="时间" value={formatMinute(state.minute)} />
          <Stat label="主线事件" value={`${coreEvents} / 3+`} />
          <Stat label="不同 NPC" value={`${npcCount} / 4+`} />
          <Stat label="普通生活" value={state.ordinaryLifeDone ? '已体验' : '未完成'} />
        </section>

        {state.finished && (
          <section className="mb-5 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5">
            <h2 className="text-2xl font-bold text-emerald-200">大学第一周结束</h2>
            <p className="mt-2 text-emerald-50">你已经完成网页 Alpha 的第一章。后续正式版会把这些关系、日程和选择带入大一、考试、假期、实习、毕业、工作与更长的人生阶段。</p>
          </section>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Day {state.day}</p>
                <h2 className="text-2xl font-bold">{currentDay.title}</h2>
                <p className="mt-1 text-sm text-slate-300">{currentDay.ordinaryGoals.join(' · ')}</p>
              </div>
              <button onClick={endDay} className="shrink-0 rounded-xl bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400">{state.day === 7 ? '结束第一周' : '结束今天'}</button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {locations.map((location) => {
                const active = state.locationId === location.id;
                return (
                  <button key={location.id} onClick={() => travelTo(location.id)} className={`min-h-28 rounded-xl border p-3 text-left transition ${active ? 'border-indigo-400 bg-indigo-400/15 ring-1 ring-indigo-300/40' : 'border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-800'}`}>
                    <div className="text-3xl">{location.icon}</div>
                    <div className="mt-2 font-bold">{location.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{location.blurb}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
              <div className="text-sm text-slate-400">今日主线</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold">{currentEvent?.title}</h3>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs">{currentEvent ? locationName(currentEvent.locationId) : ''}</span>
                {currentEvent && state.completedEvents.includes(currentEvent.id) && <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">已完成</span>}
              </div>
              <p className="mt-2 text-slate-300">{currentEvent?.description}</p>
              {currentEvent && !state.completedEvents.includes(currentEvent.id) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentEvent.choices.map((choice) => <button key={choice} onClick={() => completeEvent(choice)} className="rounded-lg bg-indigo-500/20 px-3 py-2 text-sm text-indigo-100 hover:bg-indigo-500/35">{choice}</button>)}
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold">当前位置可做的普通活动</h3>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {activitiesHere.map((activity) => {
                  const done = state.completedActivities.includes(`${state.day}:${activity.id}`);
                  return <button key={activity.id} disabled={done} onClick={() => doActivity(activity)} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-left disabled:opacity-40 hover:not-disabled:border-slate-500">
                    <div className="flex justify-between gap-3"><span className="font-semibold">{activity.title}</span><span className="text-xs text-slate-400">{activity.estimatedMinutes} 分钟</span></div>
                    <p className="mt-1 text-xs text-slate-400">{activity.description}</p>
                  </button>;
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-xl font-bold">校园里的人</h2>
              <p className="mt-1 text-xs text-slate-400">Demo 采用脚本回复，每次聊天消耗约 10 分钟。</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {npcProfiles.map((npc) => (
                  <button key={npc.name} onClick={() => chatWithNpc(npc.name)} className={`rounded-xl border p-3 text-left ${state.interactedNpcs.includes(npc.name) ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'}`}>
                    <div className="font-bold">{npc.name}</div>
                    <div className="mt-1 truncate text-xs text-slate-400">{npc.roleTags.slice(0, 2).join(' · ')}</div>
                  </button>
                ))}
              </div>
            </section>

            {message && <section className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-4 text-sm text-indigo-50">{message}</section>}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-xl font-bold">最近发生</h2>
              <div className="mt-3 space-y-2">
                {state.log.map((entry, index) => <div key={`${entry}-${index}`} className="rounded-lg bg-slate-950/60 p-2 text-xs leading-relaxed text-slate-300">{entry}</div>)}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3"><div className="text-xs text-slate-400">{label}</div><div className="mt-1 text-lg font-bold">{value}</div></div>;
}
