'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAppSelector } from '@/store/hooks';
import { Toaster } from 'react-hot-toast';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isLoggedIn = useAppSelector((state) => state.auth.token);
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position='top-center' />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {isLoggedIn && (
        <>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
      )}
      <div className={`transition-all duration-200 ${isLoggedIn && isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="pt-10 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </main>
  );
} 