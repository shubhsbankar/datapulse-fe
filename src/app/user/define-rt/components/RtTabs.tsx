'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset, Rs } from '@/types/userfeat';
import { DatasetsTable } from '../../define-ds/components/DatasetsTable';
import { formatDate } from '@/utils/dateFormatter';
import { RsTable } from '../../define-rss/components/RsTable';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

interface RtTabsProps {
  datasets: {
    items: Dataset[];
    totalItems: number;
    totalPages: number;
  };
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
  selectedDsType: string;
  setSelectedDsType: (type: string) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  onExport: (data: any[], filename: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function RtTabs({
  rss,
  onExport
}: RtTabsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const { projectAssigns } = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (project: string) => {
    return projectAssigns.find(p => p.projectshortname === project)?.is_active || false;
  }
  console.log(rss, selectedDataProduct);

  const getFilteredAndPaginatedItems = (items: any[]) => {
    const filtered = items.filter(item => {
      const isAssigned = isProjectAssignedAndActive(item.projectshortname);
      
      const matchesSearch = Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDateRange = (!startDate || !endDate) ? true :
        new Date(item.createdate) >= new Date(startDate) &&
        new Date(item.createdate) <= new Date(endDate);

      // const matchesDsType = !selectedDsType || item.dsdatatype === selectedDsType;
      const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !selectedDataProduct || item.dpname === selectedDataProduct;
      // const matchesDataset = !selectedDataset || item.datasetshortname === selectedDataset;

      return matchesSearch && matchesDateRange &&
        matchesProject && matchesDataProduct && isAssigned;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };


  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="datasets" className="text-center h-auto whitespace-normal">
            Datasets
          </TabsTrigger>
          <TabsTrigger value="cds" className="text-center h-auto whitespace-normal">
            CDS
          </TabsTrigger>

          <TabsTrigger value="rss" className="text-center h-auto whitespace-normal">
            RSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
            filterCSV1={true}
          />
        </TabsContent>

        <TabsContent value="cds">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
            isCDS={true}
          />
        </TabsContent>


        <TabsContent value="rss">
          <RsTable rss={getFilteredAndPaginatedItems(rss.items)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedDataProduct={selectedDataProduct}
            setSelectedDataProduct={setSelectedDataProduct}
            isTab={true}
          />
          {/* <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSS Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rss.items.map((rs) => (
                  <tr key={rs.srchashid}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rs.projectshortname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rs.dpname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rs.srcdataset}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rs.dpname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(rs.createdate || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 