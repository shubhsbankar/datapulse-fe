'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRdvCompDhAsync } from '@/store/userfeat/rdvcompdhThunks';
import { getAllRdvCompDlAsync } from '@/store/userfeat/rdvcompdlThunks';
import { getAllRdvCompDsAsync } from '@/store/userfeat/rdvcompdsThunks';
import { getAllDvBojSg1sAsync } from '@/store/userfeat/dvbojsg1Thunks';
import { DefineSgForm } from './components/DefineSgForm';
import { DefineSgTabs } from './components/DefineSgTabs';
import { formatDate } from '@/utils/dateFormatter';
import { SqlResults } from '../execute-sql/components/SqlResults';

const ITEMS_PER_PAGE = 10;

export default function DefineSgPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [queryResult, setQueryResult] = useState<{headers: string[], rows: any[][], error: string}>();

  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const dhs = useAppSelector((state) => state.userfeat.rdvcomdh);
  const dls = useAppSelector((state) => state.userfeat.rdvcompdl);
  const ds = useAppSelector((state) => state.userfeat.rdvcompds);
  const sgs = useAppSelector((state) => state.userfeat.dvcompsg1);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllRdvCompDhAsync());
    dispatch(getAllRdvCompDlAsync());
    dispatch(getAllRdvCompDsAsync());
    dispatch(getAllDvBojSg1sAsync());
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

      return matchesSearch && matchesDateRange && matchesProject && matchesDataProduct;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  const filteredDhs = getFilteredAndPaginatedItems(dhs);
  const filteredDls = getFilteredAndPaginatedItems(dls);
  const filteredDs = getFilteredAndPaginatedItems(ds);
  const filteredSgs = getFilteredAndPaginatedItems(sgs);

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

  console.log({queryResult});

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefineSgForm 
          dvcompsg1s={filteredSgs.items}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          setQueryResult={setQueryResult}
        />
        <DefineSgTabs />
      </div>

      <SqlResults results={queryResult || null} />

    </div>
  );
} 