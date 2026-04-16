// pages/Affiliate.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, Share2, TrendingUp, CheckCircle, ArrowRight, Copy, Gift, Star, Zap } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const HOW_IT_WORKS = [
  { step: '01', icon: Share2,      title: 'Share your link',       desc: 'Get your unique referral link and share it with friends, family, or your audience.' },
  { step: '02', icon: Users,       title: 'They sign up & list',   desc: 'When someone uses your link to register or list a property, they get linked to you.' },
  { step: '03', icon: DollarSign,  title: 'Earn commissions',      desc: 'Earn KES 500–2,000 per successful referral, paid out monthly directly to M-Pesa.' },
];

const TIERS = [
  {
    name: 'Starter',
    color: 'border-gray-200',
    accent: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-600',
    referrals: '1–9 referrals',
    commission: 'KES 500',
    perks: ['Basic dashboard', 'Monthly M-Pesa payout', 'Email support'],
  },
  {
    name: 'Pro',
    color: 'border-[#C5A373]',
    accent: 'text-[#C5A373]',
    badge: 'bg-[#C5A373]/10 text-[#C5A373]',
    referrals: '10–49 referrals',
    commission: 'KES 1,000',
    perks: ['Priority dashboard', 'Weekly M-Pesa payout', 'Priority support', 'Co-marketing materials'],
    popular: true,
  },
  {
    name: 'Elite',
    color: 'border-[#ff385c]',
    accent: 'text-[#ff385c]',
    badge: 'bg-[#ff385c]/10 text-[#ff385c]',
    referrals: '50+ referrals',
    commission: 'KES 2,000',
    perks: ['Full analytics suite', 'Instant M-Pesa payout', 'Dedicated account manager', 'Custom landing page', 'Revenue share on subscriptions'],
  },
];

const FAQS = [
  { q: 'Who can join the affiliate program?', a: 'Anyone! Bloggers, real estate agents, social media creators, or just someone who loves Getkeja and wants to earn by sharing it.' },
  { q: 'When and how do I get paid?', a: 'Payouts are made monthly (weekly for Pro, instant for Elite) directly to your M-Pesa number. Minimum payout is KES 1,000.' },
  { q: 'How do I track my referrals?', a: 'Your affiliate dashboard shows clicks, sign-ups, active referrals, and pending/paid earnings in real time.' },
  { q: 'Is there a cap on how much I can earn?', a: 'No cap at all. The more you refer, the more you earn — and you move up tiers automatically.' },
  { q: 'What counts as a successful referral?', a: 'A referral is successful when the person you referred either lists a property or subscribes to a paid plan within 30 days of clicking your link.' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const Affiliate: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const demoLink = 'https://getkeja.online/ref/your-code';

  const copyLink = () => {
    navigator.clipboard.writeText(demoLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Layout showSearch={false}>

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A373] rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ff385c] rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <motion.div {...fade()}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
              <Gift className="w-3.5 h-3.5 text-[#C5A373]" /> Affiliate Program
            </span>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              Earn by sharing<br />
              <span className="text-[#C5A373]">Kenya's #1 property app</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Refer landlords, tenants, or investors to Getkeja and earn up to KES 2,000 per referral — paid straight to M-Pesa.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/register"
                className="px-7 py-3.5 bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold rounded-full transition-colors flex items-center gap-2"
              >
                Join for free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors"
              >
                How it works
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 'KES 2,000', label: 'Max per referral' },
              { value: '1,200+',    label: 'Active affiliates' },
              { value: '30 days',   label: 'Cookie window' },
              { value: 'M-Pesa',    label: 'Instant payout' },
            ].map((s, i) => (
              <motion.div key={s.label} {...fade(i * 0.1)}>
                <p className="text-3xl font-black text-[#ff385c]">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fade()} className="text-center mb-14">
          <h2 className="text-3xl font-black text-[#1B2430] mb-3">How it works</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Three simple steps to start earning today.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.step} {...fade(i * 0.1)} className="relative">
              <div className="bg-gray-50 rounded-3xl p-8 text-center h-full">
                <span className="text-6xl font-black text-gray-100 absolute top-5 right-6 leading-none select-none">{step.step}</span>
                <div className="w-14 h-14 bg-[#ff385c]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10">
                  <step.icon className="w-7 h-7 text-[#ff385c]" />
                </div>
                <h3 className="font-black text-[#222] text-lg mb-2 relative z-10">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed relative z-10">{step.desc}</p>
              </div>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Commission tiers ── */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade()} className="text-center mb-14">
            <h2 className="text-3xl font-black text-[#1B2430] mb-3">Commission tiers</h2>
            <p className="text-gray-400 max-w-xl mx-auto">The more you refer, the more you earn. Tiers update automatically.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                {...fade(i * 0.1)}
                className={`bg-white rounded-3xl border-2 ${tier.color} p-7 relative`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C5A373] text-white text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${tier.badge}`}>{tier.name}</span>
                <p className="text-xs text-gray-400 mb-1 font-medium">{tier.referrals}</p>
                <p className={`text-4xl font-black mb-1 ${tier.accent}`}>{tier.commission}</p>
                <p className="text-xs text-gray-400 mb-6">per referral</p>
                <ul className="space-y-2.5">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Demo referral link ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div {...fade()}>
          <div className="inline-flex items-center gap-2 bg-[#ff385c]/10 px-4 py-1.5 rounded-full text-xs font-semibold text-[#ff385c] uppercase tracking-wider mb-5">
            <Zap className="w-3.5 h-3.5" /> Your referral link
          </div>
          <h2 className="text-3xl font-black text-[#1B2430] mb-4">Ready to start earning?</h2>
          <p className="text-gray-400 mb-8">Sign up to get your unique link. Here's a preview of what yours will look like:</p>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden max-w-lg mx-auto">
            <span className="flex-1 px-5 py-4 text-sm text-gray-500 truncate">{demoLink}</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-5 py-4 bg-[#1B2430] hover:bg-[#2C3A4E] text-white text-sm font-bold transition-colors shrink-0"
            >
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-gray-300 mt-4">This is a preview. Sign up to get your real link.</p>
        </motion.div>
      </div>

      {/* ── Why Getkeja ── */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade()} className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#1B2430] mb-3">Why promote Getkeja?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">A product people genuinely need — making it easy to refer.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Star,        title: 'Trusted brand',         desc: "Kenya's most verified property platform — easy to recommend because people already know us." },
              { icon: TrendingUp,  title: 'Growing fast',          desc: 'New users and listings every day means more people converting from your referrals.' },
              { icon: DollarSign,  title: 'Competitive payouts',   desc: 'Up to KES 2,000 per referral with no cap. Top affiliates earn over KES 50,000/month.' },
              { icon: Share2,      title: 'Easy to share',         desc: 'Your link works everywhere — WhatsApp, Instagram, TikTok, email, blogs, YouTube.' },
              { icon: CheckCircle, title: 'Transparent tracking',  desc: 'Real-time dashboard shows every click, sign-up, and shilling earned.' },
              { icon: Gift,        title: 'Bonus rewards',         desc: 'Hit milestones and unlock extra bonuses, exclusive merchandise, and co-branding perks.' },
            ].map((item, i) => (
              <motion.div key={item.title} {...fade(i * 0.08)} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-[#ff385c]/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[#ff385c]" />
                </div>
                <h4 className="font-bold text-[#222] mb-2">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fade()} className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#1B2430] mb-3">Frequently asked questions</h2>
        </motion.div>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fade(i * 0.07)} className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-[#222] mb-2">{faq.q}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-gradient-to-br from-[#ff385c] to-[#c7003a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-black mb-4">Start earning today — it's free</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            No upfront cost. No monthly fees. Just sign up, share your link, and get paid.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#ff385c] font-bold rounded-full hover:bg-gray-100 transition-colors text-sm"
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/50 text-xs mt-4">Already have an account? <Link to="/login" className="underline text-white/70 hover:text-white">Log in</Link></p>
        </div>
      </div>

    </Layout>
  );
};

export default Affiliate;
