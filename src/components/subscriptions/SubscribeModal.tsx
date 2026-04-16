// components/subscriptions/SubscribeModal.tsx
// Subscription plans modal — fetches plans from the backend and lets
// the user subscribe. Requires auth; redirects to /login if not logged in.
import React, { useState } from 'react';
import { X, Check, Loader2, Sparkles, Crown, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/Slice/AuthSlice';
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeMutation,
  type SubscriptionPlan,
} from '../../features/Api/SubscriptionsApi';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

// Icon per plan name (heuristic — adjust to match your plan names in DB)
const planIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('free') || n.includes('basic')) return <Star className="w-5 h-5" />;
  if (n.includes('pro') || n.includes('standard')) return <Zap className="w-5 h-5" />;
  return <Crown className="w-5 h-5" />;
};

const planAccent = (index: number) => {
  const accents = [
    { border: 'border-gray-200',    badge: 'bg-gray-100 text-gray-600',        btn: 'bg-[#222] hover:bg-[#333] text-white',           ring: '' },
    { border: 'border-[#ff385c]',   badge: 'bg-[#ff385c] text-white',          btn: 'bg-[#ff385c] hover:bg-[#e00b41] text-white',     ring: 'ring-2 ring-[#ff385c]/30' },
    { border: 'border-[#C5A373]',   badge: 'bg-[#C5A373] text-white',          btn: 'bg-[#C5A373] hover:bg-[#8B6E4E] text-white',     ring: 'ring-2 ring-[#C5A373]/30' },
  ];
  return accents[index % accents.length];
};

const formatKes = (n: number) => `KES ${n.toLocaleString()}`;

const SubscribeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate        = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [billing, setBilling]   = useState<'monthly' | 'annual'>('monthly');
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone]       = useState('');
  const [step, setStep]         = useState<'plans' | 'pay'>('plans');

  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery(undefined, { skip: !isOpen });
  const { data: mySub }  = useGetMySubscriptionQuery(undefined, { skip: !isAuthenticated || !isOpen });
  const [subscribe, { isLoading: subscribing }] = useSubscribeMutation();

  const selectedPlan = plans.find((p) => p.id === selected);

  const handleOpen = () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: '/' } });
      return;
    }
  };

  // Redirect if not auth when modal opens
  React.useEffect(() => {
    if (isOpen) handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (!selected) return;
    if (!phone.trim()) { toast.error('Enter your M-Pesa phone number'); return; }

    try {
      await subscribe({
        plan_id:        selected,
        billing_cycle:  billing,
        payment_method: 'mpesa',
        mpesa_phone:    phone.trim(),
      }).unwrap();
      toast.success('Subscription activated! Welcome aboard 🎉');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Subscription failed. Try again.');
    }
  };

  const priceForPlan = (p: SubscriptionPlan) =>
    billing === 'annual' && p.price_annual_kes
      ? Math.round(p.price_annual_kes / 12)   // per-month equivalent
      : p.price_monthly_kes;

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
            onClick={onClose}
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
              z-50 w-full sm:w-[640px] lg:w-[760px]
              bg-white rounded-t-3xl sm:rounded-3xl
              shadow-[rgba(0,0,0,0.25)_0px_20px_60px]
              max-h-[90vh] overflow-y-auto
            "
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C5A373]" />
                <h2 className="text-lg font-black text-[#222]">
                  {step === 'plans' ? 'Choose Your Plan' : 'Complete Subscription'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 pb-8 pt-4">

              {/* Already subscribed banner */}
              {mySub && (
                <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <Check className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Active: {mySub.plan?.name} plan
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      {mySub.credits_remaining} viewing credits remaining · renews {new Date(mySub.renews_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Step 1: Plans ── */}
              {step === 'plans' && (
                <>
                  {/* Billing toggle */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex bg-gray-100 rounded-full p-1 gap-1">
                      {(['monthly', 'annual'] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setBilling(b)}
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                            billing === b ? 'bg-white text-[#222] shadow-sm' : 'text-gray-500'
                          }`}
                        >
                          {b === 'monthly' ? 'Monthly' : 'Annual'}
                          {b === 'annual' && (
                            <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">SAVE</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plans grid */}
                  {plansLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C5A373]" />
                    </div>
                  ) : plans.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No plans available right now.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plans.map((plan, i) => {
                        const accent    = planAccent(i);
                        const price     = priceForPlan(plan);
                        const isActive  = mySub?.plan?.id === plan.id;
                        const isPicked  = selected === plan.id;

                        return (
                          <button
                            key={plan.id}
                            onClick={() => setSelected(isPicked ? null : plan.id)}
                            className={`
                              relative text-left rounded-2xl border-2 p-5 transition-all duration-200
                              ${accent.border} ${accent.ring}
                              ${isPicked ? 'bg-gray-50 scale-[1.02]' : 'bg-white hover:bg-gray-50'}
                            `}
                          >
                            {/* Popular badge on index 1 */}
                            {i === 1 && (
                              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${accent.badge}`}>
                                MOST POPULAR
                              </span>
                            )}

                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent.badge}`}>
                              {planIcon(plan.name)}
                            </div>

                            <h3 className="font-black text-[#222] text-base mb-1">{plan.name}</h3>

                            <div className="mb-4">
                              <span className="text-2xl font-black text-[#222]">
                                {price === 0 ? 'Free' : formatKes(price)}
                              </span>
                              {price > 0 && <span className="text-xs text-gray-400 ml-1">/mo</span>}
                              {billing === 'annual' && plan.price_annual_kes && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {formatKes(plan.price_annual_kes)} billed annually
                                </p>
                              )}
                            </div>

                            <ul className="space-y-2 text-xs text-gray-600">
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                {plan.viewing_unlocks_per_month} viewing unlocks/month
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                {plan.ai_recommendations_per_day} AI picks/day
                              </li>
                              {plan.priority_support && (
                                <li className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  Priority support
                                </li>
                              )}
                              {plan.can_see_price_history && (
                                <li className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  Price history
                                </li>
                              )}
                              {plan.can_see_similar_properties && (
                                <li className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  Similar property insights
                                </li>
                              )}
                            </ul>

                            {isActive && (
                              <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Current plan
                              </span>
                            )}

                            {/* Selection indicator */}
                            {isPicked && !isActive && (
                              <div className={`mt-3 w-full py-1.5 rounded-xl text-[11px] font-bold text-center ${accent.badge}`}>
                                ✓ Selected
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* CTA */}
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <button
                        onClick={() => setStep('pay')}
                        className="w-full py-3.5 bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold rounded-2xl transition-colors"
                      >
                        Continue with {selectedPlan?.name} →
                      </button>
                    </motion.div>
                  )}
                </>
              )}

              {/* ── Step 2: Payment ── */}
              {step === 'pay' && selectedPlan && (
                <div className="max-w-sm mx-auto">
                  <button
                    onClick={() => setStep('plans')}
                    className="text-xs text-gray-400 hover:text-gray-600 mb-5 flex items-center gap-1"
                  >
                    ← Back to plans
                  </button>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Subscribing to</p>
                    <p className="font-black text-[#222] text-lg">{selectedPlan.name}</p>
                    <p className="text-[#ff385c] font-bold text-sm mt-0.5">
                      {priceForPlan(selectedPlan) === 0 ? 'Free' : `${formatKes(priceForPlan(selectedPlan))}/mo`}
                      {billing === 'annual' && ' · billed annually'}
                    </p>
                  </div>

                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c] mb-6"
                  />

                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full py-3.5 bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-60 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    {subscribing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    ) : (
                      `Confirm & Subscribe`
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    You'll receive an M-Pesa STK push to confirm payment.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscribeModal;
