import {
  ArrowLeft,
  CalendarRange,
  ChevronRight,
  FileStack,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const options = [
  {
    id: "standard",
    title: "Standard Bill",
    subtitle: "Single order · items + delivery",
    hint: "Best for one-time catering",
    icon: Receipt,
    path: "/orders/standard",
    accent: {
      iconBg: "bg-orange-500",
      iconText: "text-white",
      ring: "active:ring-orange-200",
      bar: "bg-orange-500",
    },
  },
  {
    id: "tiffin",
    title: "Monthly Tiffin",
    subtitle: "Date range · daily rate · exclusions",
    hint: "Same tiffin across many days",
    icon: CalendarRange,
    path: "/orders/monthly-tiffin",
    accent: {
      iconBg: "bg-amber-500",
      iconText: "text-white",
      ring: "active:ring-amber-200",
      bar: "bg-amber-500",
    },
  },
  {
    id: "datewise",
    title: "Date-wise Bill",
    subtitle: "Multiple days · dishes per day",
    hint: "Merge several dates into one bill",
    icon: FileStack,
    path: "/orders/datewise",
    accent: {
      iconBg: "bg-rose-500",
      iconText: "text-white",
      ring: "active:ring-rose-200",
      bar: "bg-rose-500",
    },
  },
];

const BillTypeChooser = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto min-h-[calc(100dvh-4rem)] bg-[#fff8f3] pb-8">
      <header className="relative overflow-hidden px-4 pt-safe pb-6">
        <div className="absolute inset-0 bg-[#fff8f3]" />
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-orange-200/40 blur-2xl pointer-events-none" />
        <div className="absolute top-20 -left-12 w-36 h-36 rounded-full bg-amber-200/35 blur-2xl pointer-events-none" />

        <div className="relative">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Back"
            className="press-scale w-9 h-9 rounded-full bg-white border border-orange-100 text-gray-800 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="mt-6">
            <p className="text-orange-600 text-[11px] font-semibold tracking-[0.16em] uppercase">
              Arefa's Kitchen
            </p>
            <h1 className="mt-1.5 text-[1.75rem] font-bold text-gray-900 leading-[1.15] tracking-tight">
              What are you
              <br />
              billing today?
            </h1>
            <p className="mt-2 text-[13px] text-gray-600 max-w-[16rem]">
              Pick one format — you can always go back and switch.
            </p>
          </div>
        </div>
      </header>

      <div className="relative px-3.5 space-y-2.5">
        {options.map((option, index) => {
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => navigate(option.path)}
              className={`press-scale group w-full text-left bg-white rounded-2xl border border-orange-100/80 shadow-[0_4px_18px_-8px_rgba(249,115,22,0.28)] overflow-hidden active:scale-[0.985] ring-0 ${option.accent.ring} active:ring-4 transition`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-stretch">
                <div className={`w-1.5 shrink-0 ${option.accent.bar}`} />

                <div className="flex-1 flex items-center gap-3 px-3.5 py-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${option.accent.iconBg} ${option.accent.iconText} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon size={20} strokeWidth={2.25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                        0{index + 1}
                      </span>
                      <p className="text-[15px] font-bold text-gray-900 truncate">
                        {option.title}
                      </p>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                      {option.subtitle}
                    </p>
                    <p className="text-[11px] text-orange-600/80 font-medium mt-1">
                      {option.hint}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-active:text-orange-400 shrink-0 transition-colors"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BillTypeChooser;
