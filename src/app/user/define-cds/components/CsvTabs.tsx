'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectAssign } from '@/types/project';
import { Datastore, DatastoreColumn } from '@/types/datastore';
import { Button, Dropdown, CheckboxItem } from '@/components/ui/dropdown';
import { Download, Columns, Upload } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatter';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

// Define enum for Project columns
export enum ProjectColumn {
  ProjectShortName = 'Project Short Name',
  Status = 'Status',
  AssignedBy = 'Assigned By',
  DateAssigned = 'Date Assigned'
}

interface CsvTabsProps {
  projectAssignments: {
    items: ProjectAssign[];
    totalItems: number;
    totalPages: number;
  };
  datastores: {
    items: Datastore[];
    totalItems: number;
    totalPages: number;
  };
  visibleColumns: Set<DatastoreColumn>;
  setVisibleColumns: (columns: Set<DatastoreColumn>) => void;
  onExport: (data: any[], filename: string) => void;
}

export function CsvTabs({
  projectAssignments,
  datastores,
  visibleColumns,
  setVisibleColumns,
  onExport
}: CsvTabsProps) {
  const [visibleProjectColumns, setVisibleProjectColumns] = useState<Set<ProjectColumn>>(
    new Set(Object.values(ProjectColumn))
  );
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [s3CredentialsFile, setS3CredentialsFile] = useState<File | null>(null);
  const [gcsCredentialsFile, setGcsCredentialsFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Filter datastores to show only CSV1 type
  const csvDatastores = datastores.items;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      event.target.value = '';
      return;
    }

    const files = event.target.files;
    if (!files) return;

    setSelectedFiles(files);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    formData.append('project_shortname', selectedProject);

    try {
      const response = await fetch('/api/cds/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload files');
    } finally {
      setSelectedFiles(null);
      event.target.value = '';
    }
  };

  const handleS3FileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setS3CredentialsFile(file);
    }
  };

  const handleGCSFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setGcsCredentialsFile(file);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast.error('Please select a project first');
      return;
    }

    try {
      const formData = new FormData();
      
      if (s3CredentialsFile) {
        formData.append('s3_credentials', s3CredentialsFile);
      }
      
      if (gcsCredentialsFile) {
        formData.append('gcs_credentials', gcsCredentialsFile);
      }

      formData.append('project_shortname', selectedProject);

      const response = await fetch('/api/cds/credentials', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to save credentials');
      toast.success('Credentials saved successfully');
      
      // Reset form
      setS3CredentialsFile(null);
      setGcsCredentialsFile(null);
      
      // Reset file inputs
      const s3Input = document.getElementById('s3-credentials') as HTMLInputElement;
      const gcsInput = document.getElementById('gcs-credentials') as HTMLInputElement;
      if (s3Input) s3Input.value = '';
      if (gcsInput) gcsInput.value = '';
      
    } catch (error) {
      console.error('Failed to save credentials:', error);
      toast.error('Failed to save credentials');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="projects" className="text-center h-auto whitespace-normal">Assigned Projects</TabsTrigger>
          <TabsTrigger value="datastores" className="text-center h-auto whitespace-normal">Available DS</TabsTrigger>
          <TabsTrigger value="upload" className="text-center h-auto whitespace-normal">CSV Upload</TabsTrigger>
          <TabsTrigger value="credentials" className="text-center h-auto whitespace-normal">Credentials</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="mb-4 flex justify-between">
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
                {Object.entries(ProjectColumn).map(([key, value]) => (
                  <CheckboxItem
                    key={key}
                    checked={visibleProjectColumns.has(value)}
                    onCheckedChange={(checked: boolean) => {
                      const newColumns = new Set(visibleProjectColumns);
                      if (checked) {
                        newColumns.add(value);
                      } else {
                        newColumns.delete(value);
                      }
                      setVisibleProjectColumns(newColumns);
                    }}
                  >
                    {value}
                  </CheckboxItem>
                ))}
              </div>
            </Dropdown>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(projectAssignments.items, 'projects')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from(visibleProjectColumns).map((column) => (
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
                {projectAssignments.items.map((pa) => (
                  <tr key={pa.assignid}>
                    {Array.from(visibleProjectColumns).map((column) => (
                      <td
                        key={`${pa.assignid}-${column}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column === ProjectColumn.ProjectShortName && pa.projectshortname}
                        {column === ProjectColumn.Status && (pa.is_active ? 'Active' : 'Inactive')}
                        {column === ProjectColumn.AssignedBy && pa.who_added}
                        {column === ProjectColumn.DateAssigned && formatDate(pa.createdate)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Datastores Tab */}
        <TabsContent value="datastores">
          <div className="mb-4 flex justify-between">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(csvDatastores, 'datastores')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
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
                {csvDatastores.map((ds) => (
                  <tr key={ds.dsid}>
                    {Array.from(visibleColumns).map((column) => (
                      <td
                        key={`${ds.dsid}-${column}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column === 'createdate'
                          ? formatDate(ds[column] || '')
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
        </TabsContent>

        {/* CSV Upload Tab */}
        <TabsContent value="upload">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Please upload files with filenames exactly as mentioned in the form
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a project...</option>
                {projectAssignments.items.map((pa) => (
                  <option key={pa.assignid} value={pa.projectshortname}>
                    {pa.projectshortname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload CSV Files/Folder
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                accept=".csv"
                disabled={!selectedProject}
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
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Please upload files with filenames exactly as mentioned in the form
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a project...</option>
                {projectAssignments.items.map((pa) => (
                  <option key={pa.assignid} value={pa.projectshortname}>
                    {pa.projectshortname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                AWS S3 Credentials JSON
              </label>
              <div className="mt-1">
                <input
                  id="s3-credentials"
                  type="file"
                  accept=".json"
                  onChange={handleS3FileChange}
                  disabled={!selectedProject}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {s3CredentialsFile && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected file: {s3CredentialsFile.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                GCS Credentials JSON
              </label>
              <div className="mt-1">
                <input
                  id="gcs-credentials"
                  type="file"
                  accept=".json"
                  onChange={handleGCSFileChange}
                  disabled={!selectedProject}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {gcsCredentialsFile && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected file: {gcsCredentialsFile.name}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!selectedProject || (!s3CredentialsFile && !gcsCredentialsFile)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Credentials
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 