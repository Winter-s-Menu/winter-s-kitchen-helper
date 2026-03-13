import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Vul alle velden in.'); return; }
    if (password.length < 6) { setError('Wachtwoord moet minimaal 6 tekens zijn.'); return; }
    if (password !== confirm) { setError('Wachtwoorden komen niet overeen.'); return; }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="font-serif text-2xl mb-2">Controleer je e-mail</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We hebben een bevestigingslink naar <strong>{email}</strong> gestuurd. Klik op de link om je account te activeren.
          </p>
          <Link to="/inloggen" className="text-primary text-sm hover:underline">
            Ga naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
          <h1 className="font-serif text-lg">Registreren</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl mb-1">Account aanmaken</h2>
            <p className="text-sm text-muted-foreground">Sla je favorieten en boodschappenlijst op</p>
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
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="naam@voorbeeld.nl"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="Minimaal 6 tekens"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="confirm">Bevestig wachtwoord</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Laden…' : 'Registreren'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Al een account?{' '}
            <Link to="/inloggen" className="text-primary hover:underline">Inloggen</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
