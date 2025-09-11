import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getUserData } from "@/lib/supabase-auth/user";

export async function GET() {
  try {
    const user = await getUserData();

    const roadmaps = await db
      .select()
      .from(schema.roadmaps)
      .orderBy(schema.roadmaps.createdAt)
      .where(eq(schema.roadmaps.userId, user.id));

    return NextResponse.json(roadmaps, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to get roadmap: " + error.message },
      { status: 500 }
    );
  }
}
