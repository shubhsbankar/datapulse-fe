'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Dataset } from '@/types/userfeat';
import { getAllDatastoresAsync } from '@/store/datastore/datastoreThunks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDtgsAsync } from '@/store/userfeat/dtgThunks';
import { DtColumn } from './components/DtTable';
import { DtForm } from './components/DtForm';
import { DtTabs } from './components/DtTabs';
import { DtTable } from './components/DtTable';
import { formatDate } from '@/utils/dateFormatter';
import { getAllDataAsync } from '@/store/auth/authThunks';

const ITEMS_PER_PAGE = 10;

export default function DefineDtPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');

  useEffect(() => {
    dispatch(getAllDataAsync())
  }, [dispatch])
  // Add states for form and filtering
  const [selectedTargetDataProduct, setSelectedTargetDataProduct] = useState('');
  const [selectedSourceDataProduct, setSelectedSourceDataProduct] = useState('');
  const [selectedTargetDataset, setSelectedTargetDataset] = useState('');
  const [selectedSourceDataset, setSelectedSourceDataset] = useState('');
  const [testcoverageversion, setTestcoverageversion] = useState('');

  // Get data from Redux store
  const dtgs = useAppSelector((state) => state.userfeat.dtg);
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const cdsDatasets = useAppSelector((state) => 
    state.userfeat.dataset.filter(ds => ds.datastoreshortname === 'CSV1')
  );

  useEffect(() => {
    dispatch(getAllDatastoresAsync());
    dispatch(getAllDatasetsAsync());
    dispatch(getAllDtgsAsync());
  }, [dispatch]);

  // Filter logic for datasets and cdsDatasets
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
      
      // Match either source or target data product/dataset
      const matchesDataProduct = !selectedTargetDataProduct || !selectedSourceDataProduct || 
         !item.dataproductshortname || 
         item.dataproductshortname === selectedTargetDataProduct || 
        item.dataproductshortname === selectedSourceDataProduct;
      
      const matchesDataset = !selectedTargetDataset || !selectedSourceDataset || 
        !item.datasetshortname || 
        item.datasetshortname === selectedTargetDataset || 
        item.datasetshortname === selectedSourceDataset;

      return matchesSearch && matchesDateRange && matchesDsType && 
             matchesProject && matchesDataProduct && matchesDataset;
    });
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  const filteredDatasets = getFilteredAndPaginatedItems(datasets);
  const filteredCdsDatasets = getFilteredAndPaginatedItems(cdsDatasets);

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
        <DtForm 
          datasets={datasets}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedTargetDataProduct={selectedTargetDataProduct}
          setSelectedTargetDataProduct={setSelectedTargetDataProduct}
          selectedSourceDataProduct={selectedSourceDataProduct}
          setSelectedSourceDataProduct={setSelectedSourceDataProduct}
          selectedTargetDataset={selectedTargetDataset}
          setSelectedTargetDataset={setSelectedTargetDataset}
          selectedSourceDataset={selectedSourceDataset}
          setSelectedSourceDataset={setSelectedSourceDataset}
          testcoverageversion={testcoverageversion}
          setTestcoverageversion={setTestcoverageversion}
        />
        <DtTabs
          datasets={filteredDatasets}
          cdsDatasets={filteredCdsDatasets}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedDsType={selectedDsType}
          setSelectedDsType={setSelectedDsType}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDataProduct={selectedDataProduct}
          setSelectedDataProduct={setSelectedDataProduct}
          onExport={exportToCSV}
        />
      </div>

      <DtTable dtgs={dtgs} />
    </div>
  );
} 