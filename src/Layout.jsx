import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, Sparkles, Feather, Sunrise, Moon, MessageCircle, UserCircle2, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const navItems = [
  { name: 'Morning', icon: Sunrise, path: 'MorningPractice' },
  { name: 'Affirmations', icon: Sparkles, path: 'Affirmations' },
  { name: 'Inner Voice', icon: MessageCircle, path: 'InnerVoice' },
  { name: 'Home', icon: Home, path: 'Home' },
  { name: 'Evening', icon: Moon, path: 'EveningPractice' },
];
function AccountMenu() {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        aria-label="Account"
      >
        <UserCircle2 className="w-5 h-5" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => {
              setMenuOpen(false);
              setOpen(true);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Change password
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              signOut();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Choose a new password for your account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">Password updated.</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'Home';
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
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
            <AccountMenu />
          </div>
        </div>
      </header>
      {/* Mobile Account Button */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        <AccountMenu />
      </div>
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
