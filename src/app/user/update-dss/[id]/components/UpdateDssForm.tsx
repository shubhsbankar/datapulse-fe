'use client';

import { Dataset, TenantBkcc, RdvCompDs } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { updateRdvCompDsAsync } from "@/store/userfeat/rdvcompdsThunks";
import { useRouter } from "next/navigation";
import { getTableColumnsAsync } from "@/store/userfeat/rsThunks";

interface UpdateDssFormProps {
  datasets: Dataset[];
  tenantBkccs: TenantBkcc[];
  currentDs: RdvCompDs;
}

export function UpdateDssForm({
  datasets,
  tenantBkccs,
  currentDs,
}: UpdateDssFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [componentType, setComponentType] = useState(currentDs.comptype || 'ds');
  const [dsName, setDsName] = useState(currentDs.compshortname || '');
  const [selectedDsAttributes, setSelectedDsAttributes] = useState<string[]>(currentDs.satlattr || []);
  const [associatedCompType, setAssociatedCompType] = useState(currentDs.assoccomptype || '');
  const [associatedCompName, setAssociatedCompName] = useState(currentDs.assoccompname || '');
  const [tenantId, setTenantId] = useState(currentDs.tenantid || '');
  const [bkcArea, setBkcArea] = useState(currentDs.bkcarea || '');
  const [version, setVersion] = useState<number>(currentDs.version || 1);
  const [isValidated, setIsValidated] = useState(false);
  const [partsNumber, setPartsNumber] = useState<number>(currentDs.partsnum || 0);
  const [parts, setParts] = useState<string[]>(currentDs.parts || []);
  const [availableDsAttributes, setAvailableDsAttributes] = useState<string[]>([]);

  const uniquieDHnames = useAppSelector(state => new Set(state.userfeat.rdvcomdh.map(dh => dh.compname)));
  const uniquieDLnames = useAppSelector(state => new Set(state.userfeat.rdvcompdl.map(dl => dl.compname)));

  // Get unique tenant IDs and BKC areas from tenantBkccs
  const uniqueTenantIds = Array.from(new Set(['default', ...tenantBkccs.map(t => t.tenantid)]));
  const uniqueBkcAreas = Array.from(new Set(['default', ...tenantBkccs.map(t => t.bkcarea)]));

  ///

  useEffect(() => {
    const fetchDsAttributes = async () => {
      const resp = await dispatch(getTableColumnsAsync({ tablename: "datasets", dataset: currentDs.dsname, project: currentDs.projectshortname, datastore: currentDs.dsname }));
      if (resp.payload.status === 200) {
        setAvailableDsAttributes(resp.payload.data || []);
      }
    };
    // if (selectedDataset) {
    fetchDsAttributes();
    // }
  }, [dispatch, dsName]);

  const isFormValid = () => {
    return (
      dsName !== '' &&
      selectedDsAttributes.length > 0 &&
      associatedCompType !== '' &&
      associatedCompName !== '' &&
      tenantId !== '' &&
      bkcArea !== '' &&
      version > 0 &&
      partsNumber >= 0 &&
      parts.length === partsNumber

    );
  };

  const handleValidate = async () => {
    if (parts.length !== partsNumber) {
      toast.error('Please select correct number of parts');
      return;
    }

    if (!isFormValid()) {
      toast.error('Please fill in all required fields before validating');
      return;
    }

    try {
      setIsValidated(true);
      toast.success('Configuration is valid');
    } catch (error) {
      console.error(error);
      setIsValidated(false);
      toast.error('Validation failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidated) {
      toast.error('Please validate the configuration first');
      return;
    }

    try {
      await dispatch(updateRdvCompDsAsync({
        rdvid: currentDs.rdvid!,
        rdvcompdsData: {
          projectshortname: currentDs.projectshortname,
          dpname: currentDs.dpname!,
          dsname: currentDs.dsname,
          comptype: componentType,
          assoccompname: associatedCompName,
          assoccomptype: associatedCompType,
          tenantid: tenantId,
          bkcarea: bkcArea,
          version: version,
          satlattr: selectedDsAttributes,
          satlname: currentDs.satlname,
          compshortname: dsName,
          parts,
          partsnum: partsNumber
        }
      })).unwrap();

      toast.success('DS component updated successfully');
      router.push('/user/define-dss');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update DS component');
    }
  };

  useEffect(() => {
    setIsValidated(false);
  }, [
    dsName,
    selectedDsAttributes,
    associatedCompType,
    associatedCompName,
    tenantId,
    bkcArea,
    version
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      {/* Project, Data Product, Dataset info (read-only) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project</label>
          <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
            {currentDs.projectshortname}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Product</label>
          <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
            {currentDs.dpname}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dataset</label>
          <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
            {currentDs.dsname}
          </div>
        </div>
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
        <select
          id="dsAttributes"
          multiple
          value={selectedDsAttributes}
          onChange={(e) => setSelectedDsAttributes(Array.from(e.target.selectedOptions, option => option.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          {availableDsAttributes.map(attr => (
            <option key={attr} value={attr}>{attr}</option>
          ))}
        </select>
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
          <option value="">Select type</option>
          <option value="dh">DH</option>
          <option value="dl">DL</option>
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
        >
          <option value="">Select name</option>
          {associatedCompType === 'dh' && Array.from(uniquieDHnames).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
          {associatedCompType === 'dl' && Array.from(uniquieDLnames).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

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
          <option value="">Select tenant ID</option>
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
          <option value="">Select BKC area</option>
          {uniqueBkcAreas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
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
          onChange={(e) => setVersion(Number(e.target.value))}
          min="1"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* PartsNumber dropdown */}
      <div>
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
              setParts([...parts, ...Array.from({ length: n - parts.length }, () => '')]);
            }
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          {Array.from({ length: 6 }, (_, i) => i).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Parts dropdown */}
      {
        <select value={parts}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setParts(values);
          }}
          className="mt-1 block h-32 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          multiple
          size={partsNumber}
        >
          {availableDsAttributes.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      }

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
          Update
        </button>
      </div>
    </form>
  );
}