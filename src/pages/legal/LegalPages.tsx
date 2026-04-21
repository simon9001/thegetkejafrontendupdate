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
  <PageShell
    icon={<FileText className="w-7 h-7 text-white" />}
    title="Terms & Conditions"
    subtitle="Please read these terms carefully before using Getkeja. By creating an account you agree to be legally bound by them."
    lastUpdated="April 2026"
  >
    {/* ── Preamble ── */}
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-sm text-amber-800">
      <strong>Important notice:</strong> These Terms constitute a legally binding agreement between you and Getkeja Kenya Limited ("Getkeja", "we", "us", "our"), a company incorporated in Kenya. These Terms are governed by the laws of Kenya, including but not limited to the Kenya Data Protection Act 2019, the Consumer Protection Act 2012, the Law of Contract Act (Cap 23), the Land Act 2012, and the Computer Misuse and Cybercrimes Act 2018. By registering an account you confirm that you have read, understood, and agreed to these Terms.
    </div>

    <Section title="1. Definitions">
      <p>In these Terms the following words have the meanings given:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>"Platform"</strong> means the Getkeja website and any associated mobile application, API, or digital service.</li>
        <li><strong>"User"</strong> means any individual or legal entity that creates an account on the Platform.</li>
        <li><strong>"Seeker"</strong> means a User who searches for, saves, or enquires about property listings.</li>
        <li><strong>"Landlord"</strong> means a User who lists residential or commercial property for rent or sale.</li>
        <li><strong>"Agent"</strong> means a User who lists or markets property on behalf of a third-party owner.</li>
        <li><strong>"Caretaker"</strong> means a User responsible for the day-to-day management of a listed property.</li>
        <li><strong>"Developer"</strong> means a User who lists off-plan or under-construction property developments.</li>
        <li><strong>"Listing"</strong> means any property advertised on the Platform.</li>
        <li><strong>"Short-Stay Booking"</strong> means a short-term rental booking (typically fewer than 30 consecutive nights).</li>
        <li><strong>"Content"</strong> means any text, images, videos, or other media uploaded by a User.</li>
        <li><strong>"Subscription"</strong> means a paid service tier on the Platform.</li>
        <li><strong>"KES"</strong> means Kenyan Shillings, the only currency in which transactions are conducted on the Platform.</li>
      </ul>
    </Section>

    <Section title="2. Acceptance of Terms">
      <p>By clicking "I Agree" during registration, by using Google OAuth to create an account, or by otherwise accessing the Platform, you:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Confirm that you have read and understood these Terms in their entirety.</li>
        <li>Agree to be bound by these Terms and our <Link to="/privacy" className="text-[#ff385c] hover:underline">Privacy Policy</Link> and <Link to="/cookies" className="text-[#ff385c] hover:underline">Cookie Policy</Link>, which are incorporated by reference.</li>
        <li>Confirm that your acceptance constitutes a legally binding contract under the Law of Contract Act (Cap 23) of Kenya.</li>
      </ul>
      <p className="mt-3">If you do not agree to any part of these Terms you must not register an account or use the Platform.</p>
    </Section>

    <Section title="3. Eligibility">
      <p>To use the Platform you must:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Be at least <strong>18 years of age</strong>. The Platform is not directed at minors. By registering you confirm you are 18 or older.</li>
        <li>Have the legal capacity to enter into binding contracts under Kenyan law.</li>
        <li>Not be subject to any court order, legal restriction, or mental incapacity that prevents you from entering contracts.</li>
        <li>If registering on behalf of a business entity, confirm that the entity is duly registered in Kenya and that you are authorised to bind that entity to these Terms.</li>
        <li>Not have had a previous Getkeja account terminated for violation of these Terms.</li>
      </ul>
    </Section>

    <Section title="4. Account Registration & Security">
      <p><strong>4.1 Accurate information.</strong> You must provide accurate, current, and complete information at registration and keep your profile up to date at all times.</p>
      <p><strong>4.2 One account per person.</strong> Each natural person may maintain only one personal account. Operating multiple accounts to circumvent restrictions or bans is prohibited.</p>
      <p><strong>4.3 Password security.</strong> You are solely responsible for maintaining the confidentiality of your password and all activity conducted under your account. You must notify us immediately at <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a> if you suspect unauthorised access to your account.</p>
      <p><strong>4.4 Email verification.</strong> All accounts must be verified via the link sent to your registered email address before full access is granted.</p>
      <p><strong>4.5 Google OAuth.</strong> If you register using Google OAuth, you authorise Getkeja to retrieve your name, email address, and profile picture from Google. You remain bound by these Terms regardless of the sign-in method used.</p>
      <p><strong>4.6 Role verification.</strong> Agents must hold a valid licence issued by the Estate Agents Registration Board (EARB) under the Estate Agents Act (Cap 533) of Kenya. Developers must be duly incorporated or registered under Kenyan law. Getkeja reserves the right to request proof of credentials at any time and to suspend or downgrade accounts where credentials cannot be verified.</p>
    </Section>

    <Section title="5. Marketplace Nature of the Platform">
      <p><strong>Getkeja is a technology marketplace platform and is NOT a real estate agent, property manager, landlord, or tenant.</strong> We facilitate connections between Users. Specifically:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Getkeja does not own, control, or manage any property listed on the Platform.</li>
        <li>Getkeja is not a party to any tenancy agreement, lease, sale agreement, or any other contract between a Landlord/Agent and a Seeker.</li>
        <li>Any tenancy agreement, lease, or sale agreement concluded through introductions made on the Platform is solely between the Landlord/Agent and the Seeker. Such agreements are subject to the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap 301), the Rent Restriction Act (Cap 296), the Land Act 2012, the Land Registration Act 2012, and any other applicable Kenyan legislation.</li>
        <li>Getkeja does not guarantee that any Listing is accurate, available, or compliant with any applicable law or regulation.</li>
        <li>Getkeja does not guarantee that any User (Landlord, Agent, Seeker) is who they claim to be, has authority to deal with a particular property, or will fulfil their obligations.</li>
      </ul>
    </Section>

    <Section title="6. Property Listings — Rules for Landlords, Agents & Developers">
      <p><strong>6.1 Accuracy obligation.</strong> All Listings must be accurate, truthful, and not misleading. You warrant that:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You are the registered owner of the property, or have written authority from the owner to list it.</li>
        <li>The property exists at the stated location and the photographs are genuine and recent.</li>
        <li>All stated amenities, utilities, and features are available and functional.</li>
        <li>The asking price or rental amount is the actual amount being offered.</li>
        <li>The property complies with all applicable Kenyan health, safety, planning, and zoning laws.</li>
      </ul>
      <p><strong>6.2 Review before publication.</strong> All Listings are subject to review by Getkeja staff before publication. We reserve the right to reject, edit, or remove any Listing at our sole discretion without prior notice or compensation.</p>
      <p><strong>6.3 Prohibited listings.</strong> You must NOT list:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Properties you do not own or are not authorised to list.</li>
        <li>Properties involved in ongoing ownership disputes, illegal occupation, or subject to court orders restricting sale or letting.</li>
        <li>Properties designated for uses incompatible with the listing category (e.g., listing industrial land as residential).</li>
        <li>Properties with false or inflated prices intended to mislead Seekers.</li>
        <li>Properties used or intended to be used for any illegal activity.</li>
        <li>Duplicate or "ghost" listings of the same property.</li>
      </ul>
      <p><strong>6.4 Estate Agents Act compliance.</strong> Agents operating on the Platform must comply with the Estate Agents Act (Cap 533) and hold a valid practising licence from EARB. Unlicensed agency activity is a criminal offence under Kenyan law and will result in immediate account termination and referral to the relevant authority.</p>
      <p><strong>6.5 Landlord obligations.</strong> Landlords must ensure that tenancies created through the Platform comply with the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap 301) and the Rent Restriction Act (Cap 296) where applicable. Arbitrary rent increases or illegal evictions facilitated through the Platform are strictly prohibited.</p>
    </Section>

    <Section title="7. Subscriptions & Payments">
      <p><strong>7.1 Subscription plans.</strong> The Platform offers free and paid Subscription tiers. Paid Subscriptions unlock additional features including increased viewing credits, AI recommendations, saved searches, and priority support. Full details of each plan and its pricing are available on the Pricing page.</p>
      <p><strong>7.2 Billing.</strong> Subscriptions are billed on a monthly or annual basis in KES. Billing begins on the date you subscribe and auto-renews unless cancelled before the renewal date.</p>
      <p><strong>7.3 Payment methods.</strong> We accept payments via M-Pesa (Safaricom) and card payments through Paystack (Visa and Mastercard). All transactions are in KES. By providing your M-Pesa number or card details you authorise us to charge the applicable fees.</p>
      <p><strong>7.4 M-Pesa recurring payments.</strong> By enrolling in M-Pesa recurring billing you authorise Getkeja to initiate recurring M-Pesa STK push requests on your M-Pesa number for the applicable Subscription amount. You may cancel recurring billing at any time from your account settings.</p>
      <p><strong>7.5 Short-Stay escrow.</strong> Short-Stay Booking payments are held in escrow by Getkeja and released to the Landlord only after the Seeker confirms check-in. If a Landlord cancels a confirmed booking, or the property materially differs from the Listing, the Seeker is entitled to a full refund processed within 5 business days.</p>
      <p><strong>7.6 No refunds on Subscriptions.</strong> Subscription fees are non-refundable except where required by the Consumer Protection Act 2012 or where Getkeja is in material breach of these Terms. Unused credits or features within a billing period are forfeited upon cancellation.</p>
      <p><strong>7.7 Price changes.</strong> We reserve the right to change Subscription prices upon 30 days' written notice to your registered email address. Continued use of the Platform after the notice period constitutes acceptance of the new price.</p>
      <p><strong>7.8 Taxes.</strong> All fees are inclusive of any applicable Value Added Tax (VAT) or withholding tax as required by Kenyan tax law. You are solely responsible for any additional taxes applicable to your specific circumstances.</p>
    </Section>

    <Section title="8. Short-Stay Bookings — Cancellation Policy">
      <p><strong>8.1 Seeker cancellation.</strong> Cancellation policies are set by individual Landlords and displayed on each Listing. Getkeja is not responsible for the Landlord's cancellation policy. You should review the cancellation policy before booking.</p>
      <p><strong>8.2 Landlord cancellation.</strong> If a Landlord cancels a confirmed Short-Stay Booking less than 48 hours before check-in, the Seeker receives a full refund and the Landlord may be subject to a penalty charge and/or temporary suspension.</p>
      <p><strong>8.3 Disputes.</strong> Short-stay payment disputes must be raised with Getkeja within 48 hours of the scheduled check-in date. Getkeja will mediate in good faith but the final resolution of a contractual dispute between Landlord and Seeker remains the parties' responsibility, subject to Kenyan law.</p>
    </Section>

    <Section title="9. User Content & Intellectual Property">
      <p><strong>9.1 Your Content.</strong> You retain ownership of all Content you upload to the Platform. By uploading Content, you grant Getkeja a worldwide, non-exclusive, royalty-free, sub-licensable licence to store, display, reproduce, modify (for formatting purposes only), and distribute your Content solely for the purpose of operating and promoting the Platform.</p>
      <p><strong>9.2 Content warranties.</strong> You warrant that:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You own or have the right to upload and licence all Content you submit.</li>
        <li>Your Content does not infringe any third-party intellectual property rights.</li>
        <li>Photographs and videos of properties are genuine and taken at the listed property.</li>
      </ul>
      <p><strong>9.3 Getkeja's intellectual property.</strong> The Getkeja name, logo, brand, software, platform design, NLP search technology, and all associated intellectual property are owned by Getkeja Kenya Limited and protected under Kenyan and international intellectual property laws. You may not copy, reproduce, or use any of Getkeja's intellectual property without our express written consent.</p>
      <p><strong>9.4 Feedback.</strong> Any feedback, suggestions, or ideas you provide to Getkeja may be used by us without restriction or compensation to you.</p>
    </Section>

    <Section title="10. Prohibited Conduct">
      <p>You agree NOT to use the Platform to:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Post false, misleading, or fraudulent Listings or information.</li>
        <li>Impersonate any person, company, or government entity.</li>
        <li>Harass, threaten, defame, or abuse any other User.</li>
        <li>Scrape, harvest, or collect data from the Platform without written authorisation — a violation of the Computer Misuse and Cybercrimes Act 2018.</li>
        <li>Circumvent, disable, or interfere with any security feature of the Platform.</li>
        <li>Upload malicious code, viruses, or any software designed to damage or interfere with the Platform.</li>
        <li>Conduct or facilitate money laundering, fraud, or any other financial crime — a violation of the Proceeds of Crime and Anti-Money Laundering Act (Cap 323B).</li>
        <li>Use the Platform to solicit payments outside of the Platform's payment system for Short-Stay Bookings.</li>
        <li>Discriminate against Seekers on the basis of race, sex, nationality, religion, disability, or any other ground prohibited under the Constitution of Kenya 2010 or the Anti-Discrimination legislation.</li>
        <li>Post Content that is obscene, offensive, or violates any Kenyan law.</li>
        <li>Create multiple accounts to evade restrictions or bans.</li>
        <li>Engage in any activity that disrupts, damages, or overburdens the Platform or its infrastructure.</li>
      </ul>
      <p className="mt-3">Violation of any of the above may result in immediate account suspension or permanent termination, removal of Listings, forfeiture of any credits or Subscription balance, and referral to law enforcement authorities where required by law.</p>
    </Section>

    <Section title="11. Privacy & Data Protection">
      <p>Getkeja takes the protection of your personal data seriously. We process your personal data in accordance with the <strong>Kenya Data Protection Act 2019</strong> and the regulations issued thereunder by the Office of the Data Protection Commissioner (ODPC).</p>
      <p className="mt-2">Our lawful bases for processing your data include: performance of this contract, compliance with a legal obligation, and legitimate interests. Full details of what data we collect, how we use it, with whom we share it, and how long we retain it are set out in our <Link to="/privacy" className="text-[#ff385c] hover:underline">Privacy Policy</Link>.</p>
      <p className="mt-2"><strong>Your rights under the Data Protection Act 2019:</strong></p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Right of access</strong> — to obtain a copy of your personal data held by us.</li>
        <li><strong>Right to rectification</strong> — to correct inaccurate or incomplete data.</li>
        <li><strong>Right to erasure</strong> — to request deletion of your data (subject to legal retention obligations).</li>
        <li><strong>Right to data portability</strong> — to receive your data in a structured, machine-readable format.</li>
        <li><strong>Right to object</strong> — to object to data processing based on legitimate interests.</li>
        <li><strong>Right to withdraw consent</strong> — where processing is based on consent, to withdraw consent at any time without affecting the lawfulness of prior processing.</li>
      </ul>
      <p className="mt-2">To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a>. We will respond within 21 days as required by law. If you are unsatisfied with our response, you have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) at <a href="https://www.odpc.go.ke" className="text-[#ff385c] hover:underline" target="_blank" rel="noopener noreferrer">www.odpc.go.ke</a>.</p>
    </Section>

    <Section title="12. Disclaimers">
      <p><strong>12.1 "As is" service.</strong> The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, to the fullest extent permitted by Kenyan law.</p>
      <p><strong>12.2 No warranty on Listings.</strong> Getkeja makes no representation or warranty about the accuracy, completeness, legality, or availability of any Listing. Seekers should independently verify all information before entering into any agreement.</p>
      <p><strong>12.3 Third-party services.</strong> The Platform integrates third-party services including Supabase, Cloudinary, Resend, Google, M-Pesa, and Paystack. We are not responsible for the availability, accuracy, or conduct of these third-party services.</p>
      <p><strong>12.4 Uptime.</strong> Getkeja does not guarantee uninterrupted or error-free access to the Platform. Scheduled maintenance, force majeure events, or technical failures may cause temporary unavailability.</p>
    </Section>

    <Section title="13. Limitation of Liability">
      <p>To the maximum extent permitted by the Consumer Protection Act 2012 and other applicable Kenyan law:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Getkeja's total aggregate liability to you for any claim arising out of or related to these Terms or your use of the Platform shall not exceed the total Subscription fees paid by you to Getkeja in the 12 months preceding the event giving rise to the claim, or KES 5,000, whichever is greater.</li>
        <li>Getkeja shall not be liable for any indirect, incidental, special, consequential, or punitive damages including loss of profits, loss of data, loss of goodwill, or damages arising from your reliance on any Listing or User on the Platform.</li>
        <li>Getkeja shall not be liable for any loss arising from fraudulent Listings, misrepresentation by Landlords or Agents, failure of a property transaction, or disputes between Landlords and Seekers.</li>
      </ul>
      <p className="mt-3">Nothing in these Terms excludes or limits Getkeja's liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be excluded under Kenyan law.</p>
    </Section>

    <Section title="14. Indemnification">
      <p>You agree to indemnify, defend, and hold harmless Getkeja Kenya Limited, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Your breach of these Terms.</li>
        <li>Any Content you upload to the Platform.</li>
        <li>Any property transaction or tenancy agreement you enter into through introductions made on the Platform.</li>
        <li>Your violation of any Kenyan law or third-party rights.</li>
        <li>Any dispute between you and another User.</li>
      </ul>
    </Section>

    <Section title="15. Account Suspension & Termination">
      <p><strong>15.1 By Getkeja.</strong> We may suspend or terminate your account immediately and without notice if:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You breach any provision of these Terms.</li>
        <li>We receive a valid court order or law enforcement request requiring us to do so.</li>
        <li>We reasonably suspect fraudulent activity on your account.</li>
        <li>Your account has been inactive for more than 24 months.</li>
      </ul>
      <p><strong>15.2 By you.</strong> You may close your account at any time by emailing <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a>. Upon closure, your personal data will be handled in accordance with our <Link to="/privacy" className="text-[#ff385c] hover:underline">Privacy Policy</Link> and applicable data retention obligations.</p>
      <p><strong>15.3 Effect of termination.</strong> Upon termination, your right to access the Platform ceases immediately. Active Short-Stay Bookings will be handled on a case-by-case basis. Any outstanding payment obligations remain enforceable.</p>
    </Section>

    <Section title="16. Governing Law & Dispute Resolution">
      <p><strong>16.1 Governing law.</strong> These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of Kenya.</p>
      <p><strong>16.2 Amicable resolution.</strong> In the event of a dispute, the parties shall first attempt to resolve it amicably by contacting us at <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a>. We aim to respond within 5 business days.</p>
      <p><strong>16.3 Consumer disputes.</strong> If you are a consumer, you may also raise disputes through the Consumer Protection mechanisms available under the Consumer Protection Act 2012, including referral to the Competition Authority of Kenya.</p>
      <p><strong>16.4 Mediation.</strong> If amicable resolution fails within 30 days, parties shall attempt mediation through the Nairobi Centre for International Arbitration (NCIA) or any mutually agreed mediator before proceeding to litigation.</p>
      <p><strong>16.5 Jurisdiction.</strong> If mediation fails, the courts of Nairobi, Kenya, shall have exclusive jurisdiction to hear and determine any dispute. Nothing in this clause prevents either party from seeking urgent injunctive relief from any competent court.</p>
    </Section>

    <Section title="17. Changes to These Terms">
      <p>Getkeja reserves the right to modify these Terms at any time. When we make material changes, we will:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Update the "Last Updated" date at the top of this page.</li>
        <li>Send a notification to your registered email address at least 14 days before the changes take effect.</li>
        <li>Display a prominent notice on the Platform.</li>
      </ul>
      <p className="mt-2">Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must close your account before the effective date.</p>
    </Section>

    <Section title="18. General Provisions">
      <p><strong>18.1 Entire agreement.</strong> These Terms, together with the Privacy Policy and Cookie Policy, constitute the entire agreement between you and Getkeja regarding your use of the Platform.</p>
      <p><strong>18.2 Severability.</strong> If any provision of these Terms is found to be invalid or unenforceable by a Kenyan court, the remaining provisions shall continue in full force and effect.</p>
      <p><strong>18.3 No waiver.</strong> Failure by Getkeja to enforce any right under these Terms shall not constitute a waiver of that right.</p>
      <p><strong>18.4 Assignment.</strong> You may not assign or transfer any rights or obligations under these Terms without Getkeja's prior written consent. Getkeja may assign these Terms in connection with a merger, acquisition, or sale of all or substantially all of its assets.</p>
      <p><strong>18.5 Force majeure.</strong> Getkeja shall not be liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including natural disasters, government actions, internet outages, or industrial disputes.</p>
      <p><strong>18.6 Language.</strong> These Terms are written in English. In the event of any conflict with a translation, the English version shall prevail.</p>
    </Section>

    <Section title="19. Contact Us">
      <p>If you have any questions about these Terms, please contact us:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Email:</strong> <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a></li>
        <li><strong>WhatsApp:</strong> <a href="https://wa.me/254757568845" className="text-[#ff385c] hover:underline" target="_blank" rel="noopener noreferrer">+254 757 568 845</a></li>
        <li><strong>Data Protection Officer:</strong> <a href="mailto:hello@getkeja.online" className="text-[#ff385c] hover:underline">hello@getkeja.online</a></li>
        <li><strong>Office of the Data Protection Commissioner:</strong> <a href="https://www.odpc.go.ke" className="text-[#ff385c] hover:underline" target="_blank" rel="noopener noreferrer">www.odpc.go.ke</a></li>
      </ul>
    </Section>

    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center text-sm text-gray-500 mt-6">
      <p className="font-semibold text-[#222] mb-1">Getkeja Kenya Limited</p>
      <p>Nairobi, Kenya &nbsp;·&nbsp; Registered under the Companies Act 2015</p>
      <p className="mt-1">These Terms were last reviewed by legal counsel in April 2026.</p>
    </div>
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
