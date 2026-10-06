import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import { TOAST_THEMES } from "../../toast/toastThemes";

const ToastLab = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const themeId = useToastStore((s) => s.themeId);
  const setTheme = useToastStore((s) => s.setTheme);

  const previewType = (type) => {
    const samples = {
      success: ["Saved", "Bill created successfully."],
      error: ["Failed", "Something went wrong. Try again."],
      warning: ["Heads up", "Customer already has open credit."],
      info: ["Reminder", "Don’t forget to mark this paid."],
    };
    const [title, message] = samples[type];
    toast[type](title, message);
  };

  return (
    <div className="max-w-md mx-auto min-h-[calc(100dvh-4rem)] bg-[#fff8f3] pb-10">
      <header className="relative overflow-hidden px-4 pt-safe pb-5">
        <div className="absolute inset-0 bg-[#fff8f3]" />
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-orange-200/40 blur-2xl pointer-events-none" />

        <div className="relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="press-scale w-9 h-9 rounded-full bg-white border border-orange-100 text-gray-800 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="mt-5">
            <p className="text-orange-600 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Design lab
            </p>
            <h1 className="mt-1.5 text-[1.65rem] font-bold text-gray-900 leading-tight tracking-tight">
              Pick a toast style
            </h1>
            <p className="mt-1.5 text-[13px] text-gray-600 max-w-[20rem]">
              All notifications now appear top-right. Choose one look — it
              saves for the whole app.
            </p>
          </div>
        </div>
      </header>

      <div className="px-3.5 space-y-2.5">
        <div className="bg-white rounded-2xl border border-orange-100 p-3 flex flex-wrap gap-2">
          {[
            ["success", "Success"],
            ["error", "Error"],
            ["warning", "Warning"],
            ["info", "Info"],
          ].map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => previewType(type)}
              className="press-scale h-8 px-3 rounded-lg text-[12px] font-semibold bg-orange-50 text-orange-700 border border-orange-100"
            >
              Try {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              toast.confirm({
                title: "Clear this credit?",
                message: "This removes open credit for the customer.",
                confirmLabel: "Clear",
                onConfirm: () => toast.success("Cleared", "Credit removed."),
              })
            }
            className="press-scale h-8 px-3 rounded-lg text-[12px] font-semibold bg-gray-900 text-white"
          >
            Try Confirm
          </button>
        </div>

        {TOAST_THEMES.map((theme, index) => {
          const selected = themeId === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                setTheme(theme.id);
                toast.success(
                  `${theme.name} selected`,
                  "This style is now used across KitchenFlow."
                );
              }}
              className={`press-scale w-full text-left rounded-2xl border p-3.5 transition ${
                selected
                  ? "bg-orange-50 border-orange-300 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]"
                  : "bg-white border-orange-100/80 shadow-[0_4px_18px_-8px_rgba(249,115,22,0.22)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[15px] font-bold text-gray-900">
                      {theme.name}
                    </p>
                    {selected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-white border border-orange-200 px-2 py-0.5 rounded-full">
                        <Check size={12} strokeWidth={2.5} />
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12.5px] text-gray-600 leading-relaxed">
                    {theme.blurb}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-orange-600/90">
                    Tap to use · preview fires top-right
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToastLab;
