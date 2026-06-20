import React, { useState } from "react";
import { motion } from "motion/react";
import { CheckSquare, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { User as UserType } from "../types";

interface LoginProps {
  onLoginSuccess: (user: UserType, token: string) => void;
  darkMode: boolean;
}

export default function Login({ onLoginSuccess, darkMode }: LoginProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("saranramesh709@gmail.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fast track login button
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "saranramesh709@gmail.com", password: "password123" })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login simulation failed");
      }
      setSuccess("Successfully authenticated as developer!");
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        setIsLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setIsLoading(false);
    }
  };

  // Submit signin or signup form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const url = activeTab === "signin" ? "/api/auth/login" : "/api/auth/register";
    const payload = activeTab === "signin"
      ? { email: email.trim(), password }
      : { email: email.trim(), name: name.trim(), password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setSuccess(activeTab === "signin" ? "Welcome back!" : "Account registered successfully!");
      
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        setIsLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to complete action.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200">
      
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10"
      >
        <div className="p-6 md:p-8 flex flex-col items-center">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">To-Do Workspace</h1>
              <p className="text-[10px] font-mono tracking-widest text-indigo-500 dark:text-indigo-400 uppercase">SaaS Collaboration Platform</p>
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6">
            Sign in to synchronize tasks, sprints, AI copilot insights, and team milestones.
          </p>

          {/* Quick Demo Access banner */}
          <div className="w-full mb-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900 rounded-md text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                  Developer & Tester Access
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Fast-track directly into the admin workspace pre-seeded with active Scrum tasks, sprints, and AI metrics.
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="mt-3 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <span>Sign in as Saran Ramesh (You)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 w-full mb-6">
            <button
              onClick={() => { setActiveTab("signin"); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "signin"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Sign In Account
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "signup"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Register New Profile
            </button>
          </div>

          {/* Error and Success alerts */}
          {error && (
            <div className="w-full mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="w-full mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Core Authn Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            
            {activeTab === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saran Ramesh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading server sequence...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === "signin" ? "Sign In" : "Register and Open Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>
      </motion.div>
    </div>
  );
}
