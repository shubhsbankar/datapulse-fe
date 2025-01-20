'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset, RdvCompDs } from '@/types/userfeat';
import { DatasetsTable } from '../../define-ds/components/DatasetsTable';
import { DhTable } from '../../define-dh/components/DhTable';
import { useAppSelector } from '@/store/hooks';
import { DssTable } from './DssTable';
import { DlTable } from '../../define-dl/components/DlTable';

interface DssTabsProps {
  onExport: (data: any[], filename: string) => void;
}

export function DssTabs({
  onExport
}: DssTabsProps) {
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  const rdvcompdh = useAppSelector((state) => state.userfeat.rdvcomdh).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  const rdvcompdl = useAppSelector((state) => state.userfeat.rdvcompdl).filter(dl => isProjectAssignedAndActive(dl.projectshortname));
  const dss = useAppSelector((state) => state.userfeat.rdvcompds).filter(ds => isProjectAssignedAndActive(ds.projectshortname));
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
          <TabsTrigger value="dl" className="text-center h-auto whitespace-normal">
            DL Components
          </TabsTrigger>
          <TabsTrigger value="dss" className="text-center h-auto whitespace-normal">
            DSS Components
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
            dhs={rdvcompdh}
          />
        </TabsContent>


        <TabsContent value="dl">
          <DlTable
            dls={rdvcompdl}
          />
        </TabsContent>


        <TabsContent value="dss">
          <DssTable dss={dss} />
        </TabsContent>


      </Tabs>
    </div>
  );
} 