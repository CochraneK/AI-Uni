import {
  evidenceWeightForAge,
  p003ChoiceSignals,
  p003PersonalityDimensions,
  type P003DecisionRecord,
  type P003PersonalityDimensionId,
} from './p003Personality';
import { p003StarterStorylets } from './p003Storylets';
import type { P003LifeDomainId, P003LifeStageBandId } from './p003Ontology';

export type P003PatternClassification =
  | 'cross_context'
  | 'context_sensitive'
  | 'emerging'
  | 'insufficient';

export type P003TemporalShift = 'increasing' | 'decreasing' | 'stable' | 'insufficient';

export type P003BehaviorPatternResult = {
  id: P003PersonalityDimensionId;
  label: string;
  classification: P003PatternClassification;
  evidenceCount: number;
  distinctDomains: number;
  distinctStages: number;
  directionConsistency: number;
  temporalShift: P003TemporalShift;
  domains: P003LifeDomainId[];
  stages: P003LifeStageBandId[];
  summary: string;
};

const weightedMean = (items: Array<{ value: number; weight: number }>) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  return items.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
};

const temporalShiftFor = (
  evidence: Array<{ age: number; value: number; weight: number }>,
): P003TemporalShift => {
  const beforeAdult = evidence.filter((item) => item.age < 18);
  const adult = evidence.filter((item) => item.age >= 18);
  if (beforeAdult.length < 2 || adult.length < 2) return 'insufficient';
  const difference = weightedMean(adult) - weightedMean(beforeAdult);
  if (difference > 0.22) return 'increasing';
  if (difference < -0.22) return 'decreasing';
  return 'stable';
};

const summaryFor = (
  classification: P003PatternClassification,
  distinctDomains: number,
  distinctStages: number,
  temporalShift: P003TemporalShift,
) => {
  const time =
    temporalShift === 'increasing'
      ? '而且成年后的同方向证据更明显。'
      : temporalShift === 'decreasing'
        ? '不过成年后这个模式有所减弱或被新的选择改写。'
        : temporalShift === 'stable'
          ? '童年/青春期与成年后的方向总体接近。'
          : '目前还不足以判断它是否随年龄发生了稳定变化。';

  if (classification === 'cross_context') {
    return `这个模式已经跨越 ${distinctDomains} 类生活领域、${distinctStages} 个人生阶段重复出现，比较接近“稳定倾向”。${time}`;
  }
  if (classification === 'context_sensitive') {
    return `相关选择在不同情境里方向并不一致，更适合解释为“情境反应”，而不是固定人格标签。${time}`;
  }
  if (classification === 'emerging') {
    return `已经出现重复证据，但覆盖的生活领域或人生阶段仍然有限；继续积累后才能判断是不是跨情境倾向。${time}`;
  }
  return '直接证据仍然太少，暂时不应该把它解释为稳定的人格或行为模式。';
};

export const buildP003BehaviorPatternReport = (
  decisions: P003DecisionRecord[],
): P003BehaviorPatternResult[] =>
  (Object.keys(p003PersonalityDimensions) as P003PersonalityDimensionId[]).map((id) => {
    const evidence = decisions.flatMap((decision) => {
      const storylet = p003StarterStorylets.find((item) => item.id === decision.eventId);
      const signal = p003ChoiceSignals[`${decision.eventId}:${decision.choiceId}`]?.scores[id];
      if (!storylet || signal === undefined || signal === 0) return [];
      return [{
        age: decision.age,
        value: signal,
        weight: evidenceWeightForAge(decision.age),
        domain: storylet.primaryDomain,
        stages: storylet.lifeStageBands,
      }];
    });

    const domains = [...new Set(evidence.map((item) => item.domain))];
    const stages = [...new Set(evidence.flatMap((item) => item.stages))];
    const weightedPositive = evidence
      .filter((item) => item.value > 0)
      .reduce((sum, item) => sum + Math.abs(item.value) * item.weight, 0);
    const weightedNegative = evidence
      .filter((item) => item.value < 0)
      .reduce((sum, item) => sum + Math.abs(item.value) * item.weight, 0);
    const totalDirectionWeight = weightedPositive + weightedNegative;
    const directionConsistency =
      totalDirectionWeight === 0
        ? 0
        : Math.max(weightedPositive, weightedNegative) / totalDirectionWeight;

    const classification: P003PatternClassification =
      evidence.length < 2
        ? 'insufficient'
        : evidence.length >= 3 && domains.length >= 2 && stages.length >= 2 && directionConsistency >= 0.72
          ? 'cross_context'
          : evidence.length >= 3 && directionConsistency < 0.68
            ? 'context_sensitive'
            : 'emerging';

    const temporalShift = temporalShiftFor(evidence);

    return {
      id,
      label: p003PersonalityDimensions[id].label,
      classification,
      evidenceCount: evidence.length,
      distinctDomains: domains.length,
      distinctStages: stages.length,
      directionConsistency: Number(directionConsistency.toFixed(2)),
      temporalShift,
      domains,
      stages,
      summary: summaryFor(classification, domains.length, stages.length, temporalShift),
    };
  });

export const strongestP003CrossContextPatterns = (
  decisions: P003DecisionRecord[],
  limit = 5,
) =>
  buildP003BehaviorPatternReport(decisions)
    .filter((pattern) => pattern.classification === 'cross_context')
    .sort((a, b) =>
      b.directionConsistency * b.evidenceCount - a.directionConsistency * a.evidenceCount,
    )
    .slice(0, limit);
