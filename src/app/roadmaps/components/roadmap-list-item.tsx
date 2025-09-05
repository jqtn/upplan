"use client";

import { useRouter } from "next/navigation";
import { Edit, Trash2, Calendar, Clock } from "lucide-react";
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { schema } from "@/db";
import { useSessionSettings } from "@/contexts/session-settings-context";
import { deleteRoadmap } from "@/app/actions/roadmap";
import { useAlertDialog } from "@/stores/alert-dialog";
import { useDesktopBreakpoint } from "@/hooks/use-desktop-breakpoint";

export function RoadmapListItem({ roadmaps }: { roadmaps: schema.Roadmap[] }) {
  const router = useRouter();
  const { sessionSettings } = useSessionSettings();
  const { openDialog } = useAlertDialog();
  const isDesktop = useDesktopBreakpoint();

  const categories = sessionSettings ? sessionSettings.categories : [];

  const handleDetail = (roadmapId: string) => {
    router.push(`/roadmaps/${roadmapId}`);
  };

  const handleEdit = (roadmapId: string) => {
    router.push(`/roadmaps/${roadmapId}/edit`);
  };

  const handleDelete = async (roadmapId: string, roadmapTitle: string) => {
    openDialog({
      title: "ロードマップを削除しますか？",
      description: `「${roadmapTitle}」を削除します。この操作は取り消せません。`,
      onConfirm: async () => await deleteRoadmap(roadmapId),
      onCancel: () => {},
    });
  };

  return (
    <>
      {isDesktop ? (
        <Card>
          <CardHeader>
            <CardTitle>ロードマップ一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  {categories.length > 0 && <TableHead>カテゴリー</TableHead>}
                  <TableHead>作成日時</TableHead>
                  <TableHead>更新日時</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roadmaps.map((roadmap) => (
                  <RoadmapListTableRow
                    key={roadmap.id}
                    roadmap={roadmap}
                    categories={categories}
                    handleDetail={handleDetail}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <>
          {roadmaps.map((roadmap) => (
            <RoadmapListCard
              key={roadmap.id}
              roadmap={roadmap}
              categories={categories}
              handleDetail={handleDetail}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))}
        </>
      )}
    </>
  );
}

function RoadmapListTableRow({
  roadmap,
  categories,
  handleDetail,
  handleEdit,
  handleDelete,
}: {
  roadmap: schema.Roadmap;
  categories: string[];
  handleDetail: (roadmapId: string) => void;
  handleEdit: (roadmapId: string) => void;
  handleDelete: (roadmapId: string, roadmapTitle: string) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <button
          onClick={() => handleDetail(roadmap.id)}
          className="text-left hover:text-primary hover:underline font-medium transition-colors  cursor-pointer"
        >
          {roadmap.title}
        </button>
      </TableCell>
      {categories.length > 0 && (
        <TableCell>
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 hover:bg-slate-50"
          >
            {categories[roadmap.categoryId] ?? "不明"}
          </Badge>
        </TableCell>
      )}
      <TableCell className="text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(roadmap.createdAt)}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(roadmap.updatedAt)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(roadmap.id)}
            className="flex items-center gap-1 cursor-pointer"
          >
            <Edit className="h-3 w-3" />
            編集
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-destructive hover:text-destructive bg-transparent cursor-pointer"
            onClick={() => handleDelete(roadmap.id, roadmap.title)}
          >
            <Trash2 className="h-3 w-3" />
            削除
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function RoadmapListCard({
  roadmap,
  categories,
  handleDetail,
  handleEdit,
  handleDelete,
}: {
  roadmap: schema.Roadmap;
  categories: string[];
  handleDetail: (roadmapId: string) => void;
  handleEdit: (roadmapId: string) => void;
  handleDelete: (roadmapId: string, roadmapTitle: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <button
            onClick={() => handleDetail(roadmap.id)}
            className="text-left hover:text-primary hover:underline font-medium transition-colors flex-1 cursor-pointer"
          >
            {roadmap.title}
          </button>
          {categories.length > 0 && (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 hover:bg-slate-50"
            >
              {categories[roadmap.categoryId] ?? "不明"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>作成: {formatDate(roadmap.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>更新: {formatDate(roadmap.updatedAt)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(roadmap.id)}
              className="flex items-center gap-1 flex-1 cursor-pointer"
            >
              <Edit className="h-3 w-3" />
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-destructive hover:text-destructive flex-1 bg-transparent cursor-pointer"
              onClick={() => handleDelete(roadmap.id, roadmap.title)}
            >
              <Trash2 className="h-3 w-3" />
              削除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: Date) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
