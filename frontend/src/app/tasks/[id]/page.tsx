'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { getTask, updateTask, deleteTask, getUsers } from '@/lib/api';
import { Task, TaskStatus, TaskPriority, Profile } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Trash2, Save, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Completed' },
];
const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function TaskDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo' as TaskStatus, priority: 'medium' as TaskPriority, assignee_id: '', due_date: '' });

  useEffect(() => {
    if (!authLoading && !user) router.replace('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getTask(taskId), getUsers()])
      .then(([t, u]) => {
        setTask(t);
        setUsers(u);
        setForm({
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          assignee_id: t.assignee_id || '',
          due_date: t.due_date || '',
        });
      })
      .catch(() => router.replace('/tasks'))
      .finally(() => setLoading(false));
  }, [user, taskId, router]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title: form.title,
        description: form.description || undefined,
        status: form.status,
        priority: form.priority,
        assignee_id: form.assignee_id || undefined,
        due_date: form.due_date || undefined,
      });
      setTask(updated);
      toast.success('Task updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Delete this task?')) return;
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      router.push('/tasks');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--muted)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '12px', fontFamily: 'var(--font-cormorant)' }}>Loading…</span>
      </div>
    );
  }

  if (!task) return null;

  const isCreator = task.creator_id === user?.id;
  const isAssignee = task.assignee_id === user?.id;
  const isCompleted = task.status === 'done';

  // Details can only be edited by creator if task is in 'todo' status
  const canEditAll = isCreator && task.status === 'todo';

  // Status can be updated by:
  // - Creator if in 'todo'
  // - Assignee if in 'todo' or 'in_progress'
  const canEditStatus = (isCreator && task.status === 'todo') || (isAssignee && (task.status === 'todo' || task.status === 'in_progress'));

  const canEdit = canEditAll || canEditStatus;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>
      <Navbar />
      <main className="responsive-padding" style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Task meta */}
        <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => router.back()}
              title="Back"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, display: 'inline-flex', alignItems: 'center',
                color: 'var(--gold)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-light)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={14} />
            </button>
            <span style={{ fontSize: '12px', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)' }}>
              Task Detail
            </span>
            {isCompleted && (
              <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)', marginLeft: '8px' }}>
                (Completed — Read only)
              </span>
            )}
            {!isCompleted && task.status === 'in_progress' && isCreator && (
              <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)', marginLeft: '8px' }}>
                (In Progress — Read only)
              </span>
            )}
            {!isCompleted && !isCreator && isAssignee && (
              <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)', marginLeft: '8px' }}>
                (Status update only)
              </span>
            )}
            {!isCompleted && !isCreator && !isAssignee && (
              <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--font-cormorant)', marginLeft: '8px' }}>
                (View only)
              </span>
            )}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', letterSpacing: '1px' }}>
            Created {format(parseISO(task.created_at), 'MMMM d, yyyy')}
            {task.creator && ` by ${task.creator.full_name || task.creator.email}`}
          </p>
        </div>

        <div className="gold-divider" style={{ marginBottom: '32px' }} />

        {/* Form fields */}
        <div className="animate-fade-up" style={{ animationDelay: '80ms', opacity: 0, animationFillMode: 'forwards' }}>
          
          {/* Title */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Title</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              disabled={!canEditAll}
              style={{ ...inputStyle, fontSize: '18px', opacity: canEditAll ? 1 : 0.6 }}
              onFocus={e => canEditAll && ((e.currentTarget as HTMLInputElement).style.borderColor = 'var(--gold)')}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              disabled={!canEditAll}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', opacity: canEditAll ? 1 : 0.6 }}
              onFocus={e => canEditAll && ((e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--gold)')}
              onBlur={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Status + Priority */}
          <div className="responsive-grid-2" style={{ marginBottom: '22px' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}
                disabled={!canEdit}
                style={{ ...selectStyle, opacity: canEdit ? 1 : 0.6 }}
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                disabled={!canEditAll}
                style={{ ...selectStyle, opacity: canEditAll ? 1 : 0.6 }}
              >
                {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="responsive-grid-2" style={{ marginBottom: '32px' }}>
            <div>
              <label style={labelStyle}>Assigned To</label>
              <select
                value={form.assignee_id}
                onChange={e => setForm({ ...form, assignee_id: e.target.value })}
                disabled={!canEditAll}
                style={{ ...selectStyle, opacity: canEditAll ? 1 : 0.6 }}
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                disabled={!canEditAll}
                style={{ ...inputStyle, colorScheme: 'dark', opacity: canEditAll ? 1 : 0.6 }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '14px',
                  background: 'var(--gold)', color: 'var(--ink)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.2s',
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={e => !saving && ((e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)')}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'}
              >
                <Save size={13} />
                {saving ? 'Saving…' : (canEditAll ? 'Save Changes' : 'Make Update')}
              </button>
            )}
            {isCreator && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '14px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(224,90,90,0.3)',
                  color: 'var(--red)', cursor: 'pointer',
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(224,90,90,0.1)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(224,90,90,0.3)'; }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px',
  letterSpacing: '2px', textTransform: 'uppercase',
  color: 'var(--muted)', marginBottom: '8px',
  fontFamily: 'var(--font-cormorant)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--ink-mid)', border: '1px solid var(--border)',
  color: 'var(--cream)', fontFamily: 'var(--font-cormorant)',
  fontSize: '15px', outline: 'none',
  transition: 'border-color 0.2s', borderRadius: 0,
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
