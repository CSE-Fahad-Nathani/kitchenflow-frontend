import { useEffect, useRef, useState } from "react";
import { useToastStore } from "../store/toastStore";

const EXIT_MS = 260;

const ACCENT = {
  success: {
    ink: "text-green-700",
    soft: "bg-green-50",
    line: "bg-green-500",
    mark: "✓",
  },
  error: {
    ink: "text-red-600",
    soft: "bg-red-50",
    line: "bg-red-500",
    mark: "!",
  },
  warning: {
    ink: "text-orange-600",
    soft: "bg-orange-50",
    line: "bg-orange-500",
    mark: "!",
  },
  info: {
    ink: "text-orange-600",
    soft: "bg-orange-50",
    line: "bg-orange-500",
    mark: "i",
  },
  confirm: {
    ink: "text-orange-600",
    soft: "bg-orange-50",
    line: "bg-orange-500",
    mark: "?",
  },
};

const Toast = () => {
  const {
    visible,
    type,
    title,
    message,
    duration,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    hide,
  } = useToastStore();

  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef(null);
  const snapshot = useRef({
    type: "info",
    title: "",
    message: "",
    duration: 3000,
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
  });

  useEffect(() => {
    if (visible) {
      if (exitTimer.current) {
        clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }

      snapshot.current = {
        type,
        title,
        message,
        duration,
        confirmLabel,
        cancelLabel,
      };
      setLeaving(false);
      setMounted(true);
      return;
    }

    if (!mounted) return;

    setLeaving(true);
    exitTimer.current = setTimeout(() => {
      setMounted(false);
      setLeaving(false);
      exitTimer.current = null;
    }, EXIT_MS);

    return () => {
      if (exitTimer.current) {
        clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  const view = leaving
    ? snapshot.current
    : { type, title, message, duration, confirmLabel, cancelLabel };

  const accent = ACCENT[view.type] || ACCENT.info;
  const isConfirm = view.type === "confirm";

  const finishHide = (fn) => {
    hide();
    if (typeof fn === "function") {
      window.setTimeout(fn, 40);
    }
  };

  if (isConfirm) {
    return (
      <>
        <div
          className={`fixed inset-0 z-[99998] bg-[#1a120b]/45 ${
            leaving
              ? "animate-toast-backdrop-out"
              : "animate-toast-backdrop-in"
          }`}
          onClick={() => finishHide(onCancel)}
          aria-hidden
        />

        <div
          className={`fixed left-1/2 top-1/2 z-[99999] w-[min(92vw,22rem)] ${
            leaving ? "animate-toast-dialog-out" : "animate-toast-dialog-in"
          }`}
          role="alertdialog"
          aria-modal="true"
        >
          <div className="rounded-[1.25rem] bg-[#fffaf6] border border-orange-200/80 overflow-hidden shadow-[0_20px_50px_rgba(26,18,11,0.28)]">
            <div className="px-5 pt-5 pb-2 text-center">
              <div
                className={`mx-auto mb-3 w-10 h-10 rounded-2xl ${accent.soft} ${accent.ink} flex items-center justify-center text-[1.15rem] font-black`}
              >
                {accent.mark}
              </div>
              <h3 className="text-[1.05rem] font-bold text-[#1a120b] tracking-tight leading-snug">
                {view.title}
              </h3>
              {view.message && (
                <p className="mt-1.5 text-[13px] text-[#6b5e54] leading-relaxed">
                  {view.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 border-t border-orange-100/90 mt-3">
              <button
                type="button"
                onClick={() => finishHide(onCancel)}
                className="press-scale h-12 text-[13.5px] font-semibold text-[#6b5e54] active:bg-orange-50/60 border-r border-orange-100/90"
              >
                {view.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => finishHide(onConfirm)}
                className="press-scale h-12 text-[13.5px] font-bold text-orange-600 active:bg-orange-50"
              >
                {view.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`fixed bottom-20 left-1/2 z-[99999] w-[min(92vw,22rem)] ${
        leaving ? "animate-toast-dock-out" : "animate-toast-dock-in"
      }`}
      role="status"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#1a120b] text-[#fffaf6] shadow-[0_12px_32px_rgba(26,18,11,0.35)]">
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <div
            className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${accent.soft} ${accent.ink} flex items-center justify-center text-[12px] font-black`}
            aria-hidden
          >
            {accent.mark}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${accent.ink}`}>
                  {view.type === "success"
                    ? "Success"
                    : view.type === "error"
                      ? "Error"
                      : view.type === "warning"
                        ? "Warning"
                        : "Info"}
                </p>
                <p className="text-[13.5px] font-semibold leading-tight mt-0.5 truncate text-white">
                  {view.title}
                </p>
                {view.message && (
                  <p className="mt-0.5 text-[12px] text-white/65 leading-snug line-clamp-2">
                    {view.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={hide}
                className="press-scale shrink-0 text-[11px] font-semibold text-white/45 hover:text-white/80 pt-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {!leaving && (
          <div
            key={`${view.title}-${view.message}-${view.duration}`}
            className={`h-[2px] w-full ${accent.line} animate-toast-progress`}
            style={{ animationDuration: `${view.duration}ms` }}
          />
        )}
      </div>
    </div>
  );
};

export default Toast;
