'use client';

import { DvBojSg1 } from "@/types/userfeat";
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useEffect, useState } from 'react';

interface DefineSgTableProps {
  sgs: DvBojSg1[];
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
}

enum SgColumns {
  rdvid = 'rdvid',
  projectshortname = 'projectshortname',
  dpname = 'dpname',
  dsname = 'dsname',
  comptype = 'comptype',
  compname = 'compname',
  compsubtype = 'compsubtype',
  sqltext = 'sqltext',
  tenantid = 'tenantid',
  bkcarea = 'bkcarea',
  createdate = 'createdate',
  compshortname = 'compshortname',
  user_email = 'user_email',
  comments = 'comments',
  version = 'version',
  processtype = 'processtype',
  datefieldname = 'datefieldname',
  parts = 'parts',
  partsnum = 'partsnum',
}

export function DefineSgTable({
  sgs,
  // searchTerm,
  // setSearchTerm,
  // currentPage,
  // setCurrentPage,
  // startDate,
  // setStartDate,
  // endDate,
  // setEndDate,
  // selectedProject,
  // setSelectedProject,
}: DefineSgTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<SgColumns>>(
    new Set(Object.values(SgColumns))
  );

  

  sgs = sgs.filter(sg => {
    const matchesSearch = Object.values(sg).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesDateRange = (!startDate || !endDate) ? true : 
      new Date(sg.createdate || '') >= new Date(startDate) && 
      new Date(sg.createdate || '') <= new Date(endDate);
    
    const matchesProject = !selectedProject || sg.projectshortname === selectedProject;

    return matchesSearch && matchesDateRange && matchesProject;
  })
  const totalItems = sgs.length;
  const totalPages = Math.ceil(totalItems / 10);

  const uniqueProjects = Array.from(
    new Set(sgs.map(d => d.projectshortname))
  );

  const toggleColumn = (column: SgColumns) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column);
    } else {
      newVisibleColumns.add(column);
    }
    setVisibleColumns(newVisibleColumns);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
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

      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search SG definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnFilter(!showColumnFilter)}
            className="ml-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Columns
          </Button>
          {showColumnFilter && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {Object.values(SgColumns).map(column => (
                <label key={column} className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column)}
                    onChange={() => toggleColumn(column)}
                    className="mr-2"
                  />
                  {column}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.values(SgColumns).map(column => (
                visibleColumns.has(column) && (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sgs.map((sg) => (
              <tr key={sg.rdvid}>
                {Object.values(SgColumns).map(column => (
                  visibleColumns.has(column) && (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column === 'createdate' 
                        ? formatDate(sg[column] || '') 
                        : column === 'sqltext'
                        ? Array.isArray(sg[column]) ? sg[column].join(', ') : sg[column]
                        : sg[column as keyof DvBojSg1]}
                    </td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * 10) + 1} to{' '}
          {Math.min(currentPage * 10, totalItems)} of{' '}
          {totalItems} results
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
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 