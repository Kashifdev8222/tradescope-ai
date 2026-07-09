import { BrowserRouter } from 'react-router';
import { AppRouter } from './router';
import { useAdminAuthStore } from './stores/adminAuthStore';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

export function App() {
  const setUser = useAdminAuthStore((s) => s.setUser);
  const setLoading = useAdminAuthStore((s) => s.setLoading);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: 'admin',
            is_active: true,
          });
        }
      })
      .catch(() => { /* Supabase not configured yet */ })
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
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
