'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset, RdvCompDh } from '@/types/userfeat';
import { DatasetsTable } from '../../define-ds/components/DatasetsTable';
import { formatDate } from '@/utils/dateFormatter';
import { DhTable } from '../../define-dh/components/DhTable';
import { useAppSelector } from '@/store/hooks';
import { DlTable } from './DlTable';
import { Project } from '@/types/project';

interface DlTabsProps {
  onExport: (data: any[], filename: string) => void;
}

export function DlTabs({
  onExport
}: DlTabsProps) {
  
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  
  const dhRecords = useAppSelector(state => state.userfeat.rdvcomdh).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  const dlRecords = useAppSelector(state => state.userfeat.rdvcompdl).filter(dl => isProjectAssignedAndActive(dl.projectshortname));


  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="datasets" className="text-center h-auto whitespace-normal">
            Datasets
          </TabsTrigger>
          <TabsTrigger value="dh" className="text-center h-auto whitespace-normal">
            DH Records
          </TabsTrigger>
          <TabsTrigger value="dl" className="text-center h-auto whitespace-normal">
            DL Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
          />
        </TabsContent>

        <TabsContent value="dh">
          <DhTable
            dhs={dhRecords}
          />
        </TabsContent>

        <TabsContent value="dl">
          <DlTable dls={dlRecords} />
        </TabsContent>


      </Tabs>
    </div>
  );
} 