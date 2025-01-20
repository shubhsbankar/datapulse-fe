'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRdvCompDhAsync } from '@/store/userfeat/rdvcompdhThunks';
import { getAllDvCompSg1sAsync } from '@/store/userfeat/dvcompsg1Thunks';
import { SgForm } from './components/SgForm';
import { SgTabs } from './components/SgTabs';
import { SgTable } from './components/SgTable';
import { formatDate } from '@/utils/dateFormatter';
import { SqlResults } from '../execute-sql/components/SqlResults';
import { getAllDvCompSg1bsAsync } from '@/store/userfeat/dvcompsg1bThunks';

export default function ConfigSgPage() {
  const dispatch = useAppDispatch();
  const [selectedProject, setSelectedProject] = useState('');
  const [queryResult, setQueryResult] = useState<{headers: string[], rows: any[][], error: string}>();

  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const dhs = useAppSelector((state) => state.userfeat.rdvcomdh);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllRdvCompDhAsync());
    dispatch(getAllDvCompSg1sAsync());
    dispatch(getAllDvCompSg1bsAsync());
  }, [dispatch]);

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
        <SgForm 
          datasets={datasets}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          isUpdate={false}
          setQueryResult={setQueryResult}
        />
        <SgTabs
          onExport={exportToCSV}
        />
      </div>

      <SqlResults results={queryResult || null} />

    </div>
  );
} 