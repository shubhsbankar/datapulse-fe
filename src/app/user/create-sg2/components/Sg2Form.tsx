"use client";

import { Dataset, DvCompSg2 } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createDvCompSg2Async,
  getAllDvCompSg2ColumnsAsync,
  testDvCompSg2Async,
  updateDvCompSg2Async,
} from "@/store/userfeat/dvcompsg2Thunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Sg2FormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedRecord?: DvCompSg2; // For update mode
  isUpdate: boolean;
  setQueryResult: (result: { headers: string[]; rows: any[][]; error: string } | null) => void;
}

export function Sg2Form({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedRecord,
  isUpdate = false,
  setQueryResult,
}: Sg2FormProps) {
  const dispatch = useAppDispatch();
  const [isValidated, setIsValidated] = useState(false);
  const [componentName, setComponentName] = useState(selectedRecord?.compname || "");
  const [componentType, setComponentType] = useState<"bv" | "im" | "others" | "dv" | "">(
    (selectedRecord?.comptype as "bv" | "im" | "others" | "dv" | "") || ""
  );
  const [componentSubtype, setComponentSubtype] = useState<
    "brdg" | "derived-cal" | "derived-cs" | "derived-el" | "derived-others" | "dd" | "ft" | "others" | "dh" | "ds" | "dl" | ""
  >((selectedRecord?.compsubtype as  "brdg" | "derived-cal" | "derived-cs" | "derived-el" | "derived-others" | "dd" | "ft" | "others" | "dh" | "ds" | "dl" | ""));
  const [sqlText, setSqlText] = useState(selectedRecord?.sqltext?.[0] || "");
  // const [processType, setProcessType] = useState<"app" | "ow">(
  //   (selectedRecord?.processtype as "app" | "ow") || "app"
  // );
  const [comments, setComments] = useState(selectedRecord?.comments || "");
  const [version, setVersion] = useState(selectedRecord?.version || 1);

  // Get unique project names from datasets
  const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active).map(pa => pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))

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
      const payload: DvCompSg2 = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        comments,
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

      const data = await dispatch(testDvCompSg2Async(payload)).unwrap()
      if (Object.keys(data.data).length !== 0) {
        setQueryResult(data.data);
    }
    else {
      setQueryResult(null);
    }
      
      if (data.data.error) {
        setIsValidated(false);
        toast.error(data.data.error);
        return false;
      }
      toast.success(data.message || 'Configuration is valid');
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Validation failed');
      setIsValidated(false);
      return false;
    }
  };


  // useEffect(() => {
  //   setIsValidated(false);
  // }, [
  //   componentType,
  //   componentSubtype,
  // ]);

  useEffect(() => {
    console.log("ComponentSubType changed",componentSubtype);
  },[componentSubtype]);

  // useEffect(() => {
  //   if (componentType == 'bv') {
  //     setComponentSubtype('brdg');
  //   } else if (componentType == 'im') {
  //     setComponentSubtype('dd');
  //   } else if (componentType == 'dv') {
  //     setComponentSubtype('dh');
  //   }else {
  //     setComponentSubtype('others');
  //   }

  // }, [componentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await handleValidate())) return;

    try {
      const payload: DvCompSg2 = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        comments,
        compshortname: `${selectedProject}-${componentType}-${componentSubtype}-${componentName}-${version}`,
        version
      };

      if (isUpdate) {
        // Update mode
        await dispatch(updateDvCompSg2Async({
          rdvid: selectedRecord?.dvid || 0,
          dvcompsg2Data: payload
        })).unwrap();
        toast.success("SG 2 configuration updated successfully");
      } else {
        // Create mode
        await dispatch(createDvCompSg2Async(payload)).unwrap();
        toast.success("SG 2 configuration created successfully");
      }

      // Reset form
      setVersion(1);
      setIsValidated(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to ${selectedRecord ? 'update' : 'create'} SG 2 configuration`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isUpdate ? 'Update' : 'Create'} SG 2 Configuration
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
            onChange={(e) => {setComponentType("");setSelectedProject(e.target.value)}}
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
            onChange={(e) => setComponentType(e.target.value as "bv" | "im" | "dv")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Component Type</option>
            <option value="bv">BV</option>
            <option value="im">IM</option>
            <option value="dv">DV</option>
            <option value="others">Others</option>
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
            onChange={(e) => {console.log(e.target.value);setComponentSubtype(e.target.value as "brdg" | "derived-cal" | "derived-cs" | "derived-el" | "derived-others" | "dd" | "ft" | "others" | "dh" | "ds" | "dl")}}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            {componentType === "bv" ? (
              <>
               <option value="">Select Component Subype</option>
                <option value="brdg">BRDG</option>
                <option value="derived-cs">Derived-CS</option>
                <option value="derived-cal">Derived-CAL</option>
                <option value="derived-el">Derived-EL</option>
                <option value="derived-others">Derived-Others</option>
              </>
            ) : (componentType === "im" ? (
              <>
               <option value="">Select Component Subtype</option>
                <option value="dd">DD</option>
                <option value="ft">FT</option>
              </>
            ) : (componentType === "dv" ? (
              <>
               <option value="">Select Component Subtype</option>
                <option value="dh">DH</option>
                <option value="ds">DS</option>
                <option value="dl">DL</option>
              </>
            ) : (<> 
            <option value="">Select Component Subtype</option>
            <option value="others">Others</option>
            </>)))
            }
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
            placeholder="Enter a SELECT or CREATE SQL statement"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
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
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>


        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdate ? 'Update' : 'Create'} SG 2 Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
