"use client";

import { useState } from "react";
import { Datastore } from "@/types/datastore";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CheckboxItem } from "@/components/ui/dropdown";

interface DatastoresTableProps {
  searchTerm: string;
  onDatastoreChange: (
    dsid: number,
    field: keyof Datastore,
    value: string | boolean
  ) => void;
  getDatastoreValue: (
    datastore: Datastore,
    field: keyof Datastore
  ) => string | boolean | number;
}

// Default visible columns
const defaultColumns: (keyof Datastore)[] = [
  // "dsid",
  "dsshortname",
  "datastorename",
  "dstype",
  "is_valid",
];

// Get all possible columns from Datastore type
const allColumns: (keyof Datastore)[] = [
  // "dsid",
  "dsshortname",
  "datastorename",
  "dstype",
  "url",
  "driver",
  "username",
  "passwrd",
  "tablename",
  "is_valid",
  "createdate",
  "aws_iam_role",
  "tempdir",
  "credentials_file",

  // GCP
  "gcp_projectid",
  "gcp_datasetid",
  "gcp_tableid",

  // Snowflake
  "sfaccount",
  "sfdb",
  "sfschema",
  "sfwarehouse",
  "sfRole",

  // Kafka
  "bootstrap_servers",
  "topic",
  "schemareg_url",
  "kkuser",
  "kksecret",
  "kk_sasl_mechanism",
  "kk_security_protocol",
  "kk_sasl_jaas_config",
  "kk_ssl_endpoint_identification_algo",
  "kk_ssl_ts_type",
  "kk_ssl_ts_certificates",
  "kk_ssl_ts_location",
  "kk_ssl_ts_password",
  "kk_ssl_ks_type",
  "kk_ssl_ks_location",
  "kk_ssl_ks_password",
  "schemaregapikey",
  "schemaregsecret",

  // filestore
  "bucketname",
  "is_target",
  "subdirectory",
];

// Column display names
const columnDisplayNames: Record<keyof Datastore, string> = {
  // dsid: "ID",
  dsshortname: "Short Name",
  datastorename: "Name",
  dstype: "Type",
  url: "URL",
  driver: "Driver",
  username: "Username",
  tablename: "Table Name",
  is_valid: "Status",
  createdate: "Created Date",
  passwrd: "Password",
  aws_iam_role: "AWS IAM Role",
  tempdir: "Temp Directory",
  credentials_file: "Credentials File",
  gcp_projectid: "GCP Project ID",
  gcp_datasetid: "GCP Dataset ID",
  gcp_tableid: "GCP Table ID",
  sfaccount: "Snowflake Account",
  sfdb: "Snowflake Database",
  sfschema: "Snowflake Schema",
  sfwarehouse: "Snowflake Warehouse",
  sfRole: "Snowflake Role",
  bootstrap_servers: "Bootstrap Servers",
  topic: "Topic",
  schemareg_url: "Schema Registry URL",
  kkuser: "Kafka User",
  kksecret: "Kafka Secret",
  kk_sasl_mechanism: "SASL Mechanism",
  kk_security_protocol: "Security Protocol",
  kk_sasl_jaas_config: "SASL JAAS Config",
  kk_ssl_endpoint_identification_algo: "SSL Endpoint ID Algorithm",
  kk_ssl_ts_type: "SSL TS Type",
  kk_ssl_ts_certificates: "SSL TS Certificates",
  kk_ssl_ts_location: "SSL TS Location",
  kk_ssl_ts_password: "SSL TS Password",
  kk_ssl_ks_type: "SSL KS Type",
  kk_ssl_ks_location: "SSL KS Location",
  kk_ssl_ks_password: "SSL KS Password",
  schemaregapikey: "Schema Registry API Key",
  schemaregsecret: "Schema Registry Secret",
  bucketname: "Bucket Name",
  is_target: "Is Target",
  subdirectory: "Subdirectory",
};

const DATASTORES_PER_PAGE = 10;

export function DatastoresTable({
  searchTerm,
  onDatastoreChange,
  getDatastoreValue,
}: DatastoresTableProps) {
  const router = useRouter();
  const datastores = useAppSelector((state) => state.datastore.datastores);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Datastore>>(
    new Set(defaultColumns)
  );
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  let filteredDatastores = datastores.filter(
    (ds) =>
      ds.dsshortname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.datastorename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalFilteredDatastores = filteredDatastores.length;
  const totalPages = Math.ceil(totalFilteredDatastores / DATASTORES_PER_PAGE);
  filteredDatastores = filteredDatastores.slice(
    (page - 1) * DATASTORES_PER_PAGE,
    page * DATASTORES_PER_PAGE
  );



  const handleUpdateClick = (dsid: number) => {
    router.push(`/admin/datastores/update/${dsid}`);
  };

  const toggleColumn = (column: keyof Datastore) => {
    console.log("object");
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  const toggleAllColumns = () => {
    if (visibleColumns.size === allColumns.length) {
      setVisibleColumns(new Set(defaultColumns));
    } else {
      setVisibleColumns(new Set(allColumns));
    }
  };

  const renderCellValue = (datastore: Datastore, column: keyof Datastore) => {
    const value = datastore[column];
    if (column === "is_valid") return value ? "Valid" : "Invalid";
    if (column === "createdate")
      return new Date(value as string).toLocaleString();
    return value?.toString() || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end overflow-y-auto">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Columns
              <ChevronsUpDown className="w-4 h-4 ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] h-[300px] overflow-y-auto p-0">
            <Command>
              <CommandInput placeholder="Search columns..." />
              <CommandEmpty>No column found.</CommandEmpty>
              <CommandGroup className="overflow-y-auto">
                {allColumns.map((column) => (
                  <div key={column} onClick={() => toggleColumn(column)}>
                    <CommandItem key={column}>
                      <CheckboxItem
                        checked={visibleColumns.has(column)}
                        onCheckedChange={() => toggleColumn(column)}
                      >
                        {columnDisplayNames[column]}
                      </CheckboxItem>
                    </CommandItem>
                  </div>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >Sr.</th> */}
              {Array.from(visibleColumns).map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {columnDisplayNames[column]}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDatastores.map((datastore) => (
              <tr key={datastore.dsid}>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {datastores.indexOf(datastore) + 1}
                </td> */}
                {Array.from(visibleColumns).map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {renderCellValue(datastore, column)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => handleUpdateClick(datastore.dsid ?? 0)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center my-4 px-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Showing {Math.min((page - 1) * DATASTORES_PER_PAGE + 1, totalFilteredDatastores)}-
              {Math.min(page * DATASTORES_PER_PAGE, totalFilteredDatastores)} of {totalFilteredDatastores} datastores
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
