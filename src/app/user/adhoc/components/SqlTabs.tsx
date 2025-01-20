"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dataset } from "@/types/userfeat";
import { DatasetsTable } from "../../define-ds/components/DatasetsTable";
import { DtTable } from "../../define-dt/components/DtTable";
import { useState } from "react";

interface SqlTabsProps {
  datasets: {
    items: Dataset[];
    totalItems: number;
    totalPages: number;
  };
  cdsDatasets: {
    items: Dataset[];
    totalItems: number;
    totalPages: number;
  };
  dtgs: {
    items: any[];
    totalItems: number;
    totalPages: number;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedDsType: string;
  setSelectedDsType: (type: string) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedDataProduct: string;
  setSelectedDataProduct: (product: string) => void;
  onExport: (data: any[], filename: string) => void;
}

export function SqlTabs({
  datasets,
  cdsDatasets,
  dtgs,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedDsType,
  setSelectedDsType,
  selectedProject,
  setSelectedProject,
  selectedDataProduct,
  setSelectedDataProduct,
  onExport,
}: SqlTabsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Tabs defaultValue="datasets">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger
            value="datasets"
            className="text-center h-auto whitespace-normal"
          >
            Datasets
          </TabsTrigger>
          <TabsTrigger
            value="cds"
            className="text-center h-auto whitespace-normal"
          >
            CDS
          </TabsTrigger>
          <TabsTrigger
            value="dtg"
            className="text-center h-auto whitespace-normal"
          >
            DTG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
          />
        </TabsContent>

        <TabsContent value="cds">
          <DatasetsTable
            onExport={onExport}
            isTabView={true}
            isCDS={true}
          />
        </TabsContent>

        <TabsContent value="dtg">
          <DtTable dtgs={dtgs.items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
