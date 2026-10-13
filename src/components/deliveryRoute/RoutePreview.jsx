import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Wallet,
} from "lucide-react";
import { formatDisplayTime } from "../../utils/formatDate";
import { mapsSearchUrl, whatsappUrl } from "../../utils/deliveryRouteHelpers";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const IconAction = ({ href, icon: Icon, label, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };

  return (
    <a
      href={href}
      target={href.startsWith("tel:") ? undefined : "_blank"}
      rel={href.startsWith("tel:") ? undefined : "noreferrer"}
      aria-label={label}
      title={label}
      className={`press-scale w-9 h-9 rounded-full border flex items-center justify-center ${tones[tone]}`}
    >
      <Icon size={16} strokeWidth={2.2} />
    </a>
  );
};

const FieldBlock = ({ label, value, empty, action }) => {
  const muted = !value;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
          {label}
        </p>
        {action || null}
      </div>
      <p
        className={`mt-1.5 text-[15px] leading-snug whitespace-pre-wrap break-words ${
          muted
            ? "font-medium italic text-gray-400"
            : "font-semibold text-gray-900"
        }`}
      >
        {value || empty}
      </p>
    </div>
  );
};

const RoutePreview = ({
  stops,
  index,
  completedIds,
  onClose,
  onNext,
  onPrev,
  onEdit,
  onToggleDone,
  onMarkPaid,
  onCredit,
  markingPaid = false,
  payingExtra = false,
}) => {
  const stop = stops[index];
  if (!stop) return null;

  const total = stops.length;
  const nextStop = index < total - 1 ? stops[index + 1] : null;
  const isLast = index >= total - 1;
  const done = completedIds.includes(stop.stop_id);
  const wa = whatsappUrl(stop.customer_mobile);
  const maps = mapsSearchUrl(stop.customer_address);
  const phone = (stop.customer_mobile || "").trim();
  const address = (stop.customer_address || "").trim();
  const notes = (stop.customer_notes || "").trim();
  const billNotes = (stop.bill_notes || "").trim();
  const timeLabel = formatDisplayTime(stop.delivery_datetime);
  const isOrderStop = stop.kind === "order" && Boolean(stop.order_id);
  const paymentBusy = markingPaid || payingExtra;

  const metaBits = [];
  if (stop.order_number) metaBits.push(`#${stop.order_number}`);
  if (timeLabel) metaBits.push(timeLabel);
  if (stop.kind === "manual") metaBits.push("Extra stop");
  if (stop.total_amount != null) metaBits.push(money(stop.total_amount));

  const statusLabel = done
    ? "Done"
    : isOrderStop
      ? stop.is_paid
        ? "Paid"
        : "Unpaid"
      : "Stop";

  const statusTone = done
    ? "bg-emerald-600"
    : isOrderStop && stop.is_paid
      ? "bg-emerald-600"
      : isOrderStop
        ? "bg-red-600"
        : "bg-gray-500";

  return (
    <div className="fixed inset-0 z-[60] max-w-md mx-auto flex flex-col overflow-hidden bg-[#f7f4ef]">
      {/* Soft branded backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 90% 55% at 0% 0%, rgba(249,115,22,0.18), transparent 55%)",
            "radial-gradient(ellipse 80% 50% at 100% 18%, rgba(251,146,60,0.12), transparent 50%)",
            "radial-gradient(ellipse 70% 45% at 50% 100%, rgba(16,185,129,0.08), transparent 55%)",
            "linear-gradient(180deg, #fff7ed 0%, #f7f4ef 42%, #f3f4f6 100%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(249,115,22,0.22) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
        }}
      />

      {/* Slim chrome */}
      <header className="relative z-10 shrink-0 px-3.5 pt-safe pb-2.5 bg-white/85 backdrop-blur-sm border-b border-orange-100/60">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit preview"
            className="press-scale w-9 h-9 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-gray-900">
              Route Preview
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {total} stop{total === 1 ? "" : "s"} in sequence
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleDone(stop.stop_id)}
            aria-label={done ? "Marked done" : "Mark done"}
            className={`press-scale h-9 px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border ${
              done
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-emerald-700 border-emerald-200"
            }`}
          >
            <Check size={14} strokeWidth={2.5} />
            {done ? "Done" : "Mark done"}
          </button>
        </div>

        <div className="mt-2.5 flex gap-1">
          {stops.map((s, i) => {
            const isDone = completedIds.includes(s.stop_id);
            const isCurrent = i === index;
            return (
              <div
                key={s.stop_id}
                className={`h-1 flex-1 rounded-full ${
                  isCurrent
                    ? "bg-orange-500"
                    : isDone
                      ? "bg-emerald-500"
                      : "bg-gray-200"
                }`}
              />
            );
          })}
        </div>
      </header>

      <div className="relative z-10 flex-1 min-h-0 flex flex-col px-3 pt-3 pb-3">
        {/* PDF-matched stop card — fills remaining height */}
        <article
          className={`flex-1 min-h-0 flex flex-col rounded-2xl border overflow-hidden bg-white/95 ${
            done ? "border-emerald-200" : "border-orange-100"
          }`}
        >
          <div
            className={`shrink-0 flex items-center justify-between gap-3 px-4 py-4 ${
              done
                ? "bg-emerald-50 border-b border-emerald-200"
                : "bg-orange-50 border-b border-orange-200"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`shrink-0 w-12 h-12 rounded-full text-white text-[20px] font-extrabold flex items-center justify-center ${
                  done ? "bg-emerald-600" : "bg-orange-500"
                }`}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-[14px] font-extrabold uppercase tracking-wide leading-snug ${
                    done ? "text-emerald-700" : "text-orange-700"
                  }`}
                >
                  Stop {index + 1} of {total}
                </p>
                <p className="mt-1.5 text-[13px] font-semibold text-gray-600 leading-snug break-words">
                  {metaBits.join(" · ") || "Today"}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 h-8 px-3.5 rounded-full text-white text-[12px] font-extrabold uppercase tracking-wide inline-flex items-center ${statusTone}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-none px-3.5 pt-4 pb-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h1 className="min-w-0 text-[1.45rem] font-semibold text-gray-900 leading-tight tracking-tight break-words">
                {stop.customer_name || "Customer"}
              </h1>
              {stop.canEditCustomer ? (
                <button
                  type="button"
                  onClick={() => onEdit(stop)}
                  aria-label="Edit details"
                  className="press-scale shrink-0 w-9 h-9 rounded-full bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center"
                >
                  <Pencil size={15} />
                </button>
              ) : null}
            </div>

            <FieldBlock
              label="Phone"
              value={phone}
              empty="No phone"
              action={
                phone || wa ? (
                  <div className="flex items-center gap-1.5">
                    {phone ? (
                      <IconAction
                        href={`tel:${phone}`}
                        icon={Phone}
                        label="Call"
                        tone="neutral"
                      />
                    ) : null}
                    {wa ? (
                      <IconAction
                        href={wa}
                        icon={MessageCircle}
                        label="WhatsApp"
                        tone="green"
                      />
                    ) : null}
                  </div>
                ) : null
              }
            />

            <FieldBlock
              label="Address"
              value={address}
              empty="No address saved"
              action={
                maps ? (
                  <IconAction
                    href={maps}
                    icon={MapPin}
                    label="Open in Maps"
                    tone="blue"
                  />
                ) : null
              }
            />

            <FieldBlock
              label="Customer notes"
              value={notes}
              empty="No notes"
              action={
                stop.canEditCustomer ? (
                  <button
                    type="button"
                    onClick={() => onEdit(stop)}
                    aria-label="Edit notes"
                    className="press-scale w-8 h-8 rounded-full text-orange-600 flex items-center justify-center"
                  >
                    <Pencil size={14} />
                  </button>
                ) : null
              }
            />

            {billNotes ? (
              <FieldBlock label="Bill notes" value={billNotes} empty="" />
            ) : null}

            {isOrderStop || stop.items?.length ? (
              <div className="mt-auto pt-5">
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Order
                    </p>
                    {stop.total_amount != null ? (
                      <p className="text-[16px] font-extrabold text-orange-600">
                        {money(stop.total_amount)}
                      </p>
                    ) : null}
                  </div>

                  {stop.items?.length ? (
                    <ul className="mt-3 space-y-2.5">
                      {stop.items.map((item) => (
                        <li
                          key={item.order_item_id}
                          className="flex justify-between gap-3 text-[14px]"
                        >
                          <span className="font-semibold text-gray-900 min-w-0 leading-snug">
                            {item.quantity}× {item.dish_name}
                            {item.variant_name ? (
                              <span className="block text-[12px] font-medium text-gray-500 mt-0.5">
                                {item.variant_name}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 font-bold text-gray-600">
                            {money(item.total_price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {isOrderStop && !stop.is_paid ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={paymentBusy}
                        onClick={() => onMarkPaid?.(stop)}
                        className="press-scale h-11 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {markingPaid ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <>
                            <Check size={15} strokeWidth={2.5} />
                            Paid
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={paymentBusy}
                        onClick={() => onCredit?.(stop)}
                        className="press-scale h-11 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {payingExtra ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <>
                            <Wallet size={14} strokeWidth={2.5} />
                            Credit
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-auto" />
            )}
          </div>
        </article>
      </div>

      <div className="relative z-10 shrink-0 px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-orange-100/60 bg-white/85 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={index <= 0}
            aria-label="Previous stop"
            className="press-scale w-[40%] h-11 rounded-full border border-gray-300 bg-gray-100 text-gray-800 px-3 flex items-center justify-center gap-1 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:opacity-100"
          >
            <ChevronLeft size={18} className="shrink-0" />
            <span className="text-[13px] font-semibold truncate">Previous</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="press-scale w-[60%] h-11 rounded-full bg-orange-500 text-white px-3.5 flex items-center justify-between gap-2"
          >
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-100 leading-none">
                {isLast ? "End" : "Next"}
              </p>
              <p className="text-[13px] font-semibold truncate mt-0.5 leading-tight">
                {isLast
                  ? "Back to list"
                  : nextStop?.customer_name || "Next stop"}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 opacity-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutePreview;
