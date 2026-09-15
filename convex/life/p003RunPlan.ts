import {
  p003StageBands,
  stageBandForAge,
  type P003LifeDomainId,
  type P003LifeStageBandId,
} from './p003Ontology';
import type { P003Storylet } from './p003Storylets';

export type P003RunPlanItem = {
  storyletId: string;
  age: number;
  stage: P003LifeStageBandId;
  stageLabel: string;
  primaryDomain: P003LifeDomainId;
};

export const p003StageEventTargets: Record<P003LifeStageBandId, number> = {
  origin: 1,
  early_childhood: 5,
  middle_childhood: 3,
  adolescence: 3,
  emerging_adulthood: 3,
  early_adulthood: 4,
  middle_adulthood: 4,
  later_adulthood: 3,
  late_life: 3,
};

const hash01 = (input: string) => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const representativeAge = (
  seed: string,
  storylet: P003Storylet,
  stage: P003LifeStageBandId,
) => {
  const stageDef = p003StageBands.find((item) => item.id === stage);
  if (!stageDef) return storylet.prerequisites.ageRange[0];

  const min = Math.max(stageDef.ageRange[0], storylet.prerequisites.ageRange[0]);
  const max = Math.min(stageDef.ageRange[1], storylet.prerequisites.ageRange[1]);
  if (max <= min) return min;

  const unit = hash01(`${seed}:${stage}:${storylet.id}:age`);
  const age = min + unit * (max - min);
  return Number(age.toFixed(age < 2 ? 1 : 0));
};

const chooseDiverseStorylets = (
  seed: string,
  stage: P003LifeStageBandId,
  candidates: P003Storylet[],
  target: number,
) => {
  const selected: P003Storylet[] = [];
  const domainCounts = new Map<P003LifeDomainId, number>();
  const remaining = [...candidates];

  while (selected.length < target && remaining.length > 0) {
    remaining.sort((a, b) => {
      const domainPenaltyA = domainCounts.get(a.primaryDomain) ?? 0;
      const domainPenaltyB = domainCounts.get(b.primaryDomain) ?? 0;
      if (domainPenaltyA !== domainPenaltyB) return domainPenaltyA - domainPenaltyB;

      const randomA = hash01(`${seed}:${stage}:${a.id}:pick`);
      const randomB = hash01(`${seed}:${stage}:${b.id}:pick`);
      if (randomA !== randomB) return randomA - randomB;
      return a.id.localeCompare(b.id);
    });

    const next = remaining.shift();
    if (!next) break;
    selected.push(next);
    domainCounts.set(
      next.primaryDomain,
      (domainCounts.get(next.primaryDomain) ?? 0) + 1,
    );
  }

  return selected;
};

const preferredStageForStorylet = (storylet: P003Storylet): P003LifeStageBandId => {
  const [minAge, maxAge] = storylet.prerequisites.ageRange;
  return stageBandForAge((minAge + maxAge) / 2);
};

export const buildP003RunPlan = (
  seed: string,
  storylets: P003Storylet[],
  targets: Record<P003LifeStageBandId, number> = p003StageEventTargets,
): P003RunPlanItem[] => {
  const selectedIds = new Set<string>();
  const plan: P003RunPlanItem[] = [];

  for (const stageDef of p003StageBands) {
    const candidates = storylets.filter(
      (storylet) =>
        storylet.active &&
        storylet.lifeStageBands.includes(stageDef.id) &&
        preferredStageForStorylet(storylet) === stageDef.id &&
        !selectedIds.has(storylet.id),
    );

    const chosen = chooseDiverseStorylets(
      seed,
      stageDef.id,
      candidates,
      targets[stageDef.id],
    );

    for (const storylet of chosen) {
      selectedIds.add(storylet.id);
      plan.push({
        storyletId: storylet.id,
        age: representativeAge(seed, storylet, stageDef.id),
        stage: stageDef.id,
        stageLabel: stageDef.label,
        primaryDomain: storylet.primaryDomain,
      });
    }
  }

  return plan.sort((a, b) => {
    if (a.age !== b.age) return a.age - b.age;
    return hash01(`${seed}:${a.storyletId}:tie`) -
      hash01(`${seed}:${b.storyletId}:tie`);
  });
};

export const p003RunPlanBoundary =
  'A run samples from the content catalog instead of consuming the whole catalog. Adding content increases possible lives, not mandatory run length.';
