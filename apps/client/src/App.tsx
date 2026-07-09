import { BrowserRouter } from 'react-router';
import { AppRouter } from './router';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

export function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: 'user',
            is_active: true,
          });
        }
      })
      .catch(() => { /* Supabase not configured yet */ })
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'user',
          is_active: true,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
