"use client";

import { Dataset, DvCompFt, DvCompDd } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import SortableMultiSelect from "@/components/ui/multiselect";
import {
  createDvCompFtAsync,
  // getAllRdvCompFtColumnsAsync,
  testDvCompFtAsync,
  updateDvCompFtAsync,
  getTableColumnsAsync
} from "@/store/userfeat/dvcompftThunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";


interface FtFormProps {
  datasets: Dataset[];
  ddRecords: DvCompDd[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedRecord?: DvCompFt; // For update mode
  isUpdate: boolean;
  setQueryResult: (result: { headers: string[]; rows: any[][]; error: string }) => void;
}
interface DdConfig {
  ddName: string;
  ddVersion: string;
  bkfields: string[];
}

export function FtForm({
  datasets,
  ddRecords,
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
    (selectedRecord?.comptype as "im") || "im"
  );
  const [componentSubtype, setComponentSubtype] = useState<
    "type1" | "type2"
  >((selectedRecord?.compsubtype as "type1" | "type2") || "type1");
  const [sqlText, setSqlText] = useState(selectedRecord?.sqltext?.[0] || "");
  const [isValidSql, setIsValidSql] = useState(false);

  const [comments, setComments] = useState(selectedRecord?.comments || "");
  const [version, setVersion] = useState(selectedRecord?.version || 1);
  const [availableDateFieldName, setAvailableDateFieldName] = useState<string[]>([]);

  // Get unique project names from datasets
  const projects = useAppSelector(state => state.project.projectAssigns.filter(pa => pa.useremail == state.user.currentUser.useremail && pa.is_active).map(pa => pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))

  const [ddCount, setDdCount] = useState<number>(1);
  const [ddConfigs, setDdConfigs] = useState<DdConfig[]>(() => 
    Array(1).fill(null).map(() => ({
      ddName: '',
      ddVersion: '1', 
      bkfields: []
    }))
  );

  const availableDds = ddRecords
  .filter(dd => dd.projectshortname === selectedProject)
  .map(dd => ({
    name: dd.compname,
    version: dd.version?.toString() || '1',
    bkfields: dd.bkfields || []
  }))
  console.log("availableDds", availableDds);
  //  useEffect(() => {
  //       const fetchDateFieldNames = async () => {
  //         // if (selectedDataset) {
  //           const resp = await dispatch(getTableColumnsAsync({ project: selectedProject, comptype: componentType, compname: componentName }));
  //           if (resp.payload.status === 200) {
  //             setAvailableDateFieldName(resp.payload.data || []);
  //           }
  //         // }
  //       };
  //       fetchDateFieldNames();
  //     }, [dispatch, selectedProject, componentName]);
  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      componentName !== '' &&
      sqlText !== '' &&
      ddConfigs.every(config => config.ddName !== '' && config.bkfields.length > 0)
    );
  };

  const handleValidate = async () => {

    if (!isFormValid()) {
      const missingFields = [];
      if (selectedProject === "") missingFields.push("Project");
      if (componentName === "") missingFields.push("Component Name"); 
      if (sqlText === "") missingFields.push("SQL Text");
      if (!ddConfigs.every(config => config.ddName !== '' && config.bkfields.length > 0)) {
        missingFields.push("DD Configurations");
      }
      toast.error(`Please fill in the following required fields: ${missingFields.join (", ")}`);
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
        version: version || 1,
        datefieldname: dateFieldName,
        ddnums: ddCount || 1,
        ddnum: 1,
        ddname: ddConfigs.map(config => config.ddName).join(','),
        ddversion: ddConfigs[0].ddVersion,
        bkfields: ddConfigs.map(config => config.bkfields.join(','))
      };
  

      await toast.promise(
        dispatch(testDvCompFtAsync(payload)).unwrap(),
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
    componentSubtype,
    sqlText,
    ddConfigs
  ]);

  useEffect(() => {
    setDdConfigs(prev => {
      // Create new array with length of ddCount
      const newConfigs = Array(ddCount).fill(null).map((_, i) => {
        // Preserve existing config if available, otherwise create new one
        return i < prev.length ? prev[i] : {
          ddName: '',
          ddVersion: '1',
          bkfields: []
        };
      });
      return newConfigs;
    });
  }, [ddCount]);

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
    console.log("Submit button clicked"); // Add this line

    // const validationResult = await handleValidate();
    // if (!validationResult) {
    //   console.log("SHubham Validation failed");
    //   return;
    // }

    try {
      console.log("Attempting to submit..."); // Add this line
      
      const payload: DvCompFt = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        comments,
        compshortname: `${selectedProject}_${componentType}_${componentSubtype}_${componentName}_${version}`,
        version,
        datefieldname: dateFieldName,
        ddnums: ddCount,
        ddnum: 1,
        ddname: ddConfigs[0].ddName ,
        ddversion: ddConfigs[0].ddVersion,
        bkfields: ddConfigs[0].bkfields
      };

      console.log("Payload:", payload); // Add this line

      if (isUpdate) {
        // Update mode
        const response = await dispatch(updateDvCompFtAsync({
          rdvid: selectedRecord?.dvid || 0,
          rdvcompftData: payload
        })).unwrap();
        console.log("Update response:", response); // Add this line
        toast.success("FT configuration updated successfully");
      } else {
        // Create mode
        const response = await dispatch(createDvCompFtAsync(payload)).unwrap();
        console.log("Create response:", response); // Add this line
        for (let i = 1; i < ddConfigs.length; i++) {
          const additionalResponse = await dispatch(createDvCompFtAsync({
            ...payload,
            ddname: ddConfigs[i].ddName,
            ddversion:  ddConfigs[i].ddVersion,
            bkfields:  ddConfigs[i].bkfields, 
            ddnum:  i + 1,
          })).unwrap();
          console.log(`Additional DD ${i + 1} response:`, additionalResponse); // Add this line
        }
        toast.success("FT configuration created successfully");
      }

      // Reset form
      setComponentName("");
      setSqlText("");
      setComments("");
      setVersion(1);
      setIsValidated(false); 
      setDdConfigs(Array(1).fill(null).map(() => ({
        ddName: '',
        ddVersion: '1',
        bkfields: []
      })));
      setDdCount(1);
      setDateFieldName("");
      setComponentType("im");
      setComponentSubtype("type1");
      setSelectedProject("");
    } catch (error: any) {
      console.error("Submit error:", error); // Add this line
      toast.error(error.message || `Failed to ${selectedRecord ? 'update' : 'create'} FT configuration`);
    }
  };
  useEffect(() => {
    const fetchDatefields = async () => {
       if (sqlText.length > 0 && isValidSql) {
      const resp = await dispatch(getTableColumnsAsync({ sqltext: sqlText }));
      if (resp.payload.status === 200) {
        setAvailableDateFieldName(resp.payload.data || []);
      }
      }
    };
    fetchDatefields();
  }, [sqlText, dispatch]);

  const validateSqlInput = (value: string) => {
    // Basic validation to check if the input starts with "SELECT"
    if (/^\s*SELECT\b/i.test(value)) {
      setIsValidSql(true); // Clear any previous error
      // fetchBkfields()
    } else {
      setIsValidSql(false);
    }
    setSqlText(value);
    setDateFieldName('');
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
            onChange={(e) => setComponentType(e.target.value as "im")}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
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
            onChange={(e) => validateSqlInput(e.target.value)}
            placeholder="Enter a SELECT or select SQL statement"
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
            Date Field Name  (Select date, timestamp or yyyy-mm-dd type)
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

        {/* DD Count Selection */}
        <div>
          <label
            htmlFor="ddCount"
            className="block text-sm font-medium text-gray-700"
          >
            DD Count (1-14)
          </label>
          <input
            type="number"
            id="ddCount"
            value={ddCount}
            onChange={(e) =>
              setDdCount(Math.min(14, Math.max(1, parseInt(e.target.value))))
            }
            min={1}
            max={14}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        {/* Warning Message */}
        <div className="mt-2 mb-2">
          <p className="text-sm text-amber-600 font-medium">
            Please select the same bkfields in the same order of dd
          </p>
        </div>

        {/* DD Configurations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            DD Configurations
          </h3>
          {ddConfigs.map((config, index) => (
            <div key={index} className="border rounded-md p-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                DD {index + 1}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DD Name
                  </label>
                  <select
                    value={config.ddName}
                    onChange={(e) => {
                      const newConfigs = [...ddConfigs];
                      newConfigs[index].ddName = e.target.value;
                      if (e.target.value === '') {
                        // Reset values when no DD is selected
                        newConfigs[index].ddVersion = '1';
                        newConfigs[index].bkfields = [];
                      } else {
                        const selectedLink = availableDds.find(
                          (h) => h.name === e.target.value
                        );
                        if (selectedLink) {
                          newConfigs[index].ddVersion = selectedLink.version;
                          newConfigs[index].bkfields = selectedLink.bkfields;
                        }
                      }
                      setDdConfigs(newConfigs);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Link</option>
                    {Array.from(
                      new Set(
                        availableDds
                          .filter(
                            (dd) =>
                              !ddConfigs.some(
                                (cfg) => cfg.ddName == dd.name
                              ) || ddConfigs[index].ddName == dd.name
                          )
                          .map((n) => n.name)
                      )
                    ).map((dd) => (
                      <option key={dd} value={dd}>
                        {dd}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DD Version
                  </label>
                  <input
                    type="text"
                    value={config.ddVersion}
                    readOnly
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        BK Fields
                      </label>
                      <SortableMultiSelect
                        onChange={(e) => {
                          const newConfigs = [...ddConfigs];
                          newConfigs[index].bkfields = e;
                          setDdConfigs(newConfigs);
                        }}
                        value={config.bkfields}
                        options={availableDateFieldName
                          .filter(
                            (f) =>
                              !(dateFieldName === f) && !ddConfigs.some((cfg, idx) => idx !== index && cfg.bkfields.includes(f))
                          )}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
            type="submit"
            disabled={!isValidated}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdate ? 'Update' : 'Create'} FT Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
