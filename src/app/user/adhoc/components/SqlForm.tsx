'use client';

import { Dataset, Dtg } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { executeSqlAsync } from "@/store/userfeat/sqlThunks";
import { toast } from "react-hot-toast";
import { SqlResults } from "./SqlResults";

interface SqlFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  sqlQuery: string;
  setSqlQuery: (query: string) => void;
}

export function SqlForm({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  sqlQuery,
  setSqlQuery
}: SqlFormProps) {
  const dispatch = useAppDispatch();
  const [queryResults, setQueryResults] = useState<{ headers: string[], rows: any[][], error: string } | null>(null);
  const [testVersion, setTestVersion] = useState<string>('');
  const [executionDate, setExecutionDate] = useState('');
  const dtgs = useAppSelector(state => state.userfeat.dtg.filter(dtg => dtg.datasettype == 'Target'))
  const dtgspsn = dtgs.map(dtg => dtg.projectshortname);
  const { projectAssigns } = useAppSelector(state => state.project);
  function isProjectActive(project: string) {
    return projectAssigns.find(pa => pa.projectshortname === project)?.is_active;
  }

  // Get unique project names from datasets
  const uniqueProjects = Array.from(new Set(datasets.map(d => d.projectshortname)?.filter(a => dtgspsn.includes(a)))).filter(a => isProjectActive(a));

  // Get data products for selected project
  const availableDataProducts = datasets
    .filter(d => d.projectshortname === selectedProject)
    .map(d => d.dataproductshortname)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get datasets for selected project and data product
  const availableDatasets = datasets
    .filter(d =>
      d.projectshortname === selectedProject &&
      d.dataproductshortname === selectedDataProduct
    )
    .map(d => d.datasetshortname)
    .filter(a => dtgs.map(dtg => dtg.datasetshortname).includes(a))
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get unique test coverage versions from dtgs
  const availableTestVersions = selectedDataset ? Array.from(
    new Set(dtgs.map(dtg => dtg.testcoverageversion))
  ).sort().filter(v => {
    if (selectedDataset) {
      return dtgs.find(dtg => dtg.datasetshortname === selectedDataset)?.testcoverageversion === v;
    }
    return true;
  }) : [];

  const handleExecute = async () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(executionDate)) {
      toast.error('Invalid date format. Please use YYYY-MM-DD');
      return;
    }

    try {
      const result = await dispatch(executeSqlAsync({
        projectshortname: selectedProject,
        dataproductshortname: selectedDataProduct,
        datasetshortname: selectedDataset,
        sqlQuery,
        testcoverageversion: testVersion,
        executiondate: executionDate
      })).unwrap();

      setQueryResults(result.data);
      toast.success('Query executed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute query');
      setQueryResults({ headers: [], rows: [], error: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Execute SQL</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedDataProduct('');
                setSelectedDataset('');
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Project</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dataProduct" className="block text-sm font-medium text-gray-700">
              Data Product
            </label>
            <select
              id="dataProduct"
              value={selectedDataProduct}
              onChange={(e) => {
                setSelectedDataProduct(e.target.value);
                setSelectedDataset('');
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedProject}
            >
              <option value="">Select Data Product</option>
              {availableDataProducts.map(dp => (
                <option key={dp} value={dp}>{dp}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dataset" className="block text-sm font-medium text-gray-700">
              Dataset
            </label>
            <select
              id="dataset"
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              disabled={!selectedDataProduct}
            >
              <option value="">Select Dataset</option>
              {availableDatasets.map(ds => (
                <option key={ds} value={ds}>{ds}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="testVersion" className="block text-sm font-medium text-gray-700">
              Test Coverage Version
            </label>
            <select
              id="testVersion"
              value={testVersion}
              onChange={(e) => setTestVersion(e.target.value)}
              disabled={!selectedDataset}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Test Coverage Version</option>
              {availableTestVersions.map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
          </div>

          

          <div className="mb-4">
            <label htmlFor="execution_date" className="block text-sm font-medium text-gray-700">
              Execution Date (YYYY-MM-DD)
            </label>
            <input
              type="text"
              id="execution_date"
              name="execution_date"
              value={executionDate}
              onChange={(e) => setExecutionDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              className="mt-1 block w-48 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>


          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExecute}
              disabled={!selectedDataset || !sqlQuery.trim() || !testVersion || !executionDate}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Execute Query
            </button>
          </div>
        </div>
      </div>

      {/* Show query results */}
      <SqlResults results={queryResults} />
    </div>
  );
} 