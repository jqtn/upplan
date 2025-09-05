"use server";

import { db, schema } from "@/db";
import { sql, eq, and, inArray, notInArray } from "drizzle-orm";
import { getUserData } from "@/lib/supabase-auth/user";
import { revalidatePath } from "next/cache";
import type { RoadmapWithSteps, StepWithGoals, StepInput } from "@/types/api";
import {
  formSchema as formSchemaRoadmap,
  FormValues as FormValuesRoadmap,
} from "@/lib/validations/roadmap";
import { formSchema as formSchemaStep } from "@/lib/validations/step";
import { User } from "@supabase/supabase-js";

export async function getRoadmaps(): Promise<{
  ok: boolean;
  data?: schema.Roadmap[];
  error?: any;
}> {
  try {
    const user = await getUserData();
    const roadmaps = await db
      .select()
      .from(schema.roadmaps)
      .where(eq(schema.roadmaps.userId, user.id));
    return { ok: true, data: roadmaps };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function getDetailedRoadmap(id: string) {
  try {
    const user = await getUserData();

    const [roadmap] = await db
      .select()
      .from(schema.roadmaps)
      .where(
        and(eq(schema.roadmaps.userId, user.id), eq(schema.roadmaps.id, id))
      );

    const steps: StepWithGoals[] = await db
      .select()
      .from(schema.steps)
      .where(
        and(eq(schema.steps.userId, user.id), eq(schema.steps.roadmapId, id))
      );

    for (const step of steps) {
      step.goals = await db
        .select()
        .from(schema.stepGoals)
        .where(eq(schema.stepGoals.stepId, step.id));
    }

    const toMap = (array: Record<string, string>[]) => {
      return array.reduce((acc, item) => {
        acc[item.id] = item.total;
        return acc;
      }, {} as Record<string, string>);
    };

    const queryActivitiesCount = sql`SELECT step_goal_id as id, COUNT(*) as total FROM ${schema.activities} WHERE ${schema.activities.userId}=${user.id} AND ${schema.activities.roadmapId}=${id} GROUP BY step_goal_id`;
    const activitiesCountMap: Record<string, string> = toMap(
      await db.execute(queryActivitiesCount)
    );
    const queryActivityCountSum = sql`SELECT step_goal_id as id, SUM(${schema.activities.actCount}) as total FROM ${schema.activities} WHERE ${schema.activities.userId}=${user.id} AND ${schema.activities.roadmapId}=${id} GROUP BY step_goal_id`;
    const activityCountSumMap: Record<string, string> = toMap(
      await db.execute(queryActivityCountSum)
    );
    const queryActivityMinutesSum = sql`SELECT step_goal_id as id, SUM(${schema.activities.actMinutes}) as total FROM ${schema.activities} WHERE ${schema.activities.userId}=${user.id} AND ${schema.activities.roadmapId}=${id} GROUP BY step_goal_id`;
    const activityMinutesSumMap: Record<string, string> = toMap(
      await db.execute(queryActivityMinutesSum)
    );

    const goalStates = await db
      .select()
      .from(schema.stepGoalStates)
      .where(
        and(
          eq(schema.stepGoalStates.roadmapId, id),
          eq(schema.stepGoalStates.isAchieved, true)
        )
      );
    const achievedGoalIds = goalStates.map((goal) => goal.id);

    if (roadmap) {
      return {
        ok: true,
        data: {
          roadmap,
          steps,
          achievedGoalIds,
          activitiesCountMap,
          activityCountSumMap,
          activityMinutesSumMap,
        },
      };
    } else {
      return {
        ok: true,
        data: null,
      };
    }
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function getRoadmap(id: string) {
  try {
    const user = await getUserData();

    const [roadmap]: RoadmapWithSteps[] = await db
      .select()
      .from(schema.roadmaps)
      .where(
        and(eq(schema.roadmaps.userId, user.id), eq(schema.roadmaps.id, id))
      );

    const steps: StepWithGoals[] = await db
      .select()
      .from(schema.steps)
      .where(
        and(eq(schema.steps.userId, user.id), eq(schema.steps.roadmapId, id))
      );

    for (const step of steps) {
      step.goals = await db
        .select()
        .from(schema.stepGoals)
        .where(eq(schema.stepGoals.stepId, step.id));
    }

    if (roadmap) {
      roadmap.steps = steps;
      return { ok: true, data: roadmap };
    } else {
      return { ok: true, data: null };
    }
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function createRoadmap(data: FormValuesRoadmap) {
  const parsed = formSchemaRoadmap.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  try {
    const user = await getUserData();

    const [returning] = await db
      .insert(schema.roadmaps)
      .values({
        userId: user.id,
        categoryId: Number(data.category),
        title: data.title,
        note: data.note,
      })
      .returning({ id: schema.roadmaps.id });

    return { ok: true, id: returning.id };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function updateRoadmap(
  id: string,
  roadmap: FormValuesRoadmap,
  steps: StepInput[]
) {
  const parsed1 = formSchemaRoadmap.safeParse(roadmap);
  if (!parsed1.success) {
    return { ok: false, error: "Invalid input" };
  }

  steps.forEach((step) => {
    const parsed2 = formSchemaStep.safeParse(step.values);
    if (!parsed2.success) {
      return { ok: false, error: "Invalid input" };
    }
  });

  try {
    const user = await getUserData();

    await db.transaction(async (tx) => {
      await db
        .update(schema.roadmaps)
        .set({
          title: roadmap.title,
          note: roadmap.title,
          categoryId: roadmap.category ? Number(roadmap.category) : 0,
        })
        .where(
          and(eq(schema.roadmaps.userId, user.id), eq(schema.roadmaps.id, id))
        );

      // 削除されたステップおよびゴールをDBから削除
      await deleteUnusedSteps(user, id, steps);

      // ステップとゴールの更新
      await updateSteps(user, id, steps);
    });

    return { ok: true };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

// 削除されたステップおよびゴールをDBから削除
async function deleteUnusedSteps(
  user: User,
  roadmapId: string,
  inputSteps: StepInput[]
) {
  const keepSteps = inputSteps.filter((step: StepInput) => !step.new);

  // 削除されたステップのゴールをDBから削除
  const keepGoalIds = keepSteps.flatMap((step: StepInput) =>
    step.values.goals.filter((goal) => goal.id).map((goal) => Number(goal.id))
  );
  const deleteGoals = await db
    .select()
    .from(schema.stepGoals)
    .where(
      and(
        eq(schema.stepGoals.userId, user.id),
        eq(schema.stepGoals.roadmapId, roadmapId),
        notInArray(schema.stepGoals.id, keepGoalIds)
      )
    );
  const deleteGoalIds = deleteGoals.map((goal: schema.StepGoal) => goal.id);

  await db
    .delete(schema.activities)
    .where(inArray(schema.activities.stepGoalId, deleteGoalIds));
  await db
    .delete(schema.stepGoalStates)
    .where(inArray(schema.stepGoalStates.id, deleteGoalIds));
  await db
    .delete(schema.stepGoals)
    .where(inArray(schema.stepGoals.id, deleteGoalIds));

  // 削除されたステップをDBから削除
  const keepStepIds = keepSteps.map((step: StepInput) => Number(step.id));
  await db
    .delete(schema.steps)
    .where(
      and(
        eq(schema.steps.userId, user.id),
        eq(schema.steps.roadmapId, roadmapId),
        notInArray(schema.steps.id, keepStepIds)
      )
    );
}

async function updateSteps(
  user: User,
  roadmapId: string,
  inputSteps: StepInput[]
) {
  const stepIdMap: Record<string, number> = {};

  // 新規のステップをDB登録（親ステップIDは仮IDの場合があるのでここでは登録しない）
  for (const newInputStep of inputSteps.filter((step: StepInput) => step.new)) {
    const returning = await db
      .insert(schema.steps)
      .values({
        roadmapId: roadmapId,
        userId: user.id,
        title: newInputStep.values.title,
        note: newInputStep.values.note,
        allGoalsRequired: newInputStep.values.allGoalsRequired === "true",
        parentIds: [],
      })
      .returning({ id: schema.steps.id });
    // 発行されたステップIDを保存
    stepIdMap[newInputStep.id] = returning[0].id;
  }

  for (const inputStep of inputSteps) {
    const stepId = inputStep.new
      ? stepIdMap[inputStep.id]
      : Number(inputStep.id);
    const parentIds = inputStep.parentIds.map(
      (id: string) => stepIdMap[id] ?? id
    );

    // DBのステップを取得
    const [step] = await db
      .select()
      .from(schema.steps)
      .where(
        and(eq(schema.steps.userId, user.id), eq(schema.steps.id, stepId))
      );

    // 違いがあればDB更新
    if (
      step.title != inputStep.values.title ||
      step.note != inputStep.values.note ||
      step.allGoalsRequired != (inputStep.values.allGoalsRequired === "true") ||
      step.parentIds.length !== inputStep.parentIds.length ||
      !step.parentIds.every((val, i) => String(val) === inputStep.parentIds[i])
    ) {
      await db
        .update(schema.steps)
        .set({
          title: inputStep.values.title,
          note: inputStep.values.note,
          allGoalsRequired: inputStep.values.allGoalsRequired === "true",
          parentIds: parentIds,
        })
        .where(
          and(eq(schema.steps.userId, user.id), eq(schema.steps.id, stepId))
        );
    }

    // ゴールを更新
    await updateGoals(user, roadmapId, Number(stepId), inputStep.values.goals);
  }
}

async function updateGoals(
  user: User,
  roadmapId: string,
  stepId: number,
  inputGoals: any
) {
  for (const inputGoal of inputGoals) {
    if (inputGoal.id) {
      // DBのゴールを取得
      const [goal] = await db
        .select()
        .from(schema.stepGoals)
        .where(
          and(
            eq(schema.stepGoals.userId, user.id),
            eq(schema.stepGoals.id, Number(inputGoal.id))
          )
        );
      // 違いがあればDB更新
      if (
        goal.title != inputGoal.title ||
        goal.type != Number(inputGoal.type)
      ) {
        await db
          .update(schema.stepGoals)
          .set({ title: inputGoal.title, type: Number(inputGoal.type) })
          .where(
            and(
              eq(schema.stepGoals.userId, user.id),
              eq(schema.stepGoals.id, Number(inputGoal.id))
            )
          );
      }
    } else {
      // 新規のゴールをDB登録
      const [returning] = await db
        .insert(schema.stepGoals)
        .values({
          roadmapId: roadmapId,
          userId: user.id,
          stepId: stepId,
          title: inputGoal.title,
          type: Number(inputGoal.type),
        })
        .returning({ id: schema.stepGoals.id });
      await db.insert(schema.stepGoalStates).values({
        id: returning.id,
        userId: user.id,
        roadmapId: roadmapId,
        stepId: stepId,
        isAchieved: false,
      });
    }
  }
}

export async function deleteRoadmap(id: string) {
  try {
    const user = await getUserData();

    await db.transaction(async (tx) => {
      const associatedSteps = await db
        .select({ id: schema.steps.id })
        .from(schema.steps)
        .where(
          and(eq(schema.steps.userId, user.id), eq(schema.steps.roadmapId, id))
        );
      const stepIds = associatedSteps.map((step) => step.id.toString());

      let stepGoalIds: string[] = [];
      if (stepIds.length > 0) {
        const associatedStepGoals = await db
          .select({ id: schema.stepGoals.id })
          .from(schema.stepGoals)
          .where(inArray(schema.stepGoals.stepId, stepIds.map(Number)));
        stepGoalIds = associatedStepGoals.map((stepGoal) =>
          stepGoal.id.toString()
        );
      }

      if (stepGoalIds.length > 0) {
        await db
          .delete(schema.activities)
          .where(
            inArray(schema.activities.stepGoalId, stepGoalIds.map(Number))
          );
      }

      if (stepIds.length > 0) {
        await db
          .delete(schema.stepGoalStates)
          .where(inArray(schema.stepGoalStates.stepId, stepIds.map(Number)));
        await db
          .delete(schema.stepGoals)
          .where(inArray(schema.stepGoals.stepId, stepIds.map(Number)));
      }

      await db
        .delete(schema.steps)
        .where(
          and(eq(schema.steps.userId, user.id), eq(schema.steps.roadmapId, id))
        );

      await db
        .delete(schema.roadmaps)
        .where(
          and(eq(schema.roadmaps.userId, user.id), eq(schema.roadmaps.id, id))
        );
    });

    revalidatePath("/roadmaps");

    return { ok: true };
  } catch (error: any) {
    console.log(error);
    return { ok: false, error };
  }
}

export async function getGoal(id: number) {
  try {
    const user = await getUserData();

    const [target] = await db
      .select({
        goalTitle: schema.stepGoals.title,
        goalType: schema.stepGoals.type,
        stepTitle: schema.steps.title,
        roadmapTitle: schema.roadmaps.title,
      })
      .from(schema.stepGoals)
      .innerJoin(schema.steps, eq(schema.stepGoals.stepId, schema.steps.id))
      .innerJoin(
        schema.roadmaps,
        eq(schema.stepGoals.roadmapId, schema.roadmaps.id)
      )
      .where(
        and(eq(schema.stepGoals.id, id), eq(schema.stepGoals.userId, user.id))
      );

    return { ok: true, data: target };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function updateAchived(goalId: number, isAchieved: boolean) {
  try {
    const user = await getUserData();

    await db
      .update(schema.stepGoalStates)
      .set({
        isAchieved,
      })
      .where(
        and(
          eq(schema.stepGoalStates.id, goalId),
          eq(schema.stepGoalStates.userId, user.id)
        )
      );
    return { ok: true };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}
