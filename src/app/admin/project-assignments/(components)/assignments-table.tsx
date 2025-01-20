'use client';

import { ProjectAssign } from '@/types/project';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';

interface AssignmentsTableProps {
  searchTerm: string;
  onAssignmentChange: (assignId: number, field: keyof ProjectAssign, value: string | boolean) => void;
  getAssignmentValue: (assignment: ProjectAssign, field: keyof ProjectAssign) => string | number | boolean;
}

const ASSIGNEMENTS_PER_PAGE = 10;

export function AssignmentsTable({
  searchTerm,
  onAssignmentChange,
  getAssignmentValue
}: AssignmentsTableProps) {
  const assignments = useAppSelector((state) => state.project.projectAssigns);
  const [page, setPage] = useState(1);

  let filteredAssignments = assignments.filter((assign) =>
    assign.useremail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assign.projectshortname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFilteredAssignments = filteredAssignments.length;
  const totalPages = Math.ceil(totalFilteredAssignments / ASSIGNEMENTS_PER_PAGE);
  filteredAssignments = filteredAssignments.slice((page - 1) * ASSIGNEMENTS_PER_PAGE, page * ASSIGNEMENTS_PER_PAGE);

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
              Added Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAssignments.map((assignment) => (
            <tr key={assignment.assignid}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.useremail}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.projectshortname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={getAssignmentValue(assignment, "is_active") ? "true" : "false"}
                  onChange={(e) => onAssignmentChange(assignment.assignid, "is_active", e.target.value === "true")}
                  className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.who_added}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.createdate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center my-4 px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {Math.min((page - 1) * ASSIGNEMENTS_PER_PAGE + 1, totalFilteredAssignments)}-
            {Math.min(page * ASSIGNEMENTS_PER_PAGE, totalFilteredAssignments)} of {totalFilteredAssignments} assignments
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