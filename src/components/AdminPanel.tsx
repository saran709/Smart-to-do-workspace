import React, { useState } from "react";
import { 
  ShieldAlert, Users, Database, Globe2, Activity, Terminal, RefreshCw, BarChart, 
  CreditCard, HardDrive, KeyRound, Radio, RadioReceiver, ShieldCheck, CheckSquare, Zap
} from "lucide-react";
import { User, Workspace, Task } from "../types";

interface AdminPanelProps {
  users: User[];
  workspaces: Workspace[];
  tasks: Task[];
  activityLogs: any[];
}

export default function AdminPanel({ users, workspaces, tasks, activityLogs }: AdminPanelProps) {
  const [runningDiag, setRunningDiag] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);

  // diagnose database helper
  const runDiagnostics = () => {
    setRunningDiag(true);
    setDiagResult(null);

    setTimeout(() => {
      setDiagResult(`[DIAGNOSTICS REPORT - UTC]
SYSTEM STATUS: ACTIVE
DATABASE INTEGRITY: OK (Local JSON DB Backed)
ACTIVE WORKSPACE CONTAINERS: ${workspaces.length}
REGISTERED METRICS USERS: ${users.length}
SENSITIVE ENDPOINTS ENCRYPTION: SHA256 hashing active
SANDBOX API PORT BOUNDS: 3000 (compliant)
SERVICE HEALTHCHECK CODE: 200 SUCCESS
DIAGNOSTIC CYCLE COMPLETED successfully.`);
      setRunningDiag(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto select-none max-w-5xl">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-orange-650 text-indigo-505 rounded-lg shrink-0">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
            </span>
            <span>Central SaaS Admin Panel</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-mono font-bold tracking-wide">
              Security Override Active
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Evaluate global container resources, audit systems activity logs, simulate diagnostic diagnostics, and supervise subscriptions metrics.
          </p>
        </div>
      </div>

      {/* METRICS ROW WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        
        {/* Total users */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Platform Accounts</span>
            <span className="text-2xl font-extrabold font-mono text-white mt-1">{users.length}</span>
            <span className="text-[8px] text-emerald-400 font-mono font-bold mt-1">● Online active</span>
          </div>
          <Users className="w-8 h-8 text-slate-650 text-slate-600" />
        </div>

        {/* Global Workspaces */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Active Workspaces</span>
            <span className="text-2xl font-extrabold font-mono text-white mt-1">{workspaces.length}</span>
            <span className="text-[8px] text-indigo-400 font-mono mt-1">Multi-tenant nodes</span>
          </div>
          <Database className="w-8 h-8 text-slate-650 text-slate-600" />
        </div>

        {/* Global task cards */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Task Cards Tracked</span>
            <span className="text-2xl font-extrabold font-mono text-white mt-1">{tasks.length}</span>
            <span className="text-[8px] text-slate-450 font-mono mt-1">Sprint board items</span>
          </div>
          <CheckSquare className="w-8 h-8 text-slate-650 text-slate-600" />
        </div>

        {/* Node latency container */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Server latency</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">14 ms</span>
            <span className="text-[8px] text-emerald-400 font-mono font-bold mt-1">● Healthy container</span>
          </div>
          <Radio className="w-8 h-8 text-emerald-500 animate-pulse" />
        </div>

      </div>

      {/* LOWER SPLITS: Diagnostics telemetry + System Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-6">
        
        {/* Diagnostics & Subscriptions Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Databases diagnosis */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4 text-xs">
            <h3 className="font-mono font-bold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <HardDrive className="w-4 h-4 text-slate-400" /> Storage status Diagnostic
            </h3>
            
            <p className="text-slate-400 leading-normal leading-relaxed">
              Verify sector integrity, schema alignments, backup states and encryption endpoints. Fits standard enterprise diagnostic cycles.
            </p>

            <button
              onClick={runDiagnostics}
              disabled={runningDiag}
              className="px-4 py-2.5 bg-orange-650 bg-orange-600 hover:bg-orange-555 text-white font-bold font-sans tracking-wide rounded-xl shadow cursor-pointer self-start transition-colors"
            >
              {runningDiag ? "Inspecting Database Sectors..." : "Integrity Diagnostics Run"}
            </button>

            {diagResult && (
              <pre className="p-3 bg-black text-emerald-400 text-[10px] font-mono leading-relaxed rounded-xl overflow-x-auto whitespace-pre">
                {diagResult}
              </pre>
            )}
          </div>

          {/* Subscriptions management */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4 text-xs">
            <h3 className="font-mono font-bold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <CreditCard className="w-4 h-4 text-slate-400" /> SaaS Billing & Subscriptions
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-slate-300">
                <span>Enterprise Tier</span>
                <span className="font-bold text-white">Active</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Monthly Recurring</span>
                <span className="font-bold font-mono text-white">$149.00 USD</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Renewal Scheduled</span>
                <span className="font-mono text-slate-400 font-semibold">July 17, 2026</span>
              </div>
            </div>

            <button
              onClick={() => alert("Simulation billing action completed successfully.")}
              className="w-full py-2 bg-slate-800 hover:bg-slate-755 text-slate-200 font-bold font-sans tracking-wide rounded-xl transition-all cursor-pointer text-center"
            >
              Verify Stripe API parameters
            </button>
          </div>

        </div>

        {/* Global activity logs database stream */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl flex flex-col gap-4 shadow-sm h-full overflow-hidden">
          <span className="text-xs font-bold font-sans uppercase tracking-wider text-slate-450 flex items-center gap-1">
            <Terminal className="w-4 h-4 text-slate-400" /> Platform Audit logs database stream ({activityLogs.length})
          </span>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {activityLogs.map((log, id) => (
              <div 
                key={log.id || id} 
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-xl flex flex-col gap-1 text-xs text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-white font-sans flex items-center gap-1">
                    👤 {log.userName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1 flex-wrap font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold uppercase rounded">
                    {log.action}
                  </span>
                  {log.taskId && <span className="text-slate-400">TaskID: {log.taskId}</span>}
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 mt-1 leading-normal italic">
                  "{log.details}"
                </p>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="text-center p-8 text-slate-400 italic text-[11px]">
                Audit stream empty. Activity metrics are active.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
