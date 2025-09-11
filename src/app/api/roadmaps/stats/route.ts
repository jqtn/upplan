import { NextResponse, NextRequest } from "next/server";
import { db, schema } from "@/db";
import { sql, eq } from "drizzle-orm";
import type { RoadmapSummaryListItem } from "@/types/api";
import { getUserData } from "@/lib/supabase-auth/user";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const actdays = searchParams.get("actdays") ?? "1";

  try {
    const user = await getUserData();

    const roadmaps = await db
      .select()
      .from(schema.roadmaps)
      .orderBy(schema.roadmaps.createdAt)
      .where(eq(schema.roadmaps.userId, user.id));

    const totalSteps = await getTotalStepCount(user.id);
    const totalActivities = await getTotalActivityCount(user.id);
    const achievedSteps = await getAchievedStepCount(user.id);
    const dailyActivities = await getDailyActivityCount(
      user.id,
      actdays,
      roadmaps.map((roadmap) => roadmap.id)
    );

    const roadmapsWithStats = roadmaps.map((roadmap) => {
      const row: RoadmapSummaryListItem = {
        ...roadmap,
        totalSteps: Number(totalSteps.get(roadmap.id) ?? 0),
        achievedSteps: Number(achievedSteps.get(roadmap.id) ?? 0),
        totalActivities: Number(totalActivities.get(roadmap.id) ?? 0),
        dailyActivities: dailyActivities.get(roadmap.id) ?? [],
      };
      return row;
    });

    return NextResponse.json(roadmapsWithStats, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to get roadmap: " + error.message },
      { status: 500 }
    );
  }
}

async function getTotalStepCount(userId: string) {
  const counts = await db.execute(
    sql`SELECT roadmap_id as id, COUNT(*) as count FROM ${schema.steps} WHERE ${schema.steps.userId}=${userId} GROUP BY roadmap_id`
  );
  return new Map(counts.map((item) => [item.id, item.count]));
}

async function getTotalActivityCount(userId: string) {
  const counts = await db.execute(
    sql`SELECT roadmap_id as id, COUNT(*) as count FROM ${schema.activities} WHERE ${schema.activities.userId}=${userId} GROUP BY roadmap_id`
  );
  return new Map(counts.map((item) => [item.id, item.count]));
}

async function getAchievedStepCount(userId: string) {
  const counts = await db.execute(
    sql`
      SELECT roadmap_id as id, COUNT(*) AS count
      FROM ${schema.steps} s
      WHERE s.user_id=${userId}
        AND
        (
          s.all_goals_required = true AND 
          NOT EXISTS (
              SELECT 1
              FROM ${schema.stepGoalStates} sgs
              WHERE sgs.step_id = s.id AND sgs.is_achieved = false
          )
        ) OR (
          s.all_goals_required = false AND 
          EXISTS (
              SELECT 1
              FROM ${schema.stepGoalStates} sgs
              WHERE sgs.step_id = s.id AND sgs.is_achieved = true
          )
        )
      GROUP BY roadmap_id;
    `
  );
  return new Map(counts.map((item) => [item.id, item.count]));
}

async function getDailyActivityCount(
  userId: string,
  activityDays: string,
  roadmapIds: string[]
) {
  // 指定期間の活動数を一日ごとにカウントする
  const dailyActivityCounts = await db.execute(
    sql`
      SELECT id, act_date as date, COUNT(*) AS count
      FROM (
        SELECT roadmap_id as id, act_date
        FROM ${schema.activities} a
        WHERE a.user_id=${userId}
          AND
          a.act_date >= CURRENT_DATE - INTERVAL '${sql.raw(activityDays)} days'
      ) sub
      GROUP BY id, act_date;
    `
  );

  const dailyActivityCountMap = new Map();
  dailyActivityCounts.forEach(({ id, date, count }) => {
    if (!dailyActivityCountMap.has(id)) {
      dailyActivityCountMap.set(id, {});
    }
    dailyActivityCountMap.get(id)[String(date)] = Number(count);
  });

  // 指定期間の１日ごとの日付を作成
  const currentDate = new Date();
  const days = [...Array(Number(activityDays))]
    .map(() => {
      const year = String(currentDate.getFullYear());
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      currentDate.setDate(currentDate.getDate() - 1);
      return { db: `${year}-${month}-${day}`, display: `${month}/${day}` };
    })
    .reverse();

  // ロードマップ、日付ごとに活動数をセットして返す
  const returnValue = new Map();
  roadmapIds.forEach((roadmapId) => {
    returnValue.set(roadmapId, []);
    days.forEach((day) => {
      const record = dailyActivityCountMap.has(roadmapId)
        ? dailyActivityCountMap.get(roadmapId)
        : {};
      returnValue
        .get(roadmapId)
        .push({ date: day.display, count: record[day.db] ?? 0 });
    });
  });

  return returnValue;
}
