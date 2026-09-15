import { p003StarterEvents } from './p003Events';
import { buildP003PersonalityReport, p003ChoiceSignals } from './p003Personality';

describe('p003 personality report', () => {
  test('every authored decision choice has an explicit analysis signal', () => {
    for (const event of p003StarterEvents) {
      for (const choice of event.choices) {
        expect(p003ChoiceSignals[`${event.id}:${choice.id}`]).toBeDefined();
      }
    }
  });

  test('builds conservative scores from repeated behavioral evidence', () => {
    const report = buildP003PersonalityReport([
      {
        eventId: 'toddler_forbidden_drawer',
        choiceId: 'ask_first',
        eventTitle: '抽屉',
        choiceLabel: '先问',
        age: 3,
      },
      {
        eventId: 'exam_result_comparison',
        choiceId: 'review_errors',
        eventTitle: '成绩',
        choiceLabel: '复盘',
        age: 15,
      },
      {
        eventId: 'first_bad_manager',
        choiceId: 'document_and_talk',
        eventTitle: '上司',
        choiceLabel: '记录并沟通',
        age: 27,
      },
      {
        eventId: 'midlife_parent_call',
        choiceId: 'share_care',
        eventTitle: '照护',
        choiceLabel: '协商分工',
        age: 48,
      },
    ]);

    const problemFocused = report.dimensions.find(
      (item) => item.id === 'coping.problem_focused',
    );
    expect(problemFocused?.score).toBeGreaterThan(60);
    expect(problemFocused?.evidenceCount).toBeGreaterThanOrEqual(4);
    expect(problemFocused?.score).toBeLessThanOrEqual(78);
  });

  test('keeps unobserved dimensions near the neutral midpoint with low confidence', () => {
    const report = buildP003PersonalityReport([]);
    for (const dimension of report.dimensions) {
      expect(dimension.score).toBe(50);
      expect(dimension.confidence).toBe(0.2);
      expect(dimension.evidenceCount).toBe(0);
    }
  });

  test('surfaces evidence instead of returning opaque labels', () => {
    const report = buildP003PersonalityReport([
      {
        eventId: 'first_school_lunch',
        choiceId: 'new_peer',
        eventTitle: '午饭',
        choiceLabel: '认识新同学',
        age: 8,
      },
      {
        eventId: 'life_review_old_message',
        choiceId: 'reconnect',
        eventTitle: '旧消息',
        choiceLabel: '重新联系',
        age: 79,
      },
    ]);

    const openness = report.dimensions.find((item) => item.id === 'big5.openness');
    expect(openness?.evidence.length).toBe(2);
    expect(openness?.evidence[0]?.eventTitle).toBe('午饭');
  });
});
