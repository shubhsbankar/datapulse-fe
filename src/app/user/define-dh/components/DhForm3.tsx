'use client';

import { Dataset, RdvCompDh } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRdvCompDhAsync, getTableColumnsAsync, testRdvCompDhAsync } from "@/store/userfeat/rdvcompdhThunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import SortableMultiSelect from "@/components/ui/multiselect";

interface DhForm3Props {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  setQueryResult: (results: { headers: string[], rows: any[][] } | null) => void;
}


export function DhForm3({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  setQueryResult
}: DhForm3Props) {
  const dispatch = useAppDispatch();
  const [componentName, setComponentName] = useState('');
  const [selectedBkfields, setSelectedBkfields] = useState<string[]>([]);
  const [compType, setCompType] = useState<'RH' | 'RNH'>('RH');
  const [version, setVersion] = useState<number>(1);
  const [isValidated, setIsValidated] = useState(false);
  const [availableBkfields, setAvailableBkfields] = useState<string[]>([]);
  
  const {projectAssigns} = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);
  // Get unique project names from datasets
  const uniqueProjects = Array.from(new Set(datasets.map(d => d.projectshortname))).filter(isProjectAssignedAndActive);

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
    .map(d => d.datasetshortname);

    useEffect(() => {
      const fetchBkfields = async () => {
        const resp = await dispatch(getTableColumnsAsync({ dataset: selectedDataset, project: selectedProject, dp: selectedDataProduct, comptype: 'dh', compname: componentName }));
        if (resp.payload.status === 200) {
          setAvailableBkfields(resp.payload.data || []);
        }
      };
    if (selectedDataset) {
      fetchBkfields();
    }
  }, [selectedDataset, dispatch, selectedProject, selectedDataProduct, componentName]);
  
  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      selectedDataProduct !== '' &&
      selectedDataset !== '' &&
      componentName !== '' &&
      selectedBkfields.length > 0 &&
      compType &&
      version > 0
    );
  };

  const handleValidate = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields before validating');
      return;
    }

    try {
      const payload = {
        projectshortname: selectedProject,
        dpname: selectedDataProduct,
        dsname: selectedDataset,
        comptype: "dh",
        compname: componentName,
        compkeyname: `${componentName}_k1`,
        bkfields: selectedBkfields,
        version: version,
      };

      await toast.promise(
        dispatch(testRdvCompDhAsync(payload)).unwrap(),
        {
          loading: 'Validating configuration...',
          success: (data:any) => {
            setQueryResult(data.data);
            setIsValidated(true);
            return data.message || 'Configuration is valid';
          },
          error: (err) => {
            setIsValidated(false);
            return err.message || 'Validation failed';
          }
        }
      );
    } catch (error) {
      console.error(error);
      setIsValidated(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidated) {
      toast.error('Please validate the configuration first');
      return;
    }
    try {
      const payload: RdvCompDh = {
        projectshortname: selectedProject,
        dpname: selectedDataProduct,
        dsname: selectedDataset,
        comptype: compType,
        compname: componentName,
        compkeyname: `${componentName}_k1`,
        bkfields: selectedBkfields,
        version: version,
      };

      await dispatch(createRdvCompDhAsync(payload)).unwrap();
      toast.success('DH component created successfully');
      
      // Reset form
      setComponentName('');
      setSelectedBkfields([]);
      setCompType('RH');
      setVersion(1);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create DH component');
    }
  };

  useEffect(() => {
    // Reset validation when any input changes
    setIsValidated(false);
  }, [
    selectedProject,
    selectedDataProduct,
    selectedDataset,
    componentName,
    selectedBkfields,
    compType,
    version
  ]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Define DH Component (Form 3)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            required
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
            onChange={(e) => setSelectedDataset(e.target.value)}
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
          <label htmlFor="compType" className="block text-sm font-medium text-gray-700">
            Component Type
          </label>
          <select
            id="compType"
            value={compType}
            onChange={(e) => setCompType(e.target.value as 'RH' | 'RNH')}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="RH">RH</option>
            <option value="RNH">RNH</option>
          </select>
        </div>

        <div>
          <label htmlFor="componentName" className="block text-sm font-medium text-gray-700">
            Component Name
          </label>
          <input
            type="text"
            id="componentName"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="bkfields" className="block text-sm font-medium text-gray-700">
            Business Key Fields
          </label>
          {/* <select
            multiple
            id="bkfields"
            value={selectedBkfields}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedBkfields(values);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            size={5}
          >
            {availableBkfields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select> */}
          <SortableMultiSelect
            onChange={setSelectedBkfields}
            options={availableBkfields}
            value={selectedBkfields}
          />
        </div>

        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="number"
            id="version"
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value))}
            min={1}
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:opacity-50"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleValidate}
            disabled={!isFormValid()}
            className={cn(
              "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              isValidated
                ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                : !isFormValid()
                ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            {isValidated ? '✓ Configuration Validated' : 'Validate Configuration'}
          </button>
          
          <button
            type="submit"
            disabled={!isValidated}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
} 