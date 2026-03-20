import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { CATEGORY_LABELS, type IngredientCategory } from '@/types/recipe';

interface SharedItem {
  id: string;
  ingredient_name: string;
  amount: number;
  unit: string;
  checked: boolean;
  category: string;
}

export default function SharedShoppingList() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const { addToShoppingList } = useApp();
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data: list } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('share_token', token)
        .single();

      if (!list) { setNotFound(true); setLoading(false); return; }

      const { data: listItems } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('list_id', list.id);

      setItems(listItems ?? []);
      setLoading(false);
    })();
  }, [token]);

  const toggleItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const newChecked = !item.checked;
    // Optimistic update
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, checked: newChecked } : i));
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ checked: newChecked })
      .eq('id', itemId);
    if (error) {
      // Revert on failure
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, checked: !newChecked } : i));
      toast.error('Kon item niet bijwerken');
    }
  };

  const handleCopyToMyList = () => {
    const ingredients = items.map(item => ({
      id: item.id,
      name: item.ingredient_name,
      amount: item.amount,
      unit: item.unit,
      category: item.category as IngredientCategory,
    }));
    addToShoppingList(ingredients, 1);
    toast.success('Items gekopieerd naar je boodschappenlijst');
  };

  const grouped = items.reduce<Record<string, SharedItem[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder: IngredientCategory[] = ['groente', 'fruit', 'vlees_vis', 'zuivel', 'kruiden', 'droog', 'overig'];
  const sortedCategories = categoryOrder.filter(c => grouped[c]?.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Laden…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Boodschappenlijst niet gevonden</p>
          <Link to="/" className="text-primary text-sm hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-serif text-lg items-center">Gedeelde lijst</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {user && items.length > 0 && (
          <button
            onClick={handleCopyToMyList}
            className="w-full mb-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Copy className="h-4 w-4" /> Kopieer naar mijn lijst
          </button>
        )}

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Deze lijst is leeg</p>
        ) : (
          <div className="space-y-6">
            {sortedCategories.map(cat => (
              <section key={cat}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <div className="rounded-xl border bg-card divide-y">
                  {grouped[cat].map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-secondary/50 transition-colors"
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        item.checked ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                      }`}>
                        {item.checked && <Check className="h-3 w-3" />}
                      </div>
                      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                        {item.ingredient_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.amount} {item.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
