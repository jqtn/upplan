import { NextResponse, NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import type { OngoingListItem } from "@/types/api";
import { StepProgressType } from "@/constants/step-progress-type";
import { getUserData } from "@/lib/supabase-auth/user";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");

  try {
    const filtered = await getNotAchievedSteps(type);

    return NextResponse.json({ steps: filtered }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to get roadmap: " + error.message },
      { status: 500 }
    );
  }
}

// 未達成の条件により未達成ステップをフィルタリングして返す
async function getNotAchievedSteps(type: string | null) {
  const { achievedSteps, notAchievedSteps } = await getSteps();

  const filters: {
    [key: number]: () => Promise<OngoingListItem[]>;
  } = {
    // 直前のステップが全て達成しているステップのみ
    [StepProgressType.SEQUENTIAL_ALL]: async () => {
      // 達成済みのステップのIDを収集
      const achievedStepIds = achievedSteps.map((step) => step.stepId);
      // 達成済みのステップを親に持つ場合のみ抽出
      return notAchievedSteps.filter((step: OngoingListItem) => {
        // 達成済みのステップは除外
        if (achievedStepIds.includes(step.stepId)) return false;
        // 前がなければOK
        if (step.stepParentIds[0] == 0) return true;
        // 前の全てが達成済みステップならOK
        return step.stepParentIds.every((parentId: number) =>
          achievedStepIds.includes(parentId)
        );
      });
    },

    // 直前のステップが１つでも達成しているステップのみ
    [StepProgressType.SEQUENTIAL_ANY]: async () => {
      // 達成済みのステップのIDを収集
      const achievedStepIds = achievedSteps.map((step) => step.stepId);
      // 達成済みのステップを親に持つ場合のみ抽出
      return notAchievedSteps.filter((step: OngoingListItem) => {
        // 達成済みのステップは除外
        if (achievedStepIds.includes(step.stepId)) return false;
        // 前がなければOK
        if (step.stepParentIds[0] == 0) return true;
        // 前のいずれかが達成済みステップならOK
        return step.stepParentIds.some((parentId: number) =>
          achievedStepIds.includes(parentId)
        );
      });
    },

    // 全てのステップ
    [StepProgressType.PARALLEL_ALL]: async () => notAchievedSteps,
  };

  return await filters[Number(type ?? 0)]();
}

// ステップを達成済みと未達成に分けて取得
async function getSteps(): Promise<{
  achievedSteps: any[];
  notAchievedSteps: any[];
}> {
  const achievedSteps: any[] = [];
  const notAchievedSteps: any[] = [];

  const user = await getUserData();

  const steps = await db
    .select({
      stepId: schema.steps.id,
      stepTitle: schema.steps.title,
      roadmapTitle: schema.roadmaps.title,
      stepParentIds: schema.steps.parentIds,
      roadmapCategoryId: schema.roadmaps.categoryId,
      allGoalsRequired: schema.steps.allGoalsRequired,
    })
    .from(schema.steps)
    .innerJoin(schema.roadmaps, eq(schema.steps.roadmapId, schema.roadmaps.id))
    .where(eq(schema.roadmaps.userId, user.id));

  for (const step of steps) {
    const goals = await db
      .select()
      .from(schema.stepGoalStates)
      .where(eq(schema.stepGoalStates.stepId, step.stepId));
    const isAchived = step.allGoalsRequired
      ? goals.every((goal) => goal.isAchieved)
      : goals.some((goal) => goal.isAchieved);
    if (isAchived) {
      achievedSteps.push(step);
    } else {
      notAchievedSteps.push(step);
    }
  }

  return { achievedSteps, notAchievedSteps };
}
