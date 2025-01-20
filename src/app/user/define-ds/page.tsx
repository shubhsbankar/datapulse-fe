'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dataset, DatasetBase } from '@/types/userfeat';
import { getAllDatastoresAsync } from '@/store/datastore/datastoreThunks';
import { getAllDatasetsAsync, createDatasetAsync, testDatasetAsync } from '@/store/userfeat/datasetThunks';
import { DatastoreColumn, defaultVisibleColumns } from '@/types/datastore';
import { DatasetForm } from './components/DatasetForm';
import { ProjectsDatastoresTabs } from './components/ProjectsDatastoresTabs';
import { DatasetsTable } from './components/DatasetsTable';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils/dateFormatter';

const ITEMS_PER_PAGE = 10;

export default function DefineDatasetPage() {
  const dispatch = useAppDispatch();
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);

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

  // Get data from Redux store
  const datastores = useAppSelector((state) => 
    state.datastore.datastores.filter(ds => ds.is_valid)
  );
  const datasets = useAppSelector((state) => state.userfeat.dataset);

  useEffect(() => {
    dispatch(getAllDatastoresAsync());
    dispatch(getAllDatasetsAsync());
  }, [dispatch]);

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
            setDataset(prev => ({
              ...prev,
              is_valid: true
            }));
            return data.message || 'Dataset configuration is valid';
          },
          error: (err) => {
            setIsTestSuccessful(false);
            setDataset(prev => ({
              ...prev,
              is_valid: false
            }));
            return err.message || 'Dataset configuration test failed';
          }
        }
      );
    } catch (error) {
      console.error(error);
      setIsTestSuccessful(false);
      setDataset(prev => ({
        ...prev,
        is_valid: false
      }));
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
        dispatch(createDatasetAsync(dataset)).unwrap(),
        {
          loading: 'Creating dataset...',
          success: () => {
            setDataset({
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
            setIsTestSuccessful(false);
            return 'Dataset created successfully';
          },
          error: (err) => err.message || 'Failed to create dataset'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatasetForm 
          dataset={dataset}
          datastores={datastores}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onTest={handleTestDataset}
          isTestSuccessful={isTestSuccessful}
          isUpdate={false}
        />
        <ProjectsDatastoresTabs
          onExport={exportToCSV}
        />
      </div>

      <DatasetsTable 
        onExport={exportToCSV}
      />
    </div>
  );
} 