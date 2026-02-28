"use client";

// Professional Free-Transform Cropper with real-time preview
import React, { useEffect, useMemo, useRef, useState } from "react";

type CropHandle =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

type CropModePreset = "PROFILE" | "ID_CARD";
type CropMode = "free" | "locked";

// Export CropResult type for external imports
export type CropResult = {
  blob: Blob;
  mime: "image/jpeg" | "image/png";
  width: number; // output px
  height: number; // output px
  cropInImagePx: { x: number; y: number; w: number; h: number };
};

type Props = {
  src?: string | null;
  preset?: CropModePreset;
  /** For final output dimensions */
  outputSize?: { width: number; height: number } | null;
  /** ID card ratio (default 85.6/54 ~= 1.585185) */
  idCardRatio?: number;
  onChangeSrc?: (src: string | null) => void;
  onCropped?: (result: CropResult) => void;
  /** Hide export buttons */
  hideExportButtons?: boolean;
  /** Show confirm button */
  showConfirmButton?: boolean;
  /** Show real-time preview panel */
  showPreview?: boolean;
};

type Rect = { x: number; y: number; w: number; h: number };

// Dimension specifications for validation
const DIMENSION_SPECS = {
  PROFILE: {
    minWidth: 150,
    minHeight: 150,
    physicalWidth: 40, // mm
    physicalHeight: 60, // mm (portrait)
    outputWidth: 240, // px
    outputHeight: 360, // px
    labelAr: "4×6 سم (طولي)",
  },
  ID_CARD: {
    minWidth: 200,
    minHeight: 127,
    physicalWidth: 85.6, // mm
    physicalHeight: 53.98, // mm
    outputWidth: 322, // px
    outputHeight: 204, // px
    labelAr: "85.6×53.98 مم (قياس عالمي معياري)",
  },
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function rectNormalize(r: Rect): Rect {
  let { x, y, w, h } = r;
  if (w < 0) {
    x += w;
    w = Math.abs(w);
  }
  if (h < 0) {
    y += h;
    h = Math.abs(h);
  }
  return { x, y, w, h };
}

function getCursor(handle: CropHandle): string {
  switch (handle) {
    case "move": return "move";
    case "n":
    case "s": return "ns-resize";
    case "e":
    case "w": return "ew-resize";
    case "ne":
    case "sw": return "nesw-resize";
    case "nw":
    case "se": return "nwse-resize";
    default: return "default";
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function FreeCropper({
  src,
  preset = "PROFILE",
  outputSize = null,
  idCardRatio = 85.6 / 54,
  onChangeSrc,
  onCropped,
  hideExportButtons = false,
  showConfirmButton = false,
  showPreview = true,
}: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [editorSize, setEditorSize] = useState<{ w: number; h: number }>({ w: 900, h: 520 });

  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);

  const [cropMode, setCropMode] = useState<CropMode>(preset === "ID_CARD" ? "locked" : "free");
  const [currentRatio, setCurrentRatio] = useState(preset === "ID_CARD" ? idCardRatio : 0);

  // crop rect in EDITOR (screen) coords
  const [crop, setCrop] = useState<Rect>({ x: 100, y: 80, w: 360, h: 220 });

  const [drag, setDrag] = useState<{
    active: boolean;
    handle: CropHandle;
    startX: number;
    startY: number;
    startCrop: Rect;
  } | null>(null);

  const specs = DIMENSION_SPECS[preset];

  // === Derived: image display box inside editor ===
  const display = useMemo(() => {
    if (!imgNatural) return null;
    const baseScale = Math.min(editorSize.w / imgNatural.w, editorSize.h / imgNatural.h);
    const scale = baseScale * zoom;
    const dispW = imgNatural.w * scale;
    const dispH = imgNatural.h * scale;
    const offsetX = (editorSize.w - dispW) / 2;
    const offsetY = (editorSize.h - dispH) / 2;
    return { baseScale, scale, dispW, dispH, offsetX, offsetY };
  }, [imgNatural, editorSize, zoom]);

  const imageBounds = useMemo(() => {
    if (!display) return { left: 0, top: 0, right: editorSize.w, bottom: editorSize.h };
    return {
      left: display.offsetX,
      top: display.offsetY,
      right: display.offsetX + display.dispW,
      bottom: display.offsetY + display.dispH,
    };
  }, [display, editorSize]);

  // === Resize observer ===
  useEffect(() => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setEditorSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // === Load image ===
  useEffect(() => {
    let canceled = false;
    async function run() {
      if (!src) {
        imgRef.current = null;
        setImgNatural(null);
        return;
      }
      const img = await loadImage(src);
      if (canceled) return;
      imgRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });

      setZoom(1);
      setCropMode(preset === "ID_CARD" ? "locked" : "free");
      setCurrentRatio(preset === "ID_CARD" ? idCardRatio : 0);

      requestAnimationFrame(() => {
        const b = editorRef.current?.getBoundingClientRect() ?? { width: 900, height: 520 };
        const ew = b.width ?? 900;
        const eh = b.height ?? 520;
        const pad = 40;
        let w = Math.max(specs.minWidth, ew - pad * 2);
        let h = Math.max(specs.minHeight, eh - pad * 2);

        if (preset === "ID_CARD") {
          const r = idCardRatio;
          if (w / h > r) w = h * r;
          else h = w / r;
        }

        setCrop({ x: (ew - w) / 2, y: (eh - h) / 2, w, h });
      });
    }
    run().catch(() => {});
    return () => { canceled = true; };
  }, [src, preset, idCardRatio]);

  // === Update preview ===
  useEffect(() => {
    if (!showPreview || !src || !crop || !previewCanvasRef.current || !imgRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set preview canvas to output size
    const targetWidth = outputSize?.width ?? specs.outputWidth;
    const targetHeight = outputSize?.height ?? specs.outputHeight;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Get crop in image coordinates
    const cropPx = getCropInImagePx();
    if (!cropPx) return;

    // Draw cropped and scaled preview
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      imgRef.current,
      cropPx.x, cropPx.y, cropPx.w, cropPx.h,
      0, 0, targetWidth, targetHeight
    );
  }, [crop, zoom, showPreview, src, outputSize]);

  // === Helper functions ===
  function getCropInImagePx(): { x: number; y: number; w: number; h: number } | null {
    if (!display || !imgNatural) return null;
    const { scale, offsetX, offsetY } = display;
    const x = (crop.x - offsetX) / scale;
    const y = (crop.y - offsetY) / scale;
    const w = crop.w / scale;
    const h = crop.h / scale;
    const cx = clamp(x, 0, imgNatural.w);
    const cy = clamp(y, 0, imgNatural.h);
    const cw = clamp(w, 1, imgNatural.w - cx);
    const ch = clamp(h, 1, imgNatural.h - cy);
    return { x: Math.round(cx), y: Math.round(cy), w: Math.round(cw), h: Math.round(ch) };
  }

  function constrainRectToBounds(r: Rect): Rect {
    let nr = rectNormalize(r);
    const b = imageBounds;

    // Apply minimum size constraints
    nr.w = Math.max(specs.minWidth, nr.w);
    nr.h = Math.max(specs.minHeight, nr.h);

    // Keep within image bounds
    nr.x = clamp(nr.x, b.left, b.right - nr.w);
    nr.y = clamp(nr.y, b.top, b.bottom - nr.h);

    // Adjust if bounds are smaller than min size
    nr.w = Math.min(nr.w, b.right - nr.x);
    nr.h = Math.min(nr.h, b.bottom - nr.y);

    return nr;
  }

  function applyAspectRatio(r: Rect, handle: CropHandle, aspect: number): Rect {
    const nr = rectNormalize(r);
    const { x, y, w, h } = nr;

    // Determine anchor point based on handle
    const getAnchor = () => {
      switch (handle) {
        case "nw":
        case "n":
        case "w": return { ax: x + w, ay: y + h };
        case "ne": return { ax: x, ay: y + h };
        case "sw": return { ax: x + w, ay: y };
        case "se":
        case "s":
        case "e": return { ax: x, ay: y };
        default: return { ax: x, ay: y };
      }
    };

    const anchor = getAnchor();

    // Calculate new dimensions preserving aspect ratio
    let newW = w;
    let newH = h;

    const isVerticalEdge = handle === "n" || handle === "s";
    const isHorizontalEdge = handle === "e" || handle === "w";

    if (isVerticalEdge) {
      newW = h * aspect;
    } else if (isHorizontalEdge) {
      newH = w / aspect;
    } else {
      // Corner: choose dimension that changed more
      const wFromH = h * aspect;
      const hFromW = w / aspect;
      if (Math.abs(wFromH - w) < Math.abs(hFromW - h)) {
        newW = wFromH;
      } else {
        newH = hFromW;
      }
    }

    // Rebuild rect from anchor
    return {
      x: anchor.ax - newW,
      y: anchor.ay - newH,
      w: newW,
      h: newH,
    };
  }

  // === Event handlers ===
  function onPointerDown(handle: CropHandle, e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({
      active: true,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: crop,
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag?.active) return;
    e.preventDefault();

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    let next: Rect = { ...drag.startCrop };

    if (drag.handle === "move") {
      next.x += dx;
      next.y += dy;
      next = constrainRectToBounds(next);
      setCrop(next);
      return;
    }

    // Calculate new rect based on handle
    const { x, y, w, h } = drag.startCrop;
    let nLeft = x, nTop = y, nRight = x + w, nBottom = y + h;

    switch (drag.handle) {
      case "n": nTop += dy; break;
      case "s": nBottom += dy; break;
      case "e": nRight += dx; break;
      case "w": nLeft += dx; break;
      case "ne": nTop += dy; nRight += dx; break;
      case "nw": nTop += dy; nLeft += dx; break;
      case "se": nBottom += dy; nRight += dx; break;
      case "sw": nBottom += dy; nLeft += dx; break;
    }

    next = rectNormalize({ x: nLeft, y: nTop, w: nRight - nLeft, h: nBottom - nTop });

    // Apply aspect ratio if locked
    if (cropMode === "locked" && currentRatio > 0) {
      next = applyAspectRatio(next, drag.handle, currentRatio);
    }

    next = constrainRectToBounds(next);
    setCrop(next);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!drag?.active) return;
    e.preventDefault();
    setDrag(null);
  }

  async function exportCropped(mime: "image/jpeg" | "image/png" = "image/jpeg") {
    const img = imgRef.current;
    const cropPx = getCropInImagePx();
    if (!img || !cropPx) return;

    const target = outputSize
      ? { w: outputSize.width, h: outputSize.height }
      : { w: cropPx.w, h: cropPx.h };

    // Prevent upscaling small images
    if (cropPx.w < specs.outputWidth || cropPx.h < specs.outputHeight) {
      console.warn("Image is smaller than target output size");
    }

    const canvas = document.createElement("canvas");
    canvas.width = target.w;
    canvas.height = target.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, cropPx.x, cropPx.y, cropPx.w, cropPx.h, 0, 0, target.w, target.h);

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b as Blob), mime, mime === "image/jpeg" ? 0.95 : undefined);
    });

    onCropped?.({ blob, mime, width: target.w, height: target.h, cropInImagePx: cropPx });
  }

  function reset() {
    if (!editorRef.current || !imgNatural) return;
    const ew = editorRef.current.clientWidth;
    const eh = editorRef.current.clientHeight;
    const pad = 40;
    let w = Math.max(specs.minWidth, ew - pad * 2);
    let h = Math.max(specs.minHeight, eh - pad * 2);

    if (preset === "ID_CARD") {
      const r = idCardRatio;
      if (w / h > r) w = h * r; else h = w / r;
      setCropMode("locked");
      setCurrentRatio(r);
    } else {
      setCropMode("free");
    }

    setZoom(1);
    setCrop({ x: (ew - w) / 2, y: (eh - h) / 2, w, h });
  }

  // === Computed values ===
  const cropPx = getCropInImagePx();
  const liveDims = cropPx ? `${cropPx.w}×${cropPx.h}px` : "--";
  const aspectRatio = cropPx ? (cropPx.w / cropPx.h).toFixed(3) : "--";
  const outputDims = outputSize ?? { width: specs.outputWidth, height: specs.outputHeight };

  // === Alignment guides (smart guides) ===
  const alignmentGuides = useMemo(() => {
    if (!showGuides || !display || !imgNatural) return null;

    const guides: { x: number; y: number; type: "v" | "h" }[] = [];
    const { offsetX, offsetY, dispW, dispH } = display;

    // Center guides
    guides.push({ x: offsetX + dispW / 2, y: 0, type: "v" });
    guides.push({ x: 0, y: offsetY + dispH / 2, type: "h" });

    // Thirds
    guides.push({ x: offsetX + dispW / 3, y: 0, type: "v" });
    guides.push({ x: offsetX + (dispW * 2) / 3, y: 0, type: "v" });
    guides.push({ x: 0, y: offsetY + dispH / 3, type: "h" });
    guides.push({ x: 0, y: offsetY + (dispH * 2) / 3, type: "h" });

    return guides;
  }, [showGuides, display, imgNatural]);

  // === Render ===
  return (
    <div className="w-full space-y-4 font-cairo">
      {/* Main Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-gradient-to-r from-slate-50 to-blue-50 p-4 shadow-sm">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 rounded-lg bg-white p-1 border">
          <button
            type="button"
            onClick={() => { setCropMode("free"); setCurrentRatio(0); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              cropMode === "free"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            وضع حر
          </button>
          <button
            type="button"
            onClick={() => {
              setCropMode("locked");
              setCurrentRatio(preset === "ID_CARD" ? idCardRatio : cropPx ? cropPx.w / cropPx.h : 1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              cropMode === "locked"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            تثبيت النسبة
          </button>
        </div>

        {/* Ratio Snap (ID Card only) */}
        {preset === "ID_CARD" && cropMode === "locked" && (
          <button
            type="button"
            onClick={() => { setCurrentRatio(idCardRatio); setCropMode("locked"); }}
            className="px-3 py-2 rounded-lg text-sm border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
          >
            نسبة البطاقة ({idCardRatio.toFixed(3)}:1)
          </button>
        )}

        <div className="h-8 w-px bg-gray-300" />

        {/* Zoom Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">التقريب</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{zoom.toFixed(2)}x</span>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        {/* Toggles */}
        <button
          type="button"
          onClick={() => setShowGrid(g => !g)}
          className={`p-2 rounded-lg transition-colors ${
            showGrid ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title="شبكة القص"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4M4 12h4M4 20h4M12 4h4M12 12h4M12 20h4M20 4h4M20 12h4M20 20h4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setShowGuides(g => !g)}
          className={`p-2 rounded-lg transition-colors ${
            showGuides ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title="خطوط الإرشاد"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={reset}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title="إعادة تعيين"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Live Info */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">القص الحالي</div>
            <div className="text-sm font-bold text-gray-800 font-mono">{liveDims}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">نسبة الأبعاد</div>
            <div className="text-sm font-bold text-gray-800 font-mono">{aspectRatio}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">الحجم الناتج</div>
            <div className="text-sm font-bold text-green-700 font-mono">{outputDims.width}×{outputDims.height}px</div>
          </div>

          {/* Action Buttons */}
          {!hideExportButtons && (
            <>
              <button
                type="button"
                onClick={() => exportCropped("image/jpeg")}
                className="px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
                disabled={!src}
              >
                JPG
              </button>
              <button
                type="button"
                onClick={() => exportCropped("image/png")}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
                disabled={!src}
              >
                PNG
              </button>
            </>
          )}
          {showConfirmButton && (
            <button
              type="button"
              onClick={() => exportCropped("image/jpeg")}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
              disabled={!src}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                تأكيد القص
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Editor + Preview Grid */}
      <div className={`grid gap-4 ${showPreview ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
        {/* Editor Column */}
        <div className={showPreview ? "lg:col-span-2" : ""}>
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Dimension Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 flex items-center justify-between">
              <span className="text-white text-sm font-medium">
                منطقة القص - {specs.labelAr}
              </span>
              <span className="text-white/80 text-xs">
                المقاس النهائي: {specs.physicalWidth}×{specs.physicalHeight} مم
              </span>
            </div>

            {/* Editor Area */}
            <div
              ref={editorRef}
              className="relative"
              style={{ height: "480px" }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Source Image */}
              {src ? (
                <img
                  ref={imgRef as React.RefObject<HTMLImageElement>}
                  src={src}
                  alt="Crop source"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none"
                  style={{
                    width: display ? `${display.dispW}px` : "auto",
                    height: display ? `${display.dispH}px` : "auto",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">لا توجد صورة محملة</p>
                  </div>
                </div>
              )}

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Alignment Guides */}
              {alignmentGuides?.map((guide, i) => (
                <div
                  key={i}
                  className={`absolute pointer-events-none ${
                    guide.type === "v"
                      ? "top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"
                      : "left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
                  }`}
                  style={{
                    [guide.type === "v" ? "left" : "top"]: `${guide.type === "v" ? guide.x : guide.y}px`,
                  }}
                />
              ))}

              {/* Crop Area */}
              <div
                className="absolute"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
              >
                {/* Clear area inside crop */}
                <div className="absolute inset-0 bg-transparent" />

                {/* Crop Border */}
                <div className="absolute inset-0 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />

                {/* Rule of Thirds Grid */}
                {showGrid && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/50" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/50" />
                    <div className="absolute left-0 top-1/3 h-px w-full bg-white/50" />
                    <div className="absolute left-0 top-2/3 h-px w-full bg-white/50" />
                  </div>
                )}

                {/* Dimension Labels on edges */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Math.round(crop.h)}px
                </div>
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Math.round(crop.h)}px
                </div>
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 -translate-x-full bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Math.round(crop.w)}px
                </div>
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 translate-x-full bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Math.round(crop.w)}px
                </div>

                {/* Move Handle (center) */}
                <div
                  onPointerDown={(e) => onPointerDown("move", e)}
                  className="absolute inset-0 cursor-move"
                  style={{ cursor: getCursor("move") }}
                />

                {/* Corner Handles */}
                {[
                  { handle: "nw" as const, className: "-top-1.5 -left-1.5 cursor-nwse-resize" },
                  { handle: "ne" as const, className: "-top-1.5 -right-1.5 cursor-nesw-resize" },
                  { handle: "sw" as const, className: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
                  { handle: "se" as const, className: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
                ].map(({ handle, className }) => (
                  <div
                    key={handle}
                    onPointerDown={(e) => onPointerDown(handle, e)}
                    className={`absolute w-5 h-5 bg-white rounded-sm shadow-lg border-2 border-blue-500 hover:bg-blue-50 hover:scale-110 transition-transform ${className}`}
                    style={{ cursor: getCursor(handle) }}
                  />
                ))}

                {/* Edge Handles */}
                {[
                  { handle: "n" as const, className: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize" },
                  { handle: "s" as const, className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize" },
                  { handle: "e" as const, className: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize" },
                  { handle: "w" as const, className: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize" },
                ].map(({ handle, className }) => (
                  <div
                    key={handle}
                    onPointerDown={(e) => onPointerDown(handle, e)}
                    className={`absolute w-8 h-2 bg-white rounded-sm shadow-md border border-blue-400 hover:bg-blue-50 transition-colors ${className}`}
                    style={{ cursor: getCursor(handle) }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">تعليمات القص:</p>
                <ul className="text-xs space-y-0.5 text-blue-700">
                  <li>• اسحب المقابض في الزوايا والحواف لضبط القص بحرية</li>
                  <li>• استخدم الوضع الحر للتقريب أي أبعاد، أو ثبت النسبة لأبعاد ثابتة</li>
                  <li>• الصورة الناتجة ستكون بالمقاس: <span className="font-bold">{specs.labelAr}</span></li>
                  <li>• الحجم الناتج: <span className="font-bold">{specs.outputWidth}×{specs.outputHeight} بكسل</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2">
                <span className="text-white text-sm font-medium">معاينة حية</span>
              </div>
              <div className="p-4">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: "200px" }}>
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto shadow-md rounded"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      imageRendering: "high-quality",
                    }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-500">الحجم الناتج</div>
                  <div className="text-sm font-bold text-gray-800">{outputDims.width} × {outputDims.height} px</div>
                  <div className="text-xs text-gray-400 mt-1">{specs.labelAr}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
