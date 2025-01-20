'use client';

import { Dtg } from "@/types/userfeat";
import { Search, Download, Columns } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatter';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { useState, useMemo, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

// Define the columns
export enum DtColumn {
  projectshortname = "Project",
  dtid = "DT ID",
  datasettype = "Dataset Type",
  dtshortname = "DT Short Name",
  datasetshortname = "Dataset",
  dataproductshortname = "Data Product",
  datasrcnum = "Data Source Number",
  testcoverageversion = "Version",
  chkfilename = "YAML File",
  comments = "Comments",
  createdate = "Created Date",
}


interface DtTableProps {
  dtgs: Dtg[];
}

export function DtTable({ dtgs }: DtTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<DtColumn>>(new Set(Object.values(DtColumn)));

  const { projectAssigns } = useAppSelector(state => state.project);

  function isProjectActive(project?: string) {
    return projectAssigns.some(p => p.projectshortname === project && p.is_active);
  }

  dtgs = dtgs.filter(dtg => isProjectActive(dtg.projectshortname));

  const uniqueProjects = Array.from(new Set(dtgs.map(d => d.projectshortname))).filter(isProjectActive);
  const uniqueDataProducts = Array.from(new Set(dtgs.filter(d => d.projectshortname == selectedProject).map(d => d.dataproductshortname)));

  const filteredDtgs = useMemo(() => {
    return dtgs.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDateRange = (!startDate || !endDate) ? true :
        new Date(item.createdate || '') >= new Date(startDate) &&
        new Date(item.createdate || '') <= new Date(endDate);

      const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !selectedDataProduct || item.dataproductshortname === selectedDataProduct;

      return matchesSearch && matchesDateRange && matchesProject && matchesDataProduct;
    });
  }, [dtgs, searchTerm, startDate, endDate, selectedProject, selectedDataProduct]);

  const ITEMS_PER_PAGE = 10;
  const totalItems = filteredDtgs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDtgs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDtgs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, selectedProject, selectedDataProduct]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Created DT</h2>
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
              placeholder="Search DTs..."
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
              {Object.values(DtColumn).map((column) => (
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
              {paginatedData.map((dtg) => (
                <tr key={dtg.dtid}>
                  {Array.from(visibleColumns).map((column) => (
                    <td
                      key={`${dtg.dtid}-${column}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column === DtColumn.dtid && dtg.dtid}
                      {column === DtColumn.comments && dtg.comments}
                      {column === DtColumn.datasrcnum && dtg.datasrcnum}
                      {column === DtColumn.dtshortname && dtg.dtshortname}
                      {column === DtColumn.datasettype && dtg.datasettype}
                      {column === DtColumn.chkfilename && dtg.chkfilename}
                      {column === DtColumn.projectshortname && dtg.projectshortname}
                      {column === DtColumn.dataproductshortname && dtg.dataproductshortname}
                      {column === DtColumn.datasetshortname && dtg.datasetshortname}
                      {column === DtColumn.testcoverageversion && dtg.testcoverageversion}
                      {column === DtColumn.createdate && formatDate(dtg.createdate || '')}
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
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
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