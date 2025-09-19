"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Calendar, FileText, MapPin } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import type { ActivityListItem } from "@/types/api";
import { useAlertDialog } from "@/stores/alert-dialog";

export default function ActivityListItemFull({
  activities,
  handleDelete,
}: {
  activities: ActivityListItem[];
  handleDelete: (activityId: string) => Promise<void>;
}) {
  const router = useRouter();
  const { openDialog } = useAlertDialog();
  return (
    <div className="space-y-4">
      {activities.map((activity: ActivityListItem) => (
        <Card key={activity.id} className="w-full">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-lg md:text-xl">
                  {activity.roadmapTitle}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                <Calendar className="h-4 w-4" />
                {activity.activityDate}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{activity.stepTitle}</p>
              </div>

              {/* 活動内容の表示部分を以下に更新: */}
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      活動内容
                    </p>
                    {activity.activityMinutes && (
                      <Badge variant="outline" className="text-xs">
                        {activity.activityMinutes}分
                      </Badge>
                    )}
                    {activity.activityCount && (
                      <Badge variant="outline" className="text-xs">
                        {activity.activityCount}回
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {activity.activityContent}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/activities/${activity.id}/edit`)}
                className="flex-1 hover:cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-1" />
                編集
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  openDialog({
                    title: "本当に削除しますか？",
                    description: "この操作は取り消せません。",
                    onConfirm: () => handleDelete(activity.id),
                    onCancel: () => {},
                  });
                }}
                className="flex-1 text-destructive hover:text-destructive hover:cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
