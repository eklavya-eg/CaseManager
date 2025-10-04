"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Upload, 
  Database, 
  BarChart3, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Model Upload', href: '/model-upload', icon: Upload },
  { name: 'Data Upload', href: '/data-upload', icon: Database },
  { name: 'Accuracy Check', href: '/accuracy-check', icon: BarChart3 },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CaseManager
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group hover:scale-[1.02]",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                        )} />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isActive ? "text-white transform rotate-90" : "text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1"
                      )} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-4 py-6 border-t border-slate-200">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">AI</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">AI Assistant</p>
                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}