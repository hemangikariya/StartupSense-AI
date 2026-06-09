import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  CheckCircle2,
  Landmark,
  ShieldAlert,
  Dna,
  Users,
  BarChart3,
  Grid,
  DollarSign,
  Target,
  Milestone,
  Code,
  Compass,
  Presentation,
  FileText,
  LineChart,
  Download,
  Bot,
  HelpCircle,
  User,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Analysis', path: '/new-analysis', icon: PlusCircle },
    { name: 'Success Prediction', path: '/success-prediction', icon: CheckCircle2 },
    { name: 'Investor Readiness', path: '/investor-readiness', icon: Landmark },
    { name: 'Risk Analysis', path: '/risk-analysis', icon: ShieldAlert },
    { name: 'Startup DNA', path: '/startup-dna', icon: Dna },
    { name: 'Competitors', path: '/competitors', icon: Users },
    { name: 'Market Research', path: '/market-research', icon: BarChart3 },
    { name: 'SWOT', path: '/swot', icon: Grid },
    { name: 'Revenue', path: '/revenue', icon: DollarSign },
    { name: 'Audience', path: '/audience', icon: Target },
    { name: 'MVP', path: '/mvp', icon: Milestone },
    { name: 'Tech Stack', path: '/tech-stack', icon: Code },
    { name: 'Branding', path: '/branding', icon: Compass },
    { name: 'Pitch Deck', path: '/pitch-deck', icon: Presentation },
    { name: 'Business Plan', path: '/business-plan', icon: FileText },
    { name: 'Forecasting', path: '/forecasting', icon: LineChart },
    { name: 'Reports', path: '/reports', icon: Download },
    { name: 'AI Mentor', path: '/ai-mentor', icon: Bot },
    { name: 'Help Center', path: '/help-center', icon: HelpCircle },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg select-none">
          <Sparkles className="h-6 w-6 text-sky-400 animate-pulse" />
          {!collapsed && (
            <span className="bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent font-extrabold">
              StartupSense AI
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin Section (Protected) */}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            {!collapsed && (
              <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Administration
              </span>
            )}
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm font-medium transition ${
                location.pathname === '/admin'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
              title={collapsed ? 'Admin Control' : undefined}
            >
              <Shield className="h-5 w-5 shrink-0 text-amber-500" />
              {!collapsed && <span>Admin Control</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-1 mb-2 bg-slate-800/40 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name || 'Founder'}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase font-semibold">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-200 hover:bg-rose-950/20 transition"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
