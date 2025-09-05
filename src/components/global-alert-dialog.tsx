"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui";
import { useAlertDialog } from "@/stores/alert-dialog";

const presetMap = {
  fetching: {
    title: "通信中",
    description: "しばらくお待ちください。",
    showCancel: true,
    showConfirm: false,
    confirmLabel: "",
  },
  loading: {
    title: "",
    description: "読み込み中...",
    showCancel: false,
    showConfirm: false,
    confirmLabel: "",
  },
};

export default function GlobalAlertDialog() {
  const { isOpen, type, title, description, onConfirm, onCancel, closeDialog } =
    useAlertDialog();

  const data =
    type == "custom"
      ? {
          title,
          description,
          showCancel: !!onCancel,
          showConfirm: !!onConfirm,
          confirmLabel: "OK",
        }
      : presetMap[type];

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{data.title}</AlertDialogTitle>
          <AlertDialogDescription>{data.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {data.showCancel && (
            <AlertDialogCancel
              onClick={() => {
                onCancel?.();
                closeDialog();
              }}
            >
              キャンセル
            </AlertDialogCancel>
          )}
          {data.showConfirm && (
            <AlertDialogAction
              onClick={() => {
                onConfirm?.();
                closeDialog();
              }}
            >
              {data.confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
