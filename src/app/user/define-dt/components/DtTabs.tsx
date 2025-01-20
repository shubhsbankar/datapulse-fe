'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dataset } from '@/types/userfeat';
import { Button } from '@/components/ui/dropdown';
import { Download, Upload } from 'lucide-react';
import { DatasetsTable } from '../../define-ds/components/DatasetsTable';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';

interface DtTabsProps {
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

export function DtTabs({
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
}: DtTabsProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProject, setUploadProject] = useState<string>('');

  const projects = Array.from(
    new Set(datasets.items.map((d) => d.projectshortname))
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !uploadProject) {
      toast.error('Please select a project first');
      return;
    }
    for(const file of files){
      if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')){
        toast.error('Please upload only YAML files');
        return;
      }
      if (!file.name.startsWith(uploadProject)){
        toast.error('Please upload files with the project shortname as the prefix');
        return;
      }
    }
    setSelectedFiles(files);
    const formData = new FormData();
    formData.append('project_shortname', uploadProject);
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/dt/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      toast.success('YAML files uploaded successfully');
      setSelectedFiles(null);
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload YAML files');
    }
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
          <TabsTrigger value="upload" className="text-center h-auto whitespace-normal">
            Upload YAML
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
        <TabsContent value="upload">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={uploadProject}
                onChange={(e) => setUploadProject(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm text-blue-600 mb-4">
                Please upload YAML files with filenames as shown in the form above
              </p>
              <label className="block text-sm font-medium text-gray-700">
                Upload YAML Files
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                accept=".yaml,.yml"
                disabled={!uploadProject}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {selectedFiles && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Selected files: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                </p>
              </div>
            )}
            {!uploadProject && (
              <p className="text-sm text-amber-600">
                Please select a project before uploading files
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 