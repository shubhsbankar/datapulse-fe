'use client';

import { useState } from 'react';
import { RdvCompDl } from "@/types/userfeat";
import { Search, ChevronLeft, ChevronRight, Columns } from 'lucide-react';
import { Button, CheckboxItem, Dropdown } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useAppSelector } from '@/store/hooks';

const ITEMS_PER_PAGE = 10;

interface DlTableProps {
  dls: RdvCompDl[];
  isTabView?: boolean;
}


// -- CREATE TABLE IF NOT EXISTS tst1a.rdvcompdl
// -- (
// --     rdvid serial,
// --     projectshortname character varying(40) COLLATE pg_catalog."default" NOT NULL,
// --     dpname character varying(150) COLLATE pg_catalog."default",
// --     dsname character varying(40) COLLATE pg_catalog."default" NOT NULL,
// --     comptype character varying(14) COLLATE pg_catalog."default",
// --     compname character varying(40) COLLATE pg_catalog."default" NOT NULL,
// --     compkeyname character varying(50) COLLATE pg_catalog."default" NOT NULL,
// --     hubnums integer,
// --     hubnum integer,
// --     hubname character varying(40) COLLATE pg_catalog."default" NOT NULL,
// --     hubversion numeric (5, 2), 
// --     bkfields text[] COLLATE pg_catalog."default",
// --     degen character varying(5) COLLATE pg_catalog."default",    
// --     degenids text[] COLLATE pg_catalog."default",
// --     tenantid character varying(50) COLLATE pg_catalog."default" NOT NULL,
// --     bkcarea character varying(50) COLLATE pg_catalog."default" NOT NULL,    
// --     createdate timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
// --     user_email character varying(100) COLLATE pg_catalog."default",   
// -- -- >> compshortname is the concat of projectshortname, dpname, dsname, compname, version
// --     compshortname character varying(255) COLLATE pg_catalog."default",
// --     version numeric (5, 2),
// --     CONSTRAINT rdvcompdl_pkey PRIMARY KEY (projectshortname, dpname, dsname, compname, hubname, version)
// -- );

enum DlTableColumns {
  // all columns
  projectshortname = 'Project',
  dpname = 'Data Product',
  dsname = 'Dataset',
  compname = 'Component Name',
  comptype = 'Component Type',
  degen = 'Degen',
  degenids = 'Degen IDs',
  hubnums = 'Hub Count',
  hubnum = 'Hub Number',
  hubname = 'Hub Name',
  hubversion = 'Hub Version',
  bkfields = 'BK Fields',
  tenantid = 'Tenant ID',
  bkcarea = 'BKC Area',
  user_email = 'User Email',
  compshortname = 'Component Short Name',
  version = 'Version',
  createdate = 'Created Date',
}

export function DlTable({ dls, isTabView = false }: DlTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDp, setSelectedDp] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<DlTableColumns>>(new Set(Object.values(DlTableColumns).filter(c => !isTabView)));
  const {projectAssigns} = useAppSelector(state => state.project);
  // Filter logic
  const filteredDls = dls.filter(item => {
    const isAssigned = projectAssigns.some(assign => (assign.projectshortname === item.projectshortname && assign.is_active));

    const matchesSearch = Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDateRange = (!startDate || !endDate) ? true :
      new Date(item.createdate || '') >= new Date(startDate) &&
      new Date(item.createdate || '') <= new Date(endDate);

    const matchesProject = !selectedProject || item.projectshortname === selectedProject;
    const matchesDp = !selectedDp || item.dpname === selectedDp;

    return matchesSearch && matchesDateRange && matchesProject && matchesDp && isAssigned;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDls = filteredDls.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDls.length / ITEMS_PER_PAGE);

  const uniqueProjects = Array.from(new Set(dls.map(d => d.projectshortname)));
  const uniqueDp = Array.from(new Set(dls.map(d => d.dpname)));
  console.log(Object.values(DlTableColumns))

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

        <select
          value={selectedDp}
          onChange={(e) => setSelectedDp(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All DPs</option>
          {uniqueDp.map(dp => (
            <option key={dp} value={dp}>{dp}</option>
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
            placeholder="Search DL components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
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
          {Object.values(DlTableColumns).map((column) => (
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hub Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th> */}
              {Object.values(DlTableColumns).filter(c => visibleColumns.has(c)).map((column) => (
                <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* {paginatedDls.map((dl) => (
              <tr key={dl.rdvid}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.projectshortname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.dpname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.dsname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.compname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.degen ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.hubnums}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dl.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(dl.createdate || '')}
                </td>
              </tr>
            ))} */}
            {paginatedDls.map((dl) => (
              <tr key={dl.rdvid}>
                {Object.keys(DlTableColumns).filter(c => visibleColumns.has(DlTableColumns[c])).map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column === DlTableColumns.createdate
                      ? formatDate(dl[column] as string)
                      :
                      Array.isArray(dl[column]) ? (dl[column] as string[]).join(', ') :
                        dl[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredDls.length)} of{' '}
          {filteredDls.length} results
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