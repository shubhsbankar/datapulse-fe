"use client";

import { cn } from "@/lib/utils";
import {
  FolderPlus,
  Users,
  Database,
  UserCog,
  ChevronLeft,
  Settings,
  LogOut,
  User,
  UserPlus,
  FileText,
  Code,
  Table,
  FileSpreadsheet,
  Upload,
  Download,
  Cog,
  Workflow,
  GitBranch,
  Boxes,
  Layers,
  Network,
  Gauge,
  Cpu,
  Share2,
  Radar,
  FileCode2,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setToken } from "@/store/auth/authSlice";
import { useRouter } from "next/navigation";
import { resetUser } from "@/store/user/userSlice";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface SidebarGroup {
  name: string;
  items: SidebarItem[];
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAdmin = useAppSelector(
    (state) => state.user.currentUser?.user_type === "admin"
  );

  const handleLogout = () => {
    dispatch(resetUser());
    dispatch(setToken(""));
    router.push("/login");
  };

  const adminItems: SidebarItem[] = [
    {
      name: "Projects",
      href: "/admin/projects",
      icon: FolderPlus,
    },
    {
      name: "Project Assignments",
      href: "/admin/project-assignments",
      icon: Users,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: User,
    },
    {
      name: "Data Stores",
      href: "/admin/datastores",
      icon: Database,
    },
    {
      name: "LDAP Import",
      href: "/admin/ldap-import",
      icon: UserPlus,
    },
  ];

  const userGroups: SidebarGroup[] = [
    {
      name: "Dataset Management",
      items: [
        {
          name: "Projects & Datasets",
          href: "/user/projects-ds",
          icon: Database,
        },
        { name: "Define Dataset", href: "/user/define-ds", icon: Table },
        {
          name: "Define Custom Dataset",
          href: "/user/define-cds",
          icon: GitBranch,
        },
      ],
    },
    {
      name: "Data Processing",
      items: [
        { name: "Define DPing", href: "/user/define-dping", icon: Workflow },
      ],
    },
    {
      name: "Data Transformation",
      items: [
        { name: "Define DT", href: "/user/define-dt", icon: Boxes },
        { name: "Execute SQL", href: "/user/execute-sql", icon: Code },
      ],
    },
    {
      name: "Data Streaming",
      items: [
        { name: "Define RSS", href: "/user/define-rss", icon: Share2 },
        { name: "Define RT", href: "/user/define-rt", icon: Network },
        { name: "Define STR", href: "/user/define-str", icon: Layers },
      ],
    },
    {
      name: "Python Management",
      items: [
        { name: "Python Files", href: "/user/python-files", icon: FileCode2 },
        { name: "Adhoc Execution", href: "/user/adhoc", icon: Code },
      ],
    },
    {
      name: "File Operations",
      items: [
        {
          name: "File Management",
          href: "/user/file-management",
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      name: "Data Handling",
      items: [
        { name: "Define TID", href: "/user/define-tid", icon: Gauge },
        { name: "Define DH", href: "/user/define-dh", icon: Cpu },
        { name: "Define DSS", href: "/user/define-dss", icon: Database },
        { name: "Define DL", href: "/user/define-dl", icon: Layers },
        { name: "Define DOS", href: "/user/define-dos", icon: Boxes },
      ],
    },
    {
      name: "System Configuration",
      items: [
        { name: "Config SG", href: "/user/config-sg", icon: Cog },
        { name: "Create SG", href: "/user/create-sg", icon: Cog },
        { name: "Define SG", href: "/user/define-sg", icon: Settings },
        { name: "Create PT", href: "/user/create-pt", icon: Cog },
        { name: "Create BRG", href: "/user/create-brg", icon: Cog },
        { name: "Create DD", href: "/user/create-dd", icon: Cog },
        { name: "Create FT", href: "/user/create-ft", icon: Cog },
        { name: "Create SG2", href: "/user/create-sg2", icon: Cog },
      ],
    },
  ];

  const personalItems: SidebarItem[] = [
    {
      name: "Profile Settings",
      href: "/profile",
      icon: User,
    },
    {
      name: "Logout",
      href: "/login",
      icon: LogOut,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out transform overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Close button - only show on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          {/* Sidebar content */}
          <div className="flex-1 py-4">
            {isAdmin ? (
              <div className="px-3">
                <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Features
                </h2>
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                        pathname === item.href
                          ? "bg-gray-100 text-blue-600"
                          : "text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5",
                          pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-400"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-3 space-y-6">
                {userGroups.map((group) => (
                  <div key={group.name}>
                    <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.name}
                    </h2>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                            pathname === item.href
                              ? "bg-gray-100 text-blue-600"
                              : "text-gray-900 hover:bg-gray-50"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "mr-3 h-5 w-5",
                              pathname === item.href
                                ? "text-blue-600"
                                : "text-gray-400"
                            )}
                          />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* User section at the bottom */}
            <div className="px-3 mt-6 pt-6 border-t border-gray-200">
              <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </h2>
              <div className="space-y-1">
                {personalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                      pathname === item.href
                        ? "bg-gray-100 text-blue-600"
                        : "text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        pathname === item.href
                          ? "text-blue-600"
                          : "text-gray-400"
                      )}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
