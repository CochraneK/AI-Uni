# AI-Uni Campus Schedule

AI-Uni uses a lightweight campus schedule to make the in-game clock feel like a university day without turning the game into a rigid timetable.

The schedule has two deliberately separate layers:

```text
soft rhythm hint                 authored scene window
(player suggestion)              (content plausibility rule)
        ↓                                  ↓
“现在通常在上课”                 breakfast only in morning
“下一项 12:00 午餐”              queue friction only near meals
        ↓                                  ↓
player may ignore it             scene selector enforces it
```

Neither layer is a psychological score or research inference.

## 1. Default university rhythm

`convex/campus/config.ts` defines the current generic university-day rhythm:

```text
08:00  起床与准备       dormitory
08:30  早餐             cafeteria
09:00  课程             teaching_building
12:00  午餐             cafeteria
14:00  学习或小组任务   library
17:00  社团或校园活动   student_center
19:00  晚间学习         library
22:00  住宿区生活       dormitory
```

`convex/campus/schedule.ts` parses these entries into game-clock minutes and exposes the current and next schedule beat.

This is a **generic university rhythm**, not a claim that every university or every student follows the same timetable. Future University Templates may provide different schedule profiles.

## 2. Soft player-facing guidance

`ScenarioStatusPanel` shows a small `参考日程 · 不强制` card.

It tells the player:

- what the generic rhythm currently suggests;
- the suggested semantic location;
- the next scheduled beat and its time;
- explicitly that the player may ignore the suggestion.

Free campus activities are not disabled simply because they differ from the suggested rhythm. The purpose is orientation and world coherence, not schedule enforcement.

## 3. Map recommendation

On `generic_campus_v1`, the same schedule state is reused by the Pixi world-space activity hotspots.

The currently suggested location receives a subtle star/highlight. Other hotspots remain visible and clickable. No automatic movement occurs.

The map and sidebar consume the existing shared life/runtime state; no second schedule engine is created in the renderer.

## 4. Authored scenario time windows

`ScenarioDefinition` may optionally declare:

```ts
timeWindows: [
  { start: '11:30', end: '14:00', label: '午饭高峰' },
]
```

A scene with a time window can start only when:

1. the current game minute is inside one declared window; and
2. the scene's full `estimatedMinutes` duration can finish before that window ends; and
3. the existing 23:00 day-budget rule also permits completion.

For example, a 30-minute breakfast scene with an `08:00–10:00` window:

```text
09:00 start → 09:30 finish → allowed
09:45 start → 10:15 finish → blocked
12:00 start → outside window → blocked
```

This filtering happens before weighted scenario selection.

## 5. Content-authoring rule

Time windows are ordinary narrative metadata. Authors should ask:

> “When would this event plausibly happen in everyday life?”

They must **not** derive a time window from:

- Big Five / CAPE / PCL-related constructs;
- `hiddenTargets`;
- `researchUse`;
- `safetyLevel`;
- participant traits or inferred mental state.

The selector therefore treats schedule plausibility as a gameplay/content constraint independent of research weighting and safety gates.

## 6. Current campus-life windows

Examples include:

```text
早餐时间             08:00–10:00
临时换教室           08:30–12:00
课堂汇报             09:00–17:00
小组作业分工         13:00–21:30
社团招新             16:00–20:30
运动                 16:00–21:30
```

Broad ordinary scenes such as walking around campus intentionally receive wide windows rather than being over-constrained.

## 7. Current social-friction windows

Examples include:

```text
食堂插队             11:30–14:00 / 17:00–19:30
群聊里的模糊抱怨     11:30–14:30 / 17:00–19:30
汇报署名争议         13:00–21:30
宿舍作息协调         19:30–22:45
没被叫上的聚会       18:00–22:30
借走东西一直不还     18:00–22:30
```

The goal is basic temporal plausibility, not maximizing psychological measurement opportunities.

## 8. Validation

`convex/content/validation.ts` rejects time-window definitions that:

- are an empty list;
- do not use valid `HH:MM` values;
- start before the playable day or end after it;
- end at or before their start;
- are shorter than the scene's authored `estimatedMinutes`.

This makes schedule errors content-validation failures instead of silent runtime surprises.

## 9. Regression tests

Current tests cover:

- parsing and ordering the default university schedule;
- current/next schedule lookup;
- breakfast inside its valid window;
- breakfast blocked when its duration would overrun 10:00;
- breakfast blocked at noon;
- cafeteria queue friction allowed at lunch but blocked mid-afternoon;
- the existing whole-day 08:00–23:00 budget constraints.

## 10. What this is not yet

This is not yet a full calendar/appointment simulation. AI-Uni still does not currently model:

- mandatory class attendance with lateness consequences;
- reservations or appointments with exact start times;
- travel time between campus zones;
- recurring weekly course tables;
- NPC-specific calendars;
- sleep/fatigue-based next-day start times.

Those can be layered on later without changing the principle that the player should retain meaningful freedom within the life simulation.
