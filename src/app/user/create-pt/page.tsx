'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRdvCompDhAsync } from '@/store/userfeat/rdvcompdhThunks';
import { getAllDvCompSg1sAsync } from '@/store/userfeat/dvcompsg1Thunks';
import { PtForm } from './components/PtForm';
import { PtTabs } from './components/PtTabs';
import { PtTable } from './components/PtTable';
import { formatDate } from '@/utils/dateFormatter';
import { SqlResults } from '../execute-sql/components/SqlResults';
import { getAllDvCompSg1bsAsync } from '@/store/userfeat/dvcompsg1bThunks';
import { getAllDvCompPtsAsync } from '@/store/userfeat/dvcompptThunks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PtForm2 } from './components/PtForm2';

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
    dispatch(getAllDvCompPtsAsync());
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
      <div className="bg-white shadow rounded-lg p-6">
          <Tabs defaultValue="form1">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="form1" className="text-center h-auto whitespace-normal">
                PT Form 1
              </TabsTrigger>
              <TabsTrigger value="form2" className="text-center h-auto whitespace-normal">
                PT Form 2
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form1">
            <PtForm 
          datasets={datasets}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          isUpdate={false}
          setQueryResult={setQueryResult}
        />
            </TabsContent>

            <TabsContent value="form2">
            <PtForm2 
          datasets={datasets}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          isUpdate={false}
          setQueryResult={setQueryResult}
        />
            </TabsContent>
          </Tabs>

        </div>

        <PtTabs
          onExport={exportToCSV}
        />
      </div>

      <SqlResults results={queryResult || null} />

    </div>
  );
} 