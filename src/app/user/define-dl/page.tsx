'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRdvCompDhAsync } from '@/store/userfeat/rdvcompdhThunks';
import { getAllRdvCompDlAsync } from '@/store/userfeat/rdvcompdlThunks';
import { getAllTenantBkccAsync } from '@/store/userfeat/tenantbkccThunks';
import { DlForm } from './components/DlForm';
import { DlTabs } from './components/DlTabs';
import { DlTable } from './components/DlTable';
import { formatDate } from '@/utils/dateFormatter';
import { SqlResults } from '../execute-sql/components/SqlResults';

export default function DefineDlPage() {
  const dispatch = useAppDispatch();
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [query, setQuery] = useState<{headers: string[], rows: any[][], error: string}>();

  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const dhRecords = useAppSelector((state) => state.userfeat.rdvcomdh);
  const dlRecords = useAppSelector((state) => state.userfeat.rdvcompdl);
  const tenantBkccs = useAppSelector((state) => state.userfeat.tenantbkcc);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllRdvCompDhAsync());
    dispatch(getAllRdvCompDlAsync());
    dispatch(getAllTenantBkccAsync());
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
        <DlForm 
          datasets={datasets}
          dhRecords={dhRecords}
          tenantBkccs={tenantBkccs}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDataProduct={selectedDataProduct}
          setSelectedDataProduct={setSelectedDataProduct}
          selectedDataset={selectedDataset}
          setSelectedDataset={setSelectedDataset}
          query={query}
          setQuery={setQuery}
        />

        <DlTabs
          onExport={exportToCSV}
        />
      </div>

      <SqlResults results={query || null} />
    </div>
  );
} 