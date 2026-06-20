import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Tag, Database, CornerDownLeft, AlertCircle, X, Sparkles, FolderOpen } from "lucide-react";
import { Task, Workspace, Project, User } from "../types";

interface GlobalSearchBarProps {
  tasks: Task[];
  workspaces: Workspace[];
  projects: Project[];
  users: User[];
  onSelectTask: (task: Task) => void;
}

export default function GlobalSearchBar({
  tasks,
  workspaces,
  projects,
  users,
  onSelectTask
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "critical" | "tags">("all");
  const [keyboardIndex, setKeyboardIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close the drawer if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard shortcut listener: `/` focuses the search input (if not in a focused input/textarea)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Normalize query and filter matching tasks
  const normalizedQuery = query.toLowerCase().trim();

  const getWorkspaceName = (wsId: string) => {
    return workspaces.find(w => w.id === wsId)?.name || "External Sandbox";
  };

  const getProjectName = (projId: string) => {
    return projects.find(p => p.id === projId)?.name || "";
  };

  const filteredTasks = tasks.filter(task => {
    // 1. Core query filter (matches title or any tag)
    const matchesTitle = task.title.toLowerCase().includes(normalizedQuery);
    const matchesTags = (task.tags || []).some(t => t.toLowerCase().includes(normalizedQuery.replace("#", "")));
    
    if (normalizedQuery && !matchesTitle && !matchesTags) {
      return false;
    }

    // 2. Specific filter mode controls
    if (activeFilter === "active") {
      // Exclude Completed task status columns safely (Review, Completed, Done etc.)
      return task.status.toLowerCase() !== "completed" && task.status.toLowerCase() !== "done";
    }
    if (activeFilter === "critical") {
      return task.priority === "Critical" || task.priority === "High";
    }
    if (activeFilter === "tags") {
      return (task.tags || []).length > 0;
    }

    return true;
  });

  // Limit to elegant slice of results to maintain screen speed
  const slicedResults = filteredTasks.slice(0, 10);

  // Reset index when list or search query updates
  useEffect(() => {
    setKeyboardIndex(-1);
  }, [query, activeFilter]);

  // Handle keyboard selectors
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardIndex(prev => (prev < slicedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardIndex(prev => (prev > 0 ? prev - 1 : slicedResults.length - 1));
    } else if (e.key === "Enter") {
      if (keyboardIndex >= 0 && keyboardIndex < slicedResults.length) {
        e.preventDefault();
        onSelectTask(slicedResults[keyboardIndex]);
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Medium":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const currentThemeDot = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("todo") || s.includes("to do")) return "bg-slate-400";
    if (s.includes("progress")) return "bg-blue-500";
    if (s.includes("review")) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-md select-none font-sans">
      {/* Target input wrapper */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search cross-node tasks..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9.5 pr-8 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-812 rounded-xl text-[11px] font-sans font-medium text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <div className="absolute right-2.5 hidden xs:flex items-center gap-0.5 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] text-slate-400 font-mono select-none pointer-events-none">
            <span className="text-[8px]">/</span>
          </div>
        )}
      </div>

      {/* Floating Results Popup Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2.5 w-[290px] xs:w-[350px] sm:w-[420px] md:w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs flex flex-col">
          
          {/* Custom Instant filter selectors */}
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-800/60 overflow-x-auto whitespace-nowrap scrollbar-none flex-shrink-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                activeFilter === "active"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveFilter("critical")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                activeFilter === "critical"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              🔥 Critical / High
            </button>
            <button
              onClick={() => setActiveFilter("tags")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                activeFilter === "tags"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              🏷️ Has Tags
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
            {slicedResults.map((task, index) => {
              const isSelected = index === keyboardIndex;
              const wsName = getWorkspaceName(task.workspaceId);
              const projName = getProjectName(task.projectId);

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  onMouseEnter={() => setKeyboardIndex(index)}
                  className={`p-3 flex gap-3.5 items-start justify-between cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? "bg-indigo-50/75 dark:bg-indigo-950/40 border-l-2 border-indigo-600" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Workspace/Project metadata track */}
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono tracking-wide">
                      <Database className="w-3 h-3 text-indigo-400" />
                      <span className="truncate max-w-[120px] font-semibold">{wsName}</span>
                      {projName && (
                        <>
                          <span>➔</span>
                          <span className="text-slate-400 dark:text-slate-400 truncate max-w-[100px]">📂 {projName}</span>
                        </>
                      )}
                    </div>

                    {/* Task Title */}
                    <span className="font-semibold text-slate-850 dark:text-white leading-tight">
                      {task.title}
                    </span>

                    {/* Task status & tags row */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Column status */}
                      <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-300 font-mono uppercase">
                        <span className={`w-1.5 h-1.5 rounded-full ${currentThemeDot(task.status)}`} />
                        {task.status}
                      </span>

                      {/* Display matched or general tags */}
                      {(task.tags || []).map(t => (
                        <span key={t} className="flex items-center gap-0.5 text-[9px] text-indigo-500 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/50 px-1.5 py-0.2 rounded-md font-mono">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Task details side elements */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold tracking-wider uppercase border ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-[9px] text-slate-400 font-mono font-medium">
                        📅 {task.dueDate}
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[8px] text-slate-400 dark:text-slate-400 font-mono flex items-center gap-1 select-none animate-pulse">
                        <CornerDownLeft className="w-2.5 h-2.5 text-indigo-500" /> Enter to view
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty States */}
            {slicedResults.length === 0 && (
              <div className="py-8 px-6 text-center flex flex-col items-center gap-2">
                <AlertCircle className="w-7 h-7 text-slate-400" />
                <div className="text-slate-650 dark:text-slate-400 font-medium">No results found</div>
                <p className="text-[10px] text-slate-400 max-w-xs font-mono">
                  No objectives matching your search query. Try typing another term or refining the filters above.
                </p>
              </div>
            )}
          </div>

          {/* Prompt footer info */}
          <div className="p-2 px-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 font-mono flex justify-between items-center flex-shrink-0 select-none">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Search scans names & tags
            </span>
            <span className="text-[9px] bg-slate-200/60 dark:bg-slate-800/80 px-1 rounded">ESC to cancel</span>
          </div>

        </div>
      )}
    </div>
  );
}
