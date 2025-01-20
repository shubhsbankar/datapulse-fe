'use client';

import { Dataset, RdvCompDh, TenantBkcc, RdvCompDl } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRdvCompDlAsync, getBkfieldsAsync, getDgenidsAsync, testRdvCompDlAsync } from "@/store/userfeat/rdvcompdlThunks";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import SortableMultiSelect from "@/components/ui/multiselect";

interface DlFormProps {
  datasets: Dataset[];
  dhRecords: RdvCompDh[];
  tenantBkccs: TenantBkcc[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  setQuery: (query?: { headers: string[], rows: any[][], error: string }) => void;
  query?: { headers: string[], rows: any[][], error: string };
  // setQuery: (query: string) => void;
}

interface HubConfig {
  hubName: string;
  hubVersion: string;
  bkfields: string[];
}

export function DlForm({
  datasets,
  dhRecords,
  tenantBkccs,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  query,
  setQuery,
}: DlFormProps) {
  const dispatch = useAppDispatch();
  const [componentName, setComponentName] = useState('');
  const [isDegen, setIsDegen] = useState<'Yes' | 'No'>('No');
  const [selectedDegenIds, setSelectedDegenIds] = useState<string[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [bkcArea, setBkcArea] = useState('');
  const [version, setVersion] = useState<number>(1);
  const [hubCount, setHubCount] = useState<number>(1);
  const [hubConfigs, setHubConfigs] = useState<HubConfig[]>(
    Array(5).fill(null).map(() => ({
      hubName: '',
      hubVersion: '1',
      bkfields: []
    }))
  );
  const [availableDgenids, setAvailableDgenids] = useState<string[]>([]);
  const [availableBkfields, setAvailableBkfields] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);


  useEffect(() => {
    const data = {
      projectshortname: selectedProject,
      dpname: selectedDataProduct,
      dsname: selectedDataset,
      tenantid: tenantId,
      bkcarea: bkcArea,
      version: version,
      compname: componentName,
      degen: isDegen,
    };
    const getData = async () => {
      const bkfields = await dispatch(getBkfieldsAsync(data));
      if (bkfields.payload.status === 200) {
        setAvailableBkfields(bkfields.payload.data || []);
        setAvailableDgenids(bkfields.payload.data || []);
      }
    }
    if (selectedDataset) {
      getData();
    }
  }, [dispatch, selectedDataset, selectedProject, selectedDataProduct, tenantId, bkcArea, version, componentName, isDegen]);


  // useEffect(() => {
  //   const data = {
  //     projectshortname: selectedProject,
  //     dpname: selectedDataProduct,
  //     dsname: selectedDataset,
  //     tenantid: tenantId,
  //     bkcarea: bkcArea,
  //     version: version,
  //     compname: componentName,
  //     degen: isDegen,
  //   };
  //   const getData = async () => {
  //     const dgenids = await dispatch(getDgenidsAsync(data));
  //     if (dgenids.payload.status === 200) {
  //       // setAvailableDgenids(dgenids.payload.data || []);
  //     }
  //   }
  //   if (selectedDataset) {
  //     getData();
  //   }
  // }, [dispatch, selectedDataset, selectedProject, selectedDataProduct, tenantId, bkcArea, version, componentName, isDegen]);

  const { projectAssigns } = useAppSelector(state => state.project);
  const isProjectAssignedAndActive = (p: string) => projectAssigns.some(project => project.is_active && project.projectshortname === p);


  // Get unique project names from datasets
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

  // Get unique tenant IDs and BKC areas from tenantBkccs
  const uniqueTenantIds = Array.from(new Set(['default', ...tenantBkccs.map(t => t.tenantid)]));
  const uniqueBkcAreas = Array.from(new Set(['default', ...tenantBkccs.filter(t => tenantId == t.tenantid).map(t => t.bkcarea)]));

  // Get available hub names from DH records
  const availableHubs = dhRecords
    .filter(dh => dh.projectshortname === selectedProject && dh.comptype === 'dh')
    .map(dh => ({
      name: dh.compname,
      version: dh.version?.toString() || '1',
      bkfields: dh.bkfields || []
    }))

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

  const isFormValid = () => {
    return (
      selectedProject !== '' &&
      selectedDataProduct !== '' &&
      selectedDataset !== '' &&
      componentName !== '' &&
      tenantId !== '' &&
      bkcArea !== '' &&
      version > 0 &&
      hubCount > 0 &&
      // Check if all hub configs are filled
      hubConfigs.every((config, index) =>
        index < hubCount ? config.hubName !== '' : true
      )
    );
  };

  const handleValidate = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields before validating');
      return;
    }

    try {
      const payload = {
        projectshortname: selectedProject,
        dpname: selectedDataProduct,
        dsname: selectedDataset,
        comptype: 'dl',
        compname: componentName,
        degen: isDegen,
        degenids: selectedDegenIds,
        tenantid: tenantId,
        bkcarea: bkcArea,
        version: version,
        compkeyname: `${componentName}_k2`,
        hubnums: hubCount,
        hubname: hubConfigs.map(config => config.hubName).join(','),
        hubversion: hubConfigs[0].hubVersion,
        // hubversion: hubConfigs.map(config => config.hubVersion).join(','),
        bkfields: hubConfigs.map(config => config.bkfields.join(',')),
      };

      await toast.promise(
        dispatch(testRdvCompDlAsync(payload)).unwrap(),
        {
          loading: 'Validating configuration...',
          success: (data) => {
            setQuery(data.data);
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

  useEffect(() => {
    setIsValidated(false);
  }, [
    selectedProject,
    selectedDataProduct,
    selectedDataset,
    componentName,
    isDegen,
    selectedDegenIds,
    tenantId,
    bkcArea,
    version,
    hubCount,
    hubConfigs
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidated) {
      toast.error('Please validate the configuration first');
      return;
    }
    try {
      const payload: RdvCompDl = {
        projectshortname: selectedProject,
        dpname: selectedDataProduct,
        dsname: selectedDataset,
        comptype: 'dl',
        compname: componentName,
        compkeyname: `${componentName}_k2`,
        compshortname: `${selectedProject}-${selectedDataProduct}-${selectedDataset}-${componentName}-${version}`,
        degen: isDegen,
        degenids: selectedDegenIds,
        tenantid: tenantId,
        bkcarea: bkcArea,
        version: version,
        hubnums: hubCount,
        hubname: hubConfigs[0].hubName,
        hubversion: hubConfigs[0].hubVersion,
        bkfields: hubConfigs[0].bkfields,
        hubnum: 1,
      };

      // Create initial DL component
      const result = await dispatch(createRdvCompDlAsync(payload)).unwrap();

      // Create additional hub configs
      for (let i = 1; i < hubConfigs.length; i++) {
        const hubPayload = {
          ...payload,
          hubname: hubConfigs[i].hubName,
          hubversion: hubConfigs[i].hubVersion,
          hubbkfields: hubConfigs[i].bkfields,
          bkfields: hubConfigs[i].bkfields,
          hubnum: i + 1,
        };
        await dispatch(createRdvCompDlAsync(hubPayload)).unwrap();
      }

      toast.success('DL component created successfully');

      // Reset form
      setComponentName('');
      setIsDegen('No');
      setSelectedDegenIds([]);
      setTenantId('');
      setBkcArea('');
      setVersion(1);
      setHubCount(5);
      setHubConfigs(Array(5).fill(null).map(() => ({
        hubName: '',
        hubVersion: '1',
        bkfields: []
      })));

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create DL component');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Define DL Component</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
              Project
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

          <div>
            <label htmlFor="dataProduct" className="block text-sm font-medium text-gray-700">
              Data Product
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
            >
              <option value="">Select Data Product</option>
              {availableDataProducts.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dataset" className="block text-sm font-medium text-gray-700">
              Dataset
            </label>
            <select
              id="dataset"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Dataset</option>
              {availableDatasets.map(dataset => (
                <option key={dataset} value={dataset}>{dataset}</option>
              ))}
            </select>
          </div>

          {/* Component Type - Fixed as 'dl' */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Component Type
            </label>
            <input
              type="text"
              value="dl"
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Component Name */}
          <div>
            <label htmlFor="componentName" className="block text-sm font-medium text-gray-700">
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

          {/* Degen Selection */}
          <div>
            <label htmlFor="isDegen" className="block text-sm font-medium text-gray-700">
              Degen
            </label>
            <select
              id="isDegen"
              value={isDegen}
              onChange={(e) => setIsDegen(e.target.value as 'Yes' | 'No')}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Degen IDs - Only show if isDegen is Yes */}
          {isDegen === 'Yes' && (
            <div>
              <label htmlFor="degenIds" className="block text-sm font-medium text-gray-700">
                Degen IDs
              </label>
              {/* <select
                multiple
                id="degenIds"
                value={selectedDegenIds}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedDegenIds(values);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
                size={4}
              >
                {availableDgenids.map(dgenid => (
                  <option key={dgenid} value={dgenid}>{dgenid}</option>
                ))}
              </select> */}
              <SortableMultiSelect
                onChange={(e) => {
                  setSelectedDegenIds(e)
                  // setHubConfigs(
                  //   hubConfigs => hubConfigs.map(config => {
                  //     return {
                  //       ...config,
                  //       bkfields: config.bkfields.filter(f => e.includes(f))
                  //     }
                  //   })
                  // )
                }}
                value={selectedDegenIds}
                options={availableDgenids}
              />
            </div>
          )}

          {/* Tenant ID and BKC Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="">Select Tenant ID</option>
                {uniqueTenantIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

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
                <option value="">Select BKC Area</option>
                {uniqueBkcAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Version */}
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
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:opacity-50"
              required
            />
          </div>

          {/* Hub Count Selection */}
          <div>
            <label htmlFor="hubCount" className="block text-sm font-medium text-gray-700">
              Hub Count (1-14)
            </label>
            <input
              type="number"
              id="hubCount"
              value={hubCount}
              onChange={(e) => setHubCount(Math.min(14, Math.max(1, parseInt(e.target.value))))}
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
            <h3 className="text-lg font-medium text-gray-900">Hub Configurations</h3>
            {hubConfigs.map((config, index) => (
              <div key={index} className="border rounded-md p-4 space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Hub {index + 1}</h4>
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
                        const selectedHub = availableHubs.find(h => h.name === e.target.value);
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
                      {Array.from(new Set(
                        availableHubs.filter(hub => !hubConfigs.some(cfg => cfg.hubName == hub.name) || hubConfigs[index].hubName == hub.name).map(n => n.name)
                      )).map(hub => (
                        <option key={hub} value={hub}>{hub}</option>
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
                      options={availableBkfields.filter(bk => !selectedDegenIds.includes(bk)).filter(f => !hubConfigs.some(cfg => cfg.bkfields.includes(f)) || hubConfigs[index].bkfields.includes(f))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
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
          </button>

          <button
            type="submit"
            disabled={!isValidated}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create DL Component
          </button>
        </div>
      </form>
    </div>
  );
} 