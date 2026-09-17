import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, Sparkles, Feather, Sunrise, Moon, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
const navItems = [
  { name: 'Morning', icon: Sunrise, path: 'MorningPractice' },
  { name: 'Affirmations', icon: Sparkles, path: 'Affirmations' },
  { name: 'Inner Voice', icon: MessageCircle, path: 'InnerVoice' },
  { name: 'Home', icon: Home, path: 'Home' },
  { name: 'Evening', icon: Moon, path: 'EveningPractice' },
];
export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'Home';
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-20
0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-gray-800" />
              <span className="text-lg font-medium text-gray-800">Mind State</span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-200px)]">
              {navItems.map((item) => {
                const isActive = currentPath === item.path ||
                  (currentPath === '' && item.path === 'Home');
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="md:pt-20 pb-24 md:pb-8">
        {children}
      </main>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center py-2 px-2 overflow-x-auto gap-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPath === item.path ||
              (currentPath === '' && item.path === 'Home');
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.path)}
                className="flex flex-col items-center py-2 px-3"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive ? "bg-gray-900" : ""
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-gray-400"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-xs mt-1 transition-colors",
                  isActive ? "text-gray-900 font-medium" : "text-gray-400"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
