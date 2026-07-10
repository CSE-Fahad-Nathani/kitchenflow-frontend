import { create } from "zustand";

export const useToastStore = create((set) => ({
  visible: false,

  type: "success",

  title: "",

  message: "",

  duration: 3000,

  show: ({ type, title, message, duration = 3000 }) => {
    set({
      visible: true,
      type,
      title,
      message,
      duration,
    });

    setTimeout(() => {
      set({
        visible: false,
      });
    }, duration);
  },

  success: (title, message) =>
    useToastStore.getState().show({
      type: "success",
      title,
      message,
    }),

  error: (title, message) =>
    useToastStore.getState().show({
      type: "error",
      title,
      message,
    }),

  warning: (title, message) =>
    useToastStore.getState().show({
      type: "warning",
      title,
      message,
    }),

  info: (title, message) =>
    useToastStore.getState().show({
      type: "info",
      title,
      message,
    }),
}));