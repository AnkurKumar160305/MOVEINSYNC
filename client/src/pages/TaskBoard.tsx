import React, { useEffect, useState } from 'react';
import {
  Kanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Code,
  Activity,
  Layers,
} from 'lucide-react';
import { pulseApi } from '../api/client';
import { ITask, TaskStatus, PriorityLevel } from '../types';
import { Badge } from '../components/common/Badge';

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('P1');
  const [newTaskEffort, setNewTaskEffort] = useState<'small' | 'medium' | 'large'>('medium');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await pulseApi.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await pulseApi.updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.taskId === taskId ? { ...t, status: newStatus } : t))
      );
      if (selectedTask?.taskId === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const created = await pulseApi.createTask({
        taskId: `TASK-${Date.now().toString().slice(-4)}`,
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        effort: newTaskEffort,
        status: 'backlog',
      });
      setTasks((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const [mobileActiveLane, setMobileActiveLane] = useState<string>('all');

  const columns: { id: TaskStatus; label: string; dotColor: string }[] = [
    { id: 'backlog', label: 'Sprint Backlog', dotColor: 'bg-indigo-400' },
    { id: 'in_progress', label: 'In Progress (Active Dev)', dotColor: 'bg-amber-400' },
    { id: 'verification', label: 'Verification / Canary QA', dotColor: 'bg-cyan-400' },
    { id: 'done', label: 'Shipped & Verified', dotColor: 'bg-emerald-400' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Forward Deployed Engineering Task Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sprint-ready engineering tasks linked directly to Play Store customer pain points
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Mobile Lane Selector Tabs (Visible on Android / mobile only) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
        <button
          onClick={() => setMobileActiveLane('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            mobileActiveLane === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          All Lanes ({tasks.length})
        </button>
        {columns.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setMobileActiveLane(col.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                mobileActiveLane === col.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
              <span>{col.label.split(' ')[0]} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading task pipeline...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {columns
            .filter((col) => mobileActiveLane === 'all' || mobileActiveLane === col.id)
            .map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col min-h-[400px] sm:min-h-[550px]"
                >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.taskId}
                        onClick={() => setSelectedTask(task)}
                        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 hover:bg-slate-900 cursor-pointer transition-all space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {task.taskId}
                            </span>
                            <Badge variant="priority" value={task.priority} size="sm" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 capitalize bg-slate-800/80 px-2 py-0.5 rounded">
                            {task.effort} effort
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white leading-snug hover:text-indigo-300 transition-colors">
                          {task.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {task.linkedIssueId && (
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-indigo-400">
                            <span>Linked: {task.linkedIssueId}</span>
                            <span className="text-slate-500 hover:text-slate-300">View details →</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-5 right-5 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400">{selectedTask.taskId}</span>
                <Badge variant="priority" value={selectedTask.priority} />
                <Badge variant="status" value={selectedTask.status} />
                <span className="text-xs text-slate-400 capitalize">Effort: {selectedTask.effort}</span>
              </div>
              <h3 className="text-lg font-bold text-white pt-1">{selectedTask.title}</h3>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 mb-1">User Context & Friction Description</h4>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedTask.description}</p>
            </div>

            {/* Proposed fix */}
            {selectedTask.proposedFix && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40">
                <h4 className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" /> Proposed Technical Fix
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedTask.proposedFix}</p>
              </div>
            )}

            {/* Technical investigation */}
            {selectedTask.technicalInvestigation && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-xs font-semibold text-amber-300 mb-1">Root Cause Investigation Notes</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {selectedTask.technicalInvestigation}
                </p>
              </div>
            )}

            {/* Acceptance Criteria */}
            {selectedTask.acceptanceCriteria && selectedTask.acceptanceCriteria.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Acceptance Criteria (Definition of Done)
                </h4>
                <ul className="space-y-1 text-xs">
                  {selectedTask.acceptanceCriteria.map((ac, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{ac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Observability Requirements */}
            {selectedTask.observabilityRequirements && selectedTask.observabilityRequirements.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Observability & Monitoring
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTask.observabilityRequirements.map((obs, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300"
                    >
                      {obs}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status transition actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Change Status:</span>
              <div className="flex items-center gap-2">
                {columns.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleUpdateStatus(selectedTask.taskId, c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedTask.status === c.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Create Engineering Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Implement ETA smoothing buffer algorithm"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Context / Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail the technical fix and customer problem..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Priority Level</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="P0">P0 (Critical / Hotfix)</option>
                    <option value="P1">P1 (High / Next Release)</option>
                    <option value="P2">P2 (Medium / Backlog)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Effort Size</label>
                  <select
                    value={newTaskEffort}
                    onChange={(e) => setNewTaskEffort(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="small">Small (1-2 days)</option>
                    <option value="medium">Medium (1 week)</option>
                    <option value="large">Large (2+ weeks)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
