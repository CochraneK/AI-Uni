import type { UniversityProfile } from '../profiles';

/**
 * Optional Beijing Jiaotong University-inspired template.
 *
 * This is intentionally NOT the AI-Uni default. It demonstrates how a named
 * university can theme stable generic location IDs without changing core life,
 * scenario or research logic.
 *
 * Before shipping a real-school template, verify factual campus details and
 * permissions for official names, logos, seals, photographs and branded assets.
 */
export const bjtuUniversityTemplate: UniversityProfile = {
  id: 'bjtu_inspired',
  name: '北京交通大学风格模板',
  description:
    '以北京交通大学校园生活意象为灵感的可选主题模板。核心场景仍使用通用大学地点 ID；该模板仅覆盖显示名称、地图主题和后续特定内容。',
  status: 'planned',
  institutionModel: 'research_university',
  campusForm: 'residential',
  urbanicity: 'urban',
  academicCalendar: 'semester',
  typicalUndergraduateYears: 4,
  housingAvailability: 'high',
  commuterShare: 'low',
  campusOpenness: 'varies',
  culturalContextTags: ['china', 'beijing', 'bjtu-inspired', 'optional-template'],
  enabledLocationIds: [
    'campus_gate',
    'teaching_building',
    'library',
    'student_center',
    'cafeteria',
    'campus_green',
    'sports_field',
    'dormitory',
  ],
  locationDisplayNames: {
    campus_gate: '南门',
    teaching_building: '思源教学区',
    library: '图书馆',
    student_center: '学生活动中心',
    cafeteria: '食堂',
    campus_green: '明湖与校园绿地',
    sports_field: '体育场',
    dormitory: '学生宿舍',
  },
  mapId: 'bjtu_inspired_v1',
  themePackIds: ['campus-life', 'social-friction', 'bjtu-campus-events'],
  notes: [
    '模板目前只作为扩展接口示例，不进入默认运行时。',
    '地图应是原创/获授权的游戏化表达，不应冒充官方校园导航。',
    '学校专属制度、传统和建筑信息应在启用前单独核实。',
  ],
};
