import React, { useState } from "react";
import { 
  Users, Settings, Shield, UserX, UserCheck, Plus, Check, Save, Sparkles, 
  Trash2, Layers, Paintbrush, ShieldAlert
} from "lucide-react";
import { Workspace, Role, User } from "../types";

interface WorkspaceSettingsProps {
  activeWorkspace: Workspace | null;
  onUpdateWorkspace: (data: Partial<Workspace>) => void;
  onDeleteWorkspace: () => void;
  onInviteMember: (email: string, role: Role) => void;
  onChangeMemberRole: (userId: string, role: Role) => void;
  users: User[];
  currentUserId: string;
}

export default function WorkspaceSettings({
  activeWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onInviteMember,
  onChangeMemberRole,
  users,
  currentUserId
}: WorkspaceSettingsProps) {
  // edit details
  const [activeTab, setActiveTab] = useState<"general" | "team" | "columns">("general");

  const [wsName, setWsName] = useState(activeWorkspace?.name || "");
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || "");
  const [wsTheme, setWsTheme] = useState(activeWorkspace?.theme || "ocean");

  // invite teammate states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Member");

  // column inputs
  const [newCol, setNewCol] = useState("");

  if (!activeWorkspace) {
    return (
      <div className="p-6 text-center text-slate-500 italic text-xs">
        No active workspace select. Create or choose one from sidebar.
      </div>
    );
  }

  // check if current user is owner/admin
  const me = activeWorkspace.members.find(m => m.userId === currentUserId);
  const isPrivileged = me && (me.role === "Owner" || me.role === "Admin");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged) return alert("Permission denied. Only Owners or Admins modify configurations.");
    onUpdateWorkspace({
      name: wsName,
      description: wsDesc,
      theme: wsTheme
    });
    alert("Workspace general settings saved successfully.");
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteMember(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    alert(`Successfully sent simulated invitation to ${inviteEmail}.`);
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCol.trim()) return;
    const currentCols = activeWorkspace.customColumns || ["To Do", "In Progress", "Review", "Completed"];
    if (currentCols.includes(newCol.trim())) {
      return alert("That column already exists in this workspace.");
    }
    onUpdateWorkspace({
      customColumns: [...currentCols, newCol.trim()]
    });
    setNewCol("");
  };

  const handleRemoveColumn = (colToRemove: string) => {
    const currentCols = activeWorkspace.customColumns || ["To Do", "In Progress", "Review", "Completed"];
    if (currentCols.length <= 2) {
      return alert("Workspace boards must maintain at least two columns.");
    }
    onUpdateWorkspace({
      customColumns: currentCols.filter(c => c !== colToRemove)
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto select-none max-w-4xl">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
            <span>Workspace Control panel</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono font-medium tracking-wide">
              Settings view
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure metadata, adjust themed styling, manage RBAC access tiers, and simulate team invites.
          </p>
        </div>
      </div>

      {/* TABS CONTROLLER */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mb-6 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5
            ${activeTab === "general" 
              ? "border-indigo-605 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <Settings className="w-4 h-4" /> General Parameters
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5
            ${activeTab === "team" 
              ? "border-indigo-605 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <Users className="w-4 h-4" /> Teammates & Access (RBAC)
        </button>

        <button
          onClick={() => setActiveTab("columns")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5
            ${activeTab === "columns" 
              ? "border-indigo-650 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <Layers className="w-4 h-4" /> Kanban Layout Columns
        </button>
      </div>

      {/* TAB CONTENT: 1. GENERAL PARAMETERS */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="flex flex-col gap-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 p-6 rounded-2xl shadow-sm text-xs select-none">
          
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-400">Workspace Title *</label>
            <input
              type="text"
              required
              disabled={!isPrivileged}
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-slate-800 dark:text-white text-xs disabled:opacity-50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-400">Strategic Target Description</label>
            <textarea
              rows={3}
              disabled={!isPrivileged}
              value={wsDesc}
              onChange={(e) => setWsDesc(e.target.value)}
              placeholder="Elaborate teams charter or mission..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-805 rounded-xl text-slate-800 dark:text-white text-xs disabled:opacity-50 focus:outline-none"
            />
          </div>

          {/* Theme selection panel */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1">
              <Paintbrush className="w-4 h-4 text-slate-400" /> Space Identity Theme Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "ocean", name: "🌊 Ocean Blueprint", bg: "bg-blue-600" },
                { id: "sunset", name: "🌅 Sunset Warmth", bg: "bg-rose-500" },
                { id: "slate", name: "🗄️ Tech Graphite", bg: "bg-slate-700" },
                { id: "forest", name: "🌲 Forest Pine", bg: "bg-emerald-600" }
              ].map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  disabled={!isPrivileged}
                  onClick={() => setWsTheme(theme.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all disabled:opacity-50
                    ${wsTheme === theme.id 
                      ? "bg-slate-900 border-indigo-500 text-white font-bold" 
                      : "bg-slate-50/50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border-slate-200 dark:border-slate-800"}`}
                >
                  <div className={`w-4 h-4 rounded-full ${theme.bg}`} />
                  <span className="text-[10px] uppercase font-mono">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save trigger / Delete Workspace warning trigger */}
          <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800 pt-5 mt-3">
            {isPrivileged ? (
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save General Options
              </button>
            ) : (
              <span className="text-slate-400 italic">Viewer access mode only. Edit privileged restricted.</span>
            )}

            {activeWorkspace.ownerId === currentUserId && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete workspace "${activeWorkspace.name}"? This deletes all associated Kanban tasks, comments, and project matrices! This cannot be undone.`)) {
                    onDeleteWorkspace();
                  }
                }}
                className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <Trash2 className="w-4 h-4" /> Destroy Workspace
              </button>
            )}
          </div>

        </form>
      )}

      {/* TAB CONTENT: 2. TEAMMATES & ACCESS RBAC */}
      {activeTab === "team" && (
        <div className="flex flex-col gap-6">

          {/* Create Invite Forms */}
          {isPrivileged && (
            <form onSubmit={handleInviteSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 p-6 rounded-2xl shadow-sm flex flex-col gap-3 text-xs">
              <h3 className="font-sans font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-indigo-400" /> Share Invitation with Teammate
              </h3>
              <p className="text-slate-400 max-w-xlLeading mt-0.5">
                Input teammate emails to instantly associate them with this workspace. This simulates an enterprise notification invitation trigger.
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap sm:flex-nowrap">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-slate-800 dark:text-white text-xs flex-grow focus:outline-none"
                />

                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-808 rounded-xl text-slate-805 dark:text-white text-xs focus:outline-none"
                >
                  <option value="Member">👤 Member</option>
                  <option value="Admin">🛠️ Admin</option>
                  <option value="Viewer">👁️ Viewer</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-sans tracking-wide shrink-0 transition-colors cursor-pointer"
                >
                  Add Teammate
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-805 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold font-sans uppercase tracking-wider text-slate-450 flex items-center gap-1">
              <Shield className="w-4 h-4 text-slate-400" /> Active Workspace Teammates ({activeWorkspace.members.length})
            </span>

            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-850">
              {activeWorkspace.members.map(member => {
                const isMe = member.userId === currentUserId;
                const isOwner = member.userId === activeWorkspace.ownerId;
                return (
                  <div key={member.userId} className="py-3 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        alt="avatar"
                      />
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-slate-800 dark:text-white truncate flex items-center gap-1">
                          {member.name} {isMe && <span className="text-[9px] px-1.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 rounded-full font-mono text-indigo-500 font-bold lowercase">You</span>}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 select-none">
                      {isMe || !isPrivileged || isOwner ? (
                        <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border font-mono text-slate-500 font-bold uppercase">
                          {isOwner ? "👑 OWNER" : member.role}
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => {
                            onChangeMemberRole(member.userId, e.target.value as Role);
                            alert(`Changed user ${member.name} role level to ${e.target.value}`);
                          }}
                          className="p-1 px-1.5 text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-650 rounded focus:outline-none cursor-pointer"
                        >
                          <option value="Admin">🛠️ Admin</option>
                          <option value="Member">👤 Member</option>
                          <option value="Viewer">👁️ Viewer</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 3. KANBAN LAYOUT COLUMNS */}
      {activeTab === "columns" && (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 p-6 rounded-2xl shadow-sm flex flex-col gap-4 text-xs">
            <h3 className="font-sans font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5 text-indigo-400" /> Workspace Column Architect
            </h3>
            <p className="text-slate-400 max-w-xl mt-0.5">
              Re-arrange, modify, or add dedicated status pipelines (columns) for your workspace Kanbanboard. Custom columns automatically sync with the cards' move triggers.
            </p>

            <div className="flex flex-col gap-2.5 mt-3 max-w-md">
              {(activeWorkspace.customColumns || ["To Do", "In Progress", "Review", "Completed"]).map(col => {
                const totalInCol = col; // mock or identifier
                return (
                  <div key={col} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-xl flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span>{col}</span>
                    </span>
                    
                    {isPrivileged && (
                      <button
                        onClick={() => handleRemoveColumn(col)}
                        className="text-xs text-rose-500 hover:text-rose-600 transition-colors"
                        title="Remove Column"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {isPrivileged && (
              <form onSubmit={handleAddColumn} className="flex items-center gap-2 mt-2 max-w-md">
                <input
                  type="text"
                  required
                  placeholder="Column label... (e.g. Backlog)"
                  value={newCol}
                  onChange={(e) => setNewCol(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-xl text-slate-800 dark:text-white text-xs flex-grow focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Column
                </button>
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
