'use client';

import { User } from '@/types/user';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';

interface UsersTableProps {
  searchTerm: string;
  onUserChange: (useremail: string, field: keyof User, value: string) => void;
  getUserValue: (user: User, field: keyof User) => string;
}

const USERS_PER_PAGE = 10;

export function UsersTable({ searchTerm, onUserChange, getUserValue }: UsersTableProps) {
  const groupUsers = useAppSelector((state) => state.user.group_users);
  const [page, setPage] = useState(1);
  let filteredUsers = groupUsers.filter((user) =>
    user.useremail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalFilteredAssignments = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredAssignments / USERS_PER_PAGE);
  filteredUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              First Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Type
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
          {filteredUsers.map((user) => (
            <tr key={user.useremail}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.useremail}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={getUserValue(user, "first_name")}
                  onChange={(e) =>
                    onUserChange(user.useremail, "first_name", e.target.value)
                  }
                  className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={getUserValue(user, "last_name")}
                  onChange={(e) =>
                    onUserChange(user.useremail, "last_name", e.target.value)
                  }
                  className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={getUserValue(user, "user_type")}
                  onChange={(e) =>
                    onUserChange(user.useremail, "user_type", e.target.value)
                  }
                  className="block w-full border-0 border-b border-transparent bg-gray-50 focus:border-blue-600 focus:ring-0 sm:text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.who_added}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.createdate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center my-4 px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {Math.min((page - 1) * USERS_PER_PAGE + 1, totalFilteredAssignments)}-
            {Math.min(page * USERS_PER_PAGE, totalFilteredAssignments)} of {totalFilteredAssignments} users
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