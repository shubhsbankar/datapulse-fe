'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RdvCompDh, RdvCompDl, RdvCompDs } from '@/types/userfeat';
import { formatDate } from '@/utils/dateFormatter';
import { Search } from 'lucide-react';
import { DhTable } from '../../define-dh/components/DhTable';
import { DlTable } from '../../define-dl/components/DlTable';
import { DssTable } from '../../define-dss/components/DssTable';
import { useAppSelector } from '@/store/hooks';
import { SgTable } from '../../config-sg/components/SgTable';
import { DefineSgTable } from './DefineSgTable';


export function DefineSgTabs() {
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  // const { rdvcomdh: dhs, rdvcompdl: dls, rdvcompds: dss, dvbojsg1, dvcompsg1 } = useAppSelector(state => state.userfeat);
  const dhs = useAppSelector((state) => state.userfeat.rdvcomdh).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  const dls = useAppSelector((state) => state.userfeat.rdvcompdl).filter(dl => isProjectAssignedAndActive(dl.projectshortname));
  const dss = useAppSelector((state) => state.userfeat.rdvcompds).filter(ds => isProjectAssignedAndActive(ds.projectshortname));
  const dvcompsg1 = useAppSelector((state) => state.userfeat.dvcompsg1).filter(sg => isProjectAssignedAndActive(sg.projectshortname));
  const dvbojsg1 = useAppSelector((state) => state.userfeat.dvbojsg1).filter(sg => isProjectAssignedAndActive(sg.projectshortname));
  

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="dh">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="dh" className="text-center h-auto whitespace-normal">
            DH Records
          </TabsTrigger>
          <TabsTrigger value="dl" className="text-center h-auto whitespace-normal">
            DL Records
          </TabsTrigger>
          <TabsTrigger value="ds" className="text-center h-auto whitespace-normal">
            DS Records
          </TabsTrigger>
          <TabsTrigger value="csgs" className="text-center h-auto whitespace-normal">
            Config-SG Records
          </TabsTrigger>
          <TabsTrigger value="sgs" className="text-center h-auto whitespace-normal">
            Define-SG Records
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

        
        <TabsContent value="csgs">
          <SgTable sgs={dvcompsg1} />
        </TabsContent>

        <TabsContent value="sgs">
          <DefineSgTable sgs={dvbojsg1} />
        </TabsContent>

      </Tabs>
    </div>
  );
} 