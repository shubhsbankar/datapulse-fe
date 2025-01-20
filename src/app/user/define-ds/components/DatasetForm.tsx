"use client";

import { Dataset, DatasetBase } from "@/types/userfeat";
import { cn } from "@/lib/utils";
import { Datastore } from "@/types/datastore";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllProjectAssignmentsAsync,
  getAllProjectsAsync,
} from "@/store/project/projectThunk";
import { useEffect } from "react";

interface DatasetFormProps {
  dataset: DatasetBase;
  datastores: Datastore[];
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTest: () => Promise<void>;
  isTestSuccessful: boolean;
  isUpdate: boolean;
}

export function DatasetForm({
  dataset,
  datastores,
  onInputChange,
  onSubmit,
  onTest,
  isTestSuccessful,
  isUpdate
}: DatasetFormProps) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllProjectAssignmentsAsync());
    dispatch(getAllProjectsAsync());
  }, [dispatch]);
  const projectNames = useAppSelector((state) =>
    state.project.projectAssigns
      .filter((p) => p.useremail === state.user.currentUser?.useremail && p.is_active)
      .map((p) => p.projectshortname)
  );

  const isFormValid = () => {
    return (
      dataset.projectshortname &&
      dataset.dataproductshortname &&
      dataset.datasetshortname &&
      dataset.domainshortname &&
      dataset.datastoreshortname &&
      dataset.tablename &&
      dataset.dsdatatype &&
      (dataset.dsdatatype === "NA" || dataset.fieldname)
    );
  };

  return (
    <>
      <div className="flex justify-between gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Create New Dataset
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="projectshortname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Short Name
                  <span className="text-xs text-gray-500 ml-1">
                    (single word, lowercase)
                  </span>
                </label>
                <select
                  id="projectshortname"
                  name="projectshortname"
                  value={dataset.projectshortname}
                  onChange={onInputChange}
                  disabled={isUpdate}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Project</option>
                  {projectNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="dataproductshortname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Data Product Name
                  <span className="text-xs text-gray-500 ml-1">
                    (single word, lowercase)
                  </span>
                </label>
                <input
                  type="text"
                  id="dataproductshortname"
                  name="dataproductshortname"
                  value={dataset.dataproductshortname}
                  onChange={onInputChange}
                  disabled={isUpdate}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:opacity-50"
                  required
                  pattern="^[a-z0-9]+$"
                />
              </div>

              <div>
                <label
                  htmlFor="datasetshortname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dataset Name
                  <span className="text-xs text-gray-500 ml-1">
                    (single word, lowercase)
                  </span>
                </label>
                <input
                  type="text"
                  id="datasetshortname"
                  name="datasetshortname"
                  value={dataset.datasetshortname}
                  onChange={onInputChange}
                  disabled={isUpdate}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm  disabled:opacity-50"
                  required
                  pattern="^[a-z0-9]+$"
                />
              </div>

              <div>
                <label
                  htmlFor="domainshortname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Domain Short Name
                  <span className="text-xs text-gray-500 ml-1">
                    (single word, lowercase)
                  </span>
                </label>
                <input
                  type="text"
                  id="domainshortname"
                  name="domainshortname"
                  value={dataset.domainshortname}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                  pattern="^[a-z0-9]+$"
                />
              </div>

              <div>
                <label
                  htmlFor="datastoreshortname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Datastore Short Name
                </label>
                <select
                  id="datastoreshortname"
                  name="datastoreshortname"
                  value={dataset.datastoreshortname}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Datastore</option>
                  {datastores.map((ds) => (
                    <option key={ds.dsshortname} value={ds.dsshortname}>
                      {ds.dsshortname}
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
                  <span className="text-xs text-gray-500 ml-1">
                    (fully qualified name with schema)
                  </span>
                </label>
                <input
                  type="text"
                  id="tablename"
                  name="tablename"
                  value={dataset.tablename}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="dsdatatype"
                  className="block text-sm font-medium text-gray-700"
                >
                  DS Data Type
                </label>
                <select
                  id="dsdatatype"
                  name="dsdatatype"
                  value={dataset.dsdatatype}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  {/* ['postgresql', 'mysql', 'mssqlserver', 'oracle', 't', 'prs', 'rs', 'bk', 'sk', 'kk'] */}
                  {/* <option value="">Select DS Type</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">Mysql</option>
                  <option value="mssqlserver">MSSqlServer</option>
                  <option value="oracle">Oracle</option>
                  <option value="t">T</option>
                  <option value="prs">PRS</option>
                  <option value="rs">RS</option>
                  <option value="bk">BK</option> */}
                  <option value="NA">NA</option>
                  <option value="Daily">Daily</option>
                  
                </select>
              </div>

              <div>
                <label
                  htmlFor="fieldname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Field Name
                  <span className="text-xs text-gray-500 ml-1">
                    (Date, Timestamp or YYYY-MM-DD format only)
                  </span>
                </label>
                <input
                  type="text"
                  id="fieldname"
                  name="fieldname"
                  value={dataset.fieldname || ""}
                  onChange={onInputChange}
                  disabled={dataset.dsdatatype === "NA"}
                  className={cn(
                    "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                    dataset.dsdatatype === "NA" &&
                      "bg-gray-100 cursor-not-allowed"
                  )}
                />
                {dataset.dsdatatype === "Daily" && (
                  <p className="mt-1 text-sm text-gray-500">
                    Field must be of type Date, Timestamp, or char with
                    YYYY-MM-DD format
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sourcename"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source Name (Optional)
                </label>
                <input
                  type="text"
                  id="sourcename"
                  name="sourcename"
                  value={dataset.sourcename}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="tenantid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tenant ID (Optional)
                </label>
                <input
                  type="text"
                  id="tenantid"
                  name="tenantid"
                  value={dataset.tenantid}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="bkcarea"
                  className="block text-sm font-medium text-gray-700"
                >
                  BKC Area (Optional)
                </label>
                <input
                  type="text"
                  id="bkcarea"
                  name="bkcarea"
                  value={dataset.bkcarea}
                  onChange={onInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onTest}
                disabled={!isFormValid()}
                className={cn(
                  "inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  isTestSuccessful
                    ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
                  !isFormValid() && "opacity-50 cursor-not-allowed"
                )}
              >
                {isTestSuccessful
                  ? "✓ Configuration Tested"
                  : "Test Configuration"}
              </button>
              <button
                type="submit"
                disabled={!isTestSuccessful}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Dataset
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
