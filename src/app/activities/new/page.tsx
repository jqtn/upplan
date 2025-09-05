"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loading, LoadError } from "@/components/load";
import ActivityFormGeneral from "../components/activity-form-general";
import ActivityFormCount from "../components/activity-form-count";
import ActivityFormDuration from "../components/activity-form-duration";
import { getGoal } from "@/app/actions/roadmap";
import { createActivity } from "@/app/actions/activity";
import { FormValues } from "@/lib/validations/activity";
import { ActivityType } from "@/constants/activity-type";

export default function CreateNewActivityWrapper() {
  return (
    <Suspense>
      <CreateNewActivity />
    </Suspense>
  );
}

function CreateNewActivity() {
  const searchParams = useSearchParams();
  const id = searchParams.get("goal_id");
  const router = useRouter();
  const [isPending, setTransition] = useTransition();
  const [isError, setIsError] = useState(false);
  const [goal, setGoal] = useState<any>();

  useEffect(() => {
    setTransition(async () => {
      const result = await getGoal(Number(id));
      if (result.ok && result.data) {
        setGoal(result.data);
      } else {
        setIsError(true);
      }
    });
  }, [id]);

  async function onSubmit(
    data:
      | FormValues[ActivityType.GENERAL]
      | FormValues[ActivityType.COUNT]
      | FormValues[ActivityType.DURATION]
  ) {
    return await createActivity(Number(id), goal.goalType, data);
  }

  function onNext() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">活動記録の追加</h1>
      {isPending ? (
        <Loading />
      ) : !goal || isError ? (
        <LoadError />
      ) : goal.goalType == ActivityType.GENERAL ? (
        <ActivityFormGeneral
          onSubmit={onSubmit}
          onComplete={onNext}
          onCancel={onNext}
          goalTitle={goal.goalTitle}
          stepTitle={goal.stepTitle}
          roadmapTitle={goal.roadmapTitle}
        />
      ) : goal.goalType == ActivityType.COUNT ? (
        <ActivityFormCount
          onSubmit={onSubmit}
          onComplete={onNext}
          onCancel={onNext}
          goalTitle={goal.goalTitle}
          stepTitle={goal.stepTitle}
          roadmapTitle={goal.roadmapTitle}
        />
      ) : goal.goalType == ActivityType.DURATION ? (
        <ActivityFormDuration
          onSubmit={onSubmit}
          onComplete={onNext}
          onCancel={onNext}
          goalTitle={goal.goalTitle}
          stepTitle={goal.stepTitle}
          roadmapTitle={goal.roadmapTitle}
        />
      ) : (
        <LoadError />
      )}
    </main>
  );
}
