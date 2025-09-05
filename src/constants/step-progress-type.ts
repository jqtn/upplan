export enum StepProgressType {
  SEQUENTIAL_ALL = 0,
  SEQUENTIAL_ANY = 1,
  PARALLEL_ALL = 2,
}

export const StepProgressTypeLabel: Record<StepProgressType, string> = {
  [StepProgressType.SEQUENTIAL_ALL]:
    "直前のステップが全て達成しているステップのみ",
  [StepProgressType.SEQUENTIAL_ANY]:
    "直前のステップが１つでも達成しているステップのみ",
  [StepProgressType.PARALLEL_ALL]: "全てのステップ",
};
