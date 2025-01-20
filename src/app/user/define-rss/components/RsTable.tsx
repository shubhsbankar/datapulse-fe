'use client';

import { Rs } from '@/types/userfeat';
import { Search, ChevronLeft, ChevronRight, Pencil, Columns } from 'lucide-react';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export enum RsColumn {
  srchashid = "srchashid",
  projectshortname = "projectshortname",
  srcdphash = "srcdphash",
  srcdataset = "srcdataset",
  srctabfields = "srctabfields",
  srchashcol = "srchashcol",
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
  Actions = "Actions",
}

interface RsTableProps {
  rss: {
    items: Rs[];
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

export function RsTable({
  rss,
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
  isTab=false,
}: RsTableProps) {
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState<Set<RsColumn>>(new Set(Object.values(RsColumn)));
  const {projectAssigns} = useAppSelector(state => state.project);
  function isProjectActive(project?: string) {
    return projectAssigns.some(p => p.projectshortname === project && p.is_active);
  }
  // Get unique values for filters
  rss.items = rss.items.filter(rs => isProjectActive(rs.projectshortname));
  const uniqueProjects = Array.from(new Set(rss.items.map(d => d.projectshortname)));
  // console.log({uniqueProjects})
  const uniqueDataProducts = Array.from(new Set(rss.items.map(d => d.dpname)));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {!isTab && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Created RSS</h2>
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
              placeholder="Search RSS..."
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
              {Object.values(RsColumn).filter(c => c !== 'Actions' || !isTab).map((column) => (
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
              {Object.values(RsColumn).filter(column => visibleColumns.has(column) && (column !== 'Actions' || !isTab)).map((column) => (
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
            {rss.items.map((rs) => (
              <tr key={rs.srchashid}>
                {Object.values(RsColumn).filter(column => visibleColumns.has(column)).map((column) => (
                  <td
                    key={`${rs.srchashid}-${column}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column === RsColumn.srchashid && rs.srchashid}
                    {column === RsColumn.projectshortname && rs.projectshortname}
                    {column === RsColumn.srcdphash && rs.srcdphash}
                    {column === RsColumn.srcdataset && rs.srcdataset}
                    {column === RsColumn.srctabfields && rs.srctabfields?.join(', ')}
                    {column === RsColumn.srchashcol && rs.srchashcol}
                    {column === RsColumn.dpname && rs.dpname}
                    {column === RsColumn.bkeys && rs.bkeys}
                    {column === RsColumn.bkey1 && rs.bkey1}
                    {column === RsColumn.bkey2 && rs.bkey2}
                    {column === RsColumn.bkey3 && rs.bkey3}
                    {column === RsColumn.bkey4 && rs.bkey4}
                    {column === RsColumn.bkey5 && rs.bkey5}
                    {column === RsColumn.bkey6 && rs.bkey6}
                    {column === RsColumn.bkey7 && rs.bkey7}
                    {column === RsColumn.bkey8 && rs.bkey8}
                    {column === RsColumn.bkey9 && rs.bkey9}
                    {column === RsColumn.bkey10 && rs.bkey10}
                    {column === RsColumn.createdate && formatDate(rs.createdate || '')}
                    {column === RsColumn.Actions && !isTab && (
                      <button
                        onClick={() => router.push(`/user/define-rss/edit/${rs.srchashid}`)}
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
          {Math.min(currentPage * 10, rss.totalItems)} of{' '}
          {rss.totalItems} results
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
            Page {currentPage} of {rss.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(rss.totalPages, currentPage + 1))}
            disabled={currentPage === rss.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 