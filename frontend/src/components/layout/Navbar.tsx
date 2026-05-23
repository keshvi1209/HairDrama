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
      background: 'var(--ink)',
    }}>
      <div className="responsive-navbar-padding" style={{
        maxWidth: '1280px', margin: '0 auto',
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
        }} className="desktop-nav">
          <NavLink href="/dashboard" label="Dashboard" router={router} />
          <NavLink href="/tasks" label="All Tasks" router={router} />
        </nav>

        {/* User area — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-nav">
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

        {/* Hamburger Toggle — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--gold)', cursor: 'pointer',
            padding: '6px 8px', borderRadius: '1px',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Slide-out Mobile Menu Drawer */}
      {menuOpen && (
        <div className="mobile-nav-dropdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <NavLink
              href="/dashboard"
              label="Dashboard"
              router={router}
              onClick={() => setMenuOpen(false)}
            />
            <NavLink
              href="/tasks"
              label="All Tasks"
              router={router}
              onClick={() => setMenuOpen(false)}
            />
          </div>

          <div style={{ height: '1px', background: 'var(--border-gold)', margin: '12px 0' }} />

          {/* User profile inside drawer */}
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid var(--border-gold)',
                  overflow: 'hidden',
                  background: 'var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 600 }}>{initials}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{
                    color: 'var(--cream)', fontSize: '14px',
                    fontFamily: 'var(--font-cormorant)', fontWeight: 500,
                    textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                  }}>
                    {name}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.5px' }}>
                    Team Member
                  </span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--red)', cursor: 'pointer',
                  padding: '12px', borderRadius: '1px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '12px', letterSpacing: '2px',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(224,90,90,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, router, onClick }: { href: string; label: string; router: ReturnType<typeof useRouter>; onClick?: () => void }) {
  return (
    <button
      onClick={() => {
        router.push(href);
        if (onClick) onClick();
      }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--muted)', fontSize: '12px',
        letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: 'var(--font-cormorant)',
        padding: '4px 0',
        borderBottom: '1px solid transparent',
        transition: 'all 0.2s',
        textAlign: 'left',
        width: 'max-content',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'var(--gold)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'transparent'; }}
    >
      {label}
    </button>
  );
}
