import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import AnalyticsView from "./components/AnalyticsView";
import AIWorkspace from "./components/AIWorkspace";
import WorkspaceSettings from "./components/WorkspaceSettings";
import AdminPanel from "./components/AdminPanel";
import DocumentationView from "./components/DocumentationView";
import Login from "./components/Login";
import QuickAddTaskModal from "./components/QuickAddTaskModal";
import GlobalSearchBar from "./components/GlobalSearchBar";
import { Workspace, Project, Task, User, Notification, ActivityLog, Role, ProjectTemplate } from "./types";
import { 
  Plus, X, Globe, Library, Sparkles, FolderKanban, Calendar, BarChart3, Bot, 
  Settings, ShieldAlert, BookOpen, CheckCircle, Database, CheckSquare
} from "lucide-react";

export default function App() {
  const [currentView, setView] = useState("kanban");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);

  // dialog control states
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectdueDate, setNewProjectDueDate] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [globallySelectedTaskId, setGloballySelectedTaskId] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(true);

  // Active user profile - logged-in simulation (Saran Ramesh)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("currentUser");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    const loggedOut = localStorage.getItem("loggedOut");
    if (loggedOut === "true") {
      return null;
    }
    // Default logged-in user on initial start
    return {
      id: "u-1",
      email: "saranramesh709@gmail.com",
      name: "Saran Ramesh (You)",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
  });

  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle successful login
  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.removeItem("loggedOut");
    setCurrentUser(user);
    setView("kanban");
  };

  // Helper auth fetch generator
  const authHeaders = () => {
    const token = localStorage.getItem("authToken") || `token-${currentUser?.id || "u-1"}`;
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Shadow window.fetch to provide automated bearer tokens for every API requests inside App
  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = localStorage.getItem("authToken") || `token-${currentUser?.id || "u-1"}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`
    };
    if (init?.headers) {
      Object.assign(headers, init.headers);
    }
    return window.fetch(input, {
      ...init,
      headers
    });
  };

  // Initial seeding data retrieve
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) return;
      try {
        const headers = {
          "Authorization": `Bearer ${localStorage.getItem("authToken") || `token-${currentUser.id}`}`
        };
        const [wsRes, projRes, taskRes, userRes, notifyRes, logRes, templateRes] = await Promise.all([
          fetch("/api/workspaces", { headers }).then(r => r.json()),
          fetch("/api/projects", { headers }).then(r => r.json()),
          fetch("/api/tasks", { headers }).then(r => r.json()),
          fetch("/api/users", { headers }).then(r => r.json()),
          fetch("/api/notifications", { headers }).then(r => r.json()),
          fetch("/api/activity-logs", { headers }).then(r => r.json()),
          fetch("/api/templates", { headers }).then(r => r.json()).catch(() => [])
        ]);

        if (Array.isArray(wsRes)) setWorkspaces(wsRes);
        if (Array.isArray(projRes)) setProjects(projRes);
        if (Array.isArray(taskRes)) setTasks(taskRes);
        if (Array.isArray(userRes)) setUsers(userRes);
        if (Array.isArray(notifyRes)) setNotifications(notifyRes);
        if (Array.isArray(logRes)) setActivityLogs(logRes);
        if (Array.isArray(templateRes)) setTemplates(templateRes);

        // Auto select first workspace
        if (Array.isArray(wsRes) && wsRes.length > 0) {
          setActiveWorkspace(wsRes[0]);
        } else {
          setActiveWorkspace(null);
        }
      } catch (err) {
        console.error("Endpoint connect failed. Falling back to in-memory backup state arrays.", err);
        // Fallback fallback datasets
        const mockWorkspace: Workspace = {
          id: "w-1",
          name: "Acme Product Team Workspace",
          description: "Primary workspace for engineering sprints, feature planning, and roadmap coordination.",
          ownerId: currentUser?.id || "u-1",
          members: [
            { userId: currentUser?.id || "u-1", email: currentUser?.email || "saranramesh709@gmail.com", name: currentUser?.name || "Saran Ramesh (You)", role: "Owner" }
          ],
          customColumns: ["To Do", "In Progress", "Review", "Completed"],
          theme: "ocean",
          createdAt: new Date().toISOString()
        };
        setWorkspaces([mockWorkspace]);
        setActiveWorkspace(mockWorkspace);
      }
    };

    fetchAllData();
  }, [currentUser]);

  // Sync workspace select
  const handleSelectWorkspace = (id: string) => {
    const found = workspaces.find(w => w.id === id);
    if (found) {
      setActiveWorkspace(found);
      setActiveProject(null); // Reset select projects on workspace switch
    }
  };

  // Log Activity trigger utils
  const triggerLogActivity = async (action: string, details: string, taskId?: string) => {
    if (!currentUser || !activeWorkspace) return;
    const logData: Partial<ActivityLog> = {
      workspaceId: activeWorkspace.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      taskId,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData)
      });
      const completeLog = await res.json();
      setActivityLogs(prev => [completeLog, ...prev]);
    } catch {
      // Local optimistic array insert
      const dummyLog: ActivityLog = {
        id: `log-${Date.now()}`,
        workspaceId: activeWorkspace.id,
        userId: currentUser.id,
        userName: currentUser.name,
        action,
        details,
        taskId,
        createdAt: new Date().toISOString()
      };
      setActivityLogs(prev => [dummyLog, ...prev]);
    }
  };

  const triggerSystemNotification = async (title: string, message: string, type: "info" | "success" | "warning" | "alert" = "info") => {
    if (!currentUser) return;
    const itemData = {
      userId: currentUser.id,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
      });
      const n = await res.json();
      setNotifications(prev => [n, ...prev]);
    } catch {
      const dummyN: Notification = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [dummyN, ...prev]);
    }
  };

  // CREATE WORKSPACE
  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || !currentUser) return;

    const wsData = {
      name: newWorkspaceName.trim(),
      description: newWorkspaceDesc.trim(),
      ownerId: currentUser.id,
      members: [
        { userId: currentUser.id, email: currentUser.email, name: currentUser.name, role: "Owner" as Role }
      ],
      customColumns: ["To Do", "In Progress", "Review", "Completed"],
      theme: "ocean",
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wsData)
      });
      const created = await res.json();
      setWorkspaces(prev => [...prev, created]);
      setActiveWorkspace(created);
      triggerSystemNotification("Workspace Created", `Successfully initialized workspace: ${created.name}`, "success");
      triggerLogActivity("Workspace Creation", `Initialized workspace container ${created.name}`);
    } catch {
      const offlineWs: Workspace = {
        id: `w-${Date.now()}`,
        ...wsData
      };
      setWorkspaces(prev => [...prev, offlineWs]);
      setActiveWorkspace(offlineWs);
    }

    setNewWorkspaceName("");
    setNewWorkspaceDesc("");
    setShowNewWorkspaceModal(false);
  };

  // UPDATE WORKSPACE
  const handleUpdateWorkspace = async (updateData: Partial<Workspace>) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      const updated = await res.json();
      setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
      setActiveWorkspace(updated);
      triggerSystemNotification("Workspace Tuned", `Modified and updated ${updated.name} specifications.`, "info");
      triggerLogActivity("Workspace Mutation", `Adjusted workspace configurations`);
    } catch {
      const offlineUpdated = { ...activeWorkspace, ...updateData };
      setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? offlineUpdated : w));
      setActiveWorkspace(offlineUpdated);
    }
  };

  // DELETE WORKSPACE
  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    try {
      await fetch(`/api/workspaces/${activeWorkspace.id}`, { method: "DELETE" });
      const nextList = workspaces.filter(w => w.id !== activeWorkspace.id);
      setWorkspaces(nextList);
      setActiveWorkspace(nextList.length > 0 ? nextList[0] : null);
      triggerSystemNotification("Workspace Destroyed", "Permantently purged workspace files.", "warning");
    } catch {
      const nextList = workspaces.filter(w => w.id !== activeWorkspace.id);
      setWorkspaces(nextList);
      setActiveWorkspace(nextList.length > 0 ? nextList[0] : null);
    }
  };

  // MEMBER ROLES & INVITES Control panel settings hooks
  const handleInviteMember = async (email: string, role: Role) => {
    if (!activeWorkspace) return;
    const nameSeed = email.split("@")[0];
    const capitalName = nameSeed.charAt(0).toUpperCase() + nameSeed.slice(1);
    
    const newMember = {
      userId: `u-invited-${Date.now()}`,
      email,
      name: capitalName,
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${nameSeed}`
    };

    const nextMembers = [...activeWorkspace.members, newMember];
    handleUpdateWorkspace({ members: nextMembers });
    triggerSystemNotification("Invited Teammate", `Dispatched automated GTM access to ${email}.`, "success");
  };

  const handleChangeMemberRole = async (userId: string, role: Role) => {
    if (!activeWorkspace) return;
    const nextMembers = activeWorkspace.members.map(m => m.userId === userId ? { ...m, role } : m);
    handleUpdateWorkspace({ members: nextMembers });
  };

  // CREATE PROJECT FLOW
  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !activeWorkspace) return;

    if (selectedTemplateId) {
      try {
        const res = await fetch("/api/templates/instantiate", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            templateId: selectedTemplateId,
            workspaceId: activeWorkspace.id,
            name: newProjectName.trim(),
            description: newProjectDesc.trim(),
            dueDate: newProjectdueDate
          })
        });
        const data = await res.json();
        if (data.error) {
          triggerSystemNotification("Blueprint Instantiation Failed", data.error, "alert");
          return;
        }
        const createdProj = data.project;
        const createdTasks = data.tasks;

        setProjects(prev => [...prev, createdProj]);
        setTasks(prev => [...prev, ...createdTasks]);
        setActiveProject(createdProj);
        triggerSystemNotification("Project Instantiated", `Success generation for stream: ${createdProj.name} with template tasks!`, "success");
        triggerLogActivity("Project Instantiated", `Created new project stream '${createdProj.name}' from blueprint.`);
      } catch (err) {
        console.error(err);
        triggerSystemNotification("Failed Blueprint Instantiation", "Could not clone blueprint elements onto workspace.", "alert");
      }
    } else {
      const projData = {
        workspaceId: activeWorkspace.id,
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        status: "Active" as const,
        dueDate: newProjectdueDate,
        progress: 0,
        team: [currentUser?.id || "u-1"],
        createdAt: new Date().toISOString()
      };

      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projData)
        });
        const created = await res.json();
        setProjects(prev => [...prev, created]);
        setActiveProject(created);
        triggerSystemNotification("Project Initialized", `Success startup for stream : ${created.name}`, "success");
        triggerLogActivity("Project Creation", `Registered roadmap flow ${created.name}`);
      } catch {
        const offlineProj: Project = {
          id: `p-${Date.now()}`,
          ...projData
        };
        setProjects(prev => [...prev, offlineProj]);
        setActiveProject(offlineProj);
      }
    }

    setNewProjectName("");
    setNewProjectDesc("");
    setNewProjectDueDate("");
    setSelectedTemplateId("");
    setShowNewProjectModal(false);
  };

  const handleSaveTemplate = async (name: string, description: string, projectId: string) => {
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, description, projectId })
      });
      const created = await res.json();
      setTemplates(prev => [...prev, created]);
      triggerSystemNotification("Blueprint Saved", `Successfully published reusable blueprint: ${created.name}`, "success");
      triggerLogActivity("Saved Project Blueprint", `Preserved active project tasks as reusable design: ${created.name}`);
    } catch (err) {
      console.error(err);
      triggerSystemNotification("Blueprint Save Failed", "Stale node connection prevented template save.", "alert");
    }
  };

  const handleInstantiateTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = templates.find(t => t.id === templateId);
    if (found) {
      setNewProjectName(found.name);
      setNewProjectDesc(found.description || "");
    }
    setShowNewProjectModal(true);
  };

  const handleSelectTaskFromSearch = (task: Task) => {
    // Determine the workspace of the task
    const ws = workspaces.find(w => w.id === task.workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
    }
    // Set matching project if present
    if (task.projectId) {
      const proj = projects.find(p => p.id === task.projectId);
      if (proj) {
        setActiveProject(proj);
      }
    } else {
      setActiveProject(null);
    }
    // Redirect to Kanban viewpoint to reveal the card
    setView("kanban");
    // Trigger the auto-highlight logic
    setGloballySelectedTaskId(task.id);
    triggerSystemNotification("Task Located", `Navigated to task "${task.title}" in workspace ${ws?.name || ""}.`, "success");
  };

  // ADD TASK CARD
  const handleAddTask = async (taskData: Partial<Task>) => {
    const targetWorkspaceId = taskData.workspaceId || activeWorkspace?.id;
    if (!targetWorkspaceId) return;
    const finalForm = {
      ...taskData,
      workspaceId: targetWorkspaceId,
      subtasks: taskData.subtasks || [],
      attachments: taskData.attachments || [],
      dependencies: taskData.dependencies || [],
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm)
      });
      const createdTask = await res.json();
      setTasks(prev => [...prev, createdTask]);
      triggerLogActivity("Card Addition", `Added Kanban card "${createdTask.title}" to ${createdTask.status}`);
      triggerSystemNotification("Task Created", `Successfully created active task "${createdTask.title}" in workspace.`, "success");
    } catch {
      const offlineTask: Task = {
        id: `t-${Date.now()}`,
        projectId: taskData.projectId || "",
        workspaceId: targetWorkspaceId,
        title: taskData.title || "Untitled Card",
        description: taskData.description,
        status: taskData.status || "To Do",
        priority: taskData.priority || "Medium",
        dueDate: taskData.dueDate,
        assignees: taskData.assignees || ["u-1"],
        tags: taskData.tags || [],
        subtasks: [],
        attachments: [],
        dependencies: [],
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [...prev, offlineTask]);
    }
  };

  // UPDATE TASK CARD
  const handleUpdateTask = async (id: string, taskUpdatedData: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskUpdatedData)
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      
      if (taskUpdatedData.status) {
        triggerLogActivity("Card Transited", `Moved card to column status "${taskUpdatedData.status}"`, id);
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskUpdatedData } : t));
    }
  };

  // DELETE TASK CARD
  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t.id !== id));
      triggerSystemNotification("Card Removed", "Deleted target task from the board container.", "warning");
    } catch {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // SUBTASKS CONTROL ACTIONS
  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      const completedSubtaskTask = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? completedSubtaskTask : t));
    } catch {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const newSub = { id: `sub-${Date.now()}`, title, completed: false };
          return { ...t, subtasks: [...t.subtasks, newSub] };
        }
        return t;
      }));
    }
  };

  const handleToggleSubtask = async (taskId: string, subId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtaskId: subId, completed })
      });
      const completedSubtaskTask = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? completedSubtaskTask : t));
    } catch {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const updated = t.subtasks.map(s => s.id === subId ? { ...s, completed } : s);
          return { ...t, subtasks: updated };
        }
        return t;
      }));
    }
  };

  // ATTACHMENT ADD
  const handleAddAttachment = async (taskId: string, attData: any) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attData)
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const addedAtt = {
            id: `att-${Date.now()}`,
            name: attData.name,
            size: attData.size,
            type: attData.type,
            url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400",
            uploadedBy: "You",
            uploadedAt: new Date().toISOString()
          };
          return { ...t, attachments: [...t.attachments, addedAtt] };
        }
        return t;
      }));
    }
  };

  // COMMENTS ADD
  const handleAddComment = async (taskId: string, text: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // NOTIFICATION ACTIONS
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
    } catch {
      setNotifications([]);
    }
  };

  const getViewDetails = () => {
    switch (currentView) {
      case "kanban":
        return { title: "Kanban Board", icon: FolderKanban, desc: "Sprint board & Scrum backlog" };
      case "calendar":
        return { title: "Calendar View", icon: Calendar, desc: "Schedule, deadlines & task timeline" };
      case "analytics":
        return { title: "Analytics & Export", icon: BarChart3, desc: "Workload distribution & metric breakdowns" };
      case "ai":
        return { title: "AI Copilot Hub", icon: Bot, desc: "Pre-analyzed sprint strategies & task suggestions" };
      case "settings":
        return { title: "Workspace Settings", icon: Settings, desc: "Role configurations & teammate permissions" };
      case "admin":
        return { title: "Admin Dashboard", icon: ShieldAlert, desc: "System parameters, core audit logs & system health" };
      case "docs":
        return { title: "SaaS Dev Docs", icon: BookOpen, desc: "Interactive endpoints documentation guides" };
      default:
        return { title: "To-Do Workspace", icon: CheckSquare, desc: "Collaborative Scrum SaaS platform" };
    }
  };

  const viewDetails = getViewDetails();
  const ViewIcon = viewDetails.icon;

  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        darkMode={darkMode} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setView={setView}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        selectWorkspace={handleSelectWorkspace}
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          localStorage.setItem("loggedOut", "true");
          setCurrentUser(null);
        }}
        onLoginSimulate={() => {
          const defaultUser = {
            id: "u-1",
            email: "saranramesh709@gmail.com",
            name: "Saran Ramesh (You)",
            role: "Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            emailVerified: true,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem("authToken", "token-u-1");
          localStorage.setItem("currentUser", JSON.stringify(defaultUser));
          localStorage.removeItem("loggedOut");
          setCurrentUser(defaultUser);
        }}
        onNewWorkspaceOpen={() => setShowNewWorkspaceModal(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 overflow-hidden">
        
        {/* Global Top Navigation Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-10 flex-shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <ViewIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-850 dark:text-white truncate">{viewDetails.title}</h1>
                {activeWorkspace && (
                  <span className="hidden xs:inline-block text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-100 dark:border-indigo-900">
                    {activeWorkspace.name}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{viewDetails.desc}</p>
            </div>
          </div>

          {/* Global Search Bar Engine */}
          <div className="flex-1 max-w-sm md:max-w-md mx-0 sm:mx-4">
            <GlobalSearchBar
              tasks={tasks}
              workspaces={workspaces}
              projects={projects}
              users={users}
              onSelectTask={handleSelectTaskFromSearch}
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            {/* Active metrics display */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>{tasks.filter(t => t.workspaceId === activeWorkspace?.id).length} Active Tasks</span>
            </div>

            {/* Quick Add Global Button */}
            <button
              onClick={() => setShowQuickTaskModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 hover:bg-indigo-700 text-white font-sans font-bold text-[11px] rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Quick Task</span>
            </button>
          </div>
        </div>

        {currentView === "kanban" && (
          <KanbanBoard
            activeWorkspace={activeWorkspace}
            projects={projects}
            tasks={tasks}
            users={users}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onAddAttachment={handleAddAttachment}
            onAddComment={handleAddComment}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            onNewProjectOpen={() => setShowNewProjectModal(true)}
            onNewWorkspaceOpen={() => setShowNewWorkspaceModal(true)}
            onSaveTemplate={handleSaveTemplate}
            templates={templates}
            onInstantiateTemplate={handleInstantiateTemplate}
            onUpdateWorkspace={handleUpdateWorkspace}
            onAddCustomColumn={(col) => handleUpdateWorkspace({ customColumns: [...(activeWorkspace?.customColumns || ["To Do", "In Progress", "Review", "Completed"]), col] })}
            selectedTaskId={globallySelectedTaskId}
            onClearSelectedTaskId={() => setGloballySelectedTaskId(null)}
          />
        )}

        {currentView === "calendar" && (
          <CalendarView
            tasks={tasks}
            projects={projects}
            activeWorkspaceId={activeWorkspace?.id || null}
          />
        )}

        {currentView === "analytics" && (
          <AnalyticsView
            tasks={tasks}
            projects={projects}
            users={users}
            activeWorkspaceId={activeWorkspace?.id || null}
            activeWorkspace={activeWorkspace}
          />
        )}

        {currentView === "ai" && (
          <AIWorkspace
            activeWorkspace={activeWorkspace}
            projects={projects}
            tasks={tasks}
            onAddTask={handleAddTask}
          />
        )}

        {currentView === "settings" && (
          <WorkspaceSettings
            activeWorkspace={activeWorkspace}
            onUpdateWorkspace={handleUpdateWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
            onInviteMember={handleInviteMember}
            onChangeMemberRole={handleChangeMemberRole}
            users={users}
            currentUserId={currentUser?.id || "u-1"}
          />
        )}

        {currentView === "admin" && (
          <AdminPanel
            users={users}
            workspaces={workspaces}
            tasks={tasks}
            activityLogs={activityLogs}
          />
        )}

        {currentView === "docs" && <DocumentationView />}
      </main>

      {/* NEW WORKSPACE MODAL POPUP */}
      {showNewWorkspaceModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-2xl w-full max-w-md p-6 shadow-2xl text-xs select-none">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
                📂 Setup Workspace Node
              </h3>
              <button 
                onClick={() => setShowNewWorkspaceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspaceSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Workspace Label Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme GTM Campaign"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-810 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Target Objectives / Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize engineering sprint cycles, team parameters or delivery goals..."
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-812 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWorkspaceModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-sans font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg shadow-sm"
                >
                  Instantiate Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PROJECT MODAL POPUP */}
      {showNewProjectModal && (
         <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans unselectable">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl w-full max-w-md p-6 shadow-2xl text-xs select-none">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
                📁 Roadmap Project Entry
              </h3>
              <button 
                onClick={() => setShowNewProjectModal(false)}
                className="p-1 text-slate-400 hover:text-slate-655 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Instantiate From Blueprint (Reusable Template)</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const tid = e.target.value;
                    setSelectedTemplateId(tid);
                    if (tid) {
                      const found = templates.find(t => t.id === tid);
                      if (found) {
                        setNewProjectName(found.name);
                        setNewProjectDesc(found.description || "");
                      }
                    } else {
                      setNewProjectName("");
                      setNewProjectDesc("");
                    }
                  }}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-850 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">✨ Fresh Blank Project Stream</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      📋 {t.name} ({t.tasks?.length || 0} checklist items)
                    </option>
                  ))}
                </select>
                {selectedTemplateId && (
                  <p className="text-[10px] text-indigo-505 text-indigo-600 dark:text-indigo-400 font-medium font-sans">
                    ⚡ Clones {templates.find(t => t.id === selectedTemplateId)?.tasks?.length || 0} pre-configured tasks & subtasks on creation.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Project Stream Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GTM Launch Strategy"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Strategic Specifications</label>
                <textarea
                  rows={2}
                  placeholder="Define roadmap milestones..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">Target Launch Date</label>
                <input
                  type="date"
                  value={newProjectdueDate}
                  onChange={(e) => setNewProjectDueDate(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-850 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-sans font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg shadow-sm"
                >
                  Create Project Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL QUICK ADD TASK MODAL POPUP */}
      <QuickAddTaskModal
        isOpen={showQuickTaskModal}
        onClose={() => setShowQuickTaskModal(false)}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        projects={projects}
        users={users}
        onAddTask={handleAddTask}
      />

    </div>
  );
}

// Helpers for symbol displays
function activeProjectStatusSymbol(status: string) {
  if (status === "Active") return "🟢";
  if (status === "Planning") return "🔵";
  if (status === "On Hold") return "🟡";
  return "⚪";
}

function getColumnColorDot(col: string) {
  const c = col.toLowerCase();
  if (c.includes("to do") || c.includes("idea")) return "bg-slate-400";
  if (c.includes("progress") || c.includes("draft")) return "bg-blue-500";
  if (c.includes("review")) return "bg-amber-500";
  return "bg-emerald-500";
}

function isOverdue(dueDate: string, status: string) {
  if (status === "Completed" || status === "Published") return false;
  const todayStr = new Date().toISOString().split("T")[0];
  return dueDate < todayStr;
}
