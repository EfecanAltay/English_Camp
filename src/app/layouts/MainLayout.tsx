import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header */}
        <Header />

        {/* Page View */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
