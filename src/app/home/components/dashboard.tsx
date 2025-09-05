"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Loading, LoadError, LoadNoData } from "@/components/load";
import { Startup } from "./startup";
import { OngoingList } from "./ongoing-list";
import { RoadmapSummaryList } from "./roadmap-summary-list";
import { useSessionSettings } from "@/contexts/session-settings-context";

export function Dashboard() {
  const { sessionSettings } = useSessionSettings();

  const {
    data: dataOngoing,
    error: errorOngoing,
    isLoading: isLoadingOngoing,
  } = useSWR(
    sessionSettings
      ? `/api/roadmaps/ongoing-steps?type=${sessionSettings.stepProgressType}`
      : null,
    fetcher
  );

  const {
    data: dataRoadmap,
    error: errorRoadmap,
    isLoading: isLoadingRoadmap,
  } = useSWR(
    sessionSettings
      ? `/api/roadmaps/stats?actdays=${sessionSettings.activitySummaryDays}`
      : null,
    fetcher
  );

  if (dataRoadmap && dataRoadmap.length == 0) {
    return <Startup />;
  }

  return (
    <main className="min-h-screen p-6 md:p-6">
      <h1 className="text-2xl font-bold mb-6">現在進行中のステップ</h1>
      {errorOngoing ? (
        <LoadError />
      ) : isLoadingOngoing || dataOngoing == null || sessionSettings == null ? (
        <Loading />
      ) : dataOngoing.goals.length === 0 ? (
        <LoadNoData />
      ) : (
        <OngoingList items={dataOngoing.goals} settings={sessionSettings} />
      )}
      <h1 className="text-2xl font-bold mb-6 mt-8">ロードマップのサマリー</h1>
      {errorRoadmap ? (
        <LoadError />
      ) : isLoadingRoadmap || dataRoadmap == null || sessionSettings == null ? (
        <Loading />
      ) : dataRoadmap.length === 0 ? (
        <LoadNoData />
      ) : (
        <RoadmapSummaryList
          roadmaps={dataRoadmap}
          actdays={String(sessionSettings.activitySummaryDays)}
          settings={sessionSettings}
        />
      )}
    </main>
  );
}
