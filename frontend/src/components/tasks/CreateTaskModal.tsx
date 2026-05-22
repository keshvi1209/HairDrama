'use client';

import { useState, useEffect } from 'react';
import { X, Scissors } from 'lucide-react';
import { createTask, getUsers } from '@/lib/api';
import { Profile, TaskPriority } from '@/types';
import toast from 'react-hot-toast';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assignee_id: '',
    due_date: '',
  });

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await createTask({
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        assignee_id: form.assignee_id || undefined,
        due_date: form.due_date || undefined,
      });
      toast.success('Task created');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-scale-in responsive-modal"
      >
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scissors size={14} color="var(--gold)" style={{ transform: 'rotate(-45deg)' }} />
              <span style={{
                fontSize: '10px', letterSpacing: '4px',
                textTransform: 'uppercase', color: 'var(--gold)',
                fontFamily: 'var(--font-cormorant)',
              }}>
                New Task
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', padding: '4px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'}
            >
              <X size={18} />
            </button>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '26px', fontWeight: 400,
            color: 'var(--cream)', marginTop: '8px',
          }}>
            Create Task
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Task Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Finalize spring campaign shoot"
              style={inputStyle}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--gold)'}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Add details, context, or instructions…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              onFocus={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--gold)'}
              onBlur={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Priority + Assignee row */}
          <div className="responsive-grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                style={selectStyle}
                onFocus={e => (e.currentTarget as HTMLSelectElement).style.borderColor = 'var(--gold)'}
                onBlur={e => (e.currentTarget as HTMLSelectElement).style.borderColor = 'var(--border)'}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Assign To</label>
              <select
                value={form.assignee_id}
                onChange={e => setForm({ ...form, assignee_id: e.target.value })}
                style={selectStyle}
                onFocus={e => (e.currentTarget as HTMLSelectElement).style.borderColor = 'var(--gold)'}
                onBlur={e => (e.currentTarget as HTMLSelectElement).style.borderColor = 'var(--border)'}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--gold)'}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.title.trim()}
            style={{
              width: '100%', padding: '15px',
              background: loading ? 'var(--border)' : 'var(--gold)',
              color: 'var(--ink)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '12px', letterSpacing: '3px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              opacity: !form.title.trim() ? 0.5 : 1,
            }}
          >
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px', letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--muted)', marginBottom: '8px',
  fontFamily: 'var(--font-cormorant)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--ink-mid)',
  border: '1px solid var(--border)',
  color: 'var(--cream)',
  fontFamily: 'var(--font-cormorant)',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
  borderRadius: 0,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};
