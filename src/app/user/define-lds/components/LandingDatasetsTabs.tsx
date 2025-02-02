'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectAssign } from '@/types/project';
import { Datastore, DatastoreColumn } from '@/types/datastore';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { Download, Columns, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatter';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { LandingDataset } from '@/types/userfeat';

const ITEMS_PER_PAGE = 10;

// Define enum for Project columns
export enum ProjectColumn {
  ProjectShortName = 'Project Short Name',
  Status = 'Status',
  AssignedBy = 'Assigned By',
  DateAssigned = 'Date Assigned'
}

export enum LandingDatasetColumn {
  Dlid = 'dlid',
  ProjectShortName = 'projectshortname',
  SrcDataProductShortName = 'srcdataproductshortname',
  SrcDatasetShortName = 'srcdatasetshortname',
  LndDataProductShortName = 'lnddataproductshortname',
  LndDatasetShortName = 'lnddatasetshortname',
  LndDsShortName = 'lnddsshortname',
  CreateDate = 'createdate',
  UserEmailId = 'useremailid',
  Comments = 'comments'
}

interface LandingDatasetsTabsProps {
  onExport: (data: any[], filename: string) => void;
}

export function LandingDatasetsTabs({
  onExport
}: LandingDatasetsTabsProps) {
  // Get data from Redux store
  const projectAssignments = useAppSelector((state) => 
    state.project.projectAssigns.filter(pa => 
      pa.useremail === state.user.currentUser?.useremail && pa.is_active
    )
  );
  const landingDatasets = useAppSelector((state) => 
    state.userfeat.lnddataset
  );

  // Internal state management
  const [visibleProjectColumns, setVisibleProjectColumns] = useState<Set<ProjectColumn>>(
    new Set(Object.values(ProjectColumn))
  );
  const [visibleLndDatasetColumns, setVisibleLndDatasetColumns] = useState<Set<LandingDatasetColumn>>(
    new Set(Object.values(LandingDatasetColumn))
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and pagination logic
  const getFilteredAndPaginatedItems = <T extends ProjectAssign | LandingDataset>(items: T[]) => {
    const filtered = items.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  // console.log({projectAssignments});
  // // const filteredProjectAssignments = {
  // //   ...getFilteredAndPaginatedItems(projectAssignments),
  // //   items: projectAssignments
  // // }
  const filteredProjectAssignments = getFilteredAndPaginatedItems(projectAssignments);
  const filteredLandingDatasets = getFilteredAndPaginatedItems(landingDatasets);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Assigned Projects</TabsTrigger>
          <TabsTrigger value="datastores">Available Landing Datasets</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="mb-4 flex justify-between">
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <Columns className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              }
              align="end"
            >
              <div className='overflow-y-auto max-h-[200px]'>
                {Object.entries(ProjectColumn).map(([key, value]) => (
                  <CheckboxItem
                    key={key}
                    checked={visibleProjectColumns.has(value)}
                    onCheckedChange={(checked: boolean) => {
                      const newColumns = new Set(visibleProjectColumns);
                      if (checked) {
                        newColumns.add(value);
                      } else {
                        newColumns.delete(value);
                      }
                      setVisibleProjectColumns(newColumns);
                    }}
                  >
                    {value}
                  </CheckboxItem>
                ))}
              </div>
            </Dropdown>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(filteredProjectAssignments.items, 'projects')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Complete Projects Table Implementation */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from(visibleProjectColumns).map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjectAssignments.items.map((pa) => (
                  <tr key={pa.assignid}>
                    {Array.from(visibleProjectColumns).map((column) => (
                      <td
                        key={`${pa.assignid}-${column}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column === ProjectColumn.ProjectShortName && pa.projectshortname}
                        {column === ProjectColumn.Status && (pa.is_active ? 'Active' : 'Inactive')}
                        {column === ProjectColumn.AssignedBy && pa.who_added}
                        {column === ProjectColumn.DateAssigned && formatDate(pa.createdate)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination for Projects */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjectAssignments.totalItems)} of{' '}
              {filteredProjectAssignments.totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {filteredProjectAssignments.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(filteredProjectAssignments.totalPages, currentPage + 1))}
                disabled={currentPage === filteredProjectAssignments.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="datastores">
          <div className="mb-4 flex justify-between">
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <Columns className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              }
              align="end"
            >
              <div className='overflow-y-auto max-h-[200px]'>
                {Object.entries(LandingDatasetColumn).map(([key, value]) => (
                  <CheckboxItem
                    key={key}
                    checked={visibleLndDatasetColumns.has(value)}
                    onCheckedChange={(checked: boolean) => {
                      const newColumns = new Set(visibleLndDatasetColumns);
                      if (checked) {
                        newColumns.add(value);
                      } else {
                        newColumns.delete(value);
                      }
                      setVisibleLndDatasetColumns(newColumns);
                    }}
                  >
                    {key}
                  </CheckboxItem>
                ))}
              </div>
            </Dropdown>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(filteredLandingDatasets.items, 'datastores')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Complete Datastores Table Implementation */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from(visibleLndDatasetColumns).map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLandingDatasets.items.map((ds) => (
                  <tr key={ds.dlid}>
                    {Array.from(visibleLndDatasetColumns).map((column) => (
                      <td
                        key={`${ds.dlid}-${column}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column === LandingDatasetColumn.CreateDate
                          ? formatDate(ds[column] || '')
                          : column === LandingDatasetColumn.UserEmailId
                          ? ds[column] ? 'Valid' : 'Invalid'
                          : ds[column as keyof LandingDataset]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination for Datastores */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredLandingDatasets.totalItems)} of{' '}
              {filteredLandingDatasets.totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {filteredLandingDatasets.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(filteredLandingDatasets.totalPages, currentPage + 1))}
                disabled={currentPage === filteredLandingDatasets.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 