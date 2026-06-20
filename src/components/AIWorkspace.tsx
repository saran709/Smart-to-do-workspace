import React, { useState } from "react";
import { 
  Bot, Sparkles, Brain, AlertTriangle, ShieldCheck, ListPlus, ArrowRight, Play, 
  HelpCircle, RefreshCw, Layers, ClipboardCheck, ArrowUpRight, CheckSquare, Zap
} from "lucide-react";
import { Workspace, Project, Task, Priority } from "../types";

interface AIWorkspaceProps {
  activeWorkspace: Workspace | null;
  projects: Project[];
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => void;
}

interface PrioritizedItem {
  taskId: string;
  taskTitle: string;
  rank: number;
  urgencyLevel: string;
  reasoning: string;
}

interface PrioritizeResponse {
  summary: string;
  prioritizedList: PrioritizedItem[];
  coachingAdvice: string;
  error?: string;
}

interface SuggestedTask {
  title: string;
  description: string;
  priority: string;
  tags: string[];
}

interface RiskAssessmentResponse {
  overallRiskScore: number;
  riskTier: string;
  criticalInsights: string[];
  mitigationSteps: string[];
  error?: string;
}

export default function AIWorkspace({
  activeWorkspace,
  projects,
  tasks,
  onAddTask
}: AIWorkspaceProps) {
  // active states
  const [activeTab, setActiveTab] = useState<"priorities" | "suggestions" | "risks">("priorities");

  // priorities loading state & responses
  const [prioritizeLoading, setPrioritizeLoading] = useState(false);
  const [prioritizeResult, setPrioritizeResult] = useState<PrioritizeResponse | null>(null);

  // suggestions loading state & responses
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestResult, setSuggestResult] = useState<SuggestedTask[] | null>(null);

  // risks loading state & responses
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskAssessmentResponse | null>(null);

  // trigger priorities analysis
  const handleRunPrioritization = async () => {
    if (!activeWorkspace) return;
    setPrioritizeLoading(true);
    setPrioritizeResult(null);

    try {
      const res = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWorkspace.id })
      });
      const data = await res.json();
      setPrioritizeResult(data);
    } catch (err) {
      console.error(err);
      setPrioritizeResult({
        summary: "Connection failure processing workspace prioritization analysis.",
        prioritizedList: [],
        coachingAdvice: "Ensure the local Express dev server is fully booted and your internet query is active."
      });
    } finally {
      setPrioritizeLoading(false);
    }
  };

  // trigger suggestions creator
  const handleRunSuggestions = async () => {
    if (!selectedProjectId) return;
    setSuggestLoading(true);
    setSuggestResult(null);

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      const data = await res.json();
      setSuggestResult(data);
    } catch (err) {
      console.error(err);
      setSuggestResult([]);
    } finally {
      setSuggestLoading(false);
    }
  };

  // instantly write suggestion to board with 1 click
  const handleAddSuggestedTaskToBoard = (suggest: SuggestedTask) => {
    if (!activeWorkspace) return;
    onAddTask({
      workspaceId: activeWorkspace.id,
      projectId: selectedProjectId,
      title: suggest.title,
      description: suggest.description,
      status: "To Do",
      priority: (suggest.priority as Priority) || "Medium",
      tags: suggest.tags,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
    
    // Optimistic deletion from results or indicate added
    if (suggestResult) {
      setSuggestResult(prev => prev ? prev.filter(s => s.title !== suggest.title) : null);
    }
    alert(`Successfully created task card: "${suggest.title}" on your To Do board!`);
  };

  // trigger risk analysis
  const handleRunRiskAssessment = async () => {
    if (!activeWorkspace) return;
    setRiskLoading(true);
    setRiskResult(null);

    try {
      const res = await fetch("/api/ai/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWorkspace.id })
      });
      const data = await res.json();
      setRiskResult(data);
    } catch (err) {
      console.error(err);
      setRiskResult({
        overallRiskScore: 50,
        riskTier: "Medium",
        criticalInsights: ["Could not establish risk mapping."],
        mitigationSteps: ["Verify server console logging."]
      });
    } finally {
      setRiskLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto select-none">
      
      {/* Header panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-indigo-650 text-indigo-500 rounded-lg shrink-0">
              <Bot className="w-6 h-6" />
            </span>
            <span>Gemini AI Agility Copilot</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-500 dark:text-amber-400 font-mono font-bold tracking-wide animate-pulse">
              Active Server-Side
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Integrate advanced, contextual intelligence with your task lists to predict milestone risks, sequence backlogs, and write smart suggestions.
          </p>
        </div>
      </div>

      {/* AI UTILITIES TABS SWITCHER */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mb-6 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab("priorities")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5
            ${activeTab === "priorities" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <Brain className="w-4 h-4" /> Priority Sequencer
        </button>

        <button
          onClick={() => setActiveTab("suggestions")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5
            ${activeTab === "suggestions" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <ListPlus className="w-4 h-4" /> Task Suggestions Maker
        </button>

        <button
          onClick={() => setActiveTab("risks")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5
            ${activeTab === "risks" 
              ? "border-indigo-605 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
              : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <AlertTriangle className="w-4 h-4" /> Deadline Risk Assessment
        </button>
      </div>

      {/* TAB CONTENT: 1. PRIORITY SEQUENCER */}
      {activeTab === "priorities" && (
        <div className="flex flex-col gap-6 max-w-4xl">
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-505 text-indigo-400" /> Optimize Workspace Sequences
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Agile Priority Sequencer evaluates your entire current Kanban board metrics, priority tags, and due dates, returning a ranked execution hierarchy to bypass project bottlenecks.
            </p>
            <button
              onClick={handleRunPrioritization}
              disabled={prioritizeLoading}
              className="mt-2 text-xs py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold font-sans tracking-wide shadow flex items-center gap-2 self-start cursor-pointer"
            >
              {prioritizeLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sequencing Workspace...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-indigo-200 filling-white" /> Rank Active Backlog
                </>
              )}
            </button>
          </div>

          {/* Priorities results rendering */}
          {prioritizeResult && (
            <div className="flex flex-col gap-5">
              
              {prioritizeResult.error && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-[11px] text-amber-700 dark:text-amber-400 rounded-xl leading-relaxed italic">
                  ⚠️ Note: {prioritizeResult.error} Fallback offline sequence was processed.
                </div>
              )}

              {/* High-level summary statement */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-2xl flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">GEMINI EXECUTIVE ANALYSIS</span>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mt-1">{prioritizeResult.summary}</p>
              </div>

              {/* Sequence Rank listings */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-sans font-bold tracking-wider uppercase text-slate-400">OPTIMUM FLOW SEQUENCE</span>
                
                {prioritizeResult.prioritizedList.map((item, idx) => (
                  <div 
                    key={item.taskId} 
                    className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl hover:border-slate-350 dark:hover:border-slate-700 transition-all flex items-start gap-4"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                      {item.rank}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.taskTitle}</span>
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold uppercase
                          ${item.urgencyLevel === "Highest" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400" :
                            item.urgencyLevel === "High" ? "bg-amber-100 text-amber-805 dark:bg-amber-950/30 dark:text-amber-400" :
                            "bg-indigo-100 text-indigo-808 dark:bg-indigo-950/30 dark:text-indigo-400"
                          }`}>
                          {item.urgencyLevel} GTM priority
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-400 mt-1.5">
                        {item.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coaching summary advice */}
              <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/15 border border-indigo-200/40 dark:border-indigo-800/40 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                <span className="text-[10px] text-indigo-500 font-bold uppercase font-mono tracking-wider">AGILE COACHING FEEDBACK</span>
                <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-300 italic">
                  "{prioritizeResult.coachingAdvice}"
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: 2. TASK SUGGESTIONS */}
      {activeTab === "suggestions" && (
        <div className="flex flex-col gap-6 max-w-4xl">
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <ListPlus className="w-4 h-4 text-indigo-400" /> Recommend roadmap tasks
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Pick a targeted Project stream below. Agility Copilot will evaluate current cataloged records, and recommend four outstanding tasks essential to successfully finalize development.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleRunSuggestions(); }} className="flex items-center gap-3 mt-3 flex-wrap">
              <select
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 font-semibold text-slate-705 dark:text-slate-300 focus:outline-none"
              >
                <option value="">-- Choose Project Stream --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={suggestLoading || !selectedProjectId}
                className="text-xs py-2.5 px-4 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
              >
                {suggestLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Planning tasks...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" /> Generate suggestions
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Suggestions results render lists */}
          {suggestResult && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-sans font-bold tracking-wider text-slate-450 uppercase">SUGGESTED PATHWAYS FOR INSERTION</span>
              
              {suggestResult.length === 0 && (
                <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-550 border italic text-xs">
                  All suggested items successfully imported! Pick another project stream.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestResult.map((sg, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug">{sg.title}</span>
                        <span className="text-[8px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded tracking-wide uppercase">
                          {sg.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed italic">
                        {sg.description}
                      </p>
                      
                      <div className="flex gap-1.5 mt-3 wrap">
                        {sg.tags.map(t => (
                          <span key={t} className="text-[8px] font-mono px-2 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-450 rounded uppercase tracking-wider">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSuggestedTaskToBoard(sg)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-[11px] font-sans font-bold text-indigo-600 dark:text-indigo-400 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ListPlus className="w-3.5 h-3.5" /> Inject into Kanbanboard
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: 3. DEADLINE RISK ASSESSMENT */}
      {activeTab === "risks" && (
        <div className="flex flex-col gap-6 max-w-4xl">
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="font-sans font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" /> Estimate Deadline Exceeded Risks
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Risk assessment modeling evaluates active task backlog deadlines, unmapped subtask objectives, and teammate overload ratios to deliver raw Risk Scores and action mitigations.
            </p>
            <button
              onClick={handleRunRiskAssessment}
              disabled={riskLoading}
              className="mt-2 text-xs py-2.5 px-4 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold font-sans tracking-wide shadow flex items-center gap-2 self-start cursor-pointer"
            >
              {riskLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Modeling Risk levels...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-indigo-200" /> Start Assessment Model
                </>
              )}
            </button>
          </div>

          {/* Risk Results rendering */}
          {riskResult && (
            <div className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Risk Gauge box */}
                <div className="md:col-span-1 p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl flex flex-col justify-between shadow-sm relative">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">WORKSPACE RISK RATING</span>
                    <span className={`text-4xl font-extrabold font-sans font-mono tracking-tight mt-2
                      ${riskResult.overallRiskScore > 70 ? "text-rose-500" : riskResult.overallRiskScore > 40 ? "text-amber-500" : "text-emerald-500"}`}>
                      {riskResult.overallRiskScore}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-mono text-slate-450 block uppercase">TIER STATUS LEVEL</span>
                    <span className={`text-xs font-semibold leading-normal mt-0.5 block
                      ${riskResult.riskTier === "Critical" ? "text-rose-505 font-bold text-rose-500" : "text-slate-700 dark:text-slate-300"}`}>
                      ⚠️ {riskResult.riskTier} Warning
                    </span>
                  </div>
                </div>

                {/* Critical insights bullets */}
                <div className="md:col-span-2 p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-805 rounded-2xl flex flex-col gap-3 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Critical Bottleneck Warnings</span>
                  
                  <div className="flex flex-col gap-2.5">
                    {riskResult.criticalInsights.map((insight, id) => (
                      <div key={id} className="text-xs flex items-start gap-2 leading-relaxed text-slate-700 dark:text-slate-300">
                        <span className="text-rose-550 text-rose-500 text-sm mt-0.5 leading-none">•</span>
                        <p>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Mitigation pathways block advice */}
              <div className="p-5 bg-emerald-50/20 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-3 shadow-sm">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono tracking-wider">REMEDIAL ACTION STEPS RECOMMENDED</span>
                
                <div className="flex flex-col gap-3">
                  {riskResult.mitigationSteps.map((step, id) => (
                    <div key={id} className="text-xs flex items-start gap-2.5 leading-relaxed text-slate-650 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                        {id + 1}
                      </span>
                      <p className="mt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
