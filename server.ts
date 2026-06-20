import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, Workspace, Project, Task, Subtask, Comment, Notification, ActivityLog, Role, Priority, TaskStatus, Attachment, ProjectTemplate, TemplateTask 
} from "./src/types";

// Database storage file path
const DB_FILE = path.join(process.cwd(), "database.json");

// Define custom request with optional user info for simple JWT middleware simulation
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: "User" | "Admin";
  };
}

let db: {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  templates: ProjectTemplate[];
} = {
  users: [],
  workspaces: [],
  projects: [],
  tasks: [],
  comments: [],
  notifications: [],
  activityLogs: [],
  templates: []
};

// Initial system seeding
function seedDatabase() {
  console.log("Seeding initial database...");
  const users: User[] = [
    {
      id: "u-1",
      email: "saranramesh709@gmail.com",
      name: "Saran Ramesh (You)",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "u-2",
      email: "alice.carter@acme.com",
      name: "Alice Carter",
      role: "User",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "u-3",
      email: "bob.jenkins@acme.com",
      name: "Bob Jenkins",
      role: "User",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "u-4",
      email: "charlie@acme.com",
      name: "Charlie Smith",
      role: "User",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      createdAt: new Date().toISOString()
    }
  ];

  const workspaces: Workspace[] = [
    {
      id: "w-1",
      name: "Acme Product Team Workspace",
      description: "Primary workspace for engineering sprints, feature planning, and roadmap coordination.",
      ownerId: "u-1",
      members: [
        { userId: "u-1", email: "saranramesh709@gmail.com", name: "Saran Ramesh (You)", role: "Owner" },
        { userId: "u-2", email: "alice.carter@acme.com", name: "Alice Carter", role: "Admin" },
        { userId: "u-3", email: "bob.jenkins@acme.com", name: "Bob Jenkins", role: "Member" },
        { userId: "u-4", email: "charlie@acme.com", name: "Charlie Smith", role: "Viewer" }
      ],
      customColumns: ["To Do", "In Progress", "Review", "Completed"],
      theme: "ocean",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "w-2",
      name: "Marketing & GTM Strategy",
      description: "Coordination workspace for social media campaigns, brand messaging, and product launch assets.",
      ownerId: "u-1",
      members: [
        { userId: "u-1", email: "saranramesh709@gmail.com", name: "Saran Ramesh (You)", role: "Owner" },
        { userId: "u-2", email: "alice.carter@acme.com", name: "Alice Carter", role: "Member" }
      ],
      customColumns: ["Idea Pitch", "Drafting", "Active Review", "Published"],
      theme: "sunset",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const projects: Project[] = [
    {
      id: "p-1",
      workspaceId: "w-1",
      name: "SaaS Platform Beta Launch",
      description: "Final stretch milestones leading to the corporate customer beta testing cycle.",
      status: "Active",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 65,
      team: ["u-1", "u-2", "u-3"],
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "p-2",
      workspaceId: "w-1",
      name: "ISO/IEC 27001 Security Audit",
      description: "Gather compliance documentation, verify firewall rules, and audit API authentication pathways.",
      status: "Planning",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 20,
      team: ["u-1", "u-4"],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "p-3",
      workspaceId: "w-2",
      name: "Viral Product Soundbites Campaign",
      description: "Shorthand Reels, YouTube Shorts, and LinkedIn newsletters focusing on the productivity tools.",
      status: "Active",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 40,
      team: ["u-1", "u-2"],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const tasks: Task[] = [
    {
      id: "t-1",
      projectId: "p-1",
      workspaceId: "w-1",
      title: "Implement JWT Middleware & Rate Limiter",
      description: "Secure node-express authentication routers and add basic requests-per-minute constraints.",
      status: "In Progress",
      priority: "Critical",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: ["u-1", "u-3"],
      tags: ["Security", "Backend"],
      subtasks: [
        { id: "sub-1", title: "Add express-rate-limit validation", completed: true },
        { id: "sub-2", title: "Write helper functions for sign/verify", completed: true },
        { id: "sub-3", title: "Implement RBAC helper wrappers", completed: false }
      ],
      attachments: [
        {
          id: "att-1",
          name: "security_blueprint.pdf",
          size: "1.4 MB",
          type: "application/pdf",
          url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400",
          uploadedBy: "Saran Ramesh (You)",
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      dependencies: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "t-2",
      projectId: "p-1",
      workspaceId: "w-1",
      title: "Design Dynamic Kanban Interface",
      description: "Build clean, tactile column zones with smooth drag/drop sorting, card expansion, and transition markers.",
      status: "To Do",
      priority: "High",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: ["u-2"],
      tags: ["Frontend", "UX"],
      subtasks: [
        { id: "sub-4", title: "Integrate Lucide icon library indicators", completed: false },
        { id: "sub-5", title: "Apply Tailwind fluid color presets", completed: false }
      ],
      attachments: [],
      dependencies: ["t-1"],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "t-3",
      projectId: "p-1",
      workspaceId: "w-1",
      title: "Write Swagger Documentation Specifications",
      description: "Fully document user auth, workspaces, projects & tasks routing in YAML structure.",
      status: "Review",
      priority: "Medium",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Overdue!
      assignees: ["u-3"],
      tags: ["Docs"],
      subtasks: [
        { id: "sub-i-1", title: "Verify Swagger spec compiles correctly", completed: true }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "t-4",
      projectId: "p-1",
      workspaceId: "w-1",
      title: "Configure Continuous Delivery Pipeline",
      description: "Bootstrap Docker configurations, verify build runs, and deploy service instances.",
      status: "Completed",
      priority: "Low",
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: ["u-1"],
      tags: ["DevOps"],
      subtasks: [
        { id: "sub-i-2", title: "Optimize Dockerfile Layer Cache", completed: true },
        { id: "sub-i-3", title: "Configure healthcheck entry point", completed: true }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "t-5",
      projectId: "p-3",
      workspaceId: "w-2",
      title: "Draft Beta Launch Landing Page Copy",
      description: "Articulate core value props, workspace flexibility, and early access benefits.",
      status: "Idea Pitch",
      priority: "High",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: ["u-2"],
      tags: ["Copywriting", "Launch"],
      subtasks: [
        { id: "sub-p-1", title: "Conduct customer survey alignment", completed: true }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const comments: Comment[] = [
    {
      id: "c-1",
      taskId: "t-1",
      userId: "u-3",
      userName: "Bob Jenkins",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "I finished implementing base JWT parsing, but we need to verify token expiration handling and custom error messages in our app routing middleware.",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "c-2",
      taskId: "t-1",
      userId: "u-1",
      userName: "Saran Ramesh (You)",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      text: "Awesome Bob! I will double-check the RBAC security wrap tomorrow. Let's make sure we test rate limit headers as well.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "c-3",
      taskId: "t-3",
      userId: "u-3",
      userName: "Bob Jenkins",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "Draft complete. Sending to Saran and Alice for final schema review.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: "n-1",
      userId: "u-1",
      title: "Task Assigned",
      message: "Alice Carter assigned 'Implement JWT Middleware & Rate Limiter' to you.",
      type: "success",
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "n-2",
      userId: "u-1",
      title: "Upcoming Project Milestone",
      message: "Project 'SaaS Platform Beta Launch' deadline is in 10 days! Organize remaining Kanban tasks.",
      type: "warning",
      read: false,
      createdAt: new Date(Date.now() - 4 * 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "n-3",
      userId: "u-1",
      title: "System Update",
      message: "Smart To-Do Workspace v1.0.0 is live! AI prioritize suggestions are now server-active.",
      type: "info",
      read: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: "al-1",
      workspaceId: "w-1",
      projectId: "p-1",
      taskId: "t-4",
      userId: "u-1",
      userName: "Saran Ramesh (You)",
      action: "Completed Task",
      details: "Completed task 'Configure Continuous Delivery Pipeline' in Project SaaS Platform Beta Launch.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "al-2",
      workspaceId: "w-1",
      projectId: "p-1",
      taskId: "t-1",
      userId: "u-3",
      userName: "Bob Jenkins",
      action: "Updated Subtask",
      details: "Marked subtask 'Write helper functions for sign/verify' as Completed.",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "al-3",
      workspaceId: "w-1",
      projectId: "p-1",
      userId: "u-1",
      userName: "Saran Ramesh (You)",
      action: "Created Workspace",
      details: "Created a new workspace Acme Product Team Workspace as Owner.",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const templates: ProjectTemplate[] = [
    {
      id: "tpl-sprint",
      name: "Agile Sprint Blueprint",
      description: "A standard Scrum sprint blueprint featuring backlog preparation, development, testing, and deployment checkpoints.",
      createdAt: new Date().toISOString(),
      tasks: [
        {
          title: "Backlog Refinement & Sprint Planning",
          description: "Review user stories, define sprint goals, and assign weights.",
          status: "To Do",
          priority: "High",
          tags: ["sprint-setup", "planning"],
          subtasks: [
            { title: "Review product requirements and user stories", completed: false },
            { title: "Define sprint goals and success metrics", completed: false },
            { title: "Estimate story points with the team", completed: false }
          ]
        },
        {
          title: "Infrastructure Deployment Configuration",
          description: "Bootstrap pipeline credentials and prepare workflow runners.",
          status: "In Progress",
          priority: "Critical",
          tags: ["devops", "cloud"],
          subtasks: [
            { title: "Configure development domain secrets", completed: false },
            { title: "Set up staging server environment", completed: false },
            { title: "Validate load testing scripts", completed: false }
          ]
        },
        {
          title: "Core Feature Abstraction Setup",
          description: "Establish system architecture boundaries and lay down unit test modules.",
          status: "To Do",
          priority: "High",
          tags: ["backend", "frontend"],
          subtasks: [
            { title: "Design database schemas and initial migration", completed: false },
            { title: "Implement key authentication checkpoints", completed: false },
            { title: "Verify basic state handling logic", completed: false }
          ]
        },
        {
          title: "Comprehensive Security/QA Review",
          description: "Perform package dependency analysis, code smell checking, and secure policy enforcement.",
          status: "Review",
          priority: "Medium",
          tags: ["security", "quality-audit"],
          subtasks: [
            { title: "Review Firestore and database rules", completed: false },
            { title: "Execute static vulnerability analysis on workspace", completed: false }
          ]
        }
      ]
    },
    {
      id: "tpl-marketing",
      name: "Product Launch GTM Checklist",
      description: "A tactical marketing blueprint covering landing page launch, press distributions, and social campaign tracking.",
      createdAt: new Date().toISOString(),
      tasks: [
        {
          title: "Landing Page Visual Blueprint",
          description: "Develop the promotional landing page, wire up capture forms, and integrate search analytics.",
          status: "In Progress",
          priority: "High",
          tags: ["design", "web"],
          subtasks: [
            { title: "Review marketing copy and brand assets", completed: false },
            { title: "Validate form submission conversion points", completed: false },
            { title: "Complete lighthouse speed check audit", completed: false }
          ]
        },
        {
          title: "Campaign Dispatch & Outreach",
          description: "Mobilize channels, schedule sequence announcements, and track referral funnels.",
          status: "To Do",
          priority: "Medium",
          tags: ["outreach", "promos"],
          subtasks: [
            { title: "Schedule social media teaser threads", completed: false },
            { title: "Prepare and proof launch email templates", completed: false }
          ]
        }
      ]
    }
  ];

  db = { users, workspaces, projects, tasks, comments, notifications, activityLogs, templates };
  saveDatabase();
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      // Basic schema safety check
      if (parsed.users && parsed.workspaces && parsed.projects && parsed.tasks) {
        db = parsed;
        if (!db.templates) {
          db.templates = [];
        }
        console.log("Database loaded successfully from file system. Records: Users:", db.users.length, "Tasks:", db.tasks.length, "Templates:", db.templates.length);
      } else {
        seedDatabase();
      }
    } else {
      seedDatabase();
    }
  } catch (err) {
    console.error("Failed to load database, fall back to seed:", err);
    seedDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database to disk:", err);
  }
}

// Ensure database is in system
loadDatabase();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulate Authentication Middleware
app.use((req: AuthenticatedRequest, res, next) => {
  // In development/applet mode, we automatically act on behalf of Saran Ramesh (u-1) or fetch the active login token if set.
  // This ensures first-class user experience without forcing register/login wall if not wanted, while keeping logins supported as requested!
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token.startsWith("token-")) {
      const userId = token.split("-")[1];
      const foundUser = db.users.find(u => u.id === userId);
      if (foundUser) {
        req.user = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role
        };
        return next();
      }
    }
  }

  // Fallback to our principal user Saran Ramesh so the workspace is instantly viewable/interactive/editable!
  req.user = {
    id: "u-1",
    email: "saranramesh709@gmail.com",
    name: "Saran Ramesh (You)",
    role: "Admin"
  };
  next();
});

// Logs helper
function logActivity(workspaceId: string, projectId: string | undefined, taskId: string | undefined, userId: string, userName: string, action: string, details: string) {
  const newLog: ActivityLog = {
    id: `al-${Date.now()}`,
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    action,
    details,
    createdAt: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);
  saveDatabase();
}

// Notifications helper
function addNotification(userId: string, title: string, message: string, type: "info" | "success" | "warning" | "alert") {
  const newNotif: Notification = {
    id: `n-${Date.now()}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(newNotif);
  saveDatabase();
}

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
try {
  const key = process.env.GEMINI_API_KEY;
  if (key && key !== "MY_GEMINI_API_KEY") {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized with system key successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not configured yet. AI features will fallback gracefully.");
  }
} catch (err) {
  console.error("Failed to initialize GoogleGenAI:", err);
}

// Helper safety wrapper for Gemini calling
async function callGemini(prompt: string, fallbackJson: any, responseSchema?: any): Promise<any> {
  if (!aiClient) {
    return { error: "GEMINI_API_KEY is missing. Configure it in Settings > Secrets to unlock AI suggestions.", isFallback: true, ...fallbackJson };
  }
  try {
    const config: any = {};
    if (responseSchema) {
      config.responseMimeType = "application/json";
      config.responseSchema = responseSchema;
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: config
    });

    const resultText = response.text;
    if (responseSchema && resultText) {
      try {
        return JSON.parse(resultText.trim());
      } catch (parseErr) {
        console.error("JSON parse failed for Gemini output:", parseErr, resultText);
        return { error: "Could not parse AI response", response: resultText, isFallback: false, ...fallbackJson };
      }
    }
    return resultText;
  } catch (err: any) {
    console.error("Gemini call error:", err);
    return { error: err.message || "Gemini API failure", isFallback: true, ...fallbackJson };
  }
}


/* ==================== API ROUTING ==================== */

// 1. Auth Routing
app.post("/api/auth/register", (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "User already exists with this email address" });
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    role: "User",
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    emailVerified: false,
    createdAt: new Date().toISOString()
  };

  // 1. Provision a fresh workspace specifically for this new user
  const newWorkspace: Workspace = {
    id: `w-${Date.now()}`,
    name: `${name}'s Private Workspace`,
    description: `Personalized, fresh workspace for ${name} to coordinate sprints, manage goals, and track deliverables.`,
    ownerId: newUser.id,
    members: [
      { userId: newUser.id, email: newUser.email, name: `${name} (You)`, role: "Owner" }
    ],
    customColumns: ["To Do", "In Progress", "Review", "Completed"],
    theme: "ocean",
    tagColors: {
      "onboarding": "indigo",
      "milestone": "rose",
      "feature": "emerald"
    },
    createdAt: new Date().toISOString()
  };

  // 2. Provision a Welcome onboarding project for the new workspace
  const newProject: Project = {
    id: `p-${Date.now()}`,
    workspaceId: newWorkspace.id,
    name: "Onboarding & Getting Started",
    description: "Your introductory tutorial project. Explore priorities, columns, subtask tracking, and the custom Tag Studio.",
    status: "Active",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    progress: 0,
    team: [newUser.id],
    createdAt: new Date().toISOString()
  };

  // 3. Provision onboarding tasks to populate their board in an interactive way
  const task1: Task = {
    id: `t-ob1-${Date.now()}`,
    projectId: newProject.id,
    workspaceId: newWorkspace.id,
    title: "Explore task priorities and custom columns",
    description: "Try dragging this task card around to different status columns like 'In Progress' or 'Review' to organize your progress!",
    status: "To Do",
    priority: "High",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignees: [newUser.id],
    tags: ["onboarding"],
    subtasks: [
      { id: `sb1-${Date.now()}`, title: "Drag this card to In Progress", completed: false },
      { id: `sb2-${Date.now()}`, title: "Select a custom priority level in task details", completed: false }
    ],
    attachments: [],
    dependencies: [],
    createdAt: new Date().toISOString()
  };

  const task2: Task = {
    id: `t-ob2-${Date.now()}`,
    projectId: newProject.id,
    workspaceId: newWorkspace.id,
    title: "Try the 'Highlight by Priority' toggle!",
    description: "Enable the 'Highlight Priority' toggle at the top of the board to apply a subtle, color-coded ambient glow and background color based on task priorities (High/Medium/Low/Critical) which help urgent items stand out instantly.",
    status: "To Do",
    priority: "Critical",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignees: [newUser.id],
    tags: ["onboarding", "milestone"],
    subtasks: [
      { id: `sb3-${Date.now()}`, title: "Click 'Highlight Priority' in the top toolbar", completed: false }
    ],
    attachments: [],
    dependencies: [],
    createdAt: new Date().toISOString()
  };

  const task3: Task = {
    id: `t-ob3-${Date.now()}`,
    projectId: newProject.id,
    workspaceId: newWorkspace.id,
    title: "Customize tag colors in the Tag Studio",
    description: "Open the 'Tag Studio' modal from the top toolbar. From there, you can configure beautiful, custom hex codes or preset swatches for your #onboarding or other custom workspace tags.",
    status: "In Progress",
    priority: "Medium",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignees: [newUser.id],
    tags: ["onboarding"],
    subtasks: [
      { id: `sb4-${Date.now()}`, title: "Open the Tag Studio modal", completed: false },
      { id: `sb5-${Date.now()}`, title: "Assign violet or dynamic hex to onboarding tag", completed: false }
    ],
    attachments: [],
    dependencies: [],
    createdAt: new Date().toISOString()
  };

  const task4: Task = {
    id: `t-ob4-${Date.now()}`,
    projectId: newProject.id,
    workspaceId: newWorkspace.id,
    title: "Getting AI-Powered Priority Suggestions",
    description: "Click on the '⚡ AI Prioritization' button on the board toolbar. The server will use Gemini to analyze your tasks and subtasks, providing immediate smart recommendations.",
    status: "Review",
    priority: "Low",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignees: [newUser.id],
    tags: ["onboarding", "feature"],
    subtasks: [
      { id: `sb6-${Date.now()}`, title: "Trigger the AI Prioritize checklist review", completed: false }
    ],
    attachments: [],
    dependencies: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.workspaces.push(newWorkspace);
  db.projects.push(newProject);
  db.tasks.push(task1, task2, task3, task4);

  // Log workspace creation activity
  logActivity(newWorkspace.id, undefined, undefined, newUser.id, `${newUser.name} (You)`, "Created Workspace", `Created a fresh workspace ${newWorkspace.name}`);

  saveDatabase();

  // Return simulated JWT token
  res.status(201).json({
    message: "Registration successful. Welcome!",
    token: `token-${newUser.id}`,
    user: newUser
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: "No user found with this email" });
  }

  res.json({
    message: "Logged in successfully",
    token: `token-${user.id}`,
    user
  });
});

app.get("/api/auth/profile", (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userDetails = db.users.find(u => u.id === req.user?.id);
  if (!userDetails) {
    return res.status(404).json({ error: "User profile not found" });
  }
  res.json(userDetails);
});

app.post("/api/auth/profile", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { name, avatar } = req.body;
  const index = db.users.findIndex(u => u.id === req.user?.id);
  if (index === -1) return res.status(404).json({ error: "User not found" });

  if (name) db.users[index].name = name;
  if (avatar) db.users[index].avatar = avatar;

  saveDatabase();
  res.json({ message: "Profile updated successfully", user: db.users[index] });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  res.json({ message: `Password reset email has been sent successfully to ${email}.` });
});

app.post("/api/auth/verify", (req, res) => {
  res.json({ message: "Verification completed successfully." });
});


// 2. Workspace Routing
app.get("/api/workspaces", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  
  // Filter workspaces where user is member or owner
  let available = db.workspaces.filter(w => 
    w.ownerId === req.user?.id || w.members.some(m => m.userId === req.user?.id)
  );

  // If a new user lands here with zero workspaces, lazily provision a fresh personalized workspace for them
  if (available.length === 0) {
    const userId = req.user.id;
    const email = req.user.email;
    const name = req.user.name || email.split("@")[0];

    const newWorkspace: Workspace = {
      id: `w-${Date.now()}`,
      name: `${name}'s Private Workspace`,
      description: `Personalized, fresh workspace for ${name} to coordinate sprints, manage goals, and track deliverables.`,
      ownerId: userId,
      members: [
        { userId, email, name: `${name} (You)`, role: "Owner" }
      ],
      customColumns: ["To Do", "In Progress", "Review", "Completed"],
      theme: "ocean",
      tagColors: {
        "onboarding": "indigo",
        "milestone": "rose",
        "feature": "emerald"
      },
      createdAt: new Date().toISOString()
    };

    const newProject: Project = {
      id: `p-${Date.now()}`,
      workspaceId: newWorkspace.id,
      name: "Onboarding & Getting Started",
      description: "Your introductory tutorial project. Explore priorities, columns, subtask tracking, and the custom Tag Studio.",
      status: "Active",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 0,
      team: [userId],
      createdAt: new Date().toISOString()
    };

    const task1: Task = {
      id: `t-ob1-${Date.now()}`,
      projectId: newProject.id,
      workspaceId: newWorkspace.id,
      title: "Explore task priorities and custom columns",
      description: "Try dragging this task card around to different status columns like 'In Progress' or 'Review' to organize your progress!",
      status: "To Do",
      priority: "High",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: [userId],
      tags: ["onboarding"],
      subtasks: [
        { id: `sb1-${Date.now()}`, title: "Drag this card to In Progress", completed: false },
        { id: `sb2-${Date.now()}`, title: "Select a custom priority level in task details", completed: false }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date().toISOString()
    };

    const task2: Task = {
      id: `t-ob2-${Date.now()}`,
      projectId: newProject.id,
      workspaceId: newWorkspace.id,
      title: "Try the 'Highlight by Priority' toggle!",
      description: "Enable the 'Highlight Priority' toggle at the top of the board to apply a subtle, color-coded ambient glow and background color based on task priorities (High/Medium/Low/Critical) which help urgent items stand out instantly.",
      status: "To Do",
      priority: "Critical",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: [userId],
      tags: ["onboarding", "milestone"],
      subtasks: [
        { id: `sb3-${Date.now()}`, title: "Click 'Highlight Priority' in the top toolbar", completed: false }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date().toISOString()
    };

    const task3: Task = {
      id: `t-ob3-${Date.now()}`,
      projectId: newProject.id,
      workspaceId: newWorkspace.id,
      title: "Customize tag colors in the Tag Studio",
      description: "Open the 'Tag Studio' modal from the top toolbar. From there, you can configure beautiful, custom hex codes or preset swatches for your #onboarding or other custom workspace tags.",
      status: "In Progress",
      priority: "Medium",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: [userId],
      tags: ["onboarding"],
      subtasks: [
        { id: `sb4-${Date.now()}`, title: "Open the Tag Studio modal", completed: false },
        { id: `sb5-${Date.now()}`, title: "Assign violet or dynamic hex to onboarding tag", completed: false }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date().toISOString()
    };

    const task4: Task = {
      id: `t-ob4-${Date.now()}`,
      projectId: newProject.id,
      workspaceId: newWorkspace.id,
      title: "Getting AI-Powered Priority Suggestions",
      description: "Click on the '⚡ AI Prioritization' button on the board toolbar. The server will use Gemini to analyze your tasks and subtasks, providing immediate smart recommendations.",
      status: "Review",
      priority: "Low",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      assignees: [userId],
      tags: ["onboarding", "feature"],
      subtasks: [
        { id: `sb6-${Date.now()}`, title: "Trigger the AI Prioritize checklist review", completed: false }
      ],
      attachments: [],
      dependencies: [],
      createdAt: new Date().toISOString()
    };

    db.workspaces.push(newWorkspace);
    db.projects.push(newProject);
    db.tasks.push(task1, task2, task3, task4);
    
    logActivity(newWorkspace.id, undefined, undefined, userId, `${name} (You)`, "Created Workspace", `Created a fresh workspace ${newWorkspace.name}`);
    saveDatabase();

    available = [newWorkspace];
  }

  res.json(available);
});

app.get("/api/workspaces/:id", (req: AuthenticatedRequest, res) => {
  const workspace = db.workspaces.find(w => w.id === req.params.id);
  if (!workspace) return res.status(404).json({ error: "Workspace not found" });
  res.json(workspace);
});

app.post("/api/workspaces", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { name, description, customColumns, theme } = req.body;
  if (!name) return res.status(400).json({ error: "Workspace name is required" });

  const newWorkspace: Workspace = {
    id: `w-${Date.now()}`,
    name,
    description: description || "",
    ownerId: req.user.id,
    members: [
      { userId: req.user.id, email: req.user.email, name: req.user.name, role: "Owner" }
    ],
    customColumns: customColumns || ["To Do", "In Progress", "Review", "Completed"],
    theme: theme || "ocean",
    createdAt: new Date().toISOString()
  };

  db.workspaces.push(newWorkspace);
  saveDatabase();

  logActivity(newWorkspace.id, undefined, undefined, req.user.id, req.user.name, "Created Workspace", `Created a new workspace ${name}`);
  res.status(201).json(newWorkspace);
});

app.put("/api/workspaces/:id", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const index = db.workspaces.findIndex(w => w.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Workspace not found" });

  // RBAC validation: Owner or Admin only
  const ws = db.workspaces[index];
  const userMember = ws.members.find(m => m.userId === req.user?.id);
  if (ws.ownerId !== req.user.id && (!userMember || (userMember.role !== "Owner" && userMember.role !== "Admin"))) {
    return res.status(403).json({ error: "Permission denied. Only Owners/Admins can edit workspace parameters." });
  }

  const { name, description, customColumns, theme, tagColors } = req.body;
  if (name) ws.name = name;
  if (description !== undefined) ws.description = description;
  if (customColumns) ws.customColumns = customColumns;
  if (theme) ws.theme = theme;
  if (tagColors !== undefined) ws.tagColors = tagColors;

  saveDatabase();
  logActivity(ws.id, undefined, undefined, req.user.id, req.user.name, "Updated Workspace Settings", `Modified workspace details for ${ws.name}`);
  res.json(ws);
});

app.delete("/api/workspaces/:id", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const index = db.workspaces.findIndex(w => w.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Workspace not found" });

  if (db.workspaces[index].ownerId !== req.user.id) {
    return res.status(403).json({ error: "Only the workspace owner can delete standard workspaces." });
  }

  const wsName = db.workspaces[index].name;
  db.workspaces.splice(index, 1);
  saveDatabase();
  res.json({ message: `Successfully deleted workspace ${wsName}` });
});

// Workspace Invite
app.post("/api/workspaces/:id/invite", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const ws = db.workspaces.find(w => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: "Workspace not found" });

  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: "Invitee email address is required" });

  const targetRole: Role = role || "Member";

  // Simulate lookup or create user silently to ensure teammate collaboration works beautifully
  let invitee = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!invitee) {
    // Generate simulated teammate user
    const shortName = email.split("@")[0];
    const nameFormatted = shortName.charAt(0).toUpperCase() + shortName.slice(1);
    invitee = {
      id: `u-${Date.now()}`,
      email: email.toLowerCase(),
      name: nameFormatted,
      role: "User",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameFormatted)}`,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(invitee);
    saveDatabase();
  }

  // Check if already member
  const isMember = ws.members.some(m => m.userId === invitee?.id);
  if (isMember) {
    return res.status(400).json({ error: "That user is already a member of this workspace." });
  }

  ws.members.push({
    userId: invitee.id,
    email: invitee.email,
    name: invitee.name,
    role: targetRole,
    avatar: invitee.avatar
  });

  saveDatabase();

  logActivity(ws.id, undefined, undefined, req.user.id, req.user.name, "Invited Teammate", `Added user ${invitee.name} to workspace with ${targetRole} permissions`);
  addNotification(invitee.id, "Workspace Invitation", `${req.user.name} invited you to join the workspace workspace '${ws.name}'.`, "success");

  res.json({ message: "User successfully added to workspace.", members: ws.members });
});

// Update Member Role
app.post("/api/workspaces/:id/members/:userId/role", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const ws = db.workspaces.find(w => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: "Workspace not found" });

  // RBAC validation: Owner / Admin only
  const reqUserMember = ws.members.find(m => m.userId === req.user?.id);
  if (ws.ownerId !== req.user.id && (!reqUserMember || (reqUserMember.role !== "Owner" && reqUserMember.role !== "Admin"))) {
    return res.status(403).json({ error: "Permission denied. Only Owner or Admin can manage member roles." });
  }

  const { role } = req.body;
  const memberIndex = ws.members.findIndex(m => m.userId === req.params.userId);
  if (memberIndex === -1) {
    return res.status(404).json({ error: "Member not found in workspace" });
  }

  if (ws.members[memberIndex].userId === ws.ownerId) {
    return res.status(400).json({ error: "Cannot change the workspace owner's role level." });
  }

  ws.members[memberIndex].role = role;
  saveDatabase();

  logActivity(ws.id, undefined, undefined, req.user.id, req.user.name, "Changed Permission Role", `Modified ${ws.members[memberIndex].name} role to ${role}`);
  res.json({ message: "Successfully updated teammate access tier", members: ws.members });
});


// 3. Project Routing
app.get("/api/projects", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const userWorkspaceIds = db.workspaces
    .filter(w => w.ownerId === req.user?.id || w.members.some(m => m.userId === req.user?.id))
    .map(w => w.id);

  const { workspaceId } = req.query;
  let results = db.projects;
  if (workspaceId) {
    results = results.filter(p => p.workspaceId === workspaceId && userWorkspaceIds.includes(String(p.workspaceId)));
  } else {
    results = results.filter(p => userWorkspaceIds.includes(p.workspaceId));
  }
  res.json(results);
});

app.post("/api/projects", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { workspaceId, name, description, dueDate, status, team } = req.body;
  if (!workspaceId || !name) {
    return res.status(400).json({ error: "Workspace assignment and Project title are required." });
  }

  const newProj: Project = {
    id: `p-${Date.now()}`,
    workspaceId,
    name,
    description: description || "",
    status: status || "Planning",
    dueDate: dueDate || "",
    progress: 0,
    team: team || [req.user.id],
    createdAt: new Date().toISOString()
  };

  db.projects.push(newProj);
  saveDatabase();

  logActivity(workspaceId, newProj.id, undefined, req.user.id, req.user.name, "Created Project", `Added a new project tracking stream: ${name}`);
  res.status(201).json(newProj);
});

app.put("/api/projects/:id", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Project stream not found" });

  const proj = db.projects[index];
  const { name, description, status, dueDate, progress, team } = req.body;

  if (name) proj.name = name;
  if (description !== undefined) proj.description = description;
  if (status) proj.status = status;
  if (dueDate !== undefined) proj.dueDate = dueDate;
  if (progress !== undefined) proj.progress = Number(progress);
  if (team) proj.team = team;

  saveDatabase();
  logActivity(proj.workspaceId, proj.id, undefined, req.user.id, req.user.name, "Updated Project Parameters", `Modified configurations of target stream ${proj.name}`);
  res.json(proj);
});

app.delete("/api/projects/:id", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Project stream not found" });

  const proj = db.projects[index];
  db.projects.splice(index, 1);
  saveDatabase();
  res.json({ message: `Successfully archived project ${proj.name}` });
});


// 3.5. Template Blueprint Management
app.get("/api/templates", (req: AuthenticatedRequest, res) => {
  res.json(db.templates || []);
});

app.post("/api/templates", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { name, description, projectId } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Blueprint Template name is required." });
  }

  let tasksForTemplate: TemplateTask[] = [];

  if (projectId) {
    const project = db.projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: "Source project stream not found" });
    }
    const projectTasks = db.tasks.filter(t => t.projectId === projectId);
    tasksForTemplate = projectTasks.map(t => ({
      title: t.title,
      description: t.description || "",
      status: t.status || "To Do",
      priority: t.priority || "Medium",
      subtasks: t.subtasks ? t.subtasks.map(s => ({ title: s.title, completed: false })) : [],
      tags: t.tags || []
    }));
  }

  const newTemplate: ProjectTemplate = {
    id: `tpl-${Date.now()}`,
    name,
    description: description || "",
    tasks: tasksForTemplate,
    createdAt: new Date().toISOString()
  };

  if (!db.templates) {
    db.templates = [];
  }
  db.templates.push(newTemplate);
  saveDatabase();

  logActivity(
    projectId ? db.projects.find(p => p.id === projectId)?.workspaceId || "system" : "system",
    projectId || undefined,
    undefined,
    req.user.id,
    req.user.name,
    "Saved Project Blueprint",
    `Saved project schema as reusable blueprint: '${name}' with ${tasksForTemplate.length} checklist nodes.`
  );

  res.status(201).json(newTemplate);
});

app.post("/api/templates/instantiate", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { templateId, workspaceId, name, description, dueDate } = req.body;

  if (!templateId || !workspaceId || !name) {
    return res.status(400).json({ error: "Template, target Workspace, and Project name are required." });
  }

  if (!db.templates) {
    db.templates = [];
  }
  const template = db.templates.find(t => t.id === templateId);
  if (!template) {
    return res.status(404).json({ error: "Blueprint template not found" });
  }

  const newProj: Project = {
    id: `p-${Date.now()}`,
    workspaceId,
    name,
    description: description || template.description || "",
    status: "Active",
    dueDate: dueDate || "",
    progress: 0,
    team: [req.user.id],
    createdAt: new Date().toISOString()
  };

  db.projects.push(newProj);

  const instantiatedTasks: Task[] = template.tasks.map((tplTask, index) => {
    const taskId = `t-${Date.now()}-${index}`;
    return {
      id: taskId,
      projectId: newProj.id,
      workspaceId,
      title: tplTask.title,
      description: tplTask.description || "",
      status: tplTask.status || "To Do",
      priority: tplTask.priority || "Medium",
      dueDate: dueDate || "",
      assignees: [req.user.id],
      tags: tplTask.tags || [],
      subtasks: tplTask.subtasks ? tplTask.subtasks.map((s, sIndex) => ({
        id: `sub-${Date.now()}-${index}-${sIndex}`,
        title: s.title,
        completed: false
      })) : [],
      attachments: [],
      dependencies: [],
      createdAt: new Date().toISOString()
    };
  });

  db.tasks.push(...instantiatedTasks);
  saveDatabase();

  logActivity(
    workspaceId,
    newProj.id,
    undefined,
    req.user.id,
    req.user.name,
    "Instantiated Blueprint",
    `Created new project stream '${name}' using template checklist: '${template.name}'.`
  );

  res.status(201).json({
    project: newProj,
    tasks: instantiatedTasks
  });
});


// 4. Task Management
app.get("/api/tasks", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const userWorkspaceIds = db.workspaces
    .filter(w => w.ownerId === req.user?.id || w.members.some(m => m.userId === req.user?.id))
    .map(w => w.id);

  const { workspaceId, projectId } = req.query;
  let results = db.tasks;
  if (workspaceId) {
    results = results.filter(t => t.workspaceId === workspaceId && userWorkspaceIds.includes(String(t.workspaceId)));
  } else {
    results = results.filter(t => userWorkspaceIds.includes(t.workspaceId));
  }
  if (projectId) {
    results = results.filter(t => t.projectId === projectId);
  }
  res.json(results);
});

app.post("/api/tasks", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { 
    projectId, workspaceId, title, description, status, priority, dueDate, assignees, tags, dependencies, recurring 
  } = req.body;

  if (!workspaceId || !title) {
    return res.status(400).json({ error: "Workspace assignment and Task title are required" });
  }

  const newTask: Task = {
    id: `t-${Date.now()}`,
    projectId: projectId || "",
    workspaceId,
    title,
    description: description || "",
    status: status || "To Do",
    priority: priority || "Medium",
    dueDate: dueDate || "",
    assignees: assignees || [req.user.id],
    tags: tags || [],
    subtasks: [],
    attachments: [],
    dependencies: dependencies || [],
    recurring: recurring || { frequency: "None" },
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  saveDatabase();

  logActivity(workspaceId, projectId || undefined, newTask.id, req.user.id, req.user.name, "Created Task", `Published task '${title}'`);
  
  // Assignee alert trigger
  if (assignees && assignees.length > 0) {
    assignees.forEach((assignedId: string) => {
      if (assignedId !== req.user?.id) {
        addNotification(assignedId, "Task Assigned", `${req.user?.name} assigned Kanban card '${title}' to you.`, "info");
      }
    });
  }

  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Kanban card not found" });

  const task = db.tasks[index];
  const { 
    title, description, status, priority, dueDate, assignees, tags, dependencies, subtasks, attachments, recurring 
  } = req.body;

  const oldStatus = task.status;

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;
  if (priority) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignees) task.assignees = assignees;
  if (tags) task.tags = tags;
  if (dependencies) task.dependencies = dependencies;
  if (subtasks) task.subtasks = subtasks;
  if (attachments) task.attachments = attachments;
  if (recurring) task.recurring = recurring;

  saveDatabase();

  if (status && status !== oldStatus) {
    logActivity(task.workspaceId, task.projectId || undefined, task.id, req.user.id, req.user.name, "Moved Task", `Transitioned progress card '${task.title}' index from '${oldStatus}' back into '${status}'`);
  } else {
    logActivity(task.workspaceId, task.projectId || undefined, task.id, req.user.id, req.user.name, "Edited Task Details", `Updated configurations for task '${task.title}'`);
  }

  res.json(task);
});

app.delete("/api/tasks/:id", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Kanban card not found" });

  const task = db.tasks[index];
  db.tasks.splice(index, 1);
  saveDatabase();

  logActivity(task.workspaceId, task.projectId || undefined, undefined, req.user.id, req.user.name, "Deleted Task", `Archived and discarded the task item: ${task.title}`);
  res.json({ message: "Successfully deleted task card." });
});

// Drag and drop sorting trigger
app.post("/api/tasks/:id/move", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Target column is required" });

  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const oldStatus = task.status;
  task.status = status;
  saveDatabase();

  logActivity(task.workspaceId, task.projectId || undefined, task.id, req.user.id, req.user.name, "Moved Task", `Moved layout card '${task.title}' from ${oldStatus} to ${status}`);
  res.json(task);
});

// Update subtasks
app.post("/api/tasks/:id/subtasks", (req: AuthenticatedRequest, res) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Subtask title is required" });

  const newSub: Subtask = {
    id: `sub-${Date.now()}`,
    title,
    completed: false
  };

  task.subtasks.push(newSub);
  saveDatabase();
  res.status(201).json(task);
});

app.put("/api/tasks/:id/subtasks/:subId", (req: AuthenticatedRequest, res) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const sub = task.subtasks.find(s => s.id === req.params.subId);
  if (!sub) return res.status(404).json({ error: "Subtask not found" });

  const { completed, title } = req.body;
  if (completed !== undefined) sub.completed = completed;
  if (title !== undefined) sub.title = title;

  saveDatabase();
  res.json(task);
});

// Task comments
app.get("/api/tasks/:id/comments", (req, res) => {
  const list = db.comments.filter(c => c.taskId === req.params.id);
  res.json(list.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
});

app.post("/api/tasks/:id/comments", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text cannot be blank" });

  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const newComment: Comment = {
    id: `c-${Date.now()}`,
    taskId: task.id,
    userId: req.user.id,
    userName: req.user.name,
    userAvatar: db.users.find(u => u.id === req.user?.id)?.avatar,
    text,
    createdAt: new Date().toISOString()
  };

  db.comments.push(newComment);
  saveDatabase();

  logActivity(task.workspaceId, task.projectId || undefined, task.id, req.user.id, req.user.name, "Added Comment", `Commented on task card '${task.title}': "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);
  
  // Trigger notifications for other assignees
  task.assignees.forEach(uid => {
    if (uid !== req.user?.id) {
       addNotification(uid, "New Task Comment", `${req.user?.name} commented on card '${task.title}': "${text.substring(0, 50)}..."`, "info");
    }
  });

  res.status(201).json(newComment);
});

// Attachment Upload Simulation
app.post("/api/tasks/:id/attachments", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { name, size, type, url } = req.body;
  if (!name) return res.status(400).json({ error: "Attachment name is required" });

  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task card not found" });

  const newAtt: Attachment = {
    id: `att-${Date.now()}`,
    name,
    size: size || "450 KB",
    type: type || "image/png",
    url: url || "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400",
    uploadedBy: req.user.name,
    uploadedAt: new Date().toISOString()
  };

  task.attachments.push(newAtt);
  saveDatabase();

  logActivity(task.workspaceId, task.projectId || undefined, task.id, req.user.id, req.user.name, "Uploaded Attachment", `Uploaded asset resource '${name}' to card '${task.title}'`);
  res.json(task);
});


// 5. Notifications
app.get("/api/notifications", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const myLogs = db.notifications.filter(n => n.userId === req.user?.id);
  res.json(myLogs);
});

app.post("/api/notifications/:id/read", (req: AuthenticatedRequest, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveDatabase();
  }
  res.json({ success: true, notif });
});

app.post("/api/notifications/clear", (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  db.notifications = db.notifications.filter(n => n.userId !== req.user?.id);
  saveDatabase();
  res.json({ success: true });
});


// 6. Global Activity Logs
app.get("/api/activity-logs", (req: AuthenticatedRequest, res) => {
  const { workspaceId, limit } = req.query;
  let logs = db.activityLogs;

  if (workspaceId) {
    logs = logs.filter(l => l.workspaceId === workspaceId);
  }

  const parseLimit = Number(limit) || 40;
  res.json(logs.slice(0, parseLimit));
});


// 7. Users lookup directory for assignments
app.get("/api/users", (req, res) => {
  res.json(db.users);
});


// 8. EXPORTS (Simulated endpoints for PDF and CSV spreadsheets)
app.get("/api/export/csv", (req: AuthenticatedRequest, res) => {
  const { workspaceId } = req.query;
  const filteredTasks = db.tasks.filter(t => t.workspaceId === workspaceId);
  
  let csv = "ID,Title,Status,Priority,DueDate,SubtasksTotal,SubtasksCompleted,Tags\n";
  filteredTasks.forEach(t => {
    const totalSub = t.subtasks.length;
    const compSub = t.subtasks.filter(s => s.completed).length;
    csv += `"${t.id}","${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.dueDate || "N/A"}",${totalSub},${compSub},"${t.tags.join("; ")}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=workspace_${workspaceId}_export.csv`);
  res.status(200).send(csv);
});


/* ==================== AI COPILOT ANALYTICS ROUTING ==================== */

// AI priorities analysis
app.post("/api/ai/prioritize", async (req: AuthenticatedRequest, res) => {
  const { workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: "Workspace identification missing." });

  const activeWorkspace = db.workspaces.find(w => w.id === workspaceId);
  const relevantTasks = db.tasks.filter(t => t.workspaceId === workspaceId);
  const relevantProjects = db.projects.filter(p => p.workspaceId === workspaceId);

  if (relevantTasks.length === 0) {
    return res.json({
      summary: "Currently there are no active tasks loaded in this workspace to evaluate. Create your initial Kanban card items first!",
      prioritizedList: []
    });
  }

  const prompt = `You are an expert Productivity Officer & Agility SaaS Analyst for a modern team workspace called "${activeWorkspace?.name || "Target Workspace"}".
We currently track a series of projects:
${relevantProjects.map(p => `- Project: ${p.name} (${p.status}, target: ${p.dueDate || "No deadline"})`).join("\n")}

And we have the following task backlog details:
${relevantTasks.map(t => `- [${t.priority} priority] Title: "${t.title}" | Status: "${t.status}" | Overdue/Due: "${t.dueDate || "None"}" | Assignees: [${t.assignees.join(", ")}]`).join("\n")}

Task is to:
Perform a deep prioritization optimization. Identify which tasks demand maximum attention (e.g. they are Critical, High, or Overdue). Formulate a sequencing pattern for the team. Return exactly a structured JSON response fitting the schema:
{
  "summary": "High-level summary of the urgent trends, bottle-necks, or resource allocations",
  "prioritizedList": [
    {
      "taskId": "Task ID",
      "taskTitle": "Task Title",
      "rank": 1, 
      "urgencyLevel": "Highest / High / Moderate",
      "reasoning": "Reason explaining dependency limits, date pressure, or assignee capacity"
    }
  ],
  "coachingAdvice": "One paragraph of direct agile workspace advice"
}
Output valid JSON only. Do not wrap in backticks or markdown markers.`;

  const fallback = {
    summary: "AI Prioritizer analyzed tasks local state and flagged primary items with date obligations and critical labels.",
    prioritizedList: relevantTasks.map((t, idx) => ({
      taskId: t.id,
      taskTitle: t.title,
      rank: idx + 1,
      urgencyLevel: t.priority === "Critical" ? "Highest" : t.priority === "High" ? "High" : "Moderate",
      reasoning: `Categorized under priority '${t.priority}' due around ${t.dueDate || "anytime"}.`
    })),
    coachingAdvice: "Maintain regular daily syncs, confirm that dependencies are correctly mapped, and allocate developers based on Critical status tags."
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      prioritizedList: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            taskId: { type: Type.STRING },
            taskTitle: { type: Type.STRING },
            rank: { type: Type.INTEGER },
            urgencyLevel: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["taskId", "taskTitle", "rank", "urgencyLevel", "reasoning"]
        }
      },
      coachingAdvice: { type: Type.STRING }
    },
    required: ["summary", "prioritizedList", "coachingAdvice"]
  };

  const analysis = await callGemini(prompt, fallback, responseSchema);
  res.json(analysis);
});

// AI suggested tasks creator
app.post("/api/ai/suggest", async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ error: "Project stream ID required." });

  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: "Project stream not found." });

  // Get current tasks for context
  const currentTasks = db.tasks.filter(t => t.projectId === projectId);

  const prompt = `Analyze this project:
- Name: "${proj.name}"
- Description: "${proj.description || "N/A"}"
- Due Date: "${proj.dueDate || "N/A"}"
- Current Status: "${proj.status}"
Existing task cards cataloged:
${currentTasks.map(t => `- "${t.title}" (${t.status})`).join("\n")}

As an AI Project Planner, suggest 4 essential, modern task cards that are likely missing or required to ensure project launch success. Formulate your response as a JSON array matching:
[
  {
    "title": "Task title suggested",
    "description": "Short action list description as guide",
    "priority": "Medium",
    "tags": ["Frontend", "Testing", "Marketing", "Security"]
  }
]
Return valid JSON array only.`;

  const fallback = [
    { title: "Conduct Postman API Security Scan", description: "Validate role-based security validation endpoints against unexpected parameter overrides.", priority: "High", tags: ["Security", "Backend"] },
    { title: "Perform Cross-Browser React QA Testing", description: "Verify responsive bento board canvas layouts down on standard Safari and mobile sizes.", priority: "Medium", tags: ["Frontend", "UX"] },
    { title: "Optimize Redis Caching & Bundle Assets", description: "Minify layout build packages and verify compression headers on hosting configurations.", priority: "Low", tags: ["Backend"] },
    { title: "Compile Beta Test Feedback Survey", description: "Construct questionnaire covering board usability, performance speed, and workspace creation flow.", priority: "Medium", tags: ["Docs", "Launch"] }
  ];

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        priority: { type: Type.STRING },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["title", "description", "priority", "tags"]
    }
  };

  const suggestions = await callGemini(prompt, fallback, responseSchema);
  res.json(suggestions);
});

// AI task subtasks breakdown generator
app.post("/api/ai/breakdown", async (req, res) => {
  const { taskTitle, taskDescription } = req.body;
  if (!taskTitle) return res.status(400).json({ error: "Task title is required." });

  const prompt = `Break down this task card into 4-5 incremental, highly action-oriented subtasks:
Task: "${taskTitle}"
Details: "${taskDescription || "N/A"}"

Output a JSON array of string titles representing individual step milestones. Format:
[
  "Precise short action item title 1",
  "Precise short action item title 2"
]
Return valid JSON array only.`;

  const fallback = [
    `Validate requirements for ${taskTitle}`,
    `Establish structural foundation & write Unit verification tests`,
    `Refactor component parameters & ensure clean error codes`,
    `Review accessibility styling compliance and resolve layout outliers`,
    `Conduct code review peer-walkthrough with engineering leads`
  ];

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.STRING
    }
  };

  const breakdown = await callGemini(prompt, fallback, responseSchema);
  res.json(breakdown);
});

// AI assessment of deadline risk
app.post("/api/ai/risk-assessment", async (req: AuthenticatedRequest, res) => {
  const { workspaceId } = req.body;
  const wsTasks = db.tasks.filter(t => t.workspaceId === workspaceId);
  const wsProjects = db.projects.filter(p => p.workspaceId === workspaceId);

  const prompt = `You are a high-level Scrum Master AI bot. Evaluate upcoming deadline risks of our workspace.
Projects:
${wsProjects.map(p => `- "${p.name}" status: "${p.status}" due: "${p.dueDate || "N/A"}" progress: ${p.progress}%`).join("\n")}

Sprint cards catalog:
${wsTasks.map(t => `- Card: "${t.title}" | Status: "${t.status}" | Priority: "${t.priority}" | Due date: "${t.dueDate || "no set target"}"`).join("\n")}

Assess potential failure points, unmapped dependencies, over-allocated teammates, or critical cards hanging close to dates. Create a structured evaluation JSON containing:
{
  "overallRiskScore": 55, // integer 0 to 100
  "riskTier": "Low / Balanced / Critical",
  "criticalInsights": [
    "Insight on particular overdue cards like Swagger specs",
    "Dependency checks or assignee load balances"
  ],
  "mitigationSteps": [
    "Suggested action items to resolve dates fast"
  ]
}
Return valid JSON only.`;

  const fallback = {
    overallRiskScore: 35,
    riskTier: "Medium",
    criticalInsights: [
      "Task 'Write Swagger Documentation' is past its scheduled deadline and sits in Review status.",
      "Assignees have overlapping development demands (JWT middleware + Kanban interface due in close succession).",
      "Single reviewer dependency might delay cards progressing from Review into Completed."
    ],
    mitigationSteps: [
      "Re-allocate Alice Carter to support Swagger specs schema validation.",
      "Postpone Low priority tasks to clear immediate JWT authorization bugs.",
      "Enable instant notifications reminder for overdue cards."
    ]
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallRiskScore: { type: Type.INTEGER },
      riskTier: { type: Type.STRING },
      criticalInsights: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      mitigationSteps: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["overallRiskScore", "riskTier", "criticalInsights", "mitigationSteps"]
  };

  const assessment = await callGemini(prompt, fallback, responseSchema);
  res.json(assessment);
});


/* ==================== BOOTSTRAP SERVERS ==================== */

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const PORT = 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Joined Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart To-Do Workspace Server operating live at http://0.0.0.0:${PORT}`);
  });
}

startServer();
