import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ALLERGEN_OPTIONS } from '@/types/recipe';
import { toast } from 'sonner';

function ProfileSection() {
  const { profile, updateProfile } = useApp();
  const [name, setName] = useState(profile.name);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(profile.allergies);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setSelectedAllergies(profile.allergies);
  }, [profile.name, profile.allergies]);

  const toggleAllergy = (value: string) => {
    setSelectedAllergies(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  };

  const hasChanges = name !== profile.name || JSON.stringify(selectedAllergies.sort()) !== JSON.stringify([...profile.allergies].sort());

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name: name.trim(), allergies: selectedAllergies });
    setSaving(false);
  };

  return (
    <div className="rounded-xl border bg-card p-5 mb-4 space-y-4">
      <h2 className="font-serif text-xl">Profiel</h2>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider" htmlFor="profile-name">Naam</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          placeholder="Je naam"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Allergieën</label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">Recepten met deze allergenen worden automatisch gefilterd op de homepagina.</p>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => toggleAllergy(o.value)}
              className={`inline-flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 border transition-colors ${
                selectedAllergies.includes(o.value)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              {selectedAllergies.includes(o.value) && <Check className="h-3.5 w-3.5" />}
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Opslaan…' : 'Profiel opslaan'}
        </button>
      )}
    </div>
  );
}

function AccountInfo() {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border bg-card p-5 mb-4">
      <h2 className="font-serif text-xl mb-4">Account</h2>
      <div className="space-y-3">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">E-mail</span>
          <p className="text-sm mt-0.5">{user!.email}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Account sinds</span>
          <p className="text-sm mt-0.5">{new Date(user!.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

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
  const { user, signOut } = useAuth();
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
        <ProfileSection />
        <AccountInfo />
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
