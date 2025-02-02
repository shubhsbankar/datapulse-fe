'use client';

import { Dataset } from '@/types/userfeat';
import { Search, Download, ChevronLeft, ChevronRight, Columns } from 'lucide-react';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

const ITEMS_PER_PAGE = 10;

export enum LandingDatasetColumn {
  Dlid = 'dlid',
  ProjectShortName = 'projectshortname',
  SrcDataProductShortName = 'srcdataproductshortname',
  SrcDatasetShortName = 'srcdatasetshortname',
  LndDataProductShortName = 'lnddataproductshortname',
  LndDatasetShortName = 'lnddatasetshortname',
  LndDsShortName = 'lnddsshortname',
  CreateDate = 'createdate',
  UserEmailId = 'useremailid',
  Comments = 'comments'
}

interface LandingDatasetsTableProps {
  onExport: (data: any[], filename: string) => void;
  isTabView?: boolean;
  isCDS?: boolean;
  filterCSV1?: boolean;
}

export function LandingDatasetsTable({
  onExport,
  isCDS = false,
  isTabView = false,
  filterCSV1 = false
}: LandingDatasetsTableProps) {
  const router = useRouter();
  let datasets = useAppSelector(state => state.userfeat.lnddataset);
  const { projectAssigns } = useAppSelector(state => state.project);
  function isProjectActive(project: string) {
    return projectAssigns.some(assign => assign.projectshortname === project && assign.is_active);
  }
  datasets = datasets.filter(ds => isProjectActive(ds.projectshortname));
  // if (isCDS) {
  //   datasets = datasets.filter(ds => ds.datastoreshortname === 'CSV1');
  // }
  // if (filterCSV1) {
  //   datasets = datasets.filter(ds => ds.datastoreshortname !== 'CSV1');
  // }

  // Move state management into the component
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDsType, setSelectedDsType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<LandingDatasetColumn>>(new Set(Object.values(LandingDatasetColumn).filter(c => !isTabView || c !== LandingDatasetColumn.actions)));


  console.log({selectedProject});


  // Get unique values for filters
  const uniqueProjects = Array.from(new Set(datasets.map(d => d.projectshortname))).filter(isProjectActive);
  const uniqueDataProducts = Array.from(new Set(datasets.filter(ds => {
    if (selectedProject) {
      return ds.projectshortname === selectedProject;
    }
    return true;
  }).map(d => d.srcdataproductshortname)))
  const datastores = useAppSelector(state => state.datastore.datastores);

  // Filter and pagination logic
  const getFilteredAndPaginatedItems = () => {
    const filtered = datasets.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDateRange = (!startDate || !endDate) ? true :
        new Date(item.createdate || '') >= new Date(startDate) &&
        new Date(item.createdate || '') <= new Date(endDate);

      // const matchesDsType = !selectedDsType || item.dsdatatype === selectedDsType;
      // const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      // const matchesDataProduct = !selectedDataProduct || item.dataproductshortname === selectedDataProduct;

 
      return matchesSearch && matchesDateRange /*&& matchesDsType &&
        matchesProject && matchesDataProduct*/;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  const filteredData = getFilteredAndPaginatedItems();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, selectedDsType, selectedProject, selectedDataProduct]);

  const getDSType = (datastoreshortname: string) => {
    const datastore = datastores.find(ds => ds.dsshortname === datastoreshortname);
    return datastore?.dstype;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {!isTabView && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Created DS</h2>
        </div>
      )}

      <div className='flex gap-4 mb-4 flex-wrap'>
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

        {!isTabView && (
          <>
            <select
              value={selectedDsType}
              onChange={(e) => setSelectedDsType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="Daily">Daily</option>
              <option value="NA">NA</option>
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
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search datasets..."
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
              {Object.values(LandingDatasetColumn).filter(c => !isTabView).map((column) => (
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
        {!isTabView && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(filteredData.items, 'datasets')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.values(LandingDatasetColumn).filter(column => visibleColumns.has(column)).map((column) => (
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
            {filteredData.items.map((dataset) => (
              <tr key={dataset.dlid}>
                {Object.values(LandingDatasetColumn).filter(column => visibleColumns.has(column)).map((column) => (
                  <td
                    key={`${dataset.dlid}-${column}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column === LandingDatasetColumn.Dlid && dataset.dlid}
                    {column === LandingDatasetColumn.ProjectShortName && dataset.projectshortname}
                    {column === LandingDatasetColumn.SrcDataProductShortName && dataset.srcdataproductshortname}
                    {column === LandingDatasetColumn.SrcDatasetShortName && dataset.srcdatasetshortname}
                    {column === LandingDatasetColumn.LndDataProductShortName && dataset.lnddataproductshortname}
                    {column === LandingDatasetColumn.LndDatasetShortName && dataset.lnddatasetshortname}
                    {column === LandingDatasetColumn.LndDsShortName && dataset.lnddsshortname}
                    {column === LandingDatasetColumn.CreateDate && formatDate(dataset.createdate || '')}
                    {column === LandingDatasetColumn.UserEmailId && (dataset.useremailid ? 'Valid' : 'Invalid')}
                    {column === LandingDatasetColumn.Comments && dataset.comments}
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
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.totalItems)} of{' '}
          {filteredData.totalItems} results
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
            Page {currentPage} of {filteredData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(filteredData.totalPages, currentPage + 1))}
            disabled={currentPage === filteredData.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 