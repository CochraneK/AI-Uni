import type { ContentPack, ScenarioDefinition } from '../content/types';
import { campusLifePack } from '../content/packs/campusLife';
import { socialFrictionPack } from '../content/packs/socialFriction';
import { cityLifePack } from '../content/packs/cityLife';
import { sensitiveResearchPack } from '../content/packs/sensitiveResearch';

export const contentPacks: ContentPack[] = [
  campusLifePack,
  socialFrictionPack,
  cityLifePack,
  sensitiveResearchPack,
];

export const allScenarios: ScenarioDefinition[] = contentPacks.flatMap((pack) => pack.scenarios);

// Default runtime pool: ordinary campus content + explicitly enabled behavioral scenarios.
// Sensitive research and not-yet-mapped city content stay available in the registry but are opt-in.
export const defaultScenarios = allScenarios.filter((scenario) => scenario.enabledByDefault);

// Backward-compatible export used by the first BJTU prototype.
export const campusScenarios = defaultScenarios;

export const getScenario = (id: string) => allScenarios.find((scenario) => scenario.id === id);
export const getCampusScenario = getScenario;

export const getContentPack = (id: string) => contentPacks.find((pack) => pack.id === id);

export const listScenariosByPack = (packId: string) =>
  allScenarios.filter((scenario) => scenario.packId === packId);

export const listScenariosByTag = (tag: string) =>
  allScenarios.filter((scenario) => scenario.tags.includes(tag));
