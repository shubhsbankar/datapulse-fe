'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset } from '@/types/userfeat';
import { DatasetsTable } from '../../define-ds/components/DatasetsTable';
import { DhTable } from './DhTable';
import { useAppSelector } from '@/store/hooks';

interface DhTabsProps {
  onExport: (data: any[], filename: string) => void;
}

export function DhTabs({
  onExport
}: DhTabsProps) {
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  const dhs = useAppSelector(state=>state.userfeat.rdvcomdh).filter(dh => isProjectAssignedAndActive(dh.projectshortname));
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="datasets" className="text-center h-auto whitespace-normal">
            Datasets
          </TabsTrigger>
          <TabsTrigger value="dhs" className="text-center h-auto whitespace-normal">
            DH
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets">
          <DatasetsTable 
            onExport={onExport}
            isTabView={true}
          />
        </TabsContent>
        <TabsContent value="dhs">
          <DhTable dhs={dhs} />
        </TabsContent>

      </Tabs>
    </div>
  );
} 