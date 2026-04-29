import React, { useEffect, useRef, useState } from 'react';
import { Type, Sliders, Grid3x3, Palette, Eye, Lock } from 'lucide-react';

export type WatermarkPosition = 'center_diagonal' | 'bottom_right' | 'tiled';
export type WatermarkColor = 'white' | 'black' | 'custom';

export interface WatermarkConfig {
  text: string;
  opacity: number;          // 10–80
  position: WatermarkPosition;
  color: WatermarkColor;
  customHex: string;        // only used when color === 'custom'
  enabled: boolean;
}

export const DEFAULT_WATERMARK: WatermarkConfig = {
  text: '',
  opacity: 40,
  position: 'bottom_right',
  color: 'white',
  customHex: '#ffffff',
  enabled: false,
};

/** Applies a watermark to an HTMLImageElement and returns a data URL. */
export function applyWatermarkToImage(
  imgEl: HTMLImageElement,
  config: WatermarkConfig,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width || 800;
  canvas.height = imgEl.naturalHeight || imgEl.height || 600;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

  if (!config.enabled || !config.text.trim()) {
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  const resolvedColor =
    config.color === 'custom'
      ? config.customHex
      : config.color === 'white'
      ? '#ffffff'
      : '#000000';

  const alpha = config.opacity / 100;
  ctx.globalAlpha = alpha;

  const fontSize = Math.max(14, Math.round(canvas.width * 0.035));
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = resolvedColor;
  ctx.shadowColor = config.color === 'white' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 4;

  const text = config.text.trim();
  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;
  const textH = fontSize * 1.2;

  if (config.position === 'bottom_right') {
    const x = canvas.width - textW - 20;
    const y = canvas.height - 20;
    ctx.fillText(text, x, y);
  } else if (config.position === 'center_diagonal') {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(fontSize * 1.8)}px Inter, Arial, sans-serif`;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  } else if (config.position === 'tiled') {
    const tileW = textW + 80;
    const tileH = textH + 60;
    ctx.save();
    ctx.rotate(-Math.PI / 8);
    for (let y = -canvas.height; y < canvas.height * 2; y += tileH) {
      for (let x = -canvas.width; x < canvas.width * 2; x += tileW) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  return canvas.toDataURL('image/jpeg', 0.92);
}

// ────────────────────────────────────────────────────────────────────────────
// Live preview canvas hook
// ────────────────────────────────────────────────────────────────────────────
function useWatermarkPreview(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: WatermarkConfig,
  previewSrc: string,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);

      if (!config.enabled || !config.text.trim()) return;

      const resolvedColor =
        config.color === 'custom'
          ? config.customHex
          : config.color === 'white'
          ? '#ffffff'
          : '#000000';

      const alpha = config.opacity / 100;
      ctx.globalAlpha = alpha;

      const fontSize = Math.max(10, Math.round(W * 0.05));
      ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
      ctx.fillStyle = resolvedColor;
      ctx.shadowColor = config.color === 'white' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 3;

      const text = config.text.trim();
      const textW = ctx.measureText(text).width;
      const textH = fontSize * 1.2;

      if (config.position === 'bottom_right') {
        ctx.fillText(text, W - textW - 12, H - 12);
      } else if (config.position === 'center_diagonal') {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.round(fontSize * 1.5)}px Inter, Arial, sans-serif`;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      } else {
        const tileW = textW + 40;
        const tileH = textH + 30;
        ctx.save();
        ctx.rotate(-Math.PI / 8);
        for (let y = -H; y < H * 2; y += tileH) {
          for (let x = -W; x < W * 2; x += tileW) {
            ctx.fillText(text, x, y);
          }
        }
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    img.onerror = () => {
      // Draw a plain grey placeholder when the preview image fails
      ctx.fillStyle = '#EAEAEA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#C0D6DF';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Preview', canvas.width / 2, canvas.height / 2);
    };
    img.src = previewSrc;
  }, [canvasRef, config, previewSrc]);
}

// ────────────────────────────────────────────────────────────────────────────
// WatermarkPanel component
// ────────────────────────────────────────────────────────────────────────────
interface WatermarkPanelProps {
  config: WatermarkConfig;
  onChange: (cfg: WatermarkConfig) => void;
  /** First uploaded image data URL shown as preview */
  previewImageSrc?: string;
}

const SAMPLE_IMG =
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=70&auto=format&fit=crop';

const POSITIONS: { value: WatermarkPosition; label: string; icon: React.ReactNode }[] = [
  { value: 'bottom_right',    label: 'Bottom Right',    icon: <span className="text-xs">↘</span> },
  { value: 'center_diagonal', label: 'Centre Diagonal', icon: <span className="text-xs">⤡</span> },
  { value: 'tiled',           label: 'Tiled',           icon: <Grid3x3 className="w-3.5 h-3.5" /> },
];

const COLORS: { value: WatermarkColor; label: string; swatch: string }[] = [
  { value: 'white', label: 'White', swatch: '#ffffff' },
  { value: 'black', label: 'Black', swatch: '#50757A' },
  { value: 'custom', label: 'Custom', swatch: 'linear-gradient(135deg,#f0f,#0ff)' },
];

const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-[#50757A] placeholder:text-[#EAEAEA] focus:outline-none focus:ring-2 focus:ring-[#DD6E42]/20 focus:border-[#DD6E42] transition';

export const WatermarkPanel: React.FC<WatermarkPanelProps> = ({
  config,
  onChange,
  previewImageSrc,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const src = previewImageSrc || SAMPLE_IMG;
  useWatermarkPreview(canvasRef, config, src);

  const set = (patch: Partial<WatermarkConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#50757A] tracking-tight mb-0.5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#DD6E42]" />
            Watermark Protection
          </h2>
          <p className="text-sm text-[#50757A]">
            Bake your brand into every listing photo — the original is never exposed.
          </p>
        </div>
        {/* Master toggle */}
        <button
          type="button"
          onClick={() => set({ enabled: !config.enabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
            config.enabled ? 'bg-[#DD6E42]' : 'bg-[#EAEAEA]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ${
              config.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <hr className="border-[#EAEAEA]" />

      {/* Watermark text */}
      <div>
        <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Type className="w-3 h-3" /> Watermark Text
        </label>
        <input
          value={config.text}
          onChange={e => set({ text: e.target.value })}
          placeholder="e.g. Listed by Jane Wanjiku · 0712 345 678"
          className={inputCls}
          maxLength={80}
          disabled={!config.enabled}
        />
        <p className="text-[11px] text-[#C0D6DF] mt-1">{config.text.length}/80 characters</p>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sliders className="w-3 h-3" /> Opacity — {config.opacity}%
        </label>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          value={config.opacity}
          onChange={e => set({ opacity: Number(e.target.value) })}
          disabled={!config.enabled}
          className="w-full accent-[#DD6E42] h-2"
        />
        <div className="flex justify-between text-[10px] text-[#C0D6DF] mt-1">
          <span>10% (subtle)</span>
          <span>80% (bold)</span>
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-2">
          Position
        </label>
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map(p => (
            <button
              key={p.value}
              type="button"
              disabled={!config.enabled}
              onClick={() => set({ position: p.value })}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all disabled:opacity-40 ${
                config.position === p.value
                  ? 'border-[#DD6E42] bg-[#DD6E42]/5 text-[#50757A]'
                  : 'border-[#EAEAEA] hover:border-[#EAEAEA] text-[#50757A]'
              }`}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-2 flex items-center gap-1">
          <Palette className="w-3 h-3" /> Colour
        </label>
        <div className="flex gap-3 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              disabled={!config.enabled}
              onClick={() => set({ color: c.value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all disabled:opacity-40 ${
                config.color === c.value
                  ? 'border-[#DD6E42] text-[#50757A]'
                  : 'border-[#EAEAEA] text-[#50757A] hover:border-[#EAEAEA]'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-[#EAEAEA] shrink-0"
                style={{ background: c.swatch }}
              />
              {c.label}
            </button>
          ))}
        </div>
        {config.color === 'custom' && (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              value={config.customHex}
              onChange={e => set({ customHex: e.target.value })}
              disabled={!config.enabled}
              className="w-10 h-10 rounded cursor-pointer border border-[#EAEAEA] p-0.5 bg-white"
            />
            <input
              value={config.customHex}
              onChange={e => set({ customHex: e.target.value })}
              placeholder="#ffffff"
              maxLength={7}
              disabled={!config.enabled}
              className={`${inputCls} w-32`}
            />
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPreview(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#EAEAEA] hover:bg-[#EAEAEA] transition"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-[#50757A]">
            <Eye className="w-4 h-4 text-[#DD6E42]" />
            Live Preview
          </span>
          <span className="text-xs text-[#50757A]">{showPreview ? 'Hide' : 'Show'}</span>
        </button>
        {showPreview && (
          <div className="p-4 bg-[#EAEAEA]">
            <canvas
              ref={canvasRef}
              width={560}
              height={320}
              className="w-full rounded-xl object-cover shadow"
              style={{ maxHeight: 320 }}
            />
            {!previewImageSrc && (
              <p className="text-[11px] text-[#C0D6DF] text-center mt-2">
                Using a sample image — your uploaded photo will appear here once added on the Photos step.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info banner */}
      {config.enabled && (
        <div className="flex items-start gap-3 bg-[#DD6E42]/8 border border-[#DD6E42]/20 rounded-xl p-4">
          <Lock className="w-4 h-4 text-[#DD6E42] mt-0.5 shrink-0" />
          <p className="text-xs text-[#50757A]">
            <span className="font-semibold">Watermark Protected</span> — All photos uploaded
            to this listing will have your watermark baked in via Canvas. Seekers will never
            see the original unprotected images.
          </p>
        </div>
      )}
    </div>
  );
};

export default WatermarkPanel;
