'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { getTasks } from '@/lib/api';
import { Task, TaskStatus } from '@/types';
import { Plus, Scissors, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'todo',        label: 'To Do',       icon: <Clock size={13} /> },
  { status: 'in_progress', label: 'In Progress',  icon: <TrendingUp size={13} /> },
  { status: 'done',        label: 'Completed',    icon: <CheckCircle2 size={13} /> },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

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

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
  };

  if (authLoading || (!user && !authLoading)) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', marginBottom: '40px',
          flexWrap: 'wrap', gap: '20px',
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '8px',
            }}>
              <Scissors size={12} color="var(--gold)" style={{ transform: 'rotate(-45deg)' }} />
              <span style={{
                fontSize: '10px', letterSpacing: '4px',
                color: 'var(--gold)', textTransform: 'uppercase',
                fontFamily: 'var(--font-cormorant)',
              }}>
                Dashboard
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 400, color: 'var(--cream)',
            }}>
              Welcome back,{' '}
              <span style={{ color: 'var(--gold)' }}>
                {user?.user_metadata?.full_name?.split(' ')[0] || 'Darling'}
              </span>
            </h1>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '13px 24px',
              background: 'var(--gold)',
              color: 'var(--ink)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '12px', letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'}
          >
            <Plus size={15} />
            New Task
          </button>
        </div>

        {/* Stats */}
        <div className="animate-fade-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '40px',
          animationDelay: '80ms', opacity: 0, animationFillMode: 'forwards',
        }}>
          <StatCard label="Total Tasks" value={stats.total} color="var(--cream)" />
          <StatCard label="Completed" value={stats.done} color="var(--green)" />
          <StatCard label="In Progress" value={stats.inProgress} color="var(--amber)" />
          <StatCard label="Urgent" value={stats.urgent} color="var(--red)" />
        </div>

        <div className="gold-divider" style={{ marginBottom: '40px' }} />

        {/* Kanban columns */}
        {loading ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'var(--muted)', fontSize: '14px',
            letterSpacing: '3px', textTransform: 'uppercase',
            fontFamily: 'var(--font-cormorant)',
          }}>
            Loading tasks…
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {COLUMNS.map(col => {
              const colTasks = tasksByStatus(col.status);
              return (
                <div key={col.status} className="animate-fade-up" style={{ animationDelay: `${COLUMNS.indexOf(col) * 60}ms`, opacity: 0, animationFillMode: 'forwards' }}>
                  {/* Column header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px', paddingBottom: '12px',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--muted)' }}>{col.icon}</span>
                      <span style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '12px', letterSpacing: '2.5px',
                        textTransform: 'uppercase', color: 'var(--muted-light)',
                      }}>
                        {col.label}
                      </span>
                    </div>
                    <span style={{
                      background: 'var(--ink-mid)',
                      color: 'var(--muted)',
                      fontSize: '11px', padding: '2px 8px',
                      letterSpacing: '1px',
                    }}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {colTasks.length === 0 ? (
                      <div style={{
                        padding: '32px 16px',
                        border: '1px dashed var(--border)',
                        textAlign: 'center',
                        color: 'var(--muted)',
                        fontSize: '13px',
                        letterSpacing: '1px',
                        fontFamily: 'var(--font-cormorant)',
                      }}>
                        No tasks here
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard key={task.id} task={task} currentUserId={user?.id} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px 22px',
    }}>
      <div style={{
        fontSize: '32px',
        fontFamily: 'var(--font-playfair)',
        fontWeight: 400,
        color,
        lineHeight: 1,
        marginBottom: '6px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px', letterSpacing: '2px',
        textTransform: 'uppercase', color: 'var(--muted)',
        fontFamily: 'var(--font-cormorant)',
      }}>
        {label}
      </div>
    </div>
  );
}
