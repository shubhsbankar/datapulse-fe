'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllProjectAssignmentsAsync } from '@/store/project/projectThunk';
import { getAllDatastoresAsync } from '@/store/datastore/datastoreThunks';
import { Search, Download, ChevronLeft, ChevronRight, Columns } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dropdown, CheckboxItem, Button } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { DatastoreColumn, defaultVisibleColumns } from '@/types/datastore';

const ITEMS_PER_PAGE = 10;

export default function ProjectsAndDatastoresPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectsPage, setProjectsPage] = useState(1);
  const [datastoresPage, setDatastoresPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<DatastoreColumn>>(
    new Set(defaultVisibleColumns)
  );

  const currentUser = useAppSelector(state => state.user.currentUser);
  const projectAssignments = useAppSelector(state => 
    state.project.projectAssigns.filter(pa => 
      pa.useremail === currentUser?.useremail && pa.is_active
    )
  );
  const datastores = useAppSelector(state => 
    state.datastore.datastores.filter(ds => ds.is_valid)
  );

  useEffect(() => {
    dispatch(getAllProjectAssignmentsAsync());
    dispatch(getAllDatastoresAsync());
  }, [dispatch]);

  // Filtering functions
  const filterByDate = (items: any[]) => {
    return items.filter(item => {
      if (!startDate && !endDate) return true;
      const itemDate = new Date(item.createdate);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return itemDate >= start && itemDate <= end;
    });
  };

  const filterBySearch = (items: any[]) => {
    return items.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Apply filters and pagination
  const getFilteredAndPaginatedItems = (items: any[], currentPage: number) => {
    const filtered = filterByDate(filterBySearch(items));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  const filteredProjects = getFilteredAndPaginatedItems(projectAssignments, projectsPage);
  const filteredDatastores = getFilteredAndPaginatedItems(datastores, datastoresPage);

  // CSV Export
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects & Data Stores</h1>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Tabs defaultValue="projects">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Assigned Projects</TabsTrigger>
            <TabsTrigger value="datastores">Available Data Stores</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(projectAssignments, 'projects')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Short Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Assigned
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.items.map((pa) => (
                    <tr key={pa.assignid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pa.projectshortname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pa.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pa.who_added}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(new Date(pa.createdate))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Projects Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((projectsPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(projectsPage * ITEMS_PER_PAGE, filteredProjects.totalItems)} of{' '}
                {filteredProjects.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProjectsPage(prev => Math.max(1, prev - 1))}
                  disabled={projectsPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Page {projectsPage} of {filteredProjects.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProjectsPage(prev => Math.min(filteredProjects.totalPages, prev + 1))}
                  disabled={projectsPage === filteredProjects.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="datastores">
            <div className="mr-10 mb-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(datastores, 'datastores')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
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
                  {Object.entries(DatastoreColumn).map(([key, value]) => (
                    <CheckboxItem
                    key={key}
                    checked={visibleColumns.has(value)}
                    onCheckedChange={(checked: boolean) => {
                      const newColumns = new Set(visibleColumns);
                      if (checked) {
                        newColumns.add(value);
                      } else {
                        newColumns.delete(value);
                      }
                      setVisibleColumns(newColumns);
                    }}
                  >
                    {key}
                  </CheckboxItem>
                  ))}
                </div>
              </Dropdown>
              
            </div>
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
                  {filteredDatastores.items.map((ds) => (
                    <tr key={ds.dsid}>
                      {Array.from(visibleColumns).map((column) => (
                        <td
                          key={`${ds.dsid}-${column}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {column === 'createdate'
                            ? formatDate(ds[column])
                            : column === 'is_valid'
                            ? ds[column] ? 'Valid' : 'Invalid'
                            : ds[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Datastores Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((datastoresPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(datastoresPage * ITEMS_PER_PAGE, filteredDatastores.totalItems)} of{' '}
                {filteredDatastores.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatastoresPage(prev => Math.max(1, prev - 1))}
                  disabled={datastoresPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Page {datastoresPage} of {filteredDatastores.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatastoresPage(prev => Math.min(filteredDatastores.totalPages, prev + 1))}
                  disabled={datastoresPage === filteredDatastores.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}