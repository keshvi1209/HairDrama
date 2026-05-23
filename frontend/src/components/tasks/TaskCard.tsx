'use client';

import { Task, TaskStatus, TaskPriority } from '@/types';
import { useRouter } from 'next/navigation';
import { Calendar, User, ChevronRight } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo:        { label: 'To Do',       color: 'var(--muted-light)', bg: 'rgba(136,136,136,0.1)' },
  in_progress: { label: 'In Progress', color: 'var(--amber)',       bg: 'rgba(232,146,58,0.1)' },
  done:        { label: 'Completed',   color: 'var(--green)',       bg: 'rgba(93,184,122,0.1)' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'var(--muted)' },
  medium: { label: 'Medium', color: 'var(--gold)' },
  high:   { label: '#e07a5a', color: '#e07a5a' },
  urgent: { label: 'Urgent', color: 'var(--red)' },
};

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
  disableEdit?: boolean;
  actionText?: 'Edit' | 'Update Status';
}

export default function TaskCard({ task, currentUserId, disableEdit, actionText = 'Update Status' }: TaskCardProps) {
  const router = useRouter();
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const isOverdue = task.due_date && task.status !== 'done' && isPast(parseISO(task.due_date));
  const isAssignedToMe = task.assignee_id === currentUserId;
  const isMyTask = task.creator_id === currentUserId;

  return (
    <div
      onClick={disableEdit ? undefined : () => router.push(`/tasks/${task.id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '20px 22px',
        cursor: disableEdit ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (disableEdit) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'var(--border-gold)';
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        if (disableEdit) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'var(--border)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Priority indicator bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '3px', height: '100%',
        background: priority.color,
        opacity: task.priority === 'low' ? 0.3 : 0.8,
      }} />

      <div style={{ paddingLeft: '8px' }}>
        {/* Top row: status + priority badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="status-badge" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
          {task.priority !== 'medium' && (
            <span style={{
              fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
              color: priority.color, opacity: 0.8,
              fontFamily: 'var(--font-cormorant)',
            }}>
              {task.priority}
            </span>
          )}
          {isAssignedToMe && !isMyTask && (
            <span style={{
              fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
              color: 'var(--gold)', opacity: 0.7,
              fontFamily: 'var(--font-cormorant)',
            }}>
              Assigned to you
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '17px',
          fontWeight: 400,
          color: task.status === 'done' ? 'var(--muted)' : 'var(--cream)',
          marginBottom: task.description ? '8px' : '12px',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          lineHeight: 1.3,
        }}>
          {task.title}
        </h3>

        {/* Description preview */}
        {task.description && (
          <p style={{
            color: 'var(--muted)',
            fontSize: '14px',
            lineHeight: 1.5,
            marginBottom: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Assignee */}
            {task.assignee && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'var(--ink-mid)',
                  border: '1px solid var(--border-gold)',
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {task.assignee.avatar_url ? (
                    <img src={task.assignee.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '8px', color: 'var(--gold)' }}>
                      {task.assignee.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  {task.assignee.full_name?.split(' ')[0] || task.assignee.email}
                </span>
              </div>
            )}

            {/* Due date */}
            {task.due_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={11} color={isOverdue ? 'var(--red)' : 'var(--muted)'} />
                <span style={{ fontSize: '12px', color: isOverdue ? 'var(--red)' : 'var(--muted)' }}>
                  {format(parseISO(task.due_date), 'MMM d')}
                </span>
              </div>
            )}
          </div>

          {!disableEdit && (
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-cormorant)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              border: '1px solid var(--border-gold)',
              padding: '4px 10px',
              borderRadius: '1px',
              background: 'rgba(201, 168, 76, 0.05)',
              transition: 'all 0.2s',
            }}>
              {actionText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
