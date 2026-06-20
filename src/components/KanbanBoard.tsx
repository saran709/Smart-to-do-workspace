import React, { useState, useEffect } from "react";
import { 
  CheckSquare, Plus, Library, Edit3, Trash2, Calendar, Tag, ChevronRight, MessageSquare, 
  Paperclip, Users, AlertTriangle, Play, HelpCircle, Check, X, ArrowRightLeft,
  ChevronDown, Search, ArrowUpRight, ArrowDown, Activity, RefreshCw, Sparkles
} from "lucide-react";
import { Workspace, Project, Task, Subtask, Comment, User, Priority, TaskStatus, ProjectTemplate } from "../types";

interface KanbanBoardProps {
  activeWorkspace: Workspace | null;
  projects: Project[];
  tasks: Task[];
  users: User[];
  onAddTask: (taskData: Partial<Task>) => void;
  onUpdateTask: (id: string, taskData: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subId: string, completed: boolean) => void;
  onAddAttachment: (taskId: string, attData: any) => void;
  onAddComment: (taskId: string, text: string) => void;
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  onNewProjectOpen: () => void;
  onNewWorkspaceOpen?: () => void;
  onAddCustomColumn: (column: string) => void;
  selectedTaskId?: string | null;
  onClearSelectedTaskId?: () => void;
  templates?: ProjectTemplate[];
  onSaveTemplate?: (name: string, description: string, projectId: string) => void;
  onInstantiateTemplate?: (templateId: string) => void;
  onUpdateWorkspace?: (updateData: Partial<Workspace>) => void;
}

function ProgressRing({ value, size = 32, strokeWidth = 3, showText = true }: { value: number; size?: number; strokeWidth?: number; showText?: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let ringColorClass = "text-indigo-600 dark:text-indigo-400";
  let bgRingColorClass = "text-slate-100 dark:text-slate-800";
  let textColorClass = "text-slate-750 dark:text-slate-350";

  if (value === 0) {
    ringColorClass = "text-slate-200 dark:text-slate-800";
  } else if (value === 100) {
    ringColorClass = "text-emerald-500 dark:text-emerald-450";
    textColorClass = "text-emerald-600 dark:text-emerald-400 font-bold";
  } else if (value >= 75) {
    ringColorClass = "text-indigo-500 dark:text-indigo-400";
  } else if (value >= 50) {
    ringColorClass = "text-violet-500 dark:text-violet-400";
  } else if (value >= 25) {
    ringColorClass = "text-amber-500 dark:text-amber-400";
  } else {
    ringColorClass = "text-rose-500 dark:text-rose-450";
  }

  return (
    <div className="relative flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className={bgRingColorClass}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${ringColorClass} transition-all duration-300 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <span className={`absolute text-[8px] font-mono leading-none font-extrabold ${textColorClass}`}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

export const PALETTE_COLORS = [
  { name: "Indigo", value: "indigo", bg: "bg-indigo-500", darkBg: "dark:bg-indigo-400", hex: "#6366f1", text: "text-indigo-600 dark:text-indigo-400", bgLight: "bg-indigo-50/80 dark:bg-indigo-950/40", border: "border-indigo-250 dark:border-indigo-900/40" },
  { name: "Emerald", value: "emerald", bg: "bg-emerald-500", darkBg: "dark:bg-emerald-400", hex: "#10b981", text: "text-emerald-600 dark:text-emerald-400", bgLight: "bg-emerald-50/80 dark:bg-emerald-950/40", border: "border-emerald-250 dark:border-emerald-900/40" },
  { name: "Rose", value: "rose", bg: "bg-rose-500", darkBg: "dark:bg-rose-400", hex: "#f43f5e", text: "text-rose-600 dark:text-rose-400", bgLight: "bg-rose-50/80 dark:bg-rose-950/40", border: "border-rose-250 dark:border-rose-900/40" },
  { name: "Amber", value: "amber", bg: "bg-amber-500", darkBg: "dark:bg-amber-400", hex: "#f59e0b", text: "text-amber-600 dark:text-amber-400", bgLight: "bg-amber-50/80 dark:bg-amber-950/40", border: "border-amber-250 dark:border-amber-900/40" },
  { name: "Sky", value: "sky", bg: "bg-sky-500", darkBg: "dark:bg-sky-400", hex: "#0ea5e9", text: "text-sky-600 dark:text-sky-400", bgLight: "bg-sky-50/80 dark:bg-sky-950/40", border: "border-sky-250 dark:border-sky-900/40" },
  { name: "Violet", value: "violet", bg: "bg-violet-500", darkBg: "dark:bg-violet-400", hex: "#8b5cf6", text: "text-violet-600 dark:text-violet-400", bgLight: "bg-violet-50/80 dark:bg-violet-950/40", border: "border-violet-250 dark:border-violet-900/40" },
  { name: "Orange", value: "orange", bg: "bg-orange-500", darkBg: "dark:bg-orange-400", hex: "#f97316", text: "text-orange-600 dark:text-orange-400", bgLight: "bg-orange-50/80 dark:bg-orange-950/40", border: "border-orange-250 dark:border-orange-900/40" },
  { name: "Teal", value: "teal", bg: "bg-teal-500", darkBg: "dark:bg-teal-400", hex: "#14b8a6", text: "text-teal-600 dark:text-teal-400", bgLight: "bg-teal-50/80 dark:bg-teal-950/40", border: "border-teal-250 dark:border-teal-900/40" },
  { name: "Fuchsia", value: "fuchsia", bg: "bg-fuchsia-500", darkBg: "dark:bg-fuchsia-400", hex: "#d946ef", text: "text-fuchsia-600 dark:text-fuchsia-400", bgLight: "bg-fuchsia-50/80 dark:bg-fuchsia-950/40", border: "border-fuchsia-250 dark:border-fuchsia-900/40" },
  { name: "Slate", value: "slate", bg: "bg-slate-500", darkBg: "dark:bg-slate-400", hex: "#64748b", text: "text-slate-650 dark:text-slate-400", bgLight: "bg-slate-100 dark:bg-slate-900", border: "border-slate-200 dark:border-slate-800" }
];

export function getTagColorConfig(tagName: string, activeWorkspace: Workspace | null) {
  const normTag = tagName.toLowerCase().trim();
  const colorVal = activeWorkspace?.tagColors?.[normTag] || activeWorkspace?.tagColors?.[tagName];

  if (!colorVal) {
    return {
      hex: "#64748b",
      bgClass: "bg-slate-500 dark:bg-slate-400",
      textClass: "text-slate-600 dark:text-slate-400",
      bgLightClass: "bg-slate-100 dark:bg-slate-900",
      borderClass: "border-slate-200 dark:border-slate-800",
      isCustomHex: false
    };
  }

  const preset = PALETTE_COLORS.find(c => c.value === colorVal);
  if (preset) {
    return {
      hex: preset.hex,
      bgClass: `${preset.bg} ${preset.darkBg}`,
      textClass: preset.text,
      bgLightClass: preset.bgLight,
      borderClass: preset.border,
      isCustomHex: false
    };
  }

  // Custom hex color picker format
  return {
    hex: colorVal,
    bgClass: "",
    textClass: "",
    bgLightClass: "",
    borderClass: "",
    isCustomHex: true
  };
}

export default function KanbanBoard({
  activeWorkspace,
  projects,
  tasks,
  users,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onAddAttachment,
  onAddComment,
  activeProject,
  setActiveProject,
  onNewProjectOpen,
  onNewWorkspaceOpen,
  onAddCustomColumn,
  selectedTaskId,
  onClearSelectedTaskId,
  templates = [],
  onInstantiateTemplate,
  onSaveTemplate,
  onUpdateWorkspace
}: KanbanBoardProps) {
  // Column list fallback if workspace has no customColumns
  const columns = activeWorkspace?.customColumns || ["To Do", "In Progress", "Review", "Completed"];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("All");

  // Selected Task for full-screen detail popup modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // New subtask state in modal
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Create task states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createColumnTarget, setCreateColumnTarget] = useState("To Do");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);
  const [newTaskTagString, setNewTaskTagString] = useState("");

  // Custom column state
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Reusable project template states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [saveTemplateDesc, setSaveTemplateDesc] = useState("");
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] = useState(false);

  // Tag Studio states
  const [showTagColorsModal, setShowTagColorsModal] = useState(false);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingColorVal, setEditingColorVal] = useState("indigo");

  // Track column hover on drag and drop
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  // Column individual sorting selection
  const [columnSorts, setColumnSorts] = useState<Record<string, "priority" | "dueDate" | "createdAt" | "none">>({});

  // Highlight task cards by priority state
  const [highlightByPriority, setHighlightByPriority] = useState<boolean>(false);

  // Helper to sort specific column task list based on selected parameter
  const getSortedColTasks = (colTasks: Task[], columnName: string) => {
    const colSort = columnSorts[columnName] || "none";
    if (colSort === "none") return colTasks;

    return [...colTasks].sort((a, b) => {
      if (colSort === "priority") {
        const priorityWeight: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        const weightA = priorityWeight[a.priority as Priority] || 0;
        const weightB = priorityWeight[b.priority as Priority] || 0;
        return weightB - weightA; // Highest priority first
      }
      if (colSort === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); // Closest due dates first
      }
      if (colSort === "createdAt") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA; // Newest first
      }
      return 0;
    });
  };

  // Smart AI task breakdown loading states
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  // Load comments when active task modal is open
  useEffect(() => {
    if (selectedTask) {
      setLoadingComments(true);
      fetch(`/api/tasks/${selectedTask.id}/comments`)
        .then(res => res.json())
        .then(data => {
          setComments(data);
          setLoadingComments(false);
        })
        .catch(err => {
          console.error("Failed comments loading:", err);
          setLoadingComments(false);
        });
    } else {
      setComments([]);
    }
  }, [selectedTask]);

  // Keep selectedTask reference sync up-to-date with main task state changes
  const activeTaskState = selectedTask ? tasks.find(t => t.id === selectedTask.id) : null;
  useEffect(() => {
    if (activeTaskState) {
      setSelectedTask(activeTaskState);
    }
  }, [tasks]);

  useEffect(() => {
    if (selectedTaskId) {
      const found = tasks.find(t => t.id === selectedTaskId);
      if (found) {
        setSelectedTask(found);
      }
      if (onClearSelectedTaskId) {
        onClearSelectedTaskId();
      }
    }
  }, [selectedTaskId, tasks]);

  // Trigger AI breakdown on task detail
  const handleAIBreakdownTask = async () => {
    if (!selectedTask) return;
    setBreakdownLoading(true);
    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskTitle: selectedTask.title,
          taskDescription: selectedTask.description 
        })
      });
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const label of items) {
          await onAddSubtask(selectedTask.id, label);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBreakdownLoading(false);
    }
  };

  // Attach simulated files
  const handleUploadSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    const fileNames = ["system_schema.png", "payload_assertion.json", "acceptance_checklist.xlsx", "integration_flows.pdf"];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    onAddAttachment(selectedTask.id, {
      name: randomFile,
      size: `${(Math.random() * 4 + 0.1).toFixed(1)} MB`,
      type: randomFile.split(".").pop() === "png" ? "image/png" : "application/octet-stream"
    });
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;
    onAddComment(selectedTask.id, newCommentText.trim());
    
    // Optimistic client addition
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      taskId: selectedTask.id,
      userId: "u-1",
      userName: "Saran Ramesh (You)",
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, tempComment]);
    setNewCommentText("");

    // Re-verify comments feed
    setTimeout(() => {
      fetch(`/api/tasks/${selectedTask.id}/comments`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error("Refresh error comments:", err));
    }, 400);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;
    onAddSubtask(selectedTask.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  // Submit Create Task
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeWorkspace) return;

    onAddTask({
      workspaceId: activeWorkspace.id,
      projectId: newTaskProject || (activeProject?.id || ""),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status: createColumnTarget,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignees: newTaskAssignees.length > 0 ? newTaskAssignees : ["u-1"],
      tags: newTaskTagString ? newTaskTagString.split(",").map(t => t.trim()).filter(Boolean) : []
    });

    // Reset inputs
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("Medium");
    setNewTaskDueDate("");
    setNewTaskAssignees([]);
    setNewTaskTagString("");
    setShowCreateModal(false);
  };

  const handleAddCustomCol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    onAddCustomColumn(newColumnName.trim());
    setNewColumnName("");
    setShowAddColumnInput(false);
  };

  // Filters calculation
  const workspaceTasks = tasks.filter(t => t.workspaceId === activeWorkspace?.id);

  const getWorkspaceTags = () => {
    const tagsFromTasks = workspaceTasks.flatMap(t => t.tags || []).map(t => t.trim());
    const tagsFromColors = activeWorkspace?.tagColors ? Object.keys(activeWorkspace.tagColors) : [];
    return Array.from(new Set([...tagsFromTasks, ...tagsFromColors])).filter(Boolean);
  };

  const projectFiltered = activeProject 
    ? workspaceTasks.filter(t => t.projectId === activeProject.id) 
    : workspaceTasks;

  const finalFilteredTasks = projectFiltered.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "All" || t.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === "All" || t.assignees.includes(selectedAssignee);
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Calculate project percentage average based on tasks
  const computeActiveProjectProgress = () => {
    if (!activeProject) return 0;
    const projTasks = tasks.filter(t => t.projectId === activeProject.id);
    if (projTasks.length === 0) return activeProject.progress;
    const doneTasks = projTasks.filter(t => t.status === "Completed" || t.status === "Published");
    return Math.round((doneTasks.length / projTasks.length) * 100);
  };

  const activeProjProgress = computeActiveProjectProgress();

  if (!activeWorkspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40 dark:bg-slate-950/20 max-w-4xl mx-auto my-auto select-none font-sans min-h-[70vh]">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl mb-6 shadow-md shadow-indigo-500/5 ring-4 ring-indigo-500/5 animate-bounce">
          <CheckSquare className="w-10 h-10" />
        </div>

        <h2 className="text-xl md:text-2xl font-bold font-sans text-slate-850 dark:text-white mb-2.5 max-w-lg leading-snug">
          ✨ Welcome to Your Smart To-Do Workspace!
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
          You are currently exploring a fresh, secure profile. To prevent information clutter, different users enjoy entirely isolated task boards. Let's draft your custom workflow!
        </p>

        {/* GUIDED BLUEPRINTS TIMELINE STEPS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-550 transition-all flex flex-col">
            <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold font-mono text-xs mb-3">
              1
            </div>
            <h3 className="font-semibold text-xs text-slate-850 dark:text-white mb-1">
              Create Workspace
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Workspaces are secure silos for projects (e.g. "Work Tasks", "Personal Errands"). Set custom progress columns.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-550 transition-all flex flex-col">
            <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold font-mono text-xs mb-3">
              2
            </div>
            <h3 className="font-semibold text-xs text-slate-850 dark:text-white mb-1">
              Configure Project Streams
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Initialize custom milestone pipelines or launch blueprints directly from our curated reusable sequence library.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-550 transition-all flex flex-col">
            <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold font-mono text-xs mb-3">
              3
            </div>
            <h3 className="font-semibold text-xs text-slate-850 dark:text-white mb-1">
              Add To-Do Cards
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Draft tasks, set deadlines, append checkbox nodes, tag assignees, and drag them through workflow stages.
            </p>
          </div>
        </div>

        {onNewWorkspaceOpen && (
          <button
            onClick={onNewWorkspaceOpen}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Spark Your First Workspace
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-x-hidden">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
            <span>{activeWorkspace?.name || "Select a Workspace"}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-medium tracking-wide">
              Kanban view
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl truncate">
            {activeWorkspace?.description || "Collaborative board for monitoring milestone progress."}
          </p>
        </div>

        {/* Quick project selectors */}
        <div className="flex items-center gap-2 pr-0">
          <ChevronDown className="w-4 h-4 text-slate-400 block" />
          <select 
            value={activeProject?.id || "All"}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === "All") {
                setActiveProject(null);
              } else {
                const found = projects.find(p => p.id === selectedId);
                if (found) setActiveProject(found);
              }
            }}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none"
          >
            <option value="All">📁 All Projects Stream</option>
            {projects.filter(p => !p.workspaceId || p.workspaceId === activeWorkspace?.id).map(p => (
              <option key={p.id} value={p.id}>📁 {p.name} ({p.status})</option>
            ))}
          </select>

          <button
            onClick={() => setShowTemplateGalleryModal(true)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-305 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            title="Open Reusable Blueprint Templates Library"
          >
            <Library className="w-3.5 h-3.5 text-indigo-500" /> Blueprints
          </button>

          <button
            onClick={onNewProjectOpen}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Project
          </button>
        </div>
      </div>

      {/* Active Project Details Bar */}
      {activeProject && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-slate-800 dark:text-white truncate">{activeProject.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase
                ${activeProject.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"}`}>
                {activeProjectStatusSymbol(activeProject.status)} {activeProject.status}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSaveTemplateName(activeProject.name + " Blueprint");
                  setSaveTemplateDesc(activeProject.description || "A reusable workflow checklist based on " + activeProject.name);
                  setShowSaveTemplateModal(true);
                }}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-amber-55 dark:bg-amber-950/40 hover:bg-amber-105 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold transition-all transition-colors cursor-pointer"
                title="Save this active project checklist as a reusable blueprint"
              >
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> Save as Template
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl truncate">{activeProject.description || "No description set for this stream"}</p>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            {activeProject.dueDate && (
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-mono">DEADLINE</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end mt-0.5">
                  <Calendar className="w-3 h-3 text-rose-500" /> {activeProject.dueDate}
                </span>
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-mono">
                <span>PROGRESS</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 ml-2">{activeProjProgress}%</span>
              </div>
              <div className="w-32 bg-slate-200 dark:bg-slate-805 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${activeProjProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER CONTROL BAR */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 shadow-sm">
        
        {/* Search Searchbar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search cards globally..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Priority & Assignee selector tags */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto md:justify-end">
          
          {/* Priority filter selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-mono text-[10px] text-slate-400 mr-1">PRIORITY:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Critical">🚨 Critical</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          {/* Assignee filter selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-mono text-[10px] text-slate-400 mr-1">ASSIGNEE:</span>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Members</option>
              {activeWorkspace?.members.map(m => (
                <option key={m.userId} value={m.userId}>👤 {m.name}</option>
              ))}
            </select>
          </div>
          
          {/* Highlight by Priority toggle button */}
          <button
            onClick={() => setHighlightByPriority(prev => !prev)}
            className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-xs font-semibold overflow-hidden transition-all shadow-sm cursor-pointer ${
              highlightByPriority
                ? "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white dark:bg-amber-600 dark:hover:bg-amber-700 dark:border-amber-600"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-805 text-slate-700 dark:text-slate-300"
            }`}
            title="Highlight task cards with ambient glows and background colors according to their priority level"
          >
            <Sparkles className={`w-3.5 h-3.5 ${highlightByPriority ? "text-amber-200 animate-pulse" : "text-amber-500"}`} />
            <span>Highlight Priority</span>
          </button>

          {/* Tag Studio action button */}
          <button
            onClick={() => setShowTagColorsModal(true)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-105 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-805 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
            title="Configure tag-based color coding for your active workspace"
          >
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Tag Studio
          </button>

          {/* Clear filter triggers */}
          {(searchQuery || selectedPriority !== "All" || selectedAssignee !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPriority("All");
                setSelectedAssignee("All");
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* GUIDANCE BANNER FOR WORKSPACE WITHOUT PROJECTS OR TASKS */}
      {workspaceTasks.length === 0 && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-900/10 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-650 dark:text-indigo-400 rounded-xl flex-shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-850 dark:text-white flex items-center gap-1.5 leading-tight">
                💡 Start Structuring Your Tasks
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                This workspace is live but currently has 0 tasks. Get started immediately: click the <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Plus sign (+)</strong> directly on any column header to create a card, or click <strong className="text-indigo-650 dark:text-indigo-405 font-bold">Project</strong> to create a progress-tracked milestones stream!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto md:justify-end">
            <button
              onClick={() => setShowTemplateGalleryModal(true)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              Browse Blueprints
            </button>
            <button
              onClick={onNewProjectOpen}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-[11px] font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              DECLARE FIRST PROJECT
            </button>
          </div>
        </div>
      )}

      {/* THE KANBAN COLUMNS CANVAS */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start select-none">
        
        {columns.map(col => {
          const colTasks = finalFilteredTasks.filter(t => t.status === col);
          const isDraggedOver = draggedOverColumn === col;
          return (
            <div 
              key={col} 
              className={`w-72 rounded-2xl flex flex-col max-h-[750px] overflow-hidden flex-shrink-0 transition-all duration-200 border ${
                isDraggedOver 
                  ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-500 scale-[1.01] shadow-lg shadow-indigo-500/5 ring-2 ring-indigo-500/10" 
                  : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedOverColumn !== col) {
                  setDraggedOverColumn(col);
                }
              }}
              onDragLeave={() => {
                setDraggedOverColumn(null);
              }}
              onDragEnd={() => {
                setDraggedOverColumn(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDraggedOverColumn(null);
                const taskId = e.dataTransfer.getData("text/plain");
                if (taskId) {
                  onUpdateTask(taskId, { status: col });
                }
              }}
            >
              {/* Column Title Card */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/60 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${getColumnColorDot(col)}`} />
                  <span className="font-sans font-bold text-xs text-slate-700 dark:text-slate-200 tracking-wide">{col}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {colTasks.length}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {/* Sorting dropdown for this specific column */}
                  <select
                    value={columnSorts[col] || "none"}
                    onChange={(e) => {
                      setColumnSorts(prev => ({
                        ...prev,
                        [col]: e.target.value as any
                      }));
                    }}
                    className="text-[10px] font-semibold bg-white/80 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-sans transition-colors max-w-[95px] shadow-sm"
                    title="Sort column"
                  >
                    <option value="none">Sort: Default</option>
                    <option value="priority">🔥 Priority</option>
                    <option value="dueDate">📅 Due Date</option>
                    <option value="createdAt">⏳ Created</option>
                  </select>

                  <button
                    onClick={() => {
                      setCreateColumnTarget(col);
                      setShowCreateModal(true);
                    }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
                    title="Add task here"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

               {/* Cards Container wrapper */}
              <div className="p-3.5 flex flex-col gap-3 overflow-y-auto max-h-[660px]">
                {getSortedColTasks(colTasks, col).map(t => {
                  const urgent = t.priority === "Critical" || t.priority === "High";
                  const completedSub = t.subtasks.filter(s => s.completed).length;
                  const totalSub = t.subtasks.length;
                  const coloredTags = t.tags.filter(tg => {
                    const norm = tg.toLowerCase().trim();
                    return activeWorkspace?.tagColors?.[norm] || activeWorkspace?.tagColors?.[tg];
                  });

                  // Calculate dynamic priority highlighting classes (subtle border/bg tint + soft glow effect)
                  const highlightClasses = highlightByPriority
                    ? t.priority === "Critical"
                      ? "bg-rose-50/50 dark:bg-rose-950/15 border-rose-350/80 dark:border-rose-900/50 shadow-[0_0_12px_rgba(239,68,68,0.12)] hover:shadow-[0_0_16px_rgba(239,68,68,0.22)] dark:shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:border-rose-450 dark:hover:border-rose-800"
                      : t.priority === "High"
                      ? "bg-amber-50/55 dark:bg-amber-950/15 border-amber-300 dark:border-amber-900/40 shadow-[0_0_12px_rgba(245,158,11,0.12)] hover:shadow-[0_0_16px_rgba(245,158,11,0.22)] dark:shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-amber-450 dark:hover:border-amber-805"
                      : t.priority === "Medium"
                      ? "bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/30 shadow-[0_0_10px_rgba(99,102,241,0.08)] hover:shadow-[0_0_14px_rgba(99,102,241,0.15)] dark:shadow-[0_0_10px_rgba(99,102,241,0.10)] hover:border-indigo-400 dark:hover:border-indigo-800"
                      : "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-900/30 shadow-[0_0_10px_rgba(16,185,129,0.06)] hover:shadow-[0_0_14px_rgba(16,185,129,0.12)] dark:shadow-[0_0_10px_rgba(16,185,129,0.08)] hover:border-emerald-400 dark:hover:border-emerald-800"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-805 shadow-sm hover:shadow-md dark:hover:border-slate-700 hover:border-slate-350";

                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", t.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => setSelectedTask(t)}
                      className={`p-3.5 ${coloredTags.length > 0 ? "pl-5" : ""} border rounded-xl cursor-grab active:cursor-grabbing transition-all text-left flex flex-col gap-2 relative ${highlightClasses}`}
                    >
                      {/* Left Tag-Color Strip */}
                      {coloredTags.length > 0 && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md flex flex-col gap-0.5 overflow-hidden">
                          {coloredTags.map((tg, idx) => {
                            const config = getTagColorConfig(tg, activeWorkspace);
                            if (config.isCustomHex) {
                              return (
                                <div 
                                  key={idx} 
                                  style={{ backgroundColor: config.hex }} 
                                  className="flex-1 w-full"
                                  title={`Tag: ${tg}`}
                                />
                              );
                            } else {
                              return (
                                <div 
                                  key={idx} 
                                  className={`flex-1 w-full ${config.bgClass}`}
                                  title={`Tag: ${tg}`}
                                />
                              );
                            }
                          })}
                        </div>
                      )}

                      {/* Priority Tag line */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide
                          ${t.priority === "Critical" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400" :
                            t.priority === "High" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                            t.priority === "Medium" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400" :
                            "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                          {t.priority}
                        </span>

                        {t.projectId && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans tracking-wide truncate max-w-[110px]">
                            📁 {projects.find(p => p.id === t.projectId)?.name || "Project"}
                          </span>
                        )}
                      </div>

                      {/* Task title & Visual Progress Ring */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-sans font-semibold text-[13px] text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 flex-1">
                          {t.title}
                        </h4>
                        {totalSub > 0 && (
                          <div className="flex-shrink-0 mt-0.5" title={`${completedSub}/${totalSub} subtasks completed`}>
                            <ProgressRing value={(completedSub / totalSub) * 100} size={28} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      {/* Snippet tag */}
                      {t.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2 italic font-sans">
                          {t.description}
                        </p>
                      )}

                      {/* Label pills list wrapper */}
                      {t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.tags.slice(0, 4).map((tg, idx) => {
                            const config = getTagColorConfig(tg, activeWorkspace);
                            if (config.isCustomHex) {
                              return (
                                <span 
                                  key={idx} 
                                  style={{ 
                                    backgroundColor: `${config.hex}15`, 
                                    borderColor: `${config.hex}30`, 
                                    color: config.hex 
                                  }}
                                  className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-solid uppercase tracking-wider font-extrabold transition-all"
                                >
                                  #{tg}
                                </span>
                              );
                            }
                            return (
                              <span 
                                key={idx} 
                                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider font-extrabold transition-all ${config.bgLightClass} ${config.textClass} ${config.borderClass}`}
                              >
                                #{tg}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Subtask Visual Progress bar */}
                      {totalSub > 0 && (
                        <div className="mt-1.5 flex flex-col gap-1 select-none">
                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-450 dark:text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <CheckSquare className="w-2.5 h-2.5 text-indigo-500" /> Completed metrics
                            </span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round((completedSub / totalSub) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-450 dark:to-indigo-500 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${(completedSub / totalSub) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Meta information row details */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-805 pt-2.5 mt-1 text-slate-400 text-[10px] font-mono">
                        
                        {/* Due date status alert check */}
                        <div className="flex items-center gap-1">
                          {t.dueDate ? (
                            <span className={`flex items-center gap-0.5 font-bold ${isOverdue(t.dueDate, t.status) ? "text-rose-500 animate-pulse" : "text-slate-400 dark:text-slate-500"}`}>
                              <Calendar className="w-3 h-3" /> {t.dueDate}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 italic">No date</span>
                          )}
                        </div>

                        {/* Interactive checkmark ratios */}
                        <div className="flex items-center gap-2.5">
                          {totalSub > 0 && (
                            <span className="flex items-center gap-0.5" title="Tasks Checklists">
                              <CheckSquare className="w-3 h-3 text-indigo-400" /> {completedSub}/{totalSub}
                            </span>
                          )}
                          {t.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5" title="Assets Uploaded">
                              <Paperclip className="w-3 h-3 text-slate-400" /> {t.attachments.length}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Assignee circles overlay stack */}
                      <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {t.assignees.map(uid => {
                            const detail = users.find(u => u.id === uid);
                            return (
                              <img
                                key={uid}
                                src={detail?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                                className="w-5.5 h-5.5 rounded-full ring-2 ring-white dark:ring-slate-950 object-cover"
                                title={detail?.name || "Member"}
                                alt="assigned user"
                              />
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center rounded-xl text-slate-400 text-xs italic">
                    Column is empty
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* CREATE BRAND NEW CUSTOM COLUMN AREA */}
        <div className="w-72 flex-shrink-0">
          {!showAddColumnInput ? (
            <button
              onClick={() => setShowAddColumnInput(true)}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/10 dark:hover:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-all font-semibold rounded-2xl flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Custom Column
            </button>
          ) : (
            <form onSubmit={handleAddCustomCol} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Column title (e.g. Audit)"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-white"
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddColumnInput(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* WORKSPACE TAG STUDIO COLORS TUNER MODAL */}
      {showTagColorsModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none border-0 shadow-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-xs overflow-hidden text-slate-800 dark:text-slate-300">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60 flex-shrink-0">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-500" /> Workspace Tag Studio
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Assign vibrant visual colors to any tags to organize tasks, track workstreams, and highlight milestones.
                </p>
              </div>
              <button 
                onClick={() => setShowTagColorsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body with 2 Columns */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[300px]">
              
              {/* Left Columns: Tags List (Span 5) */}
              <div className="md:col-span-5 flex flex-col gap-3 md:border-r border-slate-150 dark:border-slate-800/60 pr-0 md:pr-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Workspace Labels</span>
                
                {/* List of tags */}
                <div className="flex-grow flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {getWorkspaceTags().length === 0 ? (
                    <div className="text-center p-6 text-slate-400 italic">No workspace tags found. Register your first label below!</div>
                  ) : (
                    getWorkspaceTags().map((tg) => {
                      const config = getTagColorConfig(tg, activeWorkspace);
                      const isSelected = editingTagName === tg;
                      return (
                        <button
                          key={tg}
                          type="button"
                          onClick={() => {
                            setEditingTagName(tg);
                            setEditingColorVal(activeWorkspace?.tagColors?.[tg] || "indigo");
                          }}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                            isSelected 
                              ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-500" 
                              : "bg-white dark:bg-slate-950/40 border-slate-150 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Color Dot indicator */}
                            <div 
                              style={config.isCustomHex ? { backgroundColor: config.hex } : {}}
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.bgClass || ""}`} 
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">#{tg}</span>
                          </div>
                          
                          <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSelected ? "translate-x-0.5" : ""}`} />
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Form to add explicit new workspace tag */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const name = (fd.get("tagName") as string).trim().replace(/#/g, "");
                    if (name) {
                      setEditingTagName(name);
                      setEditingColorVal("indigo");
                      if (onUpdateWorkspace && activeWorkspace) {
                        const updatedMap = { ...(activeWorkspace.tagColors || {}), [name]: "indigo" };
                        onUpdateWorkspace({ tagColors: updatedMap });
                      }
                      e.currentTarget.reset();
                    }
                  }}
                  className="flex flex-col gap-1.5 mt-2"
                >
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Create new workspace label</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="tagName" 
                      required
                      placeholder="e.g. Backend" 
                      className="flex-grow p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-slate-700 dark:text-white"
                    />
                    <button 
                      type="submit" 
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl font-bold"
                    >
                      Register
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Columns: Color assignment details (Span 7) */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {editingTagName ? (
                  <div className="flex flex-col gap-4">
                    
                    {/* Active label heading */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Tune Tag Styling</span>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">
                        Configure <span className="text-indigo-600 dark:text-indigo-400 font-mono">#{editingTagName}</span> Color
                      </h4>
                    </div>

                    {/* Preset Color Swatches List */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-slate-450 font-bold font-mono uppercase">Color Presets Palette :</span>
                      <div className="grid grid-cols-5 gap-2.5">
                        {PALETTE_COLORS.map((col) => {
                          const activeCols = activeWorkspace?.tagColors || {};
                          const isSelected = activeCols[editingTagName] === col.value;
                          return (
                            <button
                              key={col.value}
                              type="button"
                              onClick={() => {
                                setEditingColorVal(col.value);
                                if (onUpdateWorkspace && activeWorkspace) {
                                  const updatedMap = { ...(activeWorkspace.tagColors || {}), [editingTagName]: col.value };
                                  onUpdateWorkspace({ tagColors: updatedMap });
                                }
                              }}
                              className={`h-9 rounded-xl border flex flex-col items-center justify-center p-1 relative transition-all cursor-pointer ${
                                isSelected 
                                  ? "ring-2 ring-indigo-505 ring-offset-2 dark:ring-offset-slate-90 ring-offset-indigo-500/10 border-indigo-500" 
                                  : "border-slate-150 dark:border-slate-800 hover:scale-[1.03]"
                              }`}
                              title={col.name}
                            >
                              <div className={`w-4 h-4 rounded-full ${col.bg} ${col.darkBg}`} />
                              <span className="text-[7.5px] text-slate-400 dark:text-slate-500 mt-1 capitalize leading-none truncate font-medium">{col.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* HTML Native Color Custom Picker */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-105 dark:border-slate-850">
                      <div className="flex flex-col gap-1.5 flex-1 text-left">
                        <span className="text-[10px] text-slate-450 font-bold font-mono uppercase">Fine-Tuned Custom Hex</span>
                        <p className="text-[10px] text-slate-400 leading-normal">Or drag the native color picker to assign any brand identity color code</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={
                            PALETTE_COLORS.some(c => c.value === (activeWorkspace?.tagColors?.[editingTagName])) 
                              ? "#6366f1" 
                              : (activeWorkspace?.tagColors?.[editingTagName] || "#6366f1")
                          }
                          onChange={(e) => {
                            const hex = e.target.value;
                            setEditingColorVal(hex);
                            if (onUpdateWorkspace && activeWorkspace) {
                              const updatedMap = { ...(activeWorkspace.tagColors || {}), [editingTagName]: hex };
                              onUpdateWorkspace({ tagColors: updatedMap });
                            }
                          }}
                          className="w-10 h-10 rounded-lg p-0.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 px-2 py-1 rounded-lg select-all">
                          {activeWorkspace?.tagColors?.[editingTagName] || "Preset"}
                        </span>
                      </div>
                    </div>

                    {/* Real-time Preview */}
                    <div className="mt-2 p-3.5 bg-slate-100/40 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-left">
                      <span className="text-[10px] text-slate-450 font-bold font-mono block mb-2 uppercase">Real-Time Canvas Preview :</span>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] text-slate-400">Pill Tag on Card:</span>
                        {(() => {
                          const previewConf = getTagColorConfig(editingTagName, activeWorkspace);
                          if (previewConf.isCustomHex) {
                            return (
                              <span 
                                style={{ 
                                  backgroundColor: `${previewConf.hex}15`, 
                                  borderColor: `${previewConf.hex}30`, 
                                  color: previewConf.hex 
                                }}
                                className="text-[9px] font-mono px-2 py-0.5 rounded border border-solid capitalize font-extrabold transition-all"
                              >
                                #{editingTagName}
                              </span>
                            );
                          }
                          return (
                            <span 
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border capitalize font-extrabold transition-all ${previewConf.bgLightClass} ${previewConf.textClass} ${previewConf.borderClass}`}
                            >
                              #{editingTagName}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center my-auto">
                    <Tag className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="font-semibold text-slate-700 dark:text-slate-400">Select any Tag label</p>
                    <p className="text-[10px] text-slate-400 max-w-sm mt-1 leading-normal">
                      Select a workspace label from the list on the left to assign a vibrant hex tag color scheme.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end gap-2 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setShowTagColorsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-semibold cursor-pointer"
              >
                Close Studio
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REUSABLE BLUEPRINT TEMPLATE GALLERY MODAL */}
      {showTemplateGalleryModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none border-0 shadow-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-xs overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60 flex-shrink-0">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                  <Library className="w-5 h-5 text-indigo-500" /> Reusable Blueprint Templates Library
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Deploy recurrent workflows and checklists to rapidly structure milestones on active canvases.
                </p>
              </div>
              <button 
                onClick={() => setShowTemplateGalleryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
                  <Library className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="font-semibold text-slate-700 dark:text-slate-350">No Templates Available</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Save an active project roadmap as a blueprint template using the <strong>Sparkles Save as Template</strong> action above!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(tpl => (
                    <div key={tpl.id} className="border border-slate-150 dark:border-slate-810 hover:border-indigo-400 dark:hover:border-indigo-550 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/20 hover:bg-white dark:hover:bg-slate-900 flex flex-col justify-between transition-all group duration-200 relative">
                      {tpl.id.startsWith("blueprint-") && (
                        <span className="absolute top-3.5 right-3.5 bg-indigo-50 text-indigo-655 dark:bg-indigo-950/40 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          Official
                        </span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-850 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            📋 {tpl.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {tpl.description || "No specifications defined for this sequence."}
                        </p>

                        {/* Pre-configured item cards preview */}
                        <div className="mt-3.5 bg-slate-100/55 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-850 rounded-lg p-2.5">
                          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 block mb-1.5 uppercase">
                            Checklists Summary ({tpl.tasks?.length || 0} tasks)
                          </span>
                          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                            {tpl.tasks?.map((task, idx) => (
                              <div key={task.title + idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-350 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${task.priority === "High" ? "bg-rose-500" : task.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                                <span className="font-medium truncate">{task.title}</span>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 ml-auto bg-slate-200 dark:bg-slate-800 px-1 py-0.2 rounded font-semibold uppercase">{task.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-150 dark:border-slate-805 pt-3 mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          ⚡ PRE-POPULATED
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTemplateGalleryModal(false);
                            if (onInstantiateTemplate) {
                              onInstantiateTemplate(tpl.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1 hover:shadow cursor-pointer"
                        >
                          Launch Stream
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/40 dark:bg-slate-900/60 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowTemplateGalleryModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-755 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Library
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SAVE PROJECT TEMPLATE MODAL */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/65 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none border-0 shadow-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl w-full max-w-md p-6 shadow-2xl text-xs select-none">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3 mb-4 flex-shrink-0">
              <h3 className="text-sm font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Save Reusable Blueprint
              </h3>
              <button 
                onClick={() => setShowSaveTemplateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-655 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onSaveTemplate && activeProject) {
                onSaveTemplate(saveTemplateName.trim(), saveTemplateDesc.trim(), activeProject.id);
                setShowSaveTemplateModal(false);
              }
            }} className="flex flex-col gap-4">
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                This will capture all current task checklists, custom status columns, subtasks, and tags from <strong>{activeProject?.name}</strong> as a reusable blueprint. You and your team can then quickly launch recurring workflows from this design.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Blueprint Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Marketing Campaign Blueprint"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  className="p-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Blueprint Specifications</label>
                <textarea
                  rows={2}
                  placeholder="Describe when to use this checklist sequence..."
                  value={saveTemplateDesc}
                  onChange={(e) => setSaveTemplateDesc(e.target.value)}
                  className="p-2.5 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-sans font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK COMPREHENSIVE DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60">
              <h3 className="font-sans font-bold text-md text-slate-800 dark:text-white flex items-center gap-1.5">
                <CheckSquare className="w-5 h-5 text-indigo-500" /> New Task to ({createColumnTarget})
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-5 flex flex-col gap-4 text-xs select-none">
              
              {/* Task title input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-400">Card Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Task topic heading..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Task description input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-400">Description details</label>
                <textarea
                  rows={3}
                  placeholder="Elaborate details, requirements or criteria specifications..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Grid with Project flow + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Project stream assignment */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-400">Stream Project</label>
                  <select
                    value={newTaskProject}
                    onChange={(e) => setNewTaskProject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none"
                  >
                    <option value="">No parent / Backlog stream</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Levels */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-400">Priority Tier</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none"
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                    <option value="Critical">🚨 Critical</option>
                  </select>
                </div>

              </div>

              {/* Grid with Due date + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-400">Target Deadline</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none"
                  />
                </div>

                {/* Tag String input label */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-400">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="UX, Frontend, API, Sec"
                    value={newTaskTagString}
                    onChange={(e) => setNewTaskTagString(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none"
                  />
                </div>

              </div>

              {/* Assignees checkbox stack list */}
              <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 p-3 rounded-xl">
                <label className="font-bold text-slate-650 dark:text-slate-400">Select Teammates Assigned</label>
                <div className="flex flex-wrap gap-2">
                  {activeWorkspace?.members.map(member => {
                    const isChecked = newTaskAssignees.includes(member.userId);
                    return (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setNewTaskAssignees(prev => prev.filter(uid => uid !== member.userId));
                          } else {
                            setNewTaskAssignees(prev => [...prev, member.userId]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-sans transition-all flex items-center gap-1.5
                          ${isChecked 
                            ? "bg-indigo-900/30 text-indigo-200 border-indigo-700/60 font-semibold" 
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"}`}
                      >
                        {member.avatar ? (
                          <img src={member.avatar} className="w-4.5 h-4.5 rounded-full object-cover" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        <span>{member.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-indigo-400 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action operations footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-sans rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-sans tracking-wide shadow"
                >
                  Create Kanban Card
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FULL EXPANDABLE CARD DETAILED SPECIFICATIONS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl select-none">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${getColumnColorDot(selectedTask.status)}`} />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  COLUMN: {selectedTask.status}
                </span>
                
                {/* Status Column Transition fast-selector */}
                <div className="relative ml-2">
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      onUpdateTask(selectedTask.id, { status: e.target.value });
                    }}
                    className="text-[10px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                  >
                    {columns.map(c => (
                      <option key={c} value={c}>Move to: {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm("Delete this Kanban card?")) {
                      onDeleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition-colors"
                  title="Remove Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content grid layout */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Main Details + Subtasks checklist */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                
                {/* Title */}
                <div className="flex flex-col gap-1">
                  <textarea
                    rows={1}
                    value={selectedTask.title}
                    onChange={(e) => onUpdateTask(selectedTask.id, { title: e.target.value })}
                    className="text-lg font-bold font-sans text-slate-850 dark:text-white bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none resize-none py-1 leading-snug"
                  />
                  
                  {/* Parent project line info */}
                  {selectedTask.projectId && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>📁 Parent project :</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {projects.find(p => p.id === selectedTask.projectId)?.name || "N/A"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description Textarea block */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400 font-sans uppercase tracking-wider">Description details</span>
                  <textarea
                    rows={4}
                    value={selectedTask.description || ""}
                    placeholder="Elaborate task goals, acceptance criteria, test assertions, or resources link..."
                    onChange={(e) => onUpdateTask(selectedTask.id, { description: e.target.value })}
                    className="w-full text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 p-3 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Subtask checklist section */}
                <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold font-sans text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      {selectedTask.subtasks.length > 0 ? (
                        <ProgressRing value={(selectedTask.subtasks.filter(s => s.completed).length / selectedTask.subtasks.length) * 100} size={24} strokeWidth={2.5} showText={false} />
                      ) : (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      )}
                      Goal Checklist 
                      <span className="text-[10px] font-mono text-slate-400 font-semibold lowercase ml-1">
                        ({selectedTask.subtasks.filter(s => s.completed).length} of {selectedTask.subtasks.length} done)
                      </span>
                    </span>
                    
                    {/* Brand New AI Breakdown Copilot hook details */}
                    <button
                      type="button"
                      disabled={breakdownLoading}
                      onClick={handleAIBreakdownTask}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/20 font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {breakdownLoading ? "Consulting AI..." : "AI Breakdown Step List"}
                    </button>
                  </div>

                  {/* Checklist lists */}
                  <div className="flex flex-col gap-2">
                    {selectedTask.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between gap-3 text-xs p-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg shadow-sm">
                        <label className="flex items-center gap-2 flex-grow cursor-pointer pl-1 py-1 text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={(e) => onToggleSubtask(selectedTask.id, sub.id, e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className={sub.completed ? "line-through text-slate-400 italic" : "font-sans font-medium"}>
                            {sub.title}
                          </span>
                        </label>
                        <button
                          onClick={() => {
                            const updated = selectedTask.subtasks.filter(s => s.id !== sub.id);
                            onUpdateTask(selectedTask.id, { subtasks: updated });
                          }}
                          className="mr-2 text-rose-400 hover:text-rose-600 font-bold"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {selectedTask.subtasks.length === 0 && (
                      <div className="text-center p-4 text-slate-400 italic text-[11px]">
                        No subtasks. Try AI Breakdown to auto-populate checkpoints!
                      </div>
                    )}
                  </div>

                  {/* Manual add subtask */}
                  <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add high-level manual milestone..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-grow p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold font-sans tracking-wide"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Team discussion / Comments Feed */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400 font-sans uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-slate-400" /> Collaboration Feed ({comments.length})
                  </span>

                  {/* Form to submit comment */}
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Discuss progress, mention @user, pin credentials..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-sans shadow"
                    >
                      Post log
                    </button>
                  </form>

                  {/* Comment Feed cards */}
                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mt-1 pr-1">
                    {loadingComments && (
                      <div className="text-center p-4 text-slate-400 text-xs font-mono">Loading telemetry feed...</div>
                    )}
                    {comments.map((cm, i) => (
                      <div key={cm.id || i} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl flex items-start gap-2.5">
                        <img 
                          src={cm.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cm.userName)}`}
                          className="w-7.5 h-7.5 rounded-full object-cover flex-shrink-0" 
                          alt="user avatar"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{cm.userName}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(cm.createdAt).toLocaleDateString()} {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-650 dark:text-slate-300 mt-1 whitespace-pre-wrap">{cm.text}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && !loadingComments && (
                      <div className="text-center p-6 text-slate-400 italic text-[11px]">
                        No comments yet. Write a message above to align teammates!
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Sidebar Column: Metadata settings */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-4 flex flex-col gap-6">
                
                {/* Due dates details */}
                <div className="flex flex-col gap-1.5 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">📅 Target Date</span>
                  <input
                    type="date"
                    value={selectedTask.dueDate || ""}
                    onChange={(e) => onUpdateTask(selectedTask.id, { dueDate: e.target.value })}
                    className="p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white font-mono font-semibold focus:outline-none cursor-pointer"
                  />
                  {selectedTask.dueDate && isOverdue(selectedTask.dueDate, selectedTask.status) && (
                    <span className="text-[9px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Exceeded deadline schedule!
                    </span>
                  )}
                </div>

                {/* Priority Levels selector */}
                <div className="flex flex-col gap-1.5 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">🚨 Task Priority</span>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => onUpdateTask(selectedTask.id, { priority: e.target.value as Priority })}
                    className="p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                    <option value="Critical">🚨 Critical</option>
                  </select>
                </div>

                {/* Assignees listing */}
                <div className="flex flex-col gap-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">👥 Assignees Assigned</span>
                  
                  {/* Selected assigned tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.assignees.map(uid => {
                      const details = users.find(u => u.id === uid);
                      return (
                        <div key={uid} className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-full px-2 py-0.5 text-[10px] font-sans font-medium hover:text-rose-500 cursor-pointer text-slate-700 dark:text-slate-300"
                          onClick={() => {
                            // Unassign
                            const updated = selectedTask.assignees.filter(u => u !== uid);
                            onUpdateTask(selectedTask.id, { assignees: updated.length > 0 ? updated : [selectedTask.assignees[0]] });
                          }}
                          title="Click to dismiss teammate allocation"
                        >
                          <img src={details?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} className="w-4 h-4 rounded-full object-cover" />
                          <span>{details?.name || "User"}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* dropdown to add other teammates */}
                  <select
                    value=""
                    onChange={(e) => {
                      const addId = e.target.value;
                      if (addId && !selectedTask.assignees.includes(addId)) {
                        onUpdateTask(selectedTask.id, { assignees: [...selectedTask.assignees, addId] });
                      }
                    }}
                    className="p-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="">+ Allocate teammate</option>
                    {activeWorkspace?.members.map(m => (
                      <option key={m.userId} value={m.userId}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Real-time Tags Association panel */}
                <div className="flex flex-col gap-2.5 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">🏷️ Tags Association</span>
                  
                  {/* Current active tags in the task */}
                  <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                    {selectedTask.tags && selectedTask.tags.map((tg) => {
                      const config = getTagColorConfig(tg, activeWorkspace);
                      if (config.isCustomHex) {
                        return (
                          <div 
                            key={tg} 
                            style={{ 
                              backgroundColor: `${config.hex}15`, 
                              borderColor: `${config.hex}30`, 
                              color: config.hex 
                            }}
                            className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border border-solid capitalize font-extrabold group transition-all"
                          >
                            <span>#{tg}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = selectedTask.tags.filter(t => t !== tg);
                                onUpdateTask(selectedTask.id, { tags: remaining });
                              }}
                              className="text-[10px] hover:text-rose-500 font-extrabold leading-none select-none"
                              title={`Remove tag #${tg}`}
                            >
                              ×
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div 
                          key={tg} 
                          className={`flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border capitalize font-extrabold group transition-all ${config.bgLightClass} ${config.textClass} ${config.borderClass}`}
                        >
                          <span>#{tg}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = selectedTask.tags.filter(t => t !== tg);
                              onUpdateTask(selectedTask.id, { tags: remaining });
                            }}
                            className="text-[10px] hover:text-rose-500 font-bold leading-none select-none"
                            title={`Remove tag #${tg}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {(!selectedTask.tags || selectedTask.tags.length === 0) && (
                      <span className="text-[11px] text-slate-450 italic">No tags assigned.</span>
                    )}
                  </div>

                  {/* Add tag quick-form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem("newTagVal") as HTMLInputElement;
                      const val = input.value.trim().replace(/#/g, "");
                      if (val) {
                        const existing = selectedTask.tags || [];
                        if (!existing.includes(val)) {
                          onUpdateTask(selectedTask.id, { tags: [...existing, val] });
                        }
                        input.value = "";
                      }
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      type="text"
                      name="newTagVal"
                      placeholder="e.g. Frontend"
                      className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold font-sans transition-colors"
                    >
                      + Add
                    </button>
                  </form>
                </div>

                {/* Attachments panel */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">📎 Resource Attachments ({selectedTask.attachments.length})</span>
                  
                  {/* Lists of uploaded resource attachments */}
                  <div className="flex flex-col gap-2">
                    {selectedTask.attachments.map(att => (
                      <a
                        key={att.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert(`Resource mock downloading: ${att.name}`); }}
                        className="text-xs p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800/80 hover:bg-indigo-50/20 rounded-xl flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate flex flex-col">
                            <span className="font-semibold text-slate-700 dark:text-slate-340 truncate group-hover:text-indigo-500">{att.name}</span>
                            <span className="text-[8px] text-slate-400 font-mono uppercase">{att.size} • {att.uploadedBy}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                      </a>
                    ))}
                    {selectedTask.attachments.length === 0 && (
                      <div className="text-center p-3 text-slate-400 italic text-[11px] border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No files uploaded
                      </div>
                    )}
                  </div>

                  {/* Simulated Upload trigger */}
                  <form onSubmit={handleUploadSimulate} className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-[11px] font-sans font-bold text-slate-700 dark:text-slate-350 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Attach document asset
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helpers
function getColumnColorDot(col: string): string {
  const c = col.toLowerCase();
  if (c.includes("do") || c.includes("todo") || c.includes("idea")) return "bg-slate-400";
  if (c.includes("progress") || c.includes("draft")) return "bg-blue-500";
  if (c.includes("review")) return "bg-amber-500";
  if (c.includes("complet") || c.includes("publish")) return "bg-emerald-500";
  return "bg-indigo-500";
}

function activeProjectStatusSymbol(st: string): string {
  if (st === "Planning") return "📝";
  if (st === "Active") return "⚡";
  if (st === "Completed") return "✅";
  return "⏳";
}

function isOverdue(dueDateStr: string, status: string): boolean {
  if (status === "Completed" || status === "Published") return false;
  const today = new Date().toISOString().split("T")[0];
  return dueDateStr < today;
}
