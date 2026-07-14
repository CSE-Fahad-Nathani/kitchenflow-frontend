import { create } from "zustand";

let hideTimer = null;

export const useToastStore = create((set, get) => ({
  visible: false,
  type: "success",
  title: "",
  message: "",
  duration: 3000,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  onConfirm: null,
  onCancel: null,

  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    set({
      visible: false,
      onConfirm: null,
      onCancel: null,
    });
  },

  show: ({
    type,
    title,
    message,
    duration = 3000,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm = null,
    onCancel = null,
  }) => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    set({
      visible: true,
      type,
      title,
      message,
      duration,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onCancel,
    });

    // Confirm toasts stay until user acts
    if (type !== "confirm") {
      hideTimer = setTimeout(() => {
        get().hide();
      }, duration);
    }
  },

  success: (title, message) =>
    get().show({
      type: "success",
      title,
      message,
    }),

  error: (title, message) =>
    get().show({
      type: "error",
      title,
      message,
    }),

  warning: (title, message) =>
    get().show({
      type: "warning",
      title,
      message,
    }),

  info: (title, message) =>
    get().show({
      type: "info",
      title,
      message,
    }),

  confirm: ({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
  }) =>
    get().show({
      type: "confirm",
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      onCancel,
      duration: 0,
    }),
}));
