import { useMemo, useState } from 'react';
import { generateLifeOrigin } from '../../convex/life/origin';
import {
  p003StarterEvents,
  type P003EffectMap,
} from '../../convex/life/p003Events';
import {
  buildP003PersonalityReport,
  type P003DecisionRecord,
} from '../../convex/life/p003Personality';
import type { LifeOriginSnapshot } from '../../convex/life/types';
import './p003-text.css';

type MeterKey =
  | 'energy'
  | 'stress'
  | 'support'
  | 'autonomy'
  | 'competence'
  | 'relatedness'
  | 'materialSecurity'
  | 'learningOpportunity';

type MeterState = Record<MeterKey, number>;

type TextLifeSave = {
  version: 1;
  seed: string;
  birthYear: number;
  origin: LifeOriginSnapshot;
  eventIndex: number;
  meters: MeterState;
  decisions: P003DecisionRecord[];
};

const STORAGE_KEY = 'p003-text-life-v1';

const textLifeArc = [
  { id: 'first_favorite_object', age: 0.7, stage: '婴儿期' },
  { id: 'toddler_forbidden_drawer', age: 3, stage: '幼儿期' },
  { id: 'first_public_meltdown', age: 3.5, stage: '幼儿期' },
  { id: 'playground_turn', age: 4.5, stage: '幼儿期' },
  { id: 'caregiver_late_pickup', age: 5, stage: '幼儿期' },
  { id: 'moving_house_childhood', age: 5.5, stage: '幼儿期' },
  { id: 'first_school_gate', age: 6, stage: '儿童期' },
  { id: 'first_school_lunch', age: 8, stage: '儿童期' },
  { id: 'exam_result_comparison', age: 15, stage: '青春期' },
  { id: 'post_school_crossroads', age: 18, stage: '成年初显' },
  { id: 'first_bad_manager', age: 28, stage: '成年早期' },
  { id: 'midlife_parent_call', age: 48, stage: '成年中期' },
  { id: 'retirement_first_monday', age: 66, stage: '退休转变' },
  { id: 'life_review_old_message', age: 79, stage: '晚年回顾' },
] as const;

const regionLabels: Record<LifeOriginSnapshot['regionType'], string> = {
  urban_core: '城市中心',
  urban_periphery: '城市边缘',
  town: '小城镇',
  rural: '乡村地区',
};

const householdLabels: Record<LifeOriginSnapshot['householdStructure'], string> = {
  two_caregiver: '双照护者家庭',
  single_caregiver: '单照护者家庭',
  multigenerational: '多代同住家庭',
  blended_or_other: '重组 / 其他家庭',
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const pct = (value: number) => Math.round(clamp01(value) * 100);

const randomSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `p003-${values[0].toString(36)}-${values[1].toString(36)}`;
  }
  return `p003-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const loadSave = (): TextLifeSave | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as TextLifeSave;
    return parsed.version === 1 ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const saveLocal = (save: TextLifeSave) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));

const initialMeters = (origin: LifeOriginSnapshot): MeterState => ({
  energy: 0.72,
  stress: 0.1,
  support: origin.familySupportDensity,
  autonomy: 0.08,
  competence: 0.05,
  relatedness: clamp01(0.4 + origin.caregivingStability * 0.35),
  materialSecurity: origin.householdMaterialSecurity,
  learningOpportunity: origin.learningAccess,
});

const applyEffects = (meters: MeterState, effects: P003EffectMap): MeterState => ({
  energy: clamp01(meters.energy + (effects.energy ?? 0)),
  stress: clamp01(meters.stress + (effects.stress ?? 0)),
  support: clamp01(meters.support + (effects.support ?? 0)),
  autonomy: clamp01(meters.autonomy + (effects.autonomy ?? 0)),
  competence: clamp01(meters.competence + (effects.competence ?? 0)),
  relatedness: clamp01(meters.relatedness + (effects.relatedness ?? 0)),
  materialSecurity: clamp01(
    meters.materialSecurity + (effects.materialSecurity ?? 0),
  ),
  learningOpportunity: clamp01(
    meters.learningOpportunity + (effects.learningOpportunity ?? 0),
  ),
});

const formatAge = (age: number) =>
  age < 1
    ? `${Math.max(1, Math.round(age * 12))} 个月`
    : `${age % 1 === 0 ? age.toFixed(0) : age.toFixed(1)} 岁`;

const meterLabels: Array<[MeterKey, string]> = [
  ['energy', '精力'],
  ['stress', '压力'],
  ['support', '支持'],
  ['autonomy', '自主'],
  ['competence', '胜任'],
  ['relatedness', '联结'],
];

function BirthPage({
  origin,
  birthYear,
  onReroll,
  onStart,
}: {
  origin: LifeOriginSnapshot;
  birthYear: number;
  onReroll: () => void;
  onStart: () => void;
}) {
  return (
    <main className="life-text-shell life-text-cover">
      <header className="life-text-brand">
        <span>P003 / LIFE SIMULATOR</span>
        <strong>一生</strong>
      </header>

      <section className="life-text-cover-copy">
        <span className="life-text-kicker">TEXT EDITION · 文字版</span>
        <h1>你会出生在一个<br />不完全由你选择的世界。</h1>
        <p>
          家庭、地区、资源和时代会改变你看见哪些道路，但不会提前替你写好结局。
          从出生到晚年，你做过的选择会被保留下来，最终汇成一份属于这条人生轨迹的人格与行为画像。
        </p>
      </section>

      <section className="life-text-birth-sheet">
        <div className="life-text-sheet-heading">
          <div>
            <span>BIRTH RECORD</span>
            <h2>出生记录</h2>
          </div>
          <strong>{birthYear}</strong>
        </div>

        <dl className="life-text-origin-list">
          <div>
            <dt>出生地区</dt>
            <dd>{regionLabels[origin.regionType]}</dd>
            <small>社区机会 {pct(origin.neighborhoodOpportunity)} / 100</small>
          </div>
          <div>
            <dt>家庭结构</dt>
            <dd>{householdLabels[origin.householdStructure]}</dd>
            <small>{origin.caregiverCount} 位主要照护者</small>
          </div>
          <div>
            <dt>物质安全</dt>
            <dd>{pct(origin.householdMaterialSecurity)} / 100</dd>
            <small>不代表家庭关系质量</small>
          </div>
          <div>
            <dt>照护稳定</dt>
            <dd>{pct(origin.caregivingStability)} / 100</dd>
            <small>会影响早期可预测感，但不是命运</small>
          </div>
          <div>
            <dt>家庭支持</dt>
            <dd>{pct(origin.familySupportDensity)} / 100</dd>
            <small>当前可调用的家庭与扩展支持</small>
          </div>
          <div>
            <dt>学习机会</dt>
            <dd>{pct(origin.learningAccess)} / 100</dd>
            <small>机会结构，不直接等于能力</small>
          </div>
        </dl>

        <div className="life-text-cover-actions">
          <button className="life-text-primary" onClick={onStart}>
            开始这一生 <span>→</span>
          </button>
          <button className="life-text-ghost" onClick={onReroll}>
            换一个出生世界
          </button>
        </div>
      </section>

      <footer className="life-text-cover-footer">
        <span>这不是心理测验。</span>
        <p>没有“正确人生”。每个选择只会成为之后分析的一条证据。</p>
      </footer>
    </main>
  );
}

function Progress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const value = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="life-text-progress">
      <div>
        <span>人生进度</span>
        <b>{current} / {total}</b>
      </div>
      <i><b style={{ width: `${value}%` }} /></i>
    </div>
  );
}

function DecisionPage({
  save,
  onChoose,
  onRestart,
}: {
  save: TextLifeSave;
  onChoose: (choiceId: string) => void;
  onRestart: () => void;
}) {
  const point = textLifeArc[save.eventIndex];
  const event = p003StarterEvents.find((item) => item.id === point.id);
  if (!event) return null;

  const year = save.birthYear + Math.floor(point.age);
  const prior = save.decisions[save.decisions.length - 1];

  return (
    <main className="life-text-shell life-text-play">
      <header className="life-text-play-header">
        <div className="life-text-brand compact">
          <span>P003 / TEXT EDITION</span>
          <strong>一生</strong>
        </div>
        <button onClick={onRestart}>重开</button>
      </header>

      <Progress current={save.eventIndex + 1} total={textLifeArc.length} />

      <div className="life-text-play-grid">
        <aside className="life-text-margin">
          <div className="life-text-age-block">
            <span>{year}</span>
            <strong>{formatAge(point.age)}</strong>
            <small>{point.stage}</small>
          </div>

          <div className="life-text-current-state">
            <span>此刻状态</span>
            {meterLabels.map(([key, label]) => (
              <div key={key}>
                <b>{label}</b>
                <i>
                  <span
                    style={{
                      width: `${pct(
                        key === 'stress' ? 1 - save.meters[key] : save.meters[key],
                      )}%`,
                    }}
                  />
                </i>
                <em>{pct(save.meters[key])}</em>
              </div>
            ))}
            <p>这里只描述当前处境，不是人格总分。</p>
          </div>
        </aside>

        <article className="life-text-chapter">
          <div className="life-text-chapter-number">
            MEMORY {String(save.eventIndex + 1).padStart(2, '0')}
          </div>
          <span className="life-text-stage">{point.stage} · {formatAge(point.age)}</span>
          <h1>{event.title}</h1>
          <p className="life-text-setup">{event.setup}</p>

          {prior && (
            <blockquote className="life-text-last-memory">
              <span>上一段记忆</span>
              <p>“{prior.choiceLabel}”</p>
            </blockquote>
          )}

          <div className="life-text-question">{event.visibleQuestion}</div>

          <div className="life-text-choices">
            {event.choices.map((choice, index) => (
              <button key={choice.id} onClick={() => onChoose(choice.id)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{choice.label}</strong>
                  <p>{choice.summary}</p>
                </div>
                <b>选择</b>
              </button>
            ))}
          </div>

          <footer className="life-text-decision-note">
            这次选择不会直接改变一个“人格值”。系统只记录这件事，
            等一生中出现足够多相似或相反的证据后再做综合分析。
          </footer>
        </article>

        <aside className="life-text-archive-preview">
          <span>LIFE ARCHIVE</span>
          <h3>已经发生</h3>
          {save.decisions.length === 0 ? (
            <p>你的第一条人生记录还没有写下。</p>
          ) : (
            <ol>
              {[...save.decisions].reverse().slice(0, 5).map((item) => (
                <li key={`${item.eventId}:${item.choiceId}`}>
                  <span>{formatAge(item.age)}</span>
                  <b>{item.choiceLabel}</b>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </main>
  );
}

const bigFiveIds = [
  'big5.openness',
  'big5.conscientiousness',
  'big5.extraversion',
  'big5.agreeableness',
  'big5.neuroticism',
] as const;

function ReportPage({
  save,
  onRestart,
}: {
  save: TextLifeSave;
  onRestart: () => void;
}) {
  const report = buildP003PersonalityReport(save.decisions);
  const bigFive = bigFiveIds
    .map((id) => report.dimensions.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const behavioral = report.dimensions.filter(
    (item) => !bigFiveIds.includes(item.id as (typeof bigFiveIds)[number]),
  );

  const downloadReport = () => {
    const lines = [
      report.title,
      report.subtitle,
      '',
      '【人物画像总述】',
      ...report.narrativeSections.flatMap((section) => [
        section.title,
        section.text,
        '',
      ]),
      '【大五人格倾向】',
      ...bigFive.flatMap((trait) => [
        `${trait.label}: ${trait.score}/100（证据 ${trait.evidenceCount} 条，置信度 ${Math.round(
          trait.confidence * 100,
        )}%）`,
        trait.summary,
        ...trait.evidence.map(
          (item) =>
            `  - ${formatAge(item.age)}｜${item.choiceLabel}｜${item.interpretation}`,
        ),
        '',
      ]),
      '【决策与应对画像】',
      ...behavioral.flatMap((trait) => [
        `${trait.label}: ${trait.score}/100`,
        trait.summary,
        '',
      ]),
      '【人生决策记录】',
      ...save.decisions.map(
        (decision, index) =>
          `${String(index + 1).padStart(2, '0')}. ${formatAge(decision.age)}｜${decision.eventTitle}｜${decision.choiceLabel}`,
      ),
      '',
      '【解释边界】',
      report.caution,
      '幼儿期证据在算法中自动降权，成年后的重复选择权重更高。',
    ];

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `p003-life-report-${save.seed}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="life-text-shell life-text-report">
      <header className="life-text-report-hero">
        <span>END OF RUN / 79 岁</span>
        <h1>{report.title}</h1>
        <p>{report.subtitle}</p>
        <div className="life-text-report-actions">
          <button className="life-text-primary" onClick={downloadReport}>
            下载完整报告
          </button>
          <button className="life-text-report-restart" onClick={onRestart}>
            重开另一生
          </button>
          <a href="?mode=campus">返回 AI-Uni 校园版</a>
        </div>
      </header>

      <section className="life-text-report-summary">
        <div>
          <span>THIS LIFE IN ONE SENTENCE</span>
          <h2>
            {report.strongestPatterns.length > 0
              ? `这一生里，你最稳定地表现出“${report.strongestPatterns
                  .slice(0, 3)
                  .map((item) => item.label)
                  .join(' / ')}”相关的选择模式。`
              : '这一生的选择比较分散，没有出现特别强的单一路径。'}
          </h2>
        </div>
        <p>{report.caution}</p>
      </section>

      <section className="life-text-report-section life-text-narrative-section">
        <header>
          <span>01</span>
          <div>
            <b>PROFILE NARRATIVE</b>
            <h2>人物画像总述</h2>
          </div>
        </header>

        <div className="life-text-narrative-grid">
          {report.narrativeSections.map((section) => (
            <article key={section.id}>
              <span>{section.title}</span>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="life-text-report-section">
        <header>
          <span>02</span>
          <div>
            <b>BIG FIVE</b>
            <h2>大五人格倾向</h2>
          </div>
        </header>

        <div className="life-text-trait-grid">
          {bigFive.map((trait) => (
            <article key={trait.id}>
              <div className="life-text-trait-heading">
                <h3>{trait.label}</h3>
                <strong>{trait.score}</strong>
              </div>
              <div className="life-text-trait-bar">
                <i style={{ width: `${trait.score}%` }} />
                <span className="midpoint" />
              </div>
              <p>{trait.summary}</p>
              <small>
                证据 {trait.evidenceCount} 条 · 置信度 {Math.round(trait.confidence * 100)}%
              </small>
              <details>
                <summary>为什么这样判断</summary>
                {trait.evidence.length === 0 ? (
                  <p>这条人生里没有足够直接证据，因此保持中性。</p>
                ) : (
                  <ul>
                    {trait.evidence.slice(-5).map((evidence) => (
                      <li key={`${evidence.eventId}:${evidence.choiceId}`}>
                        <b>{formatAge(evidence.age)} · {evidence.choiceLabel}</b>
                        <span>{evidence.interpretation}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </article>
          ))}
        </div>
      </section>

      <section className="life-text-report-section">
        <header>
          <span>03</span>
          <div>
            <b>BEHAVIORAL PATTERNS</b>
            <h2>决策与应对画像</h2>
          </div>
        </header>

        <div className="life-text-behavior-list">
          {behavioral.map((trait) => (
            <article key={trait.id}>
              <div>
                <span>{trait.label}</span>
                <b>{trait.score}</b>
              </div>
              <p>{trait.summary}</p>
              <small>
                {trait.band === 'high'
                  ? '较明显'
                  : trait.band === 'low'
                    ? '较少出现'
                    : '情境性'}
                {' · '}
                {trait.evidenceCount} 条证据
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="life-text-report-section">
        <header>
          <span>04</span>
          <div>
            <b>STRONGEST PATTERNS</b>
            <h2>最稳定的五个模式</h2>
          </div>
        </header>

        <div className="life-text-strong-patterns">
          {report.strongestPatterns.map((trait, index) => (
            <article key={trait.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{trait.label}</h3>
                <p>{trait.summary}</p>
              </div>
              <strong>{trait.score}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="life-text-report-section">
        <header>
          <span>05</span>
          <div>
            <b>LIFE EVIDENCE</b>
            <h2>这份报告来自哪些人生决定</h2>
          </div>
        </header>

        <div className="life-text-life-log">
          {save.decisions.map((decision, index) => (
            <article key={`${decision.eventId}:${decision.choiceId}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <small>{formatAge(decision.age)}</small>
                <h3>{decision.eventTitle}</h3>
                <p>{decision.choiceLabel}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="life-text-report-footer">
        <b>人格不是一次选择决定的。</b>
        <p>
          这份报告只总结你在本次模拟世界里的选择模式。幼儿期证据会被自动降权，
          成年后的重复选择权重更高；未来版本会继续把证据区分为“稳定倾向”和“情境反应”两层。
        </p>
      </footer>
    </main>
  );
}

export default function P003TextLifeSimulator() {
  const [save, setSave] = useState<TextLifeSave | undefined>(() => loadSave());
  const [seed, setSeed] = useState(() => randomSeed());
  const birthYear = 2000;
  const origin = useMemo(() => generateLifeOrigin(seed, birthYear), [seed]);

  const start = () => {
    const next: TextLifeSave = {
      version: 1,
      seed,
      birthYear,
      origin,
      eventIndex: 0,
      meters: initialMeters(origin),
      decisions: [],
    };
    saveLocal(next);
    setSave(next);
  };

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSave(undefined);
    setSeed(randomSeed());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const choose = (choiceId: string) => {
    if (!save) return;
    const point = textLifeArc[save.eventIndex];
    if (!point) return;
    const event = p003StarterEvents.find((item) => item.id === point.id);
    const choice = event?.choices.find((item) => item.id === choiceId);
    if (!event || !choice) return;

    const next: TextLifeSave = {
      ...save,
      eventIndex: save.eventIndex + 1,
      meters: applyEffects(save.meters, choice.immediate),
      decisions: [
        ...save.decisions,
        {
          eventId: event.id,
          choiceId: choice.id,
          eventTitle: event.title,
          choiceLabel: choice.label,
          age: point.age,
        },
      ],
    };

    saveLocal(next);
    setSave(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!save) {
    return (
      <BirthPage
        origin={origin}
        birthYear={birthYear}
        onReroll={() => setSeed(randomSeed())}
        onStart={start}
      />
    );
  }

  if (save.eventIndex >= textLifeArc.length) {
    return <ReportPage save={save} onRestart={restart} />;
  }

  return <DecisionPage save={save} onChoose={choose} onRestart={restart} />;
}
