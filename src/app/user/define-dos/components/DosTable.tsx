'use client';

import { useState } from 'react';
import { RdvBojDs } from "@/types/userfeat";
import { Search, ChevronLeft, ChevronRight, Columns } from 'lucide-react';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

const ITEMS_PER_PAGE = 10;

export enum DosColumn {
  projectshortname = "Project Short Name",
  dpname = "Data Product Name",
  dsname = "Dataset Name",
  comptype = "Component Type",
  compname = "Component Name",
  compshortname = "Component Short Name",
  satlnums = "Satellite Numbers",
  satlnum = "Satellite Number",
  satlname = "Satellite Name",
  satlversion = "Satellite Version",
  tenantid = "Tenant ID",
  bkcarea = "BKC Area",
  user_email = "User Email",
  comments = "Comments",
  version = "Version",
  createdate = "Created Date",
  // actions = "Actions"
}

interface DosTableProps {
  dos: RdvBojDs[];
}

export function DosTable({ dos }: DosTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(Object.values(DosColumn)));
  const { projectAssigns } = useAppSelector(state => state.project);

  function isProjectActive(project: string) {
    return projectAssigns.find(pa => pa.projectshortname === project)?.is_active;
  }

  // Filter logic
  const filteredDos = dos.filter(item => {
    const isAssigned = projectAssigns.some(assign => (assign.projectshortname === item.projectshortname && assign.is_active));

    const matchesSearch = Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesDateRange = (!startDate || !endDate) ? true : 
      new Date(item.createdate || '') >= new Date(startDate) && 
      new Date(item.createdate || '') <= new Date(endDate);
    
    const matchesProject = !selectedProject || item.projectshortname === selectedProject;
    const matchesDataProduct = !selectedDataProduct || item.dpname === selectedDataProduct;

    return matchesSearch && matchesDateRange && matchesProject && matchesDataProduct && isAssigned;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDos = filteredDos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDos.length / ITEMS_PER_PAGE);

  const uniqueProjects = Array.from(new Set(dos.map(d => d.projectshortname))).filter(a => isProjectActive(a));
  const uniqueDataProducts = Array.from(new Set(dos.map(d => d.dpname)));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Created DOS Components</h2>
      </div>
      
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
            placeholder="Search DOS components..."
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
        >
          <div className="w-48 bg-white rounded-md shadow-lg py-1">
            {Object.values(DosColumn).map((column) => (
              <CheckboxItem
                key={column}
                checked={visibleColumns.has(column)}
                onCheckedChange={(checked) => {
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.entries(DosColumn).map(([key, value]) => (
                visibleColumns.has(value) && (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {value}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedDos.map((item) => (
              <tr key={item.rdvid}>
                {Object.entries(DosColumn).map(([key, value]) => (
                  visibleColumns.has(value) && (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key === 'createdate' ? formatDate(item[key] || '') :
                       key === 'actions' ? (
                        <button
                          onClick={() => router.push(`/user/update-dos/${item.rdvid}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Update
                        </button>
                       ) : 
                       item[key as keyof RdvBojDs]}
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
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredDos.length)} of{' '}
          {filteredDos.length} results
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