import { create } from "zustand";

type AlertDialogType = "custom" | "fetching" | "loading";

type AlertDialogState = {
  isOpen: boolean;
  type: AlertDialogType;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  openDialog: (params: {
    type?: AlertDialogType;
    title?: string;
    description?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  closeDialog: () => void;
};

export const useAlertDialog = create<AlertDialogState>((set) => ({
  isOpen: false,
  type: "custom",
  title: "",
  description: "",
  onConfirm: undefined,
  onCancel: undefined,
  openDialog: ({ type = "custom", title, description, onConfirm, onCancel }) =>
    set({
      isOpen: true,
      type,
      title,
      description,
      onConfirm,
      onCancel,
    }),
  closeDialog: () => set({ isOpen: false }),
}));
