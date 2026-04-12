import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home, DollarSign, MapPin, Image as ImageIcon,
  CheckCircle2, ChevronRight, ChevronLeft, Plus, X,
  LocateFixed, Loader2, Phone, Mail, User, Building2,
  Droplets, Zap, Trash2, Shield, Car, Trees,
} from 'lucide-react';
import { useCreatePropertyMutation } from '../../features/Api/PropertiesApi';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocalImage {
  previewUrl: string;
  file: File;
  dataUrl?: string; // base64 for submission
}

// ─── Field helpers ────────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-[#ff385c] ml-0.5">*</span>}
  </label>
);

const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#c1c1c1] rounded-lg text-sm text-[#222222] placeholder:text-[#c1c1c1] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] transition";
const selectCls = inputCls;

// ─── Step Pill ────────────────────────────────────────────────────────────────
const STEPS = ['Basic Info', 'Location', 'Pricing', 'Contacts & Amenities', 'Photos'];

// ─── Component ────────────────────────────────────────────────────────────────
const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();

  const getReturnPath = (): string => {
    const roles = user?.roles ?? [];
    if (roles.includes('developer'))  return '/dashboard/developer';
    if (roles.includes('agent'))      return '/dashboard/agent';
    if (roles.includes('landlord'))   return '/dashboard/landlord';
    return '/dashboard';
  };

  const [step, setStep] = useState(1);
  const [geoLoading, setGeoLoading] = useState(false);
  const [images, setImages] = useState<LocalImage[]>([]);

  // ── Core fields ──────────────────────────────────────────────────────────
  const [core, setCore] = useState({
    listing_category:    'long_term_rent' as 'for_sale' | 'long_term_rent' | 'short_term_rent' | 'commercial',
    listing_type:        'apartment' as 'apartment' | 'house' | 'bedsitter' | 'plot' | 'maisonette' | 'studio' | 'villa' | 'off_plan',
    management_model:    'owner_direct' as 'owner_direct' | 'agent_managed' | 'caretaker_managed' | 'developer_held',
    title:               '',
    description:         '',
    construction_status: 'completed' as 'completed' | 'off_plan' | 'under_construction',
    year_built:          '',
    floor_area_sqm:      '',
    bedrooms:            '',
    bathrooms:           '',
    is_ensuite:          false,
    parking_spaces:      '0',
    compound_is_gated:   false,
    water_supply:        'nairobi_water' as 'nairobi_water' | 'borehole' | 'both' | 'tank_only',
    electricity_supply:  'kplc_prepaid' as 'kplc_prepaid' | 'kplc_postpaid' | 'solar' | 'generator',
    waste_management:    'ncc_collection' as 'ncc_collection' | 'private' | 'septic_tank',
    is_furnished:        'unfurnished' as 'unfurnished' | 'semi_furnished' | 'fully_furnished',
    security_type:       [] as string[],
  });

  // ── Location ─────────────────────────────────────────────────────────────
  const [location, setLocation] = useState({
    county:           '',
    sub_county:       '',
    area:             '',
    estate_name:      '',
    road_street:      '',
    nearest_landmark: '',
    directions:       '',
    latitude:         '',
    longitude:        '',
    display_full_address: true,
  });

  // ── Pricing ──────────────────────────────────────────────────────────────
  const [pricing, setPricing] = useState({
    monthly_rent:          '',
    asking_price:          '',
    deposit_months:        '',
    deposit_amount:        '',
    service_charge:        '',
    caretaker_fee:         '',
    garbage_fee:           '',
    goodwill_fee:          '',
    water_bill_type:       'metered' as 'included' | 'metered' | 'shared_split',
    electricity_bill_type: 'prepaid_token' as 'included' | 'prepaid_token' | 'own_meter',
    negotiable:            false,
    rent_frequency:        'monthly' as 'monthly' | 'quarterly' | 'annually',
  });

  // ── Contact ──────────────────────────────────────────────────────────────
  const [contact, setContact] = useState({
    role:               'landlord' as 'landlord' | 'caretaker' | 'agent' | 'developer' | 'property_manager',
    full_name:          '',
    phone_primary:      '',
    whatsapp_number:    '',
    email:              '',
    is_primary_contact: true,
    is_on_site:         false,
    availability_hours: '',
  });

  // ── Amenities ────────────────────────────────────────────────────────────
  const AMENITY_OPTIONS = [
    { category: 'security',    name: '24/7 Security Guard',   icon: Shield },
    { category: 'security',    name: 'CCTV Cameras',          icon: Shield },
    { category: 'security',    name: 'Electric Fence',        icon: Shield },
    { category: 'recreation',  name: 'Swimming Pool',         icon: Droplets },
    { category: 'recreation',  name: 'Gymnasium / Gym',       icon: Building2 },
    { category: 'recreation',  name: 'Rooftop Terrace',       icon: Building2 },
    { category: 'utilities',   name: 'Backup Generator',      icon: Zap },
    { category: 'utilities',   name: 'Solar Panels',          icon: Zap },
    { category: 'utilities',   name: 'Borehole Water',        icon: Droplets },
    { category: 'utilities',   name: 'Fibre Internet Ready',  icon: Zap },
    { category: 'green',       name: 'Garden / Landscaping',  icon: Trees },
    { category: 'transport',   name: 'Parking Space',         icon: Car },
    { category: 'transport',   name: 'Covered Parking',       icon: Car },
    { category: 'other',       name: 'Lift / Elevator',       icon: Building2 },
    { category: 'other',       name: 'Servants Quarters',     icon: Home },
  ] as const;

  const SECURITY_TYPES = ['Guard', 'CCTV', 'Electric Fence', 'Intercom', 'Access Control'];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (name: string) =>
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );

  const toggleSecurity = (t: string) =>
    setCore(prev => ({
      ...prev,
      security_type: prev.security_type.includes(t)
        ? prev.security_type.filter(s => s !== t)
        : [...prev.security_type, t],
    }));

  // ── Geo ───────────────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(prev => ({
          ...prev,
          latitude: coords.latitude.toFixed(7),
          longitude: coords.longitude.toFixed(7),
        }));
        toast.success('Location detected');
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        const msgs: Record<number, string> = {
          1: 'Permission denied — allow location in browser settings',
          2: 'Position unavailable. Enter coordinates manually.',
          3: 'Location request timed out.',
        };
        toast.error(msgs[err.code] ?? 'Failed to get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // ── Image ─────────────────────────────────────────────────────────────────
  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const processFiles = async (files: FileList | File[]) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const valid = Array.from(files).filter(f => {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: unsupported type`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name}: exceeds 10MB`); return false; }
      return true;
    });
    if (!valid.length) return;

    const newImgs: LocalImage[] = await Promise.all(
      valid.map(async (file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        dataUrl: await readAsDataUrl(file),
      }))
    );
    setImages(prev => [...prev, ...newImgs]);
  };

  const removeImage = (i: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!core.title.trim() || core.title.length < 5) return 'Title must be at least 5 characters';
    if (!location.county.trim()) return 'County is required';
    if (!location.latitude || !location.longitude) return 'Coordinates are required — use "Detect" or enter manually';
    const needsRent = core.listing_category === 'long_term_rent' || core.listing_category === 'short_term_rent';
    const needsSale = core.listing_category === 'for_sale';
    if (needsRent && !pricing.monthly_rent) return 'Monthly rent is required';
    if (needsSale && !pricing.asking_price) return 'Asking price is required';
    if (!contact.full_name.trim()) return 'Contact name is required';
    if (!contact.phone_primary.trim()) return 'Contact phone is required';
    if (images.length === 0) return 'Please add at least one photo';
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    const amenityPayload = selectedAmenities.map(name => {
      const opt = AMENITY_OPTIONS.find(a => a.name === name);
      return { category: opt?.category ?? 'other', name, is_included: true };
    });

    const mediaPayload = images.map((img, i) => ({
      media_type: 'photo' as const,
      file:       img.dataUrl!,
      sort_order: i,
      is_cover:   i === 0,
    }));

    const pricingPayload: Record<string, any> = {
      currency:              'KES',
      water_bill_type:       pricing.water_bill_type,
      electricity_bill_type: pricing.electricity_bill_type,
      negotiable:            pricing.negotiable,
      rent_frequency:        pricing.rent_frequency,
    };
    if (pricing.monthly_rent)   pricingPayload.monthly_rent   = Number(pricing.monthly_rent);
    if (pricing.asking_price)   pricingPayload.asking_price   = Number(pricing.asking_price);
    if (pricing.deposit_months) pricingPayload.deposit_months = Number(pricing.deposit_months);
    if (pricing.deposit_amount) pricingPayload.deposit_amount = Number(pricing.deposit_amount);
    if (pricing.service_charge) pricingPayload.service_charge = Number(pricing.service_charge);
    if (pricing.caretaker_fee)  pricingPayload.caretaker_fee  = Number(pricing.caretaker_fee);
    if (pricing.garbage_fee)    pricingPayload.garbage_fee    = Number(pricing.garbage_fee);
    if (pricing.goodwill_fee)   pricingPayload.goodwill_fee   = Number(pricing.goodwill_fee);

    const locationPayload: Record<string, any> = {
      county:   location.county,
      latitude:  Number(location.latitude),
      longitude: Number(location.longitude),
      display_full_address: location.display_full_address,
    };
    if (location.sub_county)       locationPayload.sub_county       = location.sub_county;
    if (location.area)             locationPayload.area             = location.area;
    if (location.estate_name)      locationPayload.estate_name      = location.estate_name;
    if (location.road_street)      locationPayload.road_street      = location.road_street;
    if (location.nearest_landmark) locationPayload.nearest_landmark = location.nearest_landmark;
    if (location.directions)       locationPayload.directions       = location.directions;

    const corePayload: Record<string, any> = {
      listing_category:    core.listing_category,
      listing_type:        core.listing_type,
      management_model:    core.management_model,
      title:               core.title.trim(),
      construction_status: core.construction_status,
      is_ensuite:          core.is_ensuite,
      parking_spaces:      Number(core.parking_spaces) || 0,
      compound_is_gated:   core.compound_is_gated,
      is_furnished:        core.is_furnished,
      water_supply:        core.water_supply,
      electricity_supply:  core.electricity_supply,
      waste_management:    core.waste_management,
    };
    if (core.description)   corePayload.description   = core.description.trim();
    if (core.year_built)    corePayload.year_built     = Number(core.year_built);
    if (core.floor_area_sqm) corePayload.floor_area_sqm = Number(core.floor_area_sqm);
    if (core.bedrooms)      corePayload.bedrooms       = Number(core.bedrooms);
    if (core.bathrooms)     corePayload.bathrooms      = Number(core.bathrooms);
    if (core.security_type.length) corePayload.security_type = core.security_type;

    const body = {
      ...corePayload,
      location:  locationPayload,
      pricing:   pricingPayload,
      contacts:  [{ ...contact, phone_primary: contact.phone_primary.trim() }],
      amenities: amenityPayload,
      media:     mediaPayload,
    };

    try {
      await createProperty(body as any).unwrap();
      toast.success('Property listed successfully!');
      navigate(getReturnPath());
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create property');
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-24 px-4">

        {/* Header */}
        <div className="mb-8 pt-2">
          <h1 className="text-[28px] font-bold text-[#222222] tracking-tight">List Your Property</h1>
          <p className="text-sm text-[#6a6a6a] mt-1">Fill in the details to showcase your property to seekers across Kenya.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done   ? 'bg-[#ff385c] text-white' :
                      active ? 'bg-[#222222] text-white' :
                               'bg-[#f2f2f2] text-[#6a6a6a]'}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${active ? 'text-[#222222]' : 'text-[#6a6a6a]'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${step > n ? 'bg-[#ff385c]' : 'bg-[#e5e5e5]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-[20px] border border-[#e5e5e5] shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.10)_0px_4px_8px] p-6 md:p-8">

            {/* ── STEP 1: Basic Info ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Basic Information</h2>
                  <p className="text-sm text-[#6a6a6a]">Tell us about your property type and features.</p>
                </div>
                <hr className="border-[#f2f2f2]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>Listing Category</Label>
                    <select value={core.listing_category}
                      onChange={e => setCore(p => ({ ...p, listing_category: e.target.value as any }))}
                      className={selectCls}>
                      <option value="long_term_rent">Long-Term Rent</option>
                      <option value="for_sale">For Sale</option>
                      <option value="short_term_rent">Short-Term / Airbnb</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <Label required>Property Type</Label>
                    <select value={core.listing_type}
                      onChange={e => setCore(p => ({ ...p, listing_type: e.target.value as any }))}
                      className={selectCls}>
                      <option value="apartment">Apartment</option>
                      <option value="house">House / Bungalow</option>
                      <option value="bedsitter">Bedsitter</option>
                      <option value="studio">Studio</option>
                      <option value="maisonette">Maisonette</option>
                      <option value="villa">Villa</option>
                      <option value="plot">Plot / Land</option>
                      <option value="off_plan">Off-Plan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label required>Property Title</Label>
                  <input value={core.title} onChange={e => setCore(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Spacious 3BR Apartment in Westlands" className={inputCls} maxLength={200} />
                  <p className="text-[11px] text-[#6a6a6a] mt-1">{core.title.length}/200 characters</p>
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea value={core.description} onChange={e => setCore(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your property — location highlights, unique features, nearby amenities…"
                    rows={4} className={inputCls + ' resize-none'} maxLength={2000} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <Label>Bedrooms</Label>
                    <input type="number" min="0" max="50" value={core.bedrooms}
                      onChange={e => setCore(p => ({ ...p, bedrooms: e.target.value }))}
                      placeholder="e.g. 3" className={inputCls} />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <input type="number" min="0" max="50" step="0.5" value={core.bathrooms}
                      onChange={e => setCore(p => ({ ...p, bathrooms: e.target.value }))}
                      placeholder="e.g. 2" className={inputCls} />
                  </div>
                  <div>
                    <Label>Size (sqm)</Label>
                    <input type="number" min="0" value={core.floor_area_sqm}
                      onChange={e => setCore(p => ({ ...p, floor_area_sqm: e.target.value }))}
                      placeholder="e.g. 85" className={inputCls} />
                  </div>
                  <div>
                    <Label>Year Built</Label>
                    <input type="number" min="1900" max={new Date().getFullYear() + 5} value={core.year_built}
                      onChange={e => setCore(p => ({ ...p, year_built: e.target.value }))}
                      placeholder="e.g. 2019" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Parking Spaces</Label>
                    <input type="number" min="0" value={core.parking_spaces}
                      onChange={e => setCore(p => ({ ...p, parking_spaces: e.target.value }))}
                      className={inputCls} />
                  </div>
                  <div>
                    <Label required>Furnishing</Label>
                    <select value={core.is_furnished}
                      onChange={e => setCore(p => ({ ...p, is_furnished: e.target.value as any }))}
                      className={selectCls}>
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi_furnished">Semi-Furnished</option>
                      <option value="fully_furnished">Fully Furnished</option>
                    </select>
                  </div>
                  <div>
                    <Label>Construction Status</Label>
                    <select value={core.construction_status}
                      onChange={e => setCore(p => ({ ...p, construction_status: e.target.value as any }))}
                      className={selectCls}>
                      <option value="completed">Completed</option>
                      <option value="under_construction">Under Construction</option>
                      <option value="off_plan">Off-Plan</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'En-suite bathrooms',   key: 'is_ensuite',        val: core.is_ensuite },
                    { label: 'Gated compound',        key: 'compound_is_gated', val: core.compound_is_gated },
                  ].map(({ label, key, val }) => (
                    <label key={key} className="flex items-center justify-between p-3.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7] transition">
                      <span className="text-sm font-medium text-[#222222]">{label}</span>
                      <input type="checkbox" checked={val}
                        onChange={e => setCore(p => ({ ...p, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#ff385c] rounded" />
                    </label>
                  ))}
                </div>

                {/* Utilities */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Water Supply</Label>
                    <select value={core.water_supply}
                      onChange={e => setCore(p => ({ ...p, water_supply: e.target.value as any }))}
                      className={selectCls}>
                      <option value="nairobi_water">Nairobi Water</option>
                      <option value="borehole">Borehole</option>
                      <option value="both">Both</option>
                      <option value="tank_only">Tank Only</option>
                    </select>
                  </div>
                  <div>
                    <Label>Electricity</Label>
                    <select value={core.electricity_supply}
                      onChange={e => setCore(p => ({ ...p, electricity_supply: e.target.value as any }))}
                      className={selectCls}>
                      <option value="kplc_prepaid">KPLC Prepaid Token</option>
                      <option value="kplc_postpaid">KPLC Postpaid</option>
                      <option value="solar">Solar</option>
                      <option value="generator">Generator</option>
                    </select>
                  </div>
                  <div>
                    <Label>Waste Management</Label>
                    <select value={core.waste_management}
                      onChange={e => setCore(p => ({ ...p, waste_management: e.target.value as any }))}
                      className={selectCls}>
                      <option value="ncc_collection">County Collection</option>
                      <option value="private">Private Company</option>
                      <option value="septic_tank">Septic Tank</option>
                    </select>
                  </div>
                </div>

                {/* Security types */}
                <div>
                  <Label>Security Features</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SECURITY_TYPES.map(t => (
                      <button key={t} type="button"
                        onClick={() => toggleSecurity(t)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition
                          ${core.security_type.includes(t)
                            ? 'bg-[#ff385c] text-white border-[#ff385c]'
                            : 'bg-white text-[#222222] border-[#c1c1c1] hover:border-[#ff385c]'
                          }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Location ───────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Location Details</h2>
                  <p className="text-sm text-[#6a6a6a]">Help seekers find your property on the map.</p>
                </div>
                <hr className="border-[#f2f2f2]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>County</Label>
                    <input value={location.county} onChange={e => setLocation(p => ({ ...p, county: e.target.value }))}
                      placeholder="e.g. Nairobi" className={inputCls} />
                  </div>
                  <div>
                    <Label>Sub-County</Label>
                    <input value={location.sub_county} onChange={e => setLocation(p => ({ ...p, sub_county: e.target.value }))}
                      placeholder="e.g. Westlands" className={inputCls} />
                  </div>
                  <div>
                    <Label>Area / Neighbourhood</Label>
                    <input value={location.area} onChange={e => setLocation(p => ({ ...p, area: e.target.value }))}
                      placeholder="e.g. Parklands" className={inputCls} />
                  </div>
                  <div>
                    <Label>Estate Name</Label>
                    <input value={location.estate_name} onChange={e => setLocation(p => ({ ...p, estate_name: e.target.value }))}
                      placeholder="e.g. Greenvale Estate" className={inputCls} />
                  </div>
                  <div>
                    <Label>Road / Street</Label>
                    <input value={location.road_street} onChange={e => setLocation(p => ({ ...p, road_street: e.target.value }))}
                      placeholder="e.g. Ring Road Westlands" className={inputCls} />
                  </div>
                  <div>
                    <Label>Nearest Landmark</Label>
                    <input value={location.nearest_landmark} onChange={e => setLocation(p => ({ ...p, nearest_landmark: e.target.value }))}
                      placeholder="e.g. Near Sarit Centre" className={inputCls} />
                  </div>
                </div>

                <div>
                  <Label>Directions</Label>
                  <textarea value={location.directions} onChange={e => setLocation(p => ({ ...p, directions: e.target.value }))}
                    placeholder="Turn-by-turn directions for visitors…" rows={3} className={inputCls + ' resize-none'} />
                </div>

                {/* Coordinates */}
                <div className="border border-[#e5e5e5] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#222222]">GPS Coordinates</p>
                      <p className="text-xs text-[#6a6a6a]">Required for map pin and distance calculations</p>
                    </div>
                    <button type="button" onClick={handleGetLocation} disabled={geoLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-[#ff385c] text-white rounded-lg text-sm font-semibold hover:bg-[#e00b41] transition disabled:opacity-50">
                      {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                      {geoLoading ? 'Detecting…' : 'Auto-Detect'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label required>Latitude</Label>
                      <input type="number" step="any" value={location.latitude}
                        onChange={e => setLocation(p => ({ ...p, latitude: e.target.value }))}
                        placeholder="-1.286389" className={inputCls} />
                    </div>
                    <div>
                      <Label required>Longitude</Label>
                      <input type="number" step="any" value={location.longitude}
                        onChange={e => setLocation(p => ({ ...p, longitude: e.target.value }))}
                        placeholder="36.817223" className={inputCls} />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={location.display_full_address}
                    onChange={e => setLocation(p => ({ ...p, display_full_address: e.target.checked }))}
                    className="w-4 h-4 accent-[#ff385c]" />
                  <span className="text-sm text-[#222222] font-medium">Show full address on public listing</span>
                </label>
              </div>
            )}

            {/* ── STEP 3: Pricing ────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Pricing</h2>
                  <p className="text-sm text-[#6a6a6a]">Set your pricing, deposit, and billing preferences.</p>
                </div>
                <hr className="border-[#f2f2f2]" />

                {(core.listing_category === 'long_term_rent' || core.listing_category === 'short_term_rent') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Monthly Rent (KES)</Label>
                      <input type="number" min="0" value={pricing.monthly_rent}
                        onChange={e => setPricing(p => ({ ...p, monthly_rent: e.target.value }))}
                        placeholder="e.g. 35000" className={inputCls} />
                    </div>
                    <div>
                      <Label>Rent Frequency</Label>
                      <select value={pricing.rent_frequency}
                        onChange={e => setPricing(p => ({ ...p, rent_frequency: e.target.value as any }))}
                        className={selectCls}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>
                )}

                {core.listing_category === 'for_sale' && (
                  <div>
                    <Label required>Asking Price (KES)</Label>
                    <input type="number" min="0" value={pricing.asking_price}
                      onChange={e => setPricing(p => ({ ...p, asking_price: e.target.value }))}
                      placeholder="e.g. 8500000" className={inputCls} />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Deposit (months)</Label>
                    <input type="number" min="0" max="24" value={pricing.deposit_months}
                      onChange={e => setPricing(p => ({ ...p, deposit_months: e.target.value }))}
                      placeholder="e.g. 2" className={inputCls} />
                  </div>
                  <div>
                    <Label>Deposit Amount (KES)</Label>
                    <input type="number" min="0" value={pricing.deposit_amount}
                      onChange={e => setPricing(p => ({ ...p, deposit_amount: e.target.value }))}
                      placeholder="e.g. 70000" className={inputCls} />
                  </div>
                  <div>
                    <Label>Service Charge (KES)</Label>
                    <input type="number" min="0" value={pricing.service_charge}
                      onChange={e => setPricing(p => ({ ...p, service_charge: e.target.value }))}
                      placeholder="e.g. 3000" className={inputCls} />
                  </div>
                  <div>
                    <Label>Caretaker Fee (KES)</Label>
                    <input type="number" min="0" value={pricing.caretaker_fee}
                      onChange={e => setPricing(p => ({ ...p, caretaker_fee: e.target.value }))}
                      placeholder="e.g. 500" className={inputCls} />
                  </div>
                  <div>
                    <Label>Garbage Fee (KES)</Label>
                    <input type="number" min="0" value={pricing.garbage_fee}
                      onChange={e => setPricing(p => ({ ...p, garbage_fee: e.target.value }))}
                      placeholder="e.g. 300" className={inputCls} />
                  </div>
                  <div>
                    <Label>Goodwill Fee (KES)</Label>
                    <input type="number" min="0" value={pricing.goodwill_fee}
                      onChange={e => setPricing(p => ({ ...p, goodwill_fee: e.target.value }))}
                      placeholder="e.g. 0" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Water Billing</Label>
                    <select value={pricing.water_bill_type}
                      onChange={e => setPricing(p => ({ ...p, water_bill_type: e.target.value as any }))}
                      className={selectCls}>
                      <option value="included">Included in rent</option>
                      <option value="metered">Metered (separate)</option>
                      <option value="shared_split">Shared / Split</option>
                    </select>
                  </div>
                  <div>
                    <Label>Electricity Billing</Label>
                    <select value={pricing.electricity_bill_type}
                      onChange={e => setPricing(p => ({ ...p, electricity_bill_type: e.target.value as any }))}
                      className={selectCls}>
                      <option value="prepaid_token">Prepaid Token (KPLC)</option>
                      <option value="included">Included in rent</option>
                      <option value="own_meter">Own meter</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={pricing.negotiable}
                    onChange={e => setPricing(p => ({ ...p, negotiable: e.target.checked }))}
                    className="w-4 h-4 accent-[#ff385c]" />
                  <span className="text-sm text-[#222222] font-medium">Price is negotiable</span>
                </label>
              </div>
            )}

            {/* ── STEP 4: Contacts & Amenities ───────────────────────────── */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Contact & Amenities</h2>
                  <p className="text-sm text-[#6a6a6a]">Who should seekers contact, and what does the property offer?</p>
                </div>
                <hr className="border-[#f2f2f2]" />

                {/* Contact */}
                <div className="border border-[#e5e5e5] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2"><User className="w-4 h-4 text-[#ff385c]" />Primary Contact</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Role</Label>
                      <select value={contact.role}
                        onChange={e => setContact(p => ({ ...p, role: e.target.value as any }))}
                        className={selectCls}>
                        <option value="landlord">Landlord</option>
                        <option value="caretaker">Caretaker</option>
                        <option value="agent">Agent</option>
                        <option value="developer">Developer</option>
                        <option value="property_manager">Property Manager</option>
                      </select>
                    </div>
                    <div>
                      <Label required>Full Name</Label>
                      <input value={contact.full_name}
                        onChange={e => setContact(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="e.g. James Kamau" className={inputCls} />
                    </div>
                    <div>
                      <Label required>Primary Phone</Label>
                      <input type="tel" value={contact.phone_primary}
                        onChange={e => setContact(p => ({ ...p, phone_primary: e.target.value }))}
                        placeholder="+254 712 345 678" className={inputCls} />
                    </div>
                    <div>
                      <Label>WhatsApp Number</Label>
                      <input type="tel" value={contact.whatsapp_number}
                        onChange={e => setContact(p => ({ ...p, whatsapp_number: e.target.value }))}
                        placeholder="+254 712 345 678" className={inputCls} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <input type="email" value={contact.email}
                        onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                        placeholder="contact@example.com" className={inputCls} />
                    </div>
                    <div>
                      <Label>Availability Hours</Label>
                      <input value={contact.availability_hours}
                        onChange={e => setContact(p => ({ ...p, availability_hours: e.target.value }))}
                        placeholder="e.g. Mon–Fri 8am–5pm" className={inputCls} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={contact.is_on_site}
                        onChange={e => setContact(p => ({ ...p, is_on_site: e.target.checked }))}
                        className="w-4 h-4 accent-[#ff385c]" />
                      <span className="text-xs font-medium text-[#222222]">On-site contact</span>
                    </label>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <Label>Amenities</Label>
                  <p className="text-xs text-[#6a6a6a] mb-3">Select all that apply to your property</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITY_OPTIONS.map(({ name, icon: Icon }) => {
                      const selected = selectedAmenities.includes(name);
                      return (
                        <button key={name} type="button" onClick={() => toggleAmenity(name)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition
                            ${selected
                              ? 'bg-[#fff1f2] border-[#ff385c] text-[#ff385c]'
                              : 'bg-white border-[#e5e5e5] text-[#222222] hover:border-[#ff385c]'
                            }`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="leading-tight">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Management Model</Label>
                  <select value={core.management_model}
                    onChange={e => setCore(p => ({ ...p, management_model: e.target.value as any }))}
                    className={selectCls}>
                    <option value="owner_direct">Owner Direct</option>
                    <option value="agent_managed">Agent Managed</option>
                    <option value="caretaker_managed">Caretaker Managed</option>
                    <option value="developer_held">Developer Held</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── STEP 5: Photos ─────────────────────────────────────────── */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Property Photos</h2>
                  <p className="text-sm text-[#6a6a6a]">Add high-quality photos — the first photo becomes your cover image.</p>
                </div>
                <hr className="border-[#f2f2f2]" />

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-[#c1c1c1] rounded-xl p-10 text-center cursor-pointer hover:border-[#ff385c] hover:bg-[#fff8f9] transition-all">
                  <ImageIcon className="w-10 h-10 text-[#c1c1c1] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#222222]">Drop photos here or <span className="text-[#ff385c]">browse</span></p>
                  <p className="text-xs text-[#6a6a6a] mt-1">JPG, PNG, WEBP — max 10MB each</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => { if (e.target.files) processFiles(e.target.files); }} />
                </div>

                {/* Preview grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#e5e5e5] group">
                        <img src={img.previewUrl} className="w-full h-full object-cover" alt="" />
                        {i === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#ff385c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">COVER</span>
                        )}
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3 text-[#222222]" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-[#e5e5e5] flex flex-col items-center justify-center gap-1 hover:border-[#ff385c] hover:bg-[#fff8f9] transition cursor-pointer">
                      <Plus className="w-5 h-5 text-[#6a6a6a]" />
                      <span className="text-[10px] font-semibold text-[#6a6a6a]">Add more</span>
                    </button>
                  </div>
                )}

                <p className="text-xs text-[#6a6a6a]">{images.length} photo{images.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}

          </div>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-6">
            <button type="button" onClick={prevStep} disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#c1c1c1] text-sm font-semibold text-[#222222] hover:bg-[#f2f2f2] transition disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 5 ? (
              <button type="button" onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#222222] text-white text-sm font-semibold hover:bg-[#3f3f3f] transition">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={isCreating}
                className="flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#ff385c] text-white text-sm font-bold hover:bg-[#e00b41] transition disabled:opacity-50">
                {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><CheckCircle2 className="w-4 h-4" /> Publish Property</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddProperty;
