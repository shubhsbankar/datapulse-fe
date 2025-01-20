'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RsTable } from '../../define-rss/components/RsTable';
import { RtTable } from '../../define-rt/components/RtTable';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

const ITEMS_PER_PAGE = 10;

export function StrTabs() {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataProduct, setSelectedDataProduct] = useState('');
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);

  // Get data from Redux store
  const rss = useAppSelector(state => state.userfeat.rs);
  const rts = useAppSelector(state => state.userfeat.rt);

  // Filter and pagination logic
  const getFilteredAndPaginatedItems = (items: any[]) => {
    const filtered = items.filter(item => {
      const matchesSearch = Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesDateRange = (!startDate || !endDate) ? true : 
        new Date(item.createdate) >= new Date(startDate) && 
        new Date(item.createdate) <= new Date(endDate);
      
      const matchesProject = !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !selectedDataProduct || item.dpname === selectedDataProduct;

      return matchesSearch && matchesDateRange && matchesProject && matchesDataProduct && isProjectAssignedAndActive(item.projectshortname);
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return {
      items: filtered,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  };

  const filteredRss = getFilteredAndPaginatedItems(rss);
  const filteredRts = getFilteredAndPaginatedItems(rts);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="rs">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="rs" className="text-center h-auto whitespace-normal">
            RS
          </TabsTrigger>
          <TabsTrigger value="rt" className="text-center h-auto whitespace-normal">
            RT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rs">
          <RsTable
            rss={filteredRss}
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
        </TabsContent>

        <TabsContent value="rt">
          <RtTable
            rts={filteredRts}
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
        </TabsContent>
      </Tabs>
    </div>
  );
} 