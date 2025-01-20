'use client';

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createTenantBkccAsync } from "@/store/userfeat/tenantbkccThunks";
import { toast } from "react-hot-toast";

export function TidForm() {
  const dispatch = useAppDispatch();
  const [tenantId, setTenantId] = useState('');
  const [bkcArea, setBkcArea] = useState('');
  const [hubName, setHubName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Remove spaces and convert to lowercase
      const formattedTenantId = tenantId.toLowerCase().replace(/\s+/g, '');
      const formattedBkcArea = bkcArea.toLowerCase().replace(/\s+/g, '');
      const formattedHubName = hubName.toLowerCase().replace(/\s+/g, '');

      await dispatch(createTenantBkccAsync({
        tenantid: formattedTenantId,
        bkcarea: formattedBkcArea,
        hubname: formattedHubName
      })).unwrap();
      
      toast.success('Tenant ID created successfully');
      
      // Reset form
      setTenantId('');
      setBkcArea('');
      setHubName('');
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create Tenant ID');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Tenant ID</h2>
      
      {/* Show warning message */}
      <div className="mb-4 p-4 bg-yellow-50 rounded-md">
        <p className="text-sm text-yellow-700">
          Please use this page sparingly to avoid bk collusion.
          Please define tenantid and bkcarea only to new hubs or existing hubs with new datasets before initial load.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">
            Tenant ID
          </label>
          <input
            type="text"
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="bkcArea" className="block text-sm font-medium text-gray-700">
            BKC Area
          </label>
          <input
            type="text"
            id="bkcArea"
            value={bkcArea}
            onChange={(e) => setBkcArea(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="hubName" className="block text-sm font-medium text-gray-700">
            Hub Name
          </label>
          <input
            type="text"
            id="hubName"
            value={hubName}
            onChange={(e) => setHubName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Tenant ID
          </button>
        </div>
      </form>
    </div>
  );
} 