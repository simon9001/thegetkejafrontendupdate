import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home, DollarSign, MapPin, Image as ImageIcon,
  CheckCircle2, ChevronRight, ChevronLeft, Plus, X,
  LocateFixed, Loader2, Phone, Mail, User, Building2,
  Droplets, Zap, Trash2, Shield, Car, Trees,
} from 'lucide-react';
import { useCreatePropertyMutation } from '../../../features/Api/PropertiesApi';
import { selectCurrentUser } from '../../../features/Slice/AuthSlice';
import { toast } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocalImage {
  previewUrl: string;
  file: File;
  dataUrl?: string; // base64 for submission
}

interface AddPropertyFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  className?: string;
}

// ─── Field helpers ────────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-[#ff385c] ml-0.5">*</span>}
  </label>
);

const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#c1c1c1] rounded-lg text-sm text-[#222222] placeholder:text-[#c1c1c1] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] transition";
const selectCls = inputCls;

const STEPS = ['Basic Info', 'Location', 'Pricing', 'Contacts & Amenities', 'Photos'];

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSuccess, redirectPath, className }) => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();

  const getReturnPath = (): string => {
    if (redirectPath) return redirectPath;
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
      if (onSuccess) onSuccess();
      navigate(getReturnPath());
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create property');
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className={`max-w-3xl mx-auto pb-12 px-2 ${className}`}>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2 scrollbar-hide">
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
                <div className={`flex-1 min-w-[30px] h-px mx-2 mb-5 transition-colors ${step > n ? 'bg-[#ff385c]' : 'bg-[#e5e5e5]'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-[20px] border border-[#e5e5e5] shadow-sm p-6 md:p-8">
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
                  <select value={core.listing_category} onChange={e => setCore(p => ({ ...p, listing_category: e.target.value as any }))} className={selectCls}>
                    <option value="long_term_rent">Long-Term Rent</option>
                    <option value="for_sale">For Sale</option>
                    <option value="short_term_rent">Short-Term / Airbnb</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <Label required>Property Type</Label>
                  <select value={core.listing_type} onChange={e => setCore(p => ({ ...p, listing_type: e.target.value as any }))} className={selectCls}>
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
                <input value={core.title} onChange={e => setCore(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Spacious 3BR Apartment in Westlands" className={inputCls} maxLength={200} />
              </div>
              <div>
                <Label>Description</Label>
                <textarea value={core.description} onChange={e => setCore(p => ({ ...p, description: e.target.value }))} rows={4} className={inputCls + ' resize-none'} maxLength={2000} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><Label>Bedrooms</Label><input type="number" value={core.bedrooms} onChange={e => setCore(p => ({ ...p, bedrooms: e.target.value }))} className={inputCls} /></div>
                <div><Label>Bathrooms</Label><input type="number" step="0.5" value={core.bathrooms} onChange={e => setCore(p => ({ ...p, bathrooms: e.target.value }))} className={inputCls} /></div>
                <div><Label>Size (sqm)</Label><input type="number" value={core.floor_area_sqm} onChange={e => setCore(p => ({ ...p, floor_area_sqm: e.target.value }))} className={inputCls} /></div>
                <div><Label>Year Built</Label><input type="number" value={core.year_built} onChange={e => setCore(p => ({ ...p, year_built: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                  <span className="text-sm font-medium">En-suite</span>
                  <input type="checkbox" checked={core.is_ensuite} onChange={e => setCore(p => ({ ...p, is_ensuite: e.target.checked }))} className="w-4 h-4 accent-[#ff385c]" />
                </label>
                <label className="flex items-center justify-between p-3.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                  <span className="text-sm font-medium">Gated</span>
                  <input type="checkbox" checked={core.compound_is_gated} onChange={e => setCore(p => ({ ...p, compound_is_gated: e.target.checked }))} className="w-4 h-4 accent-[#ff385c]" />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Location Details</h2>
                <p className="text-sm text-[#6a6a6a]">Help seekers find your property on the map.</p>
              </div>
              <hr className="border-[#f2f2f2]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required>County</Label><input value={location.county} onChange={e => setLocation(p => ({ ...p, county: e.target.value }))} className={inputCls} /></div>
                <div><Label>Sub-County</Label><input value={location.sub_county} onChange={e => setLocation(p => ({ ...p, sub_county: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="border border-[#e5e5e5] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">GPS Coordinates</span>
                  <button type="button" onClick={handleGetLocation} disabled={geoLoading} className="flex items-center gap-2 px-4 py-2 bg-[#ff385c] text-white rounded-lg text-xs font-semibold">
                    {geoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />} Detect
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="any" value={location.latitude} onChange={e => setLocation(p => ({ ...p, latitude: e.target.value }))} placeholder="Lat" className={inputCls} />
                  <input type="number" step="any" value={location.longitude} onChange={e => setLocation(p => ({ ...p, longitude: e.target.value }))} placeholder="Lng" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-[22px] font-bold">Pricing</h2>
              <hr className="border-[#f2f2f2]" />
              {core.listing_category.includes('rent') ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label required>Monthly Rent (KES)</Label><input type="number" value={pricing.monthly_rent} onChange={e => setPricing(p => ({ ...p, monthly_rent: e.target.value }))} className={inputCls} /></div>
                  <div><Label>Rent Frequency</Label><select value={pricing.rent_frequency} onChange={e => setPricing(p => ({ ...p, rent_frequency: e.target.value as any }))} className={selectCls}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></div>
                </div>
              ) : (
                <div><Label required>Asking Price (KES)</Label><input type="number" value={pricing.asking_price} onChange={e => setPricing(p => ({ ...p, asking_price: e.target.value }))} className={inputCls} /></div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-[22px] font-bold">Contact & Amenities</h2>
              <hr className="border-[#f2f2f2]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required>Full Name</Label><input value={contact.full_name} onChange={e => setContact(p => ({ ...p, full_name: e.target.value }))} className={inputCls} /></div>
                <div><Label required>Primary Phone</Label><input value={contact.phone_primary} onChange={e => setContact(p => ({ ...p, phone_primary: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map(({ name, icon: Icon }) => (
                  <button key={name} type="button" onClick={() => toggleAmenity(name)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition ${selectedAmenities.includes(name) ? 'bg-[#ff385c] text-white' : 'bg-white text-[#222222]'}`}>
                    <Icon className="w-3 h-3" /> {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-[22px] font-bold">Photos</h2>
              <hr className="border-[#f2f2f2]" />
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#c1c1c1] rounded-xl p-10 text-center cursor-pointer hover:border-[#ff385c]">
                <ImageIcon className="w-10 h-10 text-[#c1c1c1] mx-auto mb-2" />
                <p className="text-sm font-bold">Add Property Photos</p>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files) processFiles(e.target.files); }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={img.previewUrl} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={prevStep} disabled={step === 1} className="px-5 py-2.5 rounded-xl border border-[#c1c1c1] text-sm font-bold disabled:opacity-30">Back</button>
          {step < 5 ? (
            <button type="button" onClick={nextStep} className="px-6 py-2.5 rounded-xl bg-[#222222] text-white text-sm font-bold">Next</button>
          ) : (
            <button type="submit" disabled={isCreating} className="px-8 py-2.5 rounded-xl bg-[#ff385c] text-white text-sm font-bold">
              {isCreating ? 'Publishing…' : 'Publish Property'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddPropertyForm;
