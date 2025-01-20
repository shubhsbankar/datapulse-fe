'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllRsAsync } from '@/store/userfeat/rsThunks';
import { getAllRtAsync } from '@/store/userfeat/rtThunks';
import { getAllStrAsync } from '@/store/userfeat/strThunks';
import { StrForm } from './components/StrForm';
import { StrTabs } from './components/StrTabs';
import { StrTable } from './components/StrTable';
import { formatDate } from '@/utils/dateFormatter';

const ITEMS_PER_PAGE = 10;

export default function DefineStrPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  // Get data from Redux store
  const rss = useAppSelector((state) => state.userfeat.rs).filter(x => isProjectAssignedAndActive(x.projectshortname));
  const rts = useAppSelector((state) => state.userfeat.rt).filter(x => isProjectAssignedAndActive(x.projectshortname));
  const strs = useAppSelector((state) => state.userfeat.str).filter(x => isProjectAssignedAndActive(x.projectshortname));

  useEffect(() => {
    dispatch(getAllRsAsync());
    dispatch(getAllRtAsync());
    dispatch(getAllStrAsync());
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
      
      const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !selectedDataProduct || 
        (item.dataproductshortname === selectedDataProduct || item.dpname === selectedDataProduct);
      const matchesDataset = !selectedDataset || 
        (item.datasetshortname === selectedDataset || item.srcdataset === selectedDataset);

      return matchesSearch && matchesDateRange && 
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

  const filteredRss = getFilteredAndPaginatedItems(rss);
  const filteredRts = getFilteredAndPaginatedItems(rts);
  const filteredStrs = getFilteredAndPaginatedItems(strs);

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
        <StrForm 
          rsRecords={rss}
          rtRecords={rts}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDataProduct={selectedDataProduct}
          setSelectedDataProduct={setSelectedDataProduct}
          selectedDataset={selectedDataset}
          setSelectedDataset={setSelectedDataset}
        />
        <StrTabs />
      </div>

      <StrTable 
        str={filteredStrs}
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