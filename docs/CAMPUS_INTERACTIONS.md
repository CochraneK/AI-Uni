# AI-Uni Campus Interactions

This document defines the current interaction contract for the generic university map. It is a gameplay layer, not a psychological scoring layer.

## 1. Object-level ordinary activities

`generic_campus_v1` exposes 16 ordinary activity objects, two in each core campus zone. They reuse the existing `convex/life/activities.ts` activity registry rather than creating a second interaction system.

Examples:

```text
campus_gate       公告栏 / 等候区
teaching_building 课间桌椅 / 楼层导览
library           自习座位 / 书架
student_center    活动海报 / 休息区
cafeteria         餐食窗口 / 饮料点
campus_green      散步起点 / 长椅旁
sports_field      跑道 / 球场边
dormitory         自己的书桌 / 床铺
```

Map-specific anchors live in `data/genericCampusInteractables.ts`. The semantic activity definitions remain in `convex/life/activities.ts`.

This split is intentional: a future real-university template may move or rename an object without changing the underlying ordinary-life activity semantics.

## 2. Player interaction flow

```text
click object hotspot
        ↓
focus the linked ordinary activity
        ↓
navigate to that object's walkable anchor
        ↓
enter the semantic campus zone
        ↓
sidebar highlights the selected activity
        ↓
player chooses whether to perform it
        ↓
activity consumes game time + writes ordinary life history
```

Core scenarios still take precedence. Activity hotspots hide while a scenario is active so the map does not encourage bypassing the current event.

## 3. Map safety invariants

`data/genericCampus.test.ts` checks that every object anchor:

- has a unique interaction ID;
- maps to a real activity;
- matches that activity's semantic `locationId`;
- lands on a walkable tile;
- is reachable from the campus gate;
- resolves to the expected semantic zone.

The generic map currently contains 16 validated object anchors.

## 4. Campus travel consumes game time

Crossing from one semantic campus location to another now consumes coarse ordinary walking time.

`convex/world/travel.ts` estimates travel from normalized zone geometry in 5-minute steps:

```text
nearby zones       about 5 minutes
medium campus walk about 10 minutes
long campus walk   about 15 minutes
```

The rule is deliberately coarse. It models the practical cost of moving around a university day; it is not GPS routing.

Movement inside the same semantic zone costs no additional game-clock time.

## 5. Unzoned corridors do not erase the origin

Campus paths and corridors are not all semantic scenario zones. `scenarioRuntimeStates.lastKnownLocationId` therefore persists the last meaningful campus location while the player crosses an unzoned path.

```text
library
  ↓ leave library zone
campus path (no semantic location)
  ↓
student center
```

The runtime charges one `library → student_center` travel block when the destination zone is entered. It does not charge per movement tick and does not lose the origin in the corridor.

## 6. Day cutoff behavior

The university day remains bounded by the shared 08:00–23:00 clock.

Travel is charged before destination scenario selection. Therefore the runtime first advances the clock for the walk, then asks which destination scenes still fit in the remaining day.

If a player reaches a destination near 23:00, travel can consume the remaining minutes up to the day cutoff, but the clock never moves beyond 23:00. A scenario that no longer fits is not selected.

## 7. Research boundary

Travel time and ordinary object interactions are gameplay facts first.

When research recording is disabled, they still function normally. When an explicit research session and behavioral consent are active, telemetry may record coarse semantic transition metadata such as destination and travel minutes. Precise frame-by-frame movement is not copied into the research telemetry table.

Neither choosing a particular campus object nor taking a longer route directly changes a Big Five, CAPE, PCL or clinical score.

## 8. Template extension contract

A future University Template can provide:

- its own map and semantic zone layout;
- its own object anchors and player-facing object labels;
- different walking geometry;
- additional template-specific ordinary activities.

The stable activity/scenario/life-course layers should remain independent from one institution's building names or exact coordinates.
