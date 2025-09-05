"use client";

import { Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
} from "@/components/ui";
import type { RoadmapSummaryListItem } from "@/types/api";
import type { SessionSettings } from "@/types/session-settings";

export function RoadmapSummaryList({
  roadmaps,
  actdays,
  settings,
}: {
  roadmaps: RoadmapSummaryListItem[];
  actdays: string | null;
  settings: SessionSettings;
}) {
  const router = useRouter();
  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((roadmap: RoadmapSummaryListItem) => (
          <Card
            key={roadmap.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={(e) => router.push(`/roadmaps/${roadmap.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="space-y-2">
                {settings && settings.categories.length > 0 && (
                  <Badge
                    className={`bg-gray-100 text-gray-800 hover:bg-gray-100 text-gray-800 text-xs w-fit`}
                  >
                    {settings.categories[roadmap.categoryId] ?? "不明"}
                  </Badge>
                )}
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {roadmap.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ステップ進捗 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>ステップ進捗</span>
                  <span className="font-medium">
                    {roadmap.achievedSteps}/{roadmap.totalSteps}
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(
                    roadmap.achievedSteps,
                    roadmap.totalSteps
                  )}
                  className="h-2"
                />
              </div>

              {/* 活動記録数 */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">活動記録数</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {roadmap.totalActivities}
                </span>
              </div>

              {/* アクティビティグラフ */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>直近{actdays}日間の活動</span>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={roadmap.dailyActivities}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                        width={20}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                        labelFormatter={(label) => `${label}`}
                        formatter={(value) => [`${value}件`, "活動数"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
