'use client';
import Select from "react-select";
import { Dataset } from "@/types/userfeat";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRtAsync, getTableColumnsAsync, getTableNamesAsync } from "@/store/userfeat/rtThunks";
import { toast } from "react-hot-toast";

interface RtFormProps {
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

export function RtForm({
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
  onSubmit,
  keysNumInitial,
  keysInitial
}: RtFormProps) {
  const dispatch = useAppDispatch();
  const [rtShortname, setRtShortname] = useState('');
  const [comments, setComments] = useState('');
  const [selectAllColumns, setSelectAllColumns] = useState(false);
  const [selectMultipleColumns, setSelectMultipleColumns] = useState(false);
  const [numberOfKeys, setNumberOfKeys] = useState<number>(1);
  const [bkeys, setBkeys] = useState<{ [key: string]: string }>({});
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  // const [availableTables, setAvailableTables] = useState<string[]>([]);

  useEffect(() => {
    if (keysNumInitial !== undefined && keysInitial) {
      setNumberOfKeys(keysNumInitial);
      setBkeys(keysInitial);
    }
  }, [keysInitial, keysNumInitial]);

  // const availableDatastores = useAppSelector(state => state.datastore.datastores).filter(d =>
  //   d.projectshortname === selectedProject &&
  //   d.dataproductshortname === selectedDataProduct &&
  //   d.datasetshortname === selectedDataset
  // ).map(ds => ds.dsshortname);
  // Get unique project names from datasets
  const uniqueProjects = Array.from(new Set(datasets.map(d => d.projectshortname)));

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

  const availableDatastores = Array.from(
    new Set(datasets
      .filter(d =>
        d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedDataProduct &&
        d.datasetshortname === selectedDataset
      )
      .map(d => d.datastoreshortname))
  );

  console.log({availableDatastores});

  const availableTables = Array.from(new Set(
    datasets.filter(d =>
      d.projectshortname === selectedProject &&
      d.dataproductshortname === selectedDataProduct &&
      d.datasetshortname === selectedDataset &&
      d.datastoreshortname === selectedDatastore
    ).map(d => d.tablename)
  ));

  useEffect(() => {
    if (selectedDataset) {
      const tablename = datasets.find(d => d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedDataProduct &&
        d.datasetshortname === selectedDataset)?.tablename;
      const datastore = datasets.find(d => d.projectshortname === selectedProject &&
        d.dataproductshortname === selectedDataProduct &&
        d.datasetshortname === selectedDataset)?.datastoreshortname;
      console.log({tablename, datastore});
      if (tablename) {
        // setAvailableTables([tablename]);
        setSelectedTable(tablename || '');
        setSelectedDatastore(datastore || '');
      }
    } else {
      // setAvailableTables([]);
      setSelectedTable('');
      setSelectedDatastore('');
    }
  }, [selectedDataset, datasets, setSelectedTable, setSelectedDatastore]);

  // Update derived fields when selections change
  useEffect(() => {
    if (selectedProject && selectedDataProduct && selectedDataset) {
      const projectId = selectedProject.split('-')[0]; // Assuming format like "p5-projectname"
      const rtname = `${projectId}-${selectedDataProduct}-${selectedDataset}-t`.toLowerCase();
      setRtShortname(rtname);
    }
  }, [selectedProject, selectedDataProduct, selectedDataset]);

  // Add effect to fetch tables when dataset changes
  // useEffect(() => {
  //   if (selectedDataset && selectedDatastore && selectedDataProduct) {
  //     dispatch(getTableNamesAsync({projectshortname: selectedProject, datasetname: selectedDataset, datastoreshortname: selectedDatastore, dataproductshortname: selectedDataProduct }))
  //       .unwrap()
  //       .then((response) => {
  //         setAvailableTables(response.data);
  //         setSelectedTable(selectedTable); // Reset table selection
  //       })
  //       .catch((error) => {
  //         toast.error(error.message || "Failed to fetch tables");
  //       });
  //   }
  // }, [selectedDataset, dispatch, setSelectedTable, selectedTable, selectedDataProduct, selectedProject, selectedDatastore]);

  // // Add effect to fetch columns when table name changes
  // useEffect(() => {
  //   if (selectedTable) {
  //     dispatch(getTableColumnsAsync({ tablename: selectedTable,
  //       datastore: selectedDatastore,
  //       dataset: selectedDataset,
  //       project: selectedProject,
  //       dataproduct: selectedDataProduct
  //      }))
  //       .unwrap()
  //       .then((response) => {
  //         setAvailableColumns(response.data);
  //       })
  //       .catch((error) => {
  //         toast.error(error.message || "Failed to fetch columns");
  //       });
  //   }
  // }, [selectedTable, dispatch, selectedDatastore, selectedDataset, selectedProject, selectedDataProduct]);

  // Add this effect to fetch columns when table name changes:
    useEffect(() => {
      if (selectedDataProduct && selectedDataset && selectedProject && selectedTable && selectedDatastore) {
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
    }, [dispatch, selectedDataProduct, selectedDataset, selectedProject, selectedTable, selectedDatastore]);

  // Handle bkey changes
  const handleBkeyChange = (keyNumber: number, value: string) => {
    setBkeys(prev => ({
      ...prev,
      [`bkey${keyNumber}`]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        projectshortname: selectedProject,
        tgtdataset: selectedDataset,
        dpname: selectedDataProduct,
        bkeys: numberOfKeys.toString(),
        tgttabfields: selectedColumns,
        datastoreshortname: selectedDatastore,
        tablename: selectedTable,
        tgtdphash:  selectedDataProduct + "-" + selectedDataset,
        tgthashcol: 'tgthash1'
      };
      // Add bkeys
      Object.entries(bkeys).forEach(([key, value]) => {
        payload[key] = value;
      });

      if (isEdit && onSubmit) {
        await onSubmit(payload);
      } else {
        await dispatch(createRtAsync(payload)).unwrap();
        toast.success('RT created successfully');
        // Reset form
        setSelectedProject('');
        setSelectedDataProduct('');
        setSelectedDataset('');
        setRtShortname('');
        setComments('');
        setSelectAllColumns(false);
        setSelectMultipleColumns(false);
        setSelectedColumns([]);
        setNumberOfKeys(1);
        setBkeys({});
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create RT');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEdit ? 'Edit RT' : 'Create New RT'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selection */}
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

        {/* Data Product Selection */}
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
            disabled={!selectedProject}
          >
            <option value="">Select Data Product</option>
            {availableDataProducts.map(dp => (
              <option key={dp} value={dp}>{dp}</option>
            ))}
          </select>
        </div>

        {/* Dataset Selection */}
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
            disabled={!selectedDataProduct}
          >
            <option value="">Select Dataset</option>
            {availableDatasets.map(ds => (
              <option key={ds} value={ds}>{ds}</option>
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

        {/* Add Table Selection */}
        <div>
          <label htmlFor="tablename" className="block text-sm font-medium text-gray-700">
            Table Name
          </label>
          <select
            id="tablename"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            required
            disabled={!selectedDataset}
          >
            <option value="">Select Table</option>
            {availableTables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>

        {/* Column Selection - using fetched columns instead of hardcoded ones */}
        <div className="space-y-4">
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
                    setSelectedColumns(availableColumns);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="selectAllColumns" className="ml-2 block text-sm text-gray-900">
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
              <label htmlFor="selectMultipleColumns" className="ml-2 block text-sm text-gray-900">
                Select Multiple Columns
              </label>
            </div>
          </div>

          {(selectMultipleColumns || selectAllColumns) && (
            // <select
            //   multiple
            //   value={selectedColumns}
            //   onChange={(e) => {
            //     if (!selectAllColumns) {
            //       const values = Array.from(e.target.selectedOptions, option => option.value);
            //       setSelectedColumns(values);
            //     }
            //   }}
            //   className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            //   size={5}
            //   disabled={selectAllColumns}
            // >
            //   {availableColumns.map(col => (
            //     <option key={col} value={col}>{col}</option>
            //   ))}
            // </select>
            <Select
              isMulti
              required
              options={availableColumns.map(col => ({ value: col, label: col }))}
              value={selectedColumns.map(col => ({ value: col, label: col }))}
              onChange={(selectedOptions) => {
                setSelectedColumns(selectedOptions.map(option => option.value));
              }}
              isDisabled={selectAllColumns}
              closeMenuOnSelect={false}
            />
          )}

          {/* Number of Keys Selection */}
          <div>
            <label htmlFor="numberOfKeys" className="block text-sm font-medium text-gray-700">
              Number of Keys
            </label>
            <select
              id="numberOfKeys"
              value={numberOfKeys}
              onChange={(e) => setNumberOfKeys(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Bkey Dropdowns */}
          {Array.from({ length: numberOfKeys }, (_, i) => i + 1).map(num => {
            let columns  = availableColumns;
            // let columns = selectAllColumns ? availableColumns : selectedColumns;
            columns = columns.filter(col => !Object.values(bkeys).includes(col) || bkeys[`bkey${num}`] === col);
            return <div key={num}>
              <label htmlFor={`bkey${num}`} className="block text-sm font-medium text-gray-700">
                Business Key {num}
              </label>
              <select
                id={`bkey${num}`}
                value={bkeys[`bkey${num}`] || ''}
                onChange={(e) => handleBkeyChange(num, e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select Column</option>
                {(columns).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          }
          )}
        </div>


        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEdit ? 'Update RT' : 'Create RT'}
          </button>
        </div>
      </form>
    </div>
  );
} 