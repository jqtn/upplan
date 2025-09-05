"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui";
import { LoadError, Loading, LoadNoData } from "@/components/load";
import { PaginationControls } from "@/components/pagination";
import ActivityListItemShort from "./components/activity-list-item-short";
import ActivityListItemFull from "./components/activity-list-item-full";
import { fetcher } from "@/lib/fetcher";
import type { ActivityListItem } from "@/types/api";
import { schema } from "@/db";
import { deleteActivity } from "@/app/actions/activity";
import { useDesktopBreakpoint } from "@/hooks/use-desktop-breakpoint";

export default function ActivityListWrapper() {
  return (
    <Suspense>
      <ActivityList />
    </Suspense>
  );
}

function ActivityList() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const roadmapId = searchParams.get("roadmap_id");
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const isDesktop = useDesktopBreakpoint();

  const {
    data: dataRoadmaps,
    error: errorRoadmaps,
    isLoading: isLoadingRoadmaps,
  } = useSWR(`/api/roadmaps`, fetcher);

  const oneRoadmapId =
    dataRoadmaps && dataRoadmaps.length == 1 ? dataRoadmaps[0].id : null;

  const params = new URLSearchParams({
    page,
    ...(roadmapId && { roadmap_id: roadmapId }),
  });

  const {
    data: dataActivities,
    error: errorActivities,
    isLoading: isLoadingActivities,
  } = useSWR(`/api/activities?${params}`, fetcher);

  useEffect(() => {
    if (dataActivities) {
      setActivities(dataActivities.activities);
      setTotalPages(dataActivities.totalPages);
    }
  }, [dataActivities]);

  const handleDelete = async (activityId: string) => {
    if (activityId) {
      const result = await deleteActivity(activityId);
      if (result.ok) {
        setActivities(
          activities.filter(
            (activity: ActivityListItem) => activity.id !== activityId
          )
        );
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">活動記録一覧</h1>
        {isLoadingRoadmaps ? (
          <></>
        ) : errorRoadmaps ? (
          <LoadError />
        ) : (
          <Select
            onValueChange={(value) => {
              const params = new URLSearchParams();
              if (value == "all") {
                params.delete("roadmap_id");
              } else {
                params.set("roadmap_id", value);
              }
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
            value={roadmapId || oneRoadmapId || ""}
          >
            <SelectTrigger className="w-75" id="roadmap-filter">
              <SelectValue placeholder="ロードマップを選択" />
            </SelectTrigger>
            <SelectContent>
              {!oneRoadmapId && <SelectItem value="all">すべて</SelectItem>}
              {dataRoadmaps.map((item: schema.Roadmap) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {isLoadingActivities ? (
        <Loading />
      ) : errorActivities ? (
        <LoadError />
      ) : activities.length == 0 ? (
        <LoadNoData />
      ) : isDesktop && (roadmapId || oneRoadmapId) ? (
        <>
          <ActivityListItemShort
            activities={activities}
            handleDelete={handleDelete}
          />
          <PaginationControls
            currentPage={Number(page)}
            totalPages={totalPages}
          />
        </>
      ) : (
        <>
          <ActivityListItemFull
            activities={activities}
            handleDelete={handleDelete}
          />
          <PaginationControls
            currentPage={Number(page)}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
