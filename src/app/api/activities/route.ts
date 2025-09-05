import { NextResponse, NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq, and, count, desc } from "drizzle-orm";
import type { ActivityListItem } from "@/types/api";
import { getUserData } from "@/lib/supabase-auth/user";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const roadmapId = searchParams.get("roadmap_id");
  const page = Number(searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const user = await getUserData();

    const conditions1 = [];
    conditions1.push(eq(schema.activities.userId, user.id));
    if (roadmapId) {
      conditions1.push(eq(schema.activities.roadmapId, roadmapId));
    }

    const [total] = await db
      .select({ count: count() })
      .from(schema.activities)
      .where(and(...conditions1));

    const activities: ActivityListItem[] = await db
      .select({
        id: schema.activities.publicId,
        activityDate: schema.activities.actDate,
        activityContent: schema.activities.actContents,
        activityCount: schema.activities.actCount,
        activityMinutes: schema.activities.actMinutes,
        goalTitle: schema.stepGoals.title,
        stepTitle: schema.steps.title,
        roadmapTitle: schema.roadmaps.title,
      })
      .from(schema.activities)
      .innerJoin(
        schema.stepGoals,
        eq(schema.activities.stepGoalId, schema.stepGoals.id)
      )
      .innerJoin(schema.steps, eq(schema.stepGoals.stepId, schema.steps.id))
      .innerJoin(
        schema.roadmaps,
        eq(schema.steps.roadmapId, schema.roadmaps.id)
      )
      .where(and(...conditions1))
      .orderBy(
        desc(schema.activities.actDate),
        desc(schema.activities.updatedAt)
      )
      .offset(offset)
      .limit(limit);

    return NextResponse.json(
      { activities, totalPages: Math.ceil(total.count / limit) },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to get activities: " + error.message },
      { status: 500 }
    );
  }
}
