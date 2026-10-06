import { useEffect, useRef, useState } from "react";
import { useToastStore } from "../store/toastStore";
import {
  DEFAULT_TOAST_THEME,
  TYPE_META,
  getThemeColors,
} from "../toast/toastThemes";

const EXIT_MS = 260;

const CloseBtn = ({ onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={`press-scale shrink-0 text-[11px] font-semibold ${className}`}
  >
    Close
  </button>
);

const ToastBody = ({ themeId, type, title, message, onHide }) => {
  const colors = getThemeColors(themeId, type);
  const meta = TYPE_META[type] || TYPE_META.info;

  if (themeId === "soft-bar") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
        <div className={`absolute inset-y-0 left-0 w-1 ${colors.bar}`} />
        <div className="pl-3.5 pr-3 py-2.5 flex items-start gap-2.5">
          <div
            className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${colors.soft} ${colors.ink} flex items-center justify-center text-[12px] font-black`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${colors.ink}`}>
                  {meta.label}
                </p>
                <p className="text-[13.5px] font-semibold text-gray-900 leading-tight mt-0.5">
                  {title}
                </p>
                {message ? (
                  <p className="mt-0.5 text-[12px] text-gray-500 leading-snug line-clamp-2">
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn onClick={onHide} className="text-gray-400 hover:text-gray-700 pt-0.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "glass") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.16)]">
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <div
            className={`shrink-0 mt-0.5 w-7 h-7 rounded-full ${colors.soft} ${colors.ink} flex items-center justify-center text-[12px] font-black`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">
                  {title}
                </p>
                {message ? (
                  <p className="mt-0.5 text-[12px] text-gray-600 leading-snug line-clamp-2">
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn onClick={onHide} className="text-gray-500 hover:text-gray-800 pt-0.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "solid") {
    return (
      <div
        className={`relative overflow-hidden rounded-xl ${colors.fill} shadow-[0_12px_28px_rgba(15,23,42,0.22)]`}
      >
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <div
            className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${colors.soft} ${colors.ink} flex items-center justify-center text-[12px] font-black`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[13.5px] font-semibold leading-tight ${colors.ink}`}>
                  {title}
                </p>
                {message ? (
                  <p className={`mt-0.5 text-[12px] leading-snug line-clamp-2 ${colors.mute}`}>
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn
                onClick={onHide}
                className={`${colors.mute} hover:opacity-100 opacity-80 pt-0.5`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "minimal") {
    return (
      <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm">
        <div className="px-3 py-2.5 flex items-start gap-2">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                  {title}
                </p>
                {message ? (
                  <p className="mt-0.5 text-[11.5px] text-gray-500 leading-snug line-clamp-2">
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn onClick={onHide} className="text-gray-400 hover:text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "icon-card") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
        <div className="px-3.5 py-3 flex items-start gap-3">
          <div
            className={`shrink-0 w-9 h-9 rounded-xl ${colors.soft} ${colors.softInk} flex items-center justify-center text-[14px] font-black shadow-sm`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${colors.ink}`}>
                  {meta.label}
                </p>
                <p className="text-[14px] font-bold text-gray-900 leading-tight mt-0.5">
                  {title}
                </p>
                {message ? (
                  <p className="mt-1 text-[12px] text-gray-500 leading-snug line-clamp-2">
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn onClick={onHide} className="text-gray-400 hover:text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "dark") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#17120f] text-white shadow-[0_12px_32px_rgba(26,18,11,0.35)] border border-white/5">
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <div
            className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${colors.soft} ${colors.ink} flex items-center justify-center text-[12px] font-black`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${colors.ink}`}>
                  {meta.label}
                </p>
                <p className="text-[13.5px] font-semibold leading-tight mt-0.5 text-white">
                  {title}
                </p>
                {message ? (
                  <p className="mt-0.5 text-[12px] text-white/65 leading-snug line-clamp-2">
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn onClick={onHide} className="text-white/45 hover:text-white/80 pt-0.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "stripe") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
        <div className={`h-1.5 w-full ${colors.bar}`} />
        <div className="px-3.5 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${colors.ink}`}>
                {meta.label}
              </p>
              <p className="text-[13.5px] font-semibold text-gray-900 leading-tight mt-0.5">
                {title}
              </p>
              {message ? (
                <p className="mt-0.5 text-[12px] text-gray-500 leading-snug line-clamp-2">
                  {message}
                </p>
              ) : null}
            </div>
            <CloseBtn onClick={onHide} className="text-gray-400 hover:text-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (themeId === "compact") {
    return (
      <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 shadow-md">
        <div className="px-2.5 py-2 flex items-center gap-2">
          <div
            className={`shrink-0 w-6 h-6 rounded-md ${colors.soft} ${colors.ink} flex items-center justify-center text-[11px] font-black`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-gray-900 leading-tight truncate">
              {title}
            </p>
            {message ? (
              <p className="text-[11px] text-gray-500 leading-snug truncate">
                {message}
              </p>
            ) : null}
          </div>
          <CloseBtn onClick={onHide} className="text-gray-400 hover:text-gray-700" />
        </div>
      </div>
    );
  }

  if (themeId === "tinted") {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border ${colors.fill} ${colors.border} shadow-[0_8px_24px_rgba(15,23,42,0.08)]`}
      >
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <div
            className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${colors.soft} ${colors.ink} flex items-center justify-center text-[12px] font-black`}
          >
            {meta.mark}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[13.5px] font-semibold leading-tight ${colors.ink}`}>
                  {title}
                </p>
                {message ? (
                  <p className={`mt-0.5 text-[12px] leading-snug line-clamp-2 ${colors.mute}`}>
                    {message}
                  </p>
                ) : null}
              </div>
              <CloseBtn onClick={onHide} className={`${colors.mute} hover:opacity-100 pt-0.5`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // outline (default fallback)
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white border-2 ${colors.border} shadow-[0_10px_28px_rgba(15,23,42,0.1)]`}
    >
      <div className="px-3.5 py-2.5 flex items-start gap-2.5">
        <div
          className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg ${colors.soft} ${colors.ink} flex items-center justify-center text-[12px] font-black`}
        >
          {meta.mark}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[13.5px] font-bold leading-tight ${colors.ink}`}>
                {title}
              </p>
              {message ? (
                <p className="mt-0.5 text-[12px] text-gray-600 leading-snug line-clamp-2">
                  {message}
                </p>
              ) : null}
            </div>
            <CloseBtn onClick={onHide} className="text-gray-400 hover:text-gray-700 pt-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
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
    themeId,
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
    themeId: DEFAULT_TOAST_THEME,
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
        themeId,
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
    : { type, title, message, duration, confirmLabel, cancelLabel, themeId };

  const activeTheme = view.themeId || DEFAULT_TOAST_THEME;
  const isConfirm = view.type === "confirm";

  const finishHide = (fn) => {
    hide();
    if (typeof fn === "function") {
      window.setTimeout(fn, 40);
    }
  };

  if (isConfirm) {
    const accent = getThemeColors(
      activeTheme === "solid" || activeTheme === "dark" ? "soft-bar" : activeTheme,
      "info"
    );

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
                className={`mx-auto mb-3 w-10 h-10 rounded-2xl ${accent.soft || "bg-orange-50"} ${accent.ink || "text-orange-600"} flex items-center justify-center text-[1.15rem] font-black`}
              >
                ?
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
      className={`fixed z-[99999] w-[min(92vw,22rem)] top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] ${
        leaving ? "animate-toast-dock-out" : "animate-toast-dock-in"
      }`}
      role="status"
    >
      <ToastBody
        themeId={activeTheme}
        type={view.type}
        title={view.title}
        message={view.message}
        onHide={hide}
      />
    </div>
  );
};

export default Toast;
