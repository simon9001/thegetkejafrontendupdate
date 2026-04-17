// pages/legal/LegalPages.tsx
// All static informational pages: Privacy, Terms, Cookies, Safety, Help, Sitemap
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Shield, FileText, Cookie, AlertTriangle, HelpCircle, Map, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Shared shell ────────────────────────────────────────────────────────────
const PageShell: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}> = ({ icon, title, subtitle, lastUpdated, children }) => (
  <Layout showSearch={false}>
    <div className="bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
          <h1 className="text-4xl font-black mb-3">{title}</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">{subtitle}</p>
          {lastUpdated && <p className="text-white/30 text-xs mt-3">Last updated: {lastUpdated}</p>}
        </motion.div>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</div>
  </Layout>
);

// ─── Prose section ────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-[#1B2430] mb-4 pb-2 border-b border-gray-100">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

// ─── FAQ accordion ────────────────────────────────────────────────────────────
const FAQ: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className="font-semibold text-[#222] text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-3">{a}</div>
      )}
    </div>
  );
};

// =============================================================================
// PRIVACY POLICY
// =============================================================================
export const PrivacyPolicy: React.FC = () => (
  <PageShell icon={<Shield className="w-7 h-7 text-white" />} title="Privacy Policy" subtitle="How we collect, use, and protect your personal data." lastUpdated="April 2026">
    <Section title="1. Information We Collect">
      <p>We collect information you provide when registering an account, listing a property, booking a visit, or contacting us. This includes your name, email address, phone number, national ID (for verification), and payment details.</p>
      <p>We also collect usage data such as pages viewed, search queries, and device information to improve our platform.</p>
    </Section>
    <Section title="2. How We Use Your Information">
      <p>Your data is used to provide and improve our services, verify your identity, process payments, send transactional and marketing communications (with your consent), and comply with legal obligations.</p>
      <p>We use M-Pesa and Paystack for payment processing. Payment credentials are never stored on our servers.</p>
    </Section>
    <Section title="3. Data Sharing">
      <p>We do not sell your personal data. We share data with landlords, agents, and developers only as needed to facilitate property bookings and viewings. We share with service providers (Resend for email, Cloudinary for media, Supabase for database) under strict data processing agreements.</p>
    </Section>
    <Section title="4. Data Retention">
      <p>Account data is retained while your account is active. You may request deletion at any time by contacting <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a>. Some data may be retained for legal compliance for up to 7 years.</p>
    </Section>
    <Section title="5. Your Rights">
      <p>Under the Kenya Data Protection Act 2019, you have the right to access, correct, delete, and port your data. To exercise these rights, email <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a>.</p>
    </Section>
    <Section title="6. Cookies">
      <p>We use cookies for authentication, analytics, and personalisation. See our <Link to="/cookies" className="text-[#ff385c] hover:underline">Cookie Policy</Link> for full details.</p>
    </Section>
    <Section title="7. Contact">
      <p>For privacy enquiries, contact our Data Protection Officer at <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a>.</p>
    </Section>
  </PageShell>
);

// =============================================================================
// TERMS OF SERVICE
// =============================================================================
export const TermsOfService: React.FC = () => (
  <PageShell icon={<FileText className="w-7 h-7 text-white" />} title="Terms of Service" subtitle="The rules that govern your use of Getkeja." lastUpdated="April 2026">
    <Section title="1. Acceptance">
      <p>By using Getkeja you agree to these Terms. If you don't agree, please stop using the platform.</p>
    </Section>
    <Section title="2. Eligibility">
      <p>You must be at least 18 years old and legally capable of entering contracts in Kenya. Business accounts must be duly registered in Kenya.</p>
    </Section>
    <Section title="3. Listings">
      <p>All property listings must be accurate, lawful, and owned or authorised by you. False listings, fraudulent pricing, or misrepresentation may result in immediate account suspension and legal action.</p>
      <p>Getkeja staff review all listings before publishing. We reserve the right to reject or remove listings that violate these terms.</p>
    </Section>
    <Section title="4. Bookings & Payments">
      <p>Getkeja facilitates transactions between landlords and tenants. Short-stay payments are held in escrow and released to the host after confirmed check-in. Long-term rent agreements are between the tenant and landlord; Getkeja is not a party to those contracts.</p>
    </Section>
    <Section title="5. Prohibited Conduct">
      <p>You may not use Getkeja to post spam, harvest data, impersonate others, post illegal content, or circumvent our payment system. Violation results in permanent ban.</p>
    </Section>
    <Section title="6. Liability">
      <p>Getkeja is a marketplace platform. We do not own properties and are not responsible for property conditions, landlord conduct, or tenant behaviour. Our liability is limited to the amount paid to us for the specific transaction in dispute.</p>
    </Section>
    <Section title="7. Governing Law">
      <p>These Terms are governed by the laws of Kenya. Disputes shall be resolved in the courts of Nairobi.</p>
    </Section>
  </PageShell>
);

// =============================================================================
// COOKIE POLICY
// =============================================================================
export const CookiePolicy: React.FC = () => (
  <PageShell icon={<Cookie className="w-7 h-7 text-white" />} title="Cookie Policy" subtitle="How and why we use cookies on our platform." lastUpdated="April 2026">
    <Section title="What Are Cookies?">
      <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and understand how you use Getkeja.</p>
    </Section>
    <Section title="Cookies We Use">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse mt-2">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-100 font-semibold">Cookie</th>
              <th className="text-left p-3 border border-gray-100 font-semibold">Purpose</th>
              <th className="text-left p-3 border border-gray-100 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['auth_token', 'Keeps you logged in', '7 days'],
              ['redux-persist', 'Saves local app state (saved properties, UI prefs)', 'Persistent'],
              ['_ga', 'Google Analytics — usage statistics', '2 years'],
              ['_fbp', 'Facebook Pixel — marketing attribution', '90 days'],
            ].map(([name, purpose, duration], i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="p-3 border border-gray-100 font-mono text-[11px]">{name}</td>
                <td className="p-3 border border-gray-100">{purpose}</td>
                <td className="p-3 border border-gray-100">{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
    <Section title="Managing Cookies">
      <p>You can clear or block cookies in your browser settings. Note that disabling authentication cookies will log you out. Analytics cookies can be disabled without affecting functionality.</p>
    </Section>
  </PageShell>
);

// =============================================================================
// SAFETY TIPS
// =============================================================================
const SAFETY = [
  { icon: '🔍', title: 'Verify Before You Pay', tips: ['Always visit the property in person or request a live video tour before paying any deposit.', 'Check that the agent or landlord is verified on Getkeja (blue tick).', 'Request a copy of the title deed or lease agreement before committing.'] },
  { icon: '💰', title: 'Protect Your Payments', tips: ['Use our in-app payment for short stays — money is held in escrow until after check-in.', 'Never send money via M-Pesa directly to someone you haven\'t met in person or verified.', 'Be suspicious of "deals" that ask for urgent payment or are far below market rates.'] },
  { icon: '📞', title: 'Communicate Safely', tips: ['Use the Getkeja chat system for all initial communications.', 'Do not share your ID, bank details, or home address until you\'ve verified the listing.', 'Report suspicious contacts to support immediately via the Report button.'] },
  { icon: '🏠', title: 'On Viewing Day', tips: ['Tell a friend or family member where you\'re going and when to expect you back.', 'Visit during daylight hours for a first viewing.', 'Trust your instincts — if something feels off, leave and report it.'] },
];

export const SafetyTips: React.FC = () => (
  <PageShell icon={<AlertTriangle className="w-7 h-7 text-white" />} title="Safety Tips" subtitle="Stay safe when searching for property on Getkeja.">
    <div className="grid sm:grid-cols-2 gap-6 mb-10">
      {SAFETY.map((s) => (
        <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="text-3xl mb-3">{s.icon}</div>
          <h3 className="font-bold text-[#222] mb-3">{s.title}</h3>
          <ul className="space-y-2">
            {s.tips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-500">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="bg-[#ff385c]/5 border border-[#ff385c]/20 rounded-2xl p-6 text-center">
      <p className="font-bold text-[#222] mb-1">Found a suspicious listing?</p>
      <p className="text-sm text-gray-500 mb-4">Report it immediately. Our team reviews reports within 1 hour.</p>
      <Link to="/contact" className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#e00b41] transition-colors">
        <Mail className="w-4 h-4" /> Report a Listing
      </Link>
    </div>
  </PageShell>
);

// =============================================================================
// HELP CENTER
// =============================================================================
const FAQS = [
  { q: 'How do I list my property on Getkeja?', a: 'Click "Become a Host" in the nav bar, complete the registration, and submit your property. Our team reviews listings within 24 hours before publishing.' },
  { q: 'Is Getkeja free to use for tenants?', a: 'Yes! Searching, saving, and contacting landlords is free. Optional paid subscriptions unlock priority support and advanced features.' },
  { q: 'How does the short-stay escrow work?', a: 'When you book a short stay, your payment is held securely. It\'s released to the host only after you confirm check-in. If the host cancels, you get a full refund.' },
  { q: 'How do I verify my identity?', a: 'Go to your Profile → Verification tab. Upload your national ID or passport front and back. Verification is usually completed within 2 hours.' },
  { q: 'I found a scam listing — what do I do?', a: 'Tap the "Report" button on the listing or email hello@getkeja.online. We investigate all reports within 1 hour and remove fraudulent listings immediately.' },
  { q: 'Can I list commercial properties?', a: 'Yes. Getkeja supports residential rentals, for-sale properties, short stays, and commercial spaces including offices, shops, and warehouses.' },
  { q: 'How do I cancel a booking?', a: 'Short stays: go to My Bookings → Cancel. Cancellation policies vary by host. Long-term bookings are governed by your tenancy agreement with the landlord.' },
  { q: 'What payment methods are accepted?', a: 'We accept M-Pesa, Visa, and Mastercard via Paystack. All transactions are in KES.' },
];

export const HelpCenter: React.FC = () => (
  <PageShell icon={<HelpCircle className="w-7 h-7 text-white" />} title="Help Center" subtitle="Quick answers to common questions about Getkeja.">
    <div className="grid sm:grid-cols-3 gap-4 mb-10">
      {[
        { icon: <Mail className="w-5 h-5" />, label: 'Email Us', detail: 'hello@getkeja.online', href: 'mailto:hello@getkeja.online' },
        { icon: <Phone className="w-5 h-5" />, label: 'WhatsApp', detail: '+254 757 568 845', href: 'https://wa.me/254757568845' },
        { icon: <Mail className="w-5 h-5" />, label: 'Contact Form', detail: 'Get a guaranteed reply', href: '/contact' },
      ].map((c) => (
        <a key={c.label} href={c.href} className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow text-center">
          <div className="w-10 h-10 bg-[#ff385c]/10 text-[#ff385c] rounded-xl flex items-center justify-center mx-auto mb-3">{c.icon}</div>
          <p className="font-bold text-sm text-[#222]">{c.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{c.detail}</p>
        </a>
      ))}
    </div>
    <h2 className="text-xl font-bold text-[#1B2430] mb-5">Frequently Asked Questions</h2>
    <div className="space-y-3">
      {FAQS.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
    </div>
  </PageShell>
);

// =============================================================================
// SITEMAP
// =============================================================================
const MAP_SECTIONS = [
  { title: 'Properties', links: [{ to: '/', label: 'Home / Browse All' }, { to: '/?listing_category=long_term_rent', label: 'Long Rent' }, { to: '/?listing_category=for_sale', label: 'For Sale' }, { to: '/?listing_category=short_term_rent', label: 'Short Stay' }, { to: '/?listing_category=commercial', label: 'Commercial' }, { to: '/saved', label: 'Saved Properties' }] },
  { title: 'Account', links: [{ to: '/login', label: 'Login' }, { to: '/register', label: 'Register' }, { to: '/profile', label: 'My Profile' }, { to: '/messages', label: 'Messages' }, { to: '/dashboard', label: 'Dashboard' }] },
  { title: 'Company', links: [{ to: '/about', label: 'About Us' }, { to: '/blog', label: 'Blog & Insights' }, { to: '/contact', label: 'Contact Us' }, { to: '/affiliate', label: 'Affiliate Program' }, { to: '/become-host', label: 'Become a Host' }] },
  { title: 'Legal & Support', links: [{ to: '/help', label: 'Help Center' }, { to: '/safety', label: 'Safety Tips' }, { to: '/privacy', label: 'Privacy Policy' }, { to: '/terms', label: 'Terms of Service' }, { to: '/cookies', label: 'Cookie Policy' }] },
];

export const Sitemap: React.FC = () => (
  <PageShell icon={<Map className="w-7 h-7 text-white" />} title="Sitemap" subtitle="A full map of everything on Getkeja.">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {MAP_SECTIONS.map((s) => (
        <div key={s.title}>
          <h3 className="font-bold text-[#222] text-sm uppercase tracking-wide mb-4">{s.title}</h3>
          <ul className="space-y-2.5">
            {s.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-gray-500 hover:text-[#ff385c] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </PageShell>
);
