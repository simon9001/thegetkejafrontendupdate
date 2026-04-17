// components/layout/Footer.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Mail, Phone, Facebook, Twitter, Instagram,
  Linkedin, Youtube, Heart, ArrowRight, ExternalLink, CheckCircle, Loader2,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { apiDomain } from '../../apiDomain/ApiDomain';

// ── Social link ───────────────────────────────────────────────────────────────
const Social: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
}> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#ff385c] text-white/70 hover:text-white transition-all duration-200"
  >
    {icon}
  </a>
);

// ── Column heading ────────────────────────────────────────────────────────────
const ColHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{children}</h4>
);

// ── Internal link ─────────────────────────────────────────────────────────────
const FootLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-white/60 hover:text-white text-sm transition-colors duration-150 flex items-center gap-1.5 group"
    >
      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
      {children}
    </Link>
  </li>
);

// ── External link ─────────────────────────────────────────────────────────────
const ExtLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white/60 hover:text-white text-sm transition-colors duration-150 flex items-center gap-1.5 group"
    >
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      {children}
    </a>
  </li>
);

// ── Newsletter form ───────────────────────────────────────────────────────────
const NewsletterForm: React.FC = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [err, setErr]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${apiDomain}/contact/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true);
    } catch {
      setErr('Could not subscribe. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full sm:w-auto gap-2">
      {done ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
          <CheckCircle className="w-4 h-4" /> Subscribed! Check your inbox.
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/50 focus:border-[#ff385c]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors shrink-0 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Subscribe
            </button>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
        </>
      )}
    </form>
  );
};

// ── Main Footer ───────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1B2430] text-white">

      {/* ── Newsletter strip ─────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-black text-lg text-white">Get the latest listings straight to your inbox</h3>
              <p className="text-white/50 text-sm mt-1">New properties, market insights, tips — weekly.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* ── Main link grid ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-1.5 mb-4">
              <img src={logo} alt="GetKeja logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-black text-[#ff385c]">Getkeja</span>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-xs">
              Kenya's trusted platform for finding verified rentals, homes for sale, and commercial spaces  from Nairobi to the coast.
            </p>

            {/* Contact snippets */}
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-white/55">
                <MapPin className="w-4 h-4 text-[#ff385c] shrink-0" />
                Westlands, Nairobi, Kenya
              </li>
              <li>
                <a href="mailto:hello@getkeja.online" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#ff385c] shrink-0" />
                  hello@getkeja.online
                </a>
              </li>
              <li>
                <a href="tel:+2547576568845" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-[#ff385c] shrink-0" />
                  +254 7576568845
                </a>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-2">
              <Social href="https://facebook.com/getkeja"  icon={<Facebook  className="w-4 h-4" />} label="Facebook"  />
              <Social href="https://twitter.com/getkeja"   icon={<Twitter   className="w-4 h-4" />} label="Twitter"   />
              <Social href="https://instagram.com/getkeja" icon={<Instagram className="w-4 h-4" />} label="Instagram" />
              <Social href="https://linkedin.com/company/getkeja" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
              <Social href="https://youtube.com/@getkeja"  icon={<Youtube   className="w-4 h-4" />} label="YouTube"   />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <ColHead >Quick Links</ColHead>
            <ul className="space-y-2.5">
              <FootLink to="/">Home</FootLink>
              <FootLink to="/properties">Browse Properties</FootLink>
              <FootLink to="/become-host">List Your Property</FootLink>
              <FootLink to="/saved">Saved Properties</FootLink>
              <FootLink to="/messages">Messages</FootLink>
              <FootLink to="/profile">My Profile</FootLink>
              <FootLink to="/dashboard">Dashboard</FootLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <ColHead>Company</ColHead>
            <ul className="space-y-2.5">
              <FootLink to="/about">About Us</FootLink>
              <FootLink to="/blog">Blog &amp; Insights</FootLink>
              <FootLink to="/contact">Contact Us</FootLink>
              <FootLink to="/affiliate">Affiliate Program</FootLink>
              <FootLink to="/become-host">Become a Host</FootLink>
              <ExtLink href="https://getkeja.online/careers">Careers</ExtLink>
              <ExtLink href="https://getkeja.online/press">Press Kit</ExtLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <ColHead>Support</ColHead>
            <ul className="space-y-2.5">
              <FootLink to="/help">Help Center</FootLink>
              <FootLink to="/contact">Report an Issue</FootLink>
              <FootLink to="/privacy">Privacy Policy</FootLink>
              <FootLink to="/terms">Terms of Service</FootLink>
              <FootLink to="/cookies">Cookie Policy</FootLink>
              <FootLink to="/safety">Safety Tips</FootLink>
              <FootLink to="/affiliate">Partner with Us</FootLink>
            </ul>
          </div>

        </div>
      </div>

      {/* ── App badge strip ──────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs text-center sm:text-left">
            © {year} Getkeja. All rights reserved. Made with{' '}
            <Heart className="inline w-3 h-3 text-[#ff385c] fill-[#ff385c]" /> in Kenya.
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>·</span>
            <Link to="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <span>·</span>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <span>·</span>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
