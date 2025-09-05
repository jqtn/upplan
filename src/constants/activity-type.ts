export enum ActivityType {
  GENERAL = 0,
  COUNT = 1,
  DURATION = 2,
}

export const ActivityTypeLabel: Record<ActivityType, string> = {
  [ActivityType.GENERAL]: "一般入力",
  [ActivityType.COUNT]: "回数入力",
  [ActivityType.DURATION]: "時間入力",
};
