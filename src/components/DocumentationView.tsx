import React, { useState } from "react";
import { 
  BookOpen, Terminal, Code2, Server, HelpCircle, Copy, Check, FileCode, Layers, Play 
} from "lucide-react";

export default function DocumentationView() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const swaggerSpec = `openapi: 3.0.0
info:
  title: Smart To-Do Workspace SaaS API
  description: Robust API mapping workspaces, projects, Kanban cards, subtasks, real-time activity and Gemini AI utilities.
  version: 1.0.0
servers:
  - url: http://localhost:3000/api
paths:
  /auth/login:
    post:
      summary: Login user and verify credentials
      responses:
        200:
          description: Return simulated JWT authentication token.
  /workspaces:
    get:
      summary: Retrieve all workspaces corresponding to user permissions
    post:
      summary: Instantiate a new workspace with custom columns
  /tasks:
    get:
      summary: Stream active Kanban card backlogs
    post:
      summary: Publish card details
  /ai/prioritize:
    post:
      summary: Execute Gemini AI sequence priority rankings`;

  const dockerfileCode = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

  const dockerComposeCode = `version: '3.8'
services:
  workspace-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: always`;

  const postmanParameters = `{
  "info": {
    "name": "Smart To-Do SaaS Suite",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authenticate Login",
      "request": {
        "method": "POST",
        "url": "{{APP_URL}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"email\\": \\"saranramesh709@gmail.com\\",\\n  \\"password\\": \\"any_password\\"\\n}"
        }
      }
    }
  ]
}`;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto select-none max-w-4xl">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-indigo-650 text-indigo-505 rounded-lg shrink-0">
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </span>
            <span>Developer SaaS Documentation</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono font-medium tracking-wide">
              API Blueprint view
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Audit our compiled Swagger specifications, review local Docker Compose scripts, check Postman schema payload variables, and confirm build guides.
          </p>
        </div>
      </div>

      {/* THREE SECTION GRID COLUMNS LIMIT */}
      <div className="flex flex-col gap-6 text-xs select-none">
        
        {/* Swagger specifications */}
        <div className="p-5 bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-805 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
            <span className="font-sans font-bold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Code2 className="w-4.5 h-4.5 text-indigo-400" /> OpenAPI Swagger specifications (YAML)
            </span>
            <button
              onClick={() => handleCopyText("swagger", swaggerSpec)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-[10px] text-slate-600 dark:text-slate-400 font-semibold rounded flex items-center gap-1 transition-all"
            >
              {copiedId === "swagger" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3" />}
              {copiedId === "swagger" ? "Copied" : "Copy YAML"}
            </button>
          </div>

          <pre className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed text-slate-650 dark:text-slate-400">
            {swaggerSpec}
          </pre>
        </div>

        {/* Postman collection */}
        <div className="p-5 bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-805 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
            <span className="font-sans font-bold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Layers className="w-4.5 h-4.5 text-indigo-400" /> Postman Payload Collection (JSON)
            </span>
            <button
              onClick={() => handleCopyText("postman", postmanParameters)}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-[10px] text-slate-600 dark:text-slate-400 font-semibold rounded flex items-center gap-1 transition-all"
            >
              {copiedId === "postman" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3" />}
              {copiedId === "postman" ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <pre className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed text-slate-650 dark:text-slate-400">
            {postmanParameters}
          </pre>
        </div>

        {/* Dockerfile specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-805 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
              <span className="font-sans font-bold text-slate-850 dark:text-white flex items-center gap-1 text-[11px] uppercase tracking-wider">
                📁 Dockerfile Environment Setup
              </span>
            </div>
            <pre className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-550 dark:text-slate-400">
              {dockerfileCode}
            </pre>
          </div>

          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-805 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
              <span className="font-sans font-bold text-slate-850 dark:text-white flex items-center gap-1 text-[11px] uppercase tracking-wider">
                ⚙️ docker-compose.yml configuration
              </span>
            </div>
            <pre className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-550 dark:text-slate-400">
              {dockerComposeCode}
            </pre>
          </div>

        </div>

        {/* General step execution guide */}
        <div className="p-5 bg-indigo-50/25 dark:bg-slate-900 border border-indigo-200/40 dark:border-indigo-800/40 rounded-2xl flex flex-col gap-3">
          <span className="font-bold text-indigo-700 dark:text-indigo-400 uppercase font-mono tracking-wider">SaaS Deployment Step Operations Guide</span>
          
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5 text-slate-650 dark:text-slate-300">
              <span className="font-bold text-indigo-500 font-mono">1.</span>
              <p>Download the ZIP export bundle file, unzip folder, and open project root in VSCode terminal.</p>
            </div>
            <div className="flex items-start gap-2.5 text-slate-650 dark:text-slate-300">
              <span className="font-bold text-indigo-505 font-mono">2.</span>
              <p>Populate a secure <strong>.env</strong> file at root containing your <code>GEMINI_API_KEY</code>.</p>
            </div>
            <div className="flex items-start gap-2.5 text-slate-650 dark:text-slate-300">
              <span className="font-bold text-indigo-505 font-mono">3.</span>
              <p>Launch services instantly using <code>npm run dev</code> or trigger Docker layers via <code>docker-compose up --build -d</code>.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
