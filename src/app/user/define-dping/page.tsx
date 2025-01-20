"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllDatasetsAsync } from "@/store/userfeat/datasetThunks";
import { getAllDpingsAsync } from "@/store/userfeat/dpingThunks";
import { DpingForm } from "./components/DpingForm";
import { DpingTabs } from "./components/DpingTabs";
import { DpingTable } from "./components/DpingTable";
import { formatDate } from "@/utils/dateFormatter";
import { getAllDataAsync } from "@/store/auth/authThunks";

const ITEMS_PER_PAGE = 10;

export default function DefineDpingPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDsType, setSelectedDsType] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDataProduct, setSelectedDataProduct] = useState("");

  useEffect(() => {
    dispatch(getAllDataAsync());
  }, [dispatch]);

  // console.log(selectedDataProduct, "selectedDataProduct");
  // Get data from Redux store
  const datasets = useAppSelector((state) => state.userfeat.dataset);
  const cdsDatasets = useAppSelector((state) =>
    state.userfeat.dataset.filter((ds) => ds.datastoreshortname === "CSV1")
  );
  const dpings = useAppSelector((state) => state.userfeat.dping);

  useEffect(() => {
    dispatch(getAllDatasetsAsync());
    dispatch(getAllDpingsAsync());
  }, [dispatch]);

  // Filter and pagination logic
  const getFilteredAndPaginatedItems = (items: any[]) => {
    const filtered = items.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDateRange =
        !startDate || !endDate
          ? true
          : new Date(item.createdate) >= new Date(startDate) &&
            new Date(item.createdate) <= new Date(endDate);

      const matchesDsType =
        !selectedDsType || item.dsdatatype === selectedDsType;
      const matchesProject =
        !selectedProject || item.projectshortname === selectedProject;
      const matchesDataProduct =
        !selectedDataProduct ||
        item.dataproductshortname === selectedDataProduct;

      return (
        matchesSearch &&
        matchesDateRange &&
        matchesDsType &&
        matchesProject &&
        matchesDataProduct
      );
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE),
    };
  };

  const filteredDatasets = getFilteredAndPaginatedItems(datasets);
  const filteredCdsDatasets = getFilteredAndPaginatedItems(cdsDatasets);
  const filteredDpings = getFilteredAndPaginatedItems(dpings);

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
        <DpingForm
          datasets={datasets}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDataProduct={selectedDataProduct}
          setSelectedDataProduct={setSelectedDataProduct}
        />
        <DpingTabs
          datasets={filteredDatasets}
          cdsDatasets={filteredCdsDatasets}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedDsType={selectedDsType}
          setSelectedDsType={setSelectedDsType}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDataProduct={selectedDataProduct}
          setSelectedDataProduct={setSelectedDataProduct}
          onExport={exportToCSV}
        />
      </div>

      <DpingTable
        dpings={filteredDpings}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedDataProduct={selectedDataProduct}
        setSelectedDataProduct={setSelectedDataProduct}
      />
    </div>
  );
}
