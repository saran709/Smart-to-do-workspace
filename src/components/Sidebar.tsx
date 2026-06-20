import React, { useState } from "react";
import { 
  Briefcase, FolderKanban, Calendar, BarChart3, Bot, Settings, ShieldAlert, BookOpen, 
  Menu, X, LogIn, LogOut, UserCircle, Plus, Sparkles, CheckSquare, Bell, Moon, Sun
} from "lucide-react";
import { Workspace, User, Notification } from "../types";

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  selectWorkspace: (id: string) => void;
  user: User | null;
  onLogout: () => void;
  onLoginSimulate: () => void;
  onNewWorkspaceOpen: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Sidebar({
  currentView,
  setView,
  workspaces,
  activeWorkspace,
  selectWorkspace,
  user,
  onLogout,
  onLoginSimulate,
  onNewWorkspaceOpen,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  darkMode,
  setDarkMode
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { id: "kanban", name: "Kanban Board", icon: FolderKanban },
    { id: "calendar", name: "Calendar View", icon: Calendar },
    { id: "analytics", name: "Analytics & Export", icon: BarChart3 },
    { id: "ai", name: "AI Copilot Hub", icon: Bot, highlight: true },
    { id: "settings", name: "Workspace Settings", icon: Settings },
    { id: "admin", name: "Admin Dashboard", icon: ShieldAlert, adminOnly: true },
    { id: "docs", name: "SaaS Dev Docs", icon: BookOpen }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-400" />
          <span className="font-sans font-bold tracking-tight text-lg">Smart To-Do</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications Button Mobile */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="p-1.5 hover:bg-slate-800 rounded-lg relative transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Layout */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-200 border-r border-slate-800 transform md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:h-screen`}
      >
        <div className="flex flex-col overflow-y-auto flex-grow p-4">
          
          {/* Main Logo Header */}
          <div className="hidden md:flex items-center gap-2.5 pb-6 mb-2 border-b border-slate-800">
            <div className="p-1.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold tracking-tight text-md text-white">To-Do Workspace</span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Copilot SaaS v1.0</span>
            </div>
          </div>

          {/* User Section banner */}
          <div className="mb-6 p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar ? (
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-700 object-cover flex-shrink-0" alt="avatar" />
              ) : (
                <UserCircle className="w-8 h-8 text-slate-400 flex-shrink-0" />
              )}
              <div className="truncate flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.name || "Guest Account"}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{user?.email || "Offline mode"}</span>
              </div>
            </div>
            <button 
              onClick={user ? onLogout : onLoginSimulate} 
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={user ? "Logout" : "Login"}
            >
              {user ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="mb-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-slate-400 px-1">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Workspace</span>
              <button 
                onClick={() => { setMobileOpen(false); onNewWorkspaceOpen(); }}
                className="p-1 hover:bg-slate-800 hover:text-white text-slate-400 rounded-lg transition-colors"
                title="Create Workspace"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
              {workspaces.map(w => {
                const isActive = activeWorkspace?.id === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => { selectWorkspace(w.id); setMobileOpen(false); }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all border
                      ${isActive 
                        ? "bg-indigo-900/40 text-indigo-200 border-indigo-700/60 font-semibold" 
                        : "hover:bg-slate-900 text-slate-300 border-transparent hover:border-slate-800"}`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate flex-1">{w.name}</span>
                    <span className="text-[9px] px-1 bg-slate-800 text-slate-400 font-mono rounded">
                      {w.members.length}m
                    </span>
                  </button>
                );
              })}
              {workspaces.length === 0 && (
                <div className="text-[10px] text-slate-500 italic px-2">No workspace yet</div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 p-1 font-mono mb-1">Navigation</div>
            {menuItems.map(item => {
              if (item.adminOnly && user?.role !== "Admin") return null;
              const isActive = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id); setMobileOpen(false); }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group border
                    ${isActive 
                      ? "bg-slate-900 border-slate-800 text-white font-medium" 
                      : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 duration-150
                      ${isActive 
                        ? (item.highlight ? "text-amber-400" : "text-indigo-400") 
                        : "text-slate-500 group-hover:text-slate-300"}`} 
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && (
                    <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold tracking-wider select-none uppercase font-mono animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Options & Quick Controls */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          
          {/* Notifications Trigger Desktop */}
          <div className="hidden md:flex items-center justify-between text-xs px-1 text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl p-2 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center gap-2 hover:text-white transition-colors text-left font-mono"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Inbox Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-rose-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
                title={darkMode ? "Switch to Light View" : "Switch to Dark View"}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center select-none">
            © 2026 To-Do Workspace SaaS
          </div>
        </div>
      </aside>

      {/* Notifications Inbox Popover */}
      {showNotifications && (
        <div className="fixed top-14 md:top-auto md:bottom-20 ml-2 md:left-64 z-50 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold font-sans text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-400" /> System Inbox
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClearNotifications} 
                className="text-[10px] text-slate-400 hover:text-white hover:underline transition-colors font-mono"
              >
                Clear All
              </button>
              <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-850 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {notifications.length === 0 && (
              <div className="text-center p-6 text-slate-500 text-xs italic">
                Inbox is empty. No recent updates!
              </div>
            )}
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition-all relative
                  ${n.read ? "bg-slate-900/40 border-slate-800/80 text-slate-400" : "bg-slate-800/60 border-slate-700 text-slate-200"}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${n.type === "warning" ? "text-amber-400" : n.type === "success" ? "text-emerald-400" : "text-indigo-300"}`}>
                    {n.title}
                  </span>
                  {!n.read && (
                    <button 
                      onClick={() => onMarkNotificationRead(n.id)}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                <span className="text-[8px] text-slate-500 text-right block mt-1 font-mono">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
