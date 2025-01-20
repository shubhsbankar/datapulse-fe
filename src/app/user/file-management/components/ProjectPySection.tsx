'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";

interface ProjectPySectionProps {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
}

export function ProjectPySection({ selectedProject, setSelectedProject }: ProjectPySectionProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [filename, setFilename] = useState("");
  const [predefinedFilename,setPredefinedFilename] = useState("");

  const projects = useAppSelector((state) => state.project.projectAssigns.filter(pa => pa.useremail === state.user.currentUser.useremail).map(pa => pa.projectshortname));

  const handleUpload = async () => {
    if (!files || !selectedProject) {
      toast.error('Please select files and project');
      return;
    }
    for (const file of files) {
      if (!file.name.endsWith('.py')) {
        toast.error('Please upload only Python files');
        return;
      }
      if (!file.name.startsWith(selectedProject)) {
        toast.error('Please upload files with the project shortname as the prefix');
        return;
      }
    }
    try {
      const formData = new FormData();

      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/file-management/py-files/project/upload?project=${selectedProject}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success('Python files uploaded successfully');
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
      const response = await fetch(`/api/file-management/py-files/project/download?project=${selectedProject}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_py_files.zip`;
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
      toast.error('Please enter a file name');
      return;
    }

    try {
      const response = await fetch(`/api/file-management/py-files/project/download?project=${selectedProject}&filepath=${filename}`);
      if (!response.ok) {
        const { error } = await response.json();
        console.log(error.message)
        throw new Error(error);
      };
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };
  const handleDownloadPredefined = async () => {
    if (!predefinedFilename) {
      toast.error('Please enter a file name');
      return;
    }

    try {
      const response = await fetch(`/api/file-management/py-files/project/download/predefined?&filepath=${predefinedFilename}`);
      if (!response.ok) {
        const { error } = await response.json();
        console.log(error)
        throw new Error(error);
      };
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = predefinedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className='my-8'>
        <label className="block  text-sm font-medium text-gray-700">Project</label>
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
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload Project Python Files</h3>


          <div>
            <label className="block text-sm font-medium text-gray-700">Files</label>
            <input
              type="file"
              accept=".py"
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

        {/* <div className="space-y-4">
          <h3 className="text-lg font-medium">Download Project Python Files</h3>

          <button
            onClick={handleDownload}
            disabled={!selectedProject}
            className={cn(
              "w-full px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              !selectedProject
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            Download Files
          </button>
        </div> */}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Download Specific Python Project Files</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filename</label>
            <input
              type="text"
              accept=""
              multiple
              onChange={(e) => setFilename(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <button
            onClick={handleDownloadSpecific}
            disabled={!selectedProject}
            className={cn(
              "w-full px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              !selectedProject
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            Download File
          </button>
        </div>
      </div>
      <div className='my-8'>
        <h2 className="block mb-4  font-medium text-gray-700 text-xl">Download Files from predefined Path</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Filename</label>
          <input
            type="text"
            accept=""
            value={predefinedFilename}
            onChange={(e) => setPredefinedFilename(e.target.value)}
            className=" block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <button
          onClick={handleDownloadPredefined}
          className={cn(
            "w-full mt-4 px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          )}
        >
          Download File
        </button>
      </div>
    </div>
  );
} 