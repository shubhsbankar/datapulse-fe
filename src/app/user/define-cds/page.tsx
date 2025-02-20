'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dataset, DatasetBase } from '@/types/userfeat';
import { getAllDatastoresAsync } from '@/store/datastore/datastoreThunks';
import { getAllDatasetsAsync, createDatasetAsync, testDatasetAsync } from '@/store/userfeat/datasetThunks';
import { DatastoreColumn, defaultVisibleColumns } from '@/types/datastore';
import { CsvDatasetForm } from './components/CsvDatasetForm';
import { CsvTabs } from './components/CsvTabs';
import { DatasetsTable } from '../define-ds/components/DatasetsTable';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils/dateFormatter';

const ITEMS_PER_PAGE = 10;

export default function DefineCsvDatasetPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<DatastoreColumn>>(
    new Set(defaultVisibleColumns)
  );
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');

  // Form state
  const [dataset, setDataset] = useState<DatasetBase>({
    projectshortname: '',
    dataproductshortname: '',
    datasetshortname: '',
    domainshortname: '',
    datastoreshortname: 'CSV1', // Default to CSV1 for CDS
    tablename: '',
    dsdatatype: 'NA',
    fieldname: '',
    sourcename: '',
    tenantid: '',
    bkcarea: '',
    is_valid: false,
    csvdailysuffix: 'NO',
    separator: ',',
    filessource: 'local',
    filesbucketpath: '',
    s3_accesskey: '',
    s3_secretkey: '',
    gcs_jsonfile: ''
  });

  // Get data from Redux store
  const datastores = useAppSelector((state) => 
    state.datastore.datastores.filter(ds => ds.is_valid)
  );
  const datasets = useAppSelector((state) => 
    state.userfeat.dataset.filter(ds => ds.datastoreshortname === 'CSV1')
  );

  const projectNames = useAppSelector((state) =>
    state.project.projectAssigns
      .filter((p) => p.useremail === state.user.currentUser?.useremail && p.is_active)
      .map((p) => p.projectshortname)
  );

  useEffect(() => {
    dispatch(getAllDatastoresAsync());
    dispatch(getAllDatasetsAsync());
  }, [dispatch]);

  // Filter and pagination logic
  const getFilteredAndPaginatedItems = (items: any[]) => {
    const filtered = items.filter(item => {
      const matchesSearch = Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesDateRange = (!startDate || !endDate) ? true : 
        new Date(item.createdate) >= new Date(startDate) && 
        new Date(item.createdate) <= new Date(endDate);
      
      const matchesDsType = !selectedDsType || item.dsdatatype === selectedDsType;
      const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !selectedDataProduct || item.dataproductshortname === selectedDataProduct;

      return matchesSearch && matchesDateRange && matchesDsType && 
             matchesProject && matchesDataProduct;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  const filteredProjectAssignments = getFilteredAndPaginatedItems(
    useAppSelector((state) => 
      state.project.projectAssigns.filter(pa => 
        pa.useremail === state.user.currentUser?.useremail && pa.is_active
      )
    )
  );

  const filteredDatastores = getFilteredAndPaginatedItems(datastores);
  const filteredDatasets = getFilteredAndPaginatedItems(datasets);

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
        dispatch(createDatasetAsync({...dataset, is_valid: true})).unwrap(),
        {
          loading: 'Creating dataset...',
          success: () => {
            setDataset({
              projectshortname: '',
              dataproductshortname: '',
              datasetshortname: '',
              domainshortname: '',
              datastoreshortname: 'CSV1',
              tablename: '',
              dsdatatype: 'NA',
              fieldname: '',
              sourcename: '',
              tenantid: '',
              bkcarea: '',
              is_valid: false,
              csvdailysuffix: 'NO',
              separator: ',',
              filessource: 'local',
              filesbucketpath: '',
              s3_accesskey: '',
              s3_secretkey: '',
              gcs_jsonfile: ''
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

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CsvDatasetForm 
          dataset={dataset}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onTest={handleTestDataset}
          isTestSuccessful={isTestSuccessful}
        />
        <CsvTabs
          projectAssignments={filteredProjectAssignments}
          datastores={filteredDatastores}
          projectNames={projectNames}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          onExport={exportToCSV}
        />
      </div>

      <DatasetsTable 
        isCDS={true}
        onExport={exportToCSV}
      />
    </div>
  );
} 