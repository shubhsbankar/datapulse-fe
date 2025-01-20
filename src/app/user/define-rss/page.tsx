'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDtgsAsync } from '@/store/userfeat/dtgThunks';
import { getAllRsAsync } from '@/store/userfeat/rsThunks';
import { RssForm } from './components/RssForm';
import { RssTabs } from './components/RssTabs';
import { RsTable } from './components/RsTable';
import { formatDate } from '@/utils/dateFormatter';

const ITEMS_PER_PAGE = 10;

export default function DefineRssPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedDatastore, setSelectedDatastore] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const cdsDatasets = useAppSelector((state) => 
    state.userfeat.dataset.filter(ds => ds.datastoreshortname === 'CSV1')
  );
  const dtgs = useAppSelector((state) => state.userfeat.dtg);
  const rss = useAppSelector((state) => state.userfeat.rs);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllDtgsAsync());
    dispatch(getAllRsAsync());
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
      const matchesDataset = !selectedDataset || item.datasetshortname === selectedDataset;

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
  const filteredDtgs = getFilteredAndPaginatedItems(dtgs);

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
        <RssForm 
          datasets={datasets}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDataProduct={selectedDataProduct}
          setSelectedDataProduct={setSelectedDataProduct}
          selectedDataset={selectedDataset}
          setSelectedDataset={setSelectedDataset}
          selectedDatastore={selectedDatastore}
          setSelectedDatastore={setSelectedDatastore}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
        />
        <RssTabs
          datasets={filteredDatasets}
          cdsDatasets={filteredCdsDatasets}
          dtgs={filteredDtgs}
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

      <RsTable 
        rss={getFilteredAndPaginatedItems(rss)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedDataProduct={selectedDataProduct}
        setSelectedDataProduct={setSelectedDataProduct}
      />
    </div>
  );
} 