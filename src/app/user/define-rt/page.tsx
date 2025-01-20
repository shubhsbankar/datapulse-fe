'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRsAsync } from '@/store/userfeat/rsThunks';
import { getAllRtAsync } from '@/store/userfeat/rtThunks';
import { RtForm } from './components/RtForm';
import { RtTabs } from './components/RtTabs';
import { RtTable } from './components/RtTable';
import { formatDate } from '@/utils/dateFormatter';

const ITEMS_PER_PAGE = 10;

export default function DefineRtPage() {
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
  const { projectAssigns } = useAppSelector((state) => state.project);
  function isProjectAssigned(project: string) {
    return projectAssigns.some((assign) => assign.projectshortname === project && assign.is_active);
  }
  const datasets = useAppSelector((state) => state.userfeat.dataset).filter((dataset) =>
    isProjectAssigned(dataset.projectshortname)
  );
  const rss = useAppSelector((state) => state.userfeat.rs);
  const rts = useAppSelector((state) => state.userfeat.rt);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllRsAsync());
    dispatch(getAllRtAsync());
  }, [dispatch]);

  // Filter and pagination logic
  const getFilteredAndPaginatedItems = (items: any[]) => {
    const filtered = items.filter(item => {
      const isAssigned = isProjectAssigned(item.projectshortname);
      
      const matchesSearch = Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDateRange = (!startDate || !endDate) ? true :
        new Date(item.createdate) >= new Date(startDate) &&
        new Date(item.createdate) <= new Date(endDate);

      const matchesDsType = !selectedDsType || item.dsdatatype === selectedDsType;
      const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !selectedDataProduct ||
        (item.dataproductshortname === selectedDataProduct || item.dpname === selectedDataProduct);
      const matchesDataset = !selectedDataset ||
        (item.datasetshortname === selectedDataset || item.srcdataset === selectedDataset);

      return matchesSearch && matchesDateRange && matchesDsType &&
        matchesProject && matchesDataProduct && matchesDataset && isAssigned;
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
  const filteredRss = getFilteredAndPaginatedItems(rss);

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
        <RtForm
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
        <RtTabs
          datasets={filteredDatasets}
          rss={filteredRss}
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

      <RtTable
        rts={getFilteredAndPaginatedItems(rts)}
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