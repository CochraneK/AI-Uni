import type { ConstructId } from '../assessment/constructs';
import {
  p003LifeDomains,
  p003StageBands,
  type P003LifeDomainId,
  type P003LifeStageBandId,
  type P003NarrativeFunctionId,
} from './p003Ontology';
import type { P003Storylet } from './p003Storylets';

export type P003CoverageCell = {
  stage: P003LifeStageBandId;
  domain: P003LifeDomainId;
  storyletCount: number;
  callbackCount: number;
  narrativeFunctions: P003NarrativeFunctionId[];
  constructIds: string[];
};

export const buildP003CoverageMatrix = (
  storylets: P003Storylet[],
): P003CoverageCell[] => {
  const cells: P003CoverageCell[] = [];

  for (const stage of p003StageBands) {
    for (const domain of Object.keys(p003LifeDomains) as P003LifeDomainId[]) {
      const matching = storylets.filter(
        (storylet) =>
          storylet.lifeStageBands.includes(stage.id) &&
          storylet.primaryDomain === domain,
      );
      cells.push({
        stage: stage.id,
        domain,
        storyletCount: matching.length,
        callbackCount: matching.filter(
          (storylet) =>
            storylet.techniques.includes('callback') ||
            storylet.techniques.includes('choice_echo') ||
            storylet.delayedHooks.length > 0,
        ).length,
        narrativeFunctions: [...new Set(matching.map((storylet) => storylet.narrativeFunction))],
        constructIds: [
          ...new Set(
            matching.flatMap((storylet) =>
              storylet.choices.flatMap((choice) => choice.analysisSignalIds),
            ),
          ),
        ],
      });
    }
  }

  return cells;
};

export type P003CoverageGap = P003CoverageCell & {
  severity: 'empty' | 'thin';
  recommendation: string;
};

export const findP003CoverageGaps = (
  storylets: P003Storylet[],
  targetPerCell = 2,
): P003CoverageGap[] =>
  buildP003CoverageMatrix(storylets)
    .filter((cell) => cell.storyletCount < targetPerCell)
    .map((cell) => ({
      ...cell,
      severity: cell.storyletCount === 0 ? 'empty' : 'thin',
      recommendation:
        cell.storyletCount === 0
          ? 'Add at least one ordinary-life storylet before adding another storylet to already dense cells.'
          : 'Add a second storylet with a different narrative function, relationship pattern or consequence shape.',
    }));

export const coverageForConstruct = (
  storylets: P003Storylet[],
  constructId: ConstructId,
) =>
  storylets.filter((storylet) =>
    storylet.choices.some((choice) => choice.analysisSignalIds.includes(constructId)),
  );

export const p003CoveragePrinciple =
  'Content expansion is coverage-driven: fill sparse life-stage × domain cells and diversify narrative functions before adding more content to already dense cells.';
