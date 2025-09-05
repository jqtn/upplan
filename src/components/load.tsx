import { Loader2, AlertCircle, SearchX } from "lucide-react";

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 p-10">
      <Loader2 className="animate-spin h-8 w-8" />
      <span className="text-lg text-muted-foreground">読み込み中...</span>
    </div>
  );
}

export function LoadError() {
  return (
    <div className="flex items-center justify-center gap-2 p-10">
      <AlertCircle className="h-8 w-8" />
      <span className="text-lg text-muted-foreground">
        データの読み込みに失敗しました
      </span>
    </div>
  );
}

export function LoadNoData() {
  return (
    <div className="flex items-center justify-center gap-2 p-10">
      <SearchX className="h-8 w-8" />
      <span className="text-lg text-muted-foreground">データがありません</span>
    </div>
  );
}
