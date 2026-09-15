import { campusLocations, type CampusLocationId } from '../campus/config';

export type OffCampusLocationId =
  | 'transit_hub'
  | 'restaurant'
  | 'shopping_area'
  | 'ktv'
  | 'city_park'
  | 'internship_office'
  | 'railway_station'
  | 'family_home';

export type WorldLocationId = CampusLocationId | OffCampusLocationId;

export type WorldLocation = {
  name: string;
  scope: 'campus' | 'city' | 'travel' | 'home';
  category:
    | 'arrival'
    | 'study'
    | 'social'
    | 'food'
    | 'leisure'
    | 'sports'
    | 'home'
    | 'transit'
    | 'work'
    | 'entertainment';
  description: string;
  mapStatus: 'playable' | 'planned';
};

export const offCampusLocations: Record<OffCampusLocationId, WorldLocation> = {
  transit_hub: {
    name: '校外交通枢纽',
    scope: 'city',
    category: 'transit',
    description: '地铁、公交与步行换乘场景，可承载等人、赶时间、迷路和临时改计划等事件。',
    mapStatus: 'planned',
  },
  restaurant: {
    name: '校外餐厅',
    scope: 'city',
    category: 'food',
    description: '朋友聚餐、AA、临时放鸽子、点餐分歧和多人社交等事件。',
    mapStatus: 'planned',
  },
  shopping_area: {
    name: '商圈',
    scope: 'city',
    category: 'leisure',
    description: '逛街、看电影、购买物品和临时改变行程等低压力生活内容。',
    mapStatus: 'planned',
  },
  ktv: {
    name: 'KTV / 聚会场所',
    scope: 'city',
    category: 'entertainment',
    description: '朋友聚会、生日、陌生人加入、社交边界和群体决策等事件。',
    mapStatus: 'planned',
  },
  city_park: {
    name: '城市公园',
    scope: 'city',
    category: 'leisure',
    description: '散步、约会、朋友谈心和独处等自然交流事件。',
    mapStatus: 'planned',
  },
  internship_office: {
    name: '实习公司',
    scope: 'city',
    category: 'work',
    description: '实习任务、反馈、竞争、职场沟通与不确定性事件。',
    mapStatus: 'planned',
  },
  railway_station: {
    name: '火车站',
    scope: 'travel',
    category: 'transit',
    description: '返乡、旅行、误点、行程变化和与同伴协作等事件。',
    mapStatus: 'planned',
  },
  family_home: {
    name: '家庭场景',
    scope: 'home',
    category: 'home',
    description: '假期返家、家庭沟通和生活安排等可选扩展内容。',
    mapStatus: 'planned',
  },
};

export const worldLocations: Record<WorldLocationId, WorldLocation> = {
  ...(Object.fromEntries(
    Object.entries(campusLocations).map(([id, location]) => [
      id,
      {
        ...location,
        scope: 'campus' as const,
        mapStatus: 'playable' as const,
      },
    ]),
  ) as Record<CampusLocationId, WorldLocation>),
  ...offCampusLocations,
};
