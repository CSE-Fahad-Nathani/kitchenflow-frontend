import { useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";

const OUTPUT_SIZE = 300;

/**
 * Manual 1:1 crop — pan + zoom, then export a fixed 300×300 image.
 */
const ImageCropModal = ({ open, imageSrc, onCancel, onConfirm }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [boxSize, setBoxSize] = useState(280);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const size = Math.min(el.clientWidth, el.clientHeight, 360);
      setBoxSize(Math.max(220, size));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  useEffect(() => {
    if (!open || !imageSrc) return;

    setNatural({ w: 0, h: 0 });
    setOffset({ x: 0, y: 0 });
    setScale(1);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!natural.w || !natural.h || !boxSize) return;

    const cover = Math.max(boxSize / natural.w, boxSize / natural.h);
    setMinScale(cover);
    setScale(cover);
    setOffset({ x: 0, y: 0 });
  }, [natural, boxSize]);

  if (!open || !imageSrc) return null;

  const clampOffset = (nx, ny, nextScale = scale) => {
    const dispW = natural.w * nextScale;
    const dispH = natural.h * nextScale;
    const maxX = Math.max(0, (dispW - boxSize) / 2);
    const maxY = Math.max(0, (dispH - boxSize) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, nx)),
      y: Math.min(maxY, Math.max(-maxY, ny)),
    };
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy)
    );
  };

  const onPointerUp = (e) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const changeScale = (next) => {
    const clamped = Math.min(Math.max(next, minScale), minScale * 4);
    setScale(clamped);
    setOffset((prev) => clampOffset(prev.x, prev.y, clamped));
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !natural.w) return;

    try {
      setBusy(true);

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      // Map crop box → source image pixels
      const dispW = natural.w * scale;
      const dispH = natural.h * scale;
      const left = (boxSize - dispW) / 2 + offset.x;
      const top = (boxSize - dispH) / 2 + offset.y;

      const sx = ((0 - left) / scale);
      const sy = ((0 - top) / scale);
      const sSize = boxSize / scale;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(
        img,
        sx,
        sy,
        sSize,
        sSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
          "image/jpeg",
          0.92
        );
      });

      const url = URL.createObjectURL(blob);
      onConfirm(url);
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 flex flex-col">
      <div className="shrink-0 flex items-center justify-between px-4 pt-safe pb-3">
        <button
          type="button"
          onClick={onCancel}
          className="press-scale w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center"
          aria-label="Cancel crop"
        >
          <X size={18} />
        </button>
        <p className="text-white text-[14px] font-semibold">Crop Image</p>
        <button
          type="button"
          disabled={busy || !natural.w}
          onClick={handleConfirm}
          className="press-scale w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center disabled:opacity-50"
          aria-label="Apply crop"
        >
          <Check size={18} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex items-center justify-center px-4"
      >
        <div
          className="relative overflow-hidden bg-black touch-none select-none"
          style={{
            width: boxSize,
            height: boxSize,
            borderRadius: 16,
            border: "2px solid rgba(249,115,22,0.9)",
            cursor: dragging ? "grabbing" : "grab",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop"
            draggable={false}
            onLoad={(e) => {
              setNatural({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              });
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: natural.w ? natural.w * scale : "auto",
              height: natural.h ? natural.h * scale : "auto",
              maxWidth: "none",
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-6 pt-3 space-y-3">
        <p className="text-center text-white/70 text-[12px]">
          Drag to reposition · Zoom to frame · Square crop (300×300)
        </p>

        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => changeScale(scale - minScale * 0.15)}
            className="press-scale w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min={minScale}
            max={minScale * 4}
            step={0.01}
            value={scale}
            onChange={(e) => changeScale(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
          <button
            type="button"
            onClick={() => changeScale(scale + minScale * 0.15)}
            className="press-scale w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <button
          type="button"
          disabled={busy || !natural.w}
          onClick={handleConfirm}
          className="press-scale w-full max-w-md mx-auto block h-11 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 disabled:opacity-60"
        >
          {busy ? "Cropping…" : "Use Cropped Image"}
        </button>
      </div>
    </div>
  );
};

export default ImageCropModal;
