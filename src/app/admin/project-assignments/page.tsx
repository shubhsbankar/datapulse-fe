"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllProjectAssignmentsAsync,
  updateProjectAssignmentAsync,
  createProjectAssignmentAsync,
  getAllProjectsAsync,
} from "@/store/project/projectThunk";
import { toast } from "react-hot-toast";
import { ProjectAssign, ProjectAssignBase } from "@/types/project";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssignmentsTable } from "./(components)/assignments-table";
import { HistoryTable } from "./(components)/history-table";

type TabType = "assignments" | "history";

const PROJECTS_PER_PAGE = 2;

export default function ProjectAssignmentsPage() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.project.projects);
  const groupUsers = useAppSelector((state) => state.user.group_users);
  const [activeTab, setActiveTab] = useState<TabType>("assignments");
  const [searchTerm, setSearchTerm] = useState("");
  const [editedAssignments, setEditedAssignments] = useState<{
    [key: number]: ProjectAssign;
  }>({});
  const [newAssignment, setNewAssignment] = useState<ProjectAssignBase>({
    useremail: "",
    projectshortname: "",
    is_active: true,
  });

  console.log("projects", projects);


  useEffect(() => {
    dispatch(getAllProjectsAsync());
    dispatch(getAllProjectAssignmentsAsync());
  }, [dispatch]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.useremail || !newAssignment.projectshortname) {
      toast.error("Please select both user and project");
      return;
    }

    try {
      toast.promise(dispatch(createProjectAssignmentAsync(newAssignment)).unwrap(), {
        loading: "Creating assignment...",
        success: () => {
          setNewAssignment({
            useremail: "",
            projectshortname: "",
            is_active: true,
          });
          dispatch(getAllProjectAssignmentsAsync()); // Refresh the list
          return "Assignment created successfully";
        },
        error: "Failed to create assignment",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignmentChange = (
    assignId: number,
    field: keyof ProjectAssign,
    value: string | boolean
  ) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignId]: {
        ...(projects.find((project) => project.projectshortname === newAssignment.projectshortname) || {}),
        ...(prev[assignId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(editedAssignments).length === 0) {
      toast.error("No changes to save");
      return;
    }

    try {
      const updatePromises = Object.entries(editedAssignments).map(
        ([assignId, assignData]) => {
          return dispatch(
            updateProjectAssignmentAsync({
              assignId: Number(assignId),
              assignData: {
                useremail: assignData.useremail,
                projectshortname: assignData.projectshortname,
                is_active: assignData.is_active,
              },
            })
          ).unwrap();
        }
      );

      toast.promise(Promise.all(updatePromises), {
        loading: "Updating assignments...",
        success: () => {
          dispatch(getAllProjectAssignmentsAsync()); // Refresh the list
          setEditedAssignments({});
          return "Assignments updated successfully";
        },
        error: "Failed to update assignments",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update assignments");
    }
  };

  const getAssignmentValue = (
    assignment: ProjectAssign,
    field: keyof ProjectAssign
  ) => {
    return (editedAssignments[assignment.assignid]?.[field] ??
      assignment[field]) 
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Project Assignments
        </h1>
        {activeTab === "assignments" &&
          Object.keys(editedAssignments).length > 0 && (
            <button
              onClick={handleSaveChanges}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          )}
      </div>

      {/* Create Assignment Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h2>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="useremail" className="block text-sm font-medium text-gray-700">
                User
              </label>
              <select
                id="useremail"
                value={newAssignment.useremail}
                onChange={(e) =>
                  setNewAssignment((prev) => ({ ...prev, useremail: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select User</option>
                {groupUsers.map((user) => (
                  <option key={user.useremail} value={user.useremail}>
                    {user.useremail} ({user.first_name} {user.last_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="projectshortname" className="block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                id="projectshortname"
                value={newAssignment.projectshortname}
                onChange={(e) =>
                  setNewAssignment((prev) => ({ ...prev, projectshortname: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.projectshortname} value={project.projectshortname}>
                    {project.projectname} ({project.projectshortname})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {(["assignments", "history"] as const).map((tab) => (
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
          placeholder="Search by email or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeTab === "assignments" ? (
          <AssignmentsTable
            searchTerm={searchTerm}
            onAssignmentChange={handleAssignmentChange}
            getAssignmentValue={getAssignmentValue}
          />
        ) : (
          <HistoryTable searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
}
