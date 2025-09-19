"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "@/components/ui";
import type { ActivityListItem } from "@/types/api";
import { useAlertDialog } from "@/stores/alert-dialog";

export default function ActivityListItemShort({
  activities,
  handleDelete,
}: {
  activities: ActivityListItem[];
  handleDelete: (activityId: string) => Promise<void>;
}) {
  const router = useRouter();
  const { openDialog } = useAlertDialog();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[100px]">日時</TableHead>
          <TableHead className="max-w-[200px]">ステップ</TableHead>
          <TableHead>活動内容</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity: ActivityListItem) => (
          <TableRow key={activity.id}>
            <TableCell>{activity.activityDate}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {activity.stepTitle}
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[200px] truncate">
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
              {activity.activityContent}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/activities/${activity.id}/edit`)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  編集
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-destructive hover:text-destructive bg-transparent cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    openDialog({
                      title: "本当に削除しますか？",
                      description: "この操作は取り消せません。",
                      onConfirm: () => handleDelete(activity.id),
                      onCancel: () => {},
                    });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  削除
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
