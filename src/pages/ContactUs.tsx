// pages/ContactUs.tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const TOPICS = ['General Enquiry', 'Property Listing Issue', 'Payment & Billing', 'Technical Support', 'Partnership / Affiliate', 'Media & Press', 'Other'];

const ContactCard: React.FC<{ icon: React.ReactNode; title: string; detail: string; sub?: string; href?: string }> = ({
  icon, title, detail, sub, href,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
    <div className="w-11 h-11 rounded-xl bg-[#ff385c]/10 flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      {href ? (
        <a href={href} className="font-bold text-[#222] text-sm mt-0.5 hover:text-[#ff385c] transition-colors block">{detail}</a>
      ) : (
        <p className="font-bold text-[#222] text-sm mt-0.5">{detail}</p>
      )}
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const ContactUs: React.FC = () => {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', topic: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submit — replace with real API call
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <Layout showSearch={false}>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
              <MessageCircle className="w-3.5 h-3.5" /> Contact Us
            </span>
            <h1 className="text-4xl lg:text-5xl font-black mb-4">We'd love to hear from you</h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Whether it's a question, a problem, or just a hello — our team typically responds within 2 hours during business hours.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* ── Left: contact cards + hours ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black text-[#1B2430] mb-6">Get in touch</h2>

            <ContactCard
              icon={<Mail className="w-5 h-5 text-[#ff385c]" />}
              title="Email us"
              detail="hello@getkeja.online"
              sub="We reply within 2 hours on weekdays"
              href="mailto:hello@getkeja.online"
            />
            <ContactCard
              icon={<Phone className="w-5 h-5 text-[#ff385c]" />}
              title="Call us"
              detail="+254 700 000 000"
              sub="Mon – Fri, 8 AM – 6 PM EAT"
              href="tel:+254700000000"
            />
            <ContactCard
              icon={<MapPin className="w-5 h-5 text-[#ff385c]" />}
              title="Visit us"
              detail="Westlands, Nairobi"
              sub="Kenya · By appointment only"
            />
            <ContactCard
              icon={<MessageCircle className="w-5 h-5 text-[#ff385c]" />}
              title="WhatsApp"
              detail="Chat with us on WhatsApp"
              sub="Fastest response — usually &lt;30 min"
              href="https://wa.me/254700000000"
            />

            {/* Business hours */}
            <div className="bg-gray-50 rounded-2xl p-5 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#ff385c]" />
                <p className="font-bold text-[#222] text-sm">Business Hours</p>
              </div>
              <div className="space-y-1.5 text-sm">
                {[
                  { day: 'Mon – Fri', hours: '8:00 AM – 6:00 PM' },
                  { day: 'Saturday',  hours: '9:00 AM – 3:00 PM' },
                  { day: 'Sunday',    hours: 'Closed' },
                ].map((r) => (
                  <div key={r.day} className="flex justify-between">
                    <span className="text-gray-500">{r.day}</span>
                    <span className={`font-medium ${r.hours === 'Closed' ? 'text-gray-300' : 'text-[#222]'}`}>{r.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-[#222] mb-2">Message sent!</h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Thanks for reaching out. Our team will get back to you within 2 hours on weekdays.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', topic: '', message: '' }); }}
                    className="mt-6 px-5 py-2.5 bg-[#ff385c] text-white rounded-full text-sm font-bold hover:bg-[#e00b41] transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-[#222] mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={set('name')}
                          placeholder="John Doe"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          placeholder="you@example.com"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone (optional)</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={set('phone')}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Topic *</label>
                        <select
                          required
                          value={form.topic}
                          onChange={set('topic')}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c] bg-white"
                        >
                          <option value="">Select a topic…</option>
                          {TOPICS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={set('message')}
                        placeholder="Tell us how we can help…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#ff385c] hover:bg-[#e00b41] disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default ContactUs;
