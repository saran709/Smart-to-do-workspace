import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus, User, FileText, CheckCircle2 
} from "lucide-react";
import { Task, Project } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  activeWorkspaceId: string | null;
}

export default function CalendarView({ tasks, projects, activeWorkspaceId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 17)); // Initialize in June 2026 for alignment with sample dates
  const [calendarMode, setCalendarMode] = useState<"month" | "week" | "day">("month");

  // Get active workspace tasks
  const wsTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId && t.dueDate);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const nextDate = new Date(currentDate);
    if (calendarMode === "month") {
      nextDate.setMonth(currentDate.getMonth() - 1);
    } else if (calendarMode === "week") {
      nextDate.setDate(currentDate.getDate() - 7);
    } else {
      nextDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentDate);
    if (calendarMode === "month") {
      nextDate.setMonth(currentDate.getMonth() + 1);
    } else if (calendarMode === "week") {
      nextDate.setDate(currentDate.getDate() + 7);
    } else {
      nextDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  const getMonthName = () => {
    return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Helper arrays for drawing calendars
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Monthly logic list Days
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalMonthDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const daysArray = [];

    // Prior Month Fill
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArray.push({
        day: prevMonthDays - i,
        isOtherMonth: true,
        dateString: new Date(year, month - 1, prevMonthDays - i).toISOString().split("T")[0]
      });
    }

    // Active Month Fill
    for (let i = 1; i <= totalMonthDays; i++) {
      daysArray.push({
        day: i,
        isOtherMonth: false,
        dateString: new Date(year, month, i).toISOString().split("T")[0]
      });
    }

    // Next Month Fill
    const remainingSlots = 42 - daysArray.length;
    for (let i = 1; i <= remainingSlots; i++) {
      daysArray.push({
        day: i,
        isOtherMonth: true,
        dateString: new Date(year, month + 1, i).toISOString().split("T")[0]
      });
    }

    return daysArray;
  };

  const days = generateMonthDays();

  // Weekly logic list Days (centered around currentDate)
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    const weekArray = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      weekArray.push({
        day: nextDay.getDate(),
        name: weekdays[i],
        dateString: nextDay.toISOString().split("T")[0]
      });
    }
    return weekArray;
  };

  const weekDays = generateWeekDays();

  // Highlight check
  const isToday = (dateStr: string) => {
    return dateStr === "2026-06-17"; // align with current test date
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden select-none">
      
      {/* Header View Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-850 dark:text-white flex items-center gap-2">
            <span>Workspace Schedule Tracker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono font-medium tracking-wide">
              Timeline view
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Map upcoming task due dates, milestones deadlines, and coordinated releases in absolute real-time calendar grids.
          </p>
        </div>

        {/* Navigation, Date labels, and modes control */}
        <div className="flex items-center flex-wrap gap-3">
          
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-xs gap-1 font-semibold">
            {(["month", "week", "day"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all
                  ${calendarMode === mode 
                    ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg transition-colors border border-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-white px-2 font-mono min-w-[110px] text-center uppercase tracking-wide">
              {getMonthName()}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* MONTHLY CALENDAR GRID */}
      {calendarMode === "month" && (
        <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          
          {/* Weekday indicator lines */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-center font-mono">
            {weekdays.map(d => (
              <div key={d} className="py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Days grids */}
          <div className="grid grid-cols-7 flex-grow divide-x divide-y divide-slate-150 dark:divide-slate-805 bg-slate-100/10 dark:bg-slate-950/20">
            {days.map((item, index) => {
              const activeDayTasks = wsTasks.filter(t => t.dueDate === item.dateString);
              return (
                <div 
                  key={index} 
                  className={`min-h-[90px] p-2 flex flex-col gap-1 hover:bg-slate-50/50 dark:hover:bg-slate-900/15 transition-colors relative
                    ${item.isOtherMonth ? "text-slate-350 dark:text-slate-700 bg-slate-50/30 dark:bg-slate-900/10" : "text-slate-800 dark:text-slate-200"}
                    ${isToday(item.dateString) ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""}`}
                >
                  <div className="flex justify-between items-center px-1">
                    <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md
                      ${isToday(item.dateString) ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-bold" : ""}`}>
                      {item.day}
                    </span>
                    {activeDayTasks.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  {/* Tasks scheduled items list */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-1 mt-1 pr-0.5 max-h-[70px]">
                    {activeDayTasks.slice(0, 3).map(task => (
                      <div 
                        key={task.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-normal truncate border
                          ${task.priority === "Critical" ? "bg-rose-50 text-rose-700 border-rose-205/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40" : 
                            task.priority === "High" ? "bg-amber-50 text-amber-700 border-amber-205/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40" : 
                            "bg-indigo-50 text-indigo-700 border-indigo-205/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/40"}`}
                        title={task.title}
                      >
                        {task.status === "Completed" ? "✓" : "•"} {task.title}
                      </div>
                    ))}
                    {activeDayTasks.length > 3 && (
                      <span className="text-[8px] text-slate-400 italic text-right font-mono pr-0.5">
                        +{activeDayTasks.length - 3} tasks more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* WEEKLY CALENDAR VIEW */}
      {calendarMode === "week" && (
        <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-4 flex flex-col overflow-y-auto shadow-sm">
          <div className="grid grid-cols-7 divide-x divide-slate-150 dark:divide-slate-805 text-left h-full">
            {weekDays.map(item => {
              const activeDayTasks = wsTasks.filter(t => t.dueDate === item.dateString);
              return (
                <div 
                  key={item.dateString} 
                  className={`p-3.5 flex flex-col gap-3 min-h-[400px] h-full transition-colors relative
                    ${isToday(item.dateString) ? "bg-indigo-50/10 dark:bg-indigo-950/10" : ""}`}
                >
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2 flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase font-bold">{item.name}</span>
                    <span className={`text-md font-extrabold font-mono font-sans mt-0.5
                      ${isToday(item.dateString) ? "text-indigo-600 dark:text-indigo-400 text-lg font-black" : "text-slate-600 dark:text-slate-450"}`}>
                      {item.day}
                    </span>
                  </div>

                  <div className="flex-grow flex flex-col gap-2.5 overflow-y-auto">
                    {activeDayTasks.map(task => (
                      <div 
                        key={task.id}
                        className={`p-2.5 rounded-xl border text-[11px] leading-snug flex flex-col gap-1 hover:shadow-sm transition-shadow
                          ${task.priority === "Critical" ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/60" :
                            task.priority === "High" ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/60" :
                            "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/60"}`}
                      >
                        <span className="text-[8px] font-bold font-mono uppercase tracking-wider text-slate-400 leading-none">
                          {task.status}
                        </span>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{task.title}</h4>
                        {task.description && (
                          <p className="text-[9px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                        )}
                      </div>
                    ))}
                    {activeDayTasks.length === 0 && (
                      <div className="h-full flex items-center justify-center border border-dashed border-slate-100 dark:border-slate-850/60 rounded-xl p-4 text-center text-slate-350 dark:text-slate-600 italic text-[10px]">
                        Free schedule
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY VIEW GRID COLUMN */}
      {calendarMode === "day" && (
        <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm overflow-y-auto">
          
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-slate-105 dark:border-slate-805/85 pb-4 md:pb-0 md:pr-6 flex flex-col gap-2.5">
            <span className="text-xl font-bold text-slate-805 dark:text-white font-mono">
              Wednesday, June 17, 2026
            </span>
            <p className="text-xs text-slate-400 font-sans tracking-wide leading-relaxed">
              Targeted due tasks, active meetings syncing, and compliance milestones scheduled for this sprint day.
            </p>

            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-150 dark:border-slate-805 flex flex-col gap-2 shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">Metrics Tracker Today</span>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">🟢 Completed:</span>
                <span className="text-slate-800 dark:text-white font-bold">{wsTasks.filter(t => t.dueDate === "2026-06-17" && t.status === "Completed").length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">🟡 Total Tasks:</span>
                <span className="text-slate-800 dark:text-white font-bold">{wsTasks.filter(t => t.dueDate === "2026-06-17").length}</span>
              </div>
            </div>
          </div>

          <div className="flex- grow flex-1 flex flex-col gap-3.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider font-sans border-b dark:border-slate-800 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Coordinated Due Tasks ({wsTasks.filter(t => t.dueDate === "2026-06-17").length})
            </h3>

            <div className="flex flex-col gap-3">
              {wsTasks.filter(t => t.dueDate === "2026-06-17").map(task => (
                <div 
                  key={task.id}
                  className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl block text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono bg-indigo-50 dark:bg-indigo-950 font-bold tracking-widest text-indigo-600 px-2.5 py-0.5 rounded-full">
                      {task.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Priority: {task.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-sans text-slate-805 dark:text-white mt-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {task.tags.map(tg => (
                        <span key={tg} className="text-[8px] font-mono px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded text-slate-500 uppercase tracking-wider">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {wsTasks.filter(t => t.dueDate === "2026-06-17").length === 0 && (
                <div className="text-center p-8 border border-dashed border-slate-150 dark:border-slate-850 rounded-2xl text-slate-400 italic text-xs">
                  No deadlines mapped to this date. Keep up the high delivery!
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
