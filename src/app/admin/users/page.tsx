"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllUsersAsync, updateBulkUsersAsync } from "@/store/user/userThunks";
import { toast } from "react-hot-toast";
import { User } from "@/types/user";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { UsersTable } from "./(components)/users-table";
import { HistoryTable } from "./(components)/userhistory";

type TabType = 'users' | 'history';

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchTerm, setSearchTerm] = useState("");
  const [editedUsers, setEditedUsers] = useState<{ [key: string]: User }>({});
  const groupUsers = useAppSelector((state) => state.user.group_users);
  const handleUserChange = (
    useremail: string,
    field: keyof User,
    value: string
  ) => {
    setEditedUsers((prev) => ({
      ...prev,
      [useremail]: {
        ...(prev[useremail] ||
          groupUsers.find((u) => u.useremail === useremail)!),
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(editedUsers).length === 0) {
      toast.error("No changes to save");
      return;
    }

    try {
      toast.promise(
        dispatch(updateBulkUsersAsync(Object.values(editedUsers))).unwrap(),
        {
          loading: "Updating users...",
          success: "Users updated successfully",
          error: (error) => {
            if ("message" in error) {
              return error.message;
            }
            return "Failed to update users";
          },
        }
      );
      setEditedUsers({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to update users");
    }
  };

  const getUserValue = (user: User, field: keyof User) => {
    return editedUsers[user.useremail]?.[field] ?? user[field] ?? '';
  };

  useEffect(() => {
    dispatch(getAllUsersAsync());
  }, []);

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        {activeTab === 'users' && Object.keys(editedUsers).length > 0 && (
          <button
            onClick={handleSaveChanges}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {(['users', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeTab === 'users' ? (
          <UsersTable
            searchTerm={searchTerm}
            onUserChange={handleUserChange}
            getUserValue={getUserValue}
          />
        ) : (
          <HistoryTable searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
}
