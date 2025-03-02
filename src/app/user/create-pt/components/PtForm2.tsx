"use client";

import { Dataset, DvCompPt } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  testDvCompPtAsync,
  createDvCompPtAsync,
  updateDvCompPtAsync
} from "@/store/userfeat/dvcompptThunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface PtFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedRecord?: DvCompPt; // For update mode
  isUpdate: boolean;
  setQueryResult: (result: { headers: string[]; rows: any[][]; error: string }) => void;
}


interface SatelliteRow {
  num: number;
  name: string;
  version: number;
}

export function PtForm2({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedRecord,
  isUpdate = false,
  setQueryResult,
}: PtFormProps) {
  const dispatch = useAppDispatch();
  const [isValidated, setIsValidated] = useState(false);
  const [componentName, setComponentName] = useState(selectedRecord?.compname || "");
  const [dlName, setDlName] = useState("");
  const [componentType, setComponentType] = useState<"bv" | "im" | "others">(
    (selectedRecord?.comptype as "bv" | "im" | "others") || "bv"
  );
  const [componentSubtype, setComponentSubtype] = useState("PIT");


  const [comments, setComments] = useState(selectedRecord?.comments || "");
  const [version, setVersion] = useState(selectedRecord?.version || 1);


  const dls = useAppSelector((state) =>
    state.userfeat.rdvcompdl
  );
 
  const existingComponentNames = Array.from(
    new Set(dls.filter((dl) => dl.projectshortname === selectedProject && dl.comptype === 'dl').map((dl) => dl.compname))
  )
  
  // Get unique project names from datasets
  const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active).map(pa => pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))
  const [satlNums, setSatlNums] = useState<number>(1);
  const [satelliteRows, setSatelliteRows] = useState<SatelliteRow[]>([
      { num: 1, name: '', version: 1 }
    ]);
 // Get satellite names and versions from DS table
 const dsComponents = useAppSelector(state =>
  state.userfeat.rdvcompds.filter(ds => ds.assoccomptype === 'dl')
);

    // Get unique satellite names
  const availableSatlNames = Array.from(new Set(dsComponents.filter(ds => ds.projectshortname == selectedProject && ds.assoccompname === dlName).map(ds => ds.satlname)));
   

    // Get available versions for selected satellite name
    const getAvailableVersions = (satlName: string) => {
      return dsComponents
        .filter(ds => ds.satlname === satlName)
        .map(ds => ds.version)
        .filter((value, index, self) => self.indexOf(value) === index);
    };
  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      componentName !== '' 
    );
  };

  const handleValidate = async () => {

    if (!isFormValid()) {
      toast.error('Please fill in all required fields before validating');
      return false;
    }

    try {
      const payload: DvCompPt = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        compshortname: `${selectedProject}_${componentType}_${componentSubtype}_${componentName}_${dlName}_${version}`.toLowerCase(),
        satlnums: satlNums,
        comments,
        version,
        dlname : dlName,
        satlname: satelliteRows.map(row => row.name).join(','),
        satlversion: satelliteRows[0].version//satelliteRows.map(row => row.version).join(','),
      };
      await toast.promise(
        dispatch(testDvCompPtAsync(payload)).unwrap(),
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
    componentSubtype
  ]);

  useEffect(() => {
    // Update satellite rows when satlNums changes
    const newRows = Array.from({ length: satlNums }, (_, i) => ({
      num: i + 1,
      name: satelliteRows[i]?.name || '',
      version: satelliteRows[i]?.version || 1
    }));
    setSatelliteRows(newRows);
  }, [satlNums]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!(await handleValidate())) return;

    try {
        if (isUpdate) {
        // Update mode
        for (const row of satelliteRows) {
          await dispatch(updateDvCompPtAsync({
            dvid: selectedRecord?.dvid || 0,
            dvcompptData: {
            projectshortname: selectedProject,
            comptype: componentType,
            compname: componentName,
            compsubtype: componentSubtype,
            compshortname: `${selectedProject}_${componentType}_${componentSubtype}_${componentName}_${dlName}_${version}`.toLowerCase(),
            satlnums: satlNums,
            dlname : dlName,
            satlnum: row.num,
            satlname: row.name,
            satlversion: row.version,
            comments,
            version,
          }
          })).unwrap();
        }
        toast.success("PT configuration updated successfully");
      } else {
        // Create mode
        for (const row of satelliteRows) {
                await dispatch(createDvCompPtAsync({
                  projectshortname: selectedProject,
                  comptype: componentType,
                  compname: componentName,
                  compsubtype: componentSubtype,
                  compshortname: `${selectedProject}_${componentType}_${componentSubtype}_${componentName}_${dlName}_${version}`.toLowerCase(),
                  satlnums: satlNums,
                  dlname : dlName,
                  satlnum: row.num,
                  satlname: row.name,
                  satlversion: row.version,
                  comments,
                  version,
                })).unwrap();
              }
        toast.success("PT configuration created successfully");
      }

      // Reset form
      setComponentName("");
      setComments("");
      setVersion(1);
      setIsValidated(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to ${selectedRecord ? 'update' : 'create'} PT configuration`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isUpdate ? 'Update' : 'Create'} PT Configuration
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
          <option value="pit">PIT</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dlName"
            className="block text-sm font-medium text-gray-700"
          >
            DL Name
          </label>
          <select
            id="dlName"
            value={dlName}
            onChange={(e) => setDlName(e.target.value as any)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
          <option value="">Select Name</option>
          {Array.from(existingComponentNames).map((compname) => (
              <option key={compname} value={compname}>
                {compname}
              </option>
            ))}
          </select>
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
          onChange={(e) => setSatlNums(Math.min(18, Math.max(1, parseInt(e.target.value))))}
          min={1}
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
              disabled={!row.name}
            >
              <option value="">Select Version</option>
              {getAvailableVersions(row.name).map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
          </div>
        </div>
      ))}


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
            Create PT
          </button>
        </div>
      </form>
    </div>
  );
}
