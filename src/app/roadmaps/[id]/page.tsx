"use client";

import { useState, use, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  Clock,
  Plus,
  FileText,
  RotateCw,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Loading, LoadError, LoadNoData } from "@/components/load";
import type { StepWithGoals } from "@/types/api";
import { ActivityType } from "@/constants/activity-type";
import { getDetailedRoadmap } from "@/app/actions/roadmap";
import { updateAchived } from "@/app/actions/roadmap";

export default function RoadmapDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [achievedGoalIds, setAchivedGoalIds] = useState<number[]>([]);
  const [isPending, setTransition] = useTransition();
  const [isError, setIsError] = useState(false);
  const [roadmap, setRoadmap] = useState<any>();
  const router = useRouter();

  useEffect(() => {
    setTransition(async () => {
      const result = await getDetailedRoadmap(id);
      if (result.ok) {
        setRoadmap(result.data);
        setAchivedGoalIds(result.data?.achievedGoalIds || []);
      } else {
        setIsError(true);
      }
    });
  }, [id]);

  const getStepStatus = (step: StepWithGoals) => {
    const achievedGoals = step.goals?.filter((goal) =>
      achievedGoalIds?.includes(goal.id)
    ).length;
    const totalGoals = step.goals?.length;

    if (step.allGoalsRequired) {
      return achievedGoals === totalGoals ? "達成" : "未達成";
    } else {
      return achievedGoals ?? 0 > 0 ? "達成" : "未達成";
    }
  };

  const toggleGoalStatus = async (stepId: string, goalId: number) => {
    const isAchived = achievedGoalIds.includes(goalId);
    const result = await updateAchived(goalId, !isAchived);
    if (result.ok) {
      setAchivedGoalIds((values) => {
        return isAchived
          ? values.filter((value) => value != goalId)
          : [...values, goalId];
      });
    }
  };

  if (isPending) {
    return <Loading />;
  } else if (isError) {
    return <LoadError />;
  } else if (!roadmap) {
    return <LoadNoData />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">{roadmap.roadmap.title}</h1>
        <p className="text-muted-foreground">{roadmap.roadmap.note}</p>
      </div>

      <div className="space-y-4">
        {roadmap.steps.map((step: StepWithGoals, index: number) => {
          const stepStatus = getStepStatus(step);

          return (
            <Card
              key={step.id}
              className={
                stepStatus === "達成" ? "w-full bg-gray-200" : "w-full"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <Badge
                        variant={stepStatus === "達成" ? "default" : "outline"}
                      >
                        {stepStatus}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground ml-11">{step.note}</p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/activities/new?step_id=${step.id}`)
                    }
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    活動記録
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {step.goals && step.goals.length > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">ステップ達成の条件:</span>
                    <Badge variant="outline">
                      {step.allGoalsRequired
                        ? "全てのゴールを達成"
                        : "いずれかのゴールを達成"}
                    </Badge>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="grid gap-3">
                    {step.goals &&
                      step.goals.map((goal) => (
                        <div
                          key={goal.id}
                          className={
                            achievedGoalIds.includes(goal.id)
                              ? "p-4 rounded-lg border space-y-3 bg-gray-300"
                              : "p-4 rounded-lg border space-y-3 bg-card"
                          }
                        >
                          <div className="flex items-center gap-3">
                            {achievedGoalIds.includes(goal.id) ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={`flex-1 font-medium}`}>
                              {goal.title}
                            </span>
                            <Button
                              variant={
                                achievedGoalIds.includes(goal.id)
                                  ? "ghost"
                                  : "outline"
                              }
                              size="sm"
                              className={
                                achievedGoalIds.includes(goal.id)
                                  ? "h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                  : "h-7 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
                              }
                              onClick={() =>
                                toggleGoalStatus(String(step.id), goal.id)
                              }
                            >
                              {achievedGoalIds.includes(goal.id) ? (
                                <div>未達成に戻す</div>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  達成
                                </>
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between gap-4 pl-8">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>
                                  活動記録数{" "}
                                  {roadmap.activitiesCountMap[goal.id] ?? 0}件
                                </span>
                              </div>
                              {step.type == ActivityType.COUNT && (
                                <div className="flex items-center gap-1">
                                  <RotateCw className="h-4 w-4" />
                                  <span>
                                    合計
                                    {roadmap.activityCountSumMap[goal.id] ?? 0}
                                    回
                                  </span>
                                </div>
                              )}
                              {step.type == ActivityType.DURATION && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    合計
                                    {roadmap.activityMinutesSumMap[goal.id] ??
                                      0}
                                    分
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        継続的に活動して目標を達成しましょう！
      </div>
    </div>
  );
}
