'use client';

import { DvCompBrg } from "@/types/userfeat";
import { Search, ChevronLeft, ChevronRight, Filter, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ITEMS_PER_PAGE = 10;

interface BrgTableProps {
  sgs: DvCompBrg[];
}

// -- CREATE TABLE IF NOT EXISTS tst1a.dvcompsg1
// -- (
// --     rdvid serial,
// --     projectshortname character varying(40) COLLATE pg_catalog."default" NOT NULL,
// --     dpname character varying(50) COLLATE pg_catalog."default",
// --     dsname character varying(40) COLLATE pg_catalog."default",
// --     comptype character varying(14) COLLATE pg_catalog."default" NOT NULL,
// --     compname character varying(40) COLLATE pg_catalog."default" NOT NULL,
// --     compsubtype character varying(30) COLLATE pg_catalog."default" NOT NULL,
// --     sqltext text[] COLLATE pg_catalog."default",
// --     tenantid character varying(50) COLLATE pg_catalog."default",
// --     bkcarea character varying(50) COLLATE pg_catalog."default",    
// --     createdate timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
// -- -- >> compshortname is the concat of projectshortname, comptype, compname
// --     compshortname character varying(255) COLLATE pg_catalog."default",
// --     user_email character varying(100) COLLATE pg_catalog."default",
// --     comments character varying(255) COLLATE pg_catalog."default",
// --     version numeric (5, 2),
// --     processtype character varying(50) COLLATE pg_catalog."default",
// --     datefieldname character varying(50) COLLATE pg_catalog."default",  
// --     CONSTRAINT dvcompsg1_pkey PRIMARY KEY (projectshortname, comptype, compname)
// -- );

export enum BrgColumns {
  // rdvid = 'rdvid',
  // projectshortname = 'projectshortname',
  // dpname = 'dpname',
  // dsname = 'dsname',
  // comptype = 'comptype',
  // compname = 'compname',
  // compsubtype = 'compsubtype',
  // sqltext = 'sqltext',
  // tenantid = 'tenantid',
  // bkcarea = 'bkcarea',
  // createdate = 'createdate',
  // compshortname = 'compshortname',
  // user_email = 'user_email',
  // comments = 'comments',
  // version = 'version',
  // processtype = 'processtype',
  // datefieldname = 'datefieldname',
  // // actions = 'Actions',
  // partsnum = 'partsnum',
  // parts = 'parts',
  dvid = 'dvid',
  projectshortname = 'projectshortname',
  comptype = 'comptype',
  compname = 'compname',
  compsubtype = 'compsubtype',
  sqltext = 'sqltext',
  createdate = 'createdate',
  compshortname = 'compshortname',
  user_email = 'user_email',
  comments = 'comments',
  processtype = 'processtype',
  datefieldname = 'datefieldname',
  bkfields = 'bkfields',
  // actions = 'Actions',

}

export function BrgTable({ sgs }: BrgTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<SgColumns>>(
    new Set([...Object.values(BrgColumns), BrgColumns.actions])
  );

  // Filter logic
  const filteredSgs = sgs.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesDateRange = (!startDate || !endDate) ? true : 
      new Date(item.createdate || '') >= new Date(startDate) && 
      new Date(item.createdate || '') <= new Date(endDate);
    
    const matchesProject = !selectedProject || item.projectshortname === selectedProject;

    return matchesSearch && matchesDateRange && matchesProject;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBrgs = filteredSgs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredSgs.length / ITEMS_PER_PAGE);

  const uniqueProjects = Array.from(new Set(sgs.map(d => d.projectshortname)));

  const toggleColumn = (column: BrgColumns) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column);
    } else {
      newVisibleColumns.add(column);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const handleUpdateClick = (rdvid: number) => {
    router.push(`/user/config-sg/edit/${rdvid}`);
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
            placeholder="Search SG components..."
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
              {Object.values(BrgColumns).map(column => (
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
              {Object.values(BrgColumns).map(column => (
                visibleColumns.has(column) && (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                )
              ))}
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedBrgs.map((brg) => (
              <tr key={brg.dvid}>
                {Object.values(BrgColumns).map(column => (
                  visibleColumns.has(column) && (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column === BrgColumns.createdate
                      ? formatDate(brg[column] as string)
                      :
                      Array.isArray(brg[column as keyof DvCompBrg]) 
                        ? (brg[column as keyof DvCompBrg] as string[]).join(', ') 
                        : brg[column as keyof DvCompBrg]}
                  </td>
                  )
                ))}
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => handleUpdateClick(sg.rdvid || 0)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredSgs.length)} of{' '}
          {filteredSgs.length} results
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