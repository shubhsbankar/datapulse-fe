"use client";

import { DatasetBase } from "@/types/userfeat";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllProjectAssignmentsAsync } from "@/store/project/projectThunk";
import { useEffect, useState } from "react";

interface CsvDatasetFormProps {
  dataset: DatasetBase;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTest: () => Promise<void>;
  isTestSuccessful: boolean;
}

export function CsvDatasetForm({
  dataset,
  onInputChange,
  onSubmit,
  onTest,
  isTestSuccessful,
}: CsvDatasetFormProps) {
  const dispatch = useAppDispatch();
  const [isSuffixDaily, setIsSuffixDaily] = useState(false);

  useEffect(() => {
    dispatch(getAllProjectAssignmentsAsync());
  }, [dispatch]);

  const projectNames = useAppSelector((state) =>
    state.project.projectAssigns
      .filter((p) => p.useremail === state.user.currentUser?.useremail && p.is_active)
      .map((p) => p.projectshortname)
  );

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsSuffixDaily(isChecked);

    // Update csvdailysuffix in dataset
    const syntheticEvent = {
      target: {
        name: "csvdailysuffix",
        value: isChecked ? "YES" : "NO",
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);

    // Update tablename based on csvname and suffix
    if (dataset.csvname) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const tablename = isChecked
        ? `${dataset.csvname}_${dateStr}.csv`
        : `${dataset.csvname}.csv`;

      const tablenameEvent = {
        target: {
          name: "tablename",
          value: tablename,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      const csvnameEvent = {
        target: {
          name: "csvname",
          value: dataset.csvname?.replace(".csv", ""),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(tablenameEvent);
      onInputChange(csvnameEvent);
    }
  };

  const handleCsvNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);

    // Update tablename whenever csvname changes
    const csvname = e.target.value;
    if (csvname) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const tablename = dataset.datastoreshortname === 'CSV1' ? isSuffixDaily
        ? `${csvname}_${dateStr}.csv`
        : `${csvname}.csv` : csvname;

      const tablenameEvent = {
        target: {
          name: "tablename",
          value: tablename,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(tablenameEvent);
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      "projectshortname",
      "datasetshortname",
      "dataproductshortname",
      "domainshortname",
      "tablename",
    ];

    const hasAllRequiredFields = requiredFields.every(
      (field) => dataset[field as keyof DatasetBase]
    );

    if (dataset.filessource === "AWS S3") {
      return (
        hasAllRequiredFields &&
        dataset.filesbucketpath
      );
    }

    if (dataset.filessource === "GCS") {
      return (
        hasAllRequiredFields && dataset.filesbucketpath
      );
    }

    return hasAllRequiredFields;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New CDS</h2>
      <form
        onSubmit={onSubmit}
        className="space-y-4 grid grid-cols-2 gap-4"
      >
        {/* Basic fields similar to DatasetForm */}
        <div>
          <label
            htmlFor="projectshortname"
            className="mt-4 block text-sm font-medium text-gray-700"
          >
            Project
          </label>
          <select
            id="projectshortname"
            name="projectshortname"
            value={dataset.projectshortname}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a project</option>
            {projectNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="datasetshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Dataset Name
          </label>
          <input
            type="text"
            id="datasetshortname"
            name="datasetshortname"
            value={dataset.datasetshortname}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="dataproductshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Data Product Name
          </label>
          <input
            type="text"
            id="dataproductshortname"
            name="dataproductshortname"
            value={dataset.dataproductshortname}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="domainshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Domain Shortname
          </label>
          <input
            type="text"
            id="domainshortname"
            name="domainshortname"
            value={dataset.domainshortname}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="datastoreshortname"
            className="block text-sm font-medium text-gray-700"
          >
            Datastore
          </label>
          <select
            id="datastoreshortname"
            name="datastoreshortname"
            value={dataset.datastoreshortname}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="CSV1">CSV1</option>
            <option value="parquet">parquet</option>
          </select>
        </div>

        {dataset.datastoreshortname === 'CSV1' ? (
          <div className="flex gap-3 justify-evenly">
            <div>
              <label
                htmlFor="csvname"
                className="block text-sm font-medium text-gray-700"
              >
                CSV Filename (without .csv)
              </label>
              <input
                type="text"
                id="csvname"
                name="csvname"
                value={dataset.csvname?.replace(".csv", "") || ""}
                onChange={handleCsvNameChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-auto shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="csvdailysuffix"
                name="csvdailysuffix"
                checked={isSuffixDaily}
                onChange={handleSuffixChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="csvdailysuffix"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Suffix Daily
              </label>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="csvname"
              className="block text-sm font-medium text-gray-700"
            >
              {dataset.datastoreshortname === 'CSV1' ? 'CSV Filename (without .csv)' : 'PKT Filename'}
            </label>
            <input
              type="text"
              id="csvname"
              name="csvname"
              value={dataset.csvname?.replace(".csv", "") || ""}
              onChange={handleCsvNameChange}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-auto shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        )}

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
              dataset.dsdatatype === "NA" && "bg-gray-100 cursor-not-allowed"
            )}
          />
          {dataset.dsdatatype === "Daily" && (
            <p className="mt-1 text-sm text-gray-500">
              Field must be of type Date, Timestamp, or char with YYYY-MM-DD
              format
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="separator"
            className="block text-sm font-medium text-gray-700"
          >
            Field Separator
          </label>
          <input
            type="text"
            id="separator"
            name="separator"
            placeholder="Enter separator (e.g. , ; )"
            value={dataset.separator}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
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
        <div>
          <label
            htmlFor="filessource"
            className="block text-sm font-medium text-gray-700"
          >
            File Source
          </label>
          <select
            id="filessource"
            name="filessource"
            value={dataset.filessource || "local"}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="local">Local</option>
            <option value="AWS S3">AWS S3</option>
            <option value="GCS">GCS</option>
          </select>
        </div>

        {dataset.filessource !== "local" && (
          <>
            <div>
              <label
                htmlFor="filesbucketpath"
                className="block text-sm font-medium text-gray-700"
              >
                {dataset.filessource === "AWS S3"
                  ? "S3 Bucket Path"
                  : "GCS Bucket Path"}
              </label>
              <input
                type="text"
                id="filesbucketpath"
                name="filesbucketpath"
                value={dataset.filesbucketpath || ""}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </>
        )}

        {/* Test and Submit buttons */}
        <div className="col-span-2 flex justify-end space-x-4 mt-6">
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
            {isTestSuccessful ? "✓ Configuration Tested" : "Test Configuration"}
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
  );
}
