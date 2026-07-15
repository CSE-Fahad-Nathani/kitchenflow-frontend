import { useEffect, useState } from "react";
import { ArrowLeft, CalendarPlus, History } from "lucide-react";
import {
  createSundaySpecial,
  deleteSundaySpecial,
  fetchSundaySpecialById,
  fetchSundaySpecials,
} from "../../api/sundaySpecialApi";
import CreateSundaySpecialView from "../../components/sunday/CreateSundaySpecialView";
import PreviousSundaySpecialsView from "../../components/sunday/PreviousSundaySpecialsView";
import SundaySpecialDetailView from "../../components/sunday/SundaySpecialDetailView";
import PosterPreviewModal from "../../components/sunday/PosterPreviewModal";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToastStore } from "../../store/toastStore";

const newLocalId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const emptyDish = () => ({
  localId: newLocalId(),
  dish_name: "",
  quantity: "",
  price: "",
  note: "",
  imagePreview: null,
  imageSource: null,
});

const toDateInputValue = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Nearest upcoming Sunday (today if already Sunday). */
const upcomingSundayInputValue = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const daysUntilSunday = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + daysUntilSunday);
  return toDateInputValue(d);
};

const revokeImages = (items = []) => {
  items.forEach((item) => {
    if (item.imagePreview) URL.revokeObjectURL(item.imagePreview);
    if (item.imageSource && item.imageSource !== item.imagePreview) {
      URL.revokeObjectURL(item.imageSource);
    }
  });
};

const SundayMenu = () => {
  const toast = useToastStore();

  const [view, setView] = useState("home"); // home | create | previous | detail

  // Create form
  const [specialDate, setSpecialDate] = useState(upcomingSundayInputValue());
  const [title, setTitle] = useState("Sunday Special");
  const [createItems, setCreateItems] = useState([emptyDish()]);
  const [submitting, setSubmitting] = useState(false);
  const [createdThisSession, setCreatedThisSession] = useState(null);

  // Previous list
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [specials, setSpecials] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Detail
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Poster
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterSpecial, setPosterSpecial] = useState(null);

  useEffect(() => {
    if (view !== "previous") return;

    const run = async () => {
      try {
        setListLoading(true);
        const data = await fetchSundaySpecials(debouncedSearch);
        setSpecials(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to load Sunday specials.");
      } finally {
        setListLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, debouncedSearch]);

  useEffect(() => {
    if (view !== "detail" || !selectedId) return;

    const run = async () => {
      try {
        setDetailLoading(true);
        const data = await fetchSundaySpecialById(selectedId);
        setDetail(data);
        setDetailItems(
          (data.items || []).map((item) => ({
            ...item,
            localId: item.item_id || newLocalId(),
            price: item.price ?? "",
            note: item.note || "",
            imagePreview: null,
            imageSource: null,
          }))
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed", "Unable to load special details.");
        setDetail(null);
        setDetailItems([]);
      } finally {
        setDetailLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedId]);

  const headerMeta = {
    home: { title: "Sunday Special", showBack: false },
    create: { title: "Create Special", showBack: true, backTo: "home" },
    previous: { title: "Previous Specials", showBack: true, backTo: "home" },
    detail: { title: "Special Details", showBack: true, backTo: "previous" },
  }[view];

  const resetCreateForm = () => {
    revokeImages(createItems);
    setSpecialDate(upcomingSundayInputValue());
    setTitle("Sunday Special");
    setCreateItems([emptyDish()]);
    setCreatedThisSession(null);
  };

  const handleBack = () => {
    if (view === "create") {
      resetCreateForm();
      setView("home");
      return;
    }

    if (view === "detail") {
      revokeImages(detailItems);
      setDetail(null);
      setDetailItems([]);
      setSelectedId(null);
      setView("previous");
      return;
    }

    if (view === "previous") {
      setSearch("");
      setView("home");
    }
  };

  const handleCreateItemChange = (index, next) => {
    setCreateItems((prev) =>
      prev.map((item, i) => (i === index ? next : item))
    );
  };

  const handleAddCreateItem = () => {
    setCreateItems((prev) => [...prev, emptyDish()]);
  };

  const handleDeleteCreateItem = (index) => {
    setCreateItems((prev) => {
      const target = prev[index];
      if (target?.imagePreview) URL.revokeObjectURL(target.imagePreview);
      if (
        target?.imageSource &&
        target.imageSource !== target.imagePreview
      ) {
        URL.revokeObjectURL(target.imageSource);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateCreate = () => {
    if (!specialDate) {
      toast.error("Missing date", "Please select a special date.");
      return false;
    }

    if (createItems.length === 0) {
      toast.error("No dishes", "Add at least one dish.");
      return false;
    }

    for (let i = 0; i < createItems.length; i++) {
      const item = createItems[i];
      if (!item.dish_name.trim()) {
        toast.error("Missing name", `Dish ${i + 1} needs a name.`);
        return false;
      }
      if (!item.quantity.trim()) {
        toast.error("Missing quantity", `Dish ${i + 1} needs a quantity.`);
        return false;
      }
      if (item.price === "" || Number.isNaN(Number(item.price))) {
        toast.error("Missing price", `Dish ${i + 1} needs a valid price.`);
        return false;
      }
    }

    return true;
  };

  const buildPosterFromCreate = (special_id, special_date, posterTitle) => ({
    special_id,
    special_date,
    title: posterTitle,
    items: createItems.map((item) => ({
      localId: item.localId,
      dish_name: item.dish_name.trim(),
      quantity: item.quantity.trim(),
      price: Number(item.price),
      note: item.note?.trim() || "",
      imagePreview: item.imagePreview,
    })),
  });

  const handleCreatePreview = async () => {
    if (!validateCreate()) return;

    const posterTitle = title.trim() || "Sunday Special";

    if (createdThisSession) {
      setPosterSpecial(
        buildPosterFromCreate(
          createdThisSession,
          specialDate,
          posterTitle
        )
      );
      setPosterOpen(true);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        special_date: specialDate,
        title: posterTitle,
        items: createItems.map((item) => ({
          dish_name: item.dish_name.trim(),
          quantity: item.quantity.trim(),
          price: Number(item.price),
          note: item.note?.trim() || "",
        })),
      };

      const response = await createSundaySpecial(payload);
      const saved = response.data;

      setCreatedThisSession(saved.special_id);
      setPosterSpecial(
        buildPosterFromCreate(
          saved.special_id,
          saved.special_date || specialDate,
          saved.title || posterTitle
        )
      );
      setPosterOpen(true);
      toast.success("Created", "Sunday Special saved. Preview ready.");
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message || "Unable to create Sunday Special.";
      toast.error("Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSpecial = (special) => {
    setSelectedId(special.special_id);
    setView("detail");
  };

  const handleDetailItemChange = (index, next) => {
    setDetailItems((prev) =>
      prev.map((item, i) => (i === index ? next : item))
    );
  };

  const handleDetailPreview = () => {
    if (!detail) return;

    setPosterSpecial({
      special_id: detail.special_id,
      special_date: detail.special_date,
      title: detail.title || "Sunday Special",
      items: detailItems.map((item) => ({
        item_id: item.item_id,
        localId: item.localId,
        dish_name: item.dish_name,
        quantity: item.quantity,
        price: item.price,
        note: item.note || "",
        imagePreview: item.imagePreview,
      })),
    });
    setPosterOpen(true);
  };

  const handleDeleteSpecial = () => {
    if (!detail?.special_id) return;

    toast.confirm({
      title: "Delete Sunday Special?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          setDeleting(true);
          await deleteSundaySpecial(detail.special_id);
          revokeImages(detailItems);
          toast.success("Deleted", "Sunday Special deleted successfully.");
          setDetail(null);
          setDetailItems([]);
          setSelectedId(null);
          setView("previous");
        } catch (error) {
          console.error(error);
          toast.error("Failed", "Unable to delete Sunday Special.");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleClosePoster = () => {
    setPosterOpen(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      <header className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-safe pb-5 rounded-b-[1.5rem] shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-2.5">
          {headerMeta.showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="press-scale mt-1 w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="min-w-0">
            <p className="text-orange-100 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Arefa's Kitchen
            </p>
            <h1 className="text-[1.35rem] font-bold text-white leading-tight mt-0.5 tracking-tight">
              {headerMeta.title}
            </h1>
          </div>
        </div>
      </header>

      {view === "home" && (
        <div className="px-3.5 py-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              resetCreateForm();
              setView("create");
            }}
            className="press-scale w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] active:border-orange-200 active:bg-orange-50/40"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center mb-3">
              <CalendarPlus size={22} />
            </div>
            <p className="text-[15px] font-bold text-gray-900">
              Create New Sunday Special
            </p>
            <p className="text-[12.5px] text-gray-500 mt-1">
              Add dishes, images, and preview a shareable poster
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setView("previous");
            }}
            className="press-scale w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] active:border-orange-200 active:bg-orange-50/40"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center mb-3">
              <History size={22} />
            </div>
            <p className="text-[15px] font-bold text-gray-900">
              Previous Sunday Specials
            </p>
            <p className="text-[12.5px] text-gray-500 mt-1">
              Browse, search, preview, or delete past specials
            </p>
          </button>
        </div>
      )}

      {view === "create" && (
        <CreateSundaySpecialView
          specialDate={specialDate}
          title={title}
          items={createItems}
          submitting={submitting}
          onDateChange={setSpecialDate}
          onTitleChange={setTitle}
          onItemChange={handleCreateItemChange}
          onAddItem={handleAddCreateItem}
          onDeleteItem={handleDeleteCreateItem}
          onPreview={handleCreatePreview}
        />
      )}

      {view === "previous" && (
        <PreviousSundaySpecialsView
          search={search}
          onSearchChange={setSearch}
          loading={listLoading}
          specials={specials}
          onOpen={handleOpenSpecial}
        />
      )}

      {view === "detail" && (
        <SundaySpecialDetailView
          loading={detailLoading}
          special={detail}
          items={detailItems}
          onItemChange={handleDetailItemChange}
          onPreview={handleDetailPreview}
          onDelete={handleDeleteSpecial}
          deleting={deleting}
        />
      )}

      <PosterPreviewModal
        open={posterOpen}
        special={posterSpecial}
        onClose={handleClosePoster}
      />
    </div>
  );
};

export default SundayMenu;
