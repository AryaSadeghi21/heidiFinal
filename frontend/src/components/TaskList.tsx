import { useState, useEffect } from 'react';
import { Plus, ChevronDown, AlertCircle } from 'lucide-react';
import { supabase, Task } from '../lib/supabase';
import TaskDetails from './TaskDetails';
import Diagnosis from './Diagnosis';
import Conditions from './Conditions';
import Allergies from './Allergies';
import Medications from './Medications';
import AnalysisResults from './AnalysisResults';
import { AnalysisResult } from '../lib/api';

interface TaskListProps {
  analysisResult: AnalysisResult | null;
}

export default function TaskList({ analysisResult }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const hasIncompleteTasks = tasks.some(t => !t.completed);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{ title: newTaskTitle, completed: false }]);

    if (error) {
      console.error('Error adding task:', error);
    } else {
      setNewTaskTitle('');
      setIsAddingTask(false);
      fetchTasks();
    }
  };

  const toggleTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed, updated_at: new Date().toISOString() })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setSelectedTask(null);
    }
  };

  if (selectedTask) {
    return (
      <div className="w-96 h-full bg-stone-50 border-l border-stone-200 overflow-y-auto">
        <Diagnosis />
        <Conditions />
        <Allergies />
        <Medications />
        <AnalysisResults result={analysisResult} />
        <TaskDetails
          task={selectedTask}
          onBack={() => setSelectedTask(null)}
          onDelete={() => deleteTask(selectedTask.id)}
        />
      </div>
    );
  }

  return (
    <div className="w-96 h-full bg-stone-50 border-l border-stone-200 overflow-y-auto">
      <Diagnosis />
      <Conditions />
      <Allergies />
      <Medications />
      <AnalysisResults result={analysisResult} />
      <div className="border-b border-stone-200 bg-white">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ChevronDown
              className={`w-5 h-5 text-stone-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
            <h2 className="text-lg font-semibold text-stone-900">Tasks</h2>
            {hasIncompleteTasks && (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className="text-sm text-stone-600 font-medium">
              {completedCount}/{totalCount}
            </span>
          </button>
          {isExpanded && !isAddingTask && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>
          )}
        </div>
      </div>

      {isExpanded && <div className="p-4 space-y-2">
        {isAddingTask && (
          <div className="bg-white rounded-lg border border-stone-200 p-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTask();
                } else if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
              placeholder="Task name"
              className="w-full text-sm text-stone-800 placeholder-stone-400 outline-none"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={addTask}
                className="px-3 py-1 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors"
              >
                Add task
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                className="px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="bg-white rounded-lg border border-stone-200 p-3 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(task);
                }}
                className="mt-0.5 flex-shrink-0"
              >
                {task.completed ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-stone-300 hover:border-stone-400 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-stone-800 text-sm ${
                    task.completed ? 'line-through text-stone-500' : ''
                  }`}
                >
                  {task.title}
                </p>
                {task.warnings && task.warnings.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-amber-600 font-medium">
                      ⚠ {task.warnings.length} warning{task.warnings.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>}

      {isExpanded && <div className="p-4 border-t border-stone-200">
        <p className="text-xs text-stone-500 text-center">
          Stale tasks will be archived in 30 days
        </p>
      </div>}
    </div>
  );
}
