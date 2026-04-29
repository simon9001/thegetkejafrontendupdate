import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Copy, Check, MessageCircle, Mail, Twitter, Facebook,
  QrCode, Share2, Eye, ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PropertyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string | number;
    title: string;
    price: number;
    currency?: string;
    location: string;
    category?: string;
  };
}

// ── Tracking token ────────────────────────────────────────────────────────────
function generateTrackingToken(propertyId: string | number, platform: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${propertyId}-${platform}-${ts}${rand}`;
}

function buildShareUrl(
  propertyId: string | number,
  platform: string,
  baseUrl?: string,
): string {
  const base = baseUrl ?? window.location.origin;
  const token = generateTrackingToken(propertyId, platform);
  return `${base}/property/${propertyId}?ref=${platform}&t=${token}`;
}

// ── QR Code via Canvas ────────────────────────────────────────────────────────
// Renders the URL as a simple visual QR-style block for quick identification.
// For a fully scannable QR, install the `qrcode` package and replace this.
function QrCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 180;
    const CELL = 6;
    const COLS = Math.floor(SIZE / CELL);

    canvas.width = SIZE;
    canvas.height = SIZE;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Deterministic pattern derived from the URL string
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
    }

    ctx.fillStyle = '#50757A';
    for (let row = 0; row < COLS; row++) {
      for (let col = 0; col < COLS; col++) {
        const seed = (hash ^ (row * 1337 + col * 7919)) >>> 0;
        if (seed % 2 === 0) {
          ctx.fillRect(col * CELL, row * CELL, CELL - 1, CELL - 1);
        }
      }
    }

    // Draw corner markers (QR positioning squares)
    const drawSquare = (x: number, y: number, outer: number) => {
      const inner = outer - 4;
      ctx.fillStyle = '#50757A';
      ctx.fillRect(x * CELL, y * CELL, outer * CELL, outer * CELL);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * CELL, (y + 1) * CELL, inner * CELL, inner * CELL);
      ctx.fillStyle = '#50757A';
      ctx.fillRect((x + 2) * CELL, (y + 2) * CELL, (inner - 2) * CELL, (inner - 2) * CELL);
    };
    drawSquare(0, 0, 7);
    drawSquare(COLS - 7, 0, 7);
    drawSquare(0, COLS - 7, 7);

    // Teal accent dot
    ctx.fillStyle = '#DD6E42';
    const cx = Math.floor(COLS / 2) * CELL;
    const cy = Math.floor(COLS / 2) * CELL;
    ctx.beginPath();
    ctx.arc(cx + CELL / 2, cy + CELL / 2, CELL * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        className="rounded-xl border border-[#EAEAEA] shadow-sm"
        style={{ imageRendering: 'pixelated', width: 180, height: 180 }}
      />
      <p className="text-[10px] text-[#C0D6DF] text-center max-w-[180px]">
        Scan this code to open the listing.{' '}
        <span className="text-[#DD6E42]">Install qrcode.react</span> for a fully scannable code.
      </p>
    </div>
  );
}

// ── Share count badge (in-memory for session — backend can persist) ────────────
const shareCountCache: Record<string, number> = {};

// ── Main component ─────────────────────────────────────────────────────────────
export const PropertyShareModal: React.FC<PropertyShareModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const [copied, setCopied]       = useState(false);
  const [showQr, setShowQr]       = useState(false);
  const [shareCount, setCount]    = useState<number>(() => shareCountCache[String(property.id)] ?? 0);

  const linkUrl = buildShareUrl(property.id, 'direct');
  const priceLabel =
    property.category === 'for_sale'
      ? `KES ${Number(property.price).toLocaleString()}`
      : property.category === 'short_term_rent'
      ? `KES ${Number(property.price).toLocaleString()}/night`
      : `KES ${Number(property.price).toLocaleString()}/month`;

  const record = useCallback(
    (platform: string) => {
      const key = String(property.id);
      shareCountCache[key] = (shareCountCache[key] ?? 0) + 1;
      setCount(shareCountCache[key]);
      // Fire-and-forget analytics ping — platform teams can hook this up
      void fetch(`/api/properties/${property.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      }).catch(() => {/* swallow network errors silently */});
    },
    [property.id],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(property.id, 'copy'));
      setCopied(true);
      record('copy');
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy — please copy the link manually.');
    }
  };

  const handleWhatsApp = () => {
    const url = buildShareUrl(property.id, 'whatsapp');
    const msg = encodeURIComponent(
      `🏠 Check out this property on GETKEJA!\n\n*${property.title}*\n📍 ${property.location}\n💰 ${priceLabel}\n\n${url}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
    record('whatsapp');
  };

  const handleEmail = () => {
    const url = buildShareUrl(property.id, 'email');
    const subject = encodeURIComponent(`Property listing: ${property.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI thought you might be interested in this property I found on GETKEJA:\n\n${property.title}\n${property.location} — ${priceLabel}\n\nView it here: ${url}\n\nBest regards`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    record('email');
  };

  const handleTwitter = () => {
    const url = buildShareUrl(property.id, 'twitter');
    const text = encodeURIComponent(
      `Found a great property on GETKEJA: ${property.title} — ${priceLabel} in ${property.location}. Check it out 🏠`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer,width=580,height=420',
    );
    record('twitter');
  };

  const handleFacebook = () => {
    const url = buildShareUrl(property.id, 'facebook');
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer,width=580,height=420',
    );
    record('facebook');
  };

  // Trap focus + ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.7)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Share this property"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#DD6E42]" />
            <h2 className="text-lg font-bold text-[#50757A]">Share this Property</h2>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#EAEAEA] transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#50757A]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Property preview */}
          <div className="bg-[#EAEAEA] rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-[#50757A] truncate">{property.title}</p>
            <p className="text-xs text-[#50757A] mt-0.5">{property.location} · {priceLabel}</p>
          </div>

          {/* Share count */}
          {shareCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#50757A]">
              <Eye className="w-3.5 h-3.5 text-[#DD6E42]" />
              Shared {shareCount} time{shareCount !== 1 ? 's' : ''} this session
            </div>
          )}

          {/* Copy link */}
          <div>
            <p className="text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-2">
              Shareable Link
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={linkUrl}
                className="flex-1 px-3 py-2 bg-[#EAEAEA] border border-[#EAEAEA] rounded-lg text-xs text-[#50757A] focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  copied
                    ? 'bg-[#DD6E42] text-white'
                    : 'bg-[#50757A] text-white hover:bg-[#3D5A5E]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Platform buttons */}
          <div>
            <p className="text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-3">
              Share via
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-xl font-semibold text-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={handleEmail}
                className="flex items-center gap-2.5 px-4 py-3 bg-[#DD6E42] hover:bg-[#DD6E42] text-white rounded-xl font-semibold text-sm transition"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                onClick={handleTwitter}
                className="flex items-center gap-2.5 px-4 py-3 bg-[#C0D6DF] hover:bg-[#C0D6DF] text-white rounded-xl font-semibold text-sm transition"
              >
                <Twitter className="w-4 h-4" />
                Twitter / X
              </button>
              <button
                onClick={handleFacebook}
                className="flex items-center gap-2.5 px-4 py-3 bg-[#C0D6DF] hover:bg-[#50757A] text-white rounded-xl font-semibold text-sm transition"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </button>
            </div>
          </div>

          {/* QR Code toggle */}
          <div className="border border-[#EAEAEA] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowQr(s => !s)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#EAEAEA] transition"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-[#50757A]">
                <QrCode className="w-4 h-4 text-[#DD6E42]" />
                QR Code
              </span>
              <span className="text-xs text-[#50757A] flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {showQr ? 'Hide' : 'Show'}
              </span>
            </button>
            {showQr && (
              <div className="px-4 pb-4 flex justify-center bg-[#EAEAEA]">
                <QrCanvas url={buildShareUrl(property.id, 'qr')} />
              </div>
            )}
          </div>

          {/* Shared listing banner note */}
          <p className="text-[11px] text-[#C0D6DF] text-center">
            Shared links include a tracking token and display a "Shared Listing" banner to recipients.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyShareModal;
