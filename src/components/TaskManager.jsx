import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import CategoryModal from './CategoryModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { 
  Plus, 
  Sparkles, 
  FolderPlus, 
  Rocket, 
  Sun, 
  Dumbbell, 
  BookOpen, 
  CheckCircle2, 
  Calendar,
  Layers,
  Filter
} from 'lucide-react';

const ICON_MAP = {
  Rocket: Rocket,
  Sun: Sun,
  Dumbbell: Dumbbell,
  BookOpen: BookOpen,
  default: Layers,
};

export default function TaskManager() {
  const {
    todayISO,
    categories,
    tasks,
    todayRecord,
    deleteTask,
    deleteCategory,
    categoryMap,
  } = useStudy();

  const [activeTab, setActiveTab] = useState('all'); // 'all' or categoryId
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultCategoryForAdd, setDefaultCategoryForAdd] = useState('skills-study');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null, type: 'task' });

  // Calculate statistics per category for today
  const categoryStats = useMemo(() => {
    const stats = {};
    categories.forEach(cat => {
      const catTasks = tasks.filter(t => t.categoryId === cat.id);
      const completedCatTasks = catTasks.filter(t => todayRecord.completedTaskIds?.includes(t.id));
      const pointsEarned = completedCatTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
      stats[cat.id] = {
        total: catTasks.length,
        completed: completedCatTasks.length,
        points: pointsEarned,
      };
    });
    return stats;
  }, [categories, tasks, todayRecord]);

  const openAddTask = (catId = 'skills-study') => {
    setEditingTask(null);
    setDefaultCategoryForAdd(catId);
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const promptDeleteTask = (task) => {
    setDeleteModalState({ isOpen: true, item: task, type: 'task' });
  };

  const promptDeleteCategory = (cat) => {
    setDeleteModalState({ isOpen: true, item: cat, type: 'category' });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState.item) return;
    if (deleteModalState.type === 'task') {
      deleteTask(deleteModalState.item.id);
    } else {
      deleteCategory(deleteModalState.item.id);
    }
  };

  // Filter categories to display
  const displayedCategories = useMemo(() => {
    if (activeTab === 'all') return categories;
    return categories.filter(c => c.id === activeTab);
  }, [categories, activeTab]);

  return (
    <section id="tasks-section" className="w-full mb-10 scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white light:text-slate-900">
              Categorized Mission & Task Control
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              Active Focus
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Track high-leverage study, skills, and daily disciplines with custom weekly targets.
          </p>
        </div>

        {/* Action Buttons: Add Task + Add Category */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 light:text-slate-700 bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 hover:bg-slate-800 border border-slate-800 light:border-slate-300 transition-all shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => openAddTask('skills-study')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mission</span>
          </button>
        </div>
      </div>

      {/* Category Tab Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-900/80 light:bg-slate-100 text-slate-400 hover:text-white light:hover:text-slate-900 border border-slate-800 light:border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Categories</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
            {tasks.length}
          </span>
        </button>

        {categories.map(cat => {
          const IconC = ICON_MAP[cat.icon] || ICON_MAP.default;
          const stats = categoryStats[cat.id] || { total: 0, completed: 0, points: 0 };
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/80 light:bg-slate-100 text-slate-400 hover:text-white light:hover:text-slate-900 border border-slate-800 light:border-slate-200'
              }`}
            >
              <IconC className="w-3.5 h-3.5 text-indigo-400" />
              <span>{cat.name}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
                {stats.completed}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categorized Sections */}
      <div className="space-y-8">
        {displayedCategories.map(category => {
          const IconComponent = ICON_MAP[category.icon] || ICON_MAP.default;
          const catTasks = tasks.filter(t => t.categoryId === category.id);
          const stats = categoryStats[category.id] || { total: 0, completed: 0, points: 0 };

          return (
            <div
              key={category.id}
              className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white rounded-3xl p-5 sm:p-7 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 shadow-xl"
            >
              {/* Category Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80 light:border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    category.isSkillCategory
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : category.id === 'daily-routine'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                        {category.name}
                      </h3>
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                        category.isSkillCategory
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {category.importance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Progress Indicators & Quick Add */}
                <div className="flex items-center gap-3 sm:self-center">
                  
                  {/* Category Progress Stats */}
                  <div className="text-right hidden xs:block">
                    <div className="text-xs font-mono font-bold text-slate-200 light:text-slate-800">
                      {stats.completed} / {stats.total} Completed
                    </div>
                    <div className="text-[11px] font-mono text-indigo-400 font-semibold">
                      +{stats.points} Points Today
                    </div>
                  </div>

                  {/* Add Task into this specific category */}
                  <button
                    onClick={() => openAddTask(category.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>

                  {/* Custom category delete option (if not default) */}
                  {!['skills-study', 'daily-routine'].includes(category.id) && (
                    <button
                      onClick={() => promptDeleteCategory(category)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Category"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Task List Grid */}
              {catTasks.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-800/80 light:border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-400 mb-2">
                    No active tasks in this category yet.
                  </p>
                  <button
                    onClick={() => openAddTask(category.id)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    + Add your first task
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {catTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditTask}
                      onDelete={promptDeleteTask}
                    />
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        initialTask={editingTask}
        defaultCategoryId={defaultCategoryForAdd}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        initialCategory={editingCategory}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, item: null, type: 'task' })}
        onConfirm={handleConfirmDelete}
        itemName={deleteModalState.item?.name || 'this item'}
        itemType={deleteModalState.type}
      />

    </section>
  );
}
