"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dataset } from "@/types/userfeat";
import { Button } from "@/components/ui/dropdown";
import { Download } from "lucide-react";
import { DatasetColumn, DatasetsTable } from "../../define-ds/components/DatasetsTable";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface DpingTabsProps {
  datasets: {
    items: Dataset[];
    totalItems: number;
    totalPages: number;
  };
  cdsDatasets: {
    items: Dataset[];
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

export function DpingTabs({
  datasets,
  cdsDatasets,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedDsType,
  setSelectedDsType,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  onExport,
}: DpingTabsProps) {
  const [filterByProject, setFilterByProject] = useState(false);
  const [filterByDataProduct, setFilterByDataProduct] = useState(false);


  // Get unique project names for download tab and filtering
  let uniqueProjects = Array.from(
    new Set([
      ...datasets.items.map((d) => d.projectshortname),
      ...cdsDatasets.items.map((d) => d.projectshortname),
    ])
  );

  const { projectAssigns } = useAppSelector((state) => state.project);

  uniqueProjects = uniqueProjects.filter((project) => {
    const projectAssign = projectAssigns.find((pa) => pa.projectshortname === project);
    return projectAssign && projectAssign.is_active;
  });


  const [filename, setFilename] = useState<string>('');

  // Filter datasets based on selected filters
  const getFilteredDatasets = (items: Dataset[]) => {
    return items.filter(item => {
      const matchesProject = !filterByProject || item.projectshortname === selectedProject;
      const matchesDataProduct = !filterByDataProduct || item.dataproductshortname === selectedDataProduct;
      return matchesProject && matchesDataProduct;
    });
  };

  // Create filtered versions of datasets
  const filteredRegularDatasets = {
    ...datasets,
    items: getFilteredDatasets(datasets.items)
  };

  const filteredCdsDatasets = {
    ...cdsDatasets,
    items: getFilteredDatasets(cdsDatasets.items)
  };

  const handleDownload = async (projectId: string, filename: string) => {
    try {
      const response = await fetch(`/api/dping/download/a/a?projectId=${projectId}&filename=${filename}`);
      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to download files");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Files downloaded successfully");
    } catch (error: any) {
      console.error("Download failed:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger
            value="datasets"
            className="text-center h-auto whitespace-normal"
          >
            Datasets
          </TabsTrigger>
          <TabsTrigger
            value="cds"
            className="text-center h-auto whitespace-normal"
          >
            CDS
          </TabsTrigger>
          <TabsTrigger
            value="download"
            className="text-center h-auto whitespace-normal"
          >
            Download HTML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
          // visibleColumns={visibleColumnsDS}
            filterCSV1={true}
            // setVisibleColumns={setVisibleColumnsDS}
          />
        </TabsContent>

        <TabsContent value="cds">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
            isCDS={true}
          // visibleColumns={visibleColumnsCDS}
          // setVisibleColumns={setVisibleColumnsCDS}
          />
        </TabsContent>

        <TabsContent value="download">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="projectSelect"
                className="block text-sm font-medium text-gray-700"
              >
                Select Project
              </label>
              <select
                id="projectSelect"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select Project</option>
                {uniqueProjects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter filename (.html)"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <Button
              onClick={() => selectedProject && filename && handleDownload(selectedProject, filename)}
              disabled={!selectedProject || !filename}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              Download HTML Files
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
