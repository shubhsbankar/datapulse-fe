"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllDatasetsAsync } from "@/store/userfeat/datasetThunks";
import { getAllRdvCompDsAsync } from "@/store/userfeat/rdvcompdsThunks";
import { getAllTenantBkccAsync } from "@/store/userfeat/tenantbkccThunks";
import { DssForm1 } from "./components/DssForm1";
import { DssForm2 } from "./components/DssForm2";
import { DssTabs } from "./components/DssTabs";
import { DssTable } from "./components/DssTable";
import { formatDate } from "@/utils/dateFormatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SqlResults } from "../execute-sql/components/SqlResults";
import { DssForm3 } from "./components/DssForm3";

export default function DefineDssPage() {
  const dispatch = useAppDispatch();
  const [selectedDsType, setSelectedDsType] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDataProduct, setSelectedDataProduct] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [queryResult, setQueryResult] = useState<{ headers: string[]; rows: any[][]; error: string }>();

  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const tenantBkccs = useAppSelector((state) => state.userfeat.tenantbkcc);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllRdvCompDsAsync());
    dispatch(getAllTenantBkccAsync());
  }, [dispatch]);

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map((item) =>
      Object.values(item)
        .map((value) => (typeof value === "string" ? `"${value}"` : value))
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <Tabs defaultValue="form1">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="form1">DSS Form 1</TabsTrigger>
              <TabsTrigger value="form2">DSS Form 2</TabsTrigger>
              <TabsTrigger value="form3">DSS Form 3</TabsTrigger>
            </TabsList>

            <TabsContent value="form1">
              <DssForm1
                datasets={datasets}
                tenantBkccs={tenantBkccs}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedDataProduct={selectedDataProduct}
                setSelectedDataProduct={setSelectedDataProduct}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
                setQueryResult={setQueryResult}
              />
            </TabsContent>

            <TabsContent value="form2">
              <DssForm2
                datasets={datasets}
                tenantBkccs={tenantBkccs}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedDataProduct={selectedDataProduct}
                setSelectedDataProduct={setSelectedDataProduct}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
                setQueryResult={setQueryResult}
              />
            </TabsContent>

            <TabsContent value="form3">
              <DssForm3
                datasets={datasets}
                tenantBkccs={tenantBkccs}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedDataProduct={selectedDataProduct}
                setSelectedDataProduct={setSelectedDataProduct}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
                setQueryResult={setQueryResult}
              />
            </TabsContent>
          </Tabs>

        </div>

        <DssTabs
          onExport={exportToCSV}
        />
      </div>

        <SqlResults results={queryResult || null} />
    </div>
  );
}
