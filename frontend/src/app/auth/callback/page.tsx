'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    });
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--ink)', flexDirection: 'column', gap: '20px'
    }}>
      <div style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(28px, 6vw, 42px)',
        color: 'var(--cream)',
      }}>
        Hair<span style={{ color: 'var(--gold)' }}>Drama</span>
      </div>
      <div style={{
        color: 'var(--muted)', fontSize: '12px',
        letterSpacing: '3px', textTransform: 'uppercase',
        fontFamily: 'var(--font-cormorant)',
      }}>
        Signing you in…
      </div>
      <div style={{
        width: '48px', height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        animation: 'shimmer 1.5s linear infinite',
        backgroundSize: '200% auto',
      }} />
    </div>
  );
}
