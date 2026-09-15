import { generateLifeOrigin } from './origin';
import { buildP003NarrativeContext } from './p003Narrative';
import type { P003DecisionRecord } from './p003Personality';

const d = (
  eventId: string,
  choiceId: string,
  age: number,
): P003DecisionRecord => ({
  eventId,
  choiceId,
  eventTitle: eventId,
  choiceLabel: choiceId,
  age,
});

describe('p003 narrative callbacks', () => {
  const origin = generateLifeOrigin('narrative', 2000);

  test('later scenes remember specific early decisions', () => {
    const context = buildP003NarrativeContext(
      'first_school_lunch',
      [d('first_school_gate', 'look_for_peer', 6)],
      origin,
    );
    expect(context.callback).toContain('寻找熟悉的人');
  });

  test('adult crossroads reflects structural birth context', () => {
    const constrained = {
      ...origin,
      householdMaterialSecurity: 0.2,
      learningAccess: 0.3,
    };
    const context = buildP003NarrativeContext(
      'post_school_crossroads',
      [d('exam_result_comparison', 'review_errors', 15)],
      constrained,
    );
    expect(context.contextNote).toContain('试错成本有限');
    expect(context.contextNote).toContain('主动去弄清楚');
  });

  test('late-life scene can call back multiple decades', () => {
    const context = buildP003NarrativeContext(
      'life_review_old_message',
      [
        d('moving_house_childhood', 'say_goodbye', 5.5),
        d('first_school_lunch', 'new_peer', 8),
        d('post_school_crossroads', 'pause', 18),
        d('first_bad_manager', 'seek_allies', 28),
        d('midlife_parent_call', 'share_care', 48),
        d('retirement_first_monday', 'people', 66),
        d('exam_result_comparison', 'review_errors', 15),
        d('first_school_gate', 'look_for_peer', 6),
        d('playground_turn', 'propose_turns', 4.5),
        d('caregiver_late_pickup', 'ask_teacher', 5),
        d('toddler_forbidden_drawer', 'ask_first', 3),
      ],
      origin,
    );
    expect(context.callback).toContain('八岁');
    expect(context.callback).toContain('五岁');
    expect(context.callback).toContain('十八岁');
  });
});
