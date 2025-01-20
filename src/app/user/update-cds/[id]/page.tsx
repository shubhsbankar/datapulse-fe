'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EditCsvDatasetForm } from '../../define-cds/components/EditCsvDatasetForm';
import { Dataset } from '@/types/userfeat';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateDatasetAsync, testDatasetAsync } from '@/store/userfeat/datasetThunks';
import { toast } from 'react-hot-toast';

export default function UpdateCdsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const ds = useAppSelector(state => state.userfeat.dataset.find(ds => ds.datasetid === Number(id)));

  useEffect(() => {
    if (ds) {
      setDataset(ds);
    }
  }, [ds]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDataset(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const handleTest = async () => {
    if (!dataset) return;
    
    try {
      const result = await toast.promise(
        dispatch(testDatasetAsync(dataset)).unwrap(),
        {
          loading: 'Testing dataset configuration...',
          success: (data) => {
            setIsTestSuccessful(true);
            return data.message || 'Dataset configuration is valid';
          },
          error: (err) => {
            setIsTestSuccessful(false);
            return err.message || 'Dataset configuration test failed';
          }
        }
      );
    } catch (error) {
      console.error(error);
      setIsTestSuccessful(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTestSuccessful || !dataset) {
      toast.error('Please test the configuration first');
      return;
    }

    try {
      const updatedDataset = {
        ...dataset,
        is_valid: isTestSuccessful
      };

      await dispatch(updateDatasetAsync({ 
        dsid: Number(updatedDataset.datasetid), 
        datasetData: updatedDataset 
      })).unwrap();
      
      toast.success('Dataset updated successfully');
      router.push('/user/define-ds');
    } catch (error) {
      toast.error('Failed to update dataset');
    }
  };

  if (!dataset) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditCsvDatasetForm
        dataset={dataset}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onTest={handleTest}
        isTestSuccessful={isTestSuccessful}
      />
    </div>
  );
} 