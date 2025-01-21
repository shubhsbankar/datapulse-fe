"use client";

import { Dataset, DvCompFt } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createDvCompFtAsync,
  // getAllRdvCompFtColumnsAsync,
  testDvCompFtAsync,
  updateDvCompFtAsync,
} from "@/store/userfeat/dvcompftThunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {  getTableColumnsAsync
} from "@/store/userfeat/dvcompddThunks";

interface FtFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedRecord?: DvCompFt; // For update mode
  isUpdate: boolean;
  setQueryResult: (result: { headers: string[]; rows: any[][]; error: string }) => void;
}

export function FtForm({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedRecord,
  isUpdate = false,
  setQueryResult,
}: FtFormProps) {
  const dispatch = useAppDispatch();
  const [dateFieldName, setDateFieldName] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [componentName, setComponentName] = useState(selectedRecord?.compname || "");
  const [componentType, setComponentType] = useState<"im">(
    (selectedRecord?.comptype as  "im") || "im"
  );
  const [componentSubtype, setComponentSubtype] = useState<
    "type1" | "type2" 
  >((selectedRecord?.compsubtype as "type1" | "type2" ) || "type1");
  const [sqlText, setSqlText] = useState(selectedRecord?.sqltext?.[0] || "");

  const [comments, setComments] = useState(selectedRecord?.comments || "");
  const [version, setVersion] = useState(selectedRecord?.version || 1);
  const [availableDateFieldName, setAvailableDateFieldName] = useState<string[]>([]);

  // Get unique project names from datasets
  const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active).map(pa => pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))

 useEffect(() => {
      const fetchDateFieldNames = async () => {
        // if (selectedDataset) {
          const resp = await dispatch(getTableColumnsAsync({ project: selectedProject, comptype: componentType, compname: componentName }));
          if (resp.payload.status === 200) {
            setAvailableDateFieldName(resp.payload.data || []);
          }
        // }
      };
      fetchDateFieldNames();
    }, [dispatch, selectedProject, componentName]);
  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      componentName !== '' &&
      sqlText !== ''
    );
  };

  const handleValidate = async () => {

    if (!isFormValid()) {
      toast.error('Please fill in all required fields before validating');
      return false;
    }

    try {
      const payload: DvCompFt = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        comments,
        version
      };

      // await toast.promise(
      //   dispatch(testDvCompSg1Async(payload)).unwrap(),
      //   {
      //     loading: 'Validating configuration...',
      //     success: (data) => {
      //       setQueryResult(data.data);

      //       setIsValidated(true);
      //       return data.message || 'Configuration is valid';
      //     },
      //     error: (err) => {
      //       setIsValidated(false);
      //       return err.message || 'Validation failed';
      //     }
      //   }
      // );

      const data = await dispatch(testDvCompFtAsync(payload)).unwrap()
      setQueryResult(data.data);
      if (data.data.error) {
        setIsValidated(false);
        toast.error(data.data.error);
        return false;
      }
      toast.success(data.message || 'Configuration is valid');
      setIsValidated(true);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Validation failed');
      setIsValidated(false);
      return false;
    }
  };


  useEffect(() => {
    setIsValidated(false);
  }, [
    selectedProject,
    componentName,
    componentType,
    componentSubtype,
    sqlText,
  ]);

  // useEffect(() => {
  //   if (componentType == 'bv') {
  //     setComponentSubtype('pt');
  //   } else if (componentType == 'im') {
  //     setComponentSubtype('dd');
  //   } else {
  //     setComponentSubtype('others');
  //   }

  // }, [componentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await handleValidate())) return;

    try {
      const payload: DvCompFt = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        comments,
        compshortname: `${selectedProject}-${componentType}-${componentSubtype}-${componentName}-${version}`,
        version,
        datefieldname: dateFieldName
      };

      if (isUpdate) {
        // Update mode
        await dispatch(updateDvCompFtAsync({
          rdvid: selectedRecord?.dvid || 0,
          rdvcompftData: payload
        })).unwrap();
        toast.success("FT configuration updated successfully");
      } else {
        // Create mode
        await dispatch(createDvCompFtAsync(payload)).unwrap();
        toast.success("FT configuration created successfully");
      }

      // Reset form
      setComponentName("");
      setSqlText("");
      setComments("");
      setVersion(1);
      setIsValidated(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to ${selectedRecord ? 'update' : 'create'} FT configuration`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isUpdate ? 'Update' : 'Create'} FT Configuration
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
            onChange={(e) => setComponentType(e.target.value as  "im")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="bv">BV</option>
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
            onChange={(e) => setComponentSubtype(e.target.value as 'type1' | 'type2')}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
   
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
           
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
            htmlFor="dateFieldName"
            className="block text-sm font-medium text-gray-700"
          >
            Date Field Name
          </label>
          <select
            id="dateFieldName"
            value={dateFieldName}
            onChange={(e) => setDateFieldName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Date Field Name</option>
               {
                availableDateFieldName.map(df => <option value={df} key={df}>{df}</option>)
              }
                
          </select>
        </div>
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            Comments
          </label>
          <textarea
            id="comment"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
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
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:opacity-50"
            required
          />
        </div>


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
            Create FT Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
