'use client';

import { TenantBkcc } from '@/types/userfeat';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/dropdown';
import { formatDate } from '@/utils/dateFormatter';

interface TidTableProps {
  tenantBkccs: {
    items: TenantBkcc[];
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
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;
  selectedBkcArea: string;
  setSelectedBkcArea: (area: string) => void;
  onExport: (data: any[], filename: string) => void;
}

export function TidTable({
  tenantBkccs,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedTenantId,
  setSelectedTenantId,
  selectedBkcArea,
  setSelectedBkcArea,
  onExport
}: TidTableProps) {
  // Get unique values for filters
  const uniqueTenantIds = Array.from(new Set(tenantBkccs.items.map(t => t.tenantid)));
  const uniqueBkcAreas = Array.from(new Set(tenantBkccs.items.map(t => t.bkcarea)));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Created Tenant IDs</h2>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Tenant IDs</option>
          {uniqueTenantIds.map(id => (
            <option key={id + Math.random()} value={id}>{id}</option>
          ))}
        </select>

        <select
          value={selectedBkcArea}
          onChange={(e) => setSelectedBkcArea(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All BKC Areas</option>
          {uniqueBkcAreas.map(area => (
            <option key={area + Math.random()} value={area}>{area}</option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tenant IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport(tenantBkccs.items, 'tenant_ids')}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BKC Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hub Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BKCC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenantBkccs.items.map((tid) => (
              <tr key={`${tid.tenantid}-${tid.bkcarea}` + Math.random()}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tid.tenantid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tid.bkcarea}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tid.hubname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tid.bkcc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tid.user_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(tid.createdate || '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * 10) + 1} to{' '}
          {Math.min(currentPage * 10, tenantBkccs.totalItems)} of{' '}
          {tenantBkccs.totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {tenantBkccs.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(tenantBkccs.totalPages, currentPage + 1))}
            disabled={currentPage === tenantBkccs.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 