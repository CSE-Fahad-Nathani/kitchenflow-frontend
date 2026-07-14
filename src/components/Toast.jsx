import {
  CheckCircle2,
  CircleAlert,
  CircleX,
  Info,
  X,
} from "lucide-react";
import { useToastStore } from "../store/toastStore";

const config = {
  success: {
    icon: CheckCircle2,
    color: "text-green-600",
    border: "bg-green-500",
  },
  error: {
    icon: CircleX,
    color: "text-red-600",
    border: "bg-red-500",
  },
  warning: {
    icon: CircleAlert,
    color: "text-orange-500",
    border: "bg-orange-500",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    border: "bg-blue-500",
  },
  confirm: {
    icon: CircleAlert,
    color: "text-orange-500",
    border: "bg-orange-500",
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

  if (!visible) return null;

  const current = config[type] || config.info;
  const Icon = current.icon;
  const isConfirm = type === "confirm";

  const handleConfirm = () => {
    const fn = onConfirm;
    hide();
    if (typeof fn === "function") fn();
  };

  const handleCancel = () => {
    const fn = onCancel;
    hide();
    if (typeof fn === "function") fn();
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-sm animate-toast">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl">
        <div className={`absolute left-0 top-0 h-full w-1 ${current.border}`} />

        <div className="flex items-start gap-3 p-4">
          <Icon size={24} className={`mt-0.5 shrink-0 ${current.color}`} />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{title}</h3>

            {message && (
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            )}

            {isConfirm && (
              <div className="mt-3.5 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="press-scale flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 active:bg-gray-100"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="press-scale flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/25"
                >
                  {confirmLabel}
                </button>
              </div>
            )}
          </div>

          {!isConfirm && (
            <button
              type="button"
              onClick={hide}
              className="text-gray-400 hover:text-gray-700 shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {!isConfirm && (
          <div
            key={`${title}-${message}-${duration}`}
            className={`h-1 ${current.border} animate-progress`}
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Toast;
