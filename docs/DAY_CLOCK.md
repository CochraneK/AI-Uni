# AI-Uni Day Clock

AI-Uni uses an explicit in-game day clock for the playable university-life runtime. The clock is ordinary simulation state, not a psychological variable and not a research score.

## Current university-day contract

```text
08:00  day starts
  ↓
movement / conversation
  ↓
free campus activity OR core life scenario
  ↓
completed activity/scenario spends authored game minutes
  ↓
23:00  latest end-of-day boundary
```

The current university-day window is defined in `convex/life/dayClock.ts`:

```text
start: 08:00
end:   23:00
```

The clock is stored inside `lifeProfile.state.dayClock` with a stable day key derived from:

```text
chapterId + chapterUnit + totalGameDays
```

A new game day therefore starts at 08:00 without requiring a destructive migration of older saves. A stored clock from another day is ignored.

## Free campus activities

Every campus activity declares an `estimatedMinutes` value in `convex/life/activities.ts`.

Before an activity starts, the runtime verifies that its full duration fits before 23:00. A 45-minute activity cannot begin at 22:30.

On successful completion the activity:

- advances `dayClock` once;
- stores start/end game minutes in the corresponding `lifeEvent` payload;
- may emit the same minimal timing metadata to research telemetry only when research consent and an open session already exist.

Activities remain ordinary-life gameplay and do not directly change Big Five, CAPE, PCL-5 or other psychological scores.

## Core scenarios

Every `ScenarioDefinition` must now declare a positive integer `estimatedMinutes`.

This duration is authored from the narrative meaning of the scene—for example a short queue conflict can be much shorter than a group project meeting. Duration is **not inferred from**:

- `hiddenTargets`;
- `researchUse`;
- `safetyLevel`;
- questionnaire names;
- clinical or personality constructs.

Content validation rejects missing, non-positive, non-integer or longer-than-a-playable-day durations.

## Selection before scene start

`convex/scenarios/controller.ts` receives the remaining minutes in the current game day.

A scenario whose `estimatedMinutes` exceeds the remaining budget is removed from the runnable candidate pool **before weighted selection**. This prevents the player from entering a normal new scene that the day clock cannot finish.

Research weighting, repetition penalties and safety/consent gates still operate independently from the time-budget filter.

## Scenario run timing

New `scenarioRuns` persist optional clock fields:

```text
startedAtGameMinute
endedAtGameMinute
estimatedMinutes
```

They are optional at the schema level so older development runs remain readable.

When a new scene starts, the runtime records the current game minute and the scene's authored duration. Scene-enter research telemetry, when consented, may record the same minimal metadata.

## One completion path

Successful scene completion is centralized in `convex/scenarios/completion.ts`.

Both paths call the same function:

```text
manual “complete this event” button ─┐
                                     ├─> completeScenarioRun(...)
dialogue auto-completion ────────────┘
```

`completeScenarioRun`:

1. verifies that an active, unfinished run still exists;
2. verifies that the authored duration still fits the current day;
3. advances the game clock exactly once;
4. closes the run with `endedAtGameMinute`;
5. clears the active scenario/run pointers;
6. records first-week scenario completion when applicable;
7. emits consent-gated scene-exit timing metadata.

Because the first successful completion clears the active run, a second completion request cannot spend the duration again.

## Aborted scenes

Leaving a location or ending the day can close an active run with an abort-style outcome such as `location_changed`, `left_location` or `day_ended`.

Those paths do **not** charge the scene's full authored completion duration. This deliberately distinguishes:

```text
completed scene → spend authored narrative duration
aborted scene   → close run without pretending the whole scene happened
```

Travel-time simulation can be added later as its own mechanic rather than being hidden inside scenario duration.

## Legacy / stale active runs

A development save may contain an active scenario created before the time-budget filter existed. If that old run no longer fits before 23:00, completion refuses to push the clock past the day boundary. The player can end the day, which closes the stale run without charging its full duration.

## Player-facing UI

`ScenarioStatusPanel` shows:

- current game time;
- remaining time today;
- free-activity duration and whether it still fits;
- active-scenario estimated duration;
- projected scenario end time when it fits;
- the new time after manual scenario completion.

These are gameplay affordances only. Hidden constructs and research mappings remain absent from the player-facing UI.

## Regression protection

Current tests cover:

- 08:00 day initialization and 23:00 boundary behavior;
- free-activity time spending;
- scenario exclusion when it cannot fit in the remaining day;
- no runnable scenario when no time remains;
- scenario clock advancement exactly once when completion is requested twice;
- stale/legacy run refusal when its duration no longer fits.

CI runs Jest before TypeScript and the production Vite build.

## Next time-system work

The current clock deliberately models **completed activities and completed scenes**, not every second of movement. Logical future extensions include:

- explicit travel time between semantic zones;
- scheduled classes / appointments with start windows;
- sleep / fatigue and next-day start variation;
- city transit duration;
- longer multi-part events that reserve time across several beats.

Those should remain ordinary simulation mechanics and must not be silently converted into psychological scores.
