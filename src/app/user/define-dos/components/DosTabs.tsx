'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset, RdvCompDh, RdvCompDs } from '@/types/userfeat';
import { DatasetsTable } from '../../define-ds/components/DatasetsTable';
import { DlTable } from '../../define-dl/components/DlTable';
import { useAppSelector } from '@/store/hooks';
import { DhTable } from '../../define-dh/components/DhTable';
import { DssTable } from '../../define-dss/components/DssTable';
import { DosTable } from './DosTable';

interface DosTabsProps {
  onExport: (data: any[], filename: string) => void;
}

export function DosTabs({
  onExport
}: DosTabsProps) {
  const {projectAssigns} = useAppSelector(state => state.project);
  
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  const dhs = useAppSelector(state => state.userfeat.rdvcomdh).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  const dlRecords = useAppSelector(state => state.userfeat.rdvcompdl).filter(dl => isProjectAssignedAndActive(dl.projectshortname));
  const dss = useAppSelector(state => state.userfeat.rdvcompds).filter(ds => isProjectAssignedAndActive(ds.projectshortname));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="datasets" className="text-center h-auto whitespace-normal">
            Datasets
          </TabsTrigger>
          <TabsTrigger value="dh" className="text-center h-auto whitespace-normal">
            DH Components
          </TabsTrigger>
          <TabsTrigger value="ds" className="text-center h-auto whitespace-normal">
            DS Components
          </TabsTrigger>
          <TabsTrigger value="dl" className="text-center h-auto whitespace-normal">
            DL Components
          </TabsTrigger>
          {/* <TabsTrigger value="dos" className="text-center h-auto whitespace-normal">
            DOS Components
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="datasets">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
          />
        </TabsContent>

        <TabsContent value="dh">
          <DhTable
            dhs={dhs}
          />
        </TabsContent>

        <TabsContent value="ds">
          <DssTable
            dss={dss}
          />
        </TabsContent>
        <TabsContent value="dl">
          <DlTable
            dls={dlRecords}
          />
        </TabsContent>

        {/* <TabsContent value="dos">
          <DosTable dos={dos} />
        </TabsContent> */}


      </Tabs>
    </div>
  );
} 