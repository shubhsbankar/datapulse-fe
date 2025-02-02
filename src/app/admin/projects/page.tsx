'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAllProjectsAsync, createProjectAsync } from '@/store/project/projectThunk';
import { ProjectBase } from '@/types/project';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';

const PROJECTS_PER_PAGE = 10;

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.project.projects);
  // get all datastores
  const datastores = useAppSelector((state) => state.datastore.datastores);
  const currentUserGroup = useAppSelector((state) => state.user.currentUser.useremail?.split('@')[1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTarget, setIsTarget] = useState('na');
  const [sourceType, setSourceType] = useState<'GCS' | 'AWSS3' | 'Local'>('Local');
  const [newProject, setNewProject] = useState<ProjectBase>({
    projectshortname: '',
    projectname: '',
    coname: currentUserGroup || '',
    datastoreshortname: 'NA',
    sourcetype: 'Local',
    credentials_file: '',  // for GCS
    accesskey: '',        // for AWS
    secretkey: '',        // for AWS
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isTarget === 'na') {
      setNewProject((prev) => ({
        ...prev,
        datastoreshortname: 'NA',
      }));
    }
  }, [isTarget]);

  useEffect(() => {
    dispatch(getAllProjectsAsync());
  }, [dispatch]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.promise(dispatch(createProjectAsync(newProject)).unwrap(), {
        loading: 'Creating project...',
        success: 'Project created successfully',
        error: (error) => {
          return error.message || 'Failed to create project';
        }
      });
      dispatch(getAllProjectsAsync()); // Refresh the list
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  let filteredProjects = projects.filter(
    project => project.projectname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectshortname.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalFilteredProjects = filteredProjects.length;
  const totalPages = Math.ceil(totalFilteredProjects / PROJECTS_PER_PAGE);
  filteredProjects = filteredProjects.slice((page - 1) * PROJECTS_PER_PAGE, page * PROJECTS_PER_PAGE);

  const formatShortName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '');
  };

  const handleShortNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatShortName(e.target.value);
    setNewProject(prev => ({
      ...prev,
      projectshortname: formattedValue
    }));
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 50); // Limit to 50 characters
    setNewProject(prev => ({
      ...prev,
      projectname: value
    }));
  };

  const handleDatastoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewProject(prev => ({
      ...prev,
      datastoreshortname: value
    }));
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
      </div>

      {/* Create Project Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h2>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="projectshortname" className="block text-sm font-medium text-gray-700">
                Project Short Name
                <span className="text-xs text-gray-500 ml-1">(single word, lowercase)</span>
              </label>
              <input
                type="text"
                id="projectshortname"
                value={newProject.projectshortname}
                onChange={handleShortNameChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
                pattern="^[a-z0-9]+$"
                title="Only lowercase letters and numbers, no spaces"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be used as a unique identifier for the project
              </p>
            </div>
            <div>
              <label htmlFor="projectname" className="block text-sm font-medium text-gray-700">
                Project Name
                <span className="text-xs text-gray-500 ml-1">
                  ({50 - newProject.projectname.length} characters remaining)
                </span>
              </label>
              <input
                type="text"
                id="projectname"
                value={newProject.projectname}
                onChange={handleProjectNameChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
                maxLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">
                Descriptive name for the project
              </p>
            </div>
            <div>
              <label htmlFor="projectname" className="block text-sm font-medium text-gray-700">
                Is Target
              </label>
              <select
                id="is_target"
                name="is_target"
                value={isTarget}
                onChange={(e) => setIsTarget(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="yes">Yes</option>
                <option value="na">NA</option>
              </select>
            </div>
            <div>
              <label htmlFor="projectname" className="block text-sm font-medium text-gray-700">
                Datastore Shortname
              </label>
              <select
                id="is_target"
                name="is_target"
                value={newProject.datastoreshortname}
                onChange={handleDatastoreChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="NA">NA</option>
                {
                  isTarget === 'yes' && datastores.filter(ds => ds.is_target?.toLowerCase() === 'yes').map(datastore => (
                    <option key={datastore.dsshortname} value={datastore.dsshortname}>
                      {datastore.dsshortname}
                    </option>
                  ))
                }
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Datastore to associate with the project
              </p>
            </div>
            <div>
              <label htmlFor="sourcetype" className="block text-sm font-medium text-gray-700">
                Source Type
              </label>
              <select
                id="sourcetype"
                value={newProject.sourcetype}
                onChange={(e) => {
                  const value = e.target.value as 'GCS' | 'AWSS3' | 'Local';
                  setSourceType(value);
                  setNewProject(prev => ({
                    ...prev,
                    sourcetype: value,
                    // Reset credentials when switching source type
                    credentialsfile: '',
                    accesskey: '',
                    secretkey: '',
                  }));
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Local">Local</option>
                <option value="GCS">Google Cloud Storage</option>
                <option value="AWSS3">AWS S3</option> 
              </select>
            </div>
            {sourceType === 'GCS' && (
              <div>
                <label htmlFor="credentialsfile" className="block text-sm font-medium text-gray-700">
                  Credentials File Name
                </label>
                <input
                  type="text"
                  id="credentialsfile"
                  value={newProject.credentials_file}
                  onChange={(e) => setNewProject(prev => ({
                    ...prev,
                    credentials_file: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            )}
            {sourceType === 'AWSS3' && (
              <>
                <div>
                  <label htmlFor="accesskey" className="block text-sm font-medium text-gray-700">
                    Access Key
                  </label>
                  <input
                    type="text"
                    id="accesskey"
                    value={newProject.accesskey}
                    onChange={(e) => setNewProject(prev => ({
                      ...prev,
                      accesskey: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="secretkey" className="block text-sm font-medium text-gray-700">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    id="secretkey"
                    value={newProject.secretkey}
                    onChange={(e) => setNewProject(prev => ({
                      ...prev,
                      secretkey: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>

      {/* Projects List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datastore
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.projectid}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.projectshortname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.projectname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(project.createdate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.datastoreshortname || 'NA'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Showing {Math.min((page - 1) * PROJECTS_PER_PAGE + 1, totalFilteredProjects)}-
                  {Math.min(page * PROJECTS_PER_PAGE, totalFilteredProjects)} of {totalFilteredProjects} projects
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 