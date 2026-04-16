// components/property/forms/LongTermRentForm.tsx
import React, { useState } from 'react';
import { MapPin, Home, DollarSign, Users } from 'lucide-react';
import LocationPicker from '../shared/LocationPicker';
// import AmenitiesSelector from '../shared/AmenitiesSelector';

interface LongTermRentFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const LongTermRentForm: React.FC<LongTermRentFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    // Core fields
    title: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    parking_spaces: '0',
    is_furnished: 'unfurnished',
    compound_is_gated: false,
    
    // Location
    location: {
      county: '',
      area: '',
      estate_name: '',
      latitude: '',
      longitude: '',
    },
    
    // Pricing
    pricing: {
      monthly_rent: '',
      deposit_months: '1',
      service_charge: '',
      water_bill_type: 'metered',
      electricity_bill_type: 'prepaid_token',
      negotiable: false,
    },
    
    // Contact
    contact: {
      full_name: '',
      phone_primary: '',
      email: '',
    },
    
    amenities: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      listing_category: 'long_term_rent',
      listing_type: 'apartment', // or house, bedsitter, etc.
      title: formData.title,
      description: formData.description,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseFloat(formData.bathrooms) || 0,
      parking_spaces: parseInt(formData.parking_spaces) || 0,
      is_furnished: formData.is_furnished,
      compound_is_gated: formData.compound_is_gated,
      
      location: {
        county: formData.location.county,
        area: formData.location.area,
        estate_name: formData.location.estate_name,
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude),
      },
      
      pricing: {
        monthly_rent: parseFloat(formData.pricing.monthly_rent),
        deposit_months: parseInt(formData.pricing.deposit_months) || 0,
        service_charge: parseFloat(formData.pricing.service_charge) || 0,
        water_bill_type: formData.pricing.water_bill_type,
        electricity_bill_type: formData.pricing.electricity_bill_type,
        negotiable: formData.pricing.negotiable,
      },
      
      contacts: [{
        role: 'landlord',
        full_name: formData.contact.full_name,
        phone_primary: formData.contact.phone_primary,
        email: formData.contact.email,
        is_primary_contact: true,
      }],
      
      amenities: formData.amenities,
    };
    
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-[#ff385c]" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Property Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff385c]"
              placeholder="e.g., Spacious 2BR Apartment in Westlands"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff385c]"
              placeholder="Describe the property, nearby amenities, unique features..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              min="0"
              value={formData.bedrooms}
              onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.bathrooms}
              onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Parking Spaces</label>
            <input
              type="number"
              min="0"
              value={formData.parking_spaces}
              onChange={(e) => setFormData({...formData, parking_spaces: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Furnished Status</label>
            <select
              value={formData.is_furnished}
              onChange={(e) => setFormData({...formData, is_furnished: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-Furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>
        </div>
        
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={formData.compound_is_gated}
            onChange={(e) => setFormData({...formData, compound_is_gated: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm">Gated Compound</span>
        </label>
      </div>
      
      {/* Location Section with Map */}
      <LocationPicker
        value={formData.location}
        onChange={(location) => setFormData({...formData, location})}
      />
      
      {/* Pricing Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#ff385c]" />
          Pricing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Rent (KES) *</label>
            <input
              type="number"
              min="0"
              value={formData.pricing.monthly_rent}
              onChange={(e) => setFormData({
                ...formData,
                pricing: {...formData.pricing, monthly_rent: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Deposit (months)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.pricing.deposit_months}
              onChange={(e) => setFormData({
                ...formData,
                pricing: {...formData.pricing, deposit_months: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Service Charge (KES)</label>
            <input
              type="number"
              min="0"
              value={formData.pricing.service_charge}
              onChange={(e) => setFormData({
                ...formData,
                pricing: {...formData.pricing, service_charge: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Water Billing</label>
            <select
              value={formData.pricing.water_bill_type}
              onChange={(e) => setFormData({
                ...formData,
                pricing: {...formData.pricing, water_bill_type: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="metered">Metered (own meter)</option>
              <option value="included">Included in rent</option>
              <option value="shared_split">Shared / Split</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Electricity Billing</label>
            <select
              value={formData.pricing.electricity_bill_type}
              onChange={(e) => setFormData({
                ...formData,
                pricing: {...formData.pricing, electricity_bill_type: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="prepaid_token">Prepaid Token</option>
              <option value="included">Included in rent</option>
              <option value="own_meter">Own Meter (postpaid)</option>
            </select>
          </div>
        </div>
        
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={formData.pricing.negotiable}
            onChange={(e) => setFormData({
              ...formData,
              pricing: {...formData.pricing, negotiable: e.target.checked}
            })}
            className="w-4 h-4"
          />
          <span className="text-sm">Price is Negotiable</span>
        </label>
      </div>
      
      {/* Amenities Section */}
      {/* AmenitiesSelector not yet implemented */}
      
      {/* Contact Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#ff385c]" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.contact.full_name}
              onChange={(e) => setFormData({
                ...formData,
                contact: {...formData.contact, full_name: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              value={formData.contact.phone_primary}
              onChange={(e) => setFormData({
                ...formData,
                contact: {...formData.contact, phone_primary: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="+254712345678"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => setFormData({
                ...formData,
                contact: {...formData.contact, email: e.target.value}
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#ff385c] text-white py-3 rounded-xl font-bold hover:bg-[#e00b41] disabled:opacity-50 transition"
      >
        {isLoading ? 'Publishing...' : 'Publish Property'}
      </button>
    </form>
  );
};

export default LongTermRentForm;