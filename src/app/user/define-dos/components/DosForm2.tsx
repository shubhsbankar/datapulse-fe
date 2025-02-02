'use client';

import { Dataset, RdvBojDs, TenantBkcc } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { createRdvBojDsAsync, testRdvBojDsAsync } from "@/store/userfeat/rdvbojdsThunks";

interface DosForm2Props {
  datasets: Dataset[];
  tenantBkccs: TenantBkcc[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  setQueryResult: (result: { headers: string[]; rows: any[][]; error: string }) => void;
}

interface SatelliteRow {
  num: number;
  name: string;
  version: number;
}

export function DosForm2({
  datasets,
  tenantBkccs,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  setQueryResult,
}: DosForm2Props) {
  const dispatch = useAppDispatch();
  const [componentType, setComponentType] = useState('dl');
  const [componentName, setComponentName] = useState('');
  const [subtype, setSubtype] = useState('type');
  const [tenantId, setTenantId] = useState('');
  const [bkcArea, setBkcArea] = useState('');
  const [comments, setComments] = useState('');
  const [version, setVersion] = useState<number>(1);
  const [satlNums, setSatlNums] = useState<number>(1);
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [satelliteRows, setSatelliteRows] = useState<SatelliteRow[]>([
    { num: 1, name: '', version: 1 }
  ]);

  const { projectAssigns } = useAppSelector(state => state.project);
  const isProjectActive = (p: string) => projectAssigns.some(pa => pa.projectshortname === p && pa.is_active);
  // Get unique project names from datasets
  const dlComponents = useAppSelector(state =>
    state.userfeat.rdvcompdl.filter(dl => dl.comptype === 'dl')
  );
  const uniqueProjects = Array.from(new Set(dlComponents.map(dl => dl.projectshortname).filter(a => isProjectActive(a))));

  // Get data products for selected project
  // const availableDataProducts = datasets
  //   .filter(d => d.projectshortname === selectedProject)
  //   .map(d => d.dataproductshortname)
  //   .filter((value, index, self) => self.indexOf(value) === index);
  // console.log({dlComponents})
  const availableDataProducts = Array.from(new Set(dlComponents.filter(dl => dl.projectshortname === selectedProject).map(dl => dl.dpname)))

  // Get datasets for selected project and data product
  // const availableDatasets = datasets
  //   .filter(d =>
  //     d.projectshortname === selectedProject &&
  //     d.dataproductshortname === selectedDataProduct
  //   )
  //   .map(d => d.datasetshortname);
  const availableDatasets = Array.from(new Set(dlComponents
    .filter(dl => dl.projectshortname === selectedProject && dl.dpname === selectedDataProduct)
    .map(dl => dl.dsname)))
  // Get unique tenant IDs and BKC areas from tenantBkccs
  const uniqueTenantIds = Array.from(new Set(['default', ...tenantBkccs.map(t => t.tenantid)]));
  const uniqueBkcAreas = Array.from(new Set(['default', ...tenantBkccs.map(t => t.bkcarea)]));

  // Get component names from DL table
  const uniqueComponentNames = Array.from(new Set(dlComponents.filter(dl => selectedDataset == dl.dsname).map(dl => dl.compname)))

  // Get satellite names and versions from DS table
  const dsComponents = useAppSelector(state =>
    state.userfeat.rdvcompds.filter(ds => ds.assoccomptype === 'dl')
  );

  // Get unique satellite names
  const availableSatlNames = Array.from(new Set(dsComponents.filter(ds => ds.projectshortname == selectedProject && ds.dpname == selectedDataProduct && ds.dsname == selectedDataset && ds.assoccompname == componentName).map(ds => ds.satlname)));

  // Get available versions for selected satellite name
  const getAvailableVersions = (satlName: string) => {
    return dsComponents
      .filter(ds => ds.satlname === satlName)
      .map(ds => ds.version)
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  useEffect(() => {
    // Update satellite rows when satlNums changes
    const newRows = Array.from({ length: satlNums }, (_, i) => ({
      num: i + 1,
      name: satelliteRows[i]?.name || '',
      version: satelliteRows[i]?.version || 1
    }));
    setSatelliteRows(newRows);
  }, [satlNums]);

  const isFormValid = () => {
    return selectedProject && selectedDataProduct && selectedDataset && componentName && tenantId && bkcArea && comments && version;
  }


  const handleValidate = async () => {
    if (!selectedProject || !selectedDataProduct || !selectedDataset || !componentName || !tenantId || !bkcArea || !comments || !version) {
      toast.error('Please fill all fields');
      return false;
    }

    if (satelliteRows.some(row => !row.name || !row.version)) {
      toast.error('Please fill all satellite rows');
      return false;
    }

    try {
      const payload: Partial<RdvBojDs> = {
        projectshortname: selectedProject,
        dpname: selectedDataProduct,
        dsname: selectedDataset,
        comptype: componentType,
        compname: componentName,
        compshortname: `${selectedProject}_${selectedDataProduct}_${selectedDataset}_${componentType}_${componentName}_${version}`,
        satlnums: satlNums,
        tenantid: tenantId,
        bkcarea: bkcArea,
        comments,
        version,
        satlname: satelliteRows.map(row => row.name).join(','),
        satlversion: satelliteRows[0].version//satelliteRows.map(row => row.version).join(','),
      };

      await toast.promise(
        dispatch(testRdvBojDsAsync(payload)).unwrap(),
        {
          loading: 'Validating configuration...',
          success: (data) => {
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

    try {
      // Create one record for each satellite row
      if (satelliteRows.length === 0) {
        await dispatch(createRdvBojDsAsync({
          projectshortname: selectedProject,
          dpname: selectedDataProduct,
          dsname: selectedDataset,
          comptype: componentType,
          compname: componentName,
          compshortname: `${selectedProject}_${selectedDataProduct}_${selectedDataset}_${componentType}_${componentName}_${version}`,
          satlnums: satlNums,
          satlnum: 0,
          // satlname: ''
          // satlversion: null,
          tenantid: tenantId,
          bkcarea: bkcArea,
          comments,
          version,
        })).unwrap();
      }
      for (const row of satelliteRows) {
        await dispatch(createRdvBojDsAsync({
          projectshortname: selectedProject,
          dpname: selectedDataProduct,
          dsname: selectedDataset,
          comptype: componentType,
          compname: componentName,
          compshortname: `${selectedProject}_${selectedDataProduct}_${selectedDataset}_${componentType}_${componentName}_${version}`,
          satlnums: satlNums,
          satlnum: row.num,
          satlname: row.name,
          satlversion: row.version,
          tenantid: tenantId,
          bkcarea: bkcArea,
          comments,
          version,
        })).unwrap();
      }

      toast.success('DOS component created successfully');

      // Reset form
      setComponentName('');
      setSubtype('type');
      setTenantId('');
      setBkcArea('');
      setComments('');
      setVersion(1);
      setSatlNums(1);
      setSatelliteRows([{ num: 1, name: '', version: 1 }]);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create DOS component');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Define DOS Component (Form 2)
      </h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project dropdown */}
      <div>
        <label htmlFor="project" className="block text-sm font-medium text-gray-700">
          Project Short Name
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

      {/* Data Product dropdown */}
      <div>
        <label htmlFor="dataProduct" className="block text-sm font-medium text-gray-700">
          Data Product Name
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

      {/* Dataset dropdown */}
      <div>
        <label htmlFor="dataset" className="block text-sm font-medium text-gray-700">
          Dataset Name
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

      {/* Component Type dropdown */}
      <div>
        <label htmlFor="componentType" className="block text-sm font-medium text-gray-700">
          Component Type
        </label>
        <select
          id="componentType"
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="dl">dl</option>
        </select>
      </div>

      {/* Component Name dropdown */}
      <div>
        <label htmlFor="componentName" className="block text-sm font-medium text-gray-700">
          Component Name
        </label>
        <select
          id="componentName"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Component Name</option>
          {uniqueComponentNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Subtype dropdown */}
      {/* <div>
        <label htmlFor="subtype" className="block text-sm font-medium text-gray-700">
          Subtype
        </label>
        <select
          id="subtype"
          value={subtype}
          onChange={(e) => setSubtype(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="type">type</option>
        </select>
      </div> */}

      {/* Tenant ID dropdown */}
      <div>
        <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">
          Tenant ID
        </label>
        <select
          id="tenantId"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Tenant ID</option>
          {uniqueTenantIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      {/* BKC Area dropdown */}
      <div>
        <label htmlFor="bkcArea" className="block text-sm font-medium text-gray-700">
          BKC Area
        </label>
        <select
          id="bkcArea"
          value={bkcArea}
          onChange={(e) => setBkcArea(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select BKC Area</option>
          {uniqueBkcAreas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      {/* Comments textarea */}
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
          Comments
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Enter description of changes"
        />
      </div>

      {/* Version input */}
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
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Satellite Numbers */}
      <div>
        <label htmlFor="satlNums" className="block text-sm font-medium text-gray-700">
          Satellite Numbers (1-18)
        </label>
        <input
          type="number"
          id="satlNums"
          value={satlNums}
          onChange={(e) => setSatlNums(Math.min(18, Math.max(0, parseInt(e.target.value))))}
          min={0}
          max={18}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Satellite Rows */}
      {satelliteRows.map((row, index) => (
        <div key={row.num} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Satl Name Num {row.num}
            </label>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
              {row.num}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Satl Name
            </label>
            <select
              value={row.name}
              onChange={(e) => {
                const newRows = [...satelliteRows];
                newRows[index].name = e.target.value;
                newRows[index].version = 1; // Reset version when name changes
                setSatelliteRows(newRows);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Name</option>
              {availableSatlNames.filter((name, i) => !satelliteRows.some(row => row.name == name) || satelliteRows[index].name == name).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Satl Version
            </label>
            <select
              value={row.version}
              onChange={(e) => {
                const newRows = [...satelliteRows];
                newRows[index].version = parseInt(e.target.value);
                setSatelliteRows(newRows);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Version</option>
              {getAvailableVersions(row.name).map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-4">
        {/* <button
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
        </button> */}

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create
          </button>
        </div>
      </form>
    </div>
  );
}