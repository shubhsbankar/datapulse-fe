'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

interface NavbarProps {
  toggleSidebar?: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.token);

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isAuthenticated && toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <img className=" w-auto h-10 z-0" src="/bg.png" alt="logo" />
            <span className="text-xl font-semibold text-gray-900">DataPulse</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          ) : (
            <div>
              {/* Add authenticated user menu here */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 