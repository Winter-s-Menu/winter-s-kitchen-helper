import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if already in a valid session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    // Timeout: if no session after 5s, show error
    const timeout = setTimeout(() => {
      setSessionReady(prev => {
        if (!prev) setSessionError(true);
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Wachtwoord moet minimaal 6 tekens zijn.'); return; }
    if (password !== confirm) { setError('Wachtwoorden komen niet overeen.'); return; }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) { setError('Er is iets misgegaan. De link is mogelijk verlopen. Vraag een nieuwe aan.'); return; }
    setSuccess(true);
  };

  if (sessionError && !sessionReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Link to="/inloggen" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Terug
            </Link>
            <h1 className="font-serif text-lg">Wachtwoord resetten</h1>
            <div className="w-16" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center space-y-4">
            <h2 className="font-serif text-2xl">Link verlopen</h2>
            <p className="text-sm text-muted-foreground">
              Deze reset-link is ongeldig of verlopen. Vraag een nieuwe link aan.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              Nieuwe link aanvragen
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/inloggen" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
          <h1 className="font-serif text-lg">Wachtwoord resetten</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        {success ? (
          <div className="w-full max-w-sm text-center space-y-4">
            <h2 className="font-serif text-2xl">Wachtwoord bijgewerkt</h2>
            <p className="text-sm text-muted-foreground">
              Je wachtwoord is succesvol gewijzigd.
            </p>
            <Link
              to="/inloggen"
              className="inline-block w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              Ga naar inloggen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl mb-1">Nieuw wachtwoord</h2>
              <p className="text-sm text-muted-foreground">Voer hieronder je nieuwe wachtwoord in.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="password">Nieuw wachtwoord</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 pr-10 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  placeholder="Minimaal 6 tekens"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="confirm">Bevestig wachtwoord</label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                placeholder="Herhaal je wachtwoord"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Laden…' : 'Wachtwoord bijwerken'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
