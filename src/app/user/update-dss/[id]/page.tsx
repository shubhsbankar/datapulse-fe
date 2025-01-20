'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllTenantBkccAsync } from '@/store/userfeat/tenantbkccThunks';
import { getAllRdvCompDsAsync } from '@/store/userfeat/rdvcompdsThunks';
import { UpdateDssForm } from './components/UpdateDssForm';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function UpdateDssPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const tenantBkccs = useAppSelector((state) => state.userfeat.tenantbkcc);
  const currentDs = useAppSelector((state) => 
    state.userfeat.rdvcompds.find(ds => ds.rdvid === Number(id))
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          dispatch(getAllDatasetsAsync()),
          dispatch(getAllTenantBkccAsync()),
          dispatch(getAllRdvCompDsAsync())
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load DS component data');
        router.push('/user/define-dss');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentDs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">DS Component Not Found</h1>
        <button
          onClick={() => router.push('/user/define-dss')}
          className="text-blue-600 hover:text-blue-800"
        >
          Return to DS Components
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Update DS Component</h1>
          <button
            onClick={() => router.push('/user/define-dss')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to DS Components
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <UpdateDssForm
            datasets={datasets}
            tenantBkccs={tenantBkccs}
            currentDs={currentDs}
          />
        </div>
      </div>
    </div>
  );
} 