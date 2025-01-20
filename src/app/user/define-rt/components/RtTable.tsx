'use client';

import { Rt } from '@/types/userfeat';
import { Search, ChevronLeft, ChevronRight, Pencil, Columns } from 'lucide-react';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export enum RtColumn {
  tgthashid = "tgthashid",
  projectshortname = "projectshortname",
  tgtdphash = "tgtdphash",
  tgtdataset = "tgtdataset",
  tgttabfields = "tgttabfields",
  tgthashcol = "tgthashcol",
  dpname = "dpname",
  bkeys = "bkeys",
  bkey1 = "bkey1",
  bkey2 = "bkey2",
  bkey3 = "bkey3",
  bkey4 = "bkey4",
  bkey5 = "bkey5",
  bkey6 = "bkey6",
  bkey7 = "bkey7",
  bkey8 = "bkey8",
  bkey9 = "bkey9",
  bkey10 = "bkey10",
  createdate = "createdate",
  actions = "actions",
}


interface RtTableProps {
  rts: {
    items: Rt[];
    totalItems: number;
    totalPages: number;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  isTab?: boolean;
}

export function RtTable({
  rts,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  isTab = false
}: RtTableProps) {
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState<Set<RtColumn>>(new Set(Object.values(RtColumn)));

  // Get unique values for filters
  const { projectAssigns } = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (project: string) => {
    return projectAssigns.find(p => p.projectshortname === project)?.is_active || false;
  }
  // console.log('projectAssigns', projectAssigns);
  const uniqueProjects = projectAssigns.length > 0 ? Array.from(new Set(rts.items.map(d => d.projectshortname))).filter(isProjectAssignedAndActive) : [];
  const uniqueDataProducts = Array.from(new Set(
    projectAssigns.length > 0 ? rts.items.filter(d => isProjectAssignedAndActive(d.projectshortname)).map(d => d.dpname) : []
  ));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {!isTab && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Created RT</h2>
        </div>
      )}

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Projects</option>
          {uniqueProjects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>

        <select
          value={selectedDataProduct}
          onChange={(e) => setSelectedDataProduct(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Data Products</option>
          {uniqueDataProducts.map(product => (
            <option key={product} value={product}>{product}</option>
          ))}
        </select>

        {!isTab && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {/* {!isTab && ( */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search RT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* )} */}
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
              {Object.values(RtColumn).filter(c => c !== 'actions' || !isTab).map((column) => (
                <CheckboxItem
                  key={column}
                  checked={visibleColumns.has(column)}
                  onCheckedChange={(checked: boolean) => {
                    const newColumns = new Set(visibleColumns);
                    if (checked) {
                      newColumns.add(column);
                    } else {
                      newColumns.delete(column);
                    }
                    setVisibleColumns(newColumns);
                  }}
                >
                  {column}
                </CheckboxItem>
              ))}
            </div>
          </Dropdown>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.values(RtColumn).filter(column => visibleColumns.has(column) && (column !== 'actions' || !isTab)).map((column) => (
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
            {rts.items.map((rt) => (
              <tr key={rt.tgthashid}>
                {Object.values(RtColumn).filter(column => visibleColumns.has(column)).map((column) => (
                  <td
                    key={`${rt.tgthashid}-${column}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column === RtColumn.tgthashid && rt.tgthashid}
                    {column === RtColumn.projectshortname && rt.projectshortname}
                    {column === RtColumn.tgtdphash && rt.tgtdphash}
                    {column === RtColumn.tgtdataset && rt.tgtdataset}
                    {column === RtColumn.tgttabfields && rt.tgttabfields?.join(', ')}
                    {column === RtColumn.tgthashcol && rt.tgthashcol}
                    {column === RtColumn.dpname && rt.dpname}
                    {column === RtColumn.bkeys && rt.bkeys}
                    {column === RtColumn.bkey1 && rt.bkey1}
                    {column === RtColumn.bkey2 && rt.bkey2}
                    {column === RtColumn.bkey3 && rt.bkey3}
                    {column === RtColumn.bkey4 && rt.bkey4}
                    {column === RtColumn.bkey5 && rt.bkey5}
                    {column === RtColumn.bkey6 && rt.bkey6}
                    {column === RtColumn.bkey7 && rt.bkey7}
                    {column === RtColumn.bkey8 && rt.bkey8}
                    {column === RtColumn.bkey9 && rt.bkey9}
                    {column === RtColumn.bkey10 && rt.bkey10}
                    {column === RtColumn.createdate && formatDate(rt.createdate || '')}
                    {column === RtColumn.actions && !isTab && (
                      <button
                        onClick={() => router.push(`/user/define-rt/edit/${rt.tgthashid}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * 10) + 1} to{' '}
          {Math.min(currentPage * 10, rts.totalItems)} of{' '}
          {rts.totalItems} results
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
            Page {currentPage} of {rts.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(rts.totalPages, currentPage + 1))}
            disabled={currentPage === rts.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 