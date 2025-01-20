'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dataset, DatasetBase } from '@/types/userfeat';
import { getAllDatastoresAsync } from '@/store/datastore/datastoreThunks';
import { getAllDatasetsAsync, testDatasetAsync, updateDatasetAsync } from '@/store/userfeat/datasetThunks';
import { DatasetForm } from '../../define-ds/components/DatasetForm';
import { toast } from 'react-hot-toast';

interface UpdateDatasetPageProps {
  params: Promise<{
    id: string;
  }>
}

export default function UpdateDatasetPage({ params }: UpdateDatasetPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [datasetId, setDatasetId] = useState<number | null>(null);

  useEffect(()=>{
    const fetchParams = async () => {
      const resolvedParams = await params;
      setDatasetId(parseInt(resolvedParams.id));
    };

    fetchParams();
  }, [params]);
  // Get data from Redux store
  const datastores = useAppSelector((state) => 
    state.datastore.datastores.filter(ds => ds.is_valid)
  );
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const currentDataset = datasets.find(ds => ds.datasetid === datasetId);

  // Form state
  const [dataset, setDataset] = useState<DatasetBase>({
    projectshortname: '',
    dataproductshortname: '',
    datasetshortname: '',
    domainshortname: '',
    datastoreshortname: '',
    tablename: '',
    dsdatatype: 'NA',
    fieldname: '',
    sourcename: '',
    tenantid: '',
    bkcarea: '',
    is_valid: false
  });

  useEffect(() => {
    dispatch(getAllDatastoresAsync());
    dispatch(getAllDatasetsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (currentDataset) {
      setDataset({
        projectshortname: currentDataset.projectshortname,
        dataproductshortname: currentDataset.dataproductshortname,
        datasetshortname: currentDataset.datasetshortname,
        domainshortname: currentDataset.domainshortname,
        datastoreshortname: currentDataset.datastoreshortname,
        tablename: currentDataset.tablename,
        dsdatatype: currentDataset.dsdatatype,
        fieldname: currentDataset.fieldname || '',
        sourcename: currentDataset.sourcename,
        tenantid: currentDataset.tenantid,
        bkcarea: currentDataset.bkcarea,
        is_valid: currentDataset.is_valid || false
      });
    }
  }, [currentDataset]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsTestSuccessful(false);
    const { name, value } = e.target;
    let formattedValue = value;

    if (['projectshortname', 'domainshortname', 'dataproductshortname', 'datasetshortname', 'sourcename', 'tenantid', 'bkcarea'].includes(name)) {
      formattedValue = value.toLowerCase().replace(/\s+/g, '');
    }

    setDataset(prev => ({
      ...prev,
      [name]: formattedValue,
      ...(name === 'dsdatatype' && formattedValue === 'NA' ? { fieldname: '' } : {})
    }));
  };

  const handleTestDataset = async () => {
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
    if (!isTestSuccessful) {
      toast.error('Please test the dataset configuration first');
      return;
    }

    try {
      await toast.promise(
        dispatch(updateDatasetAsync({ dsid: datasetId as number, datasetData: dataset })).unwrap(),
        {
          loading: 'Updating dataset...',
          success: () => {
            router.push('/user/define-ds');
            return 'Dataset updated successfully';
          },
          error: (err) => err.message || 'Failed to update dataset'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentDataset) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Update Dataset</h1>
        <button
          onClick={() => router.push('/user/define-ds')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Back to Datasets
        </button>
      </div>

      <DatasetForm 
        dataset={dataset}
        isUpdate={true}
        datastores={datastores}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onTest={handleTestDataset}
        isTestSuccessful={isTestSuccessful}
      />
    </div>
  );
} 