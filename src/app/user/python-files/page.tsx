'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toast } from 'react-hot-toast';
import { Download } from 'lucide-react';

type FileType = 'p' | 't' | 'r' | 'pre';

export default function PythonFilesPage() {
  const dispatch = useAppDispatch();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<FileType>('p');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Get projects from Redux store
  const projects = useAppSelector((state) =>
    state.project.projectAssigns.filter(pa =>
      pa.useremail === state.user.currentUser?.useremail && pa.is_active
    )
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Validate file names
    const projectId = selectedProject.split('-')[0].toLowerCase(); // e.g., "p1" from "p1-projectname"
    const isValidName = Array.from(files).every(file => {
      const fileName = file.name.toLowerCase();
      if (selectedFileType !== "pre") {
        return fileName.startsWith(`${projectId}-${selectedFileType}-`);
      }
      return fileName.startsWith(`${projectId}-`);
    });

    if (!isValidName) {
      if (selectedFileType === 'pre') {
        toast.error(`Files must start with "${projectId}-"`);
      } else {
        toast.error(`Files must start with "${projectId}-${selectedFileType}-"`);
      }
      event.target.value = ''; // Reset file input
      return;
    }

    setSelectedFiles(files);
    const formData = new FormData();

    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/python-files/upload?filetype=${selectedFileType}&project_id=${selectedProject}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      toast.success('Python files uploaded successfully');
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload Python files');
    }
  };

  const handleDownload = async (fileType: FileType) => {
    if (fileType === 'pre') {
      try {

        const response = await fetch(`/api/python-files/download-predefined`);
        if (response.status !== 200) {
          const data = await response.json();
          toast.error(data.message);
          return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `predefined-files.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Predefined files downloaded successfully');
        return;
      } catch (error: any) {
        toast.error(error.message || 'Failed to download predefined files');
        return
      }
    }

    try {
      const response = await fetch(`/api/python-files/download?filetype=${fileType}&project_id=${selectedProject}`);
      try {
        const data = await response.clone().json();
        if (response.status !== 200) {
          toast.error(data.message);
          return;
        }
      } catch (error: any) { }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}-files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Files downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download files');
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Python Files Management</h2>

        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Upload Python Files</h3>

          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.assignid} value={project.projectshortname}>
                  {project.projectshortname}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                File Type
              </label>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value as FileType)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="p">P Files</option>
                <option value="t">T Files</option>
                <option value="r">R Files</option>
                <option value="pre">Predefined Files</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Files
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                accept=".py"
                disabled={!selectedProject}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50"
              />
              {selectedFiles && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Selected files: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Download Python Files</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleDownload('p')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download P Files
            </button>
            <button
              onClick={() => handleDownload('t')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download T Files
            </button>
            <button
              onClick={() => handleDownload('r')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download R Files
            </button>
            <button
              onClick={() => handleDownload('pre')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Predefined Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}