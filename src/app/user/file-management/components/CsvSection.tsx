'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { uploadCSVAsync } from '@/store/user/userThunks';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";
import { isSuccessful } from '@/utils/helpers';

interface CsvSectionProps {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
}

export function CsvSection({ selectedProject, setSelectedProject }: CsvSectionProps) {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<FileList | null>(null);
  const [tableName, setTableName] = useState('');
  const [timestamp, setTimestamp] = useState('');
  let projects = useAppSelector((state) => state.project.projects);
  const projectsAssigns = useAppSelector((state) => state.project.projectAssigns.filter(pa => pa.useremail === state.user.currentUser.useremail));

  console.log(projectsAssigns, projects);

  projects = projects.filter(project => projectsAssigns.some(pa => pa.projectshortname === project.projectshortname && pa.is_active));



  const handleUpload = async () => {
    
    if (!files || !tableName || !selectedProject) {
      toast.error('Please select files, table name, and project');
      return;
    }
    if (files?.length !== 1 || files[0].name !== tableName + '.csv') {
        toast.error('Please upload a file with the same name as the table name');
        return;
    }
    
    if (!['projects', 'datastore', 'datasets', 'dping', 'dtg', 'rs', 'rt', 'str', 'tenantbkcc', 'rdvcompdh', 'rdvcompds', 'rdvcompdl', 'rdvbojds', 'dvcompsg1', 'dvbojsg1'].some(t=>tableName.startsWith(t))){
      toast.error('Invalid table name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('project_shortname', selectedProject);
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('/api/file-management/csv/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }
      

      for (const file of Array.from(files)) {
        const resp = await dispatch(uploadCSVAsync({
          file: file,
          tablename: tableName,
          project_shortname: selectedProject
        })).unwrap();
        console.log(resp);
        if (!isSuccessful(resp?.status)) {
          toast.error(resp?.message || 'Failed to upload files');
          setFiles(null);
          return;
        }
      }

      toast.success('Files uploaded and table populated successfully');
      setFiles(null);
      setTableName('');
    } catch (error:any) {
      console.error(error);
      toast.error(error?.message || 'Failed to process files');
    }
  };

  const handleDownload = async () => {
    if (!selectedProject || !timestamp) {
      toast.error('Please select project and timestamp');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('project_id', selectedProject);
      formData.append('timestamp', timestamp);

      const response = await fetch('/api/file-management/csv/download/all', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        console.log(errorMessage);
        toast.error(errorMessage.message);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_all_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Files downloaded successfully');
    } catch (error:any) {
      console.error(error);
      toast.error(error?.message || 'Failed to download files');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload CSV Files</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.projectid} value={project.projectshortname}>
                  {project.projectshortname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Table Name</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

     
          <div>
            <label className="block text-sm font-medium text-gray-700">Files</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFiles(e.target.files)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!files || !tableName || !selectedProject}
            className={cn(
              "w-full px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              !files || !tableName || !selectedProject
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            Upload and Process
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Download CSV Files</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">Timestamp</label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="YYYYMMDD_HHMMSS"
              required
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={!selectedProject || !timestamp}
            className={cn(
              "w-full px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              !selectedProject || !timestamp
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            Download Files
          </button>
        </div>
      </div>
    </div>
  );
}