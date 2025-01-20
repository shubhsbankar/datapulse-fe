'use client';

import { Dataset, TenantBkcc } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { createRdvCompDsAsync, testRdvCompDsAsync, getTableColumnsAsync } from "@/store/userfeat/rdvcompdsThunks";
import { isSuccessful } from "@/utils/helpers";
// import { getTableColumnsAsync } from "@/store/userfeat/rdvcompdhThunks";
import SortableMultiSelect from "@/components/ui/multiselect";

interface DssForm3Props {
  datasets: Dataset[];
  tenantBkccs: TenantBkcc[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  setQueryResult: (result: any) => void;
}

export function DssForm3({
  datasets,
  tenantBkccs,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  setQueryResult
}: DssForm3Props) {
  const dispatch = useAppDispatch();
  const [componentType, setComponentType] = useState('ds');
  const [dsName, setDsName] = useState('');
  const [selectedDsAttributes, setSelectedDsAttributes] = useState<string[]>([]);
  const [associatedCompType, setAssociatedCompType] = useState('');
  const [associatedCompName, setAssociatedCompName] = useState('');
  const [version, setVersion] = useState<number>(1);
  const [isValidated, setIsValidated] = useState(false);
  const [availableDsAttributes, setAvailableDsAttributes] = useState<string[]>([]);
  // Get unique project names from datasets
  const [partsNumber, setPartsNumber] = useState(0);
  const [parts, setParts] = useState<string[]>([]);
  const { projectAssigns } = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);

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

  const uniquieDH = useAppSelector(state => state.userfeat.rdvcomdh);
  // const uniquieDHnames = useAppSelector(state => new Set(state.userfeat.rdvcomdh.map(dh => dh.compname)));
  const uniquieDLnames = useAppSelector(state => new Set(state.userfeat.rdvcompdl.map(dl => dl.compname)));

  useEffect(() => {
    const fetchDsAttributes = async () => {
      const resp = await dispatch(getTableColumnsAsync({ dataset: selectedDataset, project: selectedProject, dataproduct: selectedDataProduct, componentType: 'ds' }));
      if (resp.payload.status === 200) {
        setAvailableDsAttributes(resp.payload.data || []);
      }
    };
    if (selectedDataset) {
      fetchDsAttributes();
    }
  }, [selectedDataset, dispatch, selectedProject, selectedDataProduct, dsName]);

  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      selectedDataProduct !== '' &&
      selectedDataset !== '' &&
      selectedDsAttributes.length > 0 &&
      associatedCompType !== '' &&
      associatedCompName !== '' &&
      version > 0
      // partsNumber >= 0 &&
      // parts.every(p => p !== '') &&
      // partsNumber === parts.length
    );
  };

  const handleValidate = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields before validating');
      return;
    }

    const payload = {
      projectshortname: selectedProject,
      dpname: selectedDataProduct,
      dsname: selectedDataset,
      comptype: componentType,
      assoccompname: associatedCompName,
      assoccomptype: associatedCompType,
      // tenantid: null,
      // bkcarea: null,
      version: version,
      satlattr: selectedDsAttributes,
      satlname: 'default',
      compshortname: dsName,
    };

    await toast.promise(
      dispatch(testRdvCompDsAsync(payload)).unwrap(),
      {
        loading: 'Validating configuration...',
        success: (data) => {
          // console.log({data});
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

    // try {
    //   // Add validation logic here
    //   setIsValidated(true);
    //   toast.success('Configuration is valid');
    // } catch (error) {
    //   console.error(error);
    //   setIsValidated(false);
    //   toast.error('Validation failed');
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidated) {
      toast.error('Please validate the configuration first');
      return;
    }

    try {
      // Add submission logic here
      const payload: any = {
        projectshortname: selectedProject,
        dpname: selectedDataProduct,
        dsname: "",
        comptype: componentType,
        assoccompname: associatedCompName,
        assoccomptype: associatedCompType,
        version: version,
        satlattr: selectedDsAttributes,
        satlname: '',
        compshortname: dsName,
        partsnum: partsNumber,
        parts: parts
      }
      // payload["dsname"] = associatedCompType == "rnh" ? selectedDataset : associatedCompName
      payload["dsname"] = selectedDataset;
      if (associatedCompType != "rnh") {
        payload["satlname"] = associatedCompName
      }
      const resp = await dispatch(createRdvCompDsAsync(payload));
      console.log(resp.payload);
      if (!isSuccessful(resp.payload.status)) {
        toast.error(resp.payload.message || 'Failed to create DSS component');
        return;
      }
      toast.success('DSS component created successfully');

      // Reset form
      // setDsName('');
      // setSelectedDsAttributes([]);
      // setAssociatedCompType('');
      // setAssociatedCompName('');
      // setVersion(1);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create DSS component');
    }
  };
  useEffect(() => {
    if (associatedCompType == "rnh") {
      setDsName(associatedCompName);
    }
  }, [associatedCompType, associatedCompName]);
  useEffect(() => {
    setIsValidated(false);
  }, [
    selectedProject,
    selectedDataProduct,
    selectedDataset,
    dsName,
    selectedDsAttributes,
    associatedCompType,
    associatedCompName,
    version
  ]);

  return (
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
          <option value="ds">ds</option>
        </select>
      </div>

      {/* DS Name input */}
      <div>
        <label htmlFor="dsName" className="block text-sm font-medium text-gray-700">
          DS Name
        </label>
        <input
          type="text"
          id="dsName"
          value={dsName}
          disabled={associatedCompType == 'rnh'}
          onChange={(e) => setDsName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* DS Attributes multiselect */}
      <div>
        <label htmlFor="dsAttributes" className="block text-sm font-medium text-gray-700">
          DS Attributes
        </label>
        {/* <select
          multiple
          id="dsAttributes"
          value={selectedDsAttributes}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedDsAttributes(values);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          size={5}
        >
          {availableDsAttributes.map(attr => (
            <option key={attr} value={attr}>{attr}</option>
          ))}
        </select> */}
        <SortableMultiSelect
          onChange={setSelectedDsAttributes}
          options={availableDsAttributes}
          value={selectedDsAttributes}
        />
      </div>

      {/* Associated Component Type dropdown */}
      <div>
        <label htmlFor="associatedCompType" className="block text-sm font-medium text-gray-700">
          Associated Component Type
        </label>
        <select
          id="associatedCompType"
          value={associatedCompType}
          onChange={(e) => setAssociatedCompType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Component Type</option>
          <option value="rh">RH</option>
          <option value="rnh">RNH</option>
        </select>
      </div>

      {/* Associated Component Name dropdown */}
      <div>
        <label htmlFor="associatedCompName" className="block text-sm font-medium text-gray-700">
          Associated Component Name
        </label>
        <select
          id="associatedCompName"
          value={associatedCompName}
          onChange={(e) => setAssociatedCompName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          disabled={!associatedCompType}
        >
          <option value="">Select Component Name</option>
          {/* {associatedCompType === 'dh' ? [...uniquieDHnames].map(name => (
            <option key={name} value={name}>{name}</option>
          )) : [...uniquieDLnames].map(name => (
            <option key={name} value={name}>{name}</option>
          ))} */}
          {uniquieDH.filter(dh => dh.projectshortname == selectedProject && dh.dpname == selectedDataProduct && dh.dsname == selectedDataset && dh.comptype?.toLowerCase() == associatedCompType.toLowerCase())
            .map(dh => (<option key={dh.compname} value={dh.compname}>{dh.compname}</option>))}
        </select>
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


      {/* PartsNumber dropdown */}
      {/* <div>
        <label htmlFor="bkcArea" className="block text-sm font-medium text-gray-700">
          Parts Number
        </label>
        <select
          id="bkcArea"
          value={partsNumber}
          onChange={(e) => {
            const n = parseInt(e.target.value);
            setPartsNumber(n)
            if (n < parts.length) {
              setParts(parts.slice(0, n));
            }
            else {
              setParts([...parts]);
            }
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          {Array.from({ length: 6 }, (_, i) => i).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div> */}

      {/* Parts dropdown */}
      {/* <SortableMultiSelect
        onChange={setParts}
        options={availableDsAttributes}
        value={parts}
      /> */}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleValidate}
          className={cn(
            "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            isValidated
              ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
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
  );
} 