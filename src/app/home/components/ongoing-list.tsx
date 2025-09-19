"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, PlusCircle } from "lucide-react";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import type { OngoingListItem } from "@/types/api";
import type { SessionSettings } from "@/types/session-settings";

export function OngoingList({
  items,
  settings,
}: {
  items: OngoingListItem[];
  settings: SessionSettings;
}) {
  const router = useRouter();
  const [list, setList] = useState(items);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {list.map((item) => (
        <Card
          key={item.stepId}
          className="hover:shadow-md transition-shadow flex flex-col"
        >
          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1 mr-2">
                {settings.categories && settings.categories.length > 0 && (
                  <Badge variant="secondary" className="text-xs w-fit">
                    {settings.categories[item.roadmapCategoryId] ?? "不明"}
                  </Badge>
                )}
                <div>
                  <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                    {item.roadmapTitle}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 mt-3">
              <div className="flex items-start gap-2 h-8">
                <MapPin className="h-4 w-4" />
                <p className="text-sm line-clamp-2 flex-1">{item.stepTitle}</p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/activities/new?step_id=${item.stepId}`)
                  }
                  className="w-full text-sm h-9 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  活動記録
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
