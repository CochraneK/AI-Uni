export type CampusLocationId =
  | 'campus_gate'
  | 'teaching_building'
  | 'library'
  | 'student_center'
  | 'cafeteria'
  | 'campus_green'
  | 'sports_field'
  | 'dormitory';

export const campusLocations: Record<
  CampusLocationId,
  {
    name: string;
    category: 'arrival' | 'study' | 'social' | 'food' | 'leisure' | 'sports' | 'home';
    description: string;
  }
> = {
  campus_gate: {
    name: '校园入口',
    category: 'arrival',
    description: '校园主要出入口与约见地点，可承载报到、等人、出入校园和返校等普通事件。',
  },
  teaching_building: {
    name: '教学楼',
    category: 'study',
    description: '上课、答疑、临时调课、课堂展示、考试等日常学习事件的主要地点。',
  },
  library: {
    name: '图书馆',
    category: 'study',
    description: '自习、小组作业、查资料、备考和安静社交的地点。',
  },
  student_center: {
    name: '学生活动中心',
    category: 'social',
    description: '社团招新、学生组织、活动报名、志愿服务和同伴社交的地点。',
  },
  cafeteria: {
    name: '校园餐厅 / 食堂',
    category: 'food',
    description: '吃饭、拼桌、排队、偶遇同学等高频校园生活地点。',
  },
  campus_green: {
    name: '校园公共空间',
    category: 'leisure',
    description: '广场、草坪、湖边、庭院或其他可散步、聊天、独处和低压力探索的公共空间。',
  },
  sports_field: {
    name: '运动场地',
    category: 'sports',
    description: '跑步、球类活动、健身、比赛观赛和约人运动的地点。',
  },
  dormitory: {
    name: '学生住宿区',
    category: 'home',
    description: '宿舍、公寓或其他学生住宿环境，用于起居、室友互动、作息协调和生活琐事。',
  },
};

export const defaultUniversityDay = [
  { time: '08:00', location: 'dormitory' as const, activity: '起床与准备' },
  { time: '08:30', location: 'cafeteria' as const, activity: '早餐' },
  { time: '09:00', location: 'teaching_building' as const, activity: '课程' },
  { time: '12:00', location: 'cafeteria' as const, activity: '午餐' },
  { time: '14:00', location: 'library' as const, activity: '学习或小组任务' },
  { time: '17:00', location: 'student_center' as const, activity: '社团或校园活动' },
  { time: '19:00', location: 'library' as const, activity: '晚间学习' },
  { time: '22:00', location: 'dormitory' as const, activity: '住宿区生活' },
];

// Backward-compatible alias while runtime code migrates to the university-wide terminology.
export const defaultCampusDay = defaultUniversityDay;

export const campusDesignPrinciples = {
  ordinaryLifeRatio: 0.7,
  assessmentSensitiveRatio: 0.2,
  explicitCalibrationRatio: 0.1,
  notes: [
    '大学生活必须是主体验，心理测量只作为后台研究层。',
    '核心场景应尽量跨学校成立；学校特有建筑、制度和文化放在 profile / theme pack 中。',
    '不要在 NPC 提示词里写“正在测试某个心理构念”。',
    '同一构念应由多个不同事件重复观察，避免单次选择决定结果。',
    'PCL-5 与 CAPE-P15 的游戏行为只作为探索性关联信号，不能直接生成临床分数或诊断。',
  ],
};
