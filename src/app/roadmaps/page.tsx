import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { LoadError, LoadNoData } from "@/components/load";
import { RoadmapListItem } from "./components/roadmap-list-item";
import { getRoadmaps } from "@/app/actions/roadmap";

export default async function RoadmapList() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">ロードマップ</h1>
          <p className="text-muted-foreground mt-1">
            登録済みのロードマップを管理できます
          </p>
        </div>
        <div className="flex gap-2 cursor-pointer">
          <Link href="/roadmaps/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新規ロードマップ作成
            </Button>
          </Link>
        </div>
      </div>

      {!roadmaps.ok ? (
        <LoadError />
      ) : !roadmaps.data || roadmaps.data.length == 0 ? (
        <LoadNoData />
      ) : (
        <RoadmapListItem roadmaps={roadmaps.data} />
      )}
    </div>
  );
}
