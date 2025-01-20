"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllTenantBkccAsync } from "@/store/userfeat/tenantbkccThunks";
import { TidForm } from "./components/TidForm";
import { TidTable } from "./components/TidTable";
import { formatDate } from "@/utils/dateFormatter";

const ITEMS_PER_PAGE = 10;

export default function DefineTidPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedBkcArea, setSelectedBkcArea] = useState("");

  // Get data from Redux store
  const tenantBkccs = useAppSelector((state) => state.userfeat.tenantbkcc);

  useEffect(() => {
    dispatch(getAllTenantBkccAsync());
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

      const matchesTenantId =
        !selectedTenantId || item.tenantid === selectedTenantId;
      const matchesBkcArea =
        !selectedBkcArea || item.bkcarea === selectedBkcArea;

      return (
        matchesSearch && matchesDateRange && matchesTenantId && matchesBkcArea
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

  const filteredTenantBkccs = getFilteredAndPaginatedItems(tenantBkccs);

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
    <div className="space-y-6 mt-8 grid">
      <div className="grid-cols-1 lg:grid-cols-2 gap-6">
        <TidForm />
      </div>
      <div className="grid-cols-1 lg:grid-cols-2 gap-6">
        <TidTable
          tenantBkccs={filteredTenantBkccs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedTenantId={selectedTenantId}
          setSelectedTenantId={setSelectedTenantId}
          selectedBkcArea={selectedBkcArea}
          setSelectedBkcArea={setSelectedBkcArea}
          onExport={exportToCSV}
        />
      </div>
    </div>
  );
}
