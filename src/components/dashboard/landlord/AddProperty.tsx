import React from 'react';
import AddPropertyForm from '../shared/AddPropertyForm';

/**
 * Page-level wrapper used by App.tsx routes:
 *   /dashboard/add-property
 *   /dashboard/landlord/add-property
 *
 * Renders the shared multi-step AddPropertyForm inside a standard page shell.
 */
const AddProperty: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-[#222222] tracking-tight">List a Property</h1>
        <p className="text-sm text-[#6a6a6a] mt-1">Fill in the details below to publish your property on GETKEJA.</p>
      </div>
      <AddPropertyForm />
    </div>
  );
};

export default AddProperty;
