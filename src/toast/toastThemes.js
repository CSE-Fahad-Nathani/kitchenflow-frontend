export const TOAST_THEME_STORAGE_KEY = "kf_toast_theme";

export const TOAST_THEMES = [
  {
    id: "soft-bar",
    name: "Soft Bar",
    blurb: "Clean white card with a colored left edge.",
  },
  {
    id: "glass",
    name: "Frost Glass",
    blurb: "Translucent blur panel — light and airy.",
  },
  {
    id: "solid",
    name: "Solid Fill",
    blurb: "Full-color background by toast type.",
  },
  {
    id: "minimal",
    name: "Minimal Dot",
    blurb: "Quiet border, tiny status dot, lots of air.",
  },
  {
    id: "icon-card",
    name: "Icon Card",
    blurb: "Bold icon badge with crisp white body.",
  },
  {
    id: "dark",
    name: "Dark Soft",
    blurb: "Charcoal surface with soft type accents.",
  },
  {
    id: "stripe",
    name: "Top Stripe",
    blurb: "White card capped with a thick color stripe.",
  },
  {
    id: "compact",
    name: "Compact Chip",
    blurb: "Smaller, denser — good for quick confirmations.",
  },
  {
    id: "tinted",
    name: "Soft Tint",
    blurb: "Pastel wash matching success / error / warning.",
  },
  {
    id: "outline",
    name: "Bold Outline",
    blurb: "Strong colored border and matching title ink.",
  },
];

export const DEFAULT_TOAST_THEME = "glass";

export const isValidToastTheme = (id) =>
  TOAST_THEMES.some((theme) => theme.id === id);

export const TYPE_META = {
  success: { label: "Success", mark: "✓" },
  error: { label: "Error", mark: "!" },
  warning: { label: "Warning", mark: "!" },
  info: { label: "Info", mark: "i" },
  confirm: { label: "Confirm", mark: "?" },
};

/** Per-theme color tokens keyed by toast type */
export const THEME_COLORS = {
  "soft-bar": {
    success: {
      bar: "bg-emerald-500",
      ink: "text-emerald-700",
      soft: "bg-emerald-50",
      line: "bg-emerald-500",
    },
    error: {
      bar: "bg-rose-500",
      ink: "text-rose-700",
      soft: "bg-rose-50",
      line: "bg-rose-500",
    },
    warning: {
      bar: "bg-amber-500",
      ink: "text-amber-700",
      soft: "bg-amber-50",
      line: "bg-amber-500",
    },
    info: {
      bar: "bg-orange-500",
      ink: "text-orange-700",
      soft: "bg-orange-50",
      line: "bg-orange-500",
    },
  },
  glass: {
    success: {
      bar: "bg-emerald-500",
      ink: "text-emerald-700",
      soft: "bg-emerald-500/15",
      line: "bg-emerald-500",
    },
    error: {
      bar: "bg-rose-500",
      ink: "text-rose-700",
      soft: "bg-rose-500/15",
      line: "bg-rose-500",
    },
    warning: {
      bar: "bg-amber-500",
      ink: "text-amber-800",
      soft: "bg-amber-500/15",
      line: "bg-amber-500",
    },
    info: {
      bar: "bg-orange-500",
      ink: "text-orange-700",
      soft: "bg-orange-500/15",
      line: "bg-orange-500",
    },
  },
  solid: {
    success: {
      fill: "bg-emerald-600",
      ink: "text-white",
      mute: "text-emerald-50/85",
      soft: "bg-white/20",
      line: "bg-white/70",
    },
    error: {
      fill: "bg-rose-600",
      ink: "text-white",
      mute: "text-rose-50/85",
      soft: "bg-white/20",
      line: "bg-white/70",
    },
    warning: {
      fill: "bg-amber-500",
      ink: "text-amber-950",
      mute: "text-amber-950/70",
      soft: "bg-black/10",
      line: "bg-amber-950/40",
    },
    info: {
      fill: "bg-orange-500",
      ink: "text-white",
      mute: "text-orange-50/85",
      soft: "bg-white/20",
      line: "bg-white/70",
    },
  },
  minimal: {
    success: {
      ink: "text-emerald-700",
      dot: "bg-emerald-500",
      line: "bg-emerald-500",
    },
    error: {
      ink: "text-rose-700",
      dot: "bg-rose-500",
      line: "bg-rose-500",
    },
    warning: {
      ink: "text-amber-700",
      dot: "bg-amber-500",
      line: "bg-amber-500",
    },
    info: {
      ink: "text-orange-700",
      dot: "bg-orange-500",
      line: "bg-orange-500",
    },
  },
  "icon-card": {
    success: {
      ink: "text-emerald-700",
      soft: "bg-emerald-500",
      softInk: "text-white",
      line: "bg-emerald-500",
    },
    error: {
      ink: "text-rose-700",
      soft: "bg-rose-500",
      softInk: "text-white",
      line: "bg-rose-500",
    },
    warning: {
      ink: "text-amber-700",
      soft: "bg-amber-500",
      softInk: "text-white",
      line: "bg-amber-500",
    },
    info: {
      ink: "text-orange-700",
      soft: "bg-orange-500",
      softInk: "text-white",
      line: "bg-orange-500",
    },
  },
  dark: {
    success: {
      ink: "text-emerald-400",
      soft: "bg-emerald-500/20",
      line: "bg-emerald-400",
    },
    error: {
      ink: "text-rose-400",
      soft: "bg-rose-500/20",
      line: "bg-rose-400",
    },
    warning: {
      ink: "text-amber-300",
      soft: "bg-amber-500/20",
      line: "bg-amber-300",
    },
    info: {
      ink: "text-orange-300",
      soft: "bg-orange-500/20",
      line: "bg-orange-300",
    },
  },
  stripe: {
    success: {
      bar: "bg-emerald-500",
      ink: "text-emerald-700",
      line: "bg-emerald-500",
    },
    error: {
      bar: "bg-rose-500",
      ink: "text-rose-700",
      line: "bg-rose-500",
    },
    warning: {
      bar: "bg-amber-500",
      ink: "text-amber-700",
      line: "bg-amber-500",
    },
    info: {
      bar: "bg-orange-500",
      ink: "text-orange-700",
      line: "bg-orange-500",
    },
  },
  compact: {
    success: {
      ink: "text-emerald-700",
      soft: "bg-emerald-50",
      line: "bg-emerald-500",
    },
    error: {
      ink: "text-rose-700",
      soft: "bg-rose-50",
      line: "bg-rose-500",
    },
    warning: {
      ink: "text-amber-700",
      soft: "bg-amber-50",
      line: "bg-amber-500",
    },
    info: {
      ink: "text-orange-700",
      soft: "bg-orange-50",
      line: "bg-orange-500",
    },
  },
  tinted: {
    success: {
      fill: "bg-emerald-50",
      border: "border-emerald-200",
      ink: "text-emerald-800",
      mute: "text-emerald-800/70",
      soft: "bg-emerald-100",
      line: "bg-emerald-500",
    },
    error: {
      fill: "bg-rose-50",
      border: "border-rose-200",
      ink: "text-rose-800",
      mute: "text-rose-800/70",
      soft: "bg-rose-100",
      line: "bg-rose-500",
    },
    warning: {
      fill: "bg-amber-50",
      border: "border-amber-200",
      ink: "text-amber-900",
      mute: "text-amber-900/70",
      soft: "bg-amber-100",
      line: "bg-amber-500",
    },
    info: {
      fill: "bg-orange-50",
      border: "border-orange-200",
      ink: "text-orange-900",
      mute: "text-orange-900/70",
      soft: "bg-orange-100",
      line: "bg-orange-500",
    },
  },
  outline: {
    success: {
      border: "border-emerald-500",
      ink: "text-emerald-700",
      soft: "bg-emerald-50",
      line: "bg-emerald-500",
    },
    error: {
      border: "border-rose-500",
      ink: "text-rose-700",
      soft: "bg-rose-50",
      line: "bg-rose-500",
    },
    warning: {
      border: "border-amber-500",
      ink: "text-amber-700",
      soft: "bg-amber-50",
      line: "bg-amber-500",
    },
    info: {
      border: "border-orange-500",
      ink: "text-orange-700",
      soft: "bg-orange-50",
      line: "bg-orange-500",
    },
  },
};

export const getThemeColors = (themeId, type) => {
  const theme = THEME_COLORS[themeId] || THEME_COLORS[DEFAULT_TOAST_THEME];
  return theme[type] || theme.info;
};
