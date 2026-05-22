'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { getTasks } from '@/lib/api';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Plus, Search, Filter } from 'lucide-react';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/');
  }, [user, authLoading, router]);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  if (authLoading || (!user && !authLoading)) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>
      <Navbar />
      <main className="responsive-padding" style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div className="responsive-header animate-fade-up" style={{ marginBottom: '32px' }}>
          <div>
            <p style={{
              fontSize: '10px', letterSpacing: '4px', color: 'var(--gold)',
              textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)',
              marginBottom: '6px',
            }}>Task Archive</p>
            <h1 style={{
              fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 400, color: 'var(--cream)',
            }}>
              All Tasks
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 22px',
              background: 'var(--gold)', color: 'var(--ink)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'}
          >
            <Plus size={14} />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="animate-fade-up responsive-filters" style={{
          animationDelay: '60ms', opacity: 0, animationFillMode: 'forwards',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={13} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--cream)',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--gold)'}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')}
            style={{
              padding: '10px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted-light)',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '13px', outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as TaskPriority | 'all')}
            style={{
              padding: '10px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted-light)',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '13px', outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Results count */}
        <div style={{
          marginBottom: '20px', paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
          color: 'var(--muted)', fontSize: '12px', letterSpacing: '2px',
          textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)',
        }}>
          {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '13px' }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            border: '1px dashed var(--border)',
          }}>
            <p style={{ color: 'var(--muted)', letterSpacing: '2px', fontSize: '13px', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)', marginBottom: '16px' }}>
              No tasks found
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: 'none', border: '1px solid var(--border-gold)',
                color: 'var(--gold)', padding: '10px 24px', cursor: 'pointer',
                fontFamily: 'var(--font-cormorant)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
              }}
            >
              Create First Task
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={fetchTasks} />
      )}
    </div>
  );
}
