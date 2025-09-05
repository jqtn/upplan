"use client";

import { use, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loading, LoadNoData, LoadError } from "@/components/load";
import ActivityFormCount from "../../components/activity-form-count";
import ActivityFormGeneral from "../../components/activity-form-general";
import ActivityFormDuration from "../../components/activity-form-duration";
import { getActivity, updateActivity } from "@/app/actions/activity";
import { FormValues } from "@/lib/validations/activity";
import { ActivityType } from "@/constants/activity-type";

export default function EditActivity({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isPending, setTransition] = useTransition();
  const [isError, setIsError] = useState(false);
  const [activity, setActivity] = useState<any>();

  useEffect(() => {
    setTransition(async () => {
      const activity = await getActivity(id);
      if (activity.ok) {
        setActivity(activity.data);
      } else {
        setIsError(true);
      }
    });
  }, [id]);

  // フォーム送信時の処理
  async function onSubmit(
    data:
      | FormValues[ActivityType.GENERAL]
      | FormValues[ActivityType.COUNT]
      | FormValues[ActivityType.DURATION]
  ) {
    return await updateActivity(id, activity.goalType, data);
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">活動記録の編集</h1>
      {isPending ? (
        <Loading />
      ) : isError ? (
        <LoadError />
      ) : !activity ? (
        <LoadNoData />
      ) : activity.goalType == ActivityType.GENERAL ? (
        <ActivityFormGeneral
          onSubmit={onSubmit}
          onComplete={() => router.push("/activities")}
          onCancel={() => router.push("/activities")}
          goalTitle={activity.goalTitle}
          stepTitle={activity.stepTitle}
          roadmapTitle={activity.roadmapTitle}
          date={activity.actDate}
          content={activity.actContent}
        />
      ) : activity.goalType == ActivityType.COUNT ? (
        <ActivityFormCount
          onSubmit={onSubmit}
          onComplete={() => router.push("/activities")}
          onCancel={() => router.push("/activities")}
          goalTitle={activity.goalTitle}
          stepTitle={activity.stepTitle}
          roadmapTitle={activity.roadmapTitle}
          date={activity.actDate}
          content={activity.actContent}
          count={activity.actCount}
        />
      ) : activity.goalType == ActivityType.DURATION ? (
        <ActivityFormDuration
          onSubmit={onSubmit}
          onComplete={() => router.push("/activities")}
          onCancel={() => router.push("/activities")}
          goalTitle={activity.goalTitle}
          stepTitle={activity.stepTitle}
          roadmapTitle={activity.roadmapTitle}
          date={activity.actDate}
          content={activity.actContent}
          minutes={activity.actMinutes}
        />
      ) : (
        <LoadError />
      )}
    </main>
  );
}
