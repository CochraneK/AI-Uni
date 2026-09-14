# AI-Uni Scheduled Commitments

Scheduled commitments add fixed-time obligations and plans to the life simulation. They are deliberately separate from ambient scenarios.

## Why a separate system?

A scenario answers:

> “Given where the player is and what is happening in their life, what ordinary situation might occur here?”

A commitment answers:

> “What did the player already need, agree or plan to do at a particular time and place?”

Examples include classes, exams, presentations, group meetings, appointments, interviews, work shifts and social plans.

Attendance is **gameplay / life-history state**, not a psychological score. Being late or missing a class must never directly become a Big Five, CAPE, PCL or clinical label.

## First-week calendar

The first playable week currently seeds six commitments:

```text
Day 1  09:00–10:00  新生报到          campus_gate       required
Day 2  09:00–10:30  第一节正式课程    teaching_building required
Day 3  14:00–15:00  小组第一次碰面    library           required
Day 4  17:00–18:00  社团说明会        student_center    optional
Day 5  14:30–15:30  课程短汇报        teaching_building required
Day 6  18:00–18:30  周末碰面          campus_gate       optional
```

Day 7 remains comparatively open so the first chapter can end with free planning, reconnection and reflection rather than another mandatory appointment.

Existing development saves do not receive fabricated missed history. `ensureFirstWeekCommitments` seeds only the current and future first-week commitments for an already-progressed save.

## Attendance states

Persistent statuses are:

```text
scheduled
attended_on_time
attended_late
missed
skipped
```

A player can arrive up to 15 minutes before the scheduled start. Each commitment also declares its own grace period.

```text
before early-arrival window  → upcoming
start - 15m through grace    → arrival window
past grace but before end    → late window
at / after scheduled end     → expired
```

When the player attends, the day clock advances to the scheduled end of the commitment. Arriving late therefore consumes only the remaining part of that class / meeting / presentation.

## Navigation and travel time

The sidebar offers one-click navigation to the commitment's semantic campus location.

```text
click “前往教学楼”
        ↓
map navigates to tested semantic zone anchor
        ↓
existing campus travel model charges 5 / 10 / 15 minutes
        ↓
arrival time determines on-time / late / missed state
```

This makes lateness emerge from ordinary planning and travel rather than from a hidden personality rule.

## Commitment priority over ambient scenes

Fixed commitments outrank ambient/random scenarios when the player deliberately checks in.

If a random scene is active at the correct commitment location, check-in closes that scene with outcome:

```text
commitment_priority
```

The interrupted random scene does **not** charge its full authored completion duration. The scheduled commitment then owns the time block.

## Required vs optional plans

Required and optional commitments are intentionally distinct.

At day end:

```text
required + unresolved → missed
optional + unresolved → skipped
```

The player can also explicitly choose not to attend. This records a decision in life history, not a diagnosis or trait score.

## Persistence

`scheduledCommitments` stores:

```text
profileId
commitmentKey
chapterId / chapterUnit
kind
locationId
startMinute / endMinute
aattendanceRequired
graceMinutes
status
arrivedAtMinute?
resolvedAt?
metadata?
```

(Implementation field name is `attendanceRequired`; the list above describes the conceptual record.)

Indexes support stable per-profile keys, current chapter/day lookup and status lookup.

## Research boundary

Commitments function when research recording is completely disabled.

With an open research session and explicit behavioral-research consent, minimal metadata may record attendance status and coarse scheduled/arrival timing. The system does not infer a validated construct score from one late arrival, one skipped meeting or one missed class.

## Future extension

The same runtime can later support:

- exam timetables;
- office hours;
- medical / administrative appointments;
- dates and family plans;
- internship shifts;
- interviews;
- workplace meetings;
- childcare / caregiving obligations;
- travel departures and ticketed events.

University Templates can alter institutional schedules and locations while keeping the semantic commitment contract stable.
