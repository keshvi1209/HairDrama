'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Scissors, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email || '';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-gold)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0,
          }}
        >
          <Scissors size={16} color="var(--gold)" style={{ transform: 'rotate(-45deg)' }} />
          <span style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '22px',
            color: 'var(--cream)',
            letterSpacing: '-0.5px',
          }}>
            Hair<span style={{ color: 'var(--gold)' }}>Drama</span>
          </span>
        </button>

        {/* Nav links — desktop */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '32px',
        }} className="hidden-mobile">
          <NavLink href="/dashboard" label="Dashboard" router={router} />
          <NavLink href="/tasks" label="All Tasks" router={router} />
        </nav>

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '1px solid var(--border-gold)',
                overflow: 'hidden',
                background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: 600 }}>{initials}</span>
                )}
              </div>
              <span style={{
                color: 'var(--muted-light)', fontSize: '13px',
                letterSpacing: '0.5px', maxWidth: '140px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {name}
              </span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer',
              padding: '6px 8px', borderRadius: '1px',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '12px', letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, router }: { href: string; label: string; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => router.push(href)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--muted)', fontSize: '12px',
        letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: 'var(--font-cormorant)',
        padding: '4px 0',
        borderBottom: '1px solid transparent',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'var(--gold)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'transparent'; }}
    >
      {label}
    </button>
  );
}
