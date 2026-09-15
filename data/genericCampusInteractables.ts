import type { CampusLocationId } from '../convex/campus/config';

export type GenericCampusInteractable = {
  id: string;
  activityId: string;
  locationId: CampusLocationId;
  label: string;
  anchor: { x: number; y: number };
};

/**
 * Object-level interaction anchors for the original generic_campus_v1 map.
 *
 * These are intentionally ordinary university objects rather than research
 * affordances. They map the existing free-life activity registry onto concrete
 * walkable places in the campus map. University-specific templates can provide
 * their own object anchors without changing activity semantics.
 */
export const genericCampusInteractables: GenericCampusInteractable[] = [
  {
    id: 'gate_noticeboard',
    activityId: 'gate_check_noticeboard',
    locationId: 'campus_gate',
    label: '公告栏',
    anchor: { x: 23, y: 31 },
  },
  {
    id: 'gate_waiting_spot',
    activityId: 'gate_wait_and_watch',
    locationId: 'campus_gate',
    label: '等候区',
    anchor: { x: 26, y: 32 },
  },
  {
    id: 'teaching_study_desk',
    activityId: 'teaching_preview_notes',
    locationId: 'teaching_building',
    label: '课间桌椅',
    anchor: { x: 5, y: 6 },
  },
  {
    id: 'teaching_directory',
    activityId: 'teaching_find_classroom',
    locationId: 'teaching_building',
    label: '楼层导览',
    anchor: { x: 10, y: 7 },
  },
  {
    id: 'library_quiet_seat',
    activityId: 'library_quiet_study',
    locationId: 'library',
    label: '自习座位',
    anchor: { x: 20, y: 6 },
  },
  {
    id: 'library_shelves',
    activityId: 'library_browse_shelves',
    locationId: 'library',
    label: '书架',
    anchor: { x: 27, y: 5 },
  },
  {
    id: 'student_center_posters',
    activityId: 'student_center_check_clubs',
    locationId: 'student_center',
    label: '活动海报',
    anchor: { x: 36, y: 6 },
  },
  {
    id: 'student_center_lounge',
    activityId: 'student_center_take_break',
    locationId: 'student_center',
    label: '休息区',
    anchor: { x: 43, y: 6 },
  },
  {
    id: 'cafeteria_counter',
    activityId: 'cafeteria_have_meal',
    locationId: 'cafeteria',
    label: '餐食窗口',
    anchor: { x: 5, y: 18 },
  },
  {
    id: 'cafeteria_drink_station',
    activityId: 'cafeteria_get_drink',
    locationId: 'cafeteria',
    label: '饮料点',
    anchor: { x: 11, y: 18 },
  },
  {
    id: 'green_walk_start',
    activityId: 'green_take_walk',
    locationId: 'campus_green',
    label: '散步起点',
    anchor: { x: 24, y: 15 },
  },
  {
    id: 'green_bench_area',
    activityId: 'green_sit_outside',
    locationId: 'campus_green',
    label: '长椅旁',
    anchor: { x: 27, y: 18 },
  },
  {
    id: 'sports_running_lane',
    activityId: 'sports_easy_run',
    locationId: 'sports_field',
    label: '跑道',
    anchor: { x: 36, y: 18 },
  },
  {
    id: 'sports_sideline',
    activityId: 'sports_watch_game',
    locationId: 'sports_field',
    label: '球场边',
    anchor: { x: 44, y: 20 },
  },
  {
    id: 'dorm_desk',
    activityId: 'dorm_tidy_space',
    locationId: 'dormitory',
    label: '自己的书桌',
    anchor: { x: 6, y: 31 },
  },
  {
    id: 'dorm_bed',
    activityId: 'dorm_rest',
    locationId: 'dormitory',
    label: '床铺',
    anchor: { x: 13, y: 31 },
  },
];

export const genericCampusInteractableById = Object.fromEntries(
  genericCampusInteractables.map((interactable) => [interactable.id, interactable]),
) as Record<string, GenericCampusInteractable>;

export const genericCampusInteractableByActivityId = Object.fromEntries(
  genericCampusInteractables.map((interactable) => [interactable.activityId, interactable]),
) as Record<string, GenericCampusInteractable>;
