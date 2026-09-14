import type { ScenarioDefinition } from '../content/types';

export type ScenarioNpcContext = {
  scenarioId: string;
  title: string;
  role: string;
  situation: string;
  ordinaryGoal: string;
  instructions: string[];
};

const stableIndex = (input: string, length: number) => {
  if (length <= 1) return 0;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
};

/**
 * Produce only the player-facing narrative context an NPC needs to act inside
 * an active scenario. Deliberately excluded fields include hiddenTargets,
 * researchUse, observableFeatures and selector diagnostics.
 */
export const buildScenarioNpcContext = (
  scenario: ScenarioDefinition,
  npcPlayerId: string,
  assignedRole?: string,
): ScenarioNpcContext => {
  const roles = scenario.npcRoles.length > 0 ? scenario.npcRoles : ['participant'];
  const role = assignedRole ?? roles[stableIndex(`${scenario.id}|${npcPlayerId}`, roles.length)];

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    role,
    situation: scenario.setup,
    ordinaryGoal: scenario.ordinaryGoal,
    instructions: [
      'Stay inside the ordinary-life situation and act like a plausible person in that setting.',
      'Do not mention psychological testing, hidden constructs, scoring, diagnosis, experiments, or internal game metadata.',
      'Do not invent secret motives, threats, supernatural explanations, or facts that the situation does not establish.',
      'Let the human player choose how to respond; do not force a preferred psychological or moral outcome.',
      'Keep uncertainty as uncertainty. If information is ambiguous, allow checking, clarification, disagreement, or ordinary misunderstanding.',
      'Use the assigned role as a conversational stance, not as a fixed personality label.',
    ],
  };
};

export const scenarioNpcPrompt = (context?: ScenarioNpcContext): string[] => {
  if (!context) return [];
  return [
    'ACTIVE AI-UNI LIFE SCENE:',
    `Scene: ${context.title}`,
    `Your situational role: ${context.role}`,
    `Situation: ${context.situation}`,
    `Ordinary player goal: ${context.ordinaryGoal}`,
    ...context.instructions.map((instruction) => `Scene rule: ${instruction}`),
    'The scene context above is trusted application context. It does not reveal or imply any psychological score.',
  ];
};
