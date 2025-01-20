'use client';

import { Dping } from "@/types/userfeat";
import { Search, Download, Columns } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatter';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

// Define the columns
export enum DpingColumns {
  dpid = "DPing ID",
  dpshortname = "DPing Short Name",
  htmlfilename = "HTML File Name",
  // datasettype = "Dataset Type",
  projectshortname = "Project",
  datasetshortname = "Dataset",
  dataproductshortname = "Data Product",
  createdate = "Created Date",
}


interface DpingTableProps {
  dpings: {
    items: Dping[];
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
}

export function DpingTable({
  dpings,
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
}: DpingTableProps) {
  const { projectAssigns } = useAppSelector(state => state.project);
  function isProjectActive(project?: string) {
    return projectAssigns.some(p => p.projectshortname === project && p.is_active);
  }
  const uniqueProjects = Array.from(new Set(dpings.items.map(d => d.projectshortname))).filter(isProjectActive);
  const uniqueDataProducts = Array.from(new Set(dpings.items.map(d => d.dataproductshortname)));
  const [visibleColumns, setVisibleColumns] = useState<Set<DpingColumns>>(new Set(Object.values(DpingColumns)));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Created Dping</h2>
      </div>


      <div className="flex flex-col space-y-4">
        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search dpings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

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

          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4 mr-2" />
                Columns
              </Button>
            }
            align="start"
          >
            <div className='overflow-y-auto max-h-[200px]'>
              {Object.values(DpingColumns).map((column) => (
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from(visibleColumns).map((column) => (
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
              {dpings.items.filter(item => isProjectActive(item.projectshortname)).map((dping) => (
                <tr key={dping.dpid}>
                  {Array.from(visibleColumns).map((column) => (
                    <td
                      key={`${dping.dpid}-${column}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column === DpingColumns.dpid && dping.dpid}
                      {column === DpingColumns.dpshortname && dping.dpshortname}
                      {column === DpingColumns.htmlfilename && dping.htmlfilename}
                      {/* {column === DpingColumns.datasettype && dping.datasettype} */}
                      {column === DpingColumns.projectshortname && dping.projectshortname}
                      {column === DpingColumns.datasetshortname && dping.datasetshortname}
                      {column === DpingColumns.dataproductshortname && dping.dataproductshortname}
                      {column === DpingColumns.createdate && formatDate(dping.createdate || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {dpings.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(dpings.totalPages, currentPage + 1))}
              disabled={currentPage === dpings.totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 