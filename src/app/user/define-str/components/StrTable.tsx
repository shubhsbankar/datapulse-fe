'use client';

import { Str } from "@/types/userfeat";
import { Search, Columns } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatter';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { useState } from 'react';

export const StrColumns = [
  'Project',
  'Source-Target Hash',
  'Source Hash', 
  'Target Hash',
  'Type',
  'Data',
  'Field',
  'HR Exec',
  'Created Date',
  'RTBkeys',
  'RSBkeys',
] as const;

export type StrColumn = typeof StrColumns[number];

interface StrTableProps {
  str: {
    items: Str[];
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

export function StrTable({
  str,
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
}: StrTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Set<StrColumn>>(new Set(StrColumns));
  const uniqueProjects = Array.from(new Set(str.items.map(d => d.projectshortname)));
  const uniqueDataProducts = Array.from(new Set(str.items.map(d => d.srctgthash.split('-')[0])));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col space-y-4">
        {/* Filters */}
        <div className="flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search STR records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

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
              {StrColumns.map((column) => (
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {StrColumns.filter(column => visibleColumns.has(column)).map((column) => (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {str.items.map((record) => (
                <tr key={record.srctgthashid}>
                  {visibleColumns.has('Project') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.projectshortname}</td>
                  )}
                  {visibleColumns.has('Source-Target Hash') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.srctgthash}</td>
                  )}
                  {visibleColumns.has('Source Hash') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.srchash}</td>
                  )}
                  {visibleColumns.has('Target Hash') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.tgthash}</td>
                  )}
                  {visibleColumns.has('Type') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.rtype}</td>
                  )}
                  {visibleColumns.has('Data') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.rdata}</td>
                  )}
                  {visibleColumns.has('Field') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.rfield}</td>
                  )}
                  {visibleColumns.has('HR Exec') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.hr_exec}</td>
                  )}
                  {visibleColumns.has('Created Date') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.createdate ? formatDate(record.createdate) : ''}
                    </td>
                  )}
                  {visibleColumns.has('RTBkeys') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.rtbkeys}
                    </td>
                  )}
                  {visibleColumns.has('RSBkeys') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.rsbkeys}
                    </td>
                  )}
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
              Page {currentPage} of {str.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(str.totalPages, currentPage + 1))}
              disabled={currentPage === str.totalPages}
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