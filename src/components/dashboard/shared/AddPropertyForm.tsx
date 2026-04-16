import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home, MapPin, Image as ImageIcon, CheckCircle2, ChevronRight, ChevronLeft,
  X, LocateFixed, Loader2, Building2, Droplets, Zap, Shield, Car, Trees,
  Clock, Users, Star, Calendar, Navigation2, Plus, Trash2, School, Hospital,
  ShoppingCart, Fuel, Church, TreePine, Dumbbell,
} from 'lucide-react';
import NearbyPlaceMapPicker from '../../Search/NearbyPlaceMapPicker';
import { useCreatePropertyMutation } from '../../../features/Api/PropertiesApi';
import { selectCurrentUser } from '../../../features/Slice/AuthSlice';
import { toast } from 'react-hot-toast';

interface LocalImage { previewUrl: string; file: File; dataUrl?: string; }
interface AddPropertyFormProps { onSuccess?: () => void; redirectPath?: string; className?: string; }
interface NearbyPlaceEntry {
  place_type: string; name: string;
  latitude: string; longitude: string;
  google_maps_url: string; school_type: string; matatu_stage_name: string;
}

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-1.5">
    {children}{required && <span className="text-[#ff385c] ml-0.5">*</span>}
  </label>
);
const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#c1c1c1] rounded-lg text-sm text-[#222222] placeholder:text-[#c1c1c1] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c] transition";
const selectCls = inputCls;
const PHONE_RE = /^\+?[\d\s\-()\[\]]{7,15}$/

const LISTING_TYPES: Record<string, { value: string; label: string }[]> = {
  for_sale:       [{ value:'apartment',label:'Apartment'},{ value:'house',label:'House / Bungalow'},{ value:'maisonette',label:'Maisonette'},{ value:'villa',label:'Villa'},{ value:'studio',label:'Studio'},{ value:'bedsitter',label:'Bedsitter'},{ value:'plot',label:'Plot / Land'},{ value:'off_plan',label:'Off-Plan'}],
  long_term_rent: [{ value:'apartment',label:'Apartment'},{ value:'house',label:'House / Bungalow'},{ value:'bedsitter',label:'Bedsitter'},{ value:'studio',label:'Studio'},{ value:'maisonette',label:'Maisonette'},{ value:'villa',label:'Villa'}],
  short_term_rent:[{ value:'apartment',label:'Apartment'},{ value:'house',label:'House / Bungalow'},{ value:'villa',label:'Villa'},{ value:'studio',label:'Studio'},{ value:'bedsitter',label:'Bedsitter'},{ value:'maisonette',label:'Maisonette'}],
  commercial:     [{ value:'apartment',label:'Apartment Block'},{ value:'house',label:'Commercial Building'},{ value:'studio',label:'Studio / Open Plan'},{ value:'villa',label:'Villa / Compound'}],
};

const STEPS = ['Basic Info', 'Location', 'Pricing', 'Contacts', 'Details', 'Nearby Places', 'Photos'];

const PLACE_TYPES = [
  { value: 'school',        label: 'School',        icon: School },
  { value: 'hospital',      label: 'Hospital',      icon: Hospital },
  { value: 'clinic',        label: 'Clinic',        icon: Hospital },
  { value: 'supermarket',   label: 'Supermarket',   icon: ShoppingCart },
  { value: 'mall',          label: 'Mall',          icon: ShoppingCart },
  { value: 'matatu_stage',  label: 'Matatu Stage',  icon: Navigation2 },
  { value: 'petrol_station',label: 'Petrol Station',icon: Fuel },
  { value: 'church',        label: 'Church',        icon: Church },
  { value: 'mosque',        label: 'Mosque',        icon: Church },
  { value: 'police',        label: 'Police',        icon: Shield },
  { value: 'park',          label: 'Park',          icon: TreePine },
  { value: 'gym',           label: 'Gym',           icon: Dumbbell },
] as const;

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSuccess, redirectPath, className }) => {
  const navigate    = useNavigate();
  const user        = useSelector(selectCurrentUser);
  const fileRef     = useRef<HTMLInputElement>(null);
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [step, setStep]           = useState(1);
  const [geoLoading, setGeoLoad]  = useState(false);
  const [images, setImages]       = useState<LocalImage[]>([]);
  const [newRule, setNewRule]     = useState('');

  const getReturnPath = () => {
    if (redirectPath) return redirectPath;
    // Use hash/state to open the properties tab directly so user can see their new listing
    const r = user?.roles ?? [];
    if (r.includes('developer')) return '/dashboard/developer?tab=projects';
    if (r.includes('agent'))     return '/dashboard/agent?tab=listings';
    if (r.includes('landlord'))  return '/dashboard/landlord?tab=properties';
    return '/dashboard';
  };

  // ── Core ────────────────────────────────────────────────────────────────
  const [core, setCore] = useState({
    listing_category:    'long_term_rent' as 'for_sale'|'long_term_rent'|'short_term_rent'|'commercial',
    listing_type:        'apartment',
    management_model:    'owner_direct' as 'owner_direct'|'agent_managed'|'caretaker_managed'|'developer_held',
    title:               '',
    description:         '',
    construction_status: 'completed' as 'completed'|'off_plan'|'under_construction',
    year_built:          '',
    floor_area_sqm:      '',
    plot_area_sqft:      '',
    bedrooms:            '',
    bathrooms:           '',
    is_ensuite:          false,
    parking_spaces:      '0',
    compound_is_gated:   false,
    water_supply:        'nairobi_water' as 'nairobi_water'|'borehole'|'both'|'tank_only',
    electricity_supply:  'kplc_prepaid'  as 'kplc_prepaid'|'kplc_postpaid'|'solar'|'generator',
    waste_management:    'ncc_collection' as 'ncc_collection'|'private'|'septic_tank',
    is_furnished:        'unfurnished'   as 'unfurnished'|'semi_furnished'|'fully_furnished',
    security_type:       [] as string[],
  });

  const handleCategoryChange = (cat: typeof core.listing_category) => {
    const first = LISTING_TYPES[cat]?.[0]?.value ?? 'apartment';
    setCore(p => ({ ...p, listing_category: cat, listing_type: first }));
  };

  // ── Location ────────────────────────────────────────────────────────────
  const [loc, setLoc] = useState({
    county:'', sub_county:'', area:'', estate_name:'', road_street:'',
    plot_number:'', nearest_landmark:'', directions:'', latitude:'', longitude:'',
    display_full_address: true,
  });

  // ── Pricing ─────────────────────────────────────────────────────────────
  const [pricing, setPricing] = useState({
    monthly_rent:'', asking_price:'', deposit_months:'', deposit_amount:'',
    service_charge:'', caretaker_fee:'', garbage_fee:'', goodwill_fee:'',
    agent_commission_pct:'',
    water_bill_type:       'metered'       as 'included'|'metered'|'shared_split',
    electricity_bill_type: 'prepaid_token' as 'included'|'prepaid_token'|'own_meter',
    negotiable: false,
    rent_frequency: 'monthly' as 'monthly'|'quarterly'|'annually',
  });

  // ── Short-stay config ────────────────────────────────────────────────────
  const [ss, setSs] = useState({
    short_term_type:    'airbnb_bnb' as 'airbnb_bnb'|'party_home'|'holiday_home'|'serviced_apartment',
    price_per_night:    '', price_per_weekend:'', price_per_event:'',
    min_nights:'1', max_nights:'', max_guests:'2', max_event_capacity:'',
    check_in_time:'14:00', check_out_time:'10:00', noise_curfew_time:'',
    instant_book:false, cleaning_fee:'', damage_deposit:'',
    airbnb_listing_url:'', catering_available:false, rules:[] as string[],
  });

  // ── Commercial config ────────────────────────────────────────────────────
  const [comm, setComm] = useState({
    commercial_type: 'office' as 'event_space'|'store'|'godown'|'office'|'showroom'|'restaurant_shell'|'kiosk',
    floor_area_sqft:'', ceiling_height_m:'',
    loading_bay:false, drive_in_access:false, three_phase_power:false,
    event_capacity_seated:'', event_capacity_standing:'',
    has_catering_kitchen:false, has_pa_system:false, has_projector_screen:false,
    outdoor_space_sqm:'', zoning_classification:'', alcohol_license_possible:false,
  });

  // ── Plot details ─────────────────────────────────────────────────────────
  const [plot, setPlot] = useState({
    size_acres:'', size_sqft:'', road_frontage_m:'',
    is_corner_plot:false,
    terrain:'' as ''|'flat'|'sloped'|'ridge'|'valleyside',
    soil_type:'', is_serviced:false,
    zoning_use:'' as ''|'residential'|'commercial'|'agricultural'|'mixed',
    payment_plan_available:false, installment_months:'',
  });

  // ── Off-plan details ─────────────────────────────────────────────────────
  const [op, setOp] = useState({
    project_name:'', developer_name:'', completion_quarter:'',
    construction_pct:'0', total_units_in_project:'', escrow_bank:'', nca_reg_number:'',
  });

  // ── Contact ──────────────────────────────────────────────────────────────
  const [contact, setContact] = useState({
    role:'landlord' as 'landlord'|'caretaker'|'agent'|'developer'|'property_manager',
    full_name:'', display_name:'', phone_primary:'', phone_secondary:'',
    whatsapp_number:'', email:'', is_primary_contact:true, is_on_site:false,
    availability_hours:'', agent_license_no:'',
  });

  // ── Nearby Places ────────────────────────────────────────────────────────
  const emptyPlace = (): NearbyPlaceEntry => ({
    place_type: 'school', name: '', latitude: '', longitude: '',
    google_maps_url: '', school_type: '', matatu_stage_name: '',
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceEntry[]>([]);
  const [newPlace, setNewPlace]         = useState<NearbyPlaceEntry>(emptyPlace());
  const [placeError, setPlaceError]     = useState('');

  const addPlace = () => {
    if (!newPlace.name.trim())      { setPlaceError('Place name is required'); return; }
    if (!newPlace.latitude.trim() || !newPlace.longitude.trim()) {
      setPlaceError('Latitude and longitude are required. Right-click on Google Maps to copy coordinates.');
      return;
    }
    const lat = parseFloat(newPlace.latitude);
    const lng = parseFloat(newPlace.longitude);
    if (isNaN(lat) || isNaN(lng)) { setPlaceError('Invalid coordinates'); return; }
    setNearbyPlaces(p => [...p, { ...newPlace, latitude: String(lat), longitude: String(lng) }]);
    setNewPlace(emptyPlace());
    setPlaceError('');
  };
  const removePlace = (i: number) => setNearbyPlaces(p => p.filter((_, idx) => idx !== i));

  // ── Amenities ────────────────────────────────────────────────────────────
  const AMENITY_OPTIONS = [
    { category:'security',   name:'24/7 Security Guard', icon:Shield },
    { category:'security',   name:'CCTV Cameras',        icon:Shield },
    { category:'security',   name:'Electric Fence',      icon:Shield },
    { category:'recreation', name:'Swimming Pool',       icon:Droplets },
    { category:'recreation', name:'Gymnasium / Gym',     icon:Building2 },
    { category:'recreation', name:'Rooftop Terrace',     icon:Building2 },
    { category:'utilities',  name:'Backup Generator',    icon:Zap },
    { category:'utilities',  name:'Solar Panels',        icon:Zap },
    { category:'utilities',  name:'Borehole Water',      icon:Droplets },
    { category:'utilities',  name:'Fibre Internet',      icon:Zap },
    { category:'green',      name:'Garden / Landscaping',icon:Trees },
    { category:'transport',  name:'Parking Space',       icon:Car },
    { category:'transport',  name:'Covered Parking',     icon:Car },
    { category:'other',      name:'Lift / Elevator',     icon:Building2 },
    { category:'other',      name:'Servants Quarters',   icon:Home },
    { category:'other',      name:'Conference Room',     icon:Users },
  ] as const;

  const SECURITY_TYPES = ['Guard','CCTV','Electric Fence','Intercom','Access Control'];
  const [amenities, setAmenities] = useState<string[]>([]);
  const toggleAmenity = (n: string) => setAmenities(p => p.includes(n) ? p.filter(a=>a!==n) : [...p,n]);
  const toggleSecurity = (t: string) => setCore(p => ({ ...p, security_type: p.security_type.includes(t) ? p.security_type.filter(s=>s!==t) : [...p.security_type,t] }));
  const addRule = () => { if (newRule.trim()) { setSs(p=>({...p,rules:[...p.rules,newRule.trim()]})); setNewRule(''); }};
  const removeRule = (i:number) => setSs(p=>({...p,rules:p.rules.filter((_,idx)=>idx!==i)}));

  // ── Geo ──────────────────────────────────────────────────────────────────
  const handleGeo = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGeoLoad(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLoc(p=>({...p,latitude:coords.latitude.toFixed(7),longitude:coords.longitude.toFixed(7)})); toast.success('Location detected'); setGeoLoad(false); },
      (err) => { setGeoLoad(false); toast.error([,'Permission denied','Position unavailable','Timed out'][err.code]??'Failed'); },
      { enableHighAccuracy:true, timeout:10000, maximumAge:0 },
    );
  };

  // ── Images ───────────────────────────────────────────────────────────────
  const readB64 = (f:File):Promise<string> => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result as string); r.onerror=rej; r.readAsDataURL(f); });
  const processFiles = async (files:FileList|File[]) => {
    const valid = Array.from(files).filter(f => {
      if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type)) { toast.error(`${f.name}: unsupported`); return false; }
      if (f.size>10*1024*1024) { toast.error(`${f.name}: exceeds 10MB`); return false; }
      return true;
    });
    if (!valid.length) return;
    const imgs = await Promise.all(valid.map(async f=>({ file:f, previewUrl:URL.createObjectURL(f), dataUrl:await readB64(f) })));
    setImages(p=>[...p,...imgs]);
  };
  const removeImg = (i:number) => setImages(p=>{ URL.revokeObjectURL(p[i].previewUrl); return p.filter((_,idx)=>idx!==i); });

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = (): string|null => {
    if (!core.title.trim() || core.title.length<5) return 'Title must be at least 5 characters';
    if (!loc.county.trim()) return 'County is required';
    if (!loc.latitude || !loc.longitude) return 'GPS coordinates are required';
    if (core.listing_category==='long_term_rent' && !pricing.monthly_rent) return 'Monthly rent is required';
    if (core.listing_category==='for_sale' && !pricing.asking_price) return 'Asking price is required';
    if (core.listing_category==='short_term_rent' && !ss.price_per_night) return 'Price per night is required';
    if (core.listing_category==='commercial' && !pricing.monthly_rent && !pricing.asking_price) return 'At least one price (rent or sale) is required';
    if (!contact.full_name.trim()) return 'Contact full name is required';
    if (!contact.phone_primary.trim()) return 'Contact phone is required';
    if (!PHONE_RE.test(contact.phone_primary)) return 'Invalid phone — use e.g. +254712345678';
    if (contact.phone_secondary && !PHONE_RE.test(contact.phone_secondary)) return 'Invalid secondary phone format';
    if (contact.whatsapp_number && !PHONE_RE.test(contact.whatsapp_number)) return 'Invalid WhatsApp number format';
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return 'Invalid email address';
    if (core.listing_type==='off_plan' && !op.project_name.trim()) return 'Project name is required for off-plan';
    if (images.length===0) return 'Please add at least one photo';
    return null;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    const amenityPayload = amenities.map(name => {
      const opt = AMENITY_OPTIONS.find(a=>a.name===name);
      return { category: opt?.category ?? 'other', name, is_included:true };
    });
    const mediaPayload = images.map((img,i) => ({ media_type:'photo' as const, file:img.dataUrl!, sort_order:i, is_cover:i===0 }));

    const pricingPayload: Record<string,any> = {
      currency:'KES', water_bill_type:pricing.water_bill_type,
      electricity_bill_type:pricing.electricity_bill_type,
      negotiable:pricing.negotiable, rent_frequency:pricing.rent_frequency,
    };
    if (pricing.monthly_rent)         pricingPayload.monthly_rent         = Number(pricing.monthly_rent);
    if (pricing.asking_price)         pricingPayload.asking_price         = Number(pricing.asking_price);
    if (pricing.deposit_months)       pricingPayload.deposit_months       = Number(pricing.deposit_months);
    if (pricing.deposit_amount)       pricingPayload.deposit_amount       = Number(pricing.deposit_amount);
    if (pricing.service_charge)       pricingPayload.service_charge       = Number(pricing.service_charge);
    if (pricing.caretaker_fee)        pricingPayload.caretaker_fee        = Number(pricing.caretaker_fee);
    if (pricing.garbage_fee)          pricingPayload.garbage_fee          = Number(pricing.garbage_fee);
    if (pricing.goodwill_fee)         pricingPayload.goodwill_fee         = Number(pricing.goodwill_fee);
    if (pricing.agent_commission_pct) pricingPayload.agent_commission_pct = Number(pricing.agent_commission_pct);

    const locPayload: Record<string,any> = {
      county:loc.county, latitude:Number(loc.latitude), longitude:Number(loc.longitude),
      display_full_address:loc.display_full_address,
    };
    if (loc.sub_county)       locPayload.sub_county       = loc.sub_county;
    if (loc.area)             locPayload.area             = loc.area;
    if (loc.estate_name)      locPayload.estate_name      = loc.estate_name;
    if (loc.road_street)      locPayload.road_street      = loc.road_street;
    if (loc.plot_number)      locPayload.plot_number      = loc.plot_number;
    if (loc.nearest_landmark) locPayload.nearest_landmark = loc.nearest_landmark;
    if (loc.directions)       locPayload.directions       = loc.directions;

    const corePayload: Record<string,any> = {
      listing_category:core.listing_category, listing_type:core.listing_type,
      management_model:core.management_model, title:core.title.trim(),
      construction_status:core.construction_status, is_ensuite:core.is_ensuite,
      parking_spaces:Number(core.parking_spaces)||0, compound_is_gated:core.compound_is_gated,
      is_furnished:core.is_furnished, water_supply:core.water_supply,
      electricity_supply:core.electricity_supply, waste_management:core.waste_management,
    };
    if (core.description)    corePayload.description    = core.description.trim();
    if (core.year_built)     corePayload.year_built     = Number(core.year_built);
    if (core.floor_area_sqm) corePayload.floor_area_sqm = Number(core.floor_area_sqm);
    if (core.plot_area_sqft) corePayload.plot_area_sqft = Number(core.plot_area_sqft);
    if (core.bedrooms)       corePayload.bedrooms       = Number(core.bedrooms);
    if (core.bathrooms)      corePayload.bathrooms      = Number(core.bathrooms);
    if (core.security_type.length) corePayload.security_type = core.security_type;

    const contactPayload: Record<string,any> = {
      role:contact.role, full_name:contact.full_name.trim(),
      phone_primary:contact.phone_primary.trim(),
      is_primary_contact:contact.is_primary_contact, is_on_site:contact.is_on_site,
    };
    if (contact.display_name?.trim())       contactPayload.display_name       = contact.display_name.trim();
    if (contact.phone_secondary?.trim())    contactPayload.phone_secondary    = contact.phone_secondary.trim();
    if (contact.whatsapp_number?.trim())    contactPayload.whatsapp_number    = contact.whatsapp_number.trim();
    if (contact.email?.trim())              contactPayload.email              = contact.email.trim();
    if (contact.availability_hours?.trim()) contactPayload.availability_hours = contact.availability_hours.trim();
    if (contact.agent_license_no?.trim())   contactPayload.agent_license_no   = contact.agent_license_no.trim();

    const nearbyPayload = nearbyPlaces
      .filter(p => p.name.trim() && p.latitude && p.longitude)
      .map(p => {
        const entry: Record<string,any> = {
          place_type: p.place_type,
          name: p.name.trim(),
          latitude: parseFloat(p.latitude),
          longitude: parseFloat(p.longitude),
        };
        if (p.google_maps_url.trim()) entry.google_maps_url = p.google_maps_url.trim();
        if (p.school_type.trim())     entry.school_type     = p.school_type.trim();
        if (p.matatu_stage_name.trim()) entry.matatu_stage_name = p.matatu_stage_name.trim();
        return entry;
      });

    const body: Record<string,any> = {
      ...corePayload,
      location:locPayload, pricing:pricingPayload,
      contacts:[contactPayload], amenities:amenityPayload, media:mediaPayload,
      nearby_places: nearbyPayload,
    };

    if (core.listing_category==='short_term_rent') {
      const stc: Record<string,any> = {
        short_term_type:ss.short_term_type, price_per_night:Number(ss.price_per_night),
        min_nights:Number(ss.min_nights)||1, max_guests:Number(ss.max_guests)||2,
        check_in_time:ss.check_in_time, check_out_time:ss.check_out_time,
        instant_book:ss.instant_book, catering_available:ss.catering_available, rules:ss.rules,
      };
      if (ss.price_per_weekend)  stc.price_per_weekend   = Number(ss.price_per_weekend);
      if (ss.price_per_event)    stc.price_per_event     = Number(ss.price_per_event);
      if (ss.max_nights)         stc.max_nights          = Number(ss.max_nights);
      if (ss.max_event_capacity) stc.max_event_capacity  = Number(ss.max_event_capacity);
      if (ss.cleaning_fee)       stc.cleaning_fee        = Number(ss.cleaning_fee);
      if (ss.damage_deposit)     stc.damage_deposit      = Number(ss.damage_deposit);
      if (ss.noise_curfew_time)  stc.noise_curfew_time   = ss.noise_curfew_time;
      if (ss.airbnb_listing_url) stc.airbnb_listing_url  = ss.airbnb_listing_url;
      body.short_term_config = stc;
      // Backend pricingInputSchema requires at least one of asking_price | monthly_rent
      if (!body.pricing.monthly_rent && !body.pricing.asking_price)
        body.pricing.monthly_rent = Number(ss.price_per_night);
    }

    if (core.listing_category==='commercial') {
      const cc: Record<string,any> = {
        commercial_type:comm.commercial_type, loading_bay:comm.loading_bay,
        drive_in_access:comm.drive_in_access, three_phase_power:comm.three_phase_power,
        has_catering_kitchen:comm.has_catering_kitchen, has_pa_system:comm.has_pa_system,
        has_projector_screen:comm.has_projector_screen, alcohol_license_possible:comm.alcohol_license_possible,
      };
      if (comm.floor_area_sqft)         cc.floor_area_sqft         = Number(comm.floor_area_sqft);
      if (comm.ceiling_height_m)        cc.ceiling_height_m        = Number(comm.ceiling_height_m);
      if (comm.event_capacity_seated)   cc.event_capacity_seated   = Number(comm.event_capacity_seated);
      if (comm.event_capacity_standing) cc.event_capacity_standing = Number(comm.event_capacity_standing);
      if (comm.outdoor_space_sqm)       cc.outdoor_space_sqm       = Number(comm.outdoor_space_sqm);
      if (comm.zoning_classification)   cc.zoning_classification   = comm.zoning_classification;
      body.commercial_config = cc;
    }

    if (core.listing_type==='plot') {
      const pd: Record<string,any> = {
        is_corner_plot:plot.is_corner_plot, is_serviced:plot.is_serviced,
        payment_plan_available:plot.payment_plan_available,
      };
      if (plot.size_acres)         pd.size_acres         = Number(plot.size_acres);
      if (plot.size_sqft)          pd.size_sqft          = Number(plot.size_sqft);
      if (plot.road_frontage_m)    pd.road_frontage_m    = Number(plot.road_frontage_m);
      if (plot.terrain)            pd.terrain            = plot.terrain;
      if (plot.soil_type)          pd.soil_type          = plot.soil_type;
      if (plot.zoning_use)         pd.zoning_use         = plot.zoning_use;
      if (plot.installment_months) pd.installment_months = Number(plot.installment_months);
      body.plot_details = pd;
    }

    if (core.listing_type==='off_plan') {
      const opd: Record<string,any> = {
        project_name:op.project_name.trim(), construction_pct:Number(op.construction_pct)||0, units_sold:0,
      };
      if (op.developer_name)         opd.developer_name         = op.developer_name.trim();
      if (op.completion_quarter)     opd.completion_quarter     = op.completion_quarter;
      if (op.total_units_in_project) opd.total_units_in_project = Number(op.total_units_in_project);
      if (op.escrow_bank)            opd.escrow_bank            = op.escrow_bank.trim();
      if (op.nca_reg_number)         opd.nca_reg_number         = op.nca_reg_number.trim();
      body.offplan_details = opd;
    }

    try {
      await createProperty(body as any).unwrap();
      toast.success('Property submitted! It will go live after staff approval.');
      if (onSuccess) onSuccess();
      navigate(getReturnPath());
    } catch (err:any) {
      // RTK Query wraps the response as { status, data }
      // Zod validation failures from hono/zod-validator come as { success:false, error:{name,message,issues} }
      // Service failures come as { message: string, code: string }
      const raw = err?.data;
      const errMsg: string =
        (typeof raw?.message === 'string' ? raw.message : null) ??
        (typeof raw?.error === 'string'   ? raw.error   : null) ??
        (typeof raw?.error?.message === 'string' ? raw.error.message : null) ??
        (Array.isArray(raw?.error?.issues)
          ? raw.error.issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join(' | ')
          : null) ??
        'Failed to create property. Please check all required fields.';
      console.error('[AddPropertyForm] create error:', JSON.stringify(err?.data ?? err, null, 2));
      toast.error(errMsg);
    }
  };

  const nextStep = () => setStep(s=>Math.min(s+1,STEPS.length));
  const prevStep = () => setStep(s=>Math.max(s-1,1));

  const isCommercial = core.listing_category==='commercial';
  const isShortStay  = core.listing_category==='short_term_rent';
  const isForSale    = core.listing_category==='for_sale';
  const isLongRent   = core.listing_category==='long_term_rent';
  const isPlot       = core.listing_type==='plot';
  const isOffPlan    = core.listing_type==='off_plan';
  const isPartyHome  = ss.short_term_type==='party_home';
  const isEventSpace = comm.commercial_type==='event_space';
  const isRestaurant = comm.commercial_type==='restaurant_shell';
  const totalSteps   = STEPS.length; // 7

  return (
    <div className={`max-w-3xl mx-auto pb-12 px-2 ${className??''}`}>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((label,i) => {
          const n=i+1; const done=step>n; const active=step===n;
          return (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done?'bg-[#ff385c] text-white':active?'bg-[#222222] text-white':'bg-[#f2f2f2] text-[#6a6a6a]'}`}>
                  {done ? <CheckCircle2 className="w-4 h-4"/> : n}
                </div>
                <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${active?'text-[#222222]':'text-[#6a6a6a]'}`}>{label}</span>
              </div>
              {i<STEPS.length-1 && <div className={`flex-1 min-w-[16px] h-px mx-1.5 mb-5 ${step>n?'bg-[#ff385c]':'bg-[#e5e5e5]'}`}/>}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-[20px] border border-[#e5e5e5] shadow-sm p-6 md:p-8">

          {/* ── STEP 1: Basic Info ──────────────────────────────────────────── */}
          {step===1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Basic Information</h2>
                <p className="text-sm text-[#6a6a6a]">Tell us about your property type and features.</p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Listing Category</Label>
                  <select value={core.listing_category} onChange={e=>handleCategoryChange(e.target.value as any)} className={selectCls}>
                    <option value="long_term_rent">Long-Term Rent</option>
                    <option value="for_sale">For Sale</option>
                    <option value="short_term_rent">Short-Term / Airbnb</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <Label required>Property Type</Label>
                  <select value={core.listing_type} onChange={e=>setCore(p=>({...p,listing_type:e.target.value}))} className={selectCls}>
                    {(LISTING_TYPES[core.listing_category]??[]).map(t=>(
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Management Model</Label>
                  <select value={core.management_model} onChange={e=>setCore(p=>({...p,management_model:e.target.value as any}))} className={selectCls}>
                    <option value="owner_direct">Owner Direct</option>
                    <option value="agent_managed">Agent Managed</option>
                    <option value="caretaker_managed">Caretaker Managed</option>
                    <option value="developer_held">Developer Held</option>
                  </select>
                </div>
                <div>
                  <Label>Construction Status</Label>
                  <select value={core.construction_status} onChange={e=>setCore(p=>({...p,construction_status:e.target.value as any}))} className={selectCls}>
                    <option value="completed">Completed / Ready</option>
                    <option value="off_plan">Off-Plan</option>
                    <option value="under_construction">Under Construction</option>
                  </select>
                </div>
              </div>

              <div>
                <Label required>Property Title</Label>
                <input value={core.title} onChange={e=>setCore(p=>({...p,title:e.target.value}))} placeholder="e.g. Spacious 3BR Apartment in Westlands" className={inputCls} maxLength={200}/>
              </div>

              <div>
                <Label>Description</Label>
                <textarea value={core.description} onChange={e=>setCore(p=>({...p,description:e.target.value}))} rows={4} placeholder="Describe the property, its features, and surroundings…" className={`${inputCls} resize-none`} maxLength={2000}/>
              </div>

              {/* Bedrooms / bathrooms — hidden for commercial and plot */}
              {!isCommercial && !isPlot && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><Label>Bedrooms</Label><input type="number" min="0" max="50" value={core.bedrooms} onChange={e=>setCore(p=>({...p,bedrooms:e.target.value}))} className={inputCls}/></div>
                  <div><Label>Bathrooms</Label><input type="number" min="0" max="50" step="0.5" value={core.bathrooms} onChange={e=>setCore(p=>({...p,bathrooms:e.target.value}))} className={inputCls}/></div>
                  <div><Label>Floor Area (sqm)</Label><input type="number" min="0" value={core.floor_area_sqm} onChange={e=>setCore(p=>({...p,floor_area_sqm:e.target.value}))} className={inputCls}/></div>
                  <div><Label>Year Built</Label><input type="number" min="1900" max={new Date().getFullYear()+5} value={core.year_built} onChange={e=>setCore(p=>({...p,year_built:e.target.value}))} className={inputCls}/></div>
                </div>
              )}

              {/* Plot area — show for plots and for-sale */}
              {(isPlot || isForSale) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Plot Area (sqft)</Label><input type="number" min="0" value={core.plot_area_sqft} onChange={e=>setCore(p=>({...p,plot_area_sqft:e.target.value}))} placeholder="e.g. 5000" className={inputCls}/></div>
                  {!isPlot && <div><Label>Floor Area (sqm)</Label><input type="number" min="0" value={core.floor_area_sqm} onChange={e=>setCore(p=>({...p,floor_area_sqm:e.target.value}))} className={inputCls}/></div>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Parking Spaces</Label>
                  <input type="number" min="0" value={core.parking_spaces} onChange={e=>setCore(p=>({...p,parking_spaces:e.target.value}))} className={inputCls}/>
                </div>
                {!isCommercial && !isPlot && (
                  <div className="sm:col-span-2">
                    <Label>Furnished Status</Label>
                    <select value={core.is_furnished} onChange={e=>setCore(p=>({...p,is_furnished:e.target.value as any}))} className={selectCls}>
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi_furnished">Semi-Furnished</option>
                      <option value="fully_furnished">Fully Furnished</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {!isCommercial && !isPlot && (
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                    <input type="checkbox" checked={core.is_ensuite} onChange={e=>setCore(p=>({...p,is_ensuite:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                    <span className="text-sm font-medium">En-suite Bathrooms</span>
                  </label>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                  <input type="checkbox" checked={core.compound_is_gated} onChange={e=>setCore(p=>({...p,compound_is_gated:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                  <span className="text-sm font-medium">Gated Compound</span>
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 2: Location ────────────────────────────────────────────── */}
          {step===2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Location Details</h2>
                <p className="text-sm text-[#6a6a6a]">Help seekers find your property on the map.</p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required>County</Label><input value={loc.county} onChange={e=>setLoc(p=>({...p,county:e.target.value}))} placeholder="e.g. Nairobi" className={inputCls}/></div>
                <div><Label>Sub-County</Label><input value={loc.sub_county} onChange={e=>setLoc(p=>({...p,sub_county:e.target.value}))} placeholder="e.g. Westlands" className={inputCls}/></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Area / Neighbourhood</Label><input value={loc.area} onChange={e=>setLoc(p=>({...p,area:e.target.value}))} placeholder="e.g. Kilimani" className={inputCls}/></div>
                <div><Label>Estate Name</Label><input value={loc.estate_name} onChange={e=>setLoc(p=>({...p,estate_name:e.target.value}))} placeholder="e.g. Garden Estate" className={inputCls}/></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Road / Street</Label><input value={loc.road_street} onChange={e=>setLoc(p=>({...p,road_street:e.target.value}))} placeholder="e.g. Ngong Road" className={inputCls}/></div>
                <div><Label>Plot Number</Label><input value={loc.plot_number} onChange={e=>setLoc(p=>({...p,plot_number:e.target.value}))} placeholder="e.g. LR No. 123/456" className={inputCls}/></div>
              </div>

              <div><Label>Nearest Landmark</Label><input value={loc.nearest_landmark} onChange={e=>setLoc(p=>({...p,nearest_landmark:e.target.value}))} placeholder="e.g. Next to Westgate Mall" className={inputCls}/></div>

              <div><Label>Directions</Label><textarea value={loc.directions} onChange={e=>setLoc(p=>({...p,directions:e.target.value}))} rows={2} placeholder="e.g. Turn left at Shell, 2nd gate on the right" className={`${inputCls} resize-none`}/></div>

              <div className="border border-[#e5e5e5] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">GPS Coordinates</p>
                    <p className="text-xs text-[#6a6a6a] mt-0.5">Required for map display and radius search</p>
                  </div>
                  <button type="button" onClick={handleGeo} disabled={geoLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff385c] text-white rounded-lg text-xs font-semibold disabled:opacity-60">
                    {geoLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <LocateFixed className="w-3 h-3"/>} Detect
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label required>Latitude</Label><input type="number" step="any" value={loc.latitude} onChange={e=>setLoc(p=>({...p,latitude:e.target.value}))} placeholder="-1.2921" className={inputCls}/></div>
                  <div><Label required>Longitude</Label><input type="number" step="any" value={loc.longitude} onChange={e=>setLoc(p=>({...p,longitude:e.target.value}))} placeholder="36.8219" className={inputCls}/></div>
                </div>
              </div>

              <label className="flex items-center justify-between p-3.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                <div>
                  <span className="text-sm font-medium">Show Full Address Publicly</span>
                  <p className="text-xs text-[#6a6a6a] mt-0.5">Disable to show only area-level location to seekers</p>
                </div>
                <input type="checkbox" checked={loc.display_full_address} onChange={e=>setLoc(p=>({...p,display_full_address:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
              </label>
            </div>
          )}

          {/* ── STEP 3: Pricing ─────────────────────────────────────────────── */}
          {step===3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Pricing</h2>
                <p className="text-sm text-[#6a6a6a]">Set your price and payment terms.</p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              {isShortStay && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label required>Price per Night (KES)</Label><input type="number" min="0" value={ss.price_per_night} onChange={e=>setSs(p=>({...p,price_per_night:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Weekend Price (KES)</Label><input type="number" min="0" value={ss.price_per_weekend} onChange={e=>setSs(p=>({...p,price_per_weekend:e.target.value}))} placeholder="Optional" className={inputCls}/></div>
                  </div>
                  {isPartyHome && (
                    <div><Label>Event Flat Rate (KES)</Label><input type="number" min="0" value={ss.price_per_event} onChange={e=>setSs(p=>({...p,price_per_event:e.target.value}))} placeholder="Optional flat rate per event" className={inputCls}/></div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Cleaning Fee (KES)</Label><input type="number" min="0" value={ss.cleaning_fee} onChange={e=>setSs(p=>({...p,cleaning_fee:e.target.value}))} placeholder="e.g. 500" className={inputCls}/></div>
                    <div><Label>Security Deposit (KES)</Label><input type="number" min="0" value={ss.damage_deposit} onChange={e=>setSs(p=>({...p,damage_deposit:e.target.value}))} placeholder="Refundable" className={inputCls}/></div>
                  </div>
                </div>
              )}

              {isLongRent && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label required>Monthly Rent (KES)</Label><input type="number" min="0" value={pricing.monthly_rent} onChange={e=>setPricing(p=>({...p,monthly_rent:e.target.value}))} className={inputCls}/></div>
                    <div>
                      <Label>Rent Frequency</Label>
                      <select value={pricing.rent_frequency} onChange={e=>setPricing(p=>({...p,rent_frequency:e.target.value as any}))} className={selectCls}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Deposit (months)</Label><input type="number" min="0" value={pricing.deposit_months} onChange={e=>setPricing(p=>({...p,deposit_months:e.target.value}))} placeholder="e.g. 2" className={inputCls}/></div>
                    <div><Label>Deposit Amount (KES)</Label><input type="number" min="0" value={pricing.deposit_amount} onChange={e=>setPricing(p=>({...p,deposit_amount:e.target.value}))} placeholder="If different from rent × months" className={inputCls}/></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><Label>Service Charge</Label><input type="number" min="0" value={pricing.service_charge} onChange={e=>setPricing(p=>({...p,service_charge:e.target.value}))} placeholder="KES" className={inputCls}/></div>
                    <div><Label>Caretaker Fee</Label><input type="number" min="0" value={pricing.caretaker_fee} onChange={e=>setPricing(p=>({...p,caretaker_fee:e.target.value}))} placeholder="KES" className={inputCls}/></div>
                    <div><Label>Garbage Fee</Label><input type="number" min="0" value={pricing.garbage_fee} onChange={e=>setPricing(p=>({...p,garbage_fee:e.target.value}))} placeholder="KES" className={inputCls}/></div>
                    <div><Label>Goodwill Fee</Label><input type="number" min="0" value={pricing.goodwill_fee} onChange={e=>setPricing(p=>({...p,goodwill_fee:e.target.value}))} placeholder="KES" className={inputCls}/></div>
                  </div>
                </div>
              )}

              {isForSale && (
                <div className="space-y-4">
                  <div><Label required>Asking Price (KES)</Label><input type="number" min="0" value={pricing.asking_price} onChange={e=>setPricing(p=>({...p,asking_price:e.target.value}))} placeholder="e.g. 15000000" className={inputCls}/></div>
                  <div><Label>Agent Commission (%)</Label><input type="number" min="0" max="100" value={pricing.agent_commission_pct} onChange={e=>setPricing(p=>({...p,agent_commission_pct:e.target.value}))} placeholder="e.g. 3" className={inputCls}/></div>
                </div>
              )}

              {isCommercial && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Monthly Rent (KES)</Label><input type="number" min="0" value={pricing.monthly_rent} onChange={e=>setPricing(p=>({...p,monthly_rent:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Asking / Sale Price (KES)</Label><input type="number" min="0" value={pricing.asking_price} onChange={e=>setPricing(p=>({...p,asking_price:e.target.value}))} placeholder="For freehold / sale" className={inputCls}/></div>
                  </div>
                  <div><Label>Agent Commission (%)</Label><input type="number" min="0" max="100" value={pricing.agent_commission_pct} onChange={e=>setPricing(p=>({...p,agent_commission_pct:e.target.value}))} placeholder="e.g. 5" className={inputCls}/></div>
                </div>
              )}

              {!isShortStay && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label>Water Billing</Label>
                    <select value={pricing.water_bill_type} onChange={e=>setPricing(p=>({...p,water_bill_type:e.target.value as any}))} className={selectCls}>
                      <option value="metered">Metered (own meter)</option>
                      <option value="included">Included in rent</option>
                      <option value="shared_split">Shared / Split</option>
                    </select>
                  </div>
                  <div>
                    <Label>Electricity Billing</Label>
                    <select value={pricing.electricity_bill_type} onChange={e=>setPricing(p=>({...p,electricity_bill_type:e.target.value as any}))} className={selectCls}>
                      <option value="prepaid_token">Prepaid Token</option>
                      <option value="included">Included in rent</option>
                      <option value="own_meter">Own Meter (postpaid)</option>
                    </select>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 p-3.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                <input type="checkbox" checked={pricing.negotiable} onChange={e=>setPricing(p=>({...p,negotiable:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                <span className="text-sm font-medium">Price is Negotiable</span>
              </label>
            </div>
          )}

          {/* ── STEP 4: Contacts ────────────────────────────────────────────── */}
          {step===4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Contact Person</h2>
                <p className="text-sm text-[#6a6a6a]">Who should seekers contact about this property?</p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Contact Role</Label>
                  <select value={contact.role} onChange={e=>setContact(p=>({...p,role:e.target.value as any}))} className={selectCls}>
                    <option value="landlord">Landlord / Owner</option>
                    <option value="agent">Agent</option>
                    <option value="caretaker">Caretaker</option>
                    <option value="developer">Developer</option>
                    <option value="property_manager">Property Manager</option>
                  </select>
                </div>
                <div><Label required>Full Name</Label><input value={contact.full_name} onChange={e=>setContact(p=>({...p,full_name:e.target.value}))} placeholder="e.g. John Mwangi" className={inputCls}/></div>
              </div>

              <div><Label>Display Name (public alias)</Label><input value={contact.display_name} onChange={e=>setContact(p=>({...p,display_name:e.target.value}))} placeholder="e.g. JM Properties (optional)" className={inputCls}/></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label required>Primary Phone</Label><input type="tel" value={contact.phone_primary} onChange={e=>setContact(p=>({...p,phone_primary:e.target.value}))} placeholder="+254712345678" className={inputCls}/></div>
                <div><Label>Secondary Phone</Label><input type="tel" value={contact.phone_secondary} onChange={e=>setContact(p=>({...p,phone_secondary:e.target.value}))} placeholder="+254733456789" className={inputCls}/></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>WhatsApp Number</Label><input type="tel" value={contact.whatsapp_number} onChange={e=>setContact(p=>({...p,whatsapp_number:e.target.value}))} placeholder="+254712345678" className={inputCls}/></div>
                <div><Label>Email Address</Label><input type="email" value={contact.email} onChange={e=>setContact(p=>({...p,email:e.target.value}))} placeholder="john@example.com" className={inputCls}/></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Availability Hours</Label><input value={contact.availability_hours} onChange={e=>setContact(p=>({...p,availability_hours:e.target.value}))} placeholder="e.g. Mon–Fri 8AM–6PM" className={inputCls}/></div>
                {contact.role==='agent' && (
                  <div><Label>Agent License No.</Label><input value={contact.agent_license_no} onChange={e=>setContact(p=>({...p,agent_license_no:e.target.value}))} placeholder="EARB-XXXX" className={inputCls}/></div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                  <input type="checkbox" checked={contact.is_primary_contact} onChange={e=>setContact(p=>({...p,is_primary_contact:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                  <span className="text-sm font-medium">Primary Contact</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                  <input type="checkbox" checked={contact.is_on_site} onChange={e=>setContact(p=>({...p,is_on_site:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                  <span className="text-sm font-medium">On-Site Contact</span>
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 5: Details ──────────────────────────────────────────────── */}
          {step===5 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Property Details</h2>
                <p className="text-sm text-[#6a6a6a]">Utilities, amenities, and property-specific information.</p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              {/* Utilities */}
              <div>
                <h3 className="text-sm font-bold text-[#222222] mb-3 flex items-center gap-2"><Droplets className="w-4 h-4 text-[#ff385c]"/> Utilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Water Supply</Label>
                    <select value={core.water_supply} onChange={e=>setCore(p=>({...p,water_supply:e.target.value as any}))} className={selectCls}>
                      <option value="nairobi_water">Nairobi Water</option>
                      <option value="borehole">Borehole</option>
                      <option value="both">Nairobi + Borehole</option>
                      <option value="tank_only">Tank / Bowser Only</option>
                    </select>
                  </div>
                  <div>
                    <Label>Electricity</Label>
                    <select value={core.electricity_supply} onChange={e=>setCore(p=>({...p,electricity_supply:e.target.value as any}))} className={selectCls}>
                      <option value="kplc_prepaid">KPLC Prepaid</option>
                      <option value="kplc_postpaid">KPLC Postpaid</option>
                      <option value="solar">Solar</option>
                      <option value="generator">Generator</option>
                    </select>
                  </div>
                  <div>
                    <Label>Waste Management</Label>
                    <select value={core.waste_management} onChange={e=>setCore(p=>({...p,waste_management:e.target.value as any}))} className={selectCls}>
                      <option value="ncc_collection">NCC Collection</option>
                      <option value="private">Private Collection</option>
                      <option value="septic_tank">Septic Tank</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-sm font-bold text-[#222222] mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-[#ff385c]"/> Security Features</h3>
                <div className="flex flex-wrap gap-2">
                  {SECURITY_TYPES.map(t=>(
                    <button key={t} type="button" onClick={()=>toggleSecurity(t)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${core.security_type.includes(t)?'bg-[#ff385c] text-white border-[#ff385c]':'bg-white text-[#222222] border-[#e5e5e5]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-bold text-[#222222] mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[#ff385c]"/> Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map(({name,icon:Icon})=>(
                    <button key={name} type="button" onClick={()=>toggleAmenity(name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition ${amenities.includes(name)?'bg-[#ff385c] text-white border-[#ff385c]':'bg-white text-[#222222] border-[#e5e5e5]'}`}>
                      <Icon className="w-3 h-3"/> {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Short-stay settings ── */}
              {isShortStay && (
                <div className="space-y-5 pt-4 border-t border-[#f2f2f2]">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2"><Clock className="w-4 h-4 text-[#ff385c]"/> Short-Stay Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Stay Type</Label>
                      <select value={ss.short_term_type} onChange={e=>setSs(p=>({...p,short_term_type:e.target.value as any}))} className={selectCls}>
                        <option value="airbnb_bnb">Airbnb / B&B</option>
                        <option value="holiday_home">Holiday Home</option>
                        <option value="serviced_apartment">Serviced Apartment</option>
                        <option value="party_home">Party / Event Home</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Min Nights</Label><input type="number" min="1" value={ss.min_nights} onChange={e=>setSs(p=>({...p,min_nights:e.target.value}))} className={inputCls}/></div>
                      <div><Label>Max Nights</Label><input type="number" min="1" value={ss.max_nights} onChange={e=>setSs(p=>({...p,max_nights:e.target.value}))} placeholder="No limit" className={inputCls}/></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Max Guests</Label><input type="number" min="1" value={ss.max_guests} onChange={e=>setSs(p=>({...p,max_guests:e.target.value}))} className={inputCls}/></div>
                    {isPartyHome && <div><Label>Event Capacity</Label><input type="number" min="1" value={ss.max_event_capacity} onChange={e=>setSs(p=>({...p,max_event_capacity:e.target.value}))} placeholder="Max people" className={inputCls}/></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Check-in Time</Label><input type="time" value={ss.check_in_time} onChange={e=>setSs(p=>({...p,check_in_time:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Check-out Time</Label><input type="time" value={ss.check_out_time} onChange={e=>setSs(p=>({...p,check_out_time:e.target.value}))} className={inputCls}/></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Noise Curfew Time</Label><input type="time" value={ss.noise_curfew_time} onChange={e=>setSs(p=>({...p,noise_curfew_time:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Airbnb Listing URL</Label><input type="url" value={ss.airbnb_listing_url} onChange={e=>setSs(p=>({...p,airbnb_listing_url:e.target.value}))} placeholder="https://airbnb.com/rooms/…" className={inputCls}/></div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                      <input type="checkbox" checked={ss.instant_book} onChange={e=>setSs(p=>({...p,instant_book:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                      <span className="text-sm font-medium">Instant Book</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                      <input type="checkbox" checked={ss.catering_available} onChange={e=>setSs(p=>({...p,catering_available:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                      <span className="text-sm font-medium">Catering Available</span>
                    </label>
                  </div>
                  <div>
                    <Label>House Rules</Label>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newRule} onChange={e=>setNewRule(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addRule();}}} placeholder="e.g. No loud music after 10PM" className={inputCls}/>
                      <button type="button" onClick={addRule} className="px-4 bg-[#222222] text-white rounded-lg text-sm font-bold whitespace-nowrap">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ss.rules.map((rule,i)=>(
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#f7f7f7] border border-[#e5e5e5] rounded-full text-xs font-medium">
                          {rule}
                          <button type="button" onClick={()=>removeRule(i)} className="p-0.5 hover:bg-gray-200 rounded-full"><X className="w-3 h-3"/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Commercial config ── */}
              {isCommercial && (
                <div className="space-y-5 pt-4 border-t border-[#f2f2f2]">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2"><Building2 className="w-4 h-4 text-[#ff385c]"/> Commercial Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Commercial Type</Label>
                      <select value={comm.commercial_type} onChange={e=>setComm(p=>({...p,commercial_type:e.target.value as any}))} className={selectCls}>
                        <option value="office">Office</option>
                        <option value="store">Retail Store</option>
                        <option value="godown">Godown / Warehouse</option>
                        <option value="event_space">Event Space</option>
                        <option value="showroom">Showroom</option>
                        <option value="restaurant_shell">Restaurant Shell</option>
                        <option value="kiosk">Kiosk</option>
                      </select>
                    </div>
                    <div><Label>Floor Area (sqft)</Label><input type="number" min="0" value={comm.floor_area_sqft} onChange={e=>setComm(p=>({...p,floor_area_sqft:e.target.value}))} className={inputCls}/></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Ceiling Height (m)</Label><input type="number" min="0" step="0.1" value={comm.ceiling_height_m} onChange={e=>setComm(p=>({...p,ceiling_height_m:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Outdoor Space (sqm)</Label><input type="number" min="0" value={comm.outdoor_space_sqm} onChange={e=>setComm(p=>({...p,outdoor_space_sqm:e.target.value}))} className={inputCls}/></div>
                  </div>
                  {(isEventSpace||isRestaurant) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Seated Capacity</Label><input type="number" min="0" value={comm.event_capacity_seated} onChange={e=>setComm(p=>({...p,event_capacity_seated:e.target.value}))} className={inputCls}/></div>
                      <div><Label>Standing Capacity</Label><input type="number" min="0" value={comm.event_capacity_standing} onChange={e=>setComm(p=>({...p,event_capacity_standing:e.target.value}))} className={inputCls}/></div>
                    </div>
                  )}
                  <div><Label>Zoning Classification</Label><input value={comm.zoning_classification} onChange={e=>setComm(p=>({...p,zoning_classification:e.target.value}))} placeholder="e.g. Commercial Zone C1" className={inputCls}/></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([
                      ['loading_bay','Loading Bay'],
                      ['drive_in_access','Drive-In Access'],
                      ['three_phase_power','3-Phase Power'],
                      ['has_catering_kitchen','Catering Kitchen'],
                      ['has_pa_system','PA System'],
                      ['has_projector_screen','Projector / Screen'],
                      ['alcohol_license_possible','Alcohol License Possible'],
                    ] as [keyof typeof comm,string][]).map(([key,label])=>(
                      <label key={key} className="flex items-center gap-2 p-3 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                        <input type="checkbox" checked={comm[key] as boolean} onChange={e=>setComm(p=>({...p,[key]:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                        <span className="text-xs font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Plot details ── */}
              {isPlot && (
                <div className="space-y-5 pt-4 border-t border-[#f2f2f2]">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2"><MapPin className="w-4 h-4 text-[#ff385c]"/> Plot Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Size (Acres)</Label><input type="number" min="0" step="0.01" value={plot.size_acres} onChange={e=>setPlot(p=>({...p,size_acres:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Size (Sqft)</Label><input type="number" min="0" value={plot.size_sqft} onChange={e=>setPlot(p=>({...p,size_sqft:e.target.value}))} className={inputCls}/></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Road Frontage (m)</Label><input type="number" min="0" value={plot.road_frontage_m} onChange={e=>setPlot(p=>({...p,road_frontage_m:e.target.value}))} className={inputCls}/></div>
                    <div>
                      <Label>Terrain</Label>
                      <select value={plot.terrain} onChange={e=>setPlot(p=>({...p,terrain:e.target.value as any}))} className={selectCls}>
                        <option value="">-- Select --</option>
                        <option value="flat">Flat</option>
                        <option value="sloped">Sloped</option>
                        <option value="ridge">Ridge</option>
                        <option value="valleyside">Valley Side</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Soil Type</Label><input value={plot.soil_type} onChange={e=>setPlot(p=>({...p,soil_type:e.target.value}))} placeholder="e.g. Red loam" className={inputCls}/></div>
                    <div>
                      <Label>Zoning Use</Label>
                      <select value={plot.zoning_use} onChange={e=>setPlot(p=>({...p,zoning_use:e.target.value as any}))} className={selectCls}>
                        <option value="">-- Select --</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="agricultural">Agricultural</option>
                        <option value="mixed">Mixed Use</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {([['is_corner_plot','Corner Plot'],['is_serviced','Serviced (Roads/Water/Power)'],['payment_plan_available','Payment Plan Available']] as [keyof typeof plot,string][]).map(([key,label])=>(
                      <label key={key} className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e5e5] rounded-xl cursor-pointer hover:bg-[#f7f7f7]">
                        <input type="checkbox" checked={plot[key] as boolean} onChange={e=>setPlot(p=>({...p,[key]:e.target.checked}))} className="w-4 h-4 accent-[#ff385c]"/>
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                  {plot.payment_plan_available && (
                    <div><Label>Installment Period (months)</Label><input type="number" min="1" max="360" value={plot.installment_months} onChange={e=>setPlot(p=>({...p,installment_months:e.target.value}))} placeholder="e.g. 24" className={inputCls}/></div>
                  )}
                </div>
              )}

              {/* ── Off-plan details ── */}
              {isOffPlan && (
                <div className="space-y-5 pt-4 border-t border-[#f2f2f2]">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2"><Calendar className="w-4 h-4 text-[#ff385c]"/> Off-Plan Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label required>Project Name</Label><input value={op.project_name} onChange={e=>setOp(p=>({...p,project_name:e.target.value}))} placeholder="e.g. The Pinnacle Residences" className={inputCls}/></div>
                    <div><Label>Developer Name</Label><input value={op.developer_name} onChange={e=>setOp(p=>({...p,developer_name:e.target.value}))} placeholder="e.g. Optiven Ltd" className={inputCls}/></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Completion Quarter</Label><input value={op.completion_quarter} onChange={e=>setOp(p=>({...p,completion_quarter:e.target.value}))} placeholder="e.g. Q3 2026" className={inputCls}/></div>
                    <div><Label>Construction Progress (%)</Label><input type="number" min="0" max="100" value={op.construction_pct} onChange={e=>setOp(p=>({...p,construction_pct:e.target.value}))} className={inputCls}/></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Total Units in Project</Label><input type="number" min="1" value={op.total_units_in_project} onChange={e=>setOp(p=>({...p,total_units_in_project:e.target.value}))} className={inputCls}/></div>
                    <div><Label>Escrow Bank</Label><input value={op.escrow_bank} onChange={e=>setOp(p=>({...p,escrow_bank:e.target.value}))} placeholder="e.g. KCB Escrow" className={inputCls}/></div>
                  </div>
                  <div><Label>NCA Registration No.</Label><input value={op.nca_reg_number} onChange={e=>setOp(p=>({...p,nca_reg_number:e.target.value}))} placeholder="NCA-XXXXX" className={inputCls}/></div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 6: Nearby Places ────────────────────────────────────────── */}
          {step===6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Nearby Places</h2>
                <p className="text-sm text-[#6a6a6a]">Add schools, hospitals, matatu stages and other nearby amenities to help seekers understand the location. <span className="font-medium text-[#222222]">Optional — you can skip this step.</span></p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              {/* Add place form */}
              <div className="border border-[#e5e5e5] rounded-xl p-5 space-y-4 bg-[#fafafa]">
                <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2"><Plus className="w-4 h-4 text-[#ff385c]"/> Add a Nearby Place</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>Place Type</Label>
                    <select value={newPlace.place_type} onChange={e=>setNewPlace(p=>({...p,place_type:e.target.value}))} className={selectCls}>
                      {PLACE_TYPES.map(pt=>(
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label required>Place Name</Label>
                    <input value={newPlace.name} onChange={e=>setNewPlace(p=>({...p,name:e.target.value}))} placeholder="e.g. Embu University, Naivas Supermarket" className={inputCls}/>
                  </div>
                </div>
                {/* Map picker — search or click to set coordinates */}
                <NearbyPlaceMapPicker
                  lat={newPlace.latitude ? parseFloat(newPlace.latitude) : undefined}
                  lng={newPlace.longitude ? parseFloat(newPlace.longitude) : undefined}
                  defaultCenter={
                    loc.latitude && loc.longitude
                      ? [parseFloat(loc.latitude), parseFloat(loc.longitude)]
                      : [-1.2921, 36.8219]
                  }
                  onPick={(lat, lng, suggestedName) => {
                    setNewPlace(p => ({
                      ...p,
                      latitude:  String(lat),
                      longitude: String(lng),
                      // Only auto-fill name if it's currently empty
                      name: p.name.trim() ? p.name : (suggestedName ?? ''),
                    }));
                    setPlaceError('');
                  }}
                />
                <div><Label>Google Maps URL (optional)</Label><input type="url" value={newPlace.google_maps_url} onChange={e=>setNewPlace(p=>({...p,google_maps_url:e.target.value}))} placeholder="https://maps.google.com/…" className={inputCls}/></div>
                {newPlace.place_type==='school' && (
                  <div><Label>School Type (optional)</Label><input value={newPlace.school_type} onChange={e=>setNewPlace(p=>({...p,school_type:e.target.value}))} placeholder="e.g. Primary, Secondary, University" className={inputCls}/></div>
                )}
                {newPlace.place_type==='matatu_stage' && (
                  <div><Label>Stage Name (optional)</Label><input value={newPlace.matatu_stage_name} onChange={e=>setNewPlace(p=>({...p,matatu_stage_name:e.target.value}))} placeholder="e.g. Embu Stage" className={inputCls}/></div>
                )}
                {placeError && <p className="text-xs text-red-500 font-medium">{placeError}</p>}
                <button type="button" onClick={addPlace}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#ff385c] text-white rounded-xl text-sm font-bold hover:bg-[#e0334f] transition">
                  <Plus className="w-4 h-4"/> Add Place
                </button>
              </div>

              {/* Added places list */}
              {nearbyPlaces.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#222222]">Added Places ({nearbyPlaces.length})</h3>
                  {nearbyPlaces.map((place, i) => {
                    const pt = PLACE_TYPES.find(t=>t.value===place.place_type);
                    const Icon = pt?.icon ?? MapPin;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3.5 bg-white border border-[#e5e5e5] rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-[#ff385c]/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#ff385c]"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#222222] truncate">{place.name}</p>
                          <p className="text-[11px] text-[#6a6a6a]">{pt?.label ?? place.place_type} · {parseFloat(place.latitude).toFixed(4)}, {parseFloat(place.longitude).toFixed(4)}</p>
                        </div>
                        <button type="button" onClick={()=>removePlace(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-[#6a6a6a] hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {nearbyPlaces.length === 0 && (
                <div className="text-center py-6 text-[#c1c1c1]">
                  <Navigation2 className="w-8 h-8 mx-auto mb-2"/>
                  <p className="text-sm">No nearby places added yet.</p>
                  <p className="text-xs mt-1">Adding places like schools and hospitals helps your listing rank better in search.</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 7: Photos ───────────────────────────────────────────────── */}
          {step===7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#222222] tracking-tight mb-0.5">Photos</h2>
                <p className="text-sm text-[#6a6a6a]">Add clear, well-lit photos. First photo becomes the cover image.</p>
              </div>
              <hr className="border-[#f2f2f2]"/>

              <div onClick={()=>fileRef.current?.click()}
                className="border-2 border-dashed border-[#c1c1c1] rounded-xl p-10 text-center cursor-pointer hover:border-[#ff385c] transition-colors">
                <ImageIcon className="w-10 h-10 text-[#c1c1c1] mx-auto mb-2"/>
                <p className="text-sm font-bold text-[#222222]">Click to add property photos</p>
                <p className="text-xs text-[#6a6a6a] mt-1">JPG, PNG, WebP · Max 10MB each</p>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e=>{ if(e.target.files) processFiles(e.target.files); e.target.value=''; }}/>
              </div>

              {images.length>0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((img,i)=>(
                    <div key={i} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${i===0?'border-[#ff385c]':'border-gray-200'}`}>
                      <img src={img.previewUrl} className="w-full h-full object-cover" alt=""/>
                      {i===0 && <div className="absolute bottom-0 left-0 right-0 bg-[#ff385c] text-white text-[9px] font-bold text-center py-0.5">COVER</div>}
                      <button type="button" onClick={()=>removeImg(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-red-50">
                        <X className="w-2.5 h-2.5 text-red-500"/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={prevStep} disabled={step===1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#c1c1c1] text-sm font-bold disabled:opacity-30 hover:bg-[#f7f7f7] transition">
            <ChevronLeft className="w-4 h-4"/> Back
          </button>
          <span className="text-xs text-[#6a6a6a] font-medium">Step {step} of {totalSteps}</span>
          {step<totalSteps ? (
            <button type="button" onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#222222] text-white text-sm font-bold hover:bg-black transition">
              Next <ChevronRight className="w-4 h-4"/>
            </button>
          ) : (
            <button type="submit" disabled={isCreating}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#ff385c] text-white text-sm font-bold disabled:opacity-60 hover:bg-[#e0334f] transition">
              {isCreating ? <><Loader2 className="w-4 h-4 animate-spin"/> Publishing…</> : 'Publish Property'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddPropertyForm;
