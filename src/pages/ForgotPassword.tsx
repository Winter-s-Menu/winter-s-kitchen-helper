import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Vul je e-mailadres in.'); return; }
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) { setError('Er is iets misgegaan. Probeer het opnieuw.'); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/inloggen" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
          <h1 className="font-serif text-lg">Wachtwoord vergeten</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        {sent ? (
          <div className="w-full max-w-sm text-center space-y-4">
            <h2 className="font-serif text-2xl">Link verstuurd</h2>
            <p className="text-sm text-muted-foreground">
              Als er een account bestaat voor dit e-mailadres, is er een link gestuurd om je wachtwoord te resetten.
            </p>
            <Link
              to="/inloggen"
              className="inline-block w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              Terug naar inloggen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl mb-1">Wachtwoord vergeten</h2>
              <p className="text-sm text-muted-foreground">
                Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="email">E-mailadres</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                placeholder="naam@voorbeeld.nl"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Laden…' : 'Verstuur reset-link'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
