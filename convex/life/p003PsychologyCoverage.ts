import type { ConstructId } from '../assessment/constructs';
import { p003PsychologyRegistry } from './p003PsychologyRegistry';
import type { P003Storylet } from './p003Storylets';

export type P003PsychologyCoverageRow = {
  constructId: ConstructId;
  label: string;
  surface: 'profile' | 'reflection' | 'research_only';
  storyletCount: number;
  choiceCount: number;
  coveredLifeStages: string[];
  coveredDomains: string[];
  status: 'covered' | 'thin' | 'no_content' | 'research_only_no_content';
};

export const buildP003PsychologyCoverage = (
  storylets: P003Storylet[],
): P003PsychologyCoverageRow[] =>
  (Object.keys(p003PsychologyRegistry) as ConstructId[]).map((constructId) => {
    const matchingStorylets = storylets.filter((storylet) =>
      storylet.choices.some((choice) =>
        choice.analysisSignalIds.includes(constructId),
      ),
    );
    const matchingChoices = matchingStorylets.flatMap((storylet) =>
      storylet.choices.filter((choice) =>
        choice.analysisSignalIds.includes(constructId),
      ),
    );
    const policy = p003PsychologyRegistry[constructId];
    const stageCount = new Set(
      matchingStorylets.flatMap((storylet) => storylet.lifeStageBands),
    ).size;
    const domainCount = new Set(
      matchingStorylets.map((storylet) => storylet.primaryDomain),
    ).size;

    const status: P003PsychologyCoverageRow['status'] =
      matchingChoices.length === 0
        ? policy.surface === 'research_only'
          ? 'research_only_no_content'
          : 'no_content'
        : matchingChoices.length < policy.minimumEvidence ||
            stageCount < policy.minimumLifeStages ||
            domainCount < policy.minimumDistinctContexts
          ? 'thin'
          : 'covered';

    return {
      constructId,
      label: policy.label,
      surface: policy.surface,
      storyletCount: matchingStorylets.length,
      choiceCount: matchingChoices.length,
      coveredLifeStages: [
        ...new Set(
          matchingStorylets.flatMap((storylet) => storylet.lifeStageBands),
        ),
      ],
      coveredDomains: [
        ...new Set(
          matchingStorylets.map((storylet) => storylet.primaryDomain),
        ),
      ],
      status,
    };
  });

export const p003PsychologyBacklog = (
  storylets: P003Storylet[],
) =>
  buildP003PsychologyCoverage(storylets).filter(
    (row) => row.status !== 'covered',
  );

export const p003PsychologyCoverageBoundary =
  'A zero-coverage construct is an explicit content backlog, not permission to reinterpret unrelated choices. Research-only constructs may intentionally remain uncovered until a valid study design and suitable naturalistic scenes exist.';
