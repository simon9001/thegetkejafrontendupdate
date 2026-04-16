// frontend/src/pages/BecomeHost.tsx
// "Share Your Home" — role application flow.
// Users fill in their ID documents and desired role (landlord / developer).
// Staff reviews the submission in StaffDashboard → Verifications tab and approves/rejects.
// On approval the backend upgrades the user's role.

import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Building2, CheckCircle2, ChevronRight, ChevronLeft,
  X, Loader2, User, Briefcase, Shield,
  FileText, Camera, AlertTriangle, ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { selectCurrentUser, selectIsAuthenticated } from '../features/Slice/AuthSlice';
import { useSubmitVerificationMutation, useGetMyVerificationQuery } from '../features/Api/UsersApi';

// ─── helpers ─────────────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-[#ff385c] ml-0.5">*</span>}
  </label>
);
const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#c1c1c1] rounded-lg text-sm text-[#222222] placeholder:text-[#c1c1c1] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] transition";

const STEPS = ['Your Role', 'Identity', 'Business Details', 'Review & Submit'];

// ─── Image uploader ───────────────────────────────────────────────────────────
const ImageUploader: React.FC<{
  label: string; hint: string; icon: React.ElementType;
  value: string | null; onChange: (dataUrl: string | null) => void;
}> = ({ label, hint, icon: Icon, value, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG or WebP allowed'); return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Label>{label}</Label>
      <p className="text-[11px] text-[#6a6a6a] mb-2">{hint}</p>
      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group">
          <img src={value} className="w-full h-full object-cover" alt={label} />
          <button onClick={() => { onChange(null); if (ref.current) ref.current.value = ''; }}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
            <X className="w-3.5 h-3.5 text-red-500" />
          </button>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="w-full h-36 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#c1c1c1] rounded-xl text-[#6a6a6a] hover:border-[#ff385c] hover:text-[#ff385c] transition-colors bg-[#f7f7f7]">
          <Icon className="w-6 h-6" />
          <span className="text-xs font-semibold">Click to upload</span>
          <span className="text-[10px]">JPEG, PNG, WebP · max 5 MB</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const BecomeHost: React.FC = () => {
  const navigate   = useNavigate();
  const user       = useSelector(selectCurrentUser);
  const isAuth     = useSelector(selectIsAuthenticated);
  const [submit, { isLoading }] = useSubmitVerificationMutation();
  const { data: verifData } = useGetMyVerificationQuery(undefined, { skip: !isAuth });

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 1 — role
  const [role, setRole] = useState<'landlord' | 'developer' | 'agent' | null>(null);

  // Step 2 — identity
  const [docType, setDocType] = useState<'national_id' | 'passport'>('national_id');
  const [docNumber, setDocNumber] = useState('');
  const [frontImg, setFrontImg]   = useState<string | null>(null);
  const [backImg,  setBackImg]    = useState<string | null>(null);
  const [selfieImg, setSelfieImg] = useState<string | null>(null);

  // Step 3 — developer extras
  const [companyName, setCompanyName] = useState('');
  const [kraPin, setKraPin]           = useState('');
  const [ncaReg, setNcaReg]           = useState('');
  const [bizDocType, setBizDocType]   = useState<'company_cert' | 'nca_cert'>('company_cert');
  const [bizImg, setBizImg]           = useState<string | null>(null);

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-[#fff1f3] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#ff385c]" />
          </div>
          <h2 className="text-xl font-bold text-[#222222] mb-2">Sign in first</h2>
          <p className="text-sm text-[#6a6a6a] mb-6">You need an account to apply to become a host.</p>
          <Link to="/login" className="block w-full py-3 bg-[#ff385c] text-white rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Already a landlord or developer — no need to apply
  const existingRoles = user?.roles ?? [];
  const pendingVerif  = verifData?.verification;

  if (pendingVerif?.status === 'pending') {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[#222222] mb-2">Application under review</h2>
          <p className="text-sm text-[#6a6a6a] mb-1">
            Your application (<strong className="capitalize">{pendingVerif.doc_type.replace(/_/g, ' ')}</strong>) was submitted on{' '}
            {new Date(pendingVerif.submitted_at).toLocaleDateString()}.
          </p>
          <p className="text-sm text-[#6a6a6a] mb-6">Our staff will review it within 1–2 business days. You'll get an email when it's done.</p>
          <button onClick={() => navigate('/')}
            className="block w-full py-3 bg-[#222222] text-white rounded-xl font-bold text-sm hover:bg-[#ff385c] transition-all">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (existingRoles.includes('landlord') || existingRoles.includes('developer')) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-[#222222] mb-2">You're already a host!</h2>
          <p className="text-sm text-[#6a6a6a] mb-6">Your account already has listing privileges.</p>
          <button onClick={() => navigate('/dashboard')}
            className="block w-full py-3 bg-[#222222] text-white rounded-xl font-bold text-sm hover:bg-[#ff385c] transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const maxStep = (role === 'developer' || role === 'agent') ? 4 : 3;

  const validate = (): string | null => {
    if (step === 1) {
      if (!role) return 'Please choose a role';
    }
    if (step === 2) {
      if (!docNumber.trim()) return 'Document number is required';
      if (!frontImg) return 'Front of document is required';
      if (!selfieImg) return 'Selfie photo is required';
    }
    if (step === 3 && role === 'developer') {
      if (!companyName.trim()) return 'Company name is required';
      if (!bizImg) return 'Business document is required';
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setStep(s => Math.min(s + 1, maxStep));
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    try {
      const body: any = {
        doc_type:       docType,
        doc_number:     docNumber.trim(),
        front_image:    frontImg ?? undefined,
        back_image:     backImg  ?? undefined,
        selfie:         selfieImg ?? undefined,
      };
      if (role === 'developer') {
        body.company_name  = companyName.trim();
        body.kra_pin       = kraPin.trim() || undefined;
        body.nca_reg_number = ncaReg.trim() || undefined;
        // If developer submitted a business doc, attach it as a second doc_type
        if (bizImg) {
          body.biz_doc_type  = bizDocType;
          body.biz_doc_image = bizImg;
        }
      }
      await submit(body).unwrap();
      setDone(true);
    } catch (e: any) {
      toast.error(e?.data?.message || 'Submission failed. Please try again.');
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mb-2">Application submitted!</h2>
          <p className="text-sm text-[#6a6a6a] mb-1">Our staff will review your documents within <strong>1–2 business days</strong>.</p>
          <p className="text-sm text-[#6a6a6a] mb-8">You'll receive an email once your account is upgraded to <strong className="capitalize">{role}</strong>.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-[#222222] hover:bg-gray-50 transition-all">
              Back to Home
            </button>
            <button onClick={() => navigate('/profile')}
              className="flex-1 py-3 bg-[#ff385c] text-white rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all">
              View Profile
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const visibleSteps = (role === 'developer' || role === 'agent') ? STEPS : STEPS.filter(s => s !== 'Business Details');

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#ff385c] rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#222222] text-sm hidden sm:block">GetKeja</span>
          </Link>
          <div className="ml-auto text-xs text-[#6a6a6a] font-medium">
            Step {step} of {maxStep}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-24 pt-8">
        {/* Rejection notice */}
        {pendingVerif?.status === 'rejected' && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-red-700 text-sm">Your previous application was rejected.</p>
              {pendingVerif.rejection_reason && (
                <p className="text-red-600 text-xs mt-0.5">{pendingVerif.rejection_reason}</p>
              )}
              <p className="text-red-500 text-xs mt-1">Please re-submit with corrected documents below.</p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222] tracking-tight">Share Your Home</h1>
          <p className="text-sm text-[#6a6a6a] mt-2">Apply to list your property on GetKeja. Our staff will verify your identity and approve your account within 1–2 business days.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
          {visibleSteps.map((label, i) => {
            const n = i + 1;
            const realN = role === 'developer' ? n : n >= 3 ? n + 1 : n;
            const done2 = step > realN;
            const active = step === realN;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done2   ? 'bg-[#ff385c] text-white' :
                      active ? 'bg-[#222222] text-white' :
                               'bg-[#f2f2f2] text-[#6a6a6a]'}`}>
                    {done2 ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${active ? 'text-[#222222]' : 'text-[#6a6a6a]'}`}>
                    {label}
                  </span>
                </div>
                {i < visibleSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 min-w-[20px] ${step > realN ? 'bg-[#ff385c]' : 'bg-[#f2f2f2]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-7 space-y-6">

            {/* ── STEP 1: Role selection ── */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-[#222222] mb-1">What type of host are you?</h2>
                  <p className="text-sm text-[#6a6a6a]">Choose the role that best describes how you'll use GetKeja.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      key: 'landlord' as const,
                      icon: Home,
                      title: 'Landlord / Individual Host',
                      desc: 'You own or manage one or a few properties — apartments, houses, bedsitters, or short-stay units.',
                      docs: 'National ID or Passport',
                    },
                    {
                      key: 'agent' as const,
                      icon: User,
                      title: 'Real Estate Agent',
                      desc: 'You manage properties on behalf of landlords or developers. Requires a valid license and identity verification.',
                      docs: 'National ID + Agent License',
                    },
                    {
                      key: 'developer' as const,
                      icon: Building2,
                      title: 'Property Developer',
                      desc: 'You develop or manage multiple properties or off-plan projects. May require a company or NCA certificate.',
                      docs: 'National ID + Company Certificate',
                    },
                  ].map(opt => {
                    const Icon = opt.icon;
                    const selected = role === opt.key;
                    return (
                      <button key={opt.key} type="button" onClick={() => setRole(opt.key)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all hover:border-[#ff385c] ${selected ? 'border-[#ff385c] bg-[#fff1f3]' : 'border-gray-200'}`}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${selected ? 'bg-[#ff385c] text-white' : 'bg-gray-100 text-[#6a6a6a]'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-[#222222] text-sm mb-1">{opt.title}</p>
                        <p className="text-xs text-[#6a6a6a] leading-relaxed mb-2">{opt.desc}</p>
                        <p className="text-[10px] font-bold text-[#ff385c] uppercase tracking-wide">{opt.docs}</p>
                        {selected && <div className="absolute top-3 right-3"><CheckCircle2 className="w-4 h-4 text-[#ff385c]" /></div>}
                      </button>
                    );
                  })}
                </div>

                {/* What happens next */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-[#222222] mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#ff385c]" /> How verification works
                  </p>
                  <ol className="space-y-1.5">
                    {[
                      'Upload your identity document and a selfie',
                      'Our staff reviews your documents (1–2 business days)',
                      'On approval, your account is upgraded and you can list properties',
                    ].map((s, i) => (
                      <li key={i} className="text-xs text-[#6a6a6a] flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#ff385c] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}

            {/* ── STEP 2: Identity documents ── */}
            {step === 2 && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-[#222222] mb-1">Identity Verification</h2>
                  <p className="text-sm text-[#6a6a6a]">Upload a clear photo of your identity document and a selfie.</p>
                </div>

                <div>
                  <Label required>Document type</Label>
                  <div className="flex gap-3">
                    {([['national_id', 'National ID'], ['passport', 'Passport']] as const).map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setDocType(val)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${docType === val ? 'border-[#ff385c] bg-[#fff1f3] text-[#ff385c]' : 'border-gray-200 text-[#6a6a6a] hover:border-gray-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label required>Document number</Label>
                  <input value={docNumber} onChange={e => setDocNumber(e.target.value)}
                    placeholder={docType === 'national_id' ? 'e.g. 12345678' : 'e.g. A1234567'}
                    className={inputCls} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploader label="Front of document *" hint="Clear photo of the front side"
                    icon={FileText} value={frontImg} onChange={setFrontImg} />
                  {docType === 'national_id' && (
                    <ImageUploader label="Back of document" hint="Back side (optional for national ID)"
                      icon={FileText} value={backImg} onChange={setBackImg} />
                  )}
                </div>

                <ImageUploader label="Selfie photo *" hint="A clear photo of your face (no sunglasses)"
                  icon={Camera} value={selfieImg} onChange={setSelfieImg} />

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">All documents are encrypted and used solely for identity verification. They are never shared with third parties.</p>
                </div>
              </>
            )}

            {/* ── STEP 3: Developer business docs (developer only) ── */}
            {step === 3 && (role === 'developer' || role === 'agent') && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-[#222222] mb-1">
                    {role === 'developer' ? 'Business Details' : 'Professional Credentials'}
                  </h2>
                  <p className="text-sm text-[#6a6a6a]">
                    {role === 'developer' 
                      ? 'As a developer, we need your company or professional registration details.'
                      : 'As an agent, we need your licensing and professional details.'}
                  </p>
                </div>

                {role === 'developer' && (
                  <div>
                    <Label required>Company / business name</Label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Properties Ltd" className={inputCls} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {role === 'developer' ? (
                    <>
                      <div>
                        <Label>KRA PIN</Label>
                        <input value={kraPin} onChange={e => setKraPin(e.target.value)}
                          placeholder="e.g. A012345678Z" className={inputCls} />
                      </div>
                      <div>
                        <Label>NCA Registration No.</Label>
                        <input value={ncaReg} onChange={e => setNcaReg(e.target.value)}
                          placeholder="e.g. NCA/2023/0001" className={inputCls} />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label required>EAARB License Number</Label>
                      <input value={kraPin} onChange={e => setKraPin(e.target.value)}
                        placeholder="e.g. REA/2024/00123" className={inputCls} />
                    </div>
                  )}
                </div>

                <div>
                  <Label required>{role === 'developer' ? 'Business document type' : 'Certification type'}</Label>
                  <div className="flex gap-3">
                    {(role === 'developer' 
                      ? [['company_cert', 'Company Certificate'], ['nca_cert', 'NCA Certificate']] as const
                      : [['earb_license', 'EAARB License'], ['other', 'Other License']] as const).map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setBizDocType(val as any)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${bizDocType === val ? 'border-[#ff385c] bg-[#fff1f3] text-[#ff385c]' : 'border-gray-200 text-[#6a6a6a] hover:border-gray-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <ImageUploader label={role === 'developer' ? 'Business document *' : 'License document *'}
                  hint={role === 'developer' 
                    ? 'Upload your company cert, NCA cert, or official business registration'
                    : 'Upload your EAARB license or valid professional certification'}
                  icon={Briefcase} value={bizImg} onChange={setBizImg} />
              </>
            )}

            {/* ── REVIEW STEP (step 3 for landlord, step 4 for developer) ── */}
            {((step === 3 && role === 'landlord') || (step === 4 && role === 'developer')) && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-[#222222] mb-1">Review your application</h2>
                  <p className="text-sm text-[#6a6a6a]">Check everything looks correct before submitting.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Applying as', value: role === 'developer' ? 'Property Developer' : 'Landlord / Individual Host' },
                    { label: 'Document type', value: docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
                    { label: 'Document number', value: docNumber || '—' },
                    { label: 'Front of document', value: frontImg ? '✓ Uploaded' : '✗ Missing' },
                    { label: 'Back of document', value: backImg ? '✓ Uploaded' : '— (optional)' },
                    { label: 'Selfie', value: selfieImg ? '✓ Uploaded' : '✗ Missing' },
                    ...(role === 'developer' ? [
                      { label: 'Company name', value: companyName || '—' },
                      { label: 'KRA PIN', value: kraPin || '—' },
                      { label: 'NCA Reg No.', value: ncaReg || '—' },
                      { label: 'Business document', value: bizImg ? '✓ Uploaded' : '— (optional)' },
                    ] : (role as string) === 'agent' ? [
                      { label: 'License number', value: kraPin || '—' },
                      { label: 'License document', value: bizImg ? '✓ Uploaded' : '✗ Missing' },
                    ] : []),
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs font-semibold text-[#6a6a6a]">{row.label}</span>
                      <span className={`text-xs font-bold ${row.value.startsWith('✗') ? 'text-red-500' : row.value.startsWith('✓') ? 'text-emerald-600' : 'text-[#222222]'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-[#6a6a6a] leading-relaxed">
                  By submitting, you confirm that all information provided is accurate and that you agree to GetKeja's host terms and conditions.
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-[#222222] hover:bg-gray-50 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < maxStep ? (
            <button type="button" onClick={next}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#222222] text-white rounded-xl text-sm font-bold hover:bg-[#ff385c] transition-all">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isLoading}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#ff385c] text-white rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all disabled:opacity-60">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><CheckCircle2 className="w-4 h-4" /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeHost;
