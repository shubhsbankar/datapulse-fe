'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RdvCompDh } from '@/types/userfeat';
import { formatDate } from '@/utils/dateFormatter';
import { DhTable } from '../../define-dh/components/DhTable';
import { DlTable } from '../../define-dl/components/DlTable';
import { DssTable } from '../../define-dss/components/DssTable';
import { useAppSelector } from '@/store/hooks';
import { PtTable } from './PtTable';

interface PtTabsProps {
  onExport: (data: any[], filename: string) => void;
}

export function PtTabs({
  onExport
}: PtTabsProps) {
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  const dhs = useAppSelector((state) => state.userfeat.rdvcomdh).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  const dls = useAppSelector((state) => state.userfeat.rdvcompdl).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  const dss = useAppSelector((state) => state.userfeat.rdvcompds).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  
  const pt = useAppSelector((state) =>{ console.log("state.userfeat.dvcomppt",state.userfeat.dvcomppt); return state.userfeat.dvcomppt})?.filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  console.log({pt});
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="dh">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="dh" className="text-center h-auto whitespace-normal">
            DH Records
          </TabsTrigger>
          <TabsTrigger value="dl" className="text-center h-auto whitespace-normal">
            DL Records
          </TabsTrigger>
          <TabsTrigger value="ds" className="text-center h-auto whitespace-normal">
            DS Records
          </TabsTrigger>
          <TabsTrigger value="pt" className="text-center h-auto whitespace-normal">
            Create PT Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dh">
          <DhTable dhs={dhs} />
        </TabsContent>
        <TabsContent value="dl">
          <DlTable dls={dls} />
        </TabsContent>
        <TabsContent value="ds">
          <DssTable dss={dss} />
        </TabsContent>
        <TabsContent value="pt">
          <PtTable pt={pt} />
        </TabsContent>

      </Tabs>
    </div>
  );
} 