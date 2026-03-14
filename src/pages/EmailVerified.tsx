import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function EmailVerified() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold text-foreground">E-mail geverifieerd</h1>
          <p className="text-sm text-muted-foreground">
            Je e-mailadres is succesvol geverifieerd. Je kunt nu Winter's Menu gebruiken.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ga naar Home
        </button>
      </div>
    </div>
  );
}
