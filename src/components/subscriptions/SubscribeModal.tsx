// components/subscriptions/SubscribeModal.tsx
// Subscription plans modal with a custom Paystack checkout screen.
//  - Free plan  → API subscribe → navigate to home (no payment)
//  - Paid plans → custom checkout UI → Paystack popup → backend verify → activate
import React, { useState, useCallback, useRef } from 'react';
import {
  X, Check, Loader2, Sparkles, Crown, Zap, Star, Lock,
  ShieldCheck, CreditCard, ChevronLeft, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/Slice/AuthSlice';
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeMutation,
  useVerifyPaystackPaymentMutation,
  type SubscriptionPlan,
} from '../../features/Api/SubscriptionsApi';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ACCENTS = [
  { border: 'border-gray-200',  badge: 'bg-gray-100 text-gray-600',  cardBg: 'bg-gray-50',      glow: '' },
  { border: 'border-[#ff385c]', badge: 'bg-[#ff385c] text-white',    cardBg: 'bg-[#fff5f6]',    glow: 'shadow-[0_0_0_3px_rgba(255,56,92,0.12)]' },
  { border: 'border-[#C5A373]', badge: 'bg-[#C5A373] text-white',    cardBg: 'bg-[#fdf8f3]',    glow: 'shadow-[0_0_0_3px_rgba(197,163,115,0.15)]' },
];
const planAccent = (i: number) => ACCENTS[i % ACCENTS.length];

const planIcon = (name: string, free: boolean) => {
  if (free) return <Star className="w-5 h-5" />;
  const n = name.toLowerCase();
  if (n.includes('pro') || n.includes('standard')) return <Zap className="w-5 h-5" />;
  return <Crown className="w-5 h-5" />;
};

const fmt = (n: number) => `KES ${n.toLocaleString()}`;
const isFree = (p: SubscriptionPlan) => p.price_monthly_kes === 0;

const loadPaystackScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) { resolve(); return; }
    const s = document.createElement('script');
    s.src     = 'https://js.paystack.co/v1/inline.js';
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(s);
  });

type Step = 'plans' | 'checkout';

// ── Component ─────────────────────────────────────────────────────────────────
const SubscribeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate        = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser     = useSelector(selectCurrentUser);

  const [billing, setBilling]     = useState<'monthly' | 'annual'>('monthly');
  const [selected, setSelected]   = useState<string | null>(null);
  const [step, setStep]           = useState<Step>('plans');
  const [processing, setProcessing] = useState(false);

  // Keep mutable refs so Paystack's sync callback can read latest values
  const verifyRef     = useRef<ReturnType<typeof useVerifyPaystackPaymentMutation>[0] | null>(null);
  const safeCloseRef  = useRef<() => void>(() => {});
  const navigateRef   = useRef(navigate);
  navigateRef.current = navigate;

  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery(undefined, { skip: !isOpen });
  const { data: mySub } = useGetMySubscriptionQuery(undefined, { skip: !isAuthenticated || !isOpen });

  const [subscribeFree]                          = useSubscribeMutation();
  const [verifyPaystack]                         = useVerifyPaystackPaymentMutation();
  verifyRef.current                              = verifyPaystack;

  const safeClose = useCallback(() => {
    setSelected(null);
    setBilling('monthly');
    setStep('plans');
    setProcessing(false);
    onClose();
  }, [onClose]);
  safeCloseRef.current = safeClose;

  // Redirect to login if opened while not authenticated
  React.useEffect(() => {
    if (isOpen && !isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: '/' } });
    }
  }, [isOpen, isAuthenticated, navigate, onClose]);

  const safeArray = Array.isArray(plans) ? plans : [];
  const selectedPlan = safeArray.find((p) => p.id === selected);

  const priceForPlan = (p: SubscriptionPlan) =>
    billing === 'annual' && p.price_annual_kes
      ? Math.round(p.price_annual_kes / 12)
      : p.price_monthly_kes;

  // ── Activate free plan ────────────────────────────────────────────────────
  const activateFree = useCallback(async (plan: SubscriptionPlan) => {
    setProcessing(true);
    try {
      await subscribeFree({
        plan_id:        plan.id,
        billing_cycle:  'monthly',
        payment_method: 'mpesa',
      }).unwrap();
      toast.success(`You're on the ${plan.name} plan!`);
      safeClose();
      navigate('/');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not activate free plan');
    } finally {
      setProcessing(false);
    }
  }, [subscribeFree, safeClose, navigate]);

  // ── Launch Paystack popup (sync callback — no async!) ─────────────────────
  const launchPaystack = useCallback(async (plan: SubscriptionPlan) => {
    setProcessing(true);
    try {
      await loadPaystackScript();
    } catch {
      toast.error('Could not load payment provider. Check your internet connection.');
      setProcessing(false);
      return;
    }

    const paystackKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY ?? '';
    if (!paystackKey || paystackKey.includes('your_paystack')) {
      toast.error('Paystack key not configured. Add VITE_PAYSTACK_PUBLIC_KEY to .env');
      setProcessing(false);
      return;
    }

    // Snapshot values that the sync callback needs
    const planId       = plan.id;
    const planName     = plan.name;
    const billingCycle = billing;
    const amountKobo   = priceForPlan(plan) * 100;
    const ref          = `GK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const email        = currentUser?.email ?? '';

    (window as any).PaystackPop.setup({
      key:      paystackKey,
      email,
      amount:   amountKobo,
      currency: 'KES',
      ref,
      metadata: {
        custom_fields: [
          { display_name: 'Plan',     variable_name: 'plan',     value: planName     },
          { display_name: 'Billing',  variable_name: 'billing',  value: billingCycle },
        ],
      },
      onClose: function () {
        setProcessing(false);
      },
      // IMPORTANT: Paystack rejects async functions — use regular function + .then()
      callback: function (response: { reference: string }) {
        const verify   = verifyRef.current;
        const close    = safeCloseRef.current;
        const nav      = navigateRef.current;
        if (!verify) return;
        verify({ plan_id: planId, billing_cycle: billingCycle, paystack_reference: response.reference })
          .unwrap()
          .then(function () {
            toast.success(`You\'re now on the ${planName} plan! 🎉`);
            close();
            nav('/');
          })
          .catch(function (err: any) {
            toast.error(err?.data?.message ?? 'Payment received but activation failed — contact support');
            setProcessing(false);
          });
      },
    }).openIframe();
  }, [billing, priceForPlan, currentUser]);

  // ── "Continue" button handler ─────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (!selectedPlan) return;
    if (isFree(selectedPlan)) {
      activateFree(selectedPlan);
    } else {
      launchPaystack(selectedPlan);
    }
  }, [selectedPlan, activateFree, launchPaystack]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={safeClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="
              fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2
              z-50 w-full sm:w-[660px] lg:w-[800px]
              bg-white rounded-t-3xl sm:rounded-3xl
              shadow-[rgba(0,0,0,0.25)_0px_20px_60px]
              max-h-[90vh] overflow-y-auto
            "
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {step === 'checkout' && (
                  <button
                    onClick={() => setStep('plans')}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 mr-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <Sparkles className="w-5 h-5 text-[#C5A373]" />
                <h2 className="text-lg font-black text-[#222]">
                  {step === 'plans' ? 'Choose Your Plan' : 'Complete Your Subscription'}
                </h2>
              </div>
              <button onClick={safeClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 pb-8 pt-4">
              <AnimatePresence mode="wait">

                {/* ════════════════ STEP 1 — PLAN PICKER ════════════════ */}
                {step === 'plans' && (
                  <motion.div key="plans" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>

                    {/* Active sub banner */}
                    {mySub && (
                      <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Active: {mySub.plan?.name ?? 'Unknown'} plan</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            {mySub.credits_remaining} viewing credits · renews {new Date(mySub.renews_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Billing toggle */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex bg-gray-100 rounded-full p-1 gap-1">
                        {(['monthly', 'annual'] as const).map((b) => (
                          <button
                            key={b}
                            onClick={() => setBilling(b)}
                            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                              billing === b ? 'bg-white text-[#222] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {b === 'monthly' ? 'Monthly' : (
                              <span className="flex items-center gap-1.5">
                                Annual
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">SAVE</span>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Plan cards */}
                    {plansLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C5A373]" />
                      </div>
                    ) : safeArray.length === 0 ? (
                      <p className="text-center text-gray-400 py-12">No plans available right now.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {safeArray.map((plan, i) => {
                          const a       = planAccent(i);
                          const price   = priceForPlan(plan);
                          const free    = isFree(plan);
                          const picked  = selected === plan.id;
                          const isActive = mySub?.plan?.id === plan.id;

                          return (
                            <button
                              key={plan.id}
                              onClick={() => setSelected(picked ? null : plan.id)}
                              className={`
                                relative text-left rounded-2xl border-2 p-5 transition-all duration-200
                                ${picked ? `${a.border} ${a.cardBg} ${a.glow} scale-[1.02]` : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                              `}
                            >
                              {i === 1 && (
                                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${a.badge}`}>
                                  MOST POPULAR
                                </span>
                              )}

                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${picked ? a.badge : 'bg-gray-100 text-gray-500'}`}>
                                {planIcon(plan.name, free)}
                              </div>

                              <h3 className="font-black text-[#222] text-base mb-1">{plan.name}</h3>

                              <div className="mb-3">
                                <span className="text-2xl font-black text-[#222]">
                                  {free ? 'Free' : fmt(price)}
                                </span>
                                {!free && <span className="text-xs text-gray-400 ml-1">/mo</span>}
                                {!free && billing === 'annual' && plan.price_annual_kes && (
                                  <p className="text-[10px] text-gray-400 mt-0.5">{fmt(plan.price_annual_kes)} billed annually</p>
                                )}
                              </div>

                              <ul className="space-y-1.5 text-xs text-gray-600">
                                <li className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  {plan.viewing_unlocks_per_month} viewing unlocks/mo
                                </li>
                                <li className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  {plan.ai_recommendations_per_day} AI picks/day
                                </li>
                                {free ? (
                                  <li className="flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                    <span className="text-gray-400">No contact access</span>
                                  </li>
                                ) : (
                                  <li className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    Full contact &amp; chat access
                                  </li>
                                )}
                                {plan.priority_support && (
                                  <li className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    Priority support
                                  </li>
                                )}
                                {plan.can_see_price_history && (
                                  <li className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    Price history
                                  </li>
                                )}
                              </ul>

                              {isActive && (
                                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Current plan
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Continue button */}
                    {selected && selectedPlan && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                      >
                        <button
                          onClick={() => isFree(selectedPlan) ? handleContinue() : setStep('checkout')}
                          disabled={processing}
                          className="w-full py-3.5 bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-60 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                        >
                          {processing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Activating…</>
                          ) : (
                            <>
                              Continue with {selectedPlan.name}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ════════════════ STEP 2 — CHECKOUT ════════════════ */}
                {step === 'checkout' && selectedPlan && (
                  <motion.div key="checkout" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                    <div className="max-w-sm mx-auto">

                      {/* Order summary card */}
                      <div className="bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white rounded-2xl p-5 mb-6">
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-3 font-semibold">Order Summary</p>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-black text-xl">{selectedPlan.name}</p>
                            <p className="text-white/60 text-sm capitalize">{billing} billing</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-xl text-[#C5A373]">
                              {fmt(billing === 'annual' && selectedPlan.price_annual_kes
                                ? selectedPlan.price_annual_kes
                                : priceForPlan(selectedPlan))}
                            </p>
                            <p className="text-white/50 text-xs">
                              {billing === 'annual' ? 'per year' : 'per month'}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-3 space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Viewing unlocks/mo</span>
                            <span className="font-semibold">{selectedPlan.viewing_unlocks_per_month}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">AI picks/day</span>
                            <span className="font-semibold">{selectedPlan.ai_recommendations_per_day}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Contact &amp; chat access</span>
                            <span className="font-semibold text-emerald-400">✓ Included</span>
                          </div>
                          {selectedPlan.priority_support && (
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Priority support</span>
                              <span className="font-semibold text-emerald-400">✓ Included</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment method */}
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment via</p>
                        <div className="flex items-center gap-3 border-2 border-[#ff385c] bg-[#fff5f6] rounded-2xl px-4 py-3">
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                            <CreditCard className="w-5 h-5 text-[#ff385c]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#222]">Paystack</p>
                            <p className="text-xs text-gray-400">Card, M-Pesa, Bank Transfer</p>
                          </div>
                          <img
                            src="https://cdn.brandfetch.io/idAoT9hUin/w/400/h/400/theme/dark/icon.png"
                            alt="Paystack"
                            className="ml-auto w-7 h-7 rounded-lg object-contain opacity-80"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      </div>

                      {/* Billing summary */}
                      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{selectedPlan.name} ({billing})</span>
                          <span className="font-semibold">
                            {fmt(billing === 'annual' && selectedPlan.price_annual_kes
                              ? selectedPlan.price_annual_kes
                              : priceForPlan(selectedPlan))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Billed</span>
                          <span className="font-semibold capitalize">{billing}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-[#222]">
                          <span>Total today</span>
                          <span className="text-[#ff385c]">
                            {fmt(billing === 'annual' && selectedPlan.price_annual_kes
                              ? selectedPlan.price_annual_kes
                              : priceForPlan(selectedPlan))}
                          </span>
                        </div>
                      </div>

                      {/* Pay button */}
                      <button
                        onClick={handleContinue}
                        disabled={processing}
                        className="w-full py-4 bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-60 text-white font-black rounded-2xl transition-colors flex items-center justify-center gap-2 text-base"
                      >
                        {processing ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Opening payment…</>
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5" />
                            Pay {fmt(billing === 'annual' && selectedPlan.price_annual_kes
                              ? selectedPlan.price_annual_kes
                              : priceForPlan(selectedPlan))} securely
                          </>
                        )}
                      </button>

                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          256-bit SSL
                        </div>
                        <div className="w-px h-3 bg-gray-200" />
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Secured by Paystack
                        </div>
                        <div className="w-px h-3 bg-gray-200" />
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Cancel anytime
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscribeModal;
