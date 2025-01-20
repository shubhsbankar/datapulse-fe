'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllDatasetsAsync } from '@/store/userfeat/datasetThunks';
import { getAllRdvBojDsAsync } from '@/store/userfeat/rdvbojdsThunks';
import { getAllTenantBkccAsync } from '@/store/userfeat/tenantbkccThunks';
import { DosForm1 } from './components/DosForm1';
import { DosTabs } from './components/DosTabs';
import { DosTable } from './components/DosTable';
import { formatDate } from '@/utils/dateFormatter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DosForm2 } from './components/DosForm2';
import { DosForm3 } from './components/DosForm3';
import { SqlResults } from '../execute-sql/components/SqlResults';
import { getAllProjectAssignmentsAsync } from '@/store/project/projectThunk';

export default function DefineDosPage() {
  const dispatch = useAppDispatch();
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [queryResult, setQueryResult] = useState<{ headers: string[], rows: any[][], error: string }>();
  const {projectAssigns} = useAppSelector(state => state.project);
  const dos = useAppSelector((state) => state.userfeat.rdvbojds).filter(dos => projectAssigns.some(project => project.is_active && project.projectshortname === dos.projectshortname));
  
  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const tenantBkccs = useAppSelector((state) => state.userfeat.tenantbkcc);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllRdvBojDsAsync());
    dispatch(getAllTenantBkccAsync());
    dispatch(getAllProjectAssignmentsAsync());
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
          <Tabs defaultValue="dos1">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="dos1" className="text-center h-auto whitespace-normal">
                Form 1
              </TabsTrigger>
              <TabsTrigger value="dos2" className="text-center h-auto whitespace-normal">
                Form 2
              </TabsTrigger>
              <TabsTrigger value="dos3" className="text-center h-auto whitespace-normal">
                Form 3
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dos1">
              <DosForm1
                setQueryResult={setQueryResult}
                datasets={datasets}
                tenantBkccs={tenantBkccs}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedDataProduct={selectedDataProduct}
                setSelectedDataProduct={setSelectedDataProduct}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
              />

            </TabsContent>
            <TabsContent value="dos2">
              <DosForm2
                datasets={datasets}
                tenantBkccs={tenantBkccs}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedDataProduct={selectedDataProduct}
                setSelectedDataProduct={setSelectedDataProduct}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
                setQueryResult={setQueryResult}
              />

            </TabsContent>
            <TabsContent value="dos3">
              <DosForm3
                datasets={datasets}
                tenantBkccs={tenantBkccs}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedDataProduct={selectedDataProduct}
                setSelectedDataProduct={setSelectedDataProduct}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
                setQueryResult={setQueryResult}
              />

            </TabsContent>



          </Tabs>
        </div>

        <DosTabs
          onExport={exportToCSV}
        />
      </div>
      <DosTable dos={dos} />
      {/* <SqlResults results={queryResult || null} /> */}
    </div>
  );
} 