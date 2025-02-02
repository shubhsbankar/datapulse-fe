'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { LandingDataset } from '@/types/userfeat';
import { getAllDatastoresAsync } from '@/store/datastore/datastoreThunks';
import { getAllLandingDatasetsAsync, createLandingDatasetAsync, testLandingDatasetAsync } from '@/store/userfeat/landingDatasetThunks';
import { DatastoreColumn, defaultVisibleColumns } from '@/types/datastore';
import { LandingDatasetForm } from './components/LandingDatasetForm';
import { LandingDatasetsTabs } from './components/LandingDatasetsTabs';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils/dateFormatter';
import { LandingDatasetsTable } from './components/LandingDatasetsTable';

const ITEMS_PER_PAGE = 10;

export default function DefineCsvDatasetPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTestSuccessful, setIsTestSuccessful] = useState(false);
  const [comments, setComments] = useState("");
  const [lnddsshortname, setLnddsshortname] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<DatastoreColumn>>(
    new Set(defaultVisibleColumns)
  );
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');

  // Form state
  const [dataset, setDataset] = useState<LandingDataset>({
    projectshortname: '',
    srcdataproductshortname: '',
    srcdatasetshortname: '',
    lnddataproductshortname: '',
    lnddatasetshortname: '',
    lnddsshortname: '',
    comments: ''
  });

  // Get data from Redux store
  const datastores = useAppSelector((state) => 
    state.datastore.datastores.filter(ds => ds.is_valid)
  );
  const datasets = useAppSelector((state) => 
    state.userfeat.dataset.filter(ds => ds.datastoreshortname === 'CSV1')
  );

  useEffect(() => {
    dispatch(getAllDatastoresAsync());
    dispatch(getAllLandingDatasetsAsync());
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

  const projectAssigns = useAppSelector((state) => 
    state.project.projectAssigns.filter(pa => 
      pa.useremail === state.user.currentUser?.useremail && pa.is_active
    )
  );

  const filteredProjectAssignments = getFilteredAndPaginatedItems(projectAssigns);
  const filteredDatastores = getFilteredAndPaginatedItems(datastores);
  const filteredDatasets = getFilteredAndPaginatedItems(datasets);

  const exportToCSV = useCallback((data: any[], filename: string) => {
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIsTestSuccessful(false);
    const { name, value } = e.target;
    let formattedValue = value;

    if (['projectshortname', 'srcdataproductshortname', 'srcdatasetshortname', 'lnddataproductshortname', 'lnddatasetshortname', 'lnddsshortname'].includes(name)) {
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
        dispatch(testLandingDatasetAsync(dataset)).unwrap(),
        {
          loading: 'Testing landing dataset configuration...',
          success: (data) => {
            setIsTestSuccessful(true);
            return data.message || 'Landing dataset configuration is valid';
          },
          error: (err) => {
            setIsTestSuccessful(false);
            return err.message || 'Landing dataset configuration test failed';
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
      toast.error('Please test the landing dataset configuration first');
      return;
    }
    try {
      await toast.promise(
        dispatch(createLandingDatasetAsync({...dataset, comments,lnddsshortname})).unwrap(),
        {
          loading: 'Creating landing dataset...',
          success: () => {
            setDataset({
              projectshortname: '',
              srcdataproductshortname: '',
              srcdatasetshortname: '',
              lnddataproductshortname: '',
              lnddatasetshortname: '',
              lnddsshortname: '',
              comments: ''
            });
            setComments('');
            setIsTestSuccessful(false);
            return 'Landing dataset created successfully';
          },
          error: (err) => err.message || 'Failed to create landing dataset'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LandingDatasetForm 
          dataset={dataset}
          setLnddsshortname={setLnddsshortname}
          comments={comments}
          setComments={setComments}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onTest={handleTestDataset}
          isTestSuccessful={isTestSuccessful}
        />
        {/* <LandingDatasetsTabs
          projectAssignments={filteredProjectAssignments}
          datastores={filteredDatastores}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          onExport={exportToCSV}
        /> */}
        <LandingDatasetsTabs
          onExport={exportToCSV}
        />
      </div>

      <LandingDatasetsTable 
        isCDS={true}
        onExport={exportToCSV}
      />
    </div>
  );
}