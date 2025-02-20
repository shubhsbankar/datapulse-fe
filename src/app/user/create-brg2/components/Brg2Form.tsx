"use client";

import { DvCompBrg2, RdvCompDh, RdvCompDl } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createDvCompBrg2Async, testDvCompBrg2Async, getTableColumnsAsync } from "@/store/userfeat/dvcompbrg2Thunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import SortableMultiSelect from "@/components/ui/multiselect";

interface Brg2FormProps {
  selectedProject: string;
  dhRecords: RdvCompDh[];
  dlRecords: RdvCompDl[];
  setSelectedProject: (project: string) => void;
  setQueryResult: (results: { headers: string[]; rows: any[][]; error: string }) => void;
  selectedRecord: DvCompBrg2 | undefined;
  dvcompbrgs: DvCompBrg2[];
}
interface HubConfig {
  hubName: string;
  hubVersion: string;
  bkfields: string[];
}
interface LinkConfig {
  linkName: string;
  linkVersion: string;
  bkfields: string[];
}

export function Brg2Form({
  selectedProject,
  dhRecords,
  dlRecords,
  setSelectedProject,
  setQueryResult,
  selectedRecord,
  dvcompbrgs
}: Brg2FormProps) {
  const dispatch = useAppDispatch();
  const [componentType, setComponentType] = useState("bv");
  const [componentSubtype, setComponentSubtype] = useState<"brdg" | "cal" | "el">("brdg");
  const [componentName, setComponentName] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [isValidSql, setIsValidSql] = useState(false);
  const [processType, setProcessType] = useState<"APP" | "OW" | "">("");
  const [dateFieldName, setDateFieldName] = useState("");
  const [comments, setComments] = useState("");
  const [version, setVersion] = useState(1);
  const [compshortname, setCompshortname] = useState("");
  const [partsNumber, setPartsNumber] = useState(0);
  const [parts, setParts] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [availableDateFieldName, setAvailableDateFieldName] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [availableBkfields, setAvailableBkfields] = useState<string[]>([]);
  const [availableLinkBkfields, setAvailableLinkBkfields] = useState<string[]>([]);
  const [hubCount, setHubCount] = useState<number>(1);
  const [hubConfigs, setHubConfigs] = useState<HubConfig[]>(
    Array(5).fill(null).map(() => ({
      hubName: '',
      hubVersion: '1',
      bkfields: []
    }))
  );
  const [linkCount, setLinkCount] = useState<number>(1);
  const [linkConfigs, setLinkConfigs] = useState<LinkConfig[]>(
    Array(5).fill(null).map(() => ({
      linkName: '',
      linkVersion: '1',
      bkfields: []
    }))
  );
  // Handle hub count change
  useEffect(() => {
    setHubConfigs(prev => {
      const newConfigs = [...prev];
      while (newConfigs.length < hubCount) {
        newConfigs.push({ hubName: '', hubVersion: '1', bkfields: [] });
      }
      return newConfigs.slice(0, hubCount);
    });
  }, [hubCount]);

  useEffect(() => {
    setLinkConfigs(prev => {
      const newConfigs = [...prev];
      while (newConfigs.length < linkCount) {
        newConfigs.push({ linkName: '', linkVersion: '1', bkfields: [] });
      }
      return newConfigs.slice(0, linkCount);
    });
  }, [linkCount]);
  useEffect(() => {
    setIsValidated(false);
    console.log("processType", processType);
    if (processType === "OW" ) {
      setDateFieldName("");
    }
  }, [selectedProject, componentType, processType, componentSubtype, sqlText, componentName, version, partsNumber, parts.join(', ')]);

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
  const uniqueComponentSubtypes = ['BRDG', 'CAL', 'EL']/*Array.from(new Set(dvcompbrgs?.filter(sg => sg.comptype === componentType)
    .map(sg => sg.compsubtype)));*/
  const uniqueComponentNames = Array.from(new Set(dvcompbrgs?.filter(sg => sg.comptype === componentType && sg.compsubtype === componentSubtype)
    .map(sg => sg.compname)));
  const uniqueSqlTemplates = Array.from(new Set(dvcompbrgs?.filter(sg => sg.compname === componentName)
    .map(sg => sg.sqltext).filter(x => !!x))) as string[];
  const uniqueProcessTypes = ['APP', 'OW']/*Array.from(new Set(dvcompbrgs?.filter(sg => sg.compname === componentName)
    .map(sg => sg.processtype)));*/
  // const uniqueDateFieldNames = Array.from(new Set(dvcompbrgs?.filter(sg => sg.compname === componentName)
  //   .map(sg => sg.datefieldname)));

  // Update compshortname whenever relevant fields change
  useEffect(() => {
    if (selectedProject && componentType && componentName && version) {
      setCompshortname(`${selectedProject}_${componentType}_${componentSubtype}_${componentName}_${version}`.toLowerCase());
    }
  }, [selectedProject, componentType, componentName, version, componentSubtype]);

  // Get available hub names from DH records
  const availableHubs = dhRecords
    .filter(dh => dh.projectshortname === selectedProject && dh.comptype === 'dh')
    .map(dh => ({
      name: dh.compname,
      version: dh.version?.toString() || '1',
      bkfields: dh.bkfields || []
    }))

    const availableLinks = dlRecords
    .filter(dl => dl.projectshortname === selectedProject && dl.comptype === 'dl')
    .map(dl => ({
      name: dl.compname,
      version: dl.version?.toString() || '1',
      bkfields: dl.bkfields || []
    }))
    console.log("dlRecords",{dlRecords});
   useEffect(() => {
        const fetchDateFields = async () => {
            const resp = await dispatch(getTableColumnsAsync({ 
              project: selectedProject, 
              comptype: componentType, 
              compname: componentName,
              fieldType: 'date'
            }));
            if (resp.payload.status === 200) {
              setAvailableDateFieldName(resp.payload.data || []);
            }
        };

        const fetchBkFields = async () => {
            const resp = await dispatch(getTableColumnsAsync({ 
              project: selectedProject, 
              comptype: componentType, 
              compname: componentName,
              fieldType: 'bk'
            }));
            if (resp.payload.status === 200) {
              setAvailableBkfields(resp.payload.data || []);
            }
        };

        const fetchLinkBkFields = async () => {
            const resp = await dispatch(getTableColumnsAsync({ 
              project: selectedProject, 
              comptype: componentType, 
              compname: componentName,
              fieldType: 'linkbk'
            }));
            if (resp.payload.status === 200) {
              setAvailableLinkBkfields(resp.payload.data || []);
            }
        };

        if (selectedProject && componentType && componentName) {
          fetchDateFields();
          fetchBkFields(); 
          fetchLinkBkFields();
        }
      }, [dispatch, selectedProject, componentName, componentType]);


  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setComponentSubtype("brdg");
    setComponentName("");
    setSqlText("");
    setProcessType("APP");
    // setDateFieldName("");
  }, [componentType]);

  useEffect(() => {
    setComponentName("");
    setSqlText("");
    setProcessType("APP");
    // setDateFieldName("");
  }, [componentSubtype]);

  useEffect(() => {
    setSqlText("");
    setProcessType("APP");
    // setDateFieldName("");
  }, [componentName]);

  const isFormValid = () => {
    return (
      selectedProject !== "" &&
      // componentType !== "" &&
      // componentSubtype !== "" &&
      componentName !== "" &&
      sqlText !== "" &&
      // processType !== "" &&
      // processType !== 'OW' ? dateFieldName !== "" : true  &&
      comments !== "" &&
      version > 0 &&
      hubCount > 0 &&
      // Check if all hub configs are filled
      hubConfigs.every((config, index) =>
        index < hubCount ? config.hubName !== '' : true
      )
    );
  };

  // useEffect(() => {
  //   const payload = {
  //     projectshortname: selectedProject,
  //     comptype: componentType,
  //     compname: componentName,
  //   }
  //   dispatch(getAllDvCompBrgColumnsAsync(payload)).unwrap()
  //     .then(data => {
  //       setAvailableColumns(data.data);
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       toast.error('Failed to fetch available columns');
  //     });
  // }, [selectedProject, componentType, componentName]);

  const handleValidate = async () => {
    if (!isFormValid()) {
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFieldName)) {
      //   toast.error('Date field name must be in yyyy-mm-dd format');
      // } else {
      //   toast.error('Please fill in all required fields before validating');
      // }
      return;
    }

    try {
      // Validate numeric fields
      const validHubCount = Number(hubCount) || 0;
      const validLinkCount = Number(linkCount) || 0;
      const validVersion = Number(version) || 1;

      // Ensure hubConfigs and linkConfigs arrays have valid entries
      const validHubConfigs = hubConfigs.slice(0, validHubCount);
      const validLinkConfigs = linkConfigs.slice(0, validLinkCount);

      const payload: DvCompBrg2 = {
        projectshortname: selectedProject,
        comptype: componentType,
        compname: componentName,
        compsubtype: componentSubtype,
        sqltext: sqlText,
        processtype: processType,
        datefieldname: dateFieldName,
        comments,
        version: validVersion,
        compshortname,
        hubnum: 1,
        hubnums: validHubCount,
        hubname: validHubConfigs.map(config => config.hubName || '').join(','),
        hubversion: validHubConfigs[0]?.hubVersion || '1',
        bkfields: validHubConfigs.map(config => (config.bkfields || []).join(',')),
        lnknums: validLinkCount,
        lnknum: 1,
        lnkname: validLinkConfigs.map(config => config.linkName || '').join(','),
        lnkversion: validLinkConfigs[0]?.linkVersion || '1',
        lnkbkfields: validLinkConfigs.map(config => (config.bkfields || []).join(',')),
      }

      console.log("Brg2 Payload : ",payload);

      const data = await dispatch(testDvCompBrg2Async(payload)).unwrap();
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
  const validateSqlInput = (value: string) => {
    // Basic validation to check if the input starts with "SELECT"
    if (/^\s*SELECT\b/i.test(value)) {
      setIsValidSql(true); // Clear any previous error
    } else {
      setIsValidSql(false);
    }
    setSqlText(value);
    setProcessType('');
    // setDateFieldName('');
  };
  useEffect(() => {
    const getColumsAndData = async () => {
      try {
        console.log("getColumsAndData called with processType: ", processType);

        // Only proceed if the process type is 'APP'
        if (processType === "APP" && sqlText.length != 0) {
          const resp = await dispatch(getTableColumnsAsync({ sqltext: sqlText }));
          console.log("Response received: ", resp);

          if (resp.payload.status === 200) {
            setAvailableDateFieldName(resp.payload.data || []);
          } else {
            console.error("Error: Failed to fetch columns, status: ", resp.payload.status);
          }
        }
      } catch (error) {
        console.error("Error in getColumsAndData: ", error);
      }
    };

    // Call the async function
    getColumsAndData();

    // Log after function execution
    console.log("getColumsAndData effect executed: ", processType);
  }, [processType, dispatch, sqlText]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await handleValidate())) return;

    try {
      const payload: DvCompBrg2 = {
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
        hubnum: 1,
        hubnums: hubCount,
        hubname: hubConfigs[0].hubName,
        hubversion: hubConfigs[0].hubVersion,
        bkfields: hubConfigs.map(config => config.bkfields.join(',')),
        lnknums: linkCount,
        lnkname: linkConfigs[0].linkName,
        lnkversion: linkConfigs[0].linkVersion,
        lnkbkfields: linkConfigs.map(config => config.bkfields.join(',')),
        lnknum: 1,
      };

      await dispatch(createDvCompBrg2Async(payload)).unwrap();
      const maxLength = Math.max(hubConfigs.length, linkConfigs.length);
      for (let i = 1; i < maxLength; i++) {

        await dispatch(createDvCompBrg2Async({
          ...payload,
          hubname: i < hubConfigs.length ? hubConfigs[i].hubName : null,
          hubversion: i < hubConfigs.length ? hubConfigs[i].hubVersion : null,
          bkfields: i < hubConfigs.length ? hubConfigs[i].bkfields : null,
          lnkname: i < linkConfigs.length ? linkConfigs[i].linkName : null,
          lnkversion: i < linkConfigs.length ? linkConfigs[i].linkVersion : null,
          lnkbkfields: i < linkConfigs.length ? linkConfigs[i].bkfields : null,
          hubnum: i < hubConfigs.length ? i + 1 : null,
          lnknum: i < linkConfigs.length ? i + 1 : null
        })).unwrap();
      }
      toast.success("BRG2 configuration created successfully");

      // Reset form
      setComponentName("");
      setSqlText("");
      setDateFieldName("");
      setComments("");
      setVersion(1);
      setHubConfigs([]);
      setLinkConfigs([]);
      setHubCount(1);
      setLinkCount(1);
      setIsValidated(false);
      setIsValidSql(false);
      setProcessType("APP");
      setComponentSubtype("brdg");
      setComponentType("bv");
      setSelectedProject("");
      setQueryResult({ headers: [], rows: [], error: "" });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create BRG2 configuration");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Create BRG2 Component
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
              <option key={project} value={project}>
                {project}
              </option>
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
              <option key={type} value={type}>
                {type}
              </option>
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
              <option key={subtype} value={subtype}>
                {subtype}
              </option>
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
          <textarea
            id="sqlText"
            value={sqlText}
            onChange={(e) => validateSqlInput(e.target.value)}
            rows={3}
            placeholder="Enter a SELECT or select SQL statement"
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
            disabled={!isValidSql}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            required
          >
            <option value="">Select Process Type</option>
            {uniqueProcessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
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
          <select
            id="dateFieldName"
            value={dateFieldName}
            onChange={(e) => setDateFieldName(e.target.value)}
            disabled={!(processType === 'APP')}
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

        {/* Hub Count Selection */}
        <div>
          <label
            htmlFor="hubCount"
            className="block text-sm font-medium text-gray-700"
          >
            Hub Count (1-14)
          </label>
          <input
            type="number"
            id="hubCount"
            value={hubCount}
            onChange={(e) =>
              setHubCount(Math.min(14, Math.max(1, parseInt(e.target.value))))
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
            Please select the same bkfields in the same order of dh
          </p>
        </div>

        {/* Hub Configurations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Hub Configurations
          </h3>
          {hubConfigs.map((config, index) => (
            <div key={index} className="border rounded-md p-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Hub {index + 1}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hub Name
                  </label>
                  <select
                    value={config.hubName}
                    onChange={(e) => {
                      const newConfigs = [...hubConfigs];
                      newConfigs[index].hubName = e.target.value;
                      const selectedHub = availableHubs.find(
                        (h) => h.name === e.target.value
                      );
                      if (selectedHub) {
                        newConfigs[index].hubVersion = selectedHub.version;
                        newConfigs[index].bkfields = selectedHub.bkfields;
                      }
                      setHubConfigs(newConfigs);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Hub</option>
                    {Array.from(
                      new Set(
                        availableHubs
                          .filter(
                            (hub) =>
                              !hubConfigs.some(
                                (cfg) => cfg.hubName == hub.name
                              ) || hubConfigs[index].hubName == hub.name
                          )
                          .map((n) => n.name)
                      )
                    ).map((hub) => (
                      <option key={hub} value={hub}>
                        {hub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hub Version
                  </label>
                  <input
                    type="text"
                    value={config.hubVersion}
                    readOnly
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    BK Fields
                  </label>
                  {/* <select
                      multiple
                      value={config.bkfields}
                      required
                      onChange={(e) => {
                        const newConfigs = [...hubConfigs];
                        newConfigs[index].bkfields = Array.from(e.target.selectedOptions, option => option.value);
                        setHubConfigs(newConfigs);
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      size={3}
                    >
                      {availableBkfields.filter(bk => !selectedDegenIds.includes(bk)).filter(f => !hubConfigs.some(cfg => cfg.bkfields.includes(f)) || hubConfigs[index].bkfields.includes(f)).map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select> */}
                  <SortableMultiSelect
                    onChange={(e) => {
                      const newConfigs = [...hubConfigs];
                      newConfigs[index].bkfields = e;
                      setHubConfigs(newConfigs);
                    }}
                    value={config.bkfields}
                    options={(() => {
                      console.log("availableBkfields:", availableBkfields);
                      return availableDateFieldName
                        .filter((f) => 
                          !(dateFieldName === f)
                        );
                    })()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Link Count Selection */}
        <div>
          <label
            htmlFor="linkCount"
            className="block text-sm font-medium text-gray-700"
          >
            Link Count (1-14)
          </label>
          <input
            type="number"
            id="linkount"
            value={linkCount}
            onChange={(e) =>
              setLinkCount(Math.min(14, Math.max(1, parseInt(e.target.value))))
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
            Please select the same bkfields in the same order of dl
          </p>
        </div>

        {/* Hub Configurations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Link Configurations
          </h3>
          {linkConfigs.map((config, index) => (
            <div key={index} className="border rounded-md p-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Link {index + 1}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Link Name
                  </label>
                  <select
                    value={config.linkName}
                    onChange={(e) => {
                      const newConfigs = [...linkConfigs];
                      newConfigs[index].linkName = e.target.value;
                      const selectedLink = availableLinks.find(
                        (h) => h.name === e.target.value
                      );
                      if (selectedLink) {
                        newConfigs[index].linkVersion = selectedLink.version;
                        newConfigs[index].bkfields = selectedLink.bkfields;
                      }
                      setLinkConfigs(newConfigs);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Link</option>
                    {Array.from(
                      new Set(
                        availableLinks
                          .filter(
                            (link) =>
                              !linkConfigs.some(
                                (cfg) => cfg.linkName == link.name
                              ) || linkConfigs[index].linkName == link.name
                          )
                          .map((n) => n.name)
                      )
                    ).map((link) => (
                      <option key={link} value={link}>
                        {link}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Link Version
                  </label>
                  <input
                    type="text"
                    value={config.linkVersion}
                    readOnly
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    BK Fields
                  </label>
                  {/* <select
                      multiple
                      value={config.bkfields}
                      required
                      onChange={(e) => {
                        const newConfigs = [...hubConfigs];
                        newConfigs[index].bkfields = Array.from(e.target.selectedOptions, option => option.value);
                        setHubConfigs(newConfigs);
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      size={3}
                    >
                      {availableBkfields.filter(bk => !selectedDegenIds.includes(bk)).filter(f => !hubConfigs.some(cfg => cfg.bkfields.includes(f)) || hubConfigs[index].bkfields.includes(f)).map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select> */}
                  <SortableMultiSelect
                    onChange={(e) => {
                      const newConfigs = [...linkConfigs];
                      newConfigs[index].bkfields = e;
                      setLinkConfigs(newConfigs);
                    }}
                    value={config.bkfields}
                    options={availableDateFieldName
                      .filter(
                        (f) =>
                          !(dateFieldName === f)
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
            {isValidated
              ? "✓ Configuration Validated"
              : "Validate Configuration"}
          </button>

          <button
            disabled={!isValidated}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create BRG2 Configuration
          </button>
        </div>
      </form>
    </div>
  );
}