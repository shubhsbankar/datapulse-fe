"use client";

import { Dataset, DvCompSg1 } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createDvCompSg1Async,
  getAllDvCompSg1ColumnsAsync,
  testDvCompSg1Async,
  updateDvCompSg1Async,
} from "@/store/userfeat/dvcompsg1Thunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import SortableMultiSelect from "@/components/ui/multiselect";

interface SgFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedRecord?: DvCompSg1; // For update mode
  isUpdate: boolean;
  setQueryResult: (result: { headers: string[]; rows: any[][]; error: string }) => void;
}

export function SgForm({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedRecord,
  isUpdate = false,
  setQueryResult,
}: SgFormProps) {
  const dispatch = useAppDispatch();
  const [isValidated, setIsValidated] = useState(false);
  const [componentName, setComponentName] = useState(selectedRecord?.compname || "");
  const [componentType, setComponentType] = useState<"bv" | "im">(
    (selectedRecord?.comptype as "bv" | "im") || "bv"
  );
  const [componentSubtype, setComponentSubtype] = useState<
    "pt" | "brdg" | "derived" | "cds" | "cdl" | "edl" | "dd" | "ft"
  >((selectedRecord?.compsubtype as "pt" | "brdg" | "derived" | "cds" | "cdl" | "edl" | "dd" | "ft") || "pt");
  const [sqlText, setSqlText] = useState(selectedRecord?.sqltext?.[0] || "");
  const [processType, setProcessType] = useState<"app" | "ow">(
    (selectedRecord?.processtype as "app" | "ow") || "app"
  );
  const [dateFieldName, setDateFieldName] = useState(selectedRecord?.datefieldname || "");
  const [comments, setComments] = useState(selectedRecord?.comments || "");
  const [version, setVersion] = useState(selectedRecord?.version || 1);
  const [partsNumber, setPartsNumber] = useState(selectedRecord?.partsnum || 0);
  const [parts, setParts] = useState<string[]>(selectedRecord?.parts || []);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // Get unique project names from datasets
  const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active).map(pa => pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))

  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      componentName !== '' &&
      sqlText !== '' &&
      dateFieldName !== '' &&
      // /^\d{4}-\d{2}-\d{2}$/.test(dateFieldName) // Validate yyyy-mm-dd format
      partsNumber == parts.length
    );
  };

  const handleValidate = async () => {
    if (partsNumber != parts.length) {
      toast.error('Please select the correct number of parts');
      return;
    }

    if (!isFormValid()) {
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFieldName)) {
      //   toast.error('Date field name must be in yyyy-mm-dd format');
      // } else {
        toast.error('Please fill in all required fields before validating');
      // }
      return;
    }

    try {
      const payload: DvCompSg1 = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        processtype: processType,
        datefieldname: dateFieldName,
        comments,
        version,
      };

      await toast.promise(
        dispatch(testDvCompSg1Async(payload)).unwrap(),
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

  // useEffect(() => {
  //   // get the columns from the selected dataset
  //   dispatch(getAllDvCompSg1ColumnsAsync({ projectshortname: selectedProject })).unwrap()
  //     .then((data) => {
  //       console.log()
  //       setAvailableColumns(data.data);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, [selectedProject]);

  useEffect(() => {
    setIsValidated(false);
  }, [
    selectedProject,
    componentName,
    componentType,
    componentSubtype,
    sqlText,
    processType,
    dateFieldName,
    parts.join(','),
    partsNumber
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidated) {
      toast.error('Please validate the configuration first');
      return;
    }

    try {
      const payload: DvCompSg1 = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        processtype: processType,
        datefieldname: dateFieldName,
        comments,
        version,
        parts,
        partsnum: partsNumber,
        // >> compshortname is the concat of projectshortname, comptype, compname
        compshortname: `${selectedProject}-${componentType}-${componentName}`,
      };

      if (isUpdate) {
        // Update mode
        await dispatch(updateDvCompSg1Async({
          rdvid: selectedRecord?.rdvid || 0,
          dvcompsg1Data: payload
        })).unwrap();
        toast.success("SG configuration updated successfully");
      } else {
        // Create mode
        await dispatch(createDvCompSg1Async(payload)).unwrap();
        toast.success("SG configuration created successfully");
      }

      // Reset form
      setComponentName("");
      setSqlText("");
      setDateFieldName("");
      setComments("");
      setVersion(1);
      setIsValidated(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to ${selectedRecord ? 'update' : 'create'} SG configuration`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isUpdate ? 'Update' : 'Create'} SG Configuration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="project"
            className="block text-sm font-medium text-gray-700"
          >
            Project
          </label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
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
            onChange={(e) => setComponentType(e.target.value as "bv" | "im")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="bv">BV</option>
            <option value="im">IM</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="componentName"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="componentSubtype"
            className="block text-sm font-medium text-gray-700"
          >
            Component Subtype
          </label>
          <select
            id="componentSubtype"
            value={componentSubtype}
            onChange={(e) => setComponentSubtype(e.target.value as any)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            {componentType === "bv" ? (
              <>
                <option value="pt">PT</option>
                <option value="brdg">BRDG</option>
                <option value="derived">Derived</option>
                <option value="cds">CDS</option>
                <option value="cdl">CDL</option>
                <option value="edl">EDL</option>
              </>
            ) : (
              <>
                <option value="dd">DD</option>
                <option value="ft">FT</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="sqlText"
            className="block text-sm font-medium text-gray-700"
          >
            SQL Text
          </label>
          <textarea
            id="sqlText"
            value={sqlText}
            onChange={(e) => setSqlText(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="processType"
            className="block text-sm font-medium text-gray-700"
          >
            Process Type
          </label>
          <select
            id="processType"
            value={processType}
            onChange={(e) => setProcessType(e.target.value as "app" | "ow")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="app">APP</option>
            <option value="ow">OW</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dateFieldName"
            className="block text-sm font-medium text-gray-700"
          >
            Date Field Name (yyyy-mm-dd)
          </label>
          <input
            type="text"
            id="dateFieldName"
            value={dateFieldName}
            onChange={(e) => setDateFieldName(e.target.value)}
            placeholder="yyyy-mm-dd"
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
        </div> */}

        {/* Parts dropdown */}
        {/* <SortableMultiSelect
          value={parts}
          onChange={setParts}
          options={availableColumns}
        /> */}


        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleValidate}
            // disabled={!isFormValid()}
            className={cn(
              "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              isValidated
                ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                // : !isFormValid()
                //   ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
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
            {isUpdate ? 'Update' : 'Create'} SG Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
