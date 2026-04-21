// pages/AboutUs.tsx
import React from 'react';
import { Shield, Users, MapPin, TrendingUp, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const STATS = [
  { value: '500+', label: 'Verified Properties' },
  { value: '50k+', label: 'Happy Tenants' },
  { value: '100+', label: 'Locations in Kenya' },
  { value: '98%',  label: 'Satisfaction Rate' },
];

const VALUES = [
  { icon: Shield,    title: 'Trust & Safety',    desc: 'Every property is verified by our team before going live. We protect both landlords and tenants.'  },
  { icon: Users,     title: 'Community First',   desc: 'We build relationships — not just transactions. Our platform connects real people to real homes.'   },
  { icon: TrendingUp,title: 'Transparency',      desc: 'No hidden fees, no surprises. Pricing, availability, and landlord info are always clear and honest.' },
  { icon: MapPin,    title: 'Local Expertise',   desc: 'Born and built in Kenya. We understand the local market, neighborhoods, and what renters need.'      },
  { icon: Heart,     title: 'Genuine Care',      desc: 'A home is personal. We take that seriously and work hard to match people with places they love.'      },
  { icon: Award,     title: 'Quality Listings',  desc: 'We reject low-quality or fraudulent listings. Every unit meets our standards before it\'s published.' },
];

const TEAM = [
  { name: 'Emanuel Miyu',   role: 'CEO & Co-founder',       initials: 'EM', color: 'bg-[#ff385c]'  },
  { name: 'Duncun Mainya',    role: 'Head of Operations',     initials: 'DM', color: 'bg-[#C5A373]'  },
  { name: 'Simon Gatungo',   role: 'Lead Engineer',          initials: 'SG', color: 'bg-[#1B2430]'  },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const AboutUs: React.FC = () => (
  <Layout showSearch={false}>

    {/* ── Hero ── */}
    <div className="relative bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#C5A373] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff385c] rounded-full filter blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <motion.div {...fade()}>
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            Our Story
          </span>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            We help Kenyans find<br />
            <span className="text-[#C5A373]">places they love</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Getkeja was born from frustration with housing scams and opaque listings. We set out to build a platform that puts trust, simplicity, and community at the center of every property search.
          </p>
        </motion.div>
      </div>
    </div>

    {/* ── Stats ── */}
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fade(i * 0.1)} className="text-center">
              <p className="text-4xl font-black text-[#ff385c]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Mission ── */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div {...fade()}>
          <h2 className="text-3xl lg:text-4xl font-black text-[#1B2430] mb-5 leading-tight">
            Our mission is simple:<br />
            <span className="text-[#ff385c]">no more housing scams.</span>
          </h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            Finding a home in Kenya is hard. Too many listings are fake, prices are hidden, and landlords are unreachable. We're fixing that — one verified listing at a time.
          </p>
          <p className="text-gray-500 leading-relaxed mb-6">
            Every property on Getkeja has been reviewed by our team. Every landlord is verified. And our support team is always a message away.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#e00b41] transition-colors"
          >
            Get in touch
          </Link>
        </motion.div>
        <motion.div {...fade(0.2)} className="grid grid-cols-2 gap-4">
          {VALUES.slice(0, 4).map((v) => (
            <div key={v.title} className="bg-gray-50 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl bg-[#ff385c]/10 flex items-center justify-center mb-3">
                <v.icon className="w-4 h-4 text-[#ff385c]" />
              </div>
              <h4 className="font-bold text-[#222] text-sm mb-1">{v.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>

    {/* ── Values ── */}
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fade()} className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#1B2430] mb-3">What we stand for</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Six principles that guide every decision we make.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <motion.div key={v.title} {...fade(i * 0.08)} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#ff385c]/10 flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-[#ff385c]" />
              </div>
              <h4 className="font-bold text-[#222] mb-2">{v.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Team ── */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div {...fade()} className="text-center mb-12">
        <h2 className="text-3xl font-black text-[#1B2430] mb-3">Meet the team</h2>
        <p className="text-gray-400 max-w-xl mx-auto">The people behind Getkeja — passionate about housing and built for Kenya.</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {TEAM.map((m, i) => (
          <motion.div key={m.name} {...fade(i * 0.1)} className="text-center">
            <div className={`w-20 h-20 ${m.color} rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-3`}>
              {m.initials}
            </div>
            <p className="font-bold text-[#222] text-sm">{m.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.role}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* ── CTA ── */}
    <div className="bg-gradient-to-br from-[#ff385c] to-[#c7003a] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-black mb-4">Ready to find your keja?</h2>
        <p className="text-white/80 mb-8">Browse thousands of verified listings across Kenya today.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/"             className="px-6 py-3 bg-white text-[#ff385c] font-bold rounded-full hover:bg-gray-100 transition-colors">Browse Properties</Link>
          <Link to="/become-host" className="px-6 py-3 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-colors">List Your Property</Link>
        </div>
      </div>
    </div>

  </Layout>
);

export default AboutUs;
