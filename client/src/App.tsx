import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  AlertTriangle,
  Kanban,
  Menu,
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ReviewExplorer } from './pages/ReviewExplorer';
import { IssuesBacklog } from './pages/IssuesBacklog';
import { TaskBoard } from './pages/TaskBoard';
import { Simulator } from './pages/Simulator';
import { AIAssistant } from './pages/AIAssistant';
import { DataManagement } from './pages/DataManagement';
import { ExecutiveReport } from './pages/ExecutiveReport';

export const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <div className="flex flex-1">
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-24 md:pb-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reviews" element={<ReviewExplorer />} />
              <Route path="/issues" element={<IssuesBacklog />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/ask" element={<AIAssistant />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="/report" element={<ExecutiveReport />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Mobile Android / iOS Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Reviews</span>
          </NavLink>

          <NavLink
            to="/issues"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Issues</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Kanban className="w-4 h-4" />
            <span>Tasks</span>
          </NavLink>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-slate-200"
          >
            <Menu className="w-4 h-4" />
            <span>More</span>
          </button>
        </nav>
      </div>
    </BrowserRouter>
  );
};

export default App;
