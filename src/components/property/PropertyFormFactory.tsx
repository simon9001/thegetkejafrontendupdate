// components/property/PropertyFormFactory.tsx
import React from 'react';
import { useCreatePropertyMutation } from '../../features/Api/PropertiesApi';
import { toast } from 'react-hot-toast';
import LongTermRentForm from './forms/LongTermRentForm';
// import ShortTermRentForm from './forms/ShortTermRentForm';
// import ForSaleForm from './forms/ForSaleForm';
// import CommercialForm from './forms/CommercialForm';
// import PlotForm from './forms/PlotForm';
// import OffPlanForm from './forms/OffPlanForm';

interface PropertyFormFactoryProps {
  listingCategory: 'for_sale' | 'long_term_rent' | 'short_term_rent' | 'commercial';
  listingType?: string;
  onSuccess?: () => void;
}

const PropertyFormFactory: React.FC<PropertyFormFactoryProps> = ({
  listingCategory,
  listingType,
  onSuccess,
}) => {
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const handleSubmit = async (formData: any) => {
    try {
      await createProperty(formData).unwrap();
      toast.success('Property listed successfully!');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create property');
    }
  };

  const commonProps = {
    onSubmit: handleSubmit,
    isLoading,
    listingType,
  };

  switch (listingCategory) {
    case 'long_term_rent':
      return <LongTermRentForm {...commonProps} />;
    case 'short_term_rent':
      return <div>Form coming soon</div>;
    case 'for_sale':
      return <div>Form coming soon</div>;
    case 'commercial':
      return <div>Form coming soon</div>;
    default:
      return null;
  }
};

// Specialized forms for plot and off-plan when listingType is selected
export const PlotFormWrapper: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => (
  <PropertyFormFactory listingCategory="for_sale" listingType="plot" onSuccess={onSuccess} />
);

export const OffPlanFormWrapper: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => (
  <PropertyFormFactory listingCategory="for_sale" listingType="off_plan" onSuccess={onSuccess} />
);

export default PropertyFormFactory;