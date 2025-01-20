'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAssignHistoryAsync } from '@/store/project/projectThunk';
import { toast } from 'react-hot-toast';

interface HistoryTableProps {
  searchTerm: string;
}


const ASSIGNEMENTS_PER_PAGE = 10;

export function HistoryTable({ searchTerm }: HistoryTableProps) {
  const dispatch = useAppDispatch();
  const assignHistory = useAppSelector((state) => state.project.assignHistory);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        await dispatch(getAssignHistoryAsync());
      } catch (error) {
        toast.error('Failed to fetch assignment history');
      }
    };
    fetchHistory();
  }, [dispatch]);

  if (!assignHistory || assignHistory.length === 0) {
    return <div>No assignment history found</div>;
  }

  let filteredHistory = assignHistory.filter((assign) =>
    assign.useremail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assign.projectshortname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFilteredHistory = filteredHistory.length;
  const totalPages = Math.ceil(totalFilteredHistory / ASSIGNEMENTS_PER_PAGE)
  filteredHistory = filteredHistory.slice((page - 1) * ASSIGNEMENTS_PER_PAGE, page * ASSIGNEMENTS_PER_PAGE);


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Added By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredHistory.map((assign) => (
            <tr key={`${assign.assignid}-${assign.createdate}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assign.useremail}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assign.projectshortname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assign.is_active ? 'Active' : 'Inactive'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assign.who_added}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(assign.createdate).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center my-4 px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {Math.min((page - 1) * ASSIGNEMENTS_PER_PAGE + 1, totalFilteredHistory)} to {Math.min(page * ASSIGNEMENTS_PER_PAGE, totalFilteredHistory)} of {totalFilteredHistory} assignments
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
  );
} 