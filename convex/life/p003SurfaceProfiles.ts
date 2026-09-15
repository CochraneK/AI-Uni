import type {
  P003CharacterNarrativeKernel,
  P003CharacterSurfaceProfile,
} from './p003Characters';
import type { P003ExternalPersonaKernel } from './p003PersonaInterop';

type SurfaceStyleTemplate = Omit<P003CharacterSurfaceProfile, 'source' | 'ocean'>;

const templates: Record<string, SurfaceStyleTemplate[]> = {
  duty_bearer: [
    { communication: 'measured', disclosure: 'selective', conflict: 'repair', planning: 'structured', socialEnergy: 'selective' },
    { communication: 'concise', disclosure: 'private', conflict: 'appease', planning: 'structured', socialEnergy: 'selective' },
  ],
  achievement_prover: [
    { communication: 'direct', disclosure: 'selective', conflict: 'compete', planning: 'structured', socialEnergy: 'social' },
    { communication: 'measured', disclosure: 'private', conflict: 'direct', planning: 'structured', socialEnergy: 'selective' },
  ],
  belonging_keeper: [
    { communication: 'warm', disclosure: 'open', conflict: 'repair', planning: 'adaptive', socialEnergy: 'social' },
    { communication: 'expressive', disclosure: 'selective', conflict: 'appease', planning: 'adaptive', socialEnergy: 'social' },
  ],
  self_directed_explorer: [
    { communication: 'direct', disclosure: 'selective', conflict: 'direct', planning: 'spontaneous', socialEnergy: 'selective' },
    { communication: 'reflective', disclosure: 'selective', conflict: 'avoid', planning: 'adaptive', socialEnergy: 'selective' },
  ],
  security_builder: [
    { communication: 'measured', disclosure: 'private', conflict: 'direct', planning: 'structured', socialEnergy: 'selective' },
    { communication: 'concise', disclosure: 'selective', conflict: 'avoid', planning: 'structured', socialEnergy: 'solitary' },
  ],
  repair_seeker: [
    { communication: 'warm', disclosure: 'open', conflict: 'repair', planning: 'adaptive', socialEnergy: 'selective' },
    { communication: 'reflective', disclosure: 'selective', conflict: 'repair', planning: 'adaptive', socialEnergy: 'selective' },
  ],
  quiet_observer: [
    { communication: 'reflective', disclosure: 'private', conflict: 'avoid', planning: 'adaptive', socialEnergy: 'solitary' },
    { communication: 'concise', disclosure: 'selective', conflict: 'repair', planning: 'structured', socialEnergy: 'selective' },
  ],
  contribution_maker: [
    { communication: 'warm', disclosure: 'selective', conflict: 'repair', planning: 'structured', socialEnergy: 'social' },
    { communication: 'measured', disclosure: 'selective', conflict: 'direct', planning: 'adaptive', socialEnergy: 'selective' },
  ],
};

const hash01 = (input: string) => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

export const createP003SurfaceProfile = (
  seed: string,
  kernel: P003CharacterNarrativeKernel,
): P003CharacterSurfaceProfile => {
  const pool = templates[kernel.archetypeKey] ?? [
    {
      communication: 'measured',
      disclosure: 'selective',
      conflict: 'repair',
      planning: 'adaptive',
      socialEnergy: 'selective',
    } satisfies SurfaceStyleTemplate,
  ];
  const index = Math.min(
    pool.length - 1,
    Math.floor(hash01(`${seed}:${kernel.archetypeKey}:surface`) * pool.length),
  );
  return {
    ...pool[index],
    source: 'p003_archetype_expression',
  };
};

const inferCommunication = (
  communication?: Record<string, unknown>,
): P003CharacterSurfaceProfile['communication'] => {
  const serialized = JSON.stringify(communication ?? {}).toLowerCase();
  if (/direct|直接|果断/.test(serialized)) return 'direct';
  if (/warm|温暖|支持|共情/.test(serialized)) return 'warm';
  if (/express|外显|活跃|热情/.test(serialized)) return 'expressive';
  if (/reflect|反思|谨慎|深思/.test(serialized)) return 'reflective';
  if (/concise|简洁|寡言/.test(serialized)) return 'concise';
  return 'measured';
};

const inferDisclosure = (
  social?: Record<string, unknown>,
): P003CharacterSurfaceProfile['disclosure'] => {
  const serialized = JSON.stringify(social ?? {}).toLowerCase();
  if (/open|开放|倾诉|广/.test(serialized)) return 'open';
  if (/private|封闭|极小|不主动|报喜不报忧/.test(serialized)) return 'private';
  return 'selective';
};

const inferPlanning = (
  lifestyle?: Record<string, unknown>,
): P003CharacterSurfaceProfile['planning'] => {
  const serialized = JSON.stringify(lifestyle ?? {}).toLowerCase();
  if (/计划|规律|structure|固定|自律/.test(serialized)) return 'structured';
  if (/随性|spont|即兴|随机/.test(serialized)) return 'spontaneous';
  return 'adaptive';
};

const inferSocialEnergy = (
  social?: Record<string, unknown>,
  ocean?: Partial<Record<'O' | 'C' | 'E' | 'A' | 'N', number>>,
): P003CharacterSurfaceProfile['socialEnergy'] => {
  const e = ocean?.E;
  if (typeof e === 'number') {
    if (e <= 3) return 'solitary';
    if (e >= 7) return 'social';
  }
  const serialized = JSON.stringify(social ?? {}).toLowerCase();
  if (/极小|孤立|独处|solitary/.test(serialized)) return 'solitary';
  if (/广|大|social|社交/.test(serialized)) return 'social';
  return 'selective';
};

const inferConflict = (
  communication?: Record<string, unknown>,
  coping?: string[],
): P003CharacterSurfaceProfile['conflict'] => {
  const serialized = `${JSON.stringify(communication ?? {})} ${(coping ?? []).join(' ')}`.toLowerCase();
  if (/修复|reappraisal|积极重构|沟通/.test(serialized)) return 'repair';
  if (/讨好|appease|顺从/.test(serialized)) return 'appease';
  if (/竞争|攻击|fight|对抗/.test(serialized)) return 'compete';
  if (/回避|退缩|avoid|withdraw/.test(serialized)) return 'avoid';
  return 'direct';
};

export const surfaceProfileFromExternalPersona = (
  kernel: P003ExternalPersonaKernel,
): P003CharacterSurfaceProfile => ({
  ocean: kernel.psychology.ocean,
  communication: inferCommunication(kernel.psychology.communicationStyle),
  disclosure: inferDisclosure(kernel.psychology.socialRelations),
  conflict: inferConflict(
    kernel.psychology.communicationStyle,
    kernel.psychology.copingStyles,
  ),
  planning: inferPlanning(kernel.psychology.lifestyleHabits),
  socialEnergy: inferSocialEnergy(
    kernel.psychology.socialRelations,
    kernel.psychology.ocean,
  ),
  source: 'external_persona',
});

export const p003SurfaceExpressionPrinciple =
  'Borrowed from AI-persona: deep archetype and surface trait expression are separate layers. Surface style changes how a character speaks and acts; it does not replace the narrative kernel.';
