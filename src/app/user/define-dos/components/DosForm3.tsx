"use client";

import { Dataset, RdvBojDs, TenantBkcc } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-hot-toast";
import { createRdvBojDsAsync, testRdvBojDsAsync } from "@/store/userfeat/rdvbojdsThunks";
import { cn } from "@/lib/utils";

interface DosForm3Props {
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

export function DosForm3({
  datasets,
  tenantBkccs,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  setQueryResult,
}: DosForm3Props) {
  const dispatch = useAppDispatch();
  const [componentType, setComponentType] = useState("rh");
  const [componentName, setComponentName] = useState("");
  const [subtype, setSubtype] = useState("type");
  const [comments, setComments] = useState("");
  const [version, setVersion] = useState<number>(1);
  const satlNums = 1;
  const [isValidated, setIsValidated] = useState(false);
  const [satelliteRows, setSatelliteRows] = useState<SatelliteRow[]>([
    { num: 1, name: "", version: 1 },
  ]);

  const { projectAssigns } = useAppSelector(state => state.project);
  const isProjectActive = (p: string) => projectAssigns.some(pa => pa.projectshortname === p && pa.is_active);

  // Get component names from DH table based on component type
  const dhComponents = useAppSelector((state) =>
    state.userfeat.rdvcomdh
  );
  // Get unique project names from datasets
  // const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active).map(pa => pa.projectshortname));
  // const uniqueProjects = Array.from(new Set(projects))
  const uniqueProjects = Array.from(new Set(dhComponents.map(dh => dh.projectshortname))).filter(isProjectActive);
  // Get data products for selected project
  // const availableDataProducts = datasets
  //   .filter((d) => d.projectshortname === selectedProject)
  //   .map((d) => d.dataproductshortname)
  //   .filter((value, index, self) => self.indexOf(value) === index);
  const availableDataProducts = dhComponents.filter(dh => dh.projectshortname == selectedProject).map(dh => dh.dpname).filter((value, index, self) => self.indexOf(value) === index);

  // Get datasets for selected project and data product
  // const availableDatasets = datasets
  //   .filter(
  //     (d) =>
  //       d.projectshortname === selectedProject &&
  //       d.dataproductshortname === selectedDataProduct
  //   )
  //   .map((d) => d.datasetshortname);
  const availableDatasets = dhComponents.filter(dh => dh.projectshortname == selectedProject && dh.dpname == selectedDataProduct).map(dh => dh.dsname).filter((value, index, self) => self.indexOf(value) === index);

  const uniqueComponentNames = Array.from(new Set(dhComponents.filter(dh => dh.dpname == selectedDataProduct && 
    dh.dsname == selectedDataset && dh.comptype?.toLowerCase() == componentType.toLowerCase()
  ).map(dh => dh.compname)));
  console.log('uniqueComponentNames', uniqueComponentNames, dhComponents, componentType);
  
  // Get satellite names and versions from DS table
  const dsComponents = useAppSelector((state) =>
    state.userfeat.rdvcompds.filter(ds => ds.assoccomptype === componentType)
);

  // Get available satellite names based on component type and name
  // const availableSatlNames = componentType === 'rnh'
  //   ? [componentName] // For RNH, satellite name must match component name
  //   : Array.from(new Set(dsComponents.map(ds => ds.satlname)));

  const availableSatlNames = Array.from(new Set(dsComponents.filter(ds => ds.projectshortname == selectedProject && ds.dpname == selectedDataProduct && ds.dsname == selectedDataset && ds.assoccompname == componentName && ds.assoccomptype.toLowerCase() == componentType.toLowerCase()).map(ds => ds.satlname)));


  // Get available versions for selected satellite name
  const getAvailableVersions = (satlName: string) => {
    console.log('satlName', satlName, dsComponents, availableSatlNames);
    return dsComponents
      .filter(ds => ds.satlname === satlName)
      .map(ds => ds.version)
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  const isFormValid = () => {
    return selectedProject && selectedDataProduct && selectedDataset && componentName &&  comments && version && satelliteRows.every(row => row.name && row.version);
  }


  const handleValidate = async () => {
    if (!selectedProject || !selectedDataProduct || !selectedDataset || !componentName || !comments || !version) {
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
      for (const row of satelliteRows) {
        const compshortname = `${selectedProject}_${selectedDataProduct}_${selectedDataset}_${componentType}_${componentName}_${version}`;

        await dispatch(
          createRdvBojDsAsync({
            projectshortname: selectedProject,
            dpname: selectedDataProduct,
            dsname: selectedDataset,
            comptype: componentType,
            compname: componentName,
            compshortname,
            satlnums: satlNums,
            satlnum: row.num,
            satlname: row.name,
            satlversion: row.version,
            comments,
            version,
            tenantid: "",
            bkcarea: "",
          })
        ).unwrap();
      }

      toast.success("DOS component created successfully");

      // Reset form
      setComponentName("");
      setSubtype("type");
      setComments("");
      setVersion(1);
      setSatelliteRows([{ num: 1, name: "", version: 1 }]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create DOS component");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Define DOS Component (Form 3)
      </h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project dropdown */}
      <div>
        <label
          htmlFor="project"
          className="block text-sm font-medium text-gray-700"
        >
          Project Short Name
        </label>
        <select
          id="project"
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setSelectedDataProduct("");
            setSelectedDataset("");
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Project</option>
          {uniqueProjects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
      </div>

      {/* Data Product dropdown */}
      <div>
        <label
          htmlFor="dataProduct"
          className="block text-sm font-medium text-gray-700"
        >
          Data Product Name
        </label>
        <select
          id="dataProduct"
          value={selectedDataProduct}
          onChange={(e) => {
            setSelectedDataProduct(e.target.value);
            setSelectedDataset("");
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          disabled={!selectedProject}
        >
          <option value="">Select Data Product</option>
          {availableDataProducts.map((dp) => (
            <option key={dp} value={dp}>
              {dp}
            </option>
          ))}
        </select>
      </div>

      {/* Dataset dropdown */}
      <div>
        <label
          htmlFor="dataset"
          className="block text-sm font-medium text-gray-700"
        >
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
          {availableDatasets.map((ds) => (
            <option key={ds} value={ds}>
              {ds}
            </option>
          ))}
        </select>
      </div>

      {/* Component Type dropdown */}
      <div>
        <label
          htmlFor="componentType"
          className="block text-sm font-medium text-gray-700"
        >
          Component Type
        </label>
        <select
          id="componentType"
          value={componentType}
          onChange={(e) => {
            setComponentType(e.target.value);
            setComponentName("");
            setSatelliteRows([{ num: 1, name: "", version: 1 }]);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="rh">RH</option>
          <option value="rnh">RNH</option>
        </select>
      </div>

      {/* Component Name dropdown */}
      <div>
        <label
          htmlFor="componentName"
          className="block text-sm font-medium text-gray-700"
        >
          Component Name
        </label>
        <select
          id="componentName"
          value={componentName}
          onChange={(e) => {
            setComponentName(e.target.value);
            if (componentType === 'rnh') {
              setSatelliteRows([{ num: 1, name: e.target.value, version: 1 }]);
            }
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Component Name</option>
          {uniqueComponentNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Subtype dropdown */}
      {/* <div>
        <label
          htmlFor="subtype"
          className="block text-sm font-medium text-gray-700"
        >
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

      {/* Comments textarea */}
      <div>
        <label
          htmlFor="comments"
          className="block text-sm font-medium text-gray-700"
        >
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
        <label
          htmlFor="version"
          className="block text-sm font-medium text-gray-700"
        >
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
                newRows[index].version = 1; // Reset version when satellite name changes
                setSatelliteRows(newRows);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
              // disabled={componentType === 'rnh'} // Disable for RNH type since it must match component name
            >
              <option value="">Select Name</option>
              {availableSatlNames.filter((name, i) => !satelliteRows.some(row => row.name == name) || satelliteRows[index].name == name).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
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
              {getAvailableVersions(row.name).map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
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
          disabled={!isFormValid()}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </form>
    </div>
  );
}
