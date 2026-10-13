import { create } from "zustand";
import {
  fetchDeliveryRouteSnapshot,
  saveDeliveryRouteSnapshot,
} from "../api/deliveryRouteApi";

const STORAGE_KEY = "kf_delivery_route_snapshot_v2";

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const emptySnapshot = (date = todayKey()) => ({
  date,
  rankedIds: [],
  completedIds: [],
  manualStops: [],
  customerCache: {},
});

const normalizeSnapshot = (raw, fallbackDate = todayKey()) => ({
  date: raw?.date || fallbackDate,
  rankedIds: Array.isArray(raw?.rankedIds) ? raw.rankedIds : [],
  completedIds: Array.isArray(raw?.completedIds) ? raw.completedIds : [],
  manualStops: Array.isArray(raw?.manualStops) ? raw.manualStops : [],
  customerCache:
    raw?.customerCache && typeof raw.customerCache === "object"
      ? raw.customerCache
      : {},
});

const readSnapshot = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySnapshot();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.date !== todayKey()) {
      return emptySnapshot();
    }
    return normalizeSnapshot(parsed);
  } catch {
    return emptySnapshot();
  }
};

const writeSnapshot = (snapshot) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore quota */
  }
};

const persist = (partial) => {
  const next = normalizeSnapshot(partial, partial.date || todayKey());
  writeSnapshot(next);
  return next;
};

const hasSequence = (snap) =>
  Array.isArray(snap?.rankedIds) && snap.rankedIds.length > 0;

let remoteSyncTimer = null;
let remoteSyncInFlight = null;

const pushSnapshotToRemote = async (snapshot) => {
  if (!snapshot?.date) return;
  try {
    await saveDeliveryRouteSnapshot(snapshot.date, {
      rankedIds: snapshot.rankedIds || [],
      completedIds: snapshot.completedIds || [],
      manualStops: snapshot.manualStops || [],
      customerCache: snapshot.customerCache || {},
    });
  } catch (error) {
    console.error("Delivery route remote sync failed:", error);
  }
};

const scheduleRemoteSync = (get) => {
  if (remoteSyncTimer) clearTimeout(remoteSyncTimer);
  remoteSyncTimer = setTimeout(() => {
    const snap = get();
    if (snap.date !== todayKey()) return;
    remoteSyncInFlight = pushSnapshotToRemote(snap);
  }, 700);
};

export const useDeliveryRouteStore = create((set, get) => ({
  ...readSnapshot(),
  /** local | remote | none — set after ensureRemoteHydrated */
  sequenceSource: hasSequence(readSnapshot()) ? "local" : "unknown",
  remoteReady: false,

  /**
   * Local-first hydrate:
   * 1) local today sequence → use it (and push to DB in background)
   * 2) else fetch DB → if found, write local + use
   * 3) else no sequence yet
   */
  ensureRemoteHydrated: async () => {
    const date = todayKey();
    const local = get().date === date ? get() : emptySnapshot(date);

    if (hasSequence(local)) {
      if (get().date !== date) {
        const next = persist(local);
        set({ ...next, sequenceSource: "local", remoteReady: true });
      } else {
        set({ sequenceSource: "local", remoteReady: true });
      }
      scheduleRemoteSync(get);
      return { source: "local" };
    }

    try {
      const remote = await fetchDeliveryRouteSnapshot(date);
      if (remote && hasSequence(remote)) {
        const next = persist({
          date,
          rankedIds: remote.rankedIds,
          completedIds: remote.completedIds,
          manualStops: remote.manualStops,
          customerCache: remote.customerCache,
        });
        set({ ...next, sequenceSource: "remote", remoteReady: true });
        return { source: "remote" };
      }
    } catch (error) {
      console.error("Delivery route remote load failed:", error);
    }

    const empty = persist(emptySnapshot(date));
    set({ ...empty, sequenceSource: "none", remoteReady: true });
    return { source: "none" };
  },

  /**
   * Sync with today's orders. Does NOT auto-rank new orders —
   * they stay unranked until the user taps them.
   */
  hydrateFromOrders: (orders = []) => {
    const date = todayKey();
    const prev = get().date === date ? get() : emptySnapshot(date);
    const orderIds = new Set(
      (orders || []).map((o) => o.order_id).filter(Boolean)
    );

    const manualStops = (prev.manualStops || []).filter(
      (s) => s?.stop_id && s?.customer_id
    );
    const manualIds = new Set(manualStops.map((s) => s.stop_id));
    const knownIds = new Set([...orderIds, ...manualIds]);

    const rankedIds = (prev.rankedIds || []).filter((id) => knownIds.has(id));
    const completedIds = (prev.completedIds || []).filter((id) =>
      knownIds.has(id)
    );

    const next = persist({
      date,
      rankedIds,
      completedIds,
      manualStops,
      customerCache: prev.customerCache || {},
    });
    set({
      ...next,
      sequenceSource: hasSequence(next)
        ? get().sequenceSource === "none"
          ? "local"
          : get().sequenceSource
        : get().remoteReady
          ? "none"
          : get().sequenceSource,
    });
    if (hasSequence(next)) scheduleRemoteSync(get);
  },

  /** Tap an unranked stop → assign next sequence number. */
  assignRank: (stopId) => {
    if (!stopId) return;
    const { rankedIds } = get();
    if (rankedIds.includes(stopId)) return;
    const next = persist({
      ...get(),
      rankedIds: [...rankedIds, stopId],
    });
    set({ rankedIds: next.rankedIds, sequenceSource: "local" });
    scheduleRemoteSync(get);
  },

  /** Remove from sequence (back to unranked). */
  clearRank: (stopId) => {
    const next = persist({
      ...get(),
      rankedIds: get().rankedIds.filter((id) => id !== stopId),
    });
    set({
      rankedIds: next.rankedIds,
      sequenceSource: hasSequence(next) ? "local" : "none",
    });
    scheduleRemoteSync(get);
  },

  clearAllRanks: () => {
    const next = persist({ ...get(), rankedIds: [] });
    set({ rankedIds: [], sequenceSource: "none" });
    scheduleRemoteSync(get);
  },

  moveStop: (stopId, direction) => {
    const { rankedIds } = get();
    const index = rankedIds.indexOf(stopId);
    if (index < 0) return;

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= rankedIds.length) return;

    const nextOrder = [...rankedIds];
    const [item] = nextOrder.splice(index, 1);
    nextOrder.splice(target, 0, item);

    const next = persist({ ...get(), rankedIds: nextOrder });
    set({ rankedIds: nextOrder, sequenceSource: "local" });
    scheduleRemoteSync(get);
  },

  toggleCompleted: (stopId) => {
    const { completedIds } = get();
    const exists = completedIds.includes(stopId);
    const nextCompleted = exists
      ? completedIds.filter((id) => id !== stopId)
      : [...completedIds, stopId];

    const next = persist({ ...get(), completedIds: nextCompleted });
    set({ completedIds: nextCompleted });
    scheduleRemoteSync(get);
  },

  patchCustomerCache: (customer_id, patch) => {
    if (!customer_id) return;
    const customerCache = {
      ...get().customerCache,
      [customer_id]: {
        ...(get().customerCache[customer_id] || {}),
        ...patch,
      },
    };

    const manualStops = (get().manualStops || []).map((s) =>
      s.customer_id === customer_id
        ? {
            ...s,
            customer_name: patch.name ?? s.customer_name,
            customer_mobile: patch.mobile ?? s.customer_mobile,
            customer_address: patch.address ?? s.customer_address,
            customer_notes: patch.notes ?? s.customer_notes,
          }
        : s
    );

    const next = persist({ ...get(), customerCache, manualStops });
    set({ customerCache, manualStops });
    scheduleRemoteSync(get);
  },

  addManualStop: (customer) => {
    if (!customer?.customer_id) return { ok: false, reason: "no_id" };

    const stop_id = `manual-${customer.customer_id}`;
    const { manualStops, rankedIds } = get();

    if (manualStops.some((s) => s.stop_id === stop_id)) {
      return { ok: false, reason: "exists" };
    }

    const entry = {
      stop_id,
      customer_id: customer.customer_id,
      customer_name: customer.name || "Customer",
      customer_mobile: customer.mobile || "",
      customer_address: customer.address || "",
      customer_notes: customer.notes || "",
    };

    const next = persist({
      ...get(),
      manualStops: [...manualStops, entry],
      rankedIds,
    });
    set({ manualStops: next.manualStops });
    scheduleRemoteSync(get);
    return { ok: true, stop_id };
  },

  removeManualStop: (stopId) => {
    const next = persist({
      ...get(),
      manualStops: get().manualStops.filter((s) => s.stop_id !== stopId),
      rankedIds: get().rankedIds.filter((id) => id !== stopId),
      completedIds: get().completedIds.filter((id) => id !== stopId),
    });
    set({
      manualStops: next.manualStops,
      rankedIds: next.rankedIds,
      completedIds: next.completedIds,
      sequenceSource: hasSequence(next) ? "local" : "none",
    });
    scheduleRemoteSync(get);
  },

  clearCompleted: () => {
    const next = persist({ ...get(), completedIds: [] });
    set({ completedIds: [] });
    scheduleRemoteSync(get);
  },

  /** Flush pending remote save (optional, e.g. before unload). */
  flushRemoteSync: async () => {
    if (remoteSyncTimer) {
      clearTimeout(remoteSyncTimer);
      remoteSyncTimer = null;
    }
    if (remoteSyncInFlight) {
      try {
        await remoteSyncInFlight;
      } catch {
        /* ignore */
      }
    }
    await pushSnapshotToRemote(get());
  },
}));
