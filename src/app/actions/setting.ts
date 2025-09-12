"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getUserData } from "@/lib/supabase-auth/user";
import { formSchema, FormValues } from "@/lib/validations/settings";

const defaultSettings: schema.Setting = {
  userId: "",
  categories: [],
  stepProgressType: 0,
  activitySummaryDays: 7,
  theme: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getSettings(): Promise<{
  ok: boolean;
  data?: schema.Setting;
  error?: any;
}> {
  try {
    const user = await getUserData();

    const [userSettings] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.userId, user.id));
    return { ok: true, data: userSettings ?? defaultSettings };
  } catch (error: any) {
    return { ok: true, data: defaultSettings };
  }
}

export async function updateSettings(
  data: FormValues
): Promise<{ ok: boolean; error?: any }> {
  const parsed = formSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  try {
    const user = await getUserData();

    const settingsData = {
      userId: user.id,
      activitySummaryDays: data.activitySummaryDays,
      stepProgressType: Number(data.stepProgressType),
      categories: data.categories.map((category) => category.name),
      theme: data.theme,
    };

    await db.insert(schema.settings).values(settingsData).onConflictDoUpdate({
      target: schema.settings.userId,
      set: settingsData,
    });

    return { ok: true };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}
