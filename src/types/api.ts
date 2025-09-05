import type { schema } from "@/db";
import { FormValues as FormValuesStep } from "@/lib/validations/step";

export type RoadmapSummaryListItem = schema.Roadmap & {
  totalSteps: number;
  achievedSteps: number;
  totalActivities: number;
  dailyActivities: { date: string; count: string }[];
};

export type OngoingListItem = {
  goalId: number;
  goalTitle: string;
  stepId: number;
  stepTitle: string;
  roadmapTitle: string;
  stepParentIds: number[];
  roadmapCategoryId: number;
};

export type ActivityListItem = {
  id: string;
  activityDate: string;
  activityContent: string | null;
  activityCount: number | null;
  activityMinutes: number | null;
  goalTitle: string;
  stepTitle: string;
  roadmapTitle: string;
};

export type RoadmapWithSteps = schema.Roadmap & { steps?: StepWithGoals[] };
export type StepWithGoals = schema.Step & { goals?: schema.StepGoal[] };

export type StepInput = {
  id: string;
  new: boolean;
  parentIds: string[];
  values: FormValuesStep;
};
export type GoalInput = {
  id: number;
  title: string;
  type: number;
};
