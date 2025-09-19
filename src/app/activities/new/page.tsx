"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loading, LoadError } from "@/components/load";
import ActivityFormGeneral from "../components/activity-form-general";
import ActivityFormCount from "../components/activity-form-count";
import ActivityFormDuration from "../components/activity-form-duration";
import { getStep } from "@/app/actions/roadmap";
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
  const id = searchParams.get("step_id");
  const router = useRouter();
  const [isPending, setTransition] = useTransition();
  const [isError, setIsError] = useState(false);
  const [step, setStep] = useState<any>();

  useEffect(() => {
    setTransition(async () => {
      const result = await getStep(Number(id));
      if (result.ok && result.data) {
        setStep(result.data);
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
    return await createActivity(Number(id), step.activityType, data);
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
      ) : !step || isError ? (
        <LoadError />
      ) : step.activityType == ActivityType.GENERAL ? (
        <ActivityFormGeneral
          onSubmit={onSubmit}
          onComplete={onNext}
          onCancel={onNext}
          stepTitle={step.stepTitle}
          roadmapTitle={step.roadmapTitle}
        />
      ) : step.activityType == ActivityType.COUNT ? (
        <ActivityFormCount
          onSubmit={onSubmit}
          onComplete={onNext}
          onCancel={onNext}
          stepTitle={step.stepTitle}
          roadmapTitle={step.roadmapTitle}
        />
      ) : step.activityType == ActivityType.DURATION ? (
        <ActivityFormDuration
          onSubmit={onSubmit}
          onComplete={onNext}
          onCancel={onNext}
          stepTitle={step.stepTitle}
          roadmapTitle={step.roadmapTitle}
        />
      ) : (
        <LoadError />
      )}
    </main>
  );
}
