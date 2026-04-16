// components/property/StatusViewerModal.tsx
// Full-screen Instagram/WhatsApp-style status viewer — 30 s images, full video, rich footer
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Pause, Play, ChevronLeft, ChevronRight,
  Eye, Zap, ExternalLink, Video, MapPin, Bed, Bath, Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Status } from '../../data/statusData';
import { useNavigate } from 'react-router-dom';

interface Props {
  statuses:     Status[];
  initialIndex: number;
  onClose:      () => void;
  onViewed:     (statusId: number) => void;
}

/** Duration for image slides — 30 seconds */
const IMAGE_DURATION_MS = 30_000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0)   return `${h}h ago`;
  return `${m}m ago`;
}

const StatusViewerModal: React.FC<Props> = ({ statuses, initialIndex, onClose, onViewed }) => {
  const navigate = useNavigate();

  const [statusIdx, setStatusIdx] = useState(initialIndex);
  const [slideIdx,  setSlideIdx]  = useState(0);
  const [progress,  setProgress]  = useState(0);
  const [paused,    setPaused]    = useState(false);

  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef   = useRef<number>(Date.now());
  const elapsedRef     = useRef<number>(0);
  const videoRef       = useRef<HTMLVideoElement | null>(null);

  const currentStatus = statuses[statusIdx];
  const totalSlides   = currentStatus.media.length;
  const currentMedia  = currentStatus.media[slideIdx];
  const isVideo       = currentMedia?.type === 'video';

  // ── Mark viewed ────────────────────────────────────────────────────────────
  useEffect(() => {
    onViewed(currentStatus.id);
  }, [statusIdx, currentStatus.id, onViewed]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const resetProgress = () => {
    setProgress(0);
    elapsedRef.current   = 0;
    startTimeRef.current = Date.now();
  };

  const goNextSlide = useCallback(() => {
    resetProgress();
    if (slideIdx < totalSlides - 1) {
      setSlideIdx((s) => s + 1);
    } else if (statusIdx < statuses.length - 1) {
      setStatusIdx((i) => i + 1);
      setSlideIdx(0);
    } else {
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIdx, totalSlides, statusIdx, statuses.length, onClose]);

  const goPrevSlide = useCallback(() => {
    resetProgress();
    if (slideIdx > 0) {
      setSlideIdx((s) => s - 1);
    } else if (statusIdx > 0) {
      setStatusIdx((i) => i - 1);
      setSlideIdx(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIdx, statusIdx]);

  // ── Reset elapsed on slide / status change ──────────────────────────────────
  useEffect(() => {
    resetProgress();
  }, [slideIdx, statusIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Image timer (not used for video) ───────────────────────────────────────
  useEffect(() => {
    if (isVideo) return; // video drives itself via onTimeUpdate / onEnded
    if (paused) return;

    startTimeRef.current = Date.now() - elapsedRef.current;

    intervalRef.current = setInterval(() => {
      const spent = Date.now() - startTimeRef.current;
      const pct   = Math.min((spent / IMAGE_DURATION_MS) * 100, 100);
      elapsedRef.current = spent;
      setProgress(pct);
      if (pct >= 100) goNextSlide();
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, slideIdx, statusIdx, isVideo, goNextSlide]);

  // ── Pause / play ───────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      if (isVideo && videoRef.current) {
        next ? videoRef.current.pause() : videoRef.current.play();
      }
      return next;
    });
  }, [isVideo]);

  // Sync video element when paused flag changes externally (e.g. keyboard)
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    paused ? videoRef.current.pause() : videoRef.current.play();
  }, [paused, isVideo]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') goNextSlide();
      if (e.key === 'ArrowLeft')  goPrevSlide();
      if (e.key === ' ')          { e.preventDefault(); togglePause(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNextSlide, goPrevSlide, onClose, togglePause]);

  // ── Video progress handlers ────────────────────────────────────────────────
  const handleVideoTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const handleVideoEnded = useCallback(() => {
    goNextSlide();
  }, [goNextSlide]);

  // ── Property detail helpers ────────────────────────────────────────────────
  const pd = currentStatus.propertyDetails;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        {/* ── Card ── */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{ scale: 0.92,    opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-sm h-[88vh] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Background media ── */}
          {isVideo ? (
            <video
              key={`${statusIdx}-${slideIdx}`}
              ref={videoRef}
              src={currentMedia.url}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted={false}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
            />
          ) : (
            <img
              key={`${statusIdx}-${slideIdx}`}
              src={currentMedia.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/80 pointer-events-none" />

          {/* ── Progress bars ── */}
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
            {currentStatus.media.map((m, i) => (
              <div key={i} className="relative flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{
                    width: i < slideIdx ? '100%' : i === slideIdx ? `${progress}%` : '0%',
                  }}
                />
                {/* Video indicator dot on the bar */}
                {m.type === 'video' && (
                  <Video className="absolute right-0.5 -top-2 w-2.5 h-2.5 text-white/70" />
                )}
              </div>
            ))}
          </div>

          {/* ── Header ── */}
          <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={currentStatus.owner.avatar}
                  alt={currentStatus.owner.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
                />
                {currentStatus.owner.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#C5A373] rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">✓</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-xs font-bold leading-tight">{currentStatus.owner.name}</p>
                  {currentStatus.owner.role && (
                    <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                      {currentStatus.owner.role}
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-[10px]">{timeAgo(currentStatus.postedAt)}</p>
              </div>
              {currentStatus.isBoosted && (
                <span className="flex items-center gap-0.5 bg-[#C5A373] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                  <Zap className="w-2.5 h-2.5" /> Boosted
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePause}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/30 text-white"
              >
                {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/30 text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Caption (middle) ── */}
          {currentStatus.caption && (
            <div className="absolute left-0 right-0 bottom-[160px] z-20 px-4">
              <p className="text-white text-sm text-center drop-shadow leading-snug bg-black/30 rounded-xl px-3 py-2 backdrop-blur-sm">
                {currentStatus.caption}
              </p>
            </div>
          )}

          {/* ── Left / Right tap zones ── */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={goPrevSlide}
            aria-label="Previous"
          />
          <button
            className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={goNextSlide}
            aria-label="Next"
          />

          {/* ── Footer — property details ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {/* Property title */}
            <p className="text-white font-bold text-sm leading-snug drop-shadow mb-1.5">
              {currentStatus.propertyTitle}
            </p>

            {/* Price & location row */}
            {pd && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                {pd.priceLabel && (
                  <span className="text-[#C5A373] font-extrabold text-sm leading-none">
                    {pd.priceLabel}
                  </span>
                )}
                {pd.location && (
                  <span className="flex items-center gap-0.5 text-white/70 text-xs">
                    <MapPin className="w-3 h-3" /> {pd.location}
                  </span>
                )}
                {pd.category && (
                  <span className="flex items-center gap-0.5 text-white/60 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                    <Tag className="w-2.5 h-2.5" /> {pd.category}
                  </span>
                )}
              </div>
            )}

            {/* Bedrooms / Bathrooms / type row */}
            {pd && (pd.bedrooms || pd.bathrooms || pd.type) && (
              <div className="flex items-center gap-3 mb-2.5">
                {pd.bedrooms != null && (
                  <span className="flex items-center gap-0.5 text-white/70 text-xs">
                    <Bed className="w-3 h-3" /> {pd.bedrooms} bd
                  </span>
                )}
                {pd.bathrooms != null && (
                  <span className="flex items-center gap-0.5 text-white/70 text-xs">
                    <Bath className="w-3 h-3" /> {pd.bathrooms} ba
                  </span>
                )}
                {pd.type && (
                  <span className="text-white/60 text-xs">{pd.type}</span>
                )}
              </div>
            )}

            {/* Views + View Property */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>{currentStatus.views.toLocaleString()} views</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/properties/${currentStatus.propertyId}`);
                }}
                className="flex items-center gap-1.5 bg-[#ff385c] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#e00b41] transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> View Property
              </button>
            </div>
          </div>

          {/* ── Status navigation arrows (desktop) ── */}
          {statusIdx > 0 && (
            <button
              onClick={() => { setStatusIdx((i) => i - 1); setSlideIdx(0); resetProgress(); }}
              className="absolute -left-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {statusIdx < statuses.length - 1 && (
            <button
              onClick={() => { setStatusIdx((i) => i + 1); setSlideIdx(0); resetProgress(); }}
              className="absolute -right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusViewerModal;
