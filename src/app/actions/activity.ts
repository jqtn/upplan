"use server";

import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { getUserData } from "@/lib/supabase-auth/user";
import { formSchema, FormValues } from "@/lib/validations/activity";
import { ActivityType } from "@/constants/activity-type";

export async function getActivity(publicId: string) {
  try {
    const user = await getUserData();

    const [activity] = await db
      .select({
        actDate: schema.activities.actDate,
        actContents: schema.activities.actContents,
        actCount: schema.activities.actCount,
        actMinutes: schema.activities.actMinutes,
        goalId: schema.activities.stepGoalId,
      })
      .from(schema.activities)
      .where(
        and(
          eq(schema.activities.userId, user.id),
          eq(schema.activities.publicId, publicId)
        )
      );

    if (activity) {
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
          and(
            eq(schema.stepGoals.userId, user.id),
            eq(schema.stepGoals.id, activity.goalId)
          )
        );

      if (target) {
        return { ok: true, data: { ...activity, ...target } };
      }
    }

    return { ok: true, data: null };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function createActivity(
  goalId: number,
  activityType: ActivityType,
  data:
    | FormValues[ActivityType.GENERAL]
    | FormValues[ActivityType.COUNT]
    | FormValues[ActivityType.DURATION]
) {
  const parsed = formSchema[activityType].safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  try {
    const user = await getUserData();

    const [goal] = await db
      .select()
      .from(schema.stepGoals)
      .where(eq(schema.stepGoals.id, goalId));

    if (!goal) {
      throw new Error("goal not found");
    }

    const record = convertFormToDBrecord(data);
    const meta = {
      roadmapId: goal.roadmapId,
      userId: user.id,
      stepGoalId: goalId,
    };

    await db.insert(schema.activities).values({ ...meta, ...record });

    return { ok: true };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function updateActivity(
  publicId: string,
  activityType: ActivityType,
  data:
    | FormValues[ActivityType.GENERAL]
    | FormValues[ActivityType.COUNT]
    | FormValues[ActivityType.DURATION]
) {
  const parsed = formSchema[activityType].safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  try {
    const user = await getUserData();

    await db
      .update(schema.activities)
      .set(convertFormToDBrecord(data))
      .where(
        and(
          eq(schema.activities.userId, user.id),
          eq(schema.activities.publicId, publicId)
        )
      );

    return { ok: true };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

export async function deleteActivity(publicId: string) {
  try {
    const user = await getUserData();

    await db
      .delete(schema.activities)
      .where(
        and(
          eq(schema.activities.userId, user.id),
          eq(schema.activities.publicId, publicId)
        )
      );

    return { ok: true };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}

function convertFormToDBrecord(
  data:
    | FormValues[ActivityType.GENERAL]
    | FormValues[ActivityType.COUNT]
    | FormValues[ActivityType.DURATION]
) {
  const record = {
    actDate: data.date,
    actContents: data.remarks,
    actCount: null as null | number,
    actMinutes: null as null | number,
  };

  if ("count" in data) {
    record.actCount =
      data.count && Number(data.count) > 0 ? Number(data.count) : null;
  }

  if ("hours" in data && "minutes" in data) {
    const totalMinutes = (data.hours || 0) * 60 + (data.minutes || 0);
    record.actMinutes = totalMinutes > 0 ? totalMinutes : null;
  }

  return record;
}
