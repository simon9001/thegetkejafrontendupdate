import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AddPropertyForm } from '../../components/dashboard/shared';

const AddProperty: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8 px-4">
          <h1 className="text-[28px] font-bold text-[#222222] tracking-tight">List Your Property</h1>
          <p className="text-sm text-[#6a6a6a] mt-1">Fill in the details to showcase your property to seekers across Kenya.</p>
        </div>
        
        <AddPropertyForm />
      </div>
    </DashboardLayout>
  );
};

export default AddProperty;
