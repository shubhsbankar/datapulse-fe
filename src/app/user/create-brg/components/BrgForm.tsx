"use client";

import { DvCompBrg } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createDvCompBrgAsync, getAllDvCompBrgColumnsAsync, testDvCompBrgAsync } from "@/store/userfeat/dvcompbrgThunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import SortableMultiSelect from "@/components/ui/multiselect";

interface BrgFormProps {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  setQueryResult: (results: { headers: string[]; rows: any[][]; error: string }) => void;
  selectedRecord:DvCompBrg
  dvcompbrgs: DvCompBrg[];
}

export function BrgForm({
  selectedProject,
  setSelectedProject,
  setQueryResult,
  selectedRecord,
  dvcompbrgs
}: BrgFormProps) {
  const dispatch = useAppDispatch();
  const [componentType, setComponentType] = useState("bv");
  const [componentSubtype, setComponentSubtype] = useState<
    "pt" | "brdg" | "derived" | "cds" | "cdl" | "edl" | "dd" | "ft"
  >("pt");
  const [componentName, setComponentName] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [processType, setProcessType] = useState<"APP" | "OW">("APP");
  // const [dateFieldName, setDateFieldName] = useState("");
  const [comments, setComments] = useState("");
  const [version, setVersion] = useState(1);
  const [compshortname, setCompshortname] = useState("");
  const [partsNumber, setPartsNumber] = useState(0);
  const [parts, setParts] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [dateFieldName, setDateFieldName] = useState("");

  useEffect(() => {
    setIsValidated(false);
    console.log("processType",processType);
  }, [selectedProject, componentType,processType, componentSubtype, dateFieldName, sqlText, componentName, version, partsNumber, parts.join(', ')]);

  // const {projectAssigns} = useAppSelector(state => state.project);
  // const isProjectActive = (project?: string) => {
  //   return projectAssigns.some(p => p.projectshortname === project && p.is_active);
  // }

  // Get unique values based on existing records and current selections
  const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active)?.map(pa => pa.projectshortname))
  const uniqueProjects = Array.from(new Set(projects));
  console.log({ dvcompbrgs });
  // const uniqueComponentTypes = Array.from(new Set(dvcompbrgs?.map(sg => sg.comptype)));
  // console.log({ uniqueComponentTypes });
  const uniqueComponentTypes = ['BV']
  const uniqueComponentSubtypes = ['BRDG', 'Derived-CS', 'Derived-CAL', 'Derived-EL', 'Derived-others']/*Array.from(new Set(dvcompbrgs?.filter(sg => sg.comptype === componentType)
    .map(sg => sg.compsubtype)));*/
  const uniqueComponentNames = Array.from(new Set(dvcompbrgs?.filter(sg => sg.comptype === componentType && sg.compsubtype === componentSubtype)
    .map(sg => sg.compname)));
  const uniqueSqlTemplates = Array.from(new Set(dvcompbrgs?.filter(sg => sg.compname === componentName)
    .map(sg => sg.sqltext).filter(x => !!x))) as string[];
  const uniqueProcessTypes = ['APP','OW']/*Array.from(new Set(dvcompbrgs?.filter(sg => sg.compname === componentName)
    .map(sg => sg.processtype)));*/
  const uniqueDateFieldNames = Array.from(new Set(dvcompbrgs?.filter(sg => sg.compname === componentName)
    .map(sg => sg.datefieldname)));

  // Update compshortname whenever relevant fields change
  useEffect(() => {
    if (selectedProject && componentType && componentName && version) {
      setCompshortname(`${selectedProject}_${componentType}_${componentSubtype}_${componentName}_v${version}`);
    }
  }, [selectedProject, componentType, componentName, version,componentSubtype]);



  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setComponentSubtype("pt");
    setComponentName("");
    setSqlText("");
    setProcessType("app");
    setDateFieldName("");
  }, [componentType]);

  useEffect(() => {
    setComponentName("");
    setSqlText("");
    setProcessType("app");
    setDateFieldName("");
  }, [componentSubtype]);

  useEffect(() => {
    setSqlText("");
    setProcessType("app");
    setDateFieldName("");
  }, [componentName]);

  const isFormValid = () => {
    return (
      selectedProject !== "" &&
      // componentType !== "" &&
      // componentSubtype !== "" &&
      componentName !== "" &&
      sqlText !== "" &&
      // processType !== "" &&
      dateFieldName !== "" &&
      comments !== "" &&
      version > 0 &&
      partsNumber == parts.length
    );
  };

  useEffect(() => {
    const payload = {
      projectshortname: selectedProject,
      comptype: componentType,
      compname: componentName,
    }
    dispatch(getAllDvCompBrgColumnsAsync(payload)).unwrap()
      .then(data => {
        setAvailableColumns(data.data);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to fetch available columns');
      });
  }, [selectedProject, componentType, componentName]);

  const handleValidate = async () => {
    if (!isFormValid()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFieldName)) {
        toast.error('Date field name must be in yyyy-mm-dd format');
      } else {
        toast.error('Please fill in all required fields before validating');
      }
      return;
    }

    try {
      const payload: DvCompBrg = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        processtype: processType,
        datefieldname: dateFieldName,
        comments,
        version,
        compshortname,
      }

      const data = await dispatch(testDvCompBrgAsync(payload)).unwrap();
      setQueryResult(data.data);
      if (data.data.error) {
        setIsValidated(false);
        toast.error(data.data.error);
        return false;
      }
      setIsValidated(true);
      toast.success(data.message || 'Configuration is valid');
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Validation failed');
      setIsValidated(false);
      return false;
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await handleValidate())) return;

    try {
      const payload: DvCompBrg = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        processtype: processType,
        datefieldname: dateFieldName,
        comments,
        version,
        compshortname,
      };

      await dispatch(createDvCompBrgAsync(payload)).unwrap();
      toast.success("SG definition created successfully");

      // Reset form
      setComponentName("");
      setSqlText("");
      setDateFieldName("");
      setComments("");
      setVersion(1);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create SG definition");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Create BRG Component
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            required
          >
            <option value="">Select Project</option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
        {/* Component Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Component Type
          </label>
          <select
            value={componentType}
            onChange={(e) => setComponentType(e.target.value as "bv" | "im")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            disabled={selectedProject === ""}
            required
          >
            <option value="">Select Component Type</option>
            {uniqueComponentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Component Subtype
          </label>
          <select
            value={componentSubtype}
            onChange={(e) => setComponentSubtype(e.target.value as any)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            // disabled={componentType === ""}
            required
          >
            <option value="">Select Component Subtype</option>
            {uniqueComponentSubtypes.map((subtype) => (
              <option key={subtype} value={subtype}>{subtype}</option>
            ))}
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
          <label className="block text-sm font-medium text-gray-700">
            SQL Text
          </label>
          <input
            type="text"
            id="sqlText"
            value={sqlText}
            onChange={(e) => setSqlText(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Process Type
          </label>
          <select
            value={processType}
            onChange={(e) => setProcessType(e.target.value as "APP" | "OW")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            required
          >
            <option value="">Select Process Type</option>
            {uniqueProcessTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dateFieldName"
            className="block text-sm font-medium text-gray-700"
          >
            Date Field Name
          </label>
          <input
            type="text"
            id="dateFieldName"
            value={dateFieldName}
            disabled={processType === 'OW'}
            onChange={(e) => setDateFieldName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="number"
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            min={1}
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
          value={parts}
          onChange={(value) => setParts(value)}
          options={availableColumns}
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
            disabled={!isValidated}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create BRG Configuration
          </button>
        </div>
      </form>
    </div>
  );
}