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
    const all = await getAllNotAchievedGoal();
    const filtered = await filterNotAchievedGoalByType(type, all);

    return NextResponse.json({ goals: filtered }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to get roadmap: " + error.message },
      { status: 500 }
    );
  }
}

async function getAllNotAchievedGoal(): Promise<OngoingListItem[]> {
  const user = await getUserData();

  return await db
    .select({
      goalId: schema.stepGoals.id,
      goalTitle: schema.stepGoals.title,
      stepId: schema.steps.id,
      stepTitle: schema.steps.title,
      roadmapTitle: schema.roadmaps.title,
      stepParentIds: schema.steps.parentIds,
      roadmapCategoryId: schema.roadmaps.categoryId,
    })
    .from(schema.stepGoals)
    .innerJoin(
      schema.stepGoalStates,
      eq(schema.stepGoals.id, schema.stepGoalStates.id)
    )
    .innerJoin(schema.steps, eq(schema.stepGoals.stepId, schema.steps.id))
    .innerJoin(schema.roadmaps, eq(schema.steps.roadmapId, schema.roadmaps.id))
    .where(
      and(
        eq(schema.stepGoalStates.isAchieved, false),
        eq(schema.stepGoalStates.userId, user.id)
      )
    );
}

// 未達成の条件により未達成ゴールをフィルタリングする
async function filterNotAchievedGoalByType(
  type: string | null,
  goals: OngoingListItem[]
) {
  const filters: {
    [key: number]: () => Promise<OngoingListItem[]>;
  } = {
    // 直前のステップが全て達成しているステップのみ
    [StepProgressType.SEQUENTIAL_ALL]: async () => {
      // 達成済みのステップのIDを収集
      const achievedStepIds = await getAchievedStepIds();
      // 達成済みのステップを親に持つ場合のみ抽出
      return goals.filter((goal: OngoingListItem) => {
        // 達成済みのステップは除外
        if (achievedStepIds.includes(goal.stepId)) return false;
        // 前がなければOK
        if (goal.stepParentIds[0] == 0) return true;
        // 前の全てが達成済みステップならOK
        return goal.stepParentIds.every((parentId: number) =>
          achievedStepIds.includes(parentId)
        );
      });
    },

    // 直前のステップが１つでも達成しているステップのみ
    [StepProgressType.SEQUENTIAL_ANY]: async () => {
      // 達成済みのステップのIDを収集
      const achievedStepIds = await getAchievedStepIds();
      // 達成済みのステップを親に持つ場合のみ抽出
      return goals.filter((goal: OngoingListItem) => {
        // 達成済みのステップは除外
        if (achievedStepIds.includes(goal.stepId)) return false;
        // 前がなければOK
        if (goal.stepParentIds[0] == 0) return true;
        // 前のいずれかが達成済みステップならOK
        return goal.stepParentIds.some((parentId: number) =>
          achievedStepIds.includes(parentId)
        );
      });
    },

    // 全てのステップ
    [StepProgressType.PARALLEL_ALL]: async () => goals,
  };

  return await filters[Number(type ?? 0)]();
}

// 達成済みのステップのID一覧
async function getAchievedStepIds(): Promise<number[]> {
  const achievedStepIds: number[] = [];

  const user = await getUserData();
  const steps = await db
    .select({
      id: schema.steps.id,
      title: schema.steps.title,
      roadmap: schema.roadmaps.title,
      parentIds: schema.steps.parentIds,
      allGoalsRequired: schema.steps.allGoalsRequired,
    })
    .from(schema.steps)
    .innerJoin(schema.roadmaps, eq(schema.steps.roadmapId, schema.roadmaps.id))
    .where(eq(schema.roadmaps.userId, user.id));

  for (const step of steps) {
    const goals = await db
      .select({
        id: schema.stepGoals.id,
        title: schema.stepGoals.title,
      })
      .from(schema.stepGoals)
      .where(eq(schema.stepGoals.stepId, step.id));
    const achivedGoals = await db
      .select()
      .from(schema.stepGoalStates)
      .where(
        and(
          inArray(
            schema.stepGoalStates.id,
            goals.map((goal) => goal.id)
          ),
          eq(schema.stepGoalStates.isAchieved, true)
        )
      );
    if (step.allGoalsRequired) {
      if (achivedGoals.length == goals.length) {
        achievedStepIds.push(step.id);
      }
    } else {
      if (achivedGoals.length > 0) {
        achievedStepIds.push(step.id);
      }
    }
  }

  return achievedStepIds;
}
