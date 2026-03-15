import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

function ChangePasswordSection() {
  const { updatePassword } = useAuth();
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPw.length < 6) { setError('Wachtwoord moet minimaal 6 tekens zijn.'); return; }
    if (newPw !== confirmPw) { setError('Wachtwoorden komen niet overeen.'); return; }
    setLoading(true);
    const { error } = await updatePassword(newPw);
    setLoading(false);
    if (error) { setError('Er is iets misgegaan. Probeer het opnieuw.'); return; }
    setNewPw('');
    setConfirmPw('');
    toast.success('Je wachtwoord is succesvol gewijzigd.');
  };

  return (
    <form onSubmit={handleChange} className="rounded-xl border bg-card p-5 mb-4 space-y-3">
      <h2 className="font-serif text-xl">Wachtwoord wijzigen</h2>
      {error && <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider" htmlFor="new-pw">Nieuw wachtwoord</label>
        <div className="relative mt-1">
          <input
            id="new-pw"
            type={showPw ? 'text' : 'password'}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            placeholder="Minimaal 6 tekens"
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider" htmlFor="confirm-pw">Bevestig wachtwoord</label>
        <input
          id="confirm-pw"
          type={showPw ? 'text' : 'password'}
          value={confirmPw}
          onChange={e => setConfirmPw(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          placeholder="Herhaal je wachtwoord"
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Laden…' : 'Wachtwoord bijwerken'}
      </button>
    </form>
  );
}

export default function Profile() {
  const { user, signOut, updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Je bent niet ingelogd</p>
          <Link to="/inloggen" className="text-primary hover:underline">Inloggen</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
          <h1 className="font-serif text-lg">Account</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-xl border bg-card p-5 mb-4">
          <h2 className="font-serif text-xl mb-4">Profiel</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">E-mail</span>
              <p className="text-sm mt-0.5">{user.email}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Account sinds</span>
              <p className="text-sm mt-0.5">{new Date(user.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <ChangePasswordSection />

        <button
          onClick={handleSignOut}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Uitloggen
        </button>
      </main>
    </div>
  );
}
