import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trash2, Check, Minus, Plus, Share2, Copy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORY_LABELS, type IngredientCategory } from '@/types/recipe';
import { toast } from 'sonner';

function AmountControl({ amount, unit, onChange }: { amount: number; unit: string; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string>(String(amount));
  const [focused, setFocused] = useState(false);

  const displayed = focused ? draft : String(amount);
  const step = amount < 1 ? 0.1 : amount < 10 ? 0.5 : 1;

  const commit = (val: number) => {
    const clamped = Math.max(0, Math.round(val * 100) / 100);
    onChange(clamped);
    setDraft(String(clamped));
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => commit(Math.max(0, amount - step))}
        className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
        aria-label="Minder"
      >
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={displayed}
        onFocus={() => { setDraft(String(amount)); setFocused(true); }}
        onBlur={() => {
          setFocused(false);
          const parsed = parseFloat(draft);
          commit(isNaN(parsed) || parsed < 0 ? amount : parsed);
        }}
        onChange={e => setDraft(e.target.value)}
        className="w-14 text-center text-sm bg-transparent outline-none text-foreground rounded-md border border-border px-1 py-0.5 focus:border-primary/40 focus:bg-secondary transition-colors"
      />
      <button
        onClick={() => commit(amount + step)}
        className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
        aria-label="Meer"
      >
        <Plus className="h-3 w-3" />
      </button>
      <span className="text-xs text-muted-foreground w-12 ml-1">{unit}</span>
    </div>
  );
}

export default function ShoppingList() {
  const { shoppingList, toggleShoppingItem, updateShoppingItemAmount, removeShoppingItem, clearShoppingList, shareToken } = useApp();
  const { user } = useAuth();

  const grouped = shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder: IngredientCategory[] = ['groente', 'fruit', 'vlees_vis', 'zuivel', 'kruiden', 'droog', 'overig'];
  const sortedCategories = categoryOrder.filter(c => grouped[c]?.length);
  const checkedCount = shoppingList.filter(i => i.checked).length;

  const handleShare = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/gedeeld/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Deellink gekopieerd!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Terug
            </Link>
            <h1 className="font-serif text-lg">Boodschappenlijst</h1>
            <div className="w-16" />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Log in om je boodschappenlijst te beheren</p>
            <Link to="/inloggen" className="text-primary text-sm hover:underline">Inloggen</Link>
          </div>
        </main>
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
          <h1 className="font-serif text-lg">Boodschappenlijst</h1>
          <div className="w-16 flex justify-end">
            {shareToken && shoppingList.length > 0 && (
              <button onClick={handleShare} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Delen">
                <Share2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {shoppingList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-2">Je boodschappenlijst is leeg</p>
            <Link to="/" className="text-primary text-sm hover:underline">
              Bekijk recepten
            </Link>
          </div>
        ) : (
          <>
            {checkedCount > 0 && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {checkedCount} van {shoppingList.length} afgevinkt
                </span>
                <button
                  onClick={clearShoppingList}
                  className="text-sm text-destructive hover:underline"
                >
                  Lijst wissen
                </button>
              </div>
            )}

            <div className="space-y-6">
              {sortedCategories.map(cat => (
                <section key={cat}>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <div className="rounded-xl border bg-card divide-y">
                    {grouped[cat].map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {item.checked && <Check className="h-3 w-3" />}
                        </button>
                        <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {item.ingredientName}
                        </span>
                        <AmountControl
                          amount={item.amount}
                          unit={item.unit}
                          onChange={(val) => updateShoppingItemAmount(item.id, val)}
                        />
                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Verwijder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
