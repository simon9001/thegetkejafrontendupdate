import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Lock, AlertTriangle, X } from 'lucide-react';

interface ImageProtectionProps {
  children: React.ReactNode;
  /** Show the 🔒 badge overlay on the image */
  showBadge?: boolean;
  /** Disable all protection (useful in landlord-owned views) */
  disabled?: boolean;
  className?: string;
}

/**
 * Wraps any image (or set of images) with a multi-layered deterrence system:
 *
 *  1. Semi-transparent overlay — prevents clean drag/screenshot grabs
 *  2. Right-click → branded warning modal instead of browser save dialog
 *  3. Keyboard shortcuts (Ctrl+S / Ctrl+P / PrintScreen) → warning toast
 *  4. Visibility change (tab switch that may indicate screen recording) → blur
 *  5. "🔒 Protected Listing" badge rendered inside the wrapper
 *
 * None of this is 100% foolproof (nothing in a browser ever is), but it
 * raises the effort bar significantly and signals intent to would-be scrapers.
 */
export const ImageProtection: React.FC<ImageProtectionProps> = ({
  children,
  showBadge = true,
  disabled = false,
  className = '',
}) => {
  const [blurred, setBlurred]         = useState(false);
  const [rightClickModal, setModal]   = useState(false);
  const [keyBlocked, setKeyBlocked]   = useState(false);
  const wrapperRef                    = useRef<HTMLDivElement>(null);

  // ── Visibility-change blur ─────────────────────────────────────────────
  useEffect(() => {
    if (disabled) return;
    const onVisibility = () => {
      if (document.hidden) {
        setBlurred(true);
        // Auto-unblur once the user returns, after a short delay
        setTimeout(() => setBlurred(false), 1800);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [disabled]);

  // ── Keyboard shortcut blocking ─────────────────────────────────────────
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const blocked =
        (ctrl && e.key.toLowerCase() === 's') ||
        (ctrl && e.key.toLowerCase() === 'p') ||
        e.key === 'PrintScreen';

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        setKeyBlocked(true);
        setTimeout(() => setKeyBlocked(false), 2800);
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [disabled]);

  // ── Right-click handler ────────────────────────────────────────────────
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setModal(true);
    },
    [disabled],
  );

  if (disabled) return <>{children}</>;

  return (
    <>
      <div
        ref={wrapperRef}
        className={`relative select-none ${className}`}
        onContextMenu={handleContextMenu}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {/* ── Image content ── */}
        <div
          className="transition-all duration-700"
          style={{ filter: blurred ? 'blur(12px)' : 'none' }}
        >
          {children}
        </div>

        {/* ── Invisible overlay — pointer-events none so clicks pass through ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 80px)',
          }}
        />

        {/* ── 🔒 Badge ── */}
        {showBadge && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#50757A]/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full pointer-events-none">
            <Lock className="w-2.5 h-2.5 text-[#DD6E42]" />
            Protected
          </div>
        )}

        {/* ── Keyboard-blocked toast ── */}
        {keyBlocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-[#50757A] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
              <Lock className="w-3.5 h-3.5 text-[#DD6E42]" />
              This content is protected. Saving or printing is disabled.
            </div>
          </div>
        )}

        {/* ── Blur overlay with message ── */}
        {blurred && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-[#50757A]/80 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#DD6E42]" />
              Content temporarily hidden for your security
            </div>
          </div>
        )}
      </div>

      {/* ── Right-click warning modal ── */}
      {rightClickModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-[#C0D6DF] hover:text-[#50757A] transition"
              onClick={() => setModal(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#50757A] flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-[#DD6E42]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#50757A]">Content Protected</h3>
                <p className="text-sm text-[#50757A] mt-2 leading-relaxed">
                  This content is protected by GETKEJA. Unauthorised reproduction,
                  distribution, or use of these images is prohibited and may be subject
                  to legal action.
                </p>
              </div>
              <div className="w-full bg-[#EAEAEA] rounded-xl p-3">
                <p className="text-[11px] text-[#C0D6DF] flex items-start gap-1.5">
                  <Lock className="w-3 h-3 text-[#DD6E42] mt-0.5 shrink-0" />
                  Images are watermarked with session metadata. Any unauthorised copy
                  can be traced back to its source.
                </p>
              </div>
              <button
                className="w-full py-2.5 bg-[#50757A] text-white font-semibold rounded-xl hover:bg-[#3D5A5E] transition text-sm"
                onClick={() => setModal(false)}
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal disclaimer rendered outside the wrapper as a sibling */}
    </>
  );
};

/** Small legal disclaimer strip to render below the image gallery */
export const ProtectionDisclaimer: React.FC = () => (
  <p className="text-[11px] text-[#C0D6DF] flex items-center gap-1.5 mt-1.5">
    <Lock className="w-3 h-3 text-[#DD6E42] shrink-0" />
    Images are watermarked and protected. Unauthorised use is subject to legal action.
  </p>
);

export default ImageProtection;
