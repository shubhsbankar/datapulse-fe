'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";

interface YamlSectionProps {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
}

export function YamlSection({ selectedProject, setSelectedProject }: YamlSectionProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [filename, setFilename] = useState("");
  const projects = useAppSelector((state) => state.project.projectAssigns.filter(pa => pa.useremail === state.user.currentUser.useremail).map(pa => pa.projectshortname));

  const pid = useAppSelector((state) => state.project.projects.find(p => p.projectshortname === selectedProject)?.projectid);
  const handleUpload = async () => {
    if (!files || !selectedProject) {
      toast.error('Please select files and project');
      return;
    }
    for (const file of files) {
      if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
        toast.error('Please upload only YAML files');
        return;
      }
      if (!file.name.startsWith(selectedProject)) {
        toast.error('Please upload files with the project shortname as the prefix');
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('project_shortname', selectedProject);
      formData.append('project_id', pid?.toString() || '');

      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/file-management/yaml/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success('YAML files uploaded successfully');
      setFiles(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload files');
    }
  };

  const handleDownload = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    try {
      const response = await fetch(`/api/file-management/yaml/download?project=${selectedProject}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_yaml_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download files');
    }
  };

  const handleDownloadSpecific = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    if (!filename) {
      toast.error('Please enter a filename');
      return;
    }

    try {
      const response = await fetch(`/api/file-management/yaml/download?project=${selectedProject}&filename=${filename}`);
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download files');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload YAML Files</h3>

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
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Files</label>
            <input
              type="file"
              accept=".yaml,.yml"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!files || !selectedProject}
            className={cn(
              "w-full px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              !files || !selectedProject
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            Upload Files
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Download YAML Files</h3>
          <label className="block text-sm font-medium text-gray-700">Download files</label>
          <button
            onClick={handleDownload}
            disabled={!selectedProject}
            className={cn(
              "w-full !mt-1 px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              !selectedProject
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            Download Files
          </button>

          <div className=''>
            <label htmlFor="">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />

            <button
              onClick={handleDownloadSpecific}
              disabled={!selectedProject || !filename}
              className={cn(
                "w-full px-4 py-2 mt-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                !selectedProject
                  ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              )}
            >
              Download Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 