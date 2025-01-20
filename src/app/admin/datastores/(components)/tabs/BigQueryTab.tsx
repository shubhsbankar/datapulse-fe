"use client";

import { Datastore } from "@/types/datastore";
import { DATASTORE_TYPES } from "@/types/datastoreTabs";
import { useState } from "react";
import toast from "react-hot-toast";

interface BigQueryTabProps {
  datastore: Datastore;
  onChange: (field: keyof Datastore, value: string) => void;
}

export function BigQueryTab({ datastore, onChange }: BigQueryTabProps) {
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setSelectedFiles(files);
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    formData.append("project_shortname", datastore.dsshortname);
    try {
      const response = await fetch("/api/bigquery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("Failed to upload files");
    } finally {
      setSelectedFiles(null);
      event.target.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor="dsshortname"
          className="block text-sm font-medium text-gray-700"
        >
          Short Name
          <span className="text-xs text-gray-500 ml-1">
            (single word, lowercase)
          </span>
        </label>
        <input
          type="text"
          id="dsshortname"
          name="dsshortname"
          value={datastore.dsshortname}
          onChange={(e) => onChange("dsshortname", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          pattern="^[a-z0-9]+$"
          title="Only lowercase letters and numbers, no spaces"
        />
      </div>
      
      <div>
        <label
          htmlFor="datastorename"
          className="block text-sm font-medium text-gray-700"
        >
          Name
          <span className="text-xs text-gray-500 ml-1">
            ({40 - datastore.datastorename.length} characters remaining)
          </span>
        </label>
        <input
          type="text"
          id="datastorename"
          name="datastorename"
          value={datastore.datastorename}
          onChange={(e) => onChange("datastorename", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
          maxLength={40}
        />
      </div>
      <div>
        <label htmlFor="is_target" className="block text-sm font-medium text-gray-700">
          Is Target
        </label>
        <select
          id="is_target"
          name="is_target"
          value={datastore.is_target}
          onChange={(e) => { onChange('is_target', e.target.value) }}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          {/* <option value="">Select Type</option> */}
          <option value="Yes">Yes</option>
          <option value="NA">NA</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="dstype"
          className="block text-sm font-medium text-gray-700"
        >
          Type
        </label>
        <select
          id="dstype"
          name="dstype"
          value={datastore.dstype}
          onChange={(e) => onChange("dstype", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Type</option>
          {DATASTORE_TYPES.bigquery.map((type) => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {/* add fileds table name, username, password, url, driver */}
      <div>
        <label
          htmlFor="tablename"
          className="block text-sm font-medium text-gray-700"
        >
          Table Name
        </label>
        <input
          type="text"
          id="tablename"
          name="tablename"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.tablename}
          onChange={(e) => onChange("tablename", e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.username}
          onChange={(e) => onChange("username", e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="passwrd"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="passwrd"
          name="passwrd"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={datastore.passwrd}
          onChange={(e) => onChange("passwrd", e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700"
        >
          URL
        </label>
        <input
          type="text"
          id="url"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          name="url"
          value={datastore.url}
          onChange={(e) => onChange("url", e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="driver"
          className="block text-sm font-medium text-gray-700"
        >
          Driver
        </label>
        <input
          type="text"
          id="driver"
          name="driver"
          value={datastore.driver}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          onChange={(e) => onChange("driver", e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="credentials_file"
          className="block text-sm font-medium text-gray-700"
        >
          Credentials File
        </label>
        <input
          type="text"
          id="credentials_file"
          name="credentials_file"
          value={datastore.credentials_file || ""}
          onChange={(e) => onChange("credentials_file", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="gcp_projectid"
          className="block text-sm font-medium text-gray-700"
        >
          GCP Project ID
        </label>
        <input
          type="text"
          id="gcp_projectid"
          name="gcp_projectid"
          value={datastore.gcp_projectid || ""}
          onChange={(e) => onChange("gcp_projectid", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="gcp_datasetid"
          className="block text-sm font-medium text-gray-700"
        >
          GCP Dataset ID
        </label>
        <input
          type="text"
          id="gcp_datasetid"
          name="gcp_datasetid"
          value={datastore.gcp_datasetid || ""}
          onChange={(e) => onChange("gcp_datasetid", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="gcp_tableid"
          className="block text-sm font-medium text-gray-700"
        >
          GCP Table ID
        </label>
        <input
          type="text"
          id="gcp_tableid"
          name="gcp_tableid"
          value={datastore.gcp_tableid || ""}
          onChange={(e) => onChange("gcp_tableid", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload JSON File
        </label>
        <input
          type="file"
          onChange={handleFileUpload}
          multiple
          accept=".json"
          className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
}
