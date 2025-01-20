'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllDtgsAsync } from '@/store/userfeat/dtgThunks';
import { SqlForm } from './components/SqlForm';
import { SqlTabs } from './components/SqlTabs';
import { formatDate } from '@/utils/dateFormatter';
import { SqlResults } from './components/SqlResults';

const ITEMS_PER_PAGE = 10;

export default function ExecuteSqlPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<{ headers: string[], rows: any[][] } | null>(null);

  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectActive = (project: string) => projectAssigns.find(pa => pa.projectshortname === project)?.is_active;

  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const cdsDatasets = useAppSelector((state) => 
    state.userfeat.dataset.filter(ds => ds.datastoreshortname === 'CSV1')
  );
  const dtgs = useAppSelector((state) => state.userfeat.dtg).filter(dtg => isProjectActive(dtg.projectshortname));

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllDtgsAsync());
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
        <div className="space-y-6">
          <SqlForm 
            datasets={datasets}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedDataProduct={selectedDataProduct}
            setSelectedDataProduct={setSelectedDataProduct}
            selectedDataset={selectedDataset}
            setSelectedDataset={setSelectedDataset}
            sqlQuery={sqlQuery}
            setSqlQuery={setSqlQuery}
          />
        </div>
        <SqlTabs
          datasets={filteredDatasets}
          cdsDatasets={filteredCdsDatasets}
          dtgs={dtgs}
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
    </div>
  );
} 