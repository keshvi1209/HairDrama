'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink)' }}>
        <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-playfair)', fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase' }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <main className="grain-overlay" style={{ minHeight: '100vh', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '10%', right: '-5%',
        width: '40vw', height: '40vw', maxWidth: '500px',
        borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.06)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '-8%',
        width: '35vw', height: '35vw', maxWidth: '400px',
        borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.05)',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px 40px', // Extra bottom padding for the footer
        textAlign: 'center',
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
      }}>

        {/* Logo mark */}
        <div className="animate-fade-up" style={{ marginBottom: '24px', animationDelay: '0ms' }}>
          <div style={{
            width: '48px', height: '1px',
            background: 'var(--gold)',
            margin: '0 auto 16px',
          }} />
          <div style={{
            fontSize: '11px', letterSpacing: '6px',
            color: 'var(--gold)', textTransform: 'uppercase',
            fontFamily: 'var(--font-cormorant)',
          }}>
            Est. 2024
          </div>
        </div>

        {/* Brand name */}
        <h1 className="animate-fade-up" style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(44px, 11vw, 88px)',
          fontWeight: 400,
          letterSpacing: '-1px',
          lineHeight: 1.0,
          marginBottom: '8px',
          animationDelay: '80ms',
          opacity: 0,
          animationFillMode: 'forwards',
        }}>
          <span style={{ color: 'var(--cream)' }}>Hair</span>
          <span className="text-gold-shimmer">Drama</span>
        </h1>

        <div className="animate-fade-up" style={{
          animationDelay: '160ms', opacity: 0, animationFillMode: 'forwards',
          marginBottom: '40px',
        }}>
          <div className="gold-divider" style={{ width: '100px', margin: '16px auto' }} />
          <p style={{
            color: 'var(--muted)',
            fontSize: 'clamp(14px, 3vw, 16px)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 300,
          }}>
            Fashion Task Management
          </p>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-up" style={{
          animationDelay: '240ms', opacity: 0, animationFillMode: 'forwards',
          display: 'flex', gap: '8px 12px', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '48px',
        }}>
          {['Create Tasks', 'Assign Teams', 'Track Progress', 'Email Notifications'].map((f) => (
            <span key={f} style={{
              padding: '6px 14px',
              border: '1px solid rgba(201,168,76,0.2)',
              color: 'var(--muted-light)',
              fontSize: 'clamp(10px, 2.5vw, 11px)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-cormorant)',
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* Sign in button */}
        <div className="animate-fade-up" style={{
          animationDelay: '320ms', opacity: 0, animationFillMode: 'forwards',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <button
            onClick={signInWithGoogle}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
              padding: '16px 36px',
              width: '100%',
              maxWidth: '400px',
              background: 'transparent',
              border: '1px solid var(--gold)',
              color: 'var(--cream)',
              cursor: 'pointer',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '13px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)';
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p style={{
            marginTop: '20px',
            color: 'var(--muted)',
            fontSize: '11px',
            letterSpacing: '1px',
            maxWidth: '280px',
            lineHeight: 1.4,
          }}>
            Only @hairdrama team members may access this platform
          </p>
        </div>

        {/* Bottom decoration
        <div style={{
          position: 'absolute', bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--border)',
          fontSize: '10px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          opacity: 0.8,
        }}>
          © 2024 HairDrama
        </div> */}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
