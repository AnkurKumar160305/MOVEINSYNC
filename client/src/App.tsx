import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
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
      </div>
    </BrowserRouter>
  );
};

export default App;
