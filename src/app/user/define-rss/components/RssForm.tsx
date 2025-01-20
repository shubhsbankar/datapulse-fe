"use client";
import Select from "react-select";
import { Dataset } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRsAsync, getTableColumnsAsync, getTableNamesAsync, getBkeysAsync } from "@/store/userfeat/rsThunks";
import { toast } from "react-hot-toast";
import MultiSelectSort from "@/components/ui/multiselect";

interface RssFormProps {
  datasets: Dataset[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  selectedDatastore: string;
  setSelectedDatastore: (datastore: string) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  selectedColumns: string[];
  setSelectedColumns: (columns: string[]) => void;
  isEdit?: boolean;
  onSubmit?: (formData: any) => Promise<void>;
  keysNumInitial?: number;
  keysInitial?: { [key: string]: string };
}

export function RssForm({
  datasets,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  selectedDataset,
  setSelectedDataset,
  selectedDatastore,
  setSelectedDatastore,
  selectedTable,
  setSelectedTable,
  selectedColumns,
  setSelectedColumns,
  isEdit = false,
  keysNumInitial,
  keysInitial,
  onSubmit,
}: RssFormProps) {
  const dispatch = useAppDispatch();
  const [rssShortname, setRssShortname] = useState("");
  const [comments, setComments] = useState("");
  const [selectAllColumns, setSelectAllColumns] = useState(false);
  const [selectMultipleColumns, setSelectMultipleColumns] = useState(false);
  const [numberOfKeys, setNumberOfKeys] = useState<number>(keysNumInitial !== undefined ? keysNumInitial : 1);
  const [bkeys, setBkeys] = useState<{ [key: string]: string }>(keysInitial !== undefined ? keysInitial : {});
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  console.log()

  useEffect(() => {
    setNumberOfKeys(keysNumInitial !== undefined ? keysNumInitial : 1);
    setBkeys(keysInitial !== undefined ? keysInitial : {});
  }, [keysNumInitial, keysInitial]);

  // Get unique project names from datasets
  const projects = useAppSelector(state=>state.project.projectAssigns.filter(pa=>pa.useremail==state.user.currentUser.useremail && pa.is_active).map(pa=>pa.projectshortname));
  const uniqueProjects = Array.from(new Set(projects))
  // Get data products for selected project
  const availableDataProducts = datasets
    .filter((d) => d.projectshortname === selectedProject)
    .map((d) => d.dataproductshortname)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get datasets for selected project and data product
  const availableDatasets = datasets
    .filter(
      (d) =>
        d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedDataProduct
    )
    .map((d) => d.datasetshortname);

  // Add after availableDatasets
  const availableDatastores = Array.from(
    new Set(datasets
      .filter(d => 
        d.projectshortname === selectedProject && 
        d.dataproductshortname === selectedDataProduct &&
        d.datasetshortname === selectedDataset
      )
      .map(d => d.datastoreshortname))
  );

  // Update derived fields when selections change
  useEffect(() => {
    if (selectedProject && selectedDataProduct && selectedDataset) {
      const projectId = selectedProject.split("-")[0]; // Assuming format like "p5-projectname"
      const rssname =
        `${projectId}-${selectedDataProduct}-${selectedDataset}-r`.toLowerCase();
      setRssShortname(rssname);
    }
  }, [selectedProject, selectedDataProduct, selectedDataset]);  

  // Add this effect to fetch columns when table name changes:
  useEffect(() => {
    if (selectedTable && selectedDatastore && selectedDataset && selectedProject) {
      dispatch(getTableColumnsAsync({ 
        tablename: selectedTable, 
        datastore: selectedDatastore, 
        dataset: selectedDataset,
        project: selectedProject,
        dataproduct: selectedDataProduct,
      }))
        .unwrap()
        .then((response) => {
          setAvailableColumns(response.data);
        })
        .catch((error) => {
          toast.error(error.message || "Failed to fetch columns");
        });
    }
  }, [selectedTable, dispatch, selectedDatastore, selectedDataset, selectedProject]);

  // Add effect to fetch tables when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      const tablename = datasets.find(ds => ds.datasetshortname === selectedDataset)?.tablename;
      const datastore = datasets.find(ds => ds.datasetshortname === selectedDataset)?.datastoreshortname;
      if (tablename) {
        setAvailableTables([tablename]);
        setSelectedTable(tablename || '');
        setSelectedDatastore(datastore || '');
      }
    } else {
      setAvailableTables([]);
      setSelectedTable('');
      setSelectedDatastore('');
    }
  }, [selectedDataset, datasets, setSelectedTable, setSelectedDatastore]);

  // Handle bkey changes
  const handleBkeyChange = (keyNumber: number, value: string) => {
    setBkeys((prev) => ({
      ...prev,
      [`bkey${keyNumber}`]: value,
    }));
  };

  // Get previously selected bkeys
  const getSelectedBkeys = (currentKeyNumber: number) => {
    const selectedKeys: string[] = [];
    for (let i = 1; i < currentKeyNumber; i++) {
      if (bkeys[`bkey${i}`]) {
        selectedKeys.push(bkeys[`bkey${i}`]);
      }
    }
    return selectedKeys;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        dpname: selectedDataProduct,
        srcdphash:  selectedDataProduct + '-' + selectedDataset,
        srchashcol: "srchash1",
        projectshortname: selectedProject,
        srcdataset: selectedDataset,
        bkeys: numberOfKeys.toString(),
        datastoreshortname: selectedDatastore,
        tablename: selectedTable,
        srctabfields: selectedColumns,
      };

      // Add bkeys
      Object.entries(bkeys).forEach(([key, value]) => {
        payload[key] = value;
      });

      if (isEdit && onSubmit) {
        await onSubmit(payload);
      } else {
        await dispatch(createRsAsync(payload)).unwrap();
        toast.success("RSS created successfully");
        // Reset form
        setSelectedProject("");
        setSelectedDataProduct("");
        setSelectedDataset("");
        setRssShortname("");
        setComments("");
        setSelectAllColumns(false);
        setSelectMultipleColumns(false);
        setSelectedColumns([]);
        setNumberOfKeys(1);
        setBkeys({});
        setSelectedDatastore('');
        setSelectedTable('');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create RSS");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEdit ? 'Edit RSS' : 'Create New RSS'}
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
            disabled={isEdit}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedDataProduct("");
              setSelectedDataset("");
            }}
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
            htmlFor="dataProduct"
            className="block text-sm font-medium text-gray-700"
          >
            Data Product
          </label>
          <select
            id="dataProduct"
            value={selectedDataProduct}
            disabled={isEdit || !selectedProject}
            onChange={(e) => {
              setSelectedDataProduct(e.target.value);
              setSelectedDataset("");
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Data Product</option>
            {availableDataProducts.map((dp) => (
              <option key={dp} value={dp}>
                {dp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dataset"
            className="block text-sm font-medium text-gray-700"
          >
            Dataset
          </label>
          <select
            id="dataset"
            value={selectedDataset}
            disabled={isEdit || !selectedDataProduct}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Dataset</option>
            {availableDatasets.map((ds) => (
              <option key={ds} value={ds}>
                {ds}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="datastore"
            className="block text-sm font-medium text-gray-700"
          >
            Data Store
          </label>
          <select
            id="datastore"
            value={selectedDatastore}
            onChange={(e) => {
              setSelectedDatastore(e.target.value);
              setSelectedTable('');
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            disabled={!selectedDataset}
          >
            <option value="">Select Data Store</option>
            {availableDatastores.map((ds) => (
              <option key={ds} value={ds}>
                {ds}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tablename"
            className="block text-sm font-medium text-gray-700"
          >
            Table Name
          </label>
          <select
            id="tablename"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            disabled={!selectedDatastore}
          >
            <option value="">Select Table</option>
            {availableTables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {/* Column Selection */}

          <div className="space-y-2 flex justify-start gap-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="selectAllColumns"
                checked={selectAllColumns}
                onChange={(e) => {
                  setSelectAllColumns(e.target.checked);
                  if (e.target.checked) {
                    setSelectMultipleColumns(false);
                    setSelectedColumns(availableColumns); // Set all columns when selecting all
                  } else {
                    setSelectedColumns([]); // Clear selection when unchecking
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="selectAllColumns"
                className="ml-2 block text-sm text-gray-900"
              >
                Select All Columns
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="selectMultipleColumns"
                checked={selectMultipleColumns}
                onChange={(e) => {
                  setSelectMultipleColumns(e.target.checked);
                  if (e.target.checked) {
                    setSelectAllColumns(false);
                    setSelectedColumns([]);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="selectMultipleColumns"
                className="ml-2 block text-sm text-gray-900"
              >
                Select Multiple Columns
              </label>
            </div>
          </div>

          {/* Show disabled input with all columns when Select All is checked */}
          {selectAllColumns && (
            <div>
              <input
                type="text"
                value={availableColumns.join(', ')}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 text-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}

          {/* Multi-select for columns */}
          {selectMultipleColumns && (
            // <select
            //   multiple
            //   value={selectedColumns}
            //   onChange={(e) => {
            //     const values = Array.from(
            //       e.target.selectedOptions,
            //       (option) => option.value
            //     );
            //     setSelectedColumns(values);
            //   }}
            //   className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            //   size={5}
            // >
            //   {availableColumns.map((col) => (
            //     <option key={col} value={col}>
            //       {col}
            //     </option>
            //   ))}
            // </select>
            <Select
              isMulti
              required
              options={availableColumns.map(
                (col) => ({ value: col, label: col })
              )}
              value={
                selectedColumns.map((col) => ({ value: col, label: col }))
              }
              onChange={
                (value) => setSelectedColumns(value.map((v) => v.value))
              }
              closeMenuOnSelect={false}
            ></Select>
          )}
          {/* Number of Keys Selection */}

          {/* <MultiSelectSort
            // options={availableColumns}
            // value={selectedColumns.map((col) => ({ value: col, label: col }))}
            // onChange={(value) => setSelectedColumns(value.map((v) => v.value))}
          /> */}

          <div>
            <label
              htmlFor="numberOfKeys"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Keys
            </label>
            <select
              id="numberOfKeys"
              value={numberOfKeys}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setNumberOfKeys(newValue);
                // Clear bkeys that are no longer needed
                const newBkeys = {...bkeys};
                Object.keys(newBkeys).forEach(key => {
                  const keyNumber = parseInt(key.replace('bkey', ''));
                  if (keyNumber > newValue) {
                    delete newBkeys[key];
                  }
                });
                setBkeys(newBkeys);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Bkey Inputs */}
          {Array.from({ length: numberOfKeys }, (_, i) => i + 1).map((num) => {
            const selectedKeys = getSelectedBkeys(num);
            const availableBkeyColumns = availableColumns.filter(col => !selectedKeys.includes(col));
            
            return (
              <div key={num}>
                <label
                  htmlFor={`bkey${num}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Key {num}
                </label>
                <select
                  id={`bkey${num}`}
                  value={bkeys[`bkey${num}`] || ""}
                  onChange={(e) => handleBkeyChange(num, e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Business Key</option>
                  {availableBkeyColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEdit ? 'Update RSS' : 'Create RSS'}
          </button>
        </div>
      </form>
    </div>
  );
}
